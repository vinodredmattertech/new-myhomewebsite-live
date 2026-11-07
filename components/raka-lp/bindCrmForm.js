import { pushToCRM } from "@/lib/crm";
import { submitLead } from "@/lib/strapi";

const PROJECT_SLUG = "my-home-raka";
const PROJECT_NAME = "My Home Raka";

function field(form, name) {
  const el = form.querySelector(`[name="${name}"]`);
  return el ? String(el.value || "").trim() : "";
}

function phoneNumber(form) {
  const input = form.querySelector('[name="sell_do[form][lead][phone]"]');
  if (!input) return "";
  const jq = window.selldojQuery;
  if (jq) {
    try {
      const widget = jq(input);
      if (!widget.intlTelInput("isValidNumber")) return "";
      return widget.intlTelInput("getNumber");
    } catch (err) {
      /* The phone widget is not ready yet; use the typed value. */
    }
  }
  return input.value.trim();
}

function showError(form, message) {
  let note = form.querySelector(".raka-crm-error");
  if (!note) {
    note = document.createElement("div");
    note.className = "raka-crm-error";
    note.setAttribute("role", "alert");
    note.style.cssText = "color:#b00020;font-size:14px;margin-top:8px;";
    const button = form.querySelector('[type="submit"]');
    (button ? button.parentElement : form).appendChild(note);
  }
  note.textContent = message;
}

/**
 * The embedded Sell.do widget files this landing page against its own old
 * project. Every other form on the site goes through /api/pushToCRM, which
 * uses the My Home Raka ids from the CMS. Take those submits over so the
 * lead lands in the same CRM project.
 */
export function bindRakaCrmForm() {
  if (window.__rakaCrmBound) return;
  window.__rakaCrmBound = true;

  document.addEventListener(
    "submit",
    async (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!form.closest(".raka-lp")) return;
      if (!form.querySelector('[name="sell_do[form][lead][name]"]')) return;

      const name = field(form, "sell_do[form][lead][name]");
      const email = field(form, "sell_do[form][lead][email]");
      const phone = phoneNumber(form);
      if (!name || !email || !phone) return;

      event.preventDefault();
      event.stopPropagation();

      const button = form.querySelector('[type="submit"]');
      const previousLabel = button ? button.value : "";
      if (button) {
        button.disabled = true;
        button.value = "Please wait";
      }

      const disclaimer = form.querySelector(
        '[name="sell_do[form][custom][custom_disclaimer]"]'
      );
      const isBrochure = !!form.closest("#downloadModal");
      const formSource = isBrochure
        ? "My Home Raka LP Brochure"
        : "My Home Raka LP";
      const payload = {
        name,
        email,
        phone,
        projectSlug: PROJECT_SLUG,
        project_name: PROJECT_NAME,
        project: PROJECT_NAME,
        FormSource: formSource,
        formSource,
        disclaimer: disclaimer && disclaimer.checked ? "yes" : "",
        consent: !!(disclaimer && disclaimer.checked),
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
              /* ignore storage errors */
            }
          }
          window.location.assign("/my-home-raka-lp/thank-you");
          return;
        }
        if (leadOk && !crmRes.ok) {
          showError(form, "Saved on the website, but the CRM did not accept it. Please try again.");
        } else {
          showError(
            form,
            rejected
              ? "The CRM did not accept this enquiry. Please use a different phone or email."
              : "Couldn't save your details. Please try again."
          );
        }
      } catch (err) {
        showError(form, "Network error. Please try again.");
      }

      if (button) {
        button.disabled = false;
        button.value = previousLabel || "Submit";
      }
    },
    true
  );
}
