import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import SectionLabel from "@/components/myhome/SectionLabel";
import { mediaUrl } from "@/lib/strapi";
import RichText from "@/components/common/RichText";

/**
 * The NRI Mindset — Figma node 3189:4197 ("Distance Shouldn't Make Ownership Difficult").
 *
 * Desktop is a 1:1 port of the 1920×844 Figma frame (= 100vw × 43.96vw):
 *   Side label "From Miles Away" : left 80   top 90   (4.17vw / 4.687vw)
 *   Heading                      : left 214  top 120  w 713* text 96/126   tracking 2px
 *   Body                         : left 214  top 528  w 492  text 18/30    text-justify
 *   Image                        : left 1031 top 150  w 789  h 604         rounded 12px
 *
 *   * Heading width widened to ~42vw vs Figma's 37.14vw to compensate for the
 *     Tartuffo-Regular → Cormorant fallback (wider glyphs than Figma's Tartuffo
 *     Light), so the natural wrap matches Figma's 3-line break:
 *       Distance Shouldn't | Make Ownership | Difficult
 *
 * Mobile / tablet collapses to a vertical stack with the image hero-style under the copy.
 */

export default function NriMindset({ data }) {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const bodyRef = useRef(null);
  const imgRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      const words = splitToWords(headingRef.current);
      gsap.from(words, {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.06,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
      });
      gsap.from(bodyRef.current, {
        y: 30,
        autoAlpha: 0,
        duration: 1.0,
        ease: "expo.out",
        delay: 0.25,
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });
      gsap.from(imgRef.current, {
        y: 60,
        autoAlpha: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: imgRef.current, start: "top 85%" },
      });
    },
    { scope: rootRef }
  );

  if (!data) return null;

  const image = mediaUrl(data.image);

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-[#2a2828] overflow-hidden
                 py-[60px] md:py-[80px] lg:py-0 lg:h-[43.958vw]"
      data-section="nri-mindset"
    >
      {/* ---------- Side label (desktop) ---------- */}
      <div className="absolute left-[4.17vw] top-[4.687vw] hidden lg:block z-[2]">
        <SectionLabel color="#ffffff">{data.label}</SectionLabel>
      </div>

      {/* ============================================================
            DESKTOP — absolute Figma layout (1920×844)
         ============================================================ */}

      {/* Heading : left 214 / top 120 / w 713 (widened to ~42vw for font fallback) / text 96 / line 126 / tracking 2px */}
      <h2
        ref={headingRef}
        className="hidden lg:block absolute capitalize text-white will-change-transform
                   left-[11.146vw] top-[6.25vw] w-[42vw]
                   text-[5vw] leading-[6.562vw] tracking-[0.104vw]"
        style={{
          fontFamily:
            '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
          fontWeight: 300,
        }}
      >
        {data.heading}
      </h2>

      {/* Body : left 214 / top 528 / w 492 / text 18 / line 30 / text-justify */}
      <p
        ref={bodyRef}
        className="hidden lg:block absolute font-montserrat font-normal text-white text-justify
                   left-[11.146vw] top-[27.5vw] w-[25.625vw]
                   text-[0.938vw] leading-[1.563vw]"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        <RichText>{data.body}</RichText>
      </p>

      {/* Image : left 1031 / top 150 / w 789 / h 604 / rounded 12 */}
      <div
        ref={imgRef}
        className="hidden lg:block absolute overflow-hidden rounded-[0.625vw]
                   left-[53.698vw] top-[7.812vw] w-[41.094vw] h-[31.458vw]"
      >
        {image && (
          <Image
            src={image}
            alt="A family video-calling their home in India"
            fill
            unoptimized
            sizes="42vw"
            className="object-cover object-center select-none"
          />
        )}
      </div>

      {/* ============================================================
            MOBILE / TABLET — stacked vertical
         ============================================================ */}
      <div className="lg:hidden px-5 md:px-10 flex flex-col gap-[32px] md:gap-[40px]">
        <h2
          className="text-white capitalize tracking-[0.02em] leading-[1.15]
                     text-[32px] xs:text-[40px] sm:text-[52px] md:text-[64px]"
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
            fontWeight: 300,
          }}
        >
          {data.heading}
        </h2>

        {image && (
          <div className="relative w-full aspect-[789/604] rounded-[10px] overflow-hidden">
            <Image
              src={image}
              alt="A family video-calling their home in India"
              fill
              unoptimized
              sizes="100vw"
              className="object-cover object-center select-none"
            />
          </div>
        )}

        <p
          className="font-montserrat font-normal text-white text-justify
                     text-[14px] sm:text-[15px] md:text-[16px]
                     leading-[24px] sm:leading-[26px] md:leading-[28px]
                     max-w-[560px]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <RichText>{data.body}</RichText>
        </p>
      </div>
    </section>
  );
}
