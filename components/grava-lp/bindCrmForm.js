import { pushToCRM } from "@/lib/crm";
import { submitLead } from "@/lib/strapi";
import { formatUtmBlock, getUtm } from "@/lib/utm";
import { gravaLeadFormHtml } from "@/components/grava-lp/gravaLeadFormHtml";

const PROJECT_SLUG = "my-home-grava";
const PROJECT_NAME = "My Home Grava";

function formSourceForSlot(slot) {
  if (slot.closest("#unlockModal")) return "My Home Grava LP Unlock Price";
  if (slot.closest("#exampleModal")) return "My Home Grava LP Enquire";
  if (slot.classList.contains("selldo-eager")) return "My Home Grava LP Footer";
  if (slot.closest("footer") || slot.closest(".footer-new")) {
    return "My Home Grava LP Footer";
  }
  return "My Home Grava LP";
}

function setStatus(form, message, kind) {
  const note = form.querySelector(".grava-lead-status");
  if (!note) return;
  note.textContent = message || "";
  note.classList.remove("is-error", "is-success");
  if (kind) note.classList.add(kind === "error" ? "is-error" : "is-success");
}

function validate(form) {
  const name = form.name?.value?.trim() || "";
  const email = form.email?.value?.trim() || "";
  const phoneDigits = String(form.phone?.value || "").replace(/\D/g, "");
  const consent = !!form.consent?.checked;

  if (name.length < 2) return "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email.";
  if (phoneDigits.length < 10) return "Please enter a valid 10-digit phone number.";
  if (!consent) return "Please accept the privacy consent to continue.";
  return "";
}

function mountGravaLeadForms() {
  document
    .querySelectorAll(".grava-lp .selldo-slot, .grava-lp .selldo-eager")
    .forEach((slot) => {
      if (slot.getAttribute("data-grava-form") === "1") return;
      if (!slot.closest(".fform") && !slot.closest(".modal")) return;
      slot.setAttribute("data-grava-form", "1");
      slot.setAttribute("data-loaded", "1");
      slot.innerHTML = gravaLeadFormHtml(formSourceForSlot(slot));
    });
}

/**
 * Swap Sell.do script slots for native forms and bind submit → Strapi + CRM.
 */
export function bindGravaCrmForm() {
  if (typeof window === "undefined") return;

  mountGravaLeadForms();

  if (window.__gravaCrmBound) return;
  window.__gravaCrmBound = true;

  document.addEventListener(
    "submit",
    async (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!form.classList.contains("grava-lead-form")) return;
      if (!form.closest(".grava-lp")) return;

      event.preventDefault();
      event.stopPropagation();

      const error = validate(form);
      if (error) {
        setStatus(form, error, "error");
        return;
      }

      const button = form.querySelector('[type="submit"]');
      const previousLabel = button ? button.textContent : "";
      if (button) {
        button.disabled = true;
        button.textContent = "Please wait…";
      }
      setStatus(form, "");

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const phoneDigits = String(form.phone.value || "").replace(/\D/g, "");
      const phone = phoneDigits.length === 10 ? `+91${phoneDigits}` : `+${phoneDigits}`;
      const formSource =
        form.getAttribute("data-form-source") || "My Home Grava LP";
      const utm = getUtm();
      const message = formatUtmBlock(utm);

      const payload = {
        name,
        email,
        phone,
        countryCode: "IN",
        projectSlug: PROJECT_SLUG,
        project_name: PROJECT_NAME,
        project: PROJECT_NAME,
        FormSource: formSource,
        formSource,
        message,
        disclaimer: form.consent?.checked ? "yes" : "",
        consent: !!form.consent?.checked,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        referrer: typeof document !== "undefined" ? document.referrer || "" : "",
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent || "" : "",
        utm,
      };

      try {
        const [crmRes, leadOk] = await Promise.all([
          pushToCRM(payload),
          submitLead(payload),
        ]);
        const body = crmRes.ok ? await crmRes.json().catch(() => ({})) : {};
        const selldoError = body?.data?.error || body?.error;
        const rejected = Array.isArray(selldoError) && selldoError.length > 0;
        if (crmRes.ok && !rejected) {
          window.location.assign("/my-home-grava-lp/thank-you");
          return;
        }
        if (leadOk && !crmRes.ok) {
          setStatus(
            form,
            "Saved on the website, but the CRM did not accept it. Please try again.",
            "error"
          );
        } else {
          setStatus(
            form,
            rejected
              ? "The CRM did not accept this enquiry. Please use a different phone or email."
              : "Couldn't save your details. Please try again.",
            "error"
          );
        }
      } catch (err) {
        setStatus(form, "Network error. Please try again.", "error");
      }

      if (button) {
        button.disabled = false;
        button.textContent = previousLabel || "Submit";
      }
    },
    true
  );
}
