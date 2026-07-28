import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { mediaUrl } from "@/lib/strapi";
import SectionLabel from "@/components/myhome/SectionLabel";
import SectionHeading from "@/components/common/SectionHeading";

const RED = "#ef493d";

/* Built-in copy so the band renders the designed layout before the `strategy`
   component is filled in on the Sustainability single type — same convention as
   CsrInitiatives and the ESG pillar pages. Tracks the published My Home Group
   strategy: two commitments, Care for the People and Care for the Planet. */
const DEFAULT_PILLARS = [
  {
    title: "Care for the People",
    description:
      "A long-term vision to create value for every stakeholder and foster a diverse, inclusive and secure society — pursuing growth through ethics and collaboration rather than at their expense.",
    points: [
      { text: "Social responsibility" },
      { text: "Improved quality of life" },
      { text: "Community development" },
      { text: "Well-being in the workplace" },
    ],
  },
  {
    title: "Care for the Planet",
    description:
      "Energy-efficient green solutions designed in from the start, with climate risk addressed alongside the partners we build with — minimising carbon while rewarding efficiency and invention.",
    points: [
      { text: "Minimised carbon emissions" },
      { text: "Efficiency by design" },
      { text: "Creativity and innovation" },
      { text: "Climate risk collaboration" },
    ],
  },
];

const DEFAULT_STATEMENT =
  "We care for both people and our planet — and we measure ourselves by the positive impact that leaves behind.";

/**
 * SustainabilityStrategy — the "Our Strategic Pillars" band that closes the
 * Sustainability page.
 *
 * Sits directly under the dark "Precision Green Metrics" CTA, so it opens light
 * to break the block. Layout: the usual vertical side label and centred serif
 * heading, then the pillars as large bordered cards — an oversized serif index,
 * the pillar name, its commitment, and the focus points it breaks down into,
 * each led by a short red rule. A closing statement is set across the full
 * width beneath them.
 *
 * Responsive: cards stack single-column below `lg` and the focus points go
 * one-per-row on the narrowest screens, two-up from `sm`. Desktop sizing uses
 * the same vw scale as the rest of the page.
 */
export default function SustainabilityStrategy({ strategy }) {
  const label = strategy?.label || "Sustainability Strategy";
  const heading = strategy?.heading || "Our Strategic Pillars";
  const description =
    strategy?.description ||
    "Two commitments carry the whole programme. Everything we measure, certify and report rolls up into one of them.";
  const statement = strategy?.statement || DEFAULT_STATEMENT;

  const cmsPillars = Array.isArray(strategy?.pillars) ? strategy.pillars : [];
  const pillars = cmsPillars.length ? cmsPillars : DEFAULT_PILLARS;

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
          scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
        });
      }
    },
    { scope: rootRef }
  );

  if (!pillars.length) return null;

  return (
    <section
      ref={rootRef}
      data-section="sustainability-strategy"
      className="relative w-full overflow-hidden bg-[#faf9f7] text-[#333]
                 pt-[26px] pb-[56px] lg:pt-[4.687vw] lg:pb-[5.208vw]"
    >
      <SectionLabel
        className="lg:absolute z-[5] left-[16px] top-[56px] lg:left-[4.166vw] lg:top-[4.687vw] max-lg:static max-lg:w-full max-lg:mt-[15px] max-lg:mb-[18px]"
        color={RED}
      >
        {label}
      </SectionLabel>

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-[11.146vw]">
        {/* Centred header */}
        <div className="flex flex-col items-center text-center gap-[14px] lg:gap-[0.729vw] mb-[36px] lg:mb-[3.333vw]">
          <SectionHeading
            data-reveal
            className="leading-[1.05] tracking-[0.02em]
                       text-[34px] xs:text-[38px] sm:text-[48px] md:text-[60px] lg:text-[3.646vw]"
          >
            {heading}
          </SectionHeading>
          {description ? (
            <p
              data-reveal
              className="max-w-[70ch] text-[#5f5f5f] text-[15px] leading-[1.7] lg:text-[0.937vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {description}
            </p>
          ) : null}
        </div>

        {/* Pillar cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] lg:gap-[2.083vw] items-stretch">
          {pillars.map((pillar, i) => {
            const iconUrl = mediaUrl(pillar?.icon);
            const points = Array.isArray(pillar?.points) ? pillar.points : [];
            return (
              <article
                key={pillar?.id ?? i}
                data-reveal
                className="group flex h-full flex-col rounded-[12px] border border-black/10 bg-white
                           p-[26px] sm:p-[32px] lg:p-[2.604vw]
                           transition-colors duration-500 hover:border-[#ef493d]/40"
              >
                {/* Index + icon */}
                <div className="flex items-start justify-between gap-[16px] lg:gap-[1.042vw]">
                  <span
                    className="block leading-none text-[34px] sm:text-[40px] lg:text-[2.604vw]"
                    style={{
                      color: RED,
                      fontFamily:
                        '"Tartuffo_Trial_Light","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                      fontWeight: 300,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt=""
                      aria-hidden="true"
                      className="shrink-0 w-[48px] h-[48px] lg:w-[3.125vw] lg:h-[3.125vw] object-contain"
                    />
                  ) : null}
                </div>

                <h3
                  className="mt-[18px] lg:mt-[1.302vw] leading-[1.15]
                             text-[26px] sm:text-[32px] lg:text-[2.031vw]"
                  style={{
                    fontFamily:
                      '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                    fontWeight: 400,
                  }}
                >
                  {pillar?.title}
                </h3>

                {pillar?.description ? (
                  <p
                    className="mt-[12px] lg:mt-[0.833vw] text-[#5f5f5f]
                               text-[14px] sm:text-[15px] leading-[1.7]
                               lg:text-[0.833vw] lg:leading-[1.458vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {pillar.description}
                  </p>
                ) : null}

                {points.length ? (
                  <ul
                    className="mt-auto pt-[22px] lg:pt-[1.667vw] grid grid-cols-1 sm:grid-cols-2
                               gap-x-[20px] lg:gap-x-[1.302vw] gap-y-[12px] lg:gap-y-[0.833vw]"
                  >
                    {points.map((p, j) => (
                      <li
                        key={p?.id ?? j}
                        className="flex items-start gap-[10px] lg:gap-[0.625vw]
                                   text-[#333] text-[13px] sm:text-[14px] leading-[1.5] lg:text-[0.781vw]"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[8px] lg:mt-[0.55vw] block h-px w-[14px] lg:w-[0.833vw] shrink-0"
                          style={{ background: RED }}
                        />
                        <span>{typeof p === "string" ? p : p?.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            );
          })}
        </div>

        {/* Closing statement */}
        {statement ? (
          <div
            data-reveal
            className="mt-[24px] lg:mt-[2.083vw] rounded-[12px] border border-black/10 bg-white
                       px-[26px] py-[28px] sm:px-[32px] lg:px-[2.604vw] lg:py-[2.083vw]
                       flex flex-col sm:flex-row items-start sm:items-center gap-[16px] lg:gap-[1.667vw]"
          >
            <span
              aria-hidden="true"
              className="block h-px w-[36px] lg:w-[2.604vw] shrink-0"
              style={{ background: RED }}
            />
            <p
              className="leading-[1.35] text-[20px] sm:text-[24px] lg:text-[1.667vw]"
              style={{
                fontFamily:
                  '"Tartuffo_Trial_Light","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                fontWeight: 300,
                letterSpacing: "0.02em",
              }}
            >
              {statement}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
