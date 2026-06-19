import React, { useMemo, useRef, useState } from "react";
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

const DEFAULT_FILTERS = [
  { label: "All", value: "all" },
  { label: "Recruitment Drive", value: "recruitment-drive" },
  { label: "Employee Engagement", value: "employee-engagement" },
  { label: "Team Outing", value: "team-outing" },
  { label: "Creativity", value: "creativity" },
  { label: "Fun Day", value: "fun-day" },
];

const DEFAULT_CARDS = [
  { title: "Recruitment Drive", category: "recruitment-drive", image: "/assets/myhome/whoweare-color.jpg" },
  { title: "Employee Engagement", category: "employee-engagement", image: "/assets/myhome/whoweare-color.jpg" },
  { title: "Learning & Development", category: "creativity", image: "/assets/myhome/whoweare-color.jpg" },
  { title: "Team Outings", category: "team-outing", image: "/assets/myhome/whoweare-color.jpg" },
];

/** Normalise a raw workplace card into the flat shape the UI consumes. */
function normaliseCard(raw, idx) {
  return {
    id: raw?.id ?? `${raw?.category || "card"}-${idx}`,
    title: raw?.title || "",
    category: raw?.category || "all",
    image:
      mediaUrl(raw?.image) ||
      (typeof raw?.image === "string" ? raw.image : null) ||
      "/assets/myhome/whoweare-color.jpg",
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
 * Driven by the `workplace` component on the Career single type; falls back to
 * built-in defaults so the section always renders.
 */
export default function CareerWorkplace({ section }) {
  const sideLabel = section?.sideLabel || "Inside My Home";
  const heading = section?.heading || "More Than a Workplace";
  const featuredImage =
    mediaUrl(section?.featuredImage) || "/assets/myhome/whoweare-color.jpg";
  const videoUrl = section?.videoUrl || "";

  const rawCards =
    Array.isArray(section?.cards) && section.cards.length
      ? section.cards
      : DEFAULT_CARDS;
  const items = useMemo(() => rawCards.map(normaliseCard), [rawCards]);

  const tabs = useMemo(() => {
    const defined = Array.isArray(section?.filters) ? section.filters : [];
    const source = defined.length ? defined : DEFAULT_FILTERS;
    return source
      .map((f) => ({ value: f?.value || "", name: f?.label || "" }))
      .filter((f) => f.value && f.name);
  }, [section]);

  const [active, setActive] = useState(tabs[0]?.value || "all");

  const visible = useMemo(() => {
    if (!active || active === "all") return items;
    return items.filter((i) => i.category === active || i.category === "all");
  }, [items, active]);

  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const scrollByCards = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9 * (dir === "next" ? 1 : -1);
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

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

  return (
    <section
      ref={rootRef}
      data-section="career-workplace"
      className="relative w-full overflow-hidden bg-white text-[#333]
                 pt-[40px] pb-[56px] lg:pt-[3.646vw] lg:pb-[5.208vw]"
    >
      {/* Vertical side label */}
      <div
        className="absolute z-[5] flex flex-col items-center
                   left-[8px] top-[44px] w-[18px] gap-[10px]
                   lg:left-[4.166vw] lg:top-[3.646vw] lg:w-[2.812vw] lg:gap-[1.094vw]"
        style={{ color: RED }}
      >
        <span className="block w-px h-[26px] lg:h-[3.125vw]" style={{ background: RED }} />
        <span
          className="font-medium capitalize whitespace-nowrap text-[11px] lg:text-[1.25vw]"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
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

      {/* Featured image + play */}
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
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full
                       w-[56px] h-[40px] lg:w-[4.125vw] lg:h-[2.719vw] transition-transform duration-300 group-hover:scale-110"
            style={{ background: RED }}
          >
            <Play className="w-[18px] h-[18px] lg:w-[1.125vw] lg:h-[1.125vw] text-white" fill="currentColor" />
          </span>
        </a>
      </div>

      {/* Filter tabs */}
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
        </div>
      )}
    </section>
  );
}
