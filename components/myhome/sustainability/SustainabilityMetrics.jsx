import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { mediaUrl } from "@/lib/strapi";

/**
 * SustainabilityMetrics — the "Precision Green Metrics" CTA band.
 *
 * A full-bleed background image with a left-side dark gradient, over which sit
 * the heading, intro copy and a row of measurable outcomes (icon + value +
 * caption, divided by a hairline). Background, copy, metrics and their icons
 * are all CMS-driven via sustainability-page.metrics.
 */
export default function SustainabilityMetrics({ metrics }) {
  const heading = metrics?.heading || "Precision Green Metrics";
  const description =
    metrics?.description ||
    "Delivering measurable sustainability outcomes across our portfolio";
  const bgUrl = mediaUrl(metrics?.backgroundImage);
  const items = Array.isArray(metrics?.metrics) ? metrics.metrics : [];

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
          scrollTrigger: { trigger: rootRef.current, start: "top 82%" },
        });
      }
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      data-section="sustainability-metrics"
      className="relative w-full overflow-hidden bg-[#0e1a14] text-white
                 min-h-[520px] lg:min-h-0 lg:h-[36.45vw]"
    >
      {bgUrl ? (
        <Image
          src={bgUrl}
          alt=""
          aria-hidden="true"
          fill
          unoptimized
          sizes="100vw"
          className="object-cover object-center"
        />
      ) : null}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0) 60%), linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2))",
        }}
      />

      <div className="relative z-[2] mx-auto w-full h-full px-6 sm:px-10 lg:px-[11.146vw]
                      flex flex-col justify-center py-[56px] lg:py-0">
        <div className="max-w-[560px] lg:max-w-[31vw]">
          <h2
            data-reveal
            className="leading-[1.1] text-[40px] sm:text-[52px] lg:text-[3.125vw]"
            style={{
              fontFamily:
                '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
              fontWeight: 400,
              letterSpacing: "0.03em",
            }}
          >
            {heading}
          </h2>
          <p
            data-reveal
            className="mt-[16px] lg:mt-[0.833vw] text-white/90 text-[16px] leading-[1.5] lg:text-[1.198vw]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {description}
          </p>

          <div
            data-reveal
            className="mt-[36px] lg:mt-[1.875vw] flex items-stretch gap-[28px] lg:gap-[1.667vw]"
          >
            {items.map((m, i) => {
              const iconUrl = mediaUrl(m?.icon);
              return (
                <React.Fragment key={i}>
                  {i > 0 ? (
                    <span
                      aria-hidden="true"
                      className="w-px self-stretch bg-white/30"
                    />
                  ) : null}
                  <div className="flex flex-col items-center text-center w-[140px] lg:w-[7.5vw]">
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt=""
                        aria-hidden="true"
                        className="w-[44px] h-[44px] lg:w-[2.604vw] lg:h-[2.604vw] object-contain"
                      />
                    ) : null}
                    <span
                      className="mt-[10px] lg:mt-[0.52vw] leading-none text-[32px] lg:text-[1.927vw]"
                      style={{
                        fontFamily:
                          '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                        fontWeight: 400,
                      }}
                    >
                      {m.value}
                    </span>
                    <span
                      className="mt-[10px] lg:mt-[0.52vw] text-white text-[14px] leading-[1.4] lg:text-[0.937vw]"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {m.label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
