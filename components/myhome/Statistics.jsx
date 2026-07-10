import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { mediaUrl } from "@/lib/strapi";
import RichText from "@/components/common/RichText";
import SectionHeading from "@/components/common/SectionHeading";

/**
 * Statistics — Figma node 2609:1725
 *
 * The Figma file defines three frame states that describe the on-scroll
 * animation:
 *   1. Frame …875 — header sits above the viewport (top:-228), city image
 *      sits below (bottom:-830), curve sits at top:1369, all five stat
 *      blocks at opacity:0.
 *   2. Frame …876 — header settled to top:80, city image at bottom:0,
 *      curve at top:539, stats still at opacity:0.
 *   3. Frame …877 — same as 876 but stats fade in (and the count-up runs).
 *
 * We reproduce that 3-keyframe storyboard with a single GSAP timeline
 * driven by ScrollTrigger, and translate every Figma px coordinate to vw
 * (1px @ 1920 = 0.0521vw) for fluid desktop scaling. Mobile gets a clean
 * stacked grid since the curve layout can't survive a 375 px viewport.
 */

// Position metadata only — design-fixed per tile index. Value, suffix,
// and label come from backend.
const STAT_LAYOUT = [
  {
    style: { left: "8.333vw", top: "33.28vw", width: "10.781vw" },
    align: "right",
    mobileWidth: "108.106px",
  },
  {
    style: { left: "calc(16.67% + 10.729vw)", top: "26.51vw", width: "10.781vw" },
    align: "center",
    mobileWidth: "108.106px",
  },
  {
    style: { left: "calc(41.67% + 0.312vw)", top: "13.69vw", width: "10.781vw" },
    align: "center",
    mobileWidth: "108.106px",
    mobileLabelWidth: "138.167px",
  },
  {
    style: { left: "calc(58.33% + 2.916vw)", top: "17.96vw", width: "10.781vw" },
    align: "center",
    mobileWidth: "108.106px",
  },
  {
    style: { left: "calc(83.33% - 4.948vw)", top: "23.38vw", width: "13.281vw" },
    align: "center",
    mobileWidth: "133.174px",
    mobileLabelWidth: "109.151px",
  },
];

/**
 * Single stat tile — runs its own GSAP count-up the first time it enters
 * the viewport. The parent timeline reveals (opacity) the tiles in order.
 */
function StatItem({ stat, index, shouldAnimate, mobile = false, bottomRow = false }) {
  const numRef = useRef(null);
  const wrapRef = useRef(null);

  useGSAP(
    () => {
      if (!shouldAnimate) return;
      registerGsap();

      // The parent <section> timeline starts fading stats in at t=1.05s and
      // staggers each tile by 0.18s. We delay the count-up just slightly
      // after that so the digits start ticking exactly as a tile resolves.
      const STAT_FADE_OFFSET = 1.05;
      const STAT_STAGGER = 0.18;
      const startDelay = STAT_FADE_OFFSET + 0.15 + index * STAT_STAGGER;

      const obj = { v: 0 };
      gsap.to(obj, {
        v: stat.value,
        duration: 2.6,
        delay: startDelay,
        ease: "power2.out",
        snap: { v: 1 },
        onUpdate: () => {
          if (numRef.current) {
            numRef.current.textContent = Math.round(obj.v) + stat.suffix;
          }
        },
      });

      // Tiny scale pulse on the number when it finishes — the "landing"
      // moment that makes the count-up feel deliberate.
      gsap.fromTo(
        numRef.current,
        { scale: 0.94 },
        {
          scale: 1,
          duration: 0.55,
          ease: "back.out(2.2)",
          delay: startDelay + 2.5,
        }
      );
    },
    { scope: wrapRef, dependencies: [shouldAnimate] }
  );

  const alignCls =
    stat.align === "right" ? "items-end text-right" : "items-center text-center";

  if (mobile) {
    // Mobile — fluid widths via parent grid; numbers scale from 28→36.558 px
    // across the xs / sm breakpoints so 3 tiles always fit a 375 px row.
    return (
      <div
        ref={wrapRef}
        data-stat
        className="flex flex-col gap-[2px] text-[#333] items-center text-center w-full"
      >
        <span
          ref={numRef}
          className="capitalize text-[28px] xs:text-[32px] sm:text-[36.558px] leading-[1.1] tracking-[0.03em]"
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
          }}
        >
          0{stat.suffix}
        </span>
        <span
          className="font-montserrat font-normal text-[10px] xs:text-[11px] sm:text-[11.49px] leading-[1.6] whitespace-pre-line px-1"
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {stat.label}
        </span>
      </div>
    );
  }

  if (bottomRow) {
    // Desktop bottom-row variant — same tile typography as the curve layout
    // but laid out in normal flow so the tiles sit evenly along the bottom.
    return (
      <div
        ref={wrapRef}
        data-stat
        className="flex flex-1 flex-col gap-[0.26vw] leading-[0] text-[#333] items-center text-center"
      >
        <span
          ref={numRef}
          className="font-tartuffo-reg capitalize text-[3.65vw] leading-[5.21vw] tracking-[0.109vw]"
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
          }}
        >
          0{stat.suffix}
        </span>
        <span
          className="block font-montserrat font-normal text-[1.146vw] leading-[1.823vw] whitespace-pre-line"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {stat.label}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      data-stat
      className={`absolute flex flex-col gap-[0.26vw] leading-[0] text-[#333] ${alignCls}`}
      style={stat.style}
    >
      <span
          ref={numRef}
          className="font-tartuffo-reg capitalize text-[3.65vw] leading-[5.21vw] tracking-[0.109vw]"
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
          }}
        >
        0{stat.suffix}
      </span>
      <span
        className="block font-montserrat font-normal text-[1.146vw] leading-[1.823vw] whitespace-pre-line"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        {stat.label}
      </span>
    </div>
  );
}

