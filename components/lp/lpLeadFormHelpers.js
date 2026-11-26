import {
  DEFAULT_COUNTRY,
  dialCodeFor,
  sanitizePhoneInput,
  validatePhone,
} from "@/lib/phone";
import { formatUtmBlock, getUtm } from "@/lib/utm";

/** Digits-only phone input + re-sanitize when country changes. */
export function wireLpPhoneInput(form) {
  if (!(form instanceof HTMLFormElement)) return;
  if (form.getAttribute("data-lp-phone-wired") === "1") return;
  form.setAttribute("data-lp-phone-wired", "1");

  const phone = form.querySelector('input[name="phone"]');
  const country = form.querySelector('select[name="countryCode"]');
  if (!phone || !country) return;

  const sanitize = () => {
    const clean = sanitizePhoneInput(phone.value, country.value || DEFAULT_COUNTRY);
    if (clean !== phone.value) phone.value = clean;
  };

  phone.addEventListener("input", sanitize);
  country.addEventListener("change", sanitize);
}

export function validateLpLeadForm(form) {
  const name = form.name?.value?.trim() || "";
  const email = form.email?.value?.trim() || "";
  const countryCode = form.countryCode?.value || DEFAULT_COUNTRY;
  const phone = form.phone?.value || "";
  const message = form.message?.value?.trim() || "";
  const consent = !!form.consent?.checked;

  if (name.length < 2) return "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email.";
  if (!String(phone).trim()) return "Please enter your phone number.";
  const phoneError = validatePhone(phone, countryCode);
  if (phoneError !== true) return phoneError;
  if (message.length < 2) return "Please enter your message.";
  if (!consent) return "Please accept the privacy consent to continue.";
  return "";
}

export function buildLpLeadPayload(form, { projectSlug, projectName, formSource }) {
  const countryCode = form.countryCode?.value || DEFAULT_COUNTRY;
  const phoneDigits = sanitizePhoneInput(form.phone.value, countryCode);
  const utm = getUtm();
  const userMessage = form.message?.value?.trim() || "";
  const utmBlock = formatUtmBlock(utm);

  return {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: `${dialCodeFor(countryCode)} ${phoneDigits}`.trim(),
    countryCode,
    projectSlug,
    project_name: projectName,
    project: projectName,
    FormSource: formSource,
    formSource,
    message: [userMessage, utmBlock].filter(Boolean).join("\n\n"),
    disclaimer: form.consent?.checked ? "yes" : "",
    consent: !!form.consent?.checked,
    pageUrl: typeof window !== "undefined" ? window.location.href : "",
    referrer: typeof document !== "undefined" ? document.referrer || "" : "",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent || "" : "",
    utm,
  };
}
