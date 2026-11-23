import fs from "fs";
import path from "path";
import { useCallback } from "react";
import GravaShell from "../../components/grava-lp/GravaShell";
import { bindGravaCrmForm } from "../../components/grava-lp/bindCrmForm";
import { mountLpProjectStatus } from "@/components/lp/mountLpProjectStatus";
import { extractProgressImages } from "@/lib/projectProgress";
import { getProjectProgressBySlug } from "@/lib/strapi";
import { captureUtm } from "@/lib/utm";

const PROJECT_SLUG = "my-home-grava";
const TITLE = "Luxury 4 BHK Apartments in Neopolis Kokapet | My Home Grava";
const STYLES = [
  "https://fonts.googleapis.com/css2?family=PT+Serif&display=swap",
  "/my-home-grava-lp/assets/css/bootstrap.min.css",
  "/my-home-grava-lp/assets/css/mdb.min.css",
  "/my-home-grava-lp/assets/js/lightgallery.css",
  "/my-home-grava-lp/assets/style.css",
  "/my-home-grava-lp/assets/css/inner-page.css",
  "/my-home-grava-lp/assets/css/slick.css",
  "/my-home-grava-lp/assets/js/owl.carousel.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/v4-shims.min.css",
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

export default function MyHomeGravaLanding({ html, progress }) {
  const onReady = useCallback(() => {
    captureUtm();
    bindGravaCrmForm();
    mountLpProjectStatus(document, progress);

    let cancelled = false;
    (async () => {
      await loadScript("/my-home-grava-lp/assets/js/jquery.min.js");
      if (cancelled) return;
      await loadScript("/my-home-grava-lp/assets/js/bootstrap.bundle.min.js");
      if (cancelled) return;
      await loadScript("/my-home-grava-lp/assets/js/owl.carousel.min.js");
      if (cancelled) return;
      await loadScript("/my-home-grava-lp/assets/js/slick.min.js");
      if (cancelled) return;
      await loadScript("/my-home-grava-lp/assets/js/fslightbox.js");
      if (cancelled) return;
      try {
        if (typeof window.refreshFsLightbox === "function") {
          window.refreshFsLightbox();
        }
      } catch (err) {
        console.error("grava-lp lightbox refresh failed", err);
      }
      // Allow boot.js to re-run after Soft navigations.
      window.__gravaBooted = false;
      await loadScript("/my-home-grava-lp/assets/js/boot.js", true);
      if (!cancelled) {
        bindGravaCrmForm();
        mountLpProjectStatus(document, progress);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [progress]);

  return (
    <GravaShell
      title={TITLE}
      canonical="/my-home-grava-lp"
      styles={STYLES}
      html={html}
      onReady={onReady}
    />
  );
}

MyHomeGravaLanding.getLayout = (page) => page;
MyHomeGravaLanding.formPage = true;
MyHomeGravaLanding.ownFloatingActions = true;
MyHomeGravaLanding.disableLiveChat = true;

export async function getStaticProps() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "content/grava-lp/index.html"),
    "utf8"
  );
  const project = await getProjectProgressBySlug(PROJECT_SLUG);
  const progress = extractProgressImages(project || {});
  return {
    props: { html, progress },
    revalidate: 60,
  };
}
