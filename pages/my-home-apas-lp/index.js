import fs from "fs";
import path from "path";
import { useCallback } from "react";
import ApasShell from "../../components/apas-lp/ApasShell";
import { bindApasCrmForm } from "../../components/apas-lp/bindCrmForm";
import { mountLpProjectStatus } from "@/components/lp/mountLpProjectStatus";
import { extractProgressImages } from "@/lib/projectProgress";
import { getProjectProgressBySlug } from "@/lib/strapi";
import { captureUtm } from "@/lib/utm";

const PROJECT_SLUG = "my-home-apas";
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

export default function MyHomeApasLanding({ html, progress }) {
  const onReady = useCallback(() => {
    // Capture UTMs from the landing URL before the visitor navigates / opens modals.
    captureUtm();
    bindApasCrmForm();
    mountLpProjectStatus(document, progress);

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
      // Remount forms if slots were late; listener stays single-bound.
      if (!cancelled) {
        bindApasCrmForm();
        mountLpProjectStatus(document, progress);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [progress]);

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
MyHomeApasLanding.disableLiveChat = true;

export async function getStaticProps() {
  const html = fs.readFileSync(path.join(process.cwd(), "content/apas-lp/index.html"), "utf8");
  const project = await getProjectProgressBySlug(PROJECT_SLUG);
  const progress = extractProgressImages(project || {});
  return {
    props: { html, progress },
    revalidate: 60,
  };
}
