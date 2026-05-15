import { useEffect } from "react";
import { useRouter } from "next/router";

const ScrollToTop = () => {
  const router = useRouter();

  // Disable browser scroll restoration
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Scroll on initial load + route change
  useEffect(() => {
    const scrollToTop = () => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    };

    // Initial load / reload
    scrollToTop();

    // After navigation / redirect
    router.events.on("routeChangeComplete", scrollToTop);

    return () => {
      router.events.off("routeChangeComplete", scrollToTop);
    };
  }, [router]);

  return null;
};

export default ScrollToTop;
