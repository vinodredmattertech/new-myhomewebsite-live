import {
  createSessionToken,
  isAdminConfigured,
  passwordMatches,
  setSessionCookie,
} from "@/lib/landingPageAdminAuth";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!isAdminConfigured()) {
    return res.status(503).json({
      message:
        "Admin login is not configured. Set LANDING_PAGE_ADMIN_PASSWORD in .env.",
    });
  }

  const { password } = req.body || {};
  if (!passwordMatches(password)) {
    return res.status(401).json({ message: "Invalid password." });
  }

  const token = createSessionToken();
  setSessionCookie(res, token);
  return res.status(200).json({ ok: true });
}
