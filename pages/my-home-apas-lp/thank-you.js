import fs from "fs";
import path from "path";
import { useCallback } from "react";
import ApasShell from "../../components/apas-lp/ApasShell";
import { bindApasCrmForm } from "../../components/apas-lp/bindCrmForm";

const TITLE = "Thank You for Enquiry | 3 BHK Apartments in Kokapet, Hyderabad";
const STYLES = [
  "https://fonts.googleapis.com/css2?family=PT+Serif&display=swap",
  "/my-home-apas-lp/assests/js/bootstrap.min.css",
  "/my-home-apas-lp/assests/style.css",
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

function startApasBrochureDownload() {
  try {
    const raw = window.sessionStorage.getItem("apas-lp-brochure");
    if (!raw) return;
    window.sessionStorage.removeItem("apas-lp-brochure");
    const data = JSON.parse(raw);
    if (!data?.href) return;
    const link = document.createElement("a");
    link.href = data.href;
    link.download = data.name || "My Home Apas Brochure.pdf";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    /* ignore download errors */
  }
}

export default function MyHomeApasThankYou({ html }) {
  const onReady = useCallback(() => {
    bindApasCrmForm();
    startApasBrochureDownload();

    document.querySelectorAll(".apas-lp .selldo-eager, .apas-lp .selldo-slot").forEach(function (slot) {
      if (slot.getAttribute("data-loaded") === "1") return;
      slot.setAttribute("data-loaded", "1");
      const form = document.createElement("script");
      form.src =
        "//forms.cdn.sell.do/t/forms/60d5d009ed23e9203e3db96c/64e457ffc825610c0a6e72ef.js";
      form.setAttribute("data-form-id", "64e457ffc825610c0a6e72ef");
      slot.appendChild(form);
    });

    loadScript("/my-home-apas-lp/assests/js/bootstrap.bundle.min.js");
    loadScript("https://use.fontawesome.com/826a7e3dce.js");
  }, []);

  return (
    <ApasShell
      title={TITLE}
      canonical="/my-home-apas-lp/thank-you"
      styles={STYLES}
      html={html}
      onReady={onReady}
    />
  );
}

MyHomeApasThankYou.getLayout = (page) => page;
MyHomeApasThankYou.formPage = true;
MyHomeApasThankYou.ownFloatingActions = true;
MyHomeApasThankYou.preventChatAutoLaunch = true;

export async function getStaticProps() {
  const html = fs.readFileSync(path.join(process.cwd(), "content/apas-lp/thank-you.html"), "utf8");
  return { props: { html } };
}
