/**
 * Native Apas LP lead form markup — replaces Sell.do script slots.
 * `formSource` is read by bindApasCrmForm on submit.
 */
export function apasLeadFormHtml(formSource = "My Home Apas LP") {
  const source = String(formSource).replace(/"/g, "&quot;");
  return `
<form class="apas-lead-form" data-form-source="${source}" novalidate>
  <div class="apas-lead-field">
    <input type="text" name="name" placeholder="Full Name*" autocomplete="name" required />
  </div>
  <div class="apas-lead-field">
    <input type="email" name="email" placeholder="Email Address*" autocomplete="email" required />
  </div>
  <div class="apas-lead-field apas-lead-phone">
    <span class="apas-lead-dial" aria-hidden="true">+91</span>
    <input type="tel" name="phone" placeholder="Phone Number*" autocomplete="tel" inputmode="numeric" required />
  </div>
  <label class="apas-lead-consent">
    <input type="checkbox" name="consent" value="yes" required />
    <span>I agree to the Privacy Policy and consent to being contacted by call, SMS, email or WhatsApp.</span>
  </label>
  <div class="apas-lead-status" aria-live="polite"></div>
  <button type="submit" class="apas-lead-submit">Submit</button>
</form>`.trim();
}
