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
  { label: "Careers", href: "/careers" },
  { label: "CSR", href: "/csr" },
  { label: "NRI", href: "/nri" },
  { label: "Blogs", href: "/blogs" },
  { label: "News & Media", href: "/news" },
  { label: "Investors", href: "/investors" },
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

  // On desktop the page scrolls behind the open menu (mobile is scroll-locked
  // above). Close the panel on real scroll so the mega menu doesn't hang over
  // content the visitor has scrolled to. Only the native
  // `scroll` event is used (not `wheel`): a click never changes scroll
  // position, whereas a stray wheel tick would close the panel the instant it
  // opens — which read as "needs a double click". Attach is deferred a beat so
  // the opening gesture can't trip it.
  useEffect(() => {
    if (!open) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;

    const close = () => setOpen(false);
    const id = window.setTimeout(() => {
      window.addEventListener("scroll", close, { passive: true });
    }, 150);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("scroll", close);
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

  // Group the flat nav list into labelled columns (matches the mega-menu
  // reference). hrefs/openInNewTab are resolved from the CMS-or-fallback list
  // by label so CMS-driven links keep working; second arg is the fallback.
  const resolveNav = (label, fallback) => {
    const found = NAV_ITEMS.find(
      (n) =>
        n.label?.toLowerCase() === label.toLowerCase() ||
        (label.toLowerCase().startsWith("career") && n.label?.toLowerCase().startsWith("career"))
    );
    return { label: found?.label || label, href: found?.href || fallback, openInNewTab: !!found?.openInNewTab };
  };
  // "Home" leads both columns. Routed through resolveNav so a CMS-defined
  // "Home" nav item (href / open-in-new-tab) still wins over the "/" fallback.
  const NAV_GROUPS = [
    {
      heading: "Our Company",
      items: [
        resolveNav("Home", "/"),
        resolveNav("About Us", "/about-us"),
        resolveNav("Our Projects", "/projects"),
        resolveNav("NRI", "/nri"),
        resolveNav("CSR", "/csr"),
      ],
    },
    {
      heading: "Quick Links",
      items: [
   
        resolveNav("Blogs", "/blogs"),
        resolveNav("News & Media", "/news"),
        resolveNav("Testimonials", "/testimonials"),
        resolveNav("Careers", "/careers"),
        resolveNav("Awards", "/awards"),
        resolveNav("Sustainability", "/sustainability"),
        resolveNav("Investors", "/investors"),
      ],
    },
  ];

  useGSAP((context, contextSafe) => {
    registerGsap();

    // Start hidden; the reveal is driven by the hero loader when one exists.
    gsap.set(headerRef.current, { yPercent: -110, autoAlpha: 0 });

    // contextSafe keeps this tween in the header's own context. On the
    // homepage it runs from HeroBanner's `mh:loader-done` timeline callback,
    // and GSAP files anything created in a callback under the context of the
    // animation that fired it — so the tween became HeroBanner's, and leaving
    // the homepage reverted it with HeroBanner, hiding the header on every
    // page reached by client-side navigation from home.
    const slideIn = contextSafe(() => {
      gsap.to(headerRef.current, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 1.0,
        ease: "expo.out",
      });
    });

    // Only the homepage hero renders a loader overlay, and only that overlay
    // fires `mh:loader-done`. Every other page has none, so waiting on the
    // event left the header hidden until the 4.2s safety timer expired —
    // ~6s before it was fully on screen. Reveal immediately when there is no
    // loader to wait for, and keep the timer purely as a safety net for the
    // homepage in case the loader timeline never reaches its dispatch.
    const loader = document.querySelector("[data-mh-loader]");

    let fallback;
    const onDone = () => {
      window.clearTimeout(fallback);
      slideIn();
    };

    if (loader) {
      fallback = window.setTimeout(slideIn, 4200);
      window.addEventListener("mh:loader-done", onDone);
    } else {
      slideIn();
    }

    // The header stays pinned once revealed — scrolling only swaps its
    // background treatment (transparent over the hero, solid once past it).
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
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
      {/* At rest the header carries no solid fill — just a soft top-down scrim
          that fades to nothing, so the banner image runs behind it with no
          visible edge. The previous white/10 + blur + white/30 border lifted
          the top 67px ~10% brighter and capped it with a bright hairline,
          which read as a grey bar above the content on every page with a dark
          banner (the homepage hid it only because its hero slide is white).
          The scrim keeps the white logo legible on light banners, where a
          fully transparent header would leave it low-contrast.
          The scrolled separator is a 1px shadow rather than a border so the
          bar stays exactly 66px tall in both states and nothing shifts when
          `scrolled` flips. */}
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-[70] transition-all duration-500 ${scrolled
          ? "bg-[#2a2828]/90 backdrop-blur-md shadow-[0_1px_0_0_rgba(255,255,255,0.1)]"
          : "bg-gradient-to-b from-black/25 to-transparent"
          }`}
      >
        <div className="relative h-[66px] md:h-[80px] lg:h-[5.77vw] flex items-center px-5 md:px-10 lg:px-[8.333vw]">
          {/* ===== Mobile (<md): logo LEFT, Menu RIGHT (matches Figma 3189:5437) ===== */}
          <Link href="/" className="block md:hidden">
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
            onClick={() => setOpen((o) => !o)}
            className="md:hidden ml-auto flex h-[42px] w-[42px] items-center justify-center text-white
                       bg-white/10 backdrop-blur-md border border-white/25 rounded-full
                       shadow-[0_2px_10px_rgba(0,0,0,0.18)]
                       active:scale-95 active:bg-white/20 transition-all duration-300"
          >
            {open ? (
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            ) : (
              <span className="flex flex-col items-center gap-[5px] w-[18px]">
                <span className="block h-[1.5px] w-full rounded-full bg-white" />
                <span className="block h-[1.5px] w-full rounded-full bg-white" />
                <span className="block h-[1.5px] w-[60%] mr-auto rounded-full bg-white" />
              </span>
            )}
          </button>

          {/* ===== Desktop (md+): Menu LEFT, Logo CENTER, Contact RIGHT ===== */}
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="hidden md:flex group items-center gap-3 lg:gap-[0.781vw] text-white
                       bg-white/10 backdrop-blur-md border border-white/20 rounded-full
                       px-[18px] py-[10px] lg:px-[1.042vw] lg:py-[0.625vw]
                       hover:bg-white/20 transition-colors duration-300"
          >
            {open ? (
              <span className="relative flex items-center justify-center w-[24px] lg:w-[1.459vw] h-[12px]">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
            ) : (
              <span className="relative flex flex-col gap-[3px] w-[24px] lg:w-[1.459vw] h-[12px] justify-center">
                <span className="block h-[1.5px] w-full bg-white transition-transform duration-500 group-hover:translate-y-[1px]" />
                <span className="block h-[1.5px] w-[70%] bg-white transition-all duration-500 group-hover:w-full" />
                <span className="block h-[1.5px] w-full bg-white transition-transform duration-500 group-hover:-translate-y-[1px]" />
              </span>
            )}
            {/* <span className="font-montserrat text-[14px] lg:text-[0.833vw] tracking-[0.08em] capitalize">
              {MENU_LABEL}
            </span> */}
          </button>

          <Link
            href="/"
            className="absolute hidden -translate-x-1/2 -translate-y-1/2 md:block left-1/2 top-1/2"
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
            <span className="block w-0 h-px ml-2 transition-all duration-500 bg-white group-hover:w-6" />
          </Link>
        </div>
      </header>

      {/* Slide-down mega menu (full-width, drops from the top) */}
      <div
        className={`fixed inset-0 z-[55] pointer-events-none ${open ? "pointer-events-auto" : ""
          }`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black transition-opacity duration-500 ${open ? "opacity-60 backdrop-blur-[2px] md:backdrop-blur-none" : "opacity-0"
            }`}
        />
        {/*
          `data-lenis-prevent`: Lenis calls preventDefault() on every touchmove
          on the page while it is stopped (see the mobile scroll-freeze effect
          above), which otherwise kills swipe-scrolling inside this panel — only
          dragging the native scrollbar still worked. This is Lenis's opt-out for
          nested scrollers, and it is checked before the is-stopped branch, so
          touches anywhere in the drawer fall through to native scrolling.
        */}
        <aside
          data-lenis-prevent
          className={`absolute inset-x-0 top-0 overflow-hidden flex flex-col
                      h-screen md:h-auto
                      bg-[#2a2828] text-white shadow-[0_30px_60px_rgba(0,0,0,0.45)]
                      transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-y-0" : "-translate-y-full"
            }`}
        >
          {/* Spacer so content clears the fixed header bar above */}
          <div className="h-[66px] md:h-[80px] lg:h-[5.77vw]" />
          <div className="border-t border-white/10" />

          {/* Soft brand glow — keeps the wide panel from reading flat */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-16 h-[320px] w-[320px] rounded-full bg-mh-red/20 blur-[90px]"
          />

          <div className="relative flex flex-1 flex-col overflow-y-auto overscroll-contain px-5 md:px-10 lg:px-[8.333vw] py-10 md:py-14 lg:py-[3.5vw]">
            <div className="flex flex-col gap-10 md:flex-row md:gap-[6vw] lg:gap-[8vw]">
              {NAV_GROUPS.map((group, gi) => (
                <div key={group.heading} className="flex flex-col min-w-0">
                  <h3 className="font-montserrat text-[13px] lg:text-[0.833vw] uppercase tracking-[0.15em] text-white/40 mb-5 md:mb-[1.5vw]">
                    {group.heading}
                  </h3>
                  <ul className="flex flex-col gap-3 md:gap-[0.9vw]">
                    {group.items.map((item, i) => (
                      <li
                        key={item.label}
                        style={{
                          transitionDelay: open ? `${0.12 + (gi * 4 + i) * 0.05}s` : "0s",
                          transform: open ? "translateY(0)" : "translateY(-24px)",
                          opacity: open ? 1 : 0,
                          transitionProperty: "opacity, transform",
                          transitionDuration: "0.7s",
                          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                        }}
                      >
                        <Link
                          href={item.href}
                          target={item.openInNewTab ? "_blank" : undefined}
                          rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                          onClick={() => setOpen(false)}
                          className="group inline-flex items-center gap-2 font-tartuffo text-[20px] md:text-[22px] lg:text-[1.25vw] capitalize tracking-wide hover:text-mh-red active:text-mh-red transition-colors duration-500"
                        >
                          <span>{item.label}</span>
                          <span className="transition-all duration-500 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Mobile-only CTA — pinned to the bottom of the full-height panel */}
            <div className="mt-auto pt-10 md:hidden">
              <Link
                href={CONTACT_CTA_LINK}
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-full bg-mh-red py-[14px] font-montserrat text-[14px] font-medium capitalize tracking-[0.08em] text-white active:scale-[0.98] transition-transform duration-300"
              >
                {CONTACT_CTA_LABEL}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
