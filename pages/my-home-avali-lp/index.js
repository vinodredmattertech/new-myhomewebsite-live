import fs from "fs";
import path from "path";
import { useCallback } from "react";
import AvaliShell from "../../components/avali-lp/AvaliShell";
import { bindAvaliCrmForm } from "../../components/avali-lp/bindCrmForm";
import { mountLpProjectStatus } from "@/components/lp/mountLpProjectStatus";
import { extractProgressImages } from "@/lib/projectProgress";
import { getProjectProgressBySlug } from "@/lib/strapi";
import { captureUtm } from "@/lib/utm";

const PROJECT_SLUG = "my-home-avali";
const TITLE = "Luxury 3 & 4 BHK Apartments in Gopanpally | My Home Avali";
const STYLES = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css",
  "/my-home-avali-lp/assests/style.css",
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

export default function MyHomeAvaliLanding({ html, progress }) {
  const onReady = useCallback(() => {
    captureUtm();
    bindAvaliCrmForm();
    mountLpProjectStatus(document, progress);

    let cancelled = false;
    const remount = () => {
      if (cancelled) return;
      bindAvaliCrmForm();
      mountLpProjectStatus(document, progress);
      if (typeof window.__avaliRunBoot === "function") {
        const root = document.querySelector(".avali-lp");
        if (root && root.querySelector(".css-scroll") && !root.querySelector(".css-scroll-wrap")) {
          window.__avaliListenersBound = false;
          window.__avaliRunBoot();
        }
      }
    };

    (async () => {
      await loadScript(
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"
      );
      if (cancelled) return;
      window.__avaliListenersBound = false;
      await loadScript("/my-home-avali-lp/assests/js/boot.js", true);
      if (typeof window.__avaliRunBoot === "function") {
        window.__avaliRunBoot();
      }
      remount();
      // React can reset dangerouslySetInnerHTML after first paint — remount once more.
      window.setTimeout(remount, 300);
      window.setTimeout(remount, 1000);
    })();

    return () => {
      cancelled = true;
    };
  }, [progress]);

  return (
    <AvaliShell
      title={TITLE}
      canonical="/my-home-avali-lp"
      styles={STYLES}
      html={html}
      onReady={onReady}
    />
  );
}

MyHomeAvaliLanding.getLayout = (page) => page;
MyHomeAvaliLanding.formPage = true;
MyHomeAvaliLanding.ownFloatingActions = true;
MyHomeAvaliLanding.preventChatAutoLaunch = true;

export async function getStaticProps() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "content/avali-lp/index.html"),
    "utf8"
  );
  const project = await getProjectProgressBySlug(PROJECT_SLUG);
  const progress = extractProgressImages(project || {});
  return {
    props: { html, progress },
    revalidate: 60,
  };
}
