import React, { useMemo, useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import SectionLabel from "@/components/myhome/SectionLabel";
import { mediaUrl } from "@/lib/strapi";
import SectionHeading from "@/components/common/SectionHeading";

const TARTUFFO =
  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif';

/**
 * Channel Partner — "Why Partner With Us": the centred
 * "A Partnership Built for Growth" heading + supporting copy over a wide
 * feature image. Fully driven by the `whyPartner` component on the
 * channel-partner-page single type; renders nothing until populated.
 * Desktop sizing uses vw (1920 reference); small screens use px.
 */
export default function WhyPartner({ data }) {
  const label = data?.label || "";
  const heading = data?.heading || "";
  const paragraphs = useMemo(
    () =>
      data?.intro
        ? String(data.intro)
            .split(/\n\s*\n/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    [data]
  );
  const image = mediaUrl(data?.image);
  const imageAlt = data?.imageAlt || "";

  const rootRef = useRef(null);
  const headingRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      const el = headingRef.current;
      if (!el) return;
      const words = splitToWords(el);
      gsap.from(words, {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.05,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
      });
    },
    { scope: rootRef }
  );

  // Nothing to show until the section is populated in the CMS.
  if (!data || (!heading && !paragraphs.length && !image)) return null;

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden
                 pt-[64px] md:pt-[90px] lg:pt-[4.688vw]
                 pb-[40px] md:pb-[64px] lg:pb-[6.042vw]"
    >
      {/* vertical side label */}
      {label && (
        <div className="absolute left-[6px] top-[60px] lg:left-[4.167vw] lg:top-[4.688vw]">
          <SectionLabel>{label}</SectionLabel>
        </div>
      )}

      {/* heading + copy, centred */}
      <div className="px-5 md:px-12 lg:px-[10vw]">
        <div className="mx-auto flex flex-col items-center text-center gap-[16px] lg:gap-[0.677vw] max-w-[999px] lg:max-w-[52vw]">
          {heading && (
            <SectionHeading
              ref={headingRef}
              className="text-[#333] capitalize will-change-transform leading-[1.04] tracking-[0.021em]
                         text-[40px] xs:text-[48px] sm:text-[64px] md:text-[80px] lg:text-[5vw]"
            >
              {heading}
            </SectionHeading>
          )}

          {paragraphs.length > 0 && (
            <div className="flex flex-col gap-[16px] lg:gap-[1.25vw]">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="font-montserrat text-[#333]
                             text-[15px] sm:text-[16px] md:text-[17px] lg:text-[0.938vw]
                             leading-[26px] sm:leading-[28px] lg:leading-[1.458vw]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {p}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* wide feature image */}
      {image && (
        <div className="px-5 md:px-10 lg:px-[9.896vw] mt-[36px] md:mt-[56px] lg:mt-[4.271vw]">
          <div className="relative w-full overflow-hidden rounded-[12px] lg:rounded-[0.625vw] aspect-[1540/725]">
            <Image
              src={image}
              alt={imageAlt}
              fill
              unoptimized
              sizes="(min-width: 1024px) 80vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      )}
    </section>
  );
}
