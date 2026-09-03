/**
 * Server-side lead push to Sell.Do.
 * POST /api/pushToCRM
 *
 * Every website form posts here (via `lib/crm.js`) in parallel with its
 * Strapi `submitLead()` call, and keys its success UI off this response.
 *
 * Sell.Do identifies leads per project: `project_id` on the lead and `srd` on
 * the campaign. Those are per-project values, so they are stored on each
 * Project in Strapi (`selldoProjectId` / `selldoSrd`) and looked up here by
 * slug — that keeps the API key server-side and means a new project needs no
 * code change, only CMS entry.
 *
 * The ids come from the CMS and nowhere else — there is deliberately no env
 * fallback. A wrong project_id files the lead against the wrong project, which
 * is worse than not pushing it, so a lead whose project has no id configured is
 * skipped here and kept in Strapi only.
 *
 * Env:
 *   SELLDO_API_KEY  (required to actually push)
 *   SELLDO_API_URL  default https://app.sell.do/api/leads/create
 */

import { apiLog } from "@/lib/apiLog";

const SELLDO_URL =
  process.env.SELLDO_API_URL || "https://app.sell.do/api/leads/create";
const STRAPI_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3132";

/**
 * Sell.Do's two attribution fields.
 *
 *   source     <- utm_source
 *   sub_source <- utm_medium + " - " + utm_campaign
 *
 * The separator is only emitted between two present values, so a hit with
 * just utm_medium=cpc reports "cpc", not "cpc - ".
 */
function buildAttribution(utm = {}, fallbackSubSource = "") {
  const source = utm.utm_source || "Website";
  const sub_source =
    [utm.utm_medium, utm.utm_campaign].filter(Boolean).join(" - ") ||
    fallbackSubSource ||
    "";
  return { source, sub_source };
}

/**
 * Fetch a project's Sell.Do identifiers from Strapi.
 *
 * Returns `{}` when the slug is missing or unknown — the caller treats that as
 * "not configured" and skips the push rather than inventing ids.
 */
async function getProjectCrmIds(slug) {
  if (!slug) return {};
  const query =
    `filters[slug][$eq]=${encodeURIComponent(slug)}` +
    `&fields[0]=selldoProjectId&fields[1]=selldoSrd`;
  try {
    const res = await fetch(`${STRAPI_URL}/api/projects?${query}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[selldo] project lookup failed: ${res.status}`);
      return {};
    }
    const json = await res.json();
    const attrs = json?.data?.[0]?.attributes || {};
    return {
      projectId: attrs.selldoProjectId || "",
      srd: attrs.selldoSrd || "",
    };
  } catch (err) {
    console.warn("[selldo] project lookup error:", err.message);
    return {};
  }
}

/** Sell.Do rejects spaced/dashed numbers — keep digits and a leading `+`. */
function normalisePhone(phone = "") {
  const trimmed = String(phone).trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/[^\d]/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    name,
    email,
    phone,
    project_name,
    projectSlug,
    FormSource,
    formSource,
    disclaimer,
    utm = {},
  } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ message: "Missing required fields: name, phone" });
  }

  const apiKey = process.env.SELLDO_API_KEY;
  if (!apiKey) {
    // Not configured yet. The lead is still captured by Strapi on the form's
    // parallel submitLead() call, so answer 200 and let the UI show success
    // rather than failing a submission over a missing key.
    console.warn("[selldo] SELLDO_API_KEY not set — skipping CRM push");
    apiLog({ event: "skipped", reason: "no_api_key", name, phone, projectSlug });
    return res.status(200).json({ message: "CRM not configured — lead captured in Strapi" });
  }

  const { projectId, srd } = await getProjectCrmIds(projectSlug);

  // CMS-only: no project_id means this lead has nowhere correct to land in
  // Sell.Do. Skip the push (Strapi still has the lead via the form's parallel
  // submitLead call) and say so loudly in the logs.
  if (!projectId) {
    console.warn(
      `[selldo] no selldoProjectId for slug "${projectSlug || "(none sent)"}" ` +
        `— skipping CRM push, lead kept in Strapi only`
    );
    apiLog({
      event: "skipped",
      reason: "no_project_id",
      name,
      phone,
      email,
      projectSlug: projectSlug || null,
      formSource: FormSource || formSource || null,
    });
    return res.status(200).json({
      message:
        "No Sell.Do project id configured for this project — lead captured in Strapi only",
      pushed: false,
      projectSlug: projectSlug || null,
    });
  }

  const { source, sub_source } = buildAttribution(
    utm,
    FormSource || formSource || ""
  );

  const body = new URLSearchParams();
  body.append("api_key", apiKey);
  body.append("sell_do[form][lead][name]", name);
  if (email) body.append("sell_do[form][lead][email]", email);
  body.append("sell_do[form][lead][phone]", normalisePhone(phone));
  body.append("sell_do[form][lead][project_id]", projectId);
  if (srd) body.append("sell_do[campaign][srd]", srd);
  body.append("sell_do[form][lead][source]", source);
  if (sub_source) body.append("sell_do[form][lead][sub_source]", sub_source);
  if (disclaimer)
    body.append("sell_do[form][custom][custom_disclaimer]", disclaimer);

  // Exactly what goes on the wire, minus the credential — so the log answers
  // "what did we send?" without a rebuild or a reproduction.
  const sentPayload = Object.fromEntries(
    [...body.entries()].filter(([k]) => k !== "api_key")
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(SELLDO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      },
      body: body.toString(),
      signal: controller.signal,
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!response.ok) {
      console.error(`[selldo] push failed ${response.status}:`, data);
      apiLog({
        event: "failed",
        status: response.status,
        name, phone, email,
        projectSlug, projectId, srd, source, sub_source,
        formSource: FormSource || formSource || null,
        payload: sentPayload,
        response: data,
      });
      return res
        .status(response.status)
        .json({ message: "Failed to push lead to Sell.Do", error: data });
    }

    apiLog({
      event: "pushed",
      status: response.status,
      name, phone, email,
      projectSlug, projectId, srd, source, sub_source,
      formSource: FormSource || formSource || null,
      payload: sentPayload,
      response: data,
    });
    return res.status(201).json({ message: "Lead pushed to Sell.Do", data });
  } catch (error) {
    const reason = error.name === "AbortError" ? "timeout" : error.message;
    console.error("[selldo] push error:", reason, {
      project: project_name,
      slug: projectSlug,
    });
    apiLog({
      event: "error",
      reason,
      name, phone, email,
      projectSlug, projectId, srd, source, sub_source,
      formSource: FormSource || formSource || null,
      payload: sentPayload,
    });
    return res
      .status(502)
      .json({ message: "Failed to push lead to Sell.Do", error: reason });
  } finally {
    clearTimeout(timeout);
  }
}
