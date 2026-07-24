import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import SectionLabel from "@/components/myhome/SectionLabel";
import { mediaUrl } from "@/lib/strapi";
import SectionHeading from "@/components/common/SectionHeading";

const TARTUFFO =
  '"Tartuffo_Trial_Light","Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif';

/* Diagonal wave offsets (in vw) applied to each card on large screens so they
   step down then back up exactly like the Figma layout. */
const CARD_OFFSETS = ["0vw", "3.96vw", "6.98vw", "4.17vw"];

function EvaluateCard({ card, offset }) {
  const icon = mediaUrl(card.icon);
  return (
    <div
      className="bg-eval-card relative bg-white rounded-[12px] overflow-hidden shrink-0
                 w-full lg:w-[18.75vw] h-[160px] sm:h-[200px] lg:h-[11.66vw]
                 lg:mt-[var(--off)]"
      style={{ "--off": offset }}
    >
      <p
        className="absolute capitalize text-[#333] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-center
                   w-[80%] lg:w-[14.06vw]
                   text-[20px] sm:text-[26px] lg:text-[1.823vw]
                   leading-[1.28] lg:leading-[2.343vw]"
        style={{ fontFamily: TARTUFFO, fontWeight: 300 }}
      >
        {card.title}
      </p>

      {icon && (
        <span className="pointer-events-none absolute bottom-[8.9%] right-[5.6%] w-[44px] h-[44px] lg:w-[2.6vw] lg:h-[2.6vw] opacity-20">
          <Image
            src={icon}
            alt=""
            fill
            unoptimized
            sizes="44px"
            className="object-contain"
          />
        </span>
      )}
    </div>
  );
}

/**
 * Step 2 — "Evaluate" section. Dark band with the oversized "Look Beyond the
 * First Impression" heading, an intro paragraph and the four review cards
 * (each a checklist item with a faint corner watermark icon). All content is
 * mapped from the Strapi buyers-guide-page `evaluate` component.
 */
export default function BuyersEvaluate({ data }) {
  const rootRef = useRef(null);
  const headingRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      const words = splitToWords(headingRef.current);
      gsap.from(words, {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.05,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });

      gsap.from(".bg-eval-card", {
        y: 40,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "expo.out",
        scrollTrigger: { trigger: ".bg-eval-cards", start: "top 85%" },
      });
    },
    { scope: rootRef }
  );

  if (!data) return null;

  const cards = Array.isArray(data.cards) ? data.cards : [];

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-[#2a2828] overflow-hidden
                 py-[60px] md:py-[80px] lg:pt-[3.541vw] lg:pb-[6.5vw]"
      data-section="buyers-evaluate"
    >
      <div className="lg:absolute left-[4.16vw] top-[4.687vw] lg:block max-lg:static max-lg:w-full max-lg:flex max-lg:justify-center max-lg:mt-[15px] max-lg:mb-[18px]">
        <SectionLabel color="#ffffff">{data.label}</SectionLabel>
      </div>

      <div className="px-5 md:px-10 lg:px-[8.541vw]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_32.65vw] gap-[24px] lg:gap-[3vw] items-start">
          <SectionHeading
            ref={headingRef}
            className="text-white capitalize will-change-transform
                       leading-[1.04] tracking-[0.02em]
                       text-[40px] sm:text-[60px] md:text-[78px] lg:text-[5vw]
                       max-w-[760px] lg:max-w-[36.82vw]"
          >
            {data.heading}
          </SectionHeading>

          {data.intro && (
            <p
              className="font-montserrat font-normal text-white/95 text-justify
                         lg:mt-[2.083vw]
                         text-[15px] md:text-[17px] lg:text-[0.937vw]
                         leading-[26px] md:leading-[30px] lg:leading-[1.667vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {data.intro}
            </p>
          )}
        </div>

        {/* Cards: wrapped row that staggers diagonally on large screens. */}
        <div className="bg-eval-cards relative mt-[40px] md:mt-[56px] lg:mt-[3vw]">
          {/* Decorative connecting line (large screens only) */}
          <svg
            className="hidden lg:block absolute -left-[2.5vw] top-[3vw] w-[105vw] h-[14vw] pointer-events-none"
            viewBox="0 0 2017 267"
            fill="none"
            aria-hidden="true"
            preserveAspectRatio="none"
          >
            <path
              d="M0 60 C 500 -30, 1000 240, 1500 90 S 2017 40, 2017 40"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="1.5"
              strokeDasharray="2 8"
              strokeLinecap="round"
            />
          </svg>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row lg:justify-between gap-[16px] lg:gap-[1.5vw]">
            {cards.map((card, i) => (
              <EvaluateCard
                key={card.id ?? card.title}
                card={card}
                offset={CARD_OFFSETS[i] ?? "0vw"}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
