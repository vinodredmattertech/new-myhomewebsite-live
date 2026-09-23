import React, { useLayoutEffect, useRef, useState } from "react";
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
 * The card stack, as transforms rather than positions.
 *
 * Every card renders into the SAME base box — the front slot — and its place
 * in the stack is a transform on top of that. This is what lets a slide change
 * be one continuous tween per card: moving a card between slots is then pure
 * transform work, where animating left/top/width/height on five full-bleed
 * images would thrash layout every frame and judder.
 *
 * The desktop slots are NOT a uniform scale. From Figma, width drops 7.4% per
 * step back while height drops only 0.75%, so scaleX and scaleY are carried
 * separately. Mobile's three cards do share one aspect ratio, so there a
 * single scale is exact.
 *
 * Slots either side of the visible three are staged at opacity 0: -1 is where
 * the front card exits to (and where the previous card enters from), 3 is
 * where the next card waits. Rendering them means both directions have a real
 * element to animate instead of popping one into existence mid-move.
 *
 * Derived from the original Figma boxes (section ref width 1920, 1px = 0.0521vw):
 *   front  left:0        top:358     w:1044    h:626
 *   middle left:120.37   top:363.05  w:966.85  h:621.30  rotate:4°
 *   back   left:222.35   top:371.89  w:898.9   h:613.62  rotate:8°
 */
const CARD_BASE = {
  left: "0",
  top: "18.646vw",
  width: "54.375vw",
  height: "32.604vw",
};

/** Which slots get a DOM node. -1 and 3 are the staging positions. */
const STACK_SLOTS = [-1, 0, 1, 2, 3];

const SLOT_DESKTOP = {
  "-2": { xPercent: -170, yPercent: 0, scaleX: 1, scaleY: 1, rotate: -10, opacity: 0, tint: 0 },
  "-1": { xPercent: -120, yPercent: 0, scaleX: 1, scaleY: 1, rotate: -6, opacity: 0, tint: 0 },
  "0": { xPercent: 0, yPercent: 0, scaleX: 1, scaleY: 1, rotate: 0, opacity: 1, tint: 0 },
  "1": { xPercent: 7.836, yPercent: 0.428, scaleX: 0.9261, scaleY: 0.9925, rotate: 4, opacity: 1, tint: 0.37 },
  "2": { xPercent: 14.354, yPercent: 1.228, scaleX: 0.8611, scaleY: 0.9802, rotate: 8, opacity: 1, tint: 0.37 },
  "3": { xPercent: 19.78, yPercent: 2.39, scaleX: 0.8016, scaleY: 0.968, rotate: 12, opacity: 0, tint: 0.37 },
  "4": { xPercent: 24.5, yPercent: 3.5, scaleX: 0.75, scaleY: 0.955, rotate: 16, opacity: 0, tint: 0.37 },
};

const SLOT_MOBILE = {
  "-2": { xPercent: -170, yPercent: 0, scaleX: 1, scaleY: 1, rotate: -10, opacity: 0, tint: 0 },
  "-1": { xPercent: -120, yPercent: 0, scaleX: 1, scaleY: 1, rotate: -6, opacity: 0, tint: 0 },
  "0": { xPercent: 0, yPercent: 0, scaleX: 1, scaleY: 1, rotate: 0, opacity: 1, tint: 0 },
  "1": { xPercent: 6.05, yPercent: -4.55, scaleX: 0.8906, scaleY: 0.8906, rotate: 4, opacity: 1, tint: 0.37 },
  "2": { xPercent: 11.395, yPercent: -7.605, scaleX: 0.8015, scaleY: 0.8015, rotate: 8, opacity: 1, tint: 0.37 },
  "3": { xPercent: 16.1, yPercent: -10.2, scaleX: 0.722, scaleY: 0.722, rotate: 12, opacity: 0, tint: 0.37 },
  "4": { xPercent: 20.5, yPercent: -12.5, scaleX: 0.65, scaleY: 0.65, rotate: 16, opacity: 0, tint: 0.37 },
};

/** Front card sits highest; the exiting card rides above everything. */
const slotZ = (slot) => 10 - slot;

const slotProps = (table, slot) => table[String(slot)] || table["4"];

/** How long one shuffle takes. */
const SHUFFLE = 0.9;

