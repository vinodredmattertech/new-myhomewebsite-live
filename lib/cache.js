import Redis from "ioredis";

/**
 * Redis read-through cache for the server-side Strapi GETs in lib/strapi.js
 * and lib/sitemap.js.
 *
 * Keys are `${REDIS_KEY_PREFIX}strapi:<host><path>?<query>`. The prefix must
 * match the backend's REDIS_KEY_PREFIX: Strapi's Cache Manager plugin clears
 * everything under that prefix, which is how an editor flushes the site after
 * publishing. The Strapi host is part of the key so the UAT frontend, which
 * shares this Redis but may point at another backend, never reads prod's
 * entries or overwrites them.
 *
 * Redis is an optimisation, never a dependency. With REDIS_URL unset, the
 * connection down, or any command failing, `cachedFetch` quietly falls back to
 * a plain fetch — a Redis outage slows the site down but never takes it down.
 */

const PREFIX = `${process.env.REDIS_KEY_PREFIX || "myhome:"}strapi:`;
const TTL_SECONDS = Number(process.env.REDIS_KEY_EXPIRE) || 300;

let client = null;
let lastErrorLog = 0;

function getClient() {
  // lib/strapi.js is also bundled for the browser (mediaUrl, submitLead…);
  // next.config.js aliases ioredis away there, so never touch it client-side.
  if (typeof window !== "undefined" || !process.env.REDIS_URL) return null;
  if (!client) {
    client = new Redis(process.env.REDIS_URL, {
      // Fail fast rather than queue: a request should never wait on Redis
      // longer than it would have waited on Strapi.
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
    });
    // ioredis emits an error on every reconnect attempt; log at most once a
    // minute so an outage doesn't flood the pm2 log.
    client.on("error", (err) => {
      const now = Date.now();
      if (now - lastErrorLog > 60_000) {
        lastErrorLog = now;
        console.warn("[cache] redis error:", err.message);
      }
    });
  }
  return client;
}

function keyFor(url) {
  const { host, pathname, search } = new URL(url);
  return `${PREFIX}${host}${pathname}${search}`;
}

function jsonResponse(body) {
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Drop-in replacement for `fetch` on Strapi GETs. Serves a cached body when
 * there is one; otherwise fetches, and caches the body if the response was OK.
 * Error responses are passed through uncached so a Strapi hiccup is not pinned
 * for the whole TTL.
 */
export async function cachedFetch(url, init = {}) {
  const redis = getClient();
  const method = (init.method || "GET").toUpperCase();
  if (!redis || redis.status !== "ready" || method !== "GET") {
    return fetch(url, init);
  }

  const key = keyFor(url);
  try {
    const hit = await redis.get(key);
    if (hit !== null) return jsonResponse(hit);
  } catch {
    // Treat a failed read as a miss.
  }

  const res = await fetch(url, init);
  if (!res.ok) return res;

  const body = await res.text();
  redis.set(key, body, "EX", TTL_SECONDS).catch(() => {});
  return jsonResponse(body);
}
