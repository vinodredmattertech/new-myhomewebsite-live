/**
 * Native Raka LP lead form markup — replaces Sell.do script slots.
 * `formSource` is read by bindRakaCrmForm on submit.
 */
export function rakaLeadFormHtml(formSource = "My Home Raka LP") {
  const source = String(formSource).replace(/"/g, "&quot;");
  return `
<form class="raka-lead-form" data-form-source="${source}" novalidate>
  <div class="raka-lead-field">
    <input type="text" name="name" placeholder="Full Name*" autocomplete="name" required />
  </div>
  <div class="raka-lead-field">
    <input type="email" name="email" placeholder="Email Address*" autocomplete="email" required />
  </div>
  <div class="raka-lead-field raka-lead-phone">
    <span class="raka-lead-dial" aria-hidden="true">+91</span>
    <input type="tel" name="phone" placeholder="Phone Number*" autocomplete="tel" inputmode="numeric" required />
  </div>
  <label class="raka-lead-consent">
    <input type="checkbox" name="consent" value="yes" required />
    <span>I agree to the Privacy Policy and consent to being contacted by call, SMS, email or WhatsApp.</span>
  </label>
  <div class="raka-lead-status" aria-live="polite"></div>
  <button type="submit" class="raka-lead-submit">Submit</button>
</form>`.trim();
}
