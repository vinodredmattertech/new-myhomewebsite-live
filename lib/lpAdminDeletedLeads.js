/**
 * Soft-delete store for landing-page admin leads.
 *
 * Strapi's preview/API token can read leads but typically cannot DELETE them
 * (403). Until a Full Access token is configured, we hide deleted IDs from the
 * admin list/CSV/counts via this store.
 *
 * Prefers Redis when REDIS_URL is ready; otherwise a local JSON file under
 * `.data/`.
 */

import fs from "fs";
import path from "path";
import Redis from "ioredis";

const FILE_PATH = path.join(process.cwd(), ".data", "lp-admin-deleted-leads.json");
const REDIS_KEY = `${process.env.REDIS_KEY_PREFIX || "myhome:"}lp-admin:deleted-leads`;

let redisClient = null;

function getRedis() {
  if (typeof window !== "undefined" || !process.env.REDIS_URL) return null;
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
    });
    redisClient.on("error", () => {});
  }
  return redisClient;
}

function readFileIds() {
  try {
    if (!fs.existsSync(FILE_PATH)) return [];
    const raw = JSON.parse(fs.readFileSync(FILE_PATH, "utf8"));
    return Array.isArray(raw?.ids) ? raw.ids.map(String) : [];
  } catch {
    return [];
  }
}

function writeFileIds(ids) {
  const dir = path.dirname(FILE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    FILE_PATH,
    JSON.stringify({ ids: [...new Set(ids.map(String))], updatedAt: new Date().toISOString() }, null, 2)
  );
}

export async function getDeletedLeadIds() {
  const redis = getRedis();
  if (redis) {
    try {
      if (redis.status !== "ready") await redis.connect().catch(() => {});
      if (redis.status === "ready") {
        const members = await redis.smembers(REDIS_KEY);
        if (members?.length) return new Set(members.map(String));
      }
    } catch {
      // fall through to file
    }
  }
  return new Set(readFileIds());
}

export async function markLeadsDeleted(ids = []) {
  const next = [...new Set(ids.map((id) => String(id).trim()).filter(Boolean))];
  if (!next.length) return;

  const redis = getRedis();
  if (redis) {
    try {
      if (redis.status !== "ready") await redis.connect().catch(() => {});
      if (redis.status === "ready") {
        await redis.sadd(REDIS_KEY, ...next);
      }
    } catch {
      // still write file as backup
    }
  }

  const existing = readFileIds();
  writeFileIds([...existing, ...next]);
}

export async function filterOutDeletedLeads(leads = []) {
  const deleted = await getDeletedLeadIds();
  if (!deleted.size) return leads;
  return leads.filter((lead) => !deleted.has(String(lead?.id)));
}
