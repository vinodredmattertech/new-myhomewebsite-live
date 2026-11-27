import fs from "fs";
import path from "path";
import { useCallback } from "react";
import GravaShell from "../../components/grava-lp/GravaShell";
import { bindGravaCrmForm } from "../../components/grava-lp/bindCrmForm";

const TITLE = "Thank You | My Home Grava | 4 BHK Ultra Luxury Apartment at Neopolis, Kokapet";
const STYLES = [
  "/my-home-grava-lp/assets/css/bootstrap.min.css",
  "/my-home-grava-lp/assets/style.css",
  "/my-home-grava-lp/assets/css/inner-page.css",
];

function loadScript(src) {
  return new Promise((resolve) => {
    const existing = document.querySelector('script[src="' + src + '"]');
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}

export default function MyHomeGravaThankYou({ html }) {
  const onReady = useCallback(() => {
    bindGravaCrmForm();
    loadScript("/my-home-grava-lp/assets/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <GravaShell
      title={TITLE}
      canonical="/my-home-grava-lp/thank-you"
      styles={STYLES}
      html={html}
      onReady={onReady}
    />
  );
}

MyHomeGravaThankYou.getLayout = (page) => page;
MyHomeGravaThankYou.formPage = true;
MyHomeGravaThankYou.ownFloatingActions = true;
MyHomeGravaThankYou.preventChatAutoLaunch = true;

export async function getStaticProps() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "content/grava-lp/thank-you.html"),
    "utf8"
  );
  return { props: { html } };
}
