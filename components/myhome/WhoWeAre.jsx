import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";

/**
 * Who We Are — Figma node 2828:2254 (desktop) + 3152:3734 (mobile)
 *
 * Desktop: hand-drawn sketch reveals into a full-colour photograph via a
 * bottom-to-top clip-path scrub pinned on scroll. Text colour, side label,
 * and button border transition from dark → white synchronously.
 *
 * Mobile: skips the clip-path animation entirely. The colour photograph is
 * the only background, content sits over the sky/upper portion with white
 * text from the start, side label rotates on the left, and the Know-More
 * button uses a white outline.
 */
export default function WhoWeAre() {
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

  return (
    <section
      ref={rootRef}
      id="who-we-are"
      className="relative w-full bg-white lg:bg-white overflow-hidden h-[100svh] min-h-[720px] sm:h-[100vh] lg:min-h-[1024px]"
    >
      {/* ===== Layer 1: hand-drawn sketch — DESKTOP ONLY ===== */}
      <div
        ref={sketchLayerRef}
        className="hidden lg:block absolute inset-0"
      >
        <Image
          src="/assets/myhome/whoweare-sketch.png"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/0 to-white/20" />
      </div>

      {/* ===== Layer 2: colour photograph =====
          Desktop — clipped, scrubbed on scroll.
          Mobile  — always fully visible (no clipPath). */}
      <div
        ref={colorLayerRef}
        className="absolute inset-0 will-change-[clip-path]"
      >
        <Image
          src="/assets/myhome/whoweare-color.jpg"
          alt="My Home Group property at twilight"
          fill
          unoptimized
          sizes="100vw"
          className="object-cover object-bottom lg:object-center select-none"
        />
        {/* Desktop dim gradient for white text readability after reveal */}
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/45" />
        {/* Mobile dim gradient — stronger at top so heading + paragraph
            read against the sky */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 from-0% via-45% to-black/15 to-100%" />
      </div>

      {/* ===== Vertical side label "Our Story" ===== */}
      <div
        ref={labelRef}
        className="absolute left-[12px] top-[30px] lg:left-[4.17vw] lg:top-[4.687vw] flex flex-col items-center gap-[8px] md:gap-[12px] lg:gap-[1.094vw] z-[5]"
        style={{ color: "#ffffff" }}
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
          Our Story
        </span>
      </div>

      {/* ===== Mobile / desktop responsive content block =====
          Mobile  — top-anchored, right-aligned heading, full-width body, button below.
          Desktop — right-anchored column at top 6.25vw, right-aligned content. */}
      <div className="absolute inset-x-0 top-[56px] sm:top-[64px] lg:top-[6.25vw] px-5 md:px-12 lg:px-0 lg:left-auto lg:right-[10.4vw] xl:right-[10.4vw] w-full lg:w-[28.33vw] z-[5]">
        <div className="flex flex-col items-end lg:items-end gap-[24px] md:gap-[28px] lg:gap-[2.083vw]">
          {/* Heading */}
          <h2
            ref={headingRef}
            className="Tartuffo_Trial_Regular capitalize leading-[1.04] tracking-[0.02em] text-[35px] xs:text-[40px] sm:text-[48px] md:text-[64px] lg:text-[5vw] xl:text-[5vw] text-right will-change-transform text-white lg:text-[#333333]"
            style={{
              fontFamily:
                '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
            }}
          >
            Who We Are
          </h2>

          {/* Body */}
          <p
            ref={paraRef}
            className="font-montserrat font-normal text-[14px] md:text-[15px] lg:text-[0.938vw] leading-[24px] lg:leading-[1.563vw] text-justify w-full max-w-[318px] sm:max-w-[420px] md:max-w-[544px] lg:w-[28.33vw] lg:max-w-none text-white lg:text-[#6d6d6d]"
            style={{
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            For over four decades, My Home Group has been the quiet force
            behind Hyderabad&apos;s rising skyline. From our first foundation
            stone in 1981 to becoming the city&apos;s most trusted name in
            luxury gated living, we build more than towers — we craft
            sanctuaries where families return, not just arrive. Design,
            integrity, and sustainability remain the principles we refuse to
            compromise.
          </p>

          {/* Know-More button — outlined base, red fill + white text on hover */}
          <a
            ref={btnRef}
            href="#featured"
            className="group relative inline-flex items-center justify-center self-start whitespace-nowrap overflow-hidden transition-[border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] w-[154px] sm:w-[180px] md:w-[200px] lg:w-[11.667vw] h-[40px] sm:h-[48px] md:h-[54px] lg:h-[3.02vw] px-5 lg:px-[1.5vw] border border-white lg:border-[#ef493d] hover:border-[#ef493d] bg-transparent"
          >
            {/* Hover fill — slides up from the bottom */}
            <span
              aria-hidden="true"
              className="absolute inset-0 origin-bottom translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] bg-[#ef493d]"
            />
            <span
              ref={btnTextRef}
              className="relative z-[2] font-montserrat font-medium capitalize text-[12px] md:text-[15px] lg:text-[0.938vw] tracking-[0.04em] text-white lg:text-[#ef493d] group-hover:!text-white transition-colors duration-500"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Know more
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
