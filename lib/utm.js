/**
 * Campaign attribution for lead forms.
 *
 * UTM params only exist on the landing URL. A visitor typically fills a form
 * several clicks later, by which point the query string is long gone — so the
 * first set seen in a session is stashed and reused for every submission in
 * that session (first-touch attribution).
 */

const STORAGE_KEY = "myhome:utm";

const UTM_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
];

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
  for (const field of UTM_FIELDS) {
    const value = params.get(field);
    if (value) found[field] = value.trim();
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

/**
 * Map UTM params onto Sell.Do's two attribution fields.
 *
 *   source     <- utm_source
 *   sub_source <- utm_medium + " - " + utm_campaign
 *
 * The separator only appears between two present values, so a hit carrying
 * just utm_medium=cpc reports "cpc", never "cpc - " or " - cpc".
 *
 *   utm_source=google, utm_medium=cpc, utm_campaign=grava_sept
 *     -> { source: "google", sub_source: "cpc - grava_sept" }
 *   utm_medium=cpc only
 *     -> { source: "Website", sub_source: "cpc" }
 */
export function buildLeadSource(utm = {}, fallbackSubSource = "") {
  const source = utm.utm_source || "Website";
  const sub_source =
    [utm.utm_medium, utm.utm_campaign].filter(Boolean).join(" - ") ||
    fallbackSubSource ||
    "";
  return { source, sub_source };
}
