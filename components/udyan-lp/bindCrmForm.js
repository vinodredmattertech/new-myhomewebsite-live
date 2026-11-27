import { pushToCRM } from "@/lib/crm";
import { submitLead } from "@/lib/strapi";
import { udyanLeadFormHtml } from "@/components/udyan-lp/udyanLeadFormHtml";
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

const PROJECT_SLUG = "my-home-udyan";
const PROJECT_NAME = "My Home Udyan";
const BROCHURE_HREF = "/my-home-udyan-lp/assets/brochure.pdf";
const BROCHURE_NAME = "My Home Udyan Brochure.pdf";

function formSourceForSlot(slot) {
  if (slot.closest("#DownloadBrochure")) return "My Home Udyan LP Brochure";
  if (slot.closest("#EnquireNow")) return "My Home Udyan LP Enquire";
  if (
    slot.closest(".udyan-banner-form") ||
    slot.closest(".udyan-mobile-banner-form-wrap")
  ) {
    return "My Home Udyan LP Banner";
  }
  if (slot.classList.contains("selldo-eager") || slot.classList.contains("selldo-slot-footer")) {
    return "My Home Udyan LP Footer";
  }
  if (slot.closest("footer") || slot.closest(".footer") || slot.closest(".footer-new")) {
    return "My Home Udyan LP Footer";
  }
  return "My Home Udyan LP";
}

function setStatus(form, message, kind) {
  const note = form.querySelector(".udyan-lead-status");
  if (!note) return;
  note.textContent = message || "";
  note.classList.remove("is-error", "is-success");
  if (kind) note.classList.add(kind === "error" ? "is-error" : "is-success");
}

function mountUdyanLeadForms() {
  document
    .querySelectorAll(".udyan-lp .selldo-slot, .udyan-lp .selldo-eager")
    .forEach((slot) => {
      if (slot.getAttribute("data-udyan-form") === "1") return;
      if (!slot.closest(".fform") && !slot.closest(".fformm") && !slot.closest(".modal")) {
        return;
      }
      slot.setAttribute("data-udyan-form", "1");
      slot.setAttribute("data-loaded", "1");
      slot.innerHTML = udyanLeadFormHtml(formSourceForSlot(slot));
      const form = slot.querySelector(".udyan-lead-form");
      if (form) wireLpPhoneInput(form);
    });
}

/**
 * Swap Sell.do script slots for native forms and bind submit → Strapi + CRM.
 */
export function bindUdyanCrmForm() {
  if (typeof window === "undefined") return;

  mountUdyanLeadForms();

  if (window.__udyanCrmBound) return;
  window.__udyanCrmBound = true;

  document.addEventListener(
    "submit",
    async (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!form.classList.contains("udyan-lead-form")) return;
      if (!form.closest(".udyan-lp")) return;

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

      // Re-capture in case the landing URL still has UTMs (first-touch wins).
      captureUtm();

      const formSource = form.getAttribute("data-form-source") || "My Home Udyan LP";
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
