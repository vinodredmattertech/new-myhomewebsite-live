import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * Sticky in-page section nav for the project detail page.
 *
 * Sits in normal flow directly under the detail banner and pins itself just
 * below the fixed site header once scrolled to; scrolling back up releases it
 * naturally into the flow.
 *
 * Two site-specific behaviours it has to cooperate with:
 *
 * 1. `Header.jsx` auto-hides on scroll-down (GSAP `yPercent: -110`) and
 *    reveals on scroll-up. A hardcoded `top: headerHeight` would therefore
 *    leave a gap once the header slides away, so the pin offset tracks the
 *    header's live `getBoundingClientRect().bottom` each frame instead. This
 *    needs no changes to Header.jsx.
 * 2. `SmoothScroll.js` runs Lenis over the whole layout. Native
 *    `scrollIntoView({behavior:'smooth'})` fights it, so tab clicks go through
 *    `window.__lenis.scrollTo` when available, with a native fallback.
 *
 * Only sections that actually rendered are passed in, so a tab can never point
 * at a section the CMS left empty. Renders nothing below two sections.
 */
export default function ProjectSectionNav({ sections = [] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? null);
  // The bar retracts once scrolled past the last tabbed section, so it never
  // hangs over the untabbed Brochure/Inquiry sections or the footer.
  const [past, setPast] = useState(false);
  const navRef = useRef(null);
  const scrollerRef = useRef(null);
  const tabRefs = useRef({});
  // Suppresses spy updates while a click-driven scroll is in flight, so the
  // sections passed on the way to the target don't flash as active.
  const lockRef = useRef(false);
  const lockTimer = useRef(null);

  const getHeaderBottom = () => {
    const header = document.querySelector("header");
    if (!header) return 0;
    return Math.max(0, header.getBoundingClientRect().bottom);
  };

  const syncFrame = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Follow the auto-hiding header so the bar stays flush against it.
    nav.style.top = `${getHeaderBottom()}px`;

    if (!sections.length) return;

    const line = nav.getBoundingClientRect().bottom + 8;

    // Retract once the last tabbed section has fully scrolled past.
    const lastEl = document.getElementById(sections[sections.length - 1].id);
    setPast(
      lastEl ? lastEl.getBoundingClientRect().bottom < line : false
    );

    if (lockRef.current) return;

    // A short trailing section may never cross the line, so pin the last tab
    // once the page bottom is reached.
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;
    if (atBottom) {
      setActiveId(sections[sections.length - 1].id);
      return;
    }

    let current = sections[0].id;
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el && el.getBoundingClientRect().top <= line) current = s.id;
    }
    setActiveId(current);
  }, [sections]);

  useEffect(() => {
    let frame = null;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        syncFrame();
      });
    };

    syncFrame();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Lenis drives scroll without always emitting native scroll events at the
    // same cadence; subscribe when it is available.
    const lenis = window.__lenis;
    lenis?.on?.("scroll", onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      lenis?.off?.("scroll", onScroll);
    };
  }, [syncFrame]);

  // Keep the active tab within view of the horizontal strip on mobile.
  // Scrolls the strip only — never the page.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const tab = tabRefs.current[activeId];
    if (!scroller || !tab) return;

    const target =
      tab.offsetLeft - scroller.clientWidth / 2 + tab.offsetWidth / 2;
    scroller.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [activeId]);

  useEffect(() => () => clearTimeout(lockTimer.current), []);

  const handleClick = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    setActiveId(id);
    lockRef.current = true;
    clearTimeout(lockTimer.current);
    lockTimer.current = setTimeout(() => {
      lockRef.current = false;
      syncFrame();
    }, 1000);

    const header = document.querySelector("header");
    const offset =
      (header?.offsetHeight || 0) + (navRef.current?.offsetHeight || 0);

    const lenis = window.__lenis;
    if (lenis?.scrollTo) {
      lenis.scrollTo(el, { offset: -offset });
    } else {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - offset,
        behavior: "smooth",
      });
    }
  };

  if (sections.length < 2) return null;

  return (
    <nav
      ref={navRef}
      aria-label="Project sections"
      aria-hidden={past ? "true" : undefined}
      className={`sticky top-[66px] md:top-[80px] lg:top-[5.77vw] z-[50]
                  w-full bg-[#f5f1eb] border-b border-black/10
                  transition-[opacity,transform] duration-300 ease-premium
                  ${
                    past
                      ? "opacity-0 -translate-y-full pointer-events-none"
                      : "opacity-100 translate-y-0"
                  }`}
    >
      <div
        ref={scrollerRef}
        className="flex items-stretch gap-[22px] md:gap-[34px] lg:gap-[2.4vw]
                   overflow-x-auto px-5 md:px-10 lg:px-[8.333vw]
                   [scrollbar-width:none] [-ms-overflow-style:none]
                   [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((s) => {
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              ref={(node) => {
                tabRefs.current[s.id] = node;
              }}
              onClick={() => handleClick(s.id)}
              aria-current={isActive ? "true" : undefined}
              className={`relative shrink-0 whitespace-nowrap font-[700] uppercase
                          tracking-[0.12em] transition-colors duration-300
                          text-[11px] md:text-[12px] lg:text-[0.833vw]
                          py-[18px] md:py-[20px] lg:py-[1.25vw]
                          ${
                            isActive
                              ? "text-[#ef493d]"
                              : "text-mh-grey hover:text-mh-dark"
                          }`}
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {s.label}
              <span
                aria-hidden="true"
                className={`absolute left-0 right-0 bottom-0 h-[2px] bg-[#ef493d]
                            transition-transform duration-300 ease-premium
                            ${isActive ? "scale-x-100" : "scale-x-0"}`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
