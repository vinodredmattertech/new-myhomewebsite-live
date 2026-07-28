import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { pillarImage } from "@/lib/sustainabilityPillars";
import SectionLabel from "@/components/myhome/SectionLabel";
import SectionHeading from "@/components/common/SectionHeading";

/**
 * PillarHighlights — the dark impact band on a pillar detail page.
 *
 * A full-bleed photograph under a heavy scrim, with the headline figures laid
 * out in a divided row. Matches the dark treatment used by SustainabilityVision
 * and the Precision Green Metrics CTA, so the pillar pages read as part of the
 * same Sustainability sequence.
 */
export default function PillarHighlights({ highlights, fallback }) {
  const label = highlights?.label || fallback?.label || "Impact In Numbers";
  const heading = highlights?.heading || fallback?.heading;
  const description = highlights?.description || fallback?.description;
  const backgroundUrl = pillarImage(
    highlights?.backgroundImage,
    fallback?.backgroundImage
  );

  const cmsStats = Array.isArray(highlights?.stats) ? highlights.stats : [];
  const stats = cmsStats.length ? cmsStats : fallback?.stats || [];

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

  if (!stats.length && !heading) return null;

  return (
    <section
      ref={rootRef}
      data-section="sustainability-pillar-highlights"
      className="relative w-full overflow-hidden bg-[#2a2828] text-white
                 pt-[26px] pb-[52px] lg:pt-[4.687vw] lg:pb-[4.687vw]"
    >
      {backgroundUrl ? (
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src={backgroundUrl}
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="object-cover object-center select-none"
          />
          <div className="absolute inset-0 bg-[#1d1b1b]/80" />
        </div>
      ) : null}

      {/* `max-lg:relative` rather than the usual `max-lg:static`: the scrim
          above is positioned, so a static label would paint underneath it. */}
      <SectionLabel
        className="lg:absolute z-[5] left-[16px] top-[56px] lg:left-[4.166vw] lg:top-[4.687vw] max-lg:relative max-lg:w-full max-lg:mt-[15px] max-lg:mb-[18px]"
        color="#ffffff"
      >
        {label}
      </SectionLabel>

      <div className="relative z-[2] mx-auto w-full px-6 sm:px-10 lg:px-[11.146vw]">
        <div className="flex flex-col items-center text-center gap-[14px] lg:gap-[0.729vw]">
          {heading ? (
            <SectionHeading
              data-reveal
              className="leading-[1.05] tracking-[0.02em] text-white
                         text-[34px] sm:text-[48px] md:text-[60px] lg:text-[3.646vw]"
            >
              {heading}
            </SectionHeading>
          ) : null}
          {description ? (
            <p
              data-reveal
              className="max-w-[70ch] text-white/85 text-[15px] leading-[1.7] lg:text-[0.937vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {description}
            </p>
          ) : null}
        </div>

        {stats.length ? (
          <div
            className="mt-[36px] lg:mt-[3.333vw] grid grid-cols-2 lg:grid-cols-4
                       gap-y-[32px] lg:gap-y-0
                       divide-white/20 lg:divide-x"
          >
            {stats.map((s, i) => (
              <div
                key={s?.id ?? i}
                data-reveal
                className="flex flex-col items-center text-center gap-[8px] lg:gap-[0.625vw] lg:px-[1.667vw]"
              >
                <span
                  className="leading-none text-[38px] sm:text-[52px] lg:text-[3.646vw]"
                  style={{
                    fontFamily:
                      '"Tartuffo_Trial_Light","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                    fontWeight: 300,
                    letterSpacing: "0.02em",
                  }}
                >
                  {s?.value}
                </span>
                <span
                  className="max-w-[24ch] text-white/80 text-[13px] leading-[1.5] lg:text-[0.833vw]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {s?.label}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
