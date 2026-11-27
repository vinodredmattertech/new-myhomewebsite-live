import { pushToCRM } from "@/lib/crm";
import { submitLead } from "@/lib/strapi";
import { avaliLeadFormHtml } from "@/components/avali-lp/avaliLeadFormHtml";
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

const PROJECT_SLUG = "my-home-avali";
const PROJECT_NAME = "My Home Avali";
const BROCHURE_HREF =
  "/my-home-avali-lp/assests/brochure/My-Home-avali_Brochure-compressed-1.pdf";
const BROCHURE_NAME = "My Home Avali Brochure.pdf";

function formSourceForSlot(slot) {
  if (slot.closest("#downloadModal")) return "My Home Avali LP Brochure";
  if (slot.closest("#unlockModal")) return "My Home Avali LP Unlock Price";
  if (slot.closest("#booksitevisitModal")) return "My Home Avali LP Site Visit";
  if (slot.closest("#exampleModal")) return "My Home Avali LP Enquire";
  if (slot.closest(".footer-new") || slot.closest("footer") || slot.closest(".footer")) {
    return "My Home Avali LP Footer";
  }
  if (
    slot.closest(".avali-banner-form") ||
    slot.closest(".avali-banner-form-overlay") ||
    slot.closest(".avali-mobile-banner-form-wrap") ||
    slot.closest("#main-banner") ||
    slot.hasAttribute("data-init")
  ) {
    return "My Home Avali LP Banner";
  }
  return "My Home Avali LP";
}

function setStatus(form, message, kind) {
  const note = form.querySelector(".avali-lead-status");
  if (!note) return;
  note.textContent = message || "";
  note.classList.remove("is-error", "is-success");
  if (kind) note.classList.add(kind === "error" ? "is-error" : "is-success");
}

function mountAvaliLeadForms() {
  document
    .querySelectorAll(".avali-lp .selldo-slot, .avali-lp .selldo-eager")
    .forEach((slot) => {
      // Remount when React resets dangerouslySetInnerHTML and wipes the form.
      if (
        slot.getAttribute("data-avali-form") === "1" &&
        slot.querySelector(".avali-lead-form")
      ) {
        return;
      }
      if (!slot.closest(".fform") && !slot.closest(".modal")) return;
      slot.setAttribute("data-avali-form", "1");
      slot.setAttribute("data-loaded", "1");
      slot.innerHTML = avaliLeadFormHtml(formSourceForSlot(slot));
      const form = slot.querySelector(".avali-lead-form");
      if (form) wireLpPhoneInput(form);
    });
}

/**
 * Swap Sell.do script slots for native forms and bind submit → Strapi + CRM.
 */
export function bindAvaliCrmForm() {
  if (typeof window === "undefined") return;

  mountAvaliLeadForms();

  if (window.__avaliCrmBound) return;
  window.__avaliCrmBound = true;

  document.addEventListener(
    "submit",
    async (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!form.classList.contains("avali-lead-form")) return;
      if (!form.closest(".avali-lp")) return;

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
      setStatus(form, "");

      captureUtm();

      const formSource =
        form.getAttribute("data-form-source") || "My Home Avali LP";
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
