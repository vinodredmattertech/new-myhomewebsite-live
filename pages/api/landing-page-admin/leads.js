import { readSession } from "@/lib/landingPageAdminAuth";
import {
  LANDING_PAGES,
  getLandingPage,
  isLandingPageLead,
  matchLandingPage,
} from "@/lib/landingPages";
import {
  filterOutDeletedLeads,
  markLeadsDeleted,
} from "@/lib/lpAdminDeletedLeads";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3132";

function authHeaders() {
  const token = process.env.STRAPI_PREVIEW_TOKEN;
  if (!token) throw new Error("STRAPI_PREVIEW_TOKEN is not configured");
  return { Authorization: `Bearer ${token}` };
}

function parseUtmFromMessage(message = "") {
  const text = String(message || "");
  const read = (...keys) => {
    for (const key of keys) {
      const match = text.match(new RegExp(`${key}=([^|\\n]+)`));
      if (match) return match[1].trim();
    }
    return "";
  };
  return {
    utm_source: read("source", "utm_source"),
    utm_medium: read("medium", "utm_medium"),
    utm_campaign: read("campaign_name", "utm_campaign"),
    utm_campaign_id: read("campaign_id", "utm_campaign_id", "utm_id"),
    utm_term: read("utm_term"),
    utm_content: read("utm_content"),
    gclid: read("gclid"),
  };
}

function normaliseLead(entry) {
  const attrs = entry?.attributes || entry || {};
  const id = entry?.id ?? attrs.id ?? null;
  const message = attrs.message || "";
  const utm = parseUtmFromMessage(message);
  const base = {
    id,
    name: attrs.name || "",
    email: attrs.email || "",
    phone: attrs.phone || "",
    project: attrs.project || "",
    formSource: attrs.formSource || "",
    status: attrs.status || "",
    pageUrl: attrs.pageUrl || "",
    referrer: attrs.referrer || "",
    message,
    submittedAt: attrs.submittedAt || attrs.createdAt || "",
    createdAt: attrs.createdAt || "",
    ...utm,
  };
  const lp = matchLandingPage(base);
  return {
    ...base,
    landingPageId: lp?.id || "",
    landingPageLabel: lp?.label || "",
  };
}

