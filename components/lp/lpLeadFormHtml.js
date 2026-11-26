import { COUNTRY_CODES, DEFAULT_COUNTRY } from "@/lib/phone";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Shared native LP lead form markup (Grava / Raka / Apas).
 * Matches the homepage enquire fields: name, email, country+phone, message.
 * India (`IN`) is the default country code.
 */
export function lpLeadFormHtml({ formSource, prefix }) {
  const source = escapeHtml(formSource);
  const options = COUNTRY_CODES.map((c) => {
    const selected = c.iso === DEFAULT_COUNTRY ? " selected" : "";
    const label = escapeHtml(`${c.flag} ${c.code} ${c.name}`);
    // Inline colors so native dropdown options stay readable on blue .fform strips
    // (parent color:#fff !important otherwise washes option text out).
    return `<option value="${escapeHtml(c.iso)}" style="color:#222;background:#fff"${selected}>${label}</option>`;
  }).join("");

  return `
<form class="${prefix}-lead-form" data-form-source="${source}" novalidate>
  <div class="${prefix}-lead-field">
    <input type="text" name="name" placeholder="Full Name*" autocomplete="name" required />
  </div>
  <div class="${prefix}-lead-field">
    <input type="email" name="email" placeholder="Email Address*" autocomplete="email" required />
  </div>
  <div class="${prefix}-lead-field ${prefix}-lead-phone">
    <select name="countryCode" class="${prefix}-lead-country" aria-label="Country code" required>
      ${options}
    </select>
    <input type="tel" name="phone" placeholder="Phone Number*" autocomplete="tel-national" inputmode="numeric" required />
  </div>
  <div class="${prefix}-lead-field">
    <textarea name="message" placeholder="Your Message*" rows="3" required></textarea>
  </div>
  <label class="${prefix}-lead-consent">
    <input type="checkbox" name="consent" value="yes" required />
    <span>I agree to the Privacy Policy and consent to being contacted by call, SMS, email or WhatsApp.</span>
  </label>
  <div class="${prefix}-lead-status" aria-live="polite"></div>
  <button type="submit" class="${prefix}-lead-submit">Submit</button>
</form>`.trim();
}
