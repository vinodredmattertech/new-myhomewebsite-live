import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { mediaUrl } from "@/lib/strapi";
import SectionLabel from "@/components/myhome/SectionLabel";
import SectionHeading from "@/components/common/SectionHeading";

/**
 * PillarFocus — the "Focus Areas" grid on an ESG pillar detail page.
 *
 * Each area is a bordered tile carrying a two-digit index, the area name and a
 * line of copy; a CMS-uploaded icon replaces the index when one is supplied.
 * The grid keeps to at most three columns so a pillar with two focus areas
 * (Governance) doesn't leave a stranded empty cell.
 */
export default function PillarFocus({ focus, fallback, accent }) {
  const label = focus?.label || fallback?.label || "Focus Areas";
  const heading = focus?.heading || fallback?.heading;
  const description = focus?.description || fallback?.description;

  const cmsItems = Array.isArray(focus?.items) ? focus.items : [];
  const items = cmsItems.length ? cmsItems : fallback?.items || [];

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
          stagger: 0.08,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
        });
      }
    },
    { scope: rootRef }
  );

  if (!items.length) return null;

  // Two focus areas sit better as a pair than as two-thirds of a three-up row.
  const columns =
    items.length <= 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      ref={rootRef}
      data-section="sustainability-pillar-focus"
      className="relative w-full overflow-hidden bg-[#faf9f7] text-[#333]
                 pt-[26px] pb-[48px] lg:pt-[4.687vw] lg:pb-[4.687vw]"
    >
      <SectionLabel
        className="lg:absolute z-[5] left-[16px] top-[56px] lg:left-[4.166vw] lg:top-[4.687vw] max-lg:static max-lg:w-full max-lg:mt-[15px] max-lg:mb-[18px]"
        color={accent}
      >
        {label}
      </SectionLabel>

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-[11.146vw]">
        <div className="flex flex-col items-center text-center gap-[14px] lg:gap-[0.729vw] mb-[36px] lg:mb-[3.333vw]">
          {heading ? (
            <SectionHeading
              data-reveal
              className="leading-[1.05] tracking-[0.02em]
                         text-[34px] sm:text-[48px] md:text-[60px] lg:text-[3.646vw]"
            >
              {heading}
            </SectionHeading>
          ) : null}
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

        <div className={`grid grid-cols-1 ${columns} gap-[18px] lg:gap-[1.667vw]`}>
          {items.map((item, i) => {
            const iconUrl = mediaUrl(item?.icon);
            return (
              <article
                key={item?.id ?? i}
                data-reveal
                className="group flex h-full flex-col rounded-[10px] border border-black/10 bg-white
                           p-[24px] lg:p-[2.083vw]
                           transition-colors duration-500 hover:border-black/25"
              >
                {iconUrl ? (
                  <img
                    src={iconUrl}
                    alt=""
                    aria-hidden="true"
                    className="w-[46px] h-[46px] lg:w-[3.125vw] lg:h-[3.125vw] object-contain"
                  />
                ) : (
                  <span
                    className="block leading-none text-[30px] lg:text-[2.083vw]"
                    style={{
                      color: accent,
                      fontFamily:
                        '"Tartuffo_Trial_Light","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                      fontWeight: 300,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}

                <h3
                  className="mt-[18px] lg:mt-[1.302vw] leading-[1.15]
                             text-[22px] sm:text-[26px] lg:text-[1.667vw]"
                  style={{
                    fontFamily:
                      '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                    fontWeight: 400,
                  }}
                >
                  {item?.title}
                </h3>

                {item?.description ? (
                  <p
                    className="mt-[12px] lg:mt-[0.833vw] text-[#5f5f5f]
                               text-[14px] leading-[1.7] lg:text-[0.833vw] lg:leading-[1.458vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {item.description}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
