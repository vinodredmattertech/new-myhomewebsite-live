import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { mediaUrl } from "@/lib/strapi";
import SectionLabel from "@/components/myhome/SectionLabel";

/**
 * SustainabilityVision — the dark "We Build for 2070" band.
 *
 * Two columns: a serif heading over justified copy on the left; a wide image
 * over a list of headline stats (value + label, divided by hairlines) on the
 * right. Everything is CMS-driven via sustainability-page.vision.
 */
export default function SustainabilityVision({ vision }) {
  const label = vision?.label || "Sustainability Vision";
  const heading =
    vision?.heading || "We Don't Build for Today. We Build for 2070";
  const description = vision?.description;
  const imageUrl = mediaUrl(vision?.image);
  const imageAlt = vision?.imageAlt || heading;
  const stats = Array.isArray(vision?.stats) ? vision.stats : [];

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
          scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
        });
      }
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      data-section="sustainability-vision"
      className="relative w-full overflow-hidden bg-[#2a2828] text-white
                 pt-[56px] pb-[56px] lg:pt-[4.687vw] lg:pb-[4.687vw]"
    >
      <SectionLabel
        className="absolute z-[5] left-[16px] top-[56px] lg:left-[4.166vw] lg:top-[4.687vw]"
        color="#ffffff"
      >
        {label}
      </SectionLabel>

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-[11.146vw]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[40px] lg:gap-[6.25vw]">
          {/* Left — heading + copy */}
          <div className="flex flex-col">
            <h2
              data-reveal
              className="leading-[1.12] text-[38px] sm:text-[54px] md:text-[64px] lg:text-[5vw]"
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
                className="mt-[28px] lg:mt-[10px] lg:pt-[3.333vw] max-w-[52ch] text-white/90
                           text-[15px] leading-[1.75] text-justify lg:text-[0.937vw] lg:leading-[1.6vw]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {description}
              </p>
            ) : null}
          </div>

          {/* Right — image + stats */}
          <div className="flex flex-col">
            {imageUrl ? (
              <div
                data-reveal
                className="relative w-full overflow-hidden rounded-[12px]
                           h-[220px] sm:h-[300px] lg:h-[18.17vw]"
              >
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover object-center"
                />
              </div>
            ) : null}

            <div className="mt-[24px] lg:mt-[2.604vw]">
              {stats.map((s, i) => (
                <div
                  key={i}
                  data-reveal
                  className="flex items-center gap-[20px] lg:gap-[2.604vw] border-t border-white/20
                             py-[18px] lg:py-[1.302vw]"
                >
                  <span
                    className="shrink-0 leading-none text-[44px] sm:text-[56px] lg:text-[5vw]"
                    style={{
                      fontFamily:
                        '"Tartuffo_Trial_Light","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                      fontWeight: 300,
                      letterSpacing: "0.02em",
                      minWidth: "2.6em",
                    }}
                  >
                    {s.value}
                  </span>
                  <span
                    className="text-white/85 text-[14px] leading-[1.4] lg:text-[0.937vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
