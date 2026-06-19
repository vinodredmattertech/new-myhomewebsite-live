import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import SectionLabel from "@/components/myhome/SectionLabel";
import { mediaUrl } from "@/lib/strapi";

const TARTUFFO =
  '"Tartuffo_Trial_Light","Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif';

/**
 * Step 1 — "Discover" section. Editorial split: a tall image on the left, the
 * "Begin With What Matters to You" heading + supporting copy on the right, with
 * the rotated red side label. All content is mapped from the Strapi
 * buyers-guide-page `discover` component.
 */
export default function BuyersDiscover({ data }) {
  const rootRef = useRef(null);
  const headingRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      const words = splitToWords(headingRef.current);
      gsap.from(words, {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.06,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });
    },
    { scope: rootRef }
  );

  if (!data) return null;

  const img = mediaUrl(data.image);
  // Building line-sketch (Figma 4288:14459). CMS-overridable, else the bundled artwork.
  const sketch = mediaUrl(data.sketchImage) || "/images/buyers-discover-sketch.png";

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden
                 py-[60px] md:py-[80px] lg:py-[5.625vw]"
      data-section="buyers-discover"
    >
      {/* Building line-sketch — Figma 4288:14459 (sits at the bottom-right, bleeds off the edge) */}
      {sketch && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 z-0
                     w-[70vw] md:w-[55vw] lg:w-[47.34vw] aspect-[909/454]"
        >
          <Image
            src={sketch}
            alt=""
            fill
            unoptimized
            sizes="(max-width:1024px) 55vw, 47vw"
            className="object-contain object-right-bottom select-none"
          />
        </div>
      )}

      <div className="absolute left-[4.16vw] top-[4.687vw] hidden lg:block z-[1]">
        <SectionLabel>{data.label}</SectionLabel>
      </div>

      <div
        className="relative z-[1] px-5 md:px-10 lg:pl-[9.375vw] lg:pr-[9.375vw]
                   grid grid-cols-1 lg:grid-cols-[31.04vw_1fr] gap-[36px] lg:gap-[4.687vw]
                   items-start"
      >
        {/* Image */}
        <div className="relative w-full aspect-[596/755] lg:aspect-auto lg:h-[39.32vw] rounded-[4px] overflow-hidden bg-[#eee]">
          {img && (
            <Image
              src={img}
              alt={data.imageAlt || ""}
              fill
              unoptimized
              sizes="(max-width:1024px) 100vw, 32vw"
              className="object-cover object-center select-none"
            />
          )}
        </div>

        {/* Copy */}
        <div className="lg:pt-[1.04vw]">
          <h2
            ref={headingRef}
            className="text-[#231f20] capitalize will-change-transform
                       leading-[1.08] tracking-[0.01em]
                       text-[34px] sm:text-[44px] md:text-[56px] lg:text-[3.646vw]
                       max-w-[640px] lg:max-w-[29.01vw]"
            style={{ fontFamily: TARTUFFO, fontWeight: 300 }}
          >
            {data.heading}
          </h2>

          {data.body && (
            <p
              className="font-montserrat font-normal capitalize text-[#454545]
                         mt-[24px] md:mt-[32px] lg:mt-[3.02vw]
                         text-[15px] sm:text-[16px] md:text-[18px] lg:text-[1.042vw]
                         leading-[26px] md:leading-[32px] lg:leading-[2.083vw]
                         max-w-[620px] lg:max-w-[30.36vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {data.body}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
