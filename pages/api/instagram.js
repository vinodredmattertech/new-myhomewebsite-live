/**
 * Instagram feed proxy for the home page "Everyday Stories" marquee.
 *
 *   GET /api/instagram?limit=18
 *
 * The Graph API token is a server-only secret, so the browser never talks to
 * Instagram directly — it asks this route, which returns a small normalised
 * list the marquee can render as-is:
 *
 *   [{ id, image, permalink, caption, mediaType, isVideo }, ...]
 *
 * Two things this smooths over for the client:
 *   • VIDEO / REEL items have an mp4 in `media_url` — the poster frame lives
 *     in `thumbnail_url`, so that is what we hand back as `image`.
 *   • CAROUSEL_ALBUM items occasionally come back without a top-level
 *     `media_url`, so we fall back to the first child's image.
 *
 * Responses are memoised in-module for CACHE_TTL_MS. Instagram rate-limits per
 * token and this endpoint sits on the busiest page on the site, so every
 * visitor triggering a fresh Graph call would burn the quota within the hour.
 * The stale copy is also served if a later refresh fails, so an expired token
 * or an Instagram blip degrades to "slightly old posts" instead of an empty
 * section.
 */

const GRAPH_VERSION = "v26.0";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const DEFAULT_LIMIT = 18;
const MAX_LIMIT = 50;

/** Module-level cache: `{ at, payload }`, shared by every request this server handles. */
let cache = null;

/** Pick the still image for a post — videos carry theirs in `thumbnail_url`. */
function posterFor(media) {
  if (media.media_type === "VIDEO") return media.thumbnail_url || null;
  if (media.media_url) return media.media_url;
  const firstChild = media.children?.data?.find((c) => c.media_url);
  return firstChild?.media_url || media.thumbnail_url || null;
}

/** Trim a caption down to something that fits a hover overlay. */
function shortCaption(caption) {
  const firstLine = String(caption || "")
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith("#"));
  if (!firstLine) return "";
  return firstLine.length > 120 ? `${firstLine.slice(0, 117).trimEnd()}…` : firstLine;
}

/** Public profile the "Explore on Instagram" CTA points at. */
function profileUrl() {
  return process.env.INSTAGRAM_PROFILE_URL || "https://www.instagram.com/myhomegroup/";
}

async function fetchFeed(limit) {
  const userId = process.env.INSTAGRAM_USER_ID;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!userId || !token) throw new Error("INSTAGRAM_USER_ID / INSTAGRAM_ACCESS_TOKEN not configured");

  const params = new URLSearchParams({
    fields: "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{media_url,media_type}",
    limit: String(limit),
    access_token: token,
  });

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${userId}/media?${params}`,
    { cache: "no-store" }
  );
  const json = await res.json();

  if (!res.ok || json?.error) {
    throw new Error(json?.error?.message || `Instagram responded ${res.status}`);
  }

  return (Array.isArray(json.data) ? json.data : [])
    .map((m) => ({
      id: m.id,
      image: posterFor(m),
      permalink: m.permalink || null,
      caption: shortCaption(m.caption),
      mediaType: m.media_type || "IMAGE",
      isVideo: m.media_type === "VIDEO",
      timestamp: m.timestamp || null,
    }))
    // A post with no usable still would render as a hole in the marquee.
    .filter((m) => m.image && m.permalink);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const requested = Number.parseInt(req.query.limit, 10);
  const limit = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const fresh = cache && Date.now() - cache.at < CACHE_TTL_MS && cache.limit >= limit;
  if (fresh) {
    res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=3600");
    return res.status(200).json({ items: cache.payload.slice(0, limit), profileUrl: profileUrl(), cached: true });
  }

  try {
    const items = await fetchFeed(limit);
    cache = { at: Date.now(), limit, payload: items };
    res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=3600");
    return res.status(200).json({ items, profileUrl: profileUrl(), cached: false });
  } catch (err) {
    console.warn("[instagram] feed fetch failed:", err.message);
    // Serve whatever we last had rather than blanking the section.
    if (cache?.payload?.length) {
      res.setHeader("Cache-Control", "public, s-maxage=120");
      return res
        .status(200)
        .json({ items: cache.payload.slice(0, limit), profileUrl: profileUrl(), cached: true, stale: true });
    }
    return res.status(200).json({ items: [], profileUrl: profileUrl(), error: err.message });
  }
}
