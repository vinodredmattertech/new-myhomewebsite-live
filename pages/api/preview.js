import crypto from "crypto";

/**
 * Turn a signed preview link into a preview session.
 *
 * Opened from the "Open preview" button in Strapi. On success it sets Next's
 * preview cookie and redirects to the page, which then renders the draft
 * instead of the published version (see getServerSideProps in [slug].js).
 *
 * Two things this must not become:
 *
 *  - an oracle. The secret is compared in constant time, so the response
 *    cannot be used to guess it a character at a time.
 *  - an open redirect. Only a same-site path is accepted, and it is rebuilt
 *    from scratch rather than echoed, so `?path=//evil.com` cannot send a
 *    visitor off-site on the strength of our domain.
 */

const SECRET = process.env.PREVIEW_SECRET || "";

/** Compare without leaking how much of the value matched. */
function secretMatches(given) {
  const a = Buffer.from(String(given || ""));
  const b = Buffer.from(SECRET);
  // timingSafeEqual throws on a length mismatch, so compare a digest instead:
  // equal-length inputs, and the comparison itself stays constant time.
  return crypto.timingSafeEqual(
    crypto.createHash("sha256").update(a).digest(),
    crypto.createHash("sha256").update(b).digest()
  );
}

/** A single-segment, same-site path such as "/my-home-vyoma". */
function safePath(raw) {
  const value = String(raw || "");
  // Rejects "//host", "/../x", "https://…", and anything with a slash inside.
  if (!/^\/[A-Za-z0-9._~-]+$/.test(value)) return null;
  return value;
}

export default function handler(req, res) {
  if (!SECRET) {
    return res.status(500).json({ message: "Preview is not configured on this server." });
  }
  if (!secretMatches(req.query.secret)) {
    return res.status(401).json({ message: "Invalid preview link." });
  }

  const path = safePath(req.query.path);
  if (!path) {
    return res.status(400).json({ message: "Invalid preview path." });
  }

  res.setPreviewData({});
  res.redirect(307, path);
}
