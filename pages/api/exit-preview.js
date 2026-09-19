/**
 * Leave preview mode and return to the published page.
 *
 * Linked from the banner shown while previewing. No secret required: ending a
 * preview is not a privileged act, and requiring one would only strand people
 * in a draft view.
 */
export default function handler(req, res) {
  res.clearPreviewData();

  // Same restriction as the preview route: only a same-site path, rebuilt here.
  const raw = String(req.query.path || "");
  const path = /^\/[A-Za-z0-9._~-]*$/.test(raw) ? raw : "/";
  res.redirect(307, path);
}
