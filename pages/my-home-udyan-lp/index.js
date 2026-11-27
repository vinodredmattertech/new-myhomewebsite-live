import fs from "fs";
import path from "path";
import { useCallback } from "react";
import UdyanShell from "../../components/udyan-lp/UdyanShell";
import { bindUdyanCrmForm } from "../../components/udyan-lp/bindCrmForm";
import { mountLpProjectStatus } from "@/components/lp/mountLpProjectStatus";
import { extractProgressImages } from "@/lib/projectProgress";
import { getProjectProgressBySlug } from "@/lib/strapi";
import { captureUtm } from "@/lib/utm";

const PROJECT_SLUG = "my-home-udyan";
const TITLE = "2, 2.5, 3 & 4 BHK Apartments in Tellapur | My Home Udyan";
const STYLES = [
  "/my-home-udyan-lp/assets/vendor/bootstrap.min.css",
  "/my-home-udyan-lp/assets/css/app.css",
  "/my-home-udyan-lp/assets/css/lp-extra.css",
  "/my-home-udyan-lp/assets/vendor/owl.carousel.min.css",
  "/my-home-udyan-lp/assets/vendor/owl.theme.default.min.css",
  "/my-home-udyan-lp/assets/vendor/fancybox.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
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

export default function MyHomeUdyanLanding({ html, progress }) {
  const onReady = useCallback(() => {
    // Capture UTMs from the landing URL before the visitor navigates / opens modals.
    captureUtm();
    bindUdyanCrmForm();
    mountLpProjectStatus(document, progress);

    let cancelled = false;
    (async () => {
      await loadScript("/my-home-udyan-lp/assets/vendor/jquery.min.js");
      if (cancelled) return;
      await loadScript("/my-home-udyan-lp/assets/vendor/bootstrap.bundle.min.js");
      if (cancelled) return;
      await loadScript("/my-home-udyan-lp/assets/vendor/owl.carousel.min.js");
      if (cancelled) return;
      await loadScript("/my-home-udyan-lp/assets/vendor/fancybox.umd.js");
      if (cancelled) return;
      await loadScript("/my-home-udyan-lp/assets/vendor/fslightbox.js");
      if (cancelled) return;
      try {
        if (typeof window.refreshFsLightbox === "function") {
          window.refreshFsLightbox();
        }
      } catch (err) {
        console.error("udyan-lp lightbox refresh failed", err);
      }
      window.__udyanBooted = false;
      window.__udyanInlineBooted = false;
      await loadScript("/my-home-udyan-lp/assets/js/page.js", true);
      if (cancelled) return;
      // Inline scripts from the PHP page don't run via dangerouslySetInnerHTML —
      // load the extracted boot file so clubhouse/gallery/accordions work.
      await loadScript("/my-home-udyan-lp/assets/js/inline-boot.js", true);
      if (!cancelled) {
        bindUdyanCrmForm();
        mountLpProjectStatus(document, progress);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [progress]);

  return (
    <UdyanShell
      title={TITLE}
      canonical="/my-home-udyan-lp"
      styles={STYLES}
      html={html}
      onReady={onReady}
    />
  );
}

MyHomeUdyanLanding.getLayout = (page) => page;
MyHomeUdyanLanding.formPage = true;
MyHomeUdyanLanding.ownFloatingActions = true;
// Keep Livserv launcher; block vendor autoLaunch on this LP.
MyHomeUdyanLanding.preventChatAutoLaunch = true;

export async function getStaticProps() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "content/udyan-lp/index.html"),
    "utf8"
  );
  const project = await getProjectProgressBySlug(PROJECT_SLUG);
  const progress = extractProgressImages(project || {});
  return {
    props: { html, progress },
    revalidate: 60,
  };
}
