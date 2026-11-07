import fs from "fs";
import path from "path";
import { useCallback } from "react";
import RakaShell from "../../components/raka-lp/RakaShell";
import { bindRakaCrmForm } from "../../components/raka-lp/bindCrmForm";

const TITLE = "Luxury Apartments & 3 BHK Flats for Sale in Madinaguda, Miyapur";
const STYLES = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
  "/my-home-raka-lp/assests/style.css",
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

function startRakaBrochureDownload() {
  try {
    const raw = window.sessionStorage.getItem("raka-lp-brochure");
    if (!raw) return;
    window.sessionStorage.removeItem("raka-lp-brochure");
    const data = JSON.parse(raw);
    if (!data?.href) return;
    const link = document.createElement("a");
    link.href = data.href;
    link.download = data.name || "My Home Raka Brochure.pdf";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    /* ignore download errors */
  }
}

export default function MyHomeRakaThankYou({ html }) {
  const onReady = useCallback(() => {
    bindRakaCrmForm();
    startRakaBrochureDownload();
    const slot = document.querySelector(".raka-lp .fformm");
    if (slot && !slot.querySelector("script")) {
      const form = document.createElement("script");
      form.src = "//forms.cdn.sell.do/t/forms/60d5d009ed23e9203e3db96c/6375f564ed23e96f680c36d2.js";
      form.setAttribute("data-form-id", "6375f564ed23e96f680c36d2");
      slot.appendChild(form);
    }
    loadScript("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js");
    loadScript("https://use.fontawesome.com/826a7e3dce.js");
  }, []);

  return (
    <RakaShell title={TITLE} canonical="/my-home-raka-lp/thank-you" styles={STYLES} html={html} onReady={onReady} />
  );
}

MyHomeRakaThankYou.getLayout = (page) => page;
MyHomeRakaThankYou.formPage = true;
MyHomeRakaThankYou.ownFloatingActions = true;

export async function getStaticProps() {
  const html = fs.readFileSync(path.join(process.cwd(), "content/raka-lp/thank-you.html"), "utf8");
  return { props: { html } };
}
