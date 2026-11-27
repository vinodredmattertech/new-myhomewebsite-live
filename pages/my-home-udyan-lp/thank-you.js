import fs from "fs";
import path from "path";
import { useCallback } from "react";
import UdyanShell from "../../components/udyan-lp/UdyanShell";
import { captureUtm } from "@/lib/utm";

const TITLE = "Thank You | My Home Udyan | Apartments in Tellapur";
const STYLES = [
  "/my-home-udyan-lp/assets/vendor/bootstrap.min.css",
  "/my-home-udyan-lp/assets/css/app.css",
];

function startUdyanBrochureDownload() {
  try {
    const raw = window.sessionStorage.getItem("udyan-lp-brochure");
    if (!raw) return;
    window.sessionStorage.removeItem("udyan-lp-brochure");
    const data = JSON.parse(raw);
    if (!data?.href) return;
    const link = document.createElement("a");
    link.href = data.href;
    link.download = data.name || "My Home Udyan Brochure.pdf";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    /* ignore download errors */
  }
}

export default function MyHomeUdyanThankYou({ html }) {
  const onReady = useCallback(() => {
    // Keep UTM stash if thank-you was opened with campaign params.
    captureUtm();
    startUdyanBrochureDownload();
  }, []);

  return (
    <UdyanShell
      title={TITLE}
      canonical="/my-home-udyan-lp/thank-you"
      styles={STYLES}
      html={html}
      onReady={onReady}
    />
  );
}

MyHomeUdyanThankYou.getLayout = (page) => page;
MyHomeUdyanThankYou.formPage = true;
MyHomeUdyanThankYou.ownFloatingActions = true;
MyHomeUdyanThankYou.preventChatAutoLaunch = true;

export async function getStaticProps() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "content/udyan-lp/thank-you.html"),
    "utf8"
  );
  return { props: { html } };
}
