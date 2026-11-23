/**
 * Cookie-based session for the shared landing-page leads admin
 * (`/landing-page-admin`).
 *
 * Set LANDING_PAGE_ADMIN_PASSWORD in `.env`.
 * (APAS_LP_ADMIN_PASSWORD is accepted as a temporary fallback.)
 */

import crypto from "crypto";

export const COOKIE_NAME = "landing_page_admin";
const MAX_AGE_SEC = 60 * 60 * 12; // 12 hours

function password() {
  return String(
    process.env.LANDING_PAGE_ADMIN_PASSWORD ||
      process.env.APAS_LP_ADMIN_PASSWORD ||
      ""
  ).trim();
}

function secret() {
  const pw = password();
  if (!pw) return "";
  return crypto.createHash("sha256").update(`landing-page-admin:${pw}`).digest("hex");
}

export function isAdminConfigured() {
  return !!password();
}

export function passwordMatches(given) {
  const expected = password();
  if (!expected) return false;
  const a = crypto.createHash("sha256").update(String(given || "")).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken() {
  const s = secret();
  if (!s) return "";
  const payload = `ok.${Date.now()}`;
  const sig = crypto.createHmac("sha256", s).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function sessionIsValid(token) {
  const s = secret();
  if (!s || !token) return false;
  const parts = String(token).split(".");
  if (parts.length !== 3) return false;
  const [flag, ts, sig] = parts;
  if (flag !== "ok") return false;
  const age = Date.now() - Number(ts);
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_SEC * 1000) return false;
  const expected = crypto
    .createHmac("sha256", s)
    .update(`${flag}.${ts}`)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function parseCookies(req) {
  const header = req.headers?.cookie || "";
  const out = {};
  header.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(value);
  });
  return out;
}

export function readSession(req) {
  const cookies = parseCookies(req);
  return sessionIsValid(cookies[COOKIE_NAME]);
}

export function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SEC}${secure}`
  );
}

export function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}
