import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, ScrollTrigger } from "@/lib/gsapSetup";
import { getHeaderData, mediaUrl } from "@/lib/strapi";

const FALLBACK_NAV_ITEMS = [
  { label: "About Us", href: "/about-us" },
  { label: "Our Projects", href: "/projects" },
  { label: "Verticals", href: "#verticals" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Career", href: "#footer" },
  { label: "CSR", href: "#footer" },
  { label: "NRI", href: "/nri" },
  { label: "Blogs", href: "/blogs" },
  { label: "News & Media", href: "/news" },
];

const FALLBACK_LOGO = "/assets/myhome/logo.svg";

export default function MyHomeHeader() {
  const headerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // CMS-driven config; fetched client-side once on mount. Falls back to
  // the hardcoded list above when Strapi is unreachable.
  const [cms, setCms] = useState(null);
  useEffect(() => {
    let alive = true;
    getHeaderData().then((data) => {
      if (alive && data) setCms(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  // While the drawer is open on mobile, freeze the page behind it. Scoped to
  // <md so desktop behaviour is untouched; Lenis owns scrolling, so it has to
  // be stopped alongside the native overflow lock.
  useEffect(() => {
    if (!open) return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.__lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const NAV_ITEMS =
    Array.isArray(cms?.navItems) && cms.navItems.length > 0
      ? cms.navItems.map((n) => ({
          label: n.label,
          href: n.href,
          openInNewTab: !!n.openInNewTab,
        }))
      : FALLBACK_NAV_ITEMS;
  const LOGO = mediaUrl(cms?.logo) || FALLBACK_LOGO;
  const MENU_LABEL = cms?.menuLabel || "Menu";
  const CONTACT_CTA_LABEL = cms?.contactCtaLabel || "Contact Us";
  const CONTACT_CTA_LINK = cms?.contactCtaLink || "/contact-us";

  useGSAP(() => {
    registerGsap();

    // Wait for hero loader to finish before sliding header in.
    gsap.set(headerRef.current, { yPercent: -110, autoAlpha: 0 });

    let revealed = false;
    let hidden = false;
    let lastY = typeof window !== "undefined" ? window.scrollY : 0;

    const slideIn = () => {
      revealed = true;
      hidden = false;
      gsap.to(headerRef.current, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 1.0,
        ease: "expo.out",
      });
    };

    // If no hero (other pages) or event missed, fall back to a delay.
    const fallback = window.setTimeout(slideIn, 4200);
    const onDone = () => {
      window.clearTimeout(fallback);
      slideIn();
    };
    window.addEventListener("mh:loader-done", onDone);

    const hideHeader = () => {
      if (hidden) return;
      hidden = true;
      gsap.to(headerRef.current, {
        yPercent: -110,
        autoAlpha: 0,
        duration: 0.45,
        ease: "power2.out",
        overwrite: true,
      });
    };

    const showHeader = () => {
      if (!hidden) return;
      hidden = false;
      gsap.to(headerRef.current, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.5,
        ease: "expo.out",
        overwrite: true,
      });
    };

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);

      if (!revealed) {
        lastY = y;
        return;
      }

      const delta = y - lastY;
      if (y <= 10) {
        showHeader();
      } else if (delta > 6) {
        hideHeader();
      } else if (delta < -6) {
        showHeader();
      }
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener("mh:loader-done", onDone);
      window.removeEventListener("scroll", onScroll);
    };
  });

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-[60] transition-all duration-500 ${
          scrolled
            ? "bg-[#2a2828]/90 backdrop-blur-md border-b border-white/10"
            : "bg-white/10 backdrop-blur-[6px] border-b border-white/30"
        }`}
      >
        <div className="relative h-[66px] md:h-[80px] lg:h-[5.77vw] flex items-center px-5 md:px-10 lg:px-[8.333vw]">
          {/* ===== Mobile (<md): logo LEFT, Menu RIGHT (matches Figma 3189:5437) ===== */}
          <Link href="/" className="md:hidden block">
            <Image
              src={LOGO}
              alt="My Home Group"
              width={137}
              height={72}
              priority
              unoptimized
              className="w-[70px] h-auto select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            />
          </Link>

          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="md:hidden ml-auto flex h-[42px] w-[42px] items-center justify-center text-white
                       bg-white/10 backdrop-blur-md border border-white/25 rounded-full
                       shadow-[0_2px_10px_rgba(0,0,0,0.18)]
                       active:scale-95 active:bg-white/20 transition-all duration-300"
          >
            <span className="flex flex-col items-center gap-[5px] w-[18px]">
              <span className="block h-[1.5px] w-full rounded-full bg-white" />
              <span className="block h-[1.5px] w-full rounded-full bg-white" />
              <span className="block h-[1.5px] w-[60%] mr-auto rounded-full bg-white" />
            </span>
          </button>

          {/* ===== Desktop (md+): Menu LEFT, Logo CENTER, Contact RIGHT ===== */}
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen(true)}
            className="hidden md:flex group items-center gap-3 lg:gap-[0.781vw] text-white
                       bg-white/10 backdrop-blur-md border border-white/20 rounded-full
                       px-[18px] py-[10px] lg:px-[1.042vw] lg:py-[0.625vw]
                       hover:bg-white/20 transition-colors duration-300"
          >
            <span className="relative flex flex-col gap-[3px] w-[24px] lg:w-[1.459vw] h-[12px] justify-center">
              <span className="block h-[1.5px] w-full bg-white transition-transform duration-500 group-hover:translate-y-[1px]" />
              <span className="block h-[1.5px] w-[70%] bg-white transition-all duration-500 group-hover:w-full" />
              <span className="block h-[1.5px] w-full bg-white transition-transform duration-500 group-hover:-translate-y-[1px]" />
            </span>
          </button>

          <Link
            href="/"
            className="hidden md:block absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
          >
            <Image
              src={LOGO}
              alt="My Home Group"
              width={137}
              height={72}
              priority
              unoptimized
              className="w-[100px] lg:w-[7.135vw] h-auto select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            />
          </Link>

          <Link
            href={CONTACT_CTA_LINK}
            className="hidden md:inline-flex ml-auto items-center font-montserrat font-medium capitalize text-white text-[14px] lg:text-[0.833vw] tracking-[0.08em] relative group
                       bg-white/10 backdrop-blur-md border border-white/20 rounded-full
                       px-[20px] py-[10px] lg:px-[1.302vw] lg:py-[0.625vw]
                       hover:bg-white/20 transition-colors duration-300"
          >
            <span>{CONTACT_CTA_LABEL}</span>
            <span className="ml-2 block w-0 h-px bg-white transition-all duration-500 group-hover:w-6" />
          </Link>
        </div>
      </header>

      {/* Slide-in mega menu */}
      <div
        className={`fixed inset-0 z-[80] pointer-events-none ${
          open ? "pointer-events-auto" : ""
        }`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black transition-opacity duration-500 ${
            open ? "opacity-60 backdrop-blur-[2px] md:backdrop-blur-none" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute top-0 right-0 h-full flex flex-col overflow-hidden
                      w-[88%] max-w-[360px] rounded-l-[24px] shadow-[-20px_0_60px_rgba(0,0,0,0.45)]
                      sm:w-[440px] sm:max-w-none md:rounded-none md:shadow-none
                      bg-[#2a2828] text-white transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Soft brand glow — mobile only, keeps the tall panel from reading flat */}
          <span
            aria-hidden
            className="md:hidden pointer-events-none absolute -bottom-24 -right-16 h-[260px] w-[260px] rounded-full bg-mh-red/20 blur-[80px]"
          />

          <div className="relative flex items-center justify-between shrink-0 px-6 pt-[max(20px,env(safe-area-inset-top))] pb-5 border-b border-white/10 md:border-0 md:px-12 md:py-8">
            <Image
              src={LOGO}
              alt="My Home Group"
              width={110}
              height={58}
              unoptimized
              className="h-auto w-[76px] md:w-[100px]"
            />
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center active:scale-95 hover:bg-mh-red hover:border-mh-red transition-all duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          <nav className="relative flex-1 overflow-y-auto overscroll-contain px-6 py-4 flex flex-col gap-1 md:flex-none md:overflow-visible md:px-12 md:py-6">
            {NAV_ITEMS.map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                target={item.openInNewTab ? "_blank" : undefined}
                rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                onClick={() => setOpen(false)}
                className="group inline-flex items-center justify-between border-b border-white/10 py-[14px] md:py-[10px] font-tartuffo text-[20px] md:text-[22px] capitalize tracking-wide active:text-mh-red hover:text-mh-red transition-colors duration-500"
                style={{
                  transitionDelay: open ? `${0.1 + i * 0.04}s` : "0s",
                  transform: open ? "translateX(0)" : "translateX(30px)",
                  opacity: open ? 1 : 0,
                  transitionProperty: "opacity, transform, color",
                  transitionDuration: "0.7s",
                  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <span>{item.label}</span>
                <span className="text-white/35 md:opacity-0 md:-translate-x-2 md:text-inherit group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-inherit transition-all duration-500">
                  →
                </span>
              </Link>
            ))}
          </nav>

          {/* Mobile-only footer CTA — the mobile header has no Contact button */}
          <div className="md:hidden relative shrink-0 px-6 pt-4 pb-[max(20px,env(safe-area-inset-bottom))] border-t border-white/10">
            <Link
              href={CONTACT_CTA_LINK}
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center rounded-full bg-mh-red py-[14px] font-montserrat text-[14px] font-medium capitalize tracking-[0.08em] text-white active:scale-[0.98] transition-transform duration-300"
            >
              {CONTACT_CTA_LABEL}
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
