import { pushToCRM } from "@/lib/crm";
import { submitLead } from "@/lib/strapi";
import { apasLeadFormHtml } from "@/components/apas-lp/apasLeadFormHtml";
import {
  buildLpLeadPayload,
  validateLpLeadForm,
  wireLpPhoneInput,
} from "@/components/lp/lpLeadFormHelpers";
import { captureUtm } from "@/lib/utm";
import {
  finishBrochureLead,
  thankYouHref,
} from "@/lib/brochureDownload";

const PROJECT_SLUG = "my-home-apas";
const PROJECT_NAME = "My Home Apas";
const BROCHURE_HREF =
  "/my-home-apas-lp/assests/brochure/my-home-apas-brochure.pdf";
const BROCHURE_NAME = "My Home Apas Brochure.pdf";

function formSourceForSlot(slot) {
  if (slot.closest("#downloadModal")) return "My Home Apas LP Brochure";
  if (slot.closest("#booksitevisitModal")) return "My Home Apas LP Site Visit";
  if (slot.closest("#unlockModal")) return "My Home Apas LP Unlock Price";
  if (slot.closest("#exampleModal")) return "My Home Apas LP Enquire";
  if (
    slot.closest(".apas-banner-form") ||
    slot.closest("#main-banner") ||
    slot.closest("#hero-section-one") ||
    slot.closest(".apas-banner-section") ||
    slot.closest(".apas-mobile-banner-form-wrap")
  ) {
    return "My Home Apas LP Banner";
  }
  if (slot.classList.contains("selldo-eager")) return "My Home Apas LP Footer";
  if (slot.closest("footer") || slot.closest(".footer") || slot.closest(".footer-new")) {
    return "My Home Apas LP Footer";
  }
  return "My Home Apas LP";
}

function setStatus(form, message, kind) {
  const note = form.querySelector(".apas-lead-status");
  if (!note) return;
  note.textContent = message || "";
  note.classList.remove("is-error", "is-success");
  if (kind) note.classList.add(kind === "error" ? "is-error" : "is-success");
}

function mountApasLeadForms() {
  document.querySelectorAll(".apas-lp .selldo-slot, .apas-lp .selldo-eager").forEach((slot) => {
    if (slot.getAttribute("data-apas-form") === "1") return;
    if (!slot.closest(".fform") && !slot.closest(".modal")) return;
    slot.setAttribute("data-apas-form", "1");
    slot.setAttribute("data-loaded", "1");
    slot.innerHTML = apasLeadFormHtml(formSourceForSlot(slot));
    const form = slot.querySelector(".apas-lead-form");
    if (form) wireLpPhoneInput(form);
  });
}

/**
 * Swap Sell.do script slots for native forms and bind submit → Strapi + CRM.
 */
export function bindApasCrmForm() {
  if (typeof window === "undefined") return;

  mountApasLeadForms();

  if (window.__apasCrmBound) return;
  window.__apasCrmBound = true;

  document.addEventListener(
    "submit",
    async (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!form.classList.contains("apas-lead-form")) return;
      if (!form.closest(".apas-lp")) return;

      event.preventDefault();
      event.stopPropagation();

      const error = validateLpLeadForm(form);
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
      setStatus(form, "", null);

      captureUtm();

      const formSource = form.getAttribute("data-form-source") || "My Home Apas LP";
      const isBrochure = formSource.includes("Brochure");
      const payload = buildLpLeadPayload(form, {
        projectSlug: PROJECT_SLUG,
        projectName: PROJECT_NAME,
        formSource,
      });

      try {
        const [crmRes, leadOk] = await Promise.all([
          pushToCRM(payload),
          submitLead(payload),
        ]);
        const body = crmRes.ok ? await crmRes.json().catch(() => ({})) : {};
        const selldoError = body?.data?.error || body?.error;
        const rejected = Array.isArray(selldoError) && selldoError.length > 0;

        if (crmRes.ok && !rejected) {
          setStatus(form, "Thank you! Redirecting…", "success");
          if (isBrochure) {
            finishBrochureLead(BROCHURE_HREF, BROCHURE_NAME);
            return;
          }
          window.location.assign(thankYouHref());
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
