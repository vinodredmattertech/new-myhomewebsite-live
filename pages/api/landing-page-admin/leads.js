import { readSession } from "@/lib/landingPageAdminAuth";
import {
  LANDING_PAGES,
  getLandingPage,
  isLandingPageLead,
  matchLandingPage,
} from "@/lib/landingPages";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3132";

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
  const token = process.env.STRAPI_PREVIEW_TOKEN;
  if (!token) {
    throw new Error("STRAPI_PREVIEW_TOKEN is not configured");
  }
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

    // OR across every registered LP formSource prefix.
    LANDING_PAGES.forEach((lp, index) => {
      query.set(
        `filters[$or][${index}][formSource][$startsWith]`,
        lp.formSourcePrefix
      );
    });

    const res = await fetch(`${STRAPI_URL}/api/leads?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
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

  return leads;
}

function applyFilters(leads, { q, project, source, from, to }) {
  const needle = String(q || "").trim().toLowerCase();
  const projectFilter = String(project || "").trim();
  const sourceFilter = String(source || "").trim().toLowerCase();
  const fromTs = from ? Date.parse(from) : NaN;
  const toTs = to ? Date.parse(to) : NaN;
  const selectedLp = projectFilter ? getLandingPage(projectFilter) : null;

  return leads.filter((lead) => {
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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!readSession(req)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const {
      q = "",
      project = "",
      source = "",
      from = "",
      to = "",
      format = "json",
    } = req.query || {};

    const all = await fetchLandingPageLeads();
    const leads = applyFilters(all, { q, project, source, from, to });

    if (String(format).toLowerCase() === "csv") {
      const csv = toCsv(leads);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="landing-page-leads-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`
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
