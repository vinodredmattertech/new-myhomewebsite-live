import React, { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { mediaUrl, relationList } from "@/lib/strapi";
import RichText from "@/components/common/RichText";
import SectionHeading from "@/components/common/SectionHeading";

/**
 * Worlds We Shape — Figma node 3152:3436
 *
 * Three stacked cards on the left (front = active, middle 4° tilt + white
 * tint, back 8° tilt + white tint). Right column holds the slide number,
 * title, body and prev/next arrows. On nav, both the card stack and the
 * right copy crossfade to the next slide via one synchronized GSAP timeline.
 */
/**
 * 3 stacked card positions in vw, derived from Figma:
 *   front (active):  left:0 top:358 w:1044 h:626
 *   middle (off-1):  left:120.37 top:363.05 w:966.85 h:621.30 rotate:4°
 *   back   (off-2):  left:222.35 top:371.89 w:898.9 h:613.62 rotate:8°
 * Section ref width 1920, so 1px = 0.0521vw.
 */
const CARD_LAYOUT = [
  { left: "0", top: "18.646vw", width: "54.375vw", height: "32.604vw", rotate: 0, tint: 0 },
  { left: "6.27vw", top: "18.908vw", width: "50.357vw", height: "32.359vw", rotate: 4, tint: 0.37 },
  { left: "11.581vw", top: "19.369vw", width: "46.823vw", height: "31.959vw", rotate: 8, tint: 0.37 },
];

export default function WorldsWeShape({ data }) {
  console.log("feature data", data)
  // Source is the `verticals` relation (collection type) — flatten the
  // v4 envelope and map to the shape the rest of the section expects.
  const rawVerticals = relationList(data?.verticals);
  // Sort by `order` if provided so the admin can rearrange without code.
  rawVerticals.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const SLIDES = rawVerticals.map((v, i) => ({
    id: v.number || String(i + 1).padStart(2, "0"),
    title: v.title || "",
    body: v.body || "",
    image: mediaUrl(v.image),
  }));

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const introBodyRef = useRef(null);
  const labelRef = useRef(null);
  const cardsRef = useRef([]);
  const numberRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const mobileImageRef = useRef(null);

  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);

  useGSAP(
    () => {
      if (!rootRef.current) return;
      registerGsap();

      const titleWords = splitToWords(headingRef.current);
      if (titleWords.length) {
        gsap.set(titleWords, { yPercent: 110, rotate: 4 });
        gsap.to(titleWords, {
          yPercent: 0,
          rotate: 0,
          duration: 1.15,
          stagger: 0.075,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
        });
      }
      const introTargets = [introBodyRef.current, labelRef.current].filter(Boolean);
      if (introTargets.length) {
        gsap.from(introTargets, {
          y: 30,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 70%" },
        });
      }
      // Entrance: cards rise into stack
      cardsRef.current.filter(Boolean).forEach((card, i) => {
        gsap.from(card, {
          y: 70,
          autoAlpha: 0,
          duration: 1.2,
          delay: i * 0.12,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 60%" },
        });
      });
      // Right column entrance
      const copyTargets = [numberRef.current, titleRef.current, descRef.current].filter(Boolean);
      if (copyTargets.length) {
        gsap.from(copyTargets, {
          y: 40,
          autoAlpha: 0,
          duration: 1.0,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 55%" },
        });
      }
    },
    { scope: rootRef }
  );

  /** Smooth slide change — short veil → swap → long graceful entrance.
   *  The user spends most of the animation watching the new slide ease
   *  into place (0.55s with expo.out) instead of watching the old one
   *  leave, which is what makes the change "feel" smooth instead of
   *  choppy. One shared autoAlpha tween keeps image + text fading
   *  together (no drift). Sine ease on exit + expo on enter creates a
   *  single continuous-feeling curve. */
  const navigate = (dir) => {
    if (busy) return;
    setBusy(true);
    const newActive = (active + dir + SLIDES.length) % SLIDES.length;

    const cards = cardsRef.current.filter(Boolean);
    const copy = [numberRef.current, titleRef.current, descRef.current];
    const all = [...cards, ...copy, mobileImageRef.current].filter(Boolean);

    const EXIT = 0.18;
    const ENTER = 0.55;
    const xOut = dir > 0 ? -18 : 18;
    const xIn = -xOut;

    const tl = gsap.timeline({ onComplete: () => setBusy(false) });

    // ===== EXIT (short, soft) =====
    tl.to(all, { autoAlpha: 0, duration: EXIT, ease: "sine.in" }, 0)
      .to(cards, { x: xOut, duration: EXIT, ease: "sine.in" }, 0)

      // ===== SWAP (invisible) =====
      .add(() => setActive(newActive), EXIT)

      // ===== ENTER (long, graceful expo.out — this is the part the user feels) =====
      .set(cards, { x: xIn }, EXIT)
      .to(all, { autoAlpha: 1, duration: ENTER, ease: "expo.out" }, EXIT)
      .to(cards, { x: 0, duration: ENTER, ease: "expo.out" }, EXIT);
  };

  // Stacked cards display slides in cycling order — front shows active,
  // middle shows next, back shows next-next. This way every card always
  // has a slide image so the visual stack is continuous.
  const cardSlide = (offset) =>
    SLIDES[(active + offset) % SLIDES.length];

  if (!data || !SLIDES.length) return null;

  return (
    <section
      ref={rootRef}
      id="verticals"
      data-section="verticals"
      className="relative w-full bg-[#fff] text-[#333] overflow-hidden
                 min-h-[960px]
                 lg:h-[56.25vw] lg:min-h-[700px] lg:max-h-[1080px]"
    >
      {/* ===== Side label "Our Verticals" (Figma 3152:3437)
          left:80 top:60 w:54 tick h:60 gap:21 text 24 white */}
      <div
        ref={labelRef}
        className="absolute z-[5] flex flex-col items-center
                   left-[12px] top-[24px] gap-[11px] w-[28px]
                   lg:left-[4.166vw] lg:top-[3.125vw] lg:w-[2.812vw] lg:gap-[1.094vw]"
        style={{ color: "#333" }}
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

      {/* ===== Heading "Worlds We Shape"
          Mobile (Figma 3152:3785) — top:56 left:[max(52px,calc(50%-180px))] w:337 text:35 tracking:2
          Desktop (Figma 3152:3441) — top:[3.125vw] centered, w:[40.833vw], text:[5vw] */}
      <SectionHeading
        ref={headingRef}
        className="absolute z-[5] capitalize text-[#333] will-change-transform
                   left-[max(52px,calc(50%-180px))] top-[56px] w-[337px] max-w-[calc(100vw-64px)]
                   text-[35px] tracking-[2px] leading-[1.2]
                   lg:left-[calc(50%-18.437vw)] lg:translate-x-[-50%] lg:top-[3.125vw]
                   lg:w-[40.833vw] lg:max-w-none lg:text-[5vw] lg:tracking-[0.02em] lg:leading-[normal]"
      >
        {data.heading}
      </SectionHeading>

      {/* ===== Intro body (Figma 3152:3787 mobile / 3152:3442 desktop)
          Mobile — top:123 left:[max(52px,calc(50%-180px))] w:365 text:14/24 text-justify
          Desktop — under heading at calc(50% - 18.437vw), w:[36.979vw], text:[0.938vw]/leading:[1.563vw] */}
      <p
        ref={introBodyRef}
        className="absolute z-[5] font-montserrat font-normal text-[#333] text-justify
                   left-[max(52px,calc(50%-180px))] top-[123px] w-[365px] max-w-[calc(100vw-64px)]
                   text-[14px] leading-[24px]
                   lg:left-[calc(50%-18.437vw)] lg:translate-x-[-50%] lg:top-[10.687vw]
                   lg:w-[36.979vw] lg:max-w-none lg:text-[0.938vw] lg:leading-[1.563vw]"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        <RichText>{data.body}</RichText>
      </p>

      {/* ===== DESKTOP — 3 stacked rotated cards (Figma 3152:3443–3445)
          Each card is rendered at fixed coords (front / middle / back).
          The image inside cycles through SLIDES so a slide change
          re-renders all three with new sources. */}
      <div className="hidden lg:block">
        {CARD_LAYOUT.map((pos, i) => {
          const slide = cardSlide(i); // i=0 front, i=1 middle, i=2 back
          return (
            <div
              key={`card-${i}`}
              ref={(el) => (cardsRef.current[i] = el)}
              className="absolute pointer-events-none will-change-transform"
              style={{
                left: pos.left,
                top: pos.top,
                width: pos.width,
                height: pos.height,
                zIndex: 3 - i, // front has highest z
              }}
            >
              <div
                className="absolute inset-0 overflow-hidden rounded-[4px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
                style={{
                  transform: `rotate(${pos.rotate}deg)`,
                  transformOrigin: "center",
                }}
              >
                {slide.image && (
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    unoptimized
                    sizes="55vw"
                    className="object-cover object-center"
                  />
                )}
                {pos.tint > 0 && (
                  <div
                    className="absolute inset-0"
                    style={{ background: `rgba(255,255,255,${pos.tint})` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== MOBILE — 3 stacked rotated cards (Figma 3152:3792–3795)
          Container at top:266.72. The 3 cards are absolutely positioned
          inside a centered relative wrapper so they overlap with rotation. */}
      <div
        ref={mobileImageRef}
        className="lg:hidden absolute z-[3] left-0 right-0 top-[267px] pointer-events-none"
      >
        <div className="relative mx-auto w-[min(440px,calc(100vw-32px))]">
          {/* Back card (Figma 3152:3793) — w:341.97 h:205.05 rotated 8° */}
          <div
            className="absolute will-change-transform shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)]"
            style={{
              left: "21.32%", // (117.82 - 27) / 426.643
              top: "2.32%",   // (272.68 - 266.72) / 256.556
              width: "80.15%", // 341.97 / 426.643
              transform: "rotate(8deg)",
              transformOrigin: "center",
              zIndex: 1,
            }}
          >
            <div className="relative w-full aspect-[341.97/205.05] overflow-hidden rounded-[4px]">
              {cardSlide(2).image && (
                <Image
                  src={cardSlide(2).image}
                  alt={cardSlide(2).title}
                  fill
                  unoptimized
                  sizes="(max-width:500px) 80vw, 340px"
                  className="object-cover object-center"
                />
              )}
              <div className="absolute inset-0 bg-white/[0.37]" />
            </div>
          </div>

          {/* Middle card (Figma 3152:3794) — w:379.96 h:227.83 rotated 4° */}
          <div
            className="absolute will-change-transform shadow-[0_25px_50px_-15px_rgba(0,0,0,0.65)]"
            style={{
              left: "11.52%", // (76.17 - 27) / 426.643
              top: "0.92%",   // (269.07 - 266.72) / 256.556
              width: "89.06%", // 379.96 / 426.643
              transform: "rotate(4deg)",
              transformOrigin: "center",
              zIndex: 2,
            }}
          >
            <div className="relative w-full aspect-[379.96/227.83] overflow-hidden rounded-[4px]">
              {cardSlide(1).image && (
                <Image
                  src={cardSlide(1).image}
                  alt={cardSlide(1).title}
                  fill
                  unoptimized
                  sizes="(max-width:500px) 89vw, 380px"
                  className="object-cover object-center"
                />
              )}
              <div className="absolute inset-0 bg-white/[0.37]" />
            </div>
          </div>

          {/* Front card (Figma 3152:3795) — full 426×256, no rotation */}
          <div
            ref={(el) => (cardsRef.current[0] = el)}
            className="relative w-full aspect-[426.643/256.556] rounded-[4px] overflow-hidden
                       will-change-transform shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] z-[3]"
          >
            {cardSlide(0).image && (
              <Image
                src={cardSlide(0).image}
                alt={cardSlide(0).title}
                fill
                unoptimized
                sizes="(max-width:500px) 90vw, 426px"
                className="object-cover object-center"
              />
            )}
          </div>
        </div>
      </div>

      {/* ===== Right column — DESKTOP absolute, MOBILE flow below cards
          Desktop (Figma 3152:3446): left:1279 top:358 w:502
          Mobile (Figma 3152:3788): left:55 top:559 w:365 gap:20 */}
      <div
        className="absolute z-[5]
                   left-[max(40px,calc(50%-180px))] top-[559px] w-[min(365px,calc(100vw-80px))]
                   flex flex-col gap-[20px]
                   lg:left-[66.614vw] lg:top-[18.646vw] lg:w-[26.146vw] lg:gap-[1.823vw] lg:max-w-none"
      >
        <span
          ref={numberRef}
          className="text-[#ef493d] opacity-40 leading-[1] block
                     text-[35px] tracking-[1.05px]
                     lg:text-[3.646vw] lg:leading-[4.687vw] lg:tracking-[2.1px]"
          style={{
            fontFamily:
              '"Beautique Display Condensed","Big Shoulders Display","Oswald","Montserrat",sans-serif',
            fontWeight: 400,
          }}
        >
          {SLIDES[active].id}
        </span>
        <h3
          ref={titleRef}
          className="capitalize text-[#333]
                     text-[26px] tracking-[0.52px] leading-[36px]
                     lg:text-[3.125vw] lg:tracking-[0.02em] lg:leading-[4.167vw]
                     "
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
          }}
        >
          {SLIDES[active].title}
        </h3>
        <p
          ref={descRef}
          className="font-montserrat font-normal text-[#333] text-justify
                     text-[14px] leading-[24px]
                     lg:capitalize lg:text-[0.938vw] lg:leading-[1.667vw]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <RichText>{SLIDES[active].body}</RichText>
        </p>
      </div>

      {/* ===== Arrows
          Mobile (Figma 3152:3796): centered at top:872, 46×46, gap:13
          Desktop (Figma 3152:3451): left:1279 top:901, 70×70, gap:20 */}
      <div
        className="absolute z-[5]
                   left-1/2 -translate-x-1/2 top-[872px]
                   flex items-center gap-[13px]
                   lg:left-[66.614vw] lg:translate-x-0 lg:top-[46.93vw] lg:gap-[1.042vw] max-sm:mt-[25px]"
      >
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => navigate(-1)}
          className="group inline-flex items-center justify-center rounded-full border border-[#333]/35 text-[#333]
                     w-[46px] h-[46px] lg:w-[3.646vw] lg:h-[3.646vw]
                     transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                     hover:bg-[#ef493d] hover:border-[#ef493d]"
        >
          <svg viewBox="0 0 22 14" fill="none" className="w-[16px] lg:w-[1.146vw] h-auto">
            <path
              d="M0.293 6.293L6.586 0 8 1.414 4.414 5 22 5v2H4.414L8 10.586 6.586 12 .293 5.707a1 1 0 010-1.414z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => navigate(1)}
          className="group inline-flex items-center justify-center rounded-full border border-[#333]/35 text-[#333]
                     w-[46px] h-[46px] lg:w-[3.646vw] lg:h-[3.646vw]
                     transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                     hover:bg-[#ef493d] hover:border-[#ef493d]"
        >
          <svg viewBox="0 0 22 14" fill="none" className="w-[16px] lg:w-[1.146vw] h-auto">
            <path
              d="M21.707 7.707L15.414 14 14 12.586 17.586 9H0V7h17.586L14 3.414 15.414 2l6.293 6.293a1 1 0 010 1.414z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* counter — desktop only (Figma mobile has just arrows) */}
        <span className="hidden lg:inline-block font-montserrat text-white/55 lg:text-[0.833vw] tracking-[0.12em] lg:ml-[0.8vw]">
          {String(active + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
}
