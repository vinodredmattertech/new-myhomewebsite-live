import { pushToCRM } from "@/lib/crm";
import { submitLead } from "@/lib/strapi";
import { formatUtmBlock, getUtm } from "@/lib/utm";
import { rakaLeadFormHtml } from "@/components/raka-lp/rakaLeadFormHtml";

const PROJECT_SLUG = "my-home-raka";
const PROJECT_NAME = "My Home Raka";

function formSourceForSlot(slot) {
  if (slot.closest("#downloadModal")) return "My Home Raka LP Brochure";
  if (slot.closest("#booksitevisitModal")) return "My Home Raka LP Site Visit";
  if (slot.closest("#unlockModal")) return "My Home Raka LP Unlock Price";
  if (slot.closest("#exampleModal")) return "My Home Raka LP Enquire";
  if (slot.classList.contains("selldo-eager")) return "My Home Raka LP Footer";
  if (slot.closest("footer") || slot.closest(".footer") || slot.closest(".footer-new")) {
    return "My Home Raka LP Footer";
  }
  return "My Home Raka LP";
}

function setStatus(form, message, kind) {
  const note = form.querySelector(".raka-lead-status");
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

function mountRakaLeadForms() {
  document
    .querySelectorAll(".raka-lp .selldo-slot, .raka-lp .selldo-eager")
    .forEach((slot) => {
      if (slot.getAttribute("data-raka-form") === "1") return;
      if (!slot.closest(".fform") && !slot.closest(".fformm") && !slot.closest(".modal")) {
        return;
      }
      slot.setAttribute("data-raka-form", "1");
      slot.setAttribute("data-loaded", "1");
      slot.innerHTML = rakaLeadFormHtml(formSourceForSlot(slot));
    });
}

/**
 * Swap Sell.do script slots for native forms and bind submit → Strapi + CRM.
 */
export function bindRakaCrmForm() {
  if (typeof window === "undefined") return;

  mountRakaLeadForms();

  if (window.__rakaCrmBound) return;
  window.__rakaCrmBound = true;

  document.addEventListener(
    "submit",
    async (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!form.classList.contains("raka-lead-form")) return;
      if (!form.closest(".raka-lp")) return;

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
      const formSource = form.getAttribute("data-form-source") || "My Home Raka LP";
      const isBrochure = formSource.includes("Brochure");
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
          if (isBrochure) {
            try {
              window.sessionStorage.setItem(
                "raka-lp-brochure",
                JSON.stringify({
                  href: "/my-home-raka-lp/assets-avali/Brochure.pdf",
                  name: "My Home Raka Brochure.pdf",
                })
              );
            } catch (err) {
              /* ignore */
            }
          }
          window.location.assign("/my-home-raka-lp/thank-you");
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
