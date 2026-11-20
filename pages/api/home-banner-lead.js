/**
 * Homepage banner popup lead → Gmail SMTP only.
 *
 * Isolated from /api/sendEmail and every other form. Uses the Redmatter
 * Gmail mailbox + GMAIL_APP_PASSWORD from the server environment.
 *
 * Env:
 *   GMAIL_APP_PASSWORD          (required) Gmail app password
 *   HOME_BANNER_LEAD_TO         optional recipient (default: vinod@redmattertech.com)
 *   HOME_BANNER_SMTP_USER       optional (default: vinod@redmattertech.com)
 */

import nodemailer from "nodemailer";

const SMTP_USER =
  process.env.HOME_BANNER_SMTP_USER || "vinod@redmattertech.com";
const SMTP_FROM_NAME = "Redmatter";
const DEFAULT_TO =
  "vinod@redmattertech.com,harshith.s@myhomeconstructions.com";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function normalisePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const phoneRaw = String(req.body?.phone || "").trim();
  const phoneDigits = normalisePhone(phoneRaw);

  if (name.length < 2) {
    return res.status(400).json({ message: "Please enter your name." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Please enter a valid email." });
  }
  if (phoneDigits.length < 10) {
    return res
      .status(400)
      .json({ message: "Please enter a valid phone number." });
  }

  const appPassword = String(process.env.GMAIL_APP_PASSWORD || "").trim();
  if (!appPassword) {
    console.error("[home-banner-lead] GMAIL_APP_PASSWORD is not set");
    return res.status(503).json({
      message: "Email is not configured. Please try again later.",
    });
  }

  const toList = String(process.env.HOME_BANNER_LEAD_TO || DEFAULT_TO)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const to = toList.length ? toList : [DEFAULT_TO];

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: appPassword,
    },
    tls: { ciphers: "TLSv1.2" },
  });

  const submittedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  const mailData = {
    from: `"${SMTP_FROM_NAME}" <${SMTP_USER}>`,
    to,
    replyTo: email,
    subject: `Homepage Banner Lead — ${name}`,
    text: [
      "New homepage banner popup lead",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phoneRaw || phoneDigits}`,
      `Submitted: ${submittedAt}`,
      `Page: Homepage banner popup`,
    ].join("\n"),
    html: `
      <table style="width:100%;background:#f5f2ec;padding:28px;font-family:Georgia,serif;">
        <tr><td align="center">
          <table style="width:560px;max-width:100%;background:#fff;padding:28px;border:1px solid #e4ddd2;">
            <tr><td>
              <h2 style="margin:0 0 8px;color:#1a1a18;font-weight:400;">Myhome bangalore lead</h2>
              <p style="margin:0 0 20px;color:#577486;font-size:14px;">Submitted via myhome bangalore popup</p>
              <table width="100%" cellpadding="8" cellspacing="0" style="font-size:15px;color:#1a1a18;">
                <tr><td><b>Name</b></td><td>${escapeHtml(name)}</td></tr>
                <tr><td><b>Email</b></td><td>${escapeHtml(email)}</td></tr>
                <tr><td><b>Phone</b></td><td>${escapeHtml(phoneRaw || phoneDigits)}</td></tr>
                <tr><td><b>Submitted</b></td><td>${escapeHtml(submittedAt)}</td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>
      </table>
    `,
  };

  try {
    await transporter.sendMail(mailData);
    return res.status(200).json({ message: "Lead emailed successfully" });
  } catch (error) {
    console.error("[home-banner-lead] SMTP error:", error.message);
    return res.status(502).json({
      message: "Could not send the email. Please try again.",
    });
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
