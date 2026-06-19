import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { mediaUrl } from "@/lib/strapi";
import SectionLabel from "@/components/myhome/SectionLabel";

/**
 * SustainabilityEsg — the "A Trusted Name. A Guided Journey." ESG band.
 *
 * A centered heading + intro on top, then a two-column row: three ESG pillars
 * (icon + title + copy, divided by hairlines) on the left and a tall supporting
 * image on the right. Pillars and their icons are CMS-driven.
 */
export default function SustainabilityEsg({ esg }) {
  const label = esg?.label || "ESG Objective";
  const heading = esg?.heading || "A Trusted Name. A Guided Journey.";
  const description = esg?.description;
  const imageUrl = mediaUrl(esg?.image);
  const imageAlt = esg?.imageAlt || heading;
  const items = Array.isArray(esg?.items) ? esg.items : [];

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

  return (
    <section
      ref={rootRef}
      data-section="sustainability-esg"
      className="relative w-full overflow-hidden bg-white text-[#333]
                 pt-[56px] pb-[56px] lg:pt-[4.687vw] lg:pb-[4.687vw]"
    >
      <SectionLabel
        className="absolute z-[5] left-[16px] top-[56px] lg:left-[4.166vw] lg:top-[4.687vw]"
        color="#ef493d"
      >
        {label}
      </SectionLabel>

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-[11.146vw]">
        {/* Centered header */}
        <div className="flex flex-col items-center text-center gap-[14px] lg:gap-[0.729vw] mb-[40px] lg:mb-[3.333vw]">
          <h2
            data-reveal
            className="leading-[1.05] text-[36px] sm:text-[52px] md:text-[64px] lg:text-[5vw]"
            style={{
              fontFamily:
                '"Tartuffo_Trial_Light","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
              fontWeight: 300,
              letterSpacing: "0.02em",
            }}
          >
            {heading}
          </h2>
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

        {/* Pillars + image */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.62fr] gap-[40px] lg:gap-[4.166vw] items-stretch">
          <div className="flex flex-col">
            {items.map((item, i) => {
              const iconUrl = mediaUrl(item?.icon);
              return (
                <div
                  key={i}
                  data-reveal
                  className="flex items-center justify-between gap-[24px] lg:gap-[2.604vw]
                             border-t border-black/10 first:border-t-0 py-[26px] lg:py-[2.083vw]"
                >
                  <div className="max-w-[40ch]">
                    <h3
                      className="leading-[1.15] text-[24px] sm:text-[30px] lg:text-[2.031vw]"
                      style={{
                        fontFamily:
                          '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                        fontWeight: 400,
                      }}
                    >
                      {item.title}
                    </h3>
                    {item.description ? (
                      <p
                        className="mt-[12px] lg:mt-[0.625vw] text-[#5f5f5f] text-[14px] leading-[1.7] lg:text-[0.833vw]"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt=""
                      aria-hidden="true"
                      className="shrink-0 w-[56px] h-[56px] lg:w-[3.958vw] lg:h-[3.958vw] object-contain"
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          {imageUrl ? (
            <div
              data-reveal
              className="relative w-full overflow-hidden rounded-[12px]
                         h-[320px] sm:h-[420px] lg:h-auto lg:min-h-[29vw]"
            >
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="object-cover object-center"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
