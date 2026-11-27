import { STRAPI_URL } from "@/lib/strapi";
import { getUtm } from "@/lib/utm";

const PENDING_KEY = "mh:pending-brochure-download";

/**
 * Site thank-you page (prod: https://www.myhomeconstructions.com/thank-you).
 * Locally this is `/thank-you` so sessionStorage brochure download still works.
 */
export function thankYouHref() {
  if (typeof window === "undefined") return "/thank-you";
  const utm = getUtm();
  const params = new URLSearchParams();
  Object.entries(utm || {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return `/thank-you${query ? `?${query}` : ""}`;
}

/** Start this LP's brochure download, then go to the site thank-you page. */
export function finishBrochureLead(href, name) {
  if (typeof window === "undefined" || !href) return;
  // Start download immediately (same-tab navigation can cancel a deferred click).
  const url = brochureDownloadUrl(href, name);
  if (url) {
    const a = document.createElement("a");
    a.href = url;
    if (name) a.download = name;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  // Also queue for /thank-you in case the click was blocked.
  rememberBrochureDownload(href, name);
  window.setTimeout(() => {
    window.location.assign(thankYouHref());
  }, 150);
}

/**
 * Filename saved to the visitor's computer.
 *
 * The bytes always come from this project's own CMS file. A shared CMS name
 * such as "Brochure.pdf" would make every project look like the same download,
 * so those get the project title in front. A real CMS filename is kept.
 */
export function savedBrochureName(projectName, fileName, label = "Brochure") {
  const raw = String(fileName || "")
    .split(/[\\/]/)
    .pop()
    .trim();
  const stem = raw.replace(/\.[^.]+$/, "").trim();
  const generic = !stem || /^(e[-\s]?)?broch(?:ure|er)$/i.test(stem);
  const base =
    (generic ? `${String(projectName || "").trim()} ${label}`.trim() : stem) ||
    "Brochure";
  const ext = (raw.match(/\.([a-z0-9]+)$/i) || [, "pdf"])[1].toLowerCase();
  return `${base}.${ext}`;
}

/** Same-origin proxy for a Strapi file so the browser saves it instead of opening a tab. */
export function brochureDownloadUrl(href, name) {
  if (!href) return "";
  if (STRAPI_URL && href.startsWith(STRAPI_URL)) {
    const params = new URLSearchParams({ url: href });
    if (name) params.set("name", name);
    return `/api/download?${params.toString()}`;
  }
  return href;
}

export function rememberBrochureDownload(href, name) {
  if (typeof window === "undefined" || !href) return;
  window.sessionStorage.setItem(PENDING_KEY, JSON.stringify({ href, name }));
}

export function startPendingBrochureDownload() {
  if (typeof window === "undefined") return;
  const raw = window.sessionStorage.getItem(PENDING_KEY);
  if (!raw) return;
  window.sessionStorage.removeItem(PENDING_KEY);

  let href = raw;
  let name = "";
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      href = parsed.href || "";
      name = parsed.name || "";
    }
  } catch {
    href = raw;
  }

  const url = brochureDownloadUrl(href, name);
  if (!url) return;
  const a = document.createElement("a");
  a.href = url;
  if (name) a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
