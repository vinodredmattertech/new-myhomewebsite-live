import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { STRAPI_URL } from "@/lib/strapi";

/**
 * Same-origin download proxy for Strapi-hosted documents.
 *
 * `<a download>` is ignored by browsers when the file lives on another origin,
 * and Strapi serves uploads from its own host — so a "Download" button pointing
 * straight at the PDF just opens it in a tab, which is exactly what the "View"
 * button next to it already does. Streaming the file back through Next lets us
 * set `Content-Disposition: attachment`, so Download really downloads.
 *
 *   /api/download?url=<absolute strapi file url>&name=<suggested filename>
 *
 * Only URLs on the configured Strapi origin are fetched — the handler must not
 * become an open proxy that can be pointed at internal hosts.
 */
export const config = {
  // Documents routinely exceed the default 4 MB response cap.
  api: { responseLimit: false },
};

/** Strip anything that would break out of the quoted filename in the header. */
function safeFilename(name, fallback) {
  const base = String(name || "")
    .split(/[\\/]/)
    .pop()
    .replace(/["\r\n]/g, "")
    .trim();
  return base || fallback;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, name } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url" });

  let target;
  let allowed;
  try {
    target = new URL(String(url));
    allowed = new URL(STRAPI_URL);
  } catch {
    return res.status(400).json({ error: "Invalid url" });
  }

  if (target.origin !== allowed.origin) {
    return res.status(403).json({ error: "Forbidden host" });
  }

  try {
    const upstream = await fetch(target.toString(), {
      method: req.method === "HEAD" ? "HEAD" : "GET",
    });
    if (!upstream.ok || (req.method !== "HEAD" && !upstream.body)) {
      return res.status(upstream.status || 502).json({ error: "Upstream fetch failed" });
    }

    const filename = safeFilename(
      name,
      safeFilename(decodeURIComponent(target.pathname), "document")
    );

    res.status(200);
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "application/octet-stream"
    );
    const length = upstream.headers.get("content-length");
    if (length) res.setHeader("Content-Length", length);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
    res.setHeader("Cache-Control", "private, no-store");
    if (req.method === "HEAD") return res.end();
    await pipeline(Readable.fromWeb(upstream.body), res);
  } catch (err) {
    console.warn("[api/download] proxy error:", err.message);
    if (res.headersSent) {
      res.destroy();
      return;
    }
    return res.status(502).json({ error: "Download failed" });
  }
}
