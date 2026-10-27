import LiveServChat from "@/components/common/LiveServChat";
import ScrollToTop from "@/components/common/ScrollToTop";
import ProjectFloatingActions from "@/components/myhome/projects/ProjectFloatingActions";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import "@/styles/globals.css";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { captureUtm } from "@/lib/utm";

// The legacy components/layout Header + Footer belong to an older template and
// read a Strapi schema this project no longer has, so any page falling back to
// them crashed. MyHomeLayout is the site's real chrome.
const defaultLayout = (page) => (
  <MyHomeLayout>
    <ScrollToTop />
    {page}
  </MyHomeLayout>
);

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const getLayout = Component.getLayout || defaultLayout;

  // Stash campaign params from the landing URL — they are gone by the time
  // the visitor reaches a form, and every lead push needs them.
  useEffect(() => {
    captureUtm();
  }, [router.asPath]);

  // Form pages (Component.formPage) drop the chat bot and the sticky Request
  // Site Visit. Once loaded the chat widget stays in <body> across client-side
  // navigation, so it is hidden via CSS as well as never loaded when a form
  // page is the landing page.
  const formPage = !!Component.formPage;
  useEffect(() => {
    document.documentElement.toggleAttribute("data-hide-chat", formPage);
  }, [formPage]);

  return (
    <>
      {getLayout(<Component {...pageProps} />, router)}
      {/* Outside getLayout so these still mount on pages that replace the
          default chrome with their own layout. Pages that render their own
          project-specific actions (project detail) opt out of the generic
          sticky Request Site Visit. */}
      {!Component.ownFloatingActions && !formPage && <ProjectFloatingActions />}
      {!formPage && <LiveServChat />}
    </>
  );
}
