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
 * PillarInitiatives — the "Key Initiatives" card grid on a pillar detail page.
 *
 * Photo-led cards, three-up on desktop: the image sits above a serif title and
 * a paragraph of detail, with a rule in the brand accent drawing in on hover.
 * Cards are static (no link) because an initiative has no page of its own —
 * the detail is the card.
 */
export default function PillarInitiatives({ initiatives, fallback, accent }) {
  const label = initiatives?.label || fallback?.label || "Key Initiatives";
  const heading = initiatives?.heading || fallback?.heading;
  const description = initiatives?.description || fallback?.description;

  const cmsItems = Array.isArray(initiatives?.items) ? initiatives.items : [];
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
          scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
        });
      }
    },
    { scope: rootRef }
  );

  if (!items.length) return null;

  return (
    <section
      ref={rootRef}
      data-section="sustainability-pillar-initiatives"
      className="relative w-full overflow-hidden bg-white text-[#333]
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px] lg:gap-[2.083vw]">
          {items.map((item, i) => {
            const imageUrl = pillarImage(item?.image, null);
            return (
              <article
                key={item?.id ?? i}
                data-reveal
                className="group flex h-full flex-col"
              >
                {imageUrl ? (
                  <div className="relative w-full overflow-hidden rounded-[10px] aspect-[494/330] bg-[#f5f1eb]">
                    <Image
                      src={imageUrl}
                      alt={item?.imageAlt || item?.title || ""}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 26vw"
                      className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                    />
                  </div>
                ) : null}

                <span
                  aria-hidden="true"
                  className="mt-[18px] lg:mt-[1.302vw] block h-px w-[36px] lg:w-[2.083vw]
                             origin-left transition-transform duration-500 group-hover:scale-x-[2.4]"
                  style={{ background: accent }}
                />

                <h3
                  className="mt-[14px] lg:mt-[0.937vw] leading-[1.2]
                             text-[21px] sm:text-[24px] lg:text-[1.458vw]"
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
                    className="mt-[10px] lg:mt-[0.729vw] text-[#5f5f5f]
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