export default function Statistics({ data }) {
  const [statsInView, setStatsInView] = useState(false);
  // Merge backend stat values onto design-fixed positions by index.
  const STATS = STAT_LAYOUT.map((pos, i) => {
    const s = data?.stats?.[i];
    if (!s) return null;
    return {
      ...pos,
      value: typeof s.value === "number" ? s.value : 0,
      suffix: s.suffix || "",
      label: s.label || "",
    };
  }).filter(Boolean);

  const rootRef = useRef(null);

  useEffect(() => {
    // Reset when data changes / when the user navigates back.
    setStatsInView(false);

    if (!rootRef.current) return;

    const el = rootRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStatsInView(true);
          observer.disconnect();
        }
      },
      {
        // Start a bit before the section is fully in view for better UX.
        threshold: 0.15,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const labelRef = useRef(null);
  const headingRef = useRef(null);
  const paraRef = useRef(null);
  const cityRef = useRef(null);
  const curveRef = useRef(null);
  const statsWrapRef = useRef(null);
  const birdsTopRef = useRef(null);
  const birdsBottomRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();

      // ---- Initial state — matches Figma frame …875 (everything tucked away).
      //      A bit of scale + blur on stats so the entrance feels filmic,
      //      not a hard fade.
      gsap.set("[data-heading]", { y: -60, autoAlpha: 0 });
      gsap.set(labelRef.current, { y: -60, autoAlpha: 0 });
      gsap.set("[data-body]", { y: 40, autoAlpha: 0 });
      gsap.set(cityRef.current, { yPercent: 32, autoAlpha: 0 });
      gsap.set(curveRef.current, { yPercent: 28, autoAlpha: 0 });
      // gsap.set("[data-stat]", {
      //   y: 56,
      //   autoAlpha: 0,
      //   scale: 0.94,
      //   filter: "blur(6px)",
      // });
      gsap.set([birdsTopRef.current, birdsBottomRef.current], {
        autoAlpha: 0,
        scale: 0.82,
        y: -18,
      });

      // word-mask the heading once we're scrolled into view
      const words = splitToWords(headingRef.current);
      gsap.set(words, { yPercent: 110 });

      // Soft custom easing for a velvet feel — slow start, slow finish.
      const VELVET = "cubic-bezier(0.22, 1, 0.36, 1)";

      // ---- Main timeline (Figma 875 → 876 → 877). One pass, no scrub,
      //      reverses if the user scrolls back out.
      const tl = gsap.timeline({
        defaults: { ease: VELVET, duration: 1.4 },
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 78%",
          end: "bottom 55%",
          toggleActions: "play none none reverse",
        },
      });

      // Phase 1 (frame 876) — heading + label drop in, city + curve glide up.
      // City moves slowest so the eye reads the heading first, then the
      // skyline reveals beneath it, then the curve threads through.
      tl.to(
        ["[data-heading]", labelRef.current],
        { y: 0, autoAlpha: 1, duration: 1.6, stagger: 0.08 },
        0
      )
        .to(
          words,
          { yPercent: 0, duration: 1.5, stagger: 0.085, ease: "expo.out" },
          0.05
        )
        .to(
          "[data-body]",
          { y: 0, autoAlpha: 1, duration: 1.2 },
          0.55
        )
        .to(
          cityRef.current,
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 2.0,
            ease: "expo.out",
          },
          0.25
        )
        .to(
          curveRef.current,
          { yPercent: 0, autoAlpha: 1, duration: 1.7, ease: "expo.out" },
          0.6
        )
        // Phase 2 (frame 877) — stats reveal: blur clears, scale settles,
        // numbers count up via each tile's own once-only ScrollTrigger.
        // .to(
        //   "[data-stat]",
        //   {
        //     y: 0,
        //     autoAlpha: 1,
        //     scale: 1,
        //     filter: "blur(0px)",
        //     duration: 1.3,
        //     stagger: 0.18,
        //     ease: "expo.out",
        //   },
        //   1.05
        // )
        // Birds drift in last as a quiet accent.
        .to(
          [birdsTopRef.current, birdsBottomRef.current],
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 1.5,
            stagger: 0.22,
            ease: "expo.out",
          },
          1.55
        );

      // ---- Ambient: birds drift up-down forever so the section never feels
      //      static after the entrance lands.
      gsap.to(birdsTopRef.current, {
        y: "-=10",
        duration: 2.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 3.5,
      });
      gsap.to(birdsBottomRef.current, {
        y: "-=8",
        duration: 2.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 3.8,
      });

    },
    { scope: rootRef }
  );

  if (!data) return null;

  const cityImage = mediaUrl(data.cityImage);
  // Decorative SVGs — managed in /public, not in the CMS.
  const curveImage = "/assets/myhome/stats-curve.svg";
  const birdsTopImage = "/assets/myhome/stats-birds-1.svg";
  const birdsBottomImage = "/assets/myhome/stats-birds-2.svg";

  return (
    <section
      ref={rootRef}
      id="statistics"
      data-section="statistics"
      className="relative w-full bg-white overflow-hidden lg:h-[80vw] lg:min-h-[900px] lg:max-h-[1560px]"
    >
      {/* ===== Top decorative birds (Figma group2199755 — desktop only)
          inset-[8.46%_13.23%_86%_79.58%] resolves to 138×72 px on a 1920×1300
          frame → 7.187vw × 3.75vw. */}
      <div
        ref={birdsTopRef}
        className="hidden lg:block absolute z-[3] pointer-events-none"
        style={{ top: "8.46%", right: "13.23%", width: "7.187vw", height: "3.75vw" }}
      >
        {birdsTopImage && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={birdsTopImage}
            alt=""
            className="block w-full h-full select-none"
          />
        )}
      </div>

      {/* ===== Bottom decorative birds (Figma group2199756 — desktop only)
          inset-[68.15%_75.52%_28.36%_20.16%] → 83×45 px → 4.323vw × 2.343vw. */}
      <div
        ref={birdsBottomRef}
        className="hidden lg:block absolute z-[3] pointer-events-none"
        style={{
          top: "68.15%",
          left: "20.16%",
          width: "4.323vw",
          height: "2.343vw",
          transform: "scaleX(-1)",
        }}
      >
        {birdsBottomImage && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={birdsBottomImage}
            alt=""
            className="block w-full h-full select-none"
          />
        )}
      </div>

      {/* ===== Hand-drawn curve line — DESKTOP ONLY
          Figma curve: 2011.812 × 316.963 px on a 1920-wide design →
          104.78vw × 16.51vw. Wrapped in a 2021.6 × 386.6 container
          (105.29vw × 20.13vw) which contains the rotation. */}
      <div
        ref={curveRef}
        className="hidden lg:block absolute z-[2] pointer-events-none will-change-transform
                   top-[41.46%] left-[calc(45.83%-2.072vw)] w-[105.29vw] h-[20.13vw]
                   flex items-center justify-center"
        style={{
          transform: "translateX(-50%)",
          transformOrigin: "center",
        }}
      >
        <div
          className="w-[104.78vw] h-[16.51vw]"
          style={{
            transform: "rotate(1.99deg) scaleY(-1)",
            transformOrigin: "center",
          }}
        >
          {curveImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={curveImage}
              alt=""
              className="block w-full h-full opacity-70 select-none"
            />
          )}
        </div>
      </div>

      {/* ===== City skyline panorama — full-bleed responsive.
          Mobile: spans the section width (no fixed 850px overflow).
          Desktop: anchored to bottom 68.31% of the 1300-px section. */}
      <div
        ref={cityRef}
        className="absolute z-[1] inset-x-0 bottom-0 lg:bottom-[11vw] will-change-transform pointer-events-none
                   h-[40vh] sm:h-[44vh] md:h-[48vh] lg:h-[46.25vw]"
      >
        {cityImage && (
          <Image
            src={cityImage}
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="object-cover object-bottom select-none"
          />
        )}
        {/* soft top-fade so text reads above the photo */}
        {/* <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-white via-white/60 to-transparent" /> */}
      </div>

      {/* ===== Side label (Figma 3152:3759 mobile / 2609:1679 desktop)
          Mobile — left:12 top:30 w:28 gap:11 tick h:31 text container h:55 (12px)
          Desktop — left:[4.166vw] top:[4.166vw] gap:[1.094vw] (24px) */}
      <div
        ref={labelRef}
        className="absolute z-[5] flex flex-col items-center
                   left-[12px] top-[30px] w-[28px] gap-[11px]
                   lg:left-[4.166vw] lg:top-[4.166vw] lg:w-[2.812vw] lg:gap-[1.094vw]"
        style={{ color: "#ef493d" }}
      >
        <span
          className="block w-px h-[31px] lg:h-[3.125vw]"
          style={{ background: "currentColor" }}
        />
        <span
          className="font-montserrat font-medium capitalize whitespace-nowrap text-[12px] lg:text-[1.25vw]"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {data.label}
        </span>
      </div>

      {/* ============================================================
           MOBILE & TABLET ( <lg ) — fully fluid, normal-flow layout.
           Drops Figma's 500-px absolute coordinates and uses padding +
           grid so it adapts to 320 / 360 / 375 / 414 / 768 px viewports.
         ============================================================ */}
      <div className="lg:hidden relative z-[5] pt-[64px] sm:pt-[80px] pb-[36vh] sm:pb-[40vh]">
        <SectionHeading
          ref={headingRef}
          data-heading
          className="px-5 sm:px-8 pl-[52px] sm:pl-[72px] pr-5 sm:pr-8 capitalize text-[#333] tracking-[1.5px] leading-[1.18] text-[26px] xs:text-[30px] sm:text-[35px] will-change-transform"
        >
          {data.heading}
        </SectionHeading>
        <p
          ref={paraRef}
          data-body
          className="mt-4 sm:mt-5 px-5 sm:px-8 pl-[52px] sm:pl-[72px] pr-5 sm:pr-8 font-montserrat font-normal text-[#333] text-justify text-[13px] xs:text-[14px] leading-[22px] xs:leading-[24px] max-w-[460px]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <RichText>{data.body}</RichText>
        </p>

        {/* Stats Row 1 — first 3 tiles */}
        {STATS.length > 0 && (
          <div className="mt-10 sm:mt-14 grid grid-cols-3 gap-2 xs:gap-3 sm:gap-5 px-3 xs:px-4 sm:px-6">
            {STATS.slice(0, 3).map((s, i) => (
              <StatItem key={`m1-${i}`} stat={s} index={i} shouldAnimate={statsInView} mobile />
            ))}
          </div>
        )}

        {/* Stats Row 2 — remaining tiles */}
        {STATS.length > 3 && (
          <div className="mt-8 max-sm:mb-[35px] sm:mt-10 grid grid-cols-2 gap-4 xs:gap-6 sm:gap-10 max-w-[260px] xs:max-w-[300px] sm:max-w-[340px] mx-auto">
            {STATS.slice(3).map((s, i) => (
              <StatItem key={`m2-${i}`} stat={s} index={i + 3} shouldAnimate={statsInView} mobile />
            ))}
          </div>
        )}
      </div>

      {/* ============================================================
           DESKTOP ( ≥lg ) — heading + body absolute-positioned at exact
           Figma coords. Separate elements so the mobile flow above stays
           clean and breakpoint-independent.
         ============================================================ */}
      {/*  Desktop heading + body live inside ONE absolute flex-column wrapper
          so the Figma's `gap:30` between them is automatic regardless of how
          many lines the heading breaks into. Wrapper position matches the
          Figma header origin exactly: top:80 (=4.166vw), left:214 (=11.15vw),
          width:899 (=46.823vw).  */}
      <div
        className="hidden lg:flex absolute z-[5] flex-col gap-[1.563vw] top-[4.166vw] left-[11.15vw] w-[46.823vw]"
      >
        <h2
          data-heading
          className="capitalize text-[#333] will-change-transform text-[5vw] tracking-[0.02em] leading-[1.1]"
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
          }}
        >
          {data.heading}
        </h2>
        <p
          data-body
          className="font-montserrat font-normal text-justify text-[#6d6d6d] w-[26.197vw] text-[0.938vw] leading-[1.563vw]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <RichText>{data.body}</RichText>
        </p>
      </div>

      {/* ===== Desktop: stats laid out as an even row along the bottom ===== */}
      <div
        ref={statsWrapRef}
        className="hidden lg:flex absolute inset-x-0 bottom-[2.5vw] z-[5] pointer-events-none
                   px-[8.333vw] items-start justify-between gap-[2.083vw]"
      >
        {STATS.map((s, i) => (
          <StatItem
            key={s.label}
            stat={s}
            index={i}
            shouldAnimate={statsInView}
            bottomRow
          />
        ))}
      </div>
    </section>
  );
}
