import fs from "fs";
import path from "path";
import { useCallback } from "react";
import ApasShell from "../../components/apas-lp/ApasShell";
import { bindApasCrmForm } from "../../components/apas-lp/bindCrmForm";

const TITLE = "3 BHK flats for sale in kokapet | apartments in Hyderabad | My Home Apas";
const STYLES = [
  "https://fonts.googleapis.com/css2?family=PT+Serif&display=swap",
  "/my-home-apas-lp/assests/js/bootstrap.min.css",
  "/my-home-apas-lp/assests/js/slick.css",
  "/my-home-apas-lp/assests/js/slick-theme.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/v4-shims.min.css",
  "/my-home-apas-lp/assests/style.css",
];

function utmValue(params, key) {
  const value = params.get(key);
  return value ? value : "Website";
}

function loadScript(src, force) {
  return new Promise((resolve) => {
    const existing = document.querySelectorAll('script[src="' + src + '"]');
    if (existing.length && !force) {
      resolve();
      return;
    }
    existing.forEach(function (node) {
      node.remove();
    });
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}

export default function MyHomeApasLanding({ html }) {
  const onReady = useCallback(() => {
    bindApasCrmForm();

    const params = new URLSearchParams(window.location.search);
    const source = utmValue(params, "utm_source");
    const subSource = utmValue(params, "utm_medium") + " - " + utmValue(params, "utm_campaign");

    window.sell_do_form_successfully_submitted = function () {
      try {
        const openBrochure = document.querySelector("#downloadModal.show");
        if (openBrochure) {
          window.sessionStorage.setItem(
            "apas-lp-brochure",
            JSON.stringify({
              href: "/my-home-apas-lp/assests/brochure/my-home-apas-brochure.pdf",
              name: "My Home Apas Brochure.pdf",
            })
          );
        }
      } catch (err) {
        /* ignore */
      }
      window.location = "/my-home-apas-lp/thank-you";
    };
    window.sell_do_form_rendered = function () {
      document.querySelectorAll(".sell_do_form_actual_container").forEach(function (el) {
        if (el.getAttribute("data-utm") === "1") return;
        el.setAttribute("data-utm", "1");
        el.insertAdjacentHTML(
          "beforeend",
          '<input type="hidden" value="667945d12f31c6c6ca6eef3d" name="sell_do[campaign][srd]">'
        );
        el.insertAdjacentHTML(
          "beforeend",
          '<input type="hidden" value="' + source.replace(/"/g, "") + '" name="sell_do[form][lead][source]">'
        );
        el.insertAdjacentHTML(
          "beforeend",
          '<input type="hidden" value="' + subSource.replace(/"/g, "") + '" name="sell_do[form][lead][sub_source]">'
        );
      });
    };

    let cancelled = false;
    (async () => {
      await loadScript("/my-home-apas-lp/assests/js/jquery.min.js");
      if (cancelled) return;
      await loadScript("/my-home-apas-lp/assests/js/bootstrap.bundle.min.js");
      if (cancelled) return;
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js"
      );
      if (cancelled) return;
      await loadScript("//cdn.jsdelivr.net/jquery.slick/1.5.7/slick.min.js");
      if (cancelled) return;
      // Gallery images use fslightbox. Skip lg-zoom.js — it targets lightGallery
      // v2 (window.lgModules) and crashes against the v1 file in this folder.
      await loadScript("https://www.myhomeconstructions.com/uploads/fslightbox.js");
      if (cancelled) return;
      try {
        if (typeof window.refreshFsLightbox === "function") window.refreshFsLightbox();
      } catch (err) {
        console.error("apas-lp lightbox refresh failed", err);
      }
      await loadScript("/my-home-apas-lp/assests/boot.js", !window.__apasBooted);
    })();

    return () => {
      cancelled = true;
      delete window.sell_do_form_successfully_submitted;
      delete window.sell_do_form_rendered;
    };
  }, []);

  return (
    <ApasShell
      title={TITLE}
      canonical="/my-home-apas-lp"
      styles={STYLES}
      html={html}
      onReady={onReady}
    />
  );
}

MyHomeApasLanding.getLayout = (page) => page;
MyHomeApasLanding.formPage = true;
MyHomeApasLanding.ownFloatingActions = true;

export async function getStaticProps() {
  const html = fs.readFileSync(path.join(process.cwd(), "content/apas-lp/index.html"), "utf8");
  return { props: { html } };
}