export default function WorldsWeShape({ data }) {
  // Source is the `verticals` relation (collection type) — flatten the
  // v4 envelope and map to the shape the rest of the section expects.
  // Strapi returns a relation in join/id order, not by `number`, so sort
  // explicitly — otherwise the stack reads 01, 03, 04, 06, 05. Entries with
  // no usable number keep their original position at the end.
  const rawVerticals = relationList(data?.verticals);
  const SLIDES = rawVerticals
    .map((v, i) => ({
      id: v.number || "",
      title: v.title || "",
      body: v.body || "",
      image: mediaUrl(v.image),
      _order: Number.parseInt(v.number, 10),
      _i: i,
    }))
    .sort((a, b) => {
      const aNum = Number.isNaN(a._order);
      const bNum = Number.isNaN(b._order);
      if (aNum && bNum) return a._i - b._i;
      if (aNum) return 1;
      if (bNum) return -1;
      return a._order - b._order || a._i - b._i;
    });

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const introBodyRef = useRef(null);
  const labelRef = useRef(null);
  // One node per STACK_SLOTS entry, per breakpoint. Both trees are in the DOM
  // at all times (CSS hides one), so both are driven — animating the hidden
  // one costs nothing and means the stack is already correct if the viewport
  // crosses the breakpoint.
  const deskCardsRef = useRef([]);
  const deskTintsRef = useRef([]);
  const mobCardsRef = useRef([]);
  const mobTintsRef = useRef([]);
  const shufflingRef = useRef(false);
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
      // Entrance: the visible cards rise into the stack. Only y and a fade —
      // the slot transform owns everything else, so this must not touch
      // xPercent/scale/rotate or it would fight the layout effect below.
      [deskCardsRef, mobCardsRef].forEach((group) => {
        STACK_SLOTS.forEach((slot, k) => {
          const card = group.current[k];
          if (!card || slot < 0 || slot > 2) return;
          gsap.from(card, {
            y: 70,
            duration: 1.2,
            delay: slot * 0.12,
            ease: "expo.out",
            scrollTrigger: { trigger: rootRef.current, start: "top 60%" },
          });
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

  /** Every card node paired with the slot it currently occupies. */
  const stackGroups = () => [
    { cards: deskCardsRef.current, tints: deskTintsRef.current, table: SLOT_DESKTOP },
    { cards: mobCardsRef.current, tints: mobTintsRef.current, table: SLOT_MOBILE },
  ];

  /**
   * Drop every card onto its base slot with no animation.
   *
   * Deliberately does not touch `y`: the scroll entrance is a `gsap.from`
   * on `y`, which renders its start value immediately, and writing y here
   * would flatten the rise before it ever played. Nothing in the shuffle
   * animates `y` on a card, so it needs no resetting.
   */
  const seatCards = () => {
    stackGroups().forEach(({ cards, tints, table }) => {
      STACK_SLOTS.forEach((slot, k) => {
        const card = cards[k];
        if (!card) return;
        const t = slotProps(table, slot);
        gsap.set(card, {
          xPercent: t.xPercent,
          yPercent: t.yPercent,
          scaleX: t.scaleX,
          scaleY: t.scaleY,
          rotate: t.rotate,
          autoAlpha: t.opacity,
          zIndex: slotZ(slot),
        });
        if (tints[k]) gsap.set(tints[k], { opacity: t.tint });
      });
    });
  };

  /**
   * Re-seat the stack the moment React has swapped the images in, before the
   * browser paints. `useLayoutEffect` rather than `useEffect` is the whole
   * trick: the cards finish the shuffle sitting one slot away from where they
   * belong, and `active` changing re-renders them with the next set of
   * images. Re-seating after paint would show one frame of the new images at
   * the old positions.
   */
  useLayoutEffect(() => {
    seatCards();

    if (!shufflingRef.current) return;
    shufflingRef.current = false;

    // The copy was faded out as the shuffle began; bring it back with the
    // card that just landed.
    const copy = [numberRef.current, titleRef.current, descRef.current].filter(Boolean);
    if (copy.length) {
      gsap.fromTo(
        copy,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: "expo.out", stagger: 0.05 }
      );
    }
  }, [active]);

  /**
   * Shuffle the deck by one.
   *
   * Each card tweens from the slot it holds to the neighbouring one: going
   * forward the front card leaves to the left, the middle promotes to front,
   * the back to middle, and the card staged behind it fades up into back.
   * Going back, the same chain runs the other way. One tween per card, no
   * cross-fade — the previous version faded the entire stack to zero and
   * back, so the cards never moved and the change read as a flicker.
   */
  const navigate = (dir) => {
    if (busy) return;
    setBusy(true);
    shufflingRef.current = true;

    const newActive = (active + dir + SLIDES.length) % SLIDES.length;
    const tl = gsap.timeline({
      onComplete: () => {
        setActive(newActive);
        setBusy(false);
      },
    });

    stackGroups().forEach(({ cards, tints, table }) => {
      STACK_SLOTS.forEach((slot, k) => {
        const card = cards[k];
        if (!card) return;
        const target = slot - dir;
        const t = slotProps(table, target);

        // z-order has to flip up front, not at the end, or the exiting card
        // slides out underneath the one taking its place.
        tl.set(card, { zIndex: slotZ(target) }, 0);
        tl.to(
          card,
          {
            xPercent: t.xPercent,
            yPercent: t.yPercent,
            scaleX: t.scaleX,
            scaleY: t.scaleY,
            rotate: t.rotate,
            autoAlpha: t.opacity,
            duration: SHUFFLE,
            ease: "power3.inOut",
          },
          0
        );
        if (tints[k]) {
          tl.to(tints[k], { opacity: t.tint, duration: SHUFFLE, ease: "power3.inOut" }, 0);
        }
      });
    });

    // Copy leaves early so it is gone well before the new card settles; it
    // comes back from the layout effect once `active` has swapped.
    const copy = [numberRef.current, titleRef.current, descRef.current].filter(Boolean);
    if (copy.length) {
      tl.to(copy, { autoAlpha: 0, y: -12, duration: 0.28, ease: "sine.in" }, 0);
    }
  };

  // Stacked cards display slides in cycling order — front shows active,
  // middle shows next, back shows next-next. This way every card always
  // has a slide image so the visual stack is continuous.
  //
  // The offset can be negative: slot -1 holds the card that enters from the
  // left when stepping backwards, so the modulo has to wrap rather than
  // return an index JS would read as undefined.
  const cardSlide = (offset) =>
    SLIDES[((active + offset) % SLIDES.length + SLIDES.length) % SLIDES.length];

  if (!data || !SLIDES.length) return null;

  return (
    <section
      ref={rootRef}
      id="verticals"
      data-section="verticals"
      className="relative w-full bg-[#fff] text-[#333] lg:mt-[-8vw] overflow-hidden
                 min-h-[960px]
                 lg:h-[56.25vw] lg:min-h-[700px] lg:max-h-[1080px]"
    >
      {/* ===== Side label "Our Verticals" (Figma 3152:3437)
          left:80 top:60 w:54 tick h:60 gap:21 text 24 white */}
      <div
        ref={labelRef}
        className="absolute z-[5] flex flex-col items-center
                   left-[12px] max-md:mt-2  top-[24px] gap-[11px] w-[28px]
                   lg:left-[4.166vw] lg:top-[3.125vw] lg:w-[2.812vw] lg:gap-[1.094vw]
                   max-lg:flex-row max-lg:items-center max-lg:!gap-[8px] max-lg:!w-auto
                   max-lg:!left-1/2 max-lg:-translate-x-1/2 max-lg:!top-[15px]"
        style={{ color: "#333" }}
      >
        <span
          className="block w-px h-[31px] lg:h-[3.125vw] max-lg:!w-[28px] max-lg:!h-px"
          style={{ background: "currentColor" }}
        />
        <span
          className="font-montserrat font-medium capitalize whitespace-nowrap text-[12px] lg:text-[1.25vw] max-lg:[writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] lg:rotate-180"
          style={{
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

      {/* ===== DESKTOP stack =====
          One base box; each card's slot is a transform on it (see SLOT_DESKTOP). */}
      <div
        className="hidden lg:block absolute"
        style={{
          left: CARD_BASE.left,
          top: CARD_BASE.top,
          width: CARD_BASE.width,
          height: CARD_BASE.height,
        }}
      >
        {STACK_SLOTS.map((slot, k) => {
          const slide = cardSlide(slot);
          return (
            <div
              key={`desk-card-${k}`}
              ref={(el) => (deskCardsRef.current[k] = el)}
              className="absolute inset-0 pointer-events-none will-change-transform"
            >
              <div className="absolute inset-0 overflow-hidden rounded-[4px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
                {slide?.image && (
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    sizes="55vw"
                    className="object-cover object-center"
                  />
                )}
                {/* Always rendered so the tween has something to drive; the
                    slot decides how strong it is. */}
                <div
                  ref={(el) => (deskTintsRef.current[k] = el)}
                  className="absolute inset-0 bg-white"
                  style={{ opacity: 0 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== MOBILE stack =====
          Same idea against the mobile base box (Figma 3152:3792–3795),
          where all three cards do share one aspect ratio. */}
      <div
        ref={mobileImageRef}
        className="lg:hidden absolute z-[3] left-0 right-0 top-[267px] pointer-events-none"
      >
        <div className="relative mx-auto w-[min(440px,calc(100vw-32px))]">
          <div className="relative w-full aspect-[426.643/256.556]">
            {STACK_SLOTS.map((slot, k) => {
              const slide = cardSlide(slot);
              return (
                <div
                  key={`mob-card-${k}`}
                  ref={(el) => (mobCardsRef.current[k] = el)}
                  className="absolute inset-0 will-change-transform"
                >
                  <div className="absolute inset-0 overflow-hidden rounded-[4px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
                    {slide?.image && (
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        sizes="(max-width:500px) 90vw, 440px"
                        className="object-cover object-center"
                      />
                    )}
                    <div
                      ref={(el) => (mobTintsRef.current[k] = el)}
                      className="absolute inset-0 bg-white"
                      style={{ opacity: 0 }}
                    />
                  </div>
                </div>
              );
            })}
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
          key={`vertical-${active}`}
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
          {SLIDES[active]?.id}
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
        {/* Was `text-white/55` on a white section — invisible. With the
            indicator bars ruled out this counter is the only cue to where you
            are in the seven verticals, so it also shows on mobile now. */}
        <span className="inline-block font-montserrat text-[#333]/55 text-[12px] lg:text-[0.833vw] tracking-[0.12em] ml-[4px] lg:ml-[0.8vw]">
          {String(active + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
}
