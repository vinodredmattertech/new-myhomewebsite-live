/**
 * Native Grava LP lead form markup — replaces Sell.do script slots.
 * `formSource` is read by bindGravaCrmForm on submit.
 */
export function gravaLeadFormHtml(formSource = "My Home Grava LP") {
  const source = String(formSource).replace(/"/g, "&quot;");
  return `
<form class="grava-lead-form" data-form-source="${source}" novalidate>
  <div class="grava-lead-field">
    <input type="text" name="name" placeholder="Full Name*" autocomplete="name" required />
  </div>
  <div class="grava-lead-field">
    <input type="email" name="email" placeholder="Email Address*" autocomplete="email" required />
  </div>
  <div class="grava-lead-field grava-lead-phone">
    <span class="grava-lead-dial" aria-hidden="true">+91</span>
    <input type="tel" name="phone" placeholder="Phone Number*" autocomplete="tel" inputmode="numeric" required />
  </div>
  <label class="grava-lead-consent">
    <input type="checkbox" name="consent" value="yes" required />
    <span>I agree to the Privacy Policy and consent to being contacted by call, SMS, email or WhatsApp.</span>
  </label>
  <div class="grava-lead-status" aria-live="polite"></div>
  <button type="submit" class="grava-lead-submit">Submit</button>
</form>`.trim();
}
