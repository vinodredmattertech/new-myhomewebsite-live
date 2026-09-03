/**
 * Append-only request log for outbound API calls (currently the Sell.Do lead
 * push).
 *
 * pm2 already captures console output, but that stream is shared with every
 * other log line on the box and gets rotated away. Lead pushes are the thing
 * you need to audit weeks later — "did this lead reach the CRM, and what did
 * we send?" — so they also go to their own file.
 *
 * One JSON object per line (JSONL): greppable with plain grep, parseable with
 * `jq`. Never throws: a logging failure must not fail a lead submission.
 *
 * Env:
 *   API_LOG_PATH  override the default <project>/logs/api.log
 */

import fs from "fs";
import path from "path";

const LOG_PATH =
  process.env.API_LOG_PATH || path.join(process.cwd(), "logs", "api.log");

let dirReady = false;

/**
 * Write one entry.
 *
 * Secrets are the caller's responsibility to keep out of `entry` — the api_key
 * is deliberately never passed in. Note the file does contain lead PII (name,
 * phone, email), so it inherits whatever access the server directory has.
 */
export function apiLog(entry = {}) {
  try {
    if (!dirReady) {
      fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
      dirReady = true;
    }
    const line =
      JSON.stringify({ ts: new Date().toISOString(), ...entry }) + "\n";
    // Fire-and-forget: a slow disk should not hold up the form response.
    fs.appendFile(LOG_PATH, line, (err) => {
      if (err) console.warn("[apilog] write failed:", err.message);
    });
  } catch (err) {
    console.warn("[apilog] disabled:", err.message);
  }
}

export default apiLog;
