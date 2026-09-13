import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { Play, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { mediaUrl } from "@/lib/strapi";

const RED = "#ef493d";
const TARTUFFO =
  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif';

/**
 * Card categories and filter values are typed by hand in the CMS, so they
 * rarely match character-for-character ("Recruitment Drive" vs
 * "recruitment drive"). Compare on a slug instead of the raw string.
 */
function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Normalise a raw workplace card into the flat shape the UI consumes. */
function normaliseCard(raw, idx) {
  return {
    id: raw?.id ?? `${raw?.category || "card"}-${idx}`,
    title: raw?.title || "",
    category: slugify(raw?.category) || "all",
    image:
      mediaUrl(raw?.image) ||
      (typeof raw?.image === "string" ? raw.image : null),
  };
}

/**
 * CareerWorkplace — "More Than a Workplace" (Inside My Home) gallery (Career
 * page, section 3).
 *
 * Layout mirrors the Figma design: a vertical "Inside My Home" side-label, a
 * centred serif heading, a wide featured image with a circular play button, a
 * single bordered filter bar (the active tab filled red, "All" prefixed with a
 * check) and a 4-up row of tall photo cards with side navigation arrows.
 *
 * Driven entirely by the `workplace` component on the Career single type —
 * nothing is invented locally, so an empty CMS section renders no tabs and no
 * cards rather than placeholder content.
 */
export default function CareerWorkplace({ section }) {
  const sideLabel = section?.sideLabel || "Inside My Home";
  const heading = section?.heading || "More Than a Workplace";
  const featuredImage = mediaUrl(section?.featuredImage);
  const videoUrl = section?.videoUrl || "";

  const items = useMemo(() => {
    const raw = Array.isArray(section?.cards) ? section.cards : [];
    return raw.map(normaliseCard).filter((c) => c.image);
  }, [section]);

  const tabs = useMemo(() => {
    const defined = Array.isArray(section?.filters) ? section.filters : [];
    const mapped = defined
      // `value` is optional in the CMS — fall back to the label so a filter
      // that only has a label still works.
      .map((f) => ({ value: slugify(f?.value || f?.label), name: f?.label || "" }))
      .filter((f) => f.value && f.name);

    // No filters authored → no tab bar at all.
    if (!mapped.length) return [];

    // The CMS list holds only the real categories, so supply the "All" tab
    // that the design leads with unless an editor already added one.
    return mapped.some((t) => t.value === "all")
      ? mapped
      : [{ value: "all", name: "All" }, ...mapped];
  }, [section]);

  const [active, setActive] = useState("all");

  const visible = useMemo(() => {
    // Guard against an `active` tab that no longer exists (CMS edit) — fall
    // back to showing everything instead of an empty row.
    const known = active === "all" || tabs.some((t) => t.value === active);
    if (!known || active === "all") return items;
    return items.filter((i) => i.category === active || i.category === "all");
  }, [items, active, tabs]);

  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const scrollByCards = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9 * (dir === "next" ? 1 : -1);
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Is there anywhere to scroll to? The row is a plain overflow-x track, so
  // this is measured (content wider than its viewport) rather than derived
  // from a card count — the card count that fills a row differs per
  // breakpoint (4-up on desktop, ~1 on mobile), and a filter tab that
  // matches only a few cards leaves nothing to scroll. Re-runs on every
  // change of `visible`, so switching tabs re-evaluates it.
  const [canScroll, setCanScroll] = useState(false);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    // 1px of slack: sub-pixel layout rounding can leave scrollWidth a
    // hair above clientWidth with nothing actually clipped.
    const measure = () => setCanScroll(el.scrollWidth - el.clientWidth > 1);
    measure();
    const ro =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    ro?.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [visible]);

  // A tab change swaps the card set underneath a track that keeps whatever
  // scroll offset the previous tab was left at, so the new tab would open
  // part-way along its row — or past its end, when the new tab has fewer
  // cards. Send it back to the first card.
  //
  // `scroll-smooth` on the track would animate that jump; it is suspended
  // for the reset so the row is already at the start as the new cards
  // appear, rather than gliding there afterwards.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const previous = el.style.scrollBehavior;
    el.style.scrollBehavior = "auto";
    el.scrollLeft = 0;
    el.style.scrollBehavior = previous;
  }, [active]);

  useGSAP(
    () => {
      registerGsap();
      gsap.registerPlugin(ScrollTrigger);
      const targets = rootRef.current?.querySelectorAll("[data-reveal]");
      if (targets?.length) {
        gsap.from(targets, {
          y: 40,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 82%" },
        });
      }
    },
    { scope: rootRef }
  );

  // Nothing authored for this section at all — render nothing rather than a
  // bare heading over empty space.
  if (!section) return null;

  return (
    <section
      ref={rootRef}
      data-section="career-workplace"
      className="relative w-full overflow-hidden bg-white text-[#333]
                 pt-[30px] pb-[26px] lg:pt-[3.646vw] lg:pb-[5.208vw]"
    >
      {/* Vertical side label */}
      <div
        className="lg:absolute z-[5] flex flex-col items-center
                   left-[8px] top-[-10px] w-[18px] gap-[10px]
                   lg:left-[4.166vw] lg:top-[3.646vw] lg:w-[2.812vw] lg:gap-[1.094vw] max-lg:static max-lg:!w-full max-lg:flex-row max-lg:!justify-center max-lg:items-center max-lg:!gap-[8px] max-lg:mt-[15px] max-lg:mb-[18px]"
        style={{ color: RED }}
      >
        <span className="block w-px h-[26px] lg:h-[3.125vw] max-lg:!w-[28px] max-lg:!h-px" style={{ background: RED }} />
        <span
          className="font-medium capitalize whitespace-nowrap text-[11px] lg:text-[1.25vw] max-lg:[writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] lg:rotate-180"
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {sideLabel}
        </span>
      </div>

      {/* Heading */}
      <h2
        data-reveal
        className="text-center capitalize leading-[1.1] tracking-[0.02em] px-5
                   text-[30px] xs:text-[36px] sm:text-[48px] md:text-[60px] lg:text-[3.438vw]"
        style={{ fontFamily: TARTUFFO, fontWeight: 300 }}
      >
        {heading}
      </h2>

      {/* Featured image + play — omitted entirely when the CMS has no image */}
      {featuredImage && (
        <div data-reveal className="mt-[28px] lg:mt-[2.5vw] px-5 md:px-10 lg:px-[8.333vw]">
          <a
            href={videoUrl || undefined}
            target={videoUrl ? "_blank" : undefined}
            rel={videoUrl ? "noopener noreferrer" : undefined}
            className={`group relative block w-full overflow-hidden rounded-[8px] lg:rounded-[0.417vw] aspect-[1616/725] ${
              videoUrl ? "cursor-pointer" : "cursor-default"
            }`}
            aria-label={videoUrl ? "Play video" : undefined}
          >
            <Image
              src={featuredImage}
              alt={heading}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 84vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-black/20" />
            {videoUrl && (
              <span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full
                           w-[56px] h-[40px] lg:w-[4.125vw] lg:h-[2.719vw] transition-transform duration-300 group-hover:scale-110"
                style={{ background: RED }}
              >
                <Play className="w-[18px] h-[18px] lg:w-[1.125vw] lg:h-[1.125vw] text-white" fill="currentColor" />
              </span>
            )}
          </a>
        </div>
      )}

      {/* Filter tabs — CMS-driven only; hidden when nothing is authored */}
      {tabs.length > 0 && (
        <div data-reveal className="mt-[28px] lg:mt-[2.5vw] flex justify-center px-5">
          <div
            className="flex flex-wrap lg:flex-nowrap justify-center items-stretch
                       border border-[#e7e7e7] max-w-full h-auto lg:h-[3.854vw] max-sm:p-[8px] max-sm:gap-[8px]"
          >
            {tabs.map((t) => {
              const isActive = active === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setActive(t.value)}
                  aria-pressed={isActive}
                  className={`flex items-center justify-center gap-[8px] lg:gap-[0.521vw] lg:shrink-0 capitalize
                              transition-colors duration-300
                              px-[14px] sm:px-[20px] lg:px-[1.146vw]
                              py-[10px] sm:py-[12px] lg:py-0
                              text-[13px] sm:text-[15px] lg:text-[1.042vw]
                              ${
                                isActive
                                  ? "bg-[#ef493d] text-white"
                                  : "bg-transparent text-[#454545] hover:text-[#ef493d]"
                              }`}
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {isActive && (
                    <Check className="w-[16px] h-[16px] lg:w-[1.042vw] lg:h-[1.042vw]" strokeWidth={2.5} />
                  )}
                  <span className="whitespace-nowrap">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cards row */}
      {visible.length > 0 && (
        <div data-reveal className="relative mt-[36px] lg:mt-[3.125vw] px-5 md:px-10 lg:px-[7.865vw]">
          {canScroll && (
            <>
              <button
                type="button"
                onClick={() => scrollByCards("prev")}
                aria-label="Previous"
                className="hidden lg:flex absolute z-[5] left-[2.604vw] top-1/2 -translate-y-1/2
                           items-center justify-center rounded-full border border-black/15 bg-white
                           w-[3.646vw] h-[3.646vw] text-[#333]
                           hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white transition-colors duration-300"
              >
                <ChevronLeft className="w-[1.25vw] h-[1.25vw]" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => scrollByCards("next")}
                aria-label="Next"
                className="hidden lg:flex absolute z-[5] right-[2.604vw] top-1/2 -translate-y-1/2
                           items-center justify-center rounded-full border border-black/15 bg-white
                           w-[3.646vw] h-[3.646vw] text-[#333]
                           hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white transition-colors duration-300"
              >
                <ChevronRight className="w-[1.25vw] h-[1.25vw]" strokeWidth={1.5} />
              </button>
            </>
          )}

          <div
            ref={trackRef}
            className="flex gap-[18px] lg:gap-[1.823vw] overflow-x-auto scroll-smooth snap-x snap-mandatory pb-[8px]
                       [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {visible.map((c) => (
              <article
                key={c.id}
                className="snap-start shrink-0 flex flex-col items-center gap-[18px] lg:gap-[1.563vw]
                           w-[78%] sm:w-[46%] lg:w-[calc((100%-5.469vw)/4)]"
              >
                <div className="relative w-full overflow-hidden rounded-[6px] lg:rounded-[0.313vw] aspect-[378/492]">
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 20vw"
                    className="object-cover object-center"
                  />
                </div>
                <p
                  className="text-center text-[#454545] text-[20px] sm:text-[24px] lg:text-[1.563vw]"
                  style={{ fontFamily: TARTUFFO, fontWeight: 400 }}
                >
                  {c.title}
                </p>
              </article>
            ))}
          </div>

          {/* mobile nav arrows */}
          {canScroll && (
            <div className="mt-[20px] flex lg:hidden items-center justify-center gap-[12px]">
              <button
                type="button"
                onClick={() => scrollByCards("prev")}
                aria-label="Previous"
                className="inline-flex items-center justify-center rounded-full border border-black/15
                           w-[40px] h-[40px] text-[#333] hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white transition-colors"
              >
                <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => scrollByCards("next")}
                aria-label="Next"
                className="inline-flex items-center justify-center rounded-full border border-black/15
                           w-[40px] h-[40px] text-[#333] hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white transition-colors"
              >
                <ChevronRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
