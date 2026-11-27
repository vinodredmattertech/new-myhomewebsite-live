import fs from "fs";
import path from "path";
import { useCallback } from "react";
import AvaliShell from "../../components/avali-lp/AvaliShell";
import { captureUtm } from "@/lib/utm";

const TITLE = "Thank You | My Home Avali | Luxury Apartments in Gopanpally";
const STYLES = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css",
  "/my-home-avali-lp/assests/style.css",
];

function startAvaliBrochureDownload() {
  try {
    const raw = window.sessionStorage.getItem("avali-lp-brochure");
    if (!raw) return;
    window.sessionStorage.removeItem("avali-lp-brochure");
    const data = JSON.parse(raw);
    if (!data?.href) return;
    const link = document.createElement("a");
    link.href = data.href;
    link.download = data.name || "My Home Avali Brochure.pdf";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    /* ignore download errors */
  }
}

export default function MyHomeAvaliThankYou({ html }) {
  const onReady = useCallback(() => {
    captureUtm();
    startAvaliBrochureDownload();
  }, []);

  return (
    <AvaliShell
      title={TITLE}
      canonical="/my-home-avali-lp/thank-you"
      styles={STYLES}
      html={html}
      onReady={onReady}
    />
  );
}

MyHomeAvaliThankYou.getLayout = (page) => page;
MyHomeAvaliThankYou.formPage = true;
MyHomeAvaliThankYou.ownFloatingActions = true;
MyHomeAvaliThankYou.preventChatAutoLaunch = true;

export async function getStaticProps() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "content/avali-lp/thank-you.html"),
    "utf8"
  );
  return { props: { html } };
}
