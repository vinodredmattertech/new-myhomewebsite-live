import { pushToCRM } from "@/lib/crm";
import { submitLead } from "@/lib/strapi";
import { formatUtmBlock, getUtm } from "@/lib/utm";
import { apasLeadFormHtml } from "@/components/apas-lp/apasLeadFormHtml";

const PROJECT_SLUG = "my-home-apas";
const PROJECT_NAME = "My Home Apas";

function formSourceForSlot(slot) {
  if (slot.closest("#downloadModal")) return "My Home Apas LP Brochure";
  if (slot.closest("#booksitevisitModal")) return "My Home Apas LP Site Visit";
  if (slot.closest("#unlockModal")) return "My Home Apas LP Unlock Price";
  if (slot.closest("#exampleModal")) return "My Home Apas LP Enquire";
  if (slot.classList.contains("selldo-eager")) return "My Home Apas LP Footer";
  return "My Home Apas LP";
}

function setStatus(form, message, kind) {
  const note = form.querySelector(".apas-lead-status");
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

function mountApasLeadForms() {
  document.querySelectorAll(".apas-lp .selldo-slot, .apas-lp .selldo-eager").forEach((slot) => {
    if (slot.getAttribute("data-apas-form") === "1") return;
    if (!slot.closest(".fform") && !slot.closest(".modal")) return;
    slot.setAttribute("data-apas-form", "1");
    slot.setAttribute("data-loaded", "1");
    slot.innerHTML = apasLeadFormHtml(formSourceForSlot(slot));
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
      setStatus(form, "", null);

      const phoneDigits = String(form.phone.value || "").replace(/\D/g, "");
      const phone = `+91 ${phoneDigits}`;
      const formSource = form.getAttribute("data-form-source") || "My Home Apas LP";
      const isBrochure = formSource.includes("Brochure");
      const utm = getUtm();
      const utmBlock = formatUtmBlock(utm);
      const message = [utmBlock].filter(Boolean).join("\n\n");

      const payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone,
        countryCode: "IN",
        projectSlug: PROJECT_SLUG,
        project_name: PROJECT_NAME,
        project: PROJECT_NAME,
        FormSource: formSource,
        formSource,
        message,
        consent: true,
        disclaimer: "yes",
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        referrer: typeof document !== "undefined" ? document.referrer || "" : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent || "" : "",
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
          setStatus(form, "Thank you! Redirecting…", "success");
          if (isBrochure) {
            try {
              window.sessionStorage.setItem(
                "apas-lp-brochure",
                JSON.stringify({
                  href: "/my-home-apas-lp/assests/brochure/my-home-apas-brochure.pdf",
                  name: "My Home Apas Brochure.pdf",
                })
              );
            } catch (err) {
              /* ignore */
            }
          }
          window.location.assign("/my-home-apas-lp/thank-you");
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
