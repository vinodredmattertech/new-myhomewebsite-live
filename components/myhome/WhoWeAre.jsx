import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { mediaUrl } from "@/lib/strapi";
import RichText from "@/components/common/RichText";
import SectionHeading from "@/components/common/SectionHeading";

/**
 * Who We Are — Figma node 2828:2254 (desktop) + 3152:3734 (mobile)
 *
 * Desktop: hand-drawn sketch reveals into a full-colour photograph via a
 * bottom-to-top clip-path scrub pinned on scroll. Text colour, side label,
 * and button border transition from dark → white synchronously.
 *
 * Mobile: skips the clip-path animation entirely and stacks instead of
 * overlaying — the content block (label, heading, body, Know-More button)
 * sits on white at the top in dark text, and the colour photograph follows
 * below it as a fixed-height band.
 */
export default function WhoWeAre({ data }) {
  const rootRef = useRef(null);
  const colorLayerRef = useRef(null);
  const sketchLayerRef = useRef(null);
  const labelRef = useRef(null);
  const labelTickRef = useRef(null);
  const headingRef = useRef(null);
  const paraRef = useRef(null);
  const btnRef = useRef(null);
  const btnTextRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();

      // ---------------- Common entrance (every viewport) ----------------
      const headingWords = splitToWords(headingRef.current);
      gsap.set(headingWords, { yPercent: 110 });
      gsap.to(headingWords, {
        yPercent: 0,
        duration: 1.2,
        stagger: 0.09,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
      });
      gsap.from(paraRef.current, {
        y: 40,
        autoAlpha: 0,
        duration: 1.0,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });
      gsap.from(btnRef.current, {
        y: 30,
        autoAlpha: 0,
        duration: 0.9,
        delay: 0.15,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 70%" },
      });
      gsap.from(labelRef.current, {
        autoAlpha: 0,
        y: -20,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 85%" },
      });

      // ---------------- Desktop-only pinned clip-path scrub ----------------
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        // Initial: colour layer clipped from the TOP (hidden).
        gsap.set(colorLayerRef.current, {
          clipPath: "inset(100% 0% 0% 0%)",
          webkitClipPath: "inset(100% 0% 0% 0%)",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "+=120%",
            scrub: 0.8,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
          },
        });

        tl.to(
          colorLayerRef.current,
          {
            clipPath: "inset(0% 0% 0% 0%)",
            webkitClipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            duration: 1,
          },
          0
        )
          .to(
            sketchLayerRef.current,
            { autoAlpha: 0.92, ease: "none", duration: 1 },
            0
          )
          .to(
            headingRef.current,
            { color: "#ffffff", ease: "none", duration: 1 },
            0
          )
          .to(
            paraRef.current,
            { color: "#ffffff", ease: "none", duration: 1 },
            0
          )
          .to(
            [labelRef.current, labelTickRef.current],
            { color: "#ffffff", ease: "none", duration: 1 },
            0
          )
          .to(
            btnRef.current,
            { borderColor: "#ffffff", ease: "none", duration: 1 },
            0
          )
          .to(
            btnTextRef.current,
            { color: "#ffffff", ease: "none", duration: 1 },
            0
          );
      });
    },
    { scope: rootRef }
  );

  if (!data) return null;

  const sketchImage = mediaUrl(data.sketchImage);
  const colorImage = mediaUrl(data.colorImage);

  return (
    <section
      ref={rootRef}
      id="who-we-are"
      className="relative w-full bg-white lg:bg-white overflow-hidden flex flex-col h-auto lg:block lg:h-full lg:min-h-[1024px]"
    >
      {/* ===== Layer 1: hand-drawn sketch — DESKTOP ONLY ===== */}
      <div
        ref={sketchLayerRef}
        className="hidden lg:block absolute inset-0"
      >
        {sketchImage && (
          <Image
            src={sketchImage}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center select-none"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/0 to-white/20" />
      </div>

      {/* ===== Layer 2: colour photograph =====
          Desktop — absolute full-bleed, clipped and scrubbed on scroll.
          Mobile  — stacked below the content block, in normal flow. */}
      <div
        ref={colorLayerRef}
        className="relative order-2 w-full h-[320px] sm:h-[420px] md:h-[480px] lg:absolute lg:inset-0 lg:order-none lg:h-auto will-change-[clip-path]"
      >
        {colorImage && (
          <Image
            src={colorImage}
            alt="My Home Group property at twilight"
            fill
            unoptimized
            sizes="100vw"
            className="object-cover lg:object-fill object-center lg:object-center select-none"
          />
        )}
        {/* Desktop dim gradient for white text readability after reveal */}
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/45" />
      </div>

      {/* ===== Vertical side label "Our Story" ===== */}
      <div
        ref={labelRef}
        className="absolute left-[12px] top-[30px] lg:left-[4.17vw] lg:top-[4.687vw] flex flex-col items-center gap-[8px] md:gap-[12px] lg:gap-[1.094vw] z-[5] text-[#333333] lg:text-white"
      >
        <span
          ref={labelTickRef}
          className="block w-px h-[28px] md:h-[36px] lg:h-[3.125vw]"
          style={{ background: "currentColor" }}
        />
        <span
          className="font-montserrat font-medium capitalize text-[12px] md:text-[14px] lg:text-[1.25vw] whitespace-nowrap"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            color: "inherit",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {data.label}
        </span>
      </div>

      {/* ===== Mobile / desktop responsive content block =====
          Mobile  — in normal flow above the photograph, dark text on white.
          Desktop — right-anchored absolute column at top 6.25vw, right-aligned content. */}
      <div className="relative order-1 w-full pt-[56px] sm:pt-[64px] pb-[32px] sm:pb-[40px] px-5 md:px-12 lg:absolute lg:order-none lg:py-0 lg:top-[6.25vw] lg:px-0 lg:left-auto lg:right-[10.4vw] xl:right-[10.4vw] lg:w-[28.33vw] z-[5]">
        <div className="max-sm:ml-[20px] flex flex-col items-start lg:items-end gap-[24px] md:gap-[28px] lg:gap-[2.083vw]">
          {/* Heading */}
          <SectionHeading
            ref={headingRef}
            className="w-full Tartuffo_Trial_Light capitalize leading-[1.04] tracking-[0.02em] text-[35px] xs:text-[40px] sm:text-[48px] md:text-[64px] lg:text-[5vw] xl:text-[5vw] text-left will-change-transform text-[#333333] lg:!text-white"
          >
            {data.heading}
          </SectionHeading>

          {/* Body */}
          <p
            ref={paraRef}
            className="font-montserrat font-normal text-[14px] md:text-[15px] lg:text-[0.938vw] leading-[24px] lg:leading-[1.563vw] text-justify w-full max-w-[318px]  md:max-w-[544px] lg:w-[28.33vw] lg:max-w-none text-[#6d6d6d] lg:!text-white"
            style={{
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            <RichText>{data.body}</RichText>
          </p>

          {/* Know-More button — outlined base, red fill + white text on hover */}
          <a
            ref={btnRef}
            href={data.ctaLink || "#"}
            className="group relative inline-flex items-center justify-center self-start whitespace-nowrap overflow-hidden transition-[border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] w-[154px] sm:w-[180px] md:w-[200px] lg:w-[11.667vw] h-[40px] sm:h-[48px] md:h-[54px] lg:h-[3.02vw] px-5 lg:px-[1.5vw] border border-[#ef493d] hover:border-[#ef493d] bg-transparent"
          >
            {/* Hover fill — slides up from the bottom */}
            <span
              aria-hidden="true"
              className="absolute inset-0 origin-bottom translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] bg-[#ef493d]"
            />
            <span
              ref={btnTextRef}
              className="relative z-[2] font-montserrat font-medium capitalize text-[12px] md:text-[15px] lg:text-[0.938vw] tracking-[0.04em] text-[#ef493d] group-hover:!text-white transition-colors duration-500"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {data.ctaText}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
