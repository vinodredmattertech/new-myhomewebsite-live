/**
 * Single entry point for the CRM push (`POST /api/pushToCRM`).
 *
 * Every lead form used to inline its own `fetch("/api/pushToCRM", ...)`.
 * Campaign attribution has to ride along on all of them, so the fetch lives
 * here instead — forms pass their fields, this adds the UTM stash, and there
 * is one place to change when the CRM payload changes.
 *
 * Returns the Response so existing callers can keep keying success off
 * `crmRes.ok`.
 */

import { getUtm } from "@/lib/utm";

export async function pushToCRM(payload = {}) {
  return fetch("/api/pushToCRM", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, utm: getUtm() }),
  });
}

export default pushToCRM;