async function fetchLandingPageLeads() {
  authHeaders();
  if (!LANDING_PAGES.length) return [];

  const pageSize = 100;
  let page = 1;
  let pageCount = 1;
  const leads = [];

  while (page <= pageCount) {
    const query = new URLSearchParams({
      "pagination[page]": String(page),
      "pagination[pageSize]": String(pageSize),
      "sort[0]": "submittedAt:desc",
    });

    LANDING_PAGES.forEach((lp, index) => {
      query.set(
        `filters[$or][${index}][formSource][$startsWith]`,
        lp.formSourcePrefix
      );
    });

    const res = await fetch(`${STRAPI_URL}/api/leads?${query}`, {
      headers: authHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Strapi leads fetch failed: ${res.status} ${text}`);
    }

    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    rows.forEach((row) => {
      const lead = normaliseLead(row);
      if (isLandingPageLead(lead)) leads.push(lead);
    });

    pageCount = Number(json?.meta?.pagination?.pageCount || 1);
    page += 1;
    if (page > 50) break;
  }

  return filterOutDeletedLeads(leads);
}

function parseIdsParam(ids) {
  if (Array.isArray(ids)) {
    return new Set(ids.map((id) => String(id).trim()).filter(Boolean));
  }
  const raw = String(ids || "").trim();
  if (!raw) return null;
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  );
}

function applyFilters(leads, { q, project, source, from, to, ids }) {
  const needle = String(q || "").trim().toLowerCase();
  const projectFilter = String(project || "").trim();
  const sourceFilter = String(source || "").trim().toLowerCase();
  const fromTs = from ? Date.parse(from) : NaN;
  const toTs = to ? Date.parse(to) : NaN;
  const selectedLp = projectFilter ? getLandingPage(projectFilter) : null;
  const idSet = parseIdsParam(ids);

  return leads.filter((lead) => {
    if (idSet && idSet.size > 0 && !idSet.has(String(lead.id))) return false;
    if (selectedLp && lead.landingPageId !== selectedLp.id) return false;
    if (
      sourceFilter &&
      !String(lead.formSource || "").toLowerCase().includes(sourceFilter)
    ) {
      return false;
    }
    if (Number.isFinite(fromTs)) {
      const ts = Date.parse(lead.submittedAt || lead.createdAt || "");
      if (!Number.isFinite(ts) || ts < fromTs) return false;
    }
    if (Number.isFinite(toTs)) {
      const ts = Date.parse(lead.submittedAt || lead.createdAt || "");
      const end = String(to).length <= 10 ? toTs + 24 * 60 * 60 * 1000 - 1 : toTs;
      if (!Number.isFinite(ts) || ts > end) return false;
    }
    if (!needle) return true;
    const hay = [
      lead.name,
      lead.email,
      lead.phone,
      lead.formSource,
      lead.project,
      lead.landingPageLabel,
      lead.utm_source,
      lead.utm_medium,
      lead.utm_campaign,
      lead.utm_campaign_id,
      lead.utm_term,
      lead.utm_content,
      lead.message,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });
}

function buildProjectCounts(all) {
  return LANDING_PAGES.map((lp) => {
    const count = all.filter((l) => l.landingPageId === lp.id).length;
    return {
      id: lp.id,
      label: lp.label,
      path: lp.path,
      count,
    };
  });
}

function toCsv(leads) {
  const headers = [
    "id",
    "landingPageLabel",
    "name",
    "email",
    "phone",
    "formSource",
    "project",
    "submittedAt",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_campaign_id",
    "utm_term",
    "utm_content",
    "pageUrl",
    "referrer",
    "message",
  ];
  const escape = (value) => {
    const s = String(value ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.join(",")];
  leads.forEach((lead) => {
    lines.push(headers.map((h) => escape(lead[h])).join(","));
  });
  return lines.join("\n");
}

async function deleteLeads(ids) {
  const uniqueIds = [...new Set(ids.map((id) => String(id).trim()).filter(Boolean))];
  if (!uniqueIds.length) {
    return { deleted: [], failed: [{ id: null, error: "No ids provided" }] };
  }

  // Only allow deleting leads that belong to registered landing pages.
  // fetchLandingPageLeads already excludes previously soft-deleted rows.
  const all = await fetchLandingPageLeads();
  const allowed = new Set(
    all.map((l) => String(l.id)).filter((id) => id && id !== "null")
  );

  const deleted = [];
  const softDeleted = [];
  const failed = [];

  for (const id of uniqueIds) {
    if (!allowed.has(id)) {
      failed.push({ id, error: "Not a landing-page lead or unknown id" });
      continue;
    }
    try {
      const res = await fetch(`${STRAPI_URL}/api/leads/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        deleted.push(id);
        continue;
      }
      // Preview/read tokens often cannot DELETE in Strapi (403). Fall back to
      // soft-delete so the admin UI can still remove leads from the desk.
      const text = await res.text().catch(() => "");
      if (res.status === 403 || res.status === 401 || res.status === 405) {
        softDeleted.push(id);
        continue;
      }
      failed.push({ id, error: `Strapi ${res.status}: ${text.slice(0, 160)}` });
    } catch (err) {
      softDeleted.push(id);
      console.warn("[landing-page-admin] Strapi delete failed, soft-deleting:", err.message);
    }
  }

  if (softDeleted.length) {
    await markLeadsDeleted(softDeleted);
    deleted.push(...softDeleted);
  }

  return { deleted, softDeleted, failed };
}

export default async function handler(req, res) {
  if (!readSession(req)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "DELETE") {
    try {
      const ids = Array.isArray(req.body?.ids)
        ? req.body.ids
        : req.body?.id
          ? [req.body.id]
          : [];
      const result = await deleteLeads(ids);
      const ok = result.deleted.length > 0;
      return res.status(ok ? 200 : 400).json({
        message: ok
          ? `Deleted ${result.deleted.length} lead(s)`
          : "No leads deleted",
        ...result,
      });
    } catch (err) {
      console.error("[landing-page-admin] delete error:", err.message);
      return res
        .status(502)
        .json({ message: err.message || "Failed to delete leads" });
    }
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      q = "",
      project = "",
      source = "",
      from = "",
      to = "",
      ids = "",
      format = "json",
    } = req.query || {};

    const all = await fetchLandingPageLeads();
    const leads = applyFilters(all, { q, project, source, from, to, ids });
    const projectCounts = buildProjectCounts(all);

    if (String(format).toLowerCase() === "csv") {
      const csv = toCsv(leads);
      const selectedLp = String(project || "").trim()
        ? getLandingPage(String(project).trim())
        : null;
      const idSet = parseIdsParam(ids);
      const slug = idSet?.size
        ? `selected-${idSet.size}`
        : selectedLp?.id || "all";
      const date = new Date().toISOString().slice(0, 10);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="landing-page-leads-${slug}-${date}.csv"`
      );
      return res.status(200).send(csv);
    }

    const scoped = project
      ? all.filter((l) => l.landingPageId === String(project))
      : all;

    const sources = Array.from(
      new Set(scoped.map((l) => l.formSource).filter(Boolean))
    ).sort();

    return res.status(200).json({
      count: leads.length,
      total: all.length,
      projects: LANDING_PAGES.map(({ id, label, path }) => ({ id, label, path })),
      projectCounts,
      sources,
      leads,
    });
  } catch (err) {
    console.error("[landing-page-admin] leads error:", err.message);
    return res
      .status(502)
      .json({ message: err.message || "Failed to load leads" });
  }
}
