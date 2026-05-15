import ScrollToTop from "@/components/common/ScrollToTop";
import SmoothScroll from "@/components/common/SmoothScroll";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import "@/styles/globals.css";
import { useRouter } from "next/router";

const defaultLayout = (page, router) => (
  <SmoothScroll>
    <ScrollToTop />
    {router.pathname !== "/" && <Header />}
    {page}
    {router.pathname !== "/" && <Footer />}
  </SmoothScroll>
);

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const getLayout =
    Component.getLayout || ((page) => defaultLayout(page, router));

  return <>{getLayout(<Component {...pageProps} />, router)}</>;
}
