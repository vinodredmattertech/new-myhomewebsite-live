import { pushToCRM } from "@/lib/crm";
import { submitLead } from "@/lib/strapi";
import { gravaLeadFormHtml } from "@/components/grava-lp/gravaLeadFormHtml";
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

const PROJECT_SLUG = "my-home-grava";
const PROJECT_NAME = "My Home Grava";
const BROCHURE_HREF = "/my-home-grava-lp/assets/docs/Ebrochure.pdf";
const BROCHURE_NAME = "My Home Grava Brochure.pdf";

function formSourceForSlot(slot) {
  if (slot.closest("#downloadModal")) return "My Home Grava LP Brochure";
  if (slot.closest("#unlockModal")) return "My Home Grava LP Unlock Price";
  if (slot.closest("#exampleModal")) return "My Home Grava LP Enquire";
  if (
    slot.closest(".grava-banner-form") ||
    slot.closest("#main-banner") ||
    slot.closest(".grava-mobile-banner-form-wrap")
  ) {
    return "My Home Grava LP Banner";
  }
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

function mountGravaLeadForms() {
  document
    .querySelectorAll(".grava-lp .selldo-slot, .grava-lp .selldo-eager")
    .forEach((slot) => {
      if (
        slot.getAttribute("data-grava-form") === "1" &&
        slot.querySelector(".grava-lead-form")
      ) {
        return;
      }
      if (!slot.closest(".fform") && !slot.closest(".modal")) return;
      slot.setAttribute("data-grava-form", "1");
      slot.setAttribute("data-loaded", "1");
      slot.innerHTML = gravaLeadFormHtml(formSourceForSlot(slot));
      const form = slot.querySelector(".grava-lead-form");
      if (form) wireLpPhoneInput(form);
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
        form.getAttribute("data-form-source") || "My Home Grava LP";
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
