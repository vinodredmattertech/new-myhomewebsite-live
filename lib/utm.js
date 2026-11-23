/**
 * Campaign attribution for lead forms.
 *
 * UTM params only exist on the landing URL. A visitor typically fills a form
 * several clicks later, by which point the query string is long gone — so the
 * first set seen in a session is stashed and reused for every submission in
 * that session (first-touch attribution).
 *
 * Captured fields (with URL aliases):
 *   source         <- utm_source
 *   medium         <- utm_medium
 *   campaign_name  <- utm_campaign
 *   campaign_id    <- utm_id | utm_campaign_id | campaign_id | campaignid
 *   utm_term / utm_content / gclid (optional extras)
 */

const STORAGE_KEY = "myhome:utm";

/** Canonical keys written into sessionStorage / lead payloads. */
export const UTM_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_campaign_id",
  "utm_term",
  "utm_content",
  "gclid",
];

/**
 * Map query-string aliases onto canonical keys.
 * First matching alias wins for each field.
 */
const FIELD_ALIASES = {
  utm_source: ["utm_source", "source"],
  utm_medium: ["utm_medium", "medium"],
  utm_campaign: ["utm_campaign", "campaign_name", "campaign"],
  utm_campaign_id: [
    "utm_campaign_id",
    "utm_id",
    "campaign_id",
    "campaignid",
    "campaignId",
  ],
  utm_term: ["utm_term"],
  utm_content: ["utm_content"],
  gclid: ["gclid"],
};

/** Read the stash. Returns `{}` when empty or when storage is unavailable. */
export function getUtm() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    // Private mode / storage disabled — attribution is best-effort.
    return {};
  }
}

/**
 * Stash any UTM params on the current URL.
 *
 * First-touch wins: once a session has campaign data, a later param-less
 * navigation (or a different campaign mid-session) does not overwrite it.
 */
export function captureUtm() {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const found = {};
  for (const [canonical, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) {
      const value = params.get(alias);
      if (value && value.trim()) {
        found[canonical] = value.trim();
        break;
      }
    }
  }

  const existing = getUtm();
  if (!Object.keys(found).length) return existing;
  if (Object.keys(existing).length) return existing;

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  } catch {
    /* non-fatal */
  }
  return found;
}

/** Human-readable labels used in Strapi message / admin display. */
export function utmDisplayFields(utm = {}) {
  return {
    source: utm.utm_source || "",
    medium: utm.utm_medium || "",
    campaign_name: utm.utm_campaign || "",
    campaign_id: utm.utm_campaign_id || "",
    utm_term: utm.utm_term || "",
    utm_content: utm.utm_content || "",
    gclid: utm.gclid || "",
  };
}

/**
 * Compact block stored on the Strapi lead `message` field.
 * Example:
 *   UTM: source=google | medium=cpc | campaign_name=apas_apr | campaign_id=12345
 */
export function formatUtmBlock(utm = {}) {
  const d = utmDisplayFields(utm);
  const parts = [
    ["source", d.source],
    ["medium", d.medium],
    ["campaign_name", d.campaign_name],
    ["campaign_id", d.campaign_id],
    ["utm_term", d.utm_term],
    ["utm_content", d.utm_content],
    ["gclid", d.gclid],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`);
  return parts.length ? `UTM: ${parts.join(" | ")}` : "";
}

/**
 * Map UTM params onto Sell.Do's two attribution fields.
 *
 *   source     <- utm_source
 *   sub_source <- medium - campaign_name - campaign_id
 *
 * Missing pieces are skipped so you never get "cpc -  - 123".
 */
export function buildLeadSource(utm = {}, fallbackSubSource = "") {
  const source = utm.utm_source || "Website";
  const sub_source =
    [utm.utm_medium, utm.utm_campaign, utm.utm_campaign_id]
      .filter(Boolean)
      .join(" - ") ||
    fallbackSubSource ||
    "";
  return { source, sub_source };
}
