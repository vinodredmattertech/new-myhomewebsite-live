import React, { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { mediaUrl } from "@/lib/strapi";
import SectionLabel from "@/components/myhome/SectionLabel";
import NavArrows from "@/components/myhome/NavArrows";

/**
 * SustainabilityJourney — the "Our Journey to Green Excellence" roadmap.
 *
 * Matches the Figma: a centered heading, a tall image on the left, a vertical
 * rail of milestone years (the active one in a wide red pill, the rest faint,
 * with a hairline divider carrying a red accent) and, on the right, the active
 * milestone's detail behind a large faint year watermark with nav arrows.
 * Years are clickable and the arrows step through milestones that carry copy.
 * Fully CMS-driven via sustainability-page.journey.
 */
export default function SustainabilityJourney({ journey }) {
  const label = journey?.label || "Sustainability Roadmap";
  const heading = journey?.heading || "Our Journey to Green Excellence";
  const imageUrl = mediaUrl(journey?.image);
  const imageAlt = journey?.imageAlt || heading;
  const items = Array.isArray(journey?.items) ? journey.items : [];

  // Default to the milestone flagged active (with copy), else the first that
  // carries a story, else the first marker.
  const firstTitled = items.findIndex((it) => it?.title);
  const initial = items.findIndex((it) => it?.active && it?.title);
  const [activeIdx, setActiveIdx] = useState(
    initial >= 0 ? initial : firstTitled >= 0 ? firstTitled : 0
  );

  const active = items[activeIdx] || {};

  // Arrows + year clicks step across every milestone marker, matching the
  // design's navigable timeline.
  const step = (dir) => {
    if (items.length < 2) return;
    setActiveIdx((i) => (i + dir + items.length) % items.length);
  };

  const rootRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      gsap.registerPlugin(ScrollTrigger);
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const targets = rootRef.current?.querySelectorAll("[data-reveal]");
      if (targets?.length && !reduce) {
        gsap.from(targets, {
          y: 40,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
        });
      }
    },
    { scope: rootRef }
  );

  const serif =
    '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif';
  const serifLight =
    '"Tartuffo_Trial_Light","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif';

  return (
    <section
      ref={rootRef}
      data-section="sustainability-journey"
      className="relative w-full overflow-hidden bg-white text-[#333]
                 pt-[56px] pb-[56px] lg:pt-[4.166vw] lg:pb-[4.166vw]"
    >
      <SectionLabel
        className="absolute z-[5] left-[16px] top-[56px] lg:left-[4.166vw] lg:top-[4.166vw]"
        color="#ef493d"
      >
        {label}
      </SectionLabel>

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-[11.146vw]">
        <h2
          data-reveal
          className="text-center leading-[1.05] text-[34px] sm:text-[52px] md:text-[64px] lg:text-[5vw]
                     mb-[40px] lg:mb-[3.125vw]"
          style={{
            fontFamily: serifLight,
            fontWeight: 300,
            letterSpacing: "0.02em",
          }}
        >
          {heading}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[28.6%_auto_1fr] gap-[28px] lg:gap-0 items-stretch">
          {/* Left — image */}
          {imageUrl ? (
            <div
              data-reveal
              className="relative w-full overflow-hidden rounded-[8px]
                         h-[320px] sm:h-[420px] lg:h-[35.98vw]"
            >
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 28vw"
                className="object-cover object-center"
              />
            </div>
          ) : null}

          {/* Middle — year rail */}
          <div
            data-reveal
            className="flex flex-row lg:flex-col flex-wrap items-center justify-center
                       gap-[12px] lg:gap-[1.4vw] lg:px-[3vw] lg:pt-[1.5vw]"
          >
            {items.map((it, i) => {
              const isActive = i === activeIdx;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative z-[1] whitespace-nowrap cursor-pointer transition-colors ${
                    isActive
                      ? "rounded-full border border-[#ef493d] text-[#ef493d] px-[34px] py-[12px] lg:px-[1.77vw] lg:py-[0.62vw]"
                      : "text-[#333]/20 hover:text-[#333]/40"
                  }`}
                  style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}
                >
                  <span className="text-[22px] lg:text-[1.458vw] tracking-[0.03em]">
                    {it.year}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right — divider + active detail */}
          <div
            className="relative flex flex-col lg:border-l lg:border-black/10 lg:pl-[3.385vw]"
          >
            {/* Red accent on the divider */}
            <span
              aria-hidden="true"
              className="hidden lg:block absolute left-[-1px] top-[8%] w-[2px] h-[40px] bg-[#ef493d]"
            />

            {/* Faint oversized year watermark behind the title */}
            <span
              aria-hidden="true"
              className="pointer-events-none select-none absolute -z-0 left-[-1vw] top-[-2vw]
                         hidden lg:block leading-none text-[8.85vw] text-[#333]/[0.06]"
              style={{
                fontFamily:
                  '"Tartuffo_Trial_Bold","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              {active.year}
            </span>

            <div data-reveal className="relative z-[1] flex flex-col lg:pt-[5vw]">
              <h3
                className="leading-[1.12] text-[26px] sm:text-[34px] lg:text-[2.187vw] max-w-[16ch]"
                style={{
                  fontFamily: serif,
                  fontWeight: 400,
                  letterSpacing: "0.02em",
                }}
              >
                {active.title || active.year}
              </h3>
              {active.description ? (
                <p
                  className="mt-[22px] lg:mt-[2.083vw] max-w-[36ch] text-[#323232] text-[15px] leading-[1.78] lg:text-[0.937vw] lg:leading-[1.66vw]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {active.description}
                </p>
              ) : null}

              {items.length > 1 ? (
                <NavArrows
                  className="mt-[36px] lg:mt-[3vw] self-end"
                  onPrev={() => step(-1)}
                  onNext={() => step(1)}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
