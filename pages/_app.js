import ScrollToTop from "@/components/common/ScrollToTop";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import "@/styles/globals.css";
import { useRouter } from "next/router";

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

  return <>{getLayout(<Component {...pageProps} />, router)}</>;
}
