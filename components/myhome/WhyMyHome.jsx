import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, ScrollTrigger, splitToWords } from "@/lib/gsapSetup";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { mediaUrl } from "@/lib/strapi";
import RichText from "@/components/common/RichText";
import SectionHeading from "@/components/common/SectionHeading";
import NavArrows from "@/components/myhome/NavArrows";

/**
 * Why My Home — Figma node 2609:1613
 *
 * A pinned section that scroll-scrubs through 3 slides. The big heading
 * ("Choose Unrivaled Prestige"), vertical side label, and floral accents
 * stay fixed. Sub-heading + body + right image swap per slide via Swiper
 * (EffectFade for the image cross-fade) while GSAP animates a fresh word
 * mask reveal on the sub-heading and a subtle slide-up on the body each
 * time the active index changes.
 *
 * Driving the slides: ScrollTrigger pins the section for `slides×100%` of
 * scroll, snaps to each slide breakpoint, and calls `swiper.slideTo()` on
 * progress updates.
 */
export default function WhyMyHome({ data }) {
  const SLIDES =
    Array.isArray(data?.slides) && data.slides.length
      ? data.slides.map((s, i) => ({
          id: s.id ?? i + 1,
          sub: s.subTitle || "",
          body: s.body || "",
          image: mediaUrl(s.image),
        }))
      : [];
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const subRef = useRef(null);
  const bodyRef = useRef(null);
  const labelRef = useRef(null);
  const swiperRef = useRef(null);
  const [active, setActive] = useState(0);
  // `active` is where the scroll has got to; `displayed` is what the text
  // block is currently showing. They differ only for the ~0.25s the outgoing
  // copy takes to leave, which is what stops the two ever being on screen
  // together.
  const [displayed, setDisplayed] = useState(0);
  const textTlRef = useRef(null);
  // The pinned ScrollTrigger, when one exists (desktop only). Navigation
  // needs its scroll range to convert a slide index into a scroll position.
  const stRef = useRef(null);
  const firstRevealRef = useRef(true);
  // Enable Swiper touch/swipe on mobile only; desktop stays scroll-driven.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /**
   * Reveal whatever copy the text block is showing right now.
   *
   * `splitToWords` rewrites the heading's children, so it has to run after
   * React has committed the new text — never in the same tick as the state
   * change that swaps it.
   */
  const revealCopy = () => {
    if (!subRef.current || !bodyRef.current) return;
    const words = splitToWords(subRef.current);
    gsap.set(subRef.current, { autoAlpha: 1 });
    gsap.set(words, { yPercent: 110 });
    gsap.to(words, {
      yPercent: 0,
      duration: 0.95,
      stagger: 0.06,
      ease: "expo.out",
    });
    gsap.fromTo(
      bodyRef.current,
      { y: 28, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out", delay: 0.15 }
    );
  };

  /**
   * Move to a slide by index.
   *
   * On desktop the index is a pure function of scroll position —
   * `syncToProgress` recomputes it on every ScrollTrigger update — so calling
   * `swiper.slideTo` alone does not hold: the slide changes, the scroll does
   * not, and the next scroll event puts it straight back. This is why the
   * pagination dots used to revert the moment you nudged the wheel. Moving
   * the scroll instead lets the existing machinery land on the right slide by
   * itself. Scrolled through Lenis so it matches the rest of the site.
   *
   * Mobile has no pin and no scroll-driving, so there the slider is told
   * directly.
   */
  const goToIndex = (i) => {
    const target = Math.max(0, Math.min(i, SLIDES.length - 1));
    const st = stRef.current;

    if (!st || SLIDES.length < 2) {
      swiperRef.current?.slideTo(target, 700, false);
      return;
    }

    const y = st.start + (target / (SLIDES.length - 1)) * (st.end - st.start);
    const lenis = window.__lenis;
    if (lenis?.scrollTo) lenis.scrollTo(y, { duration: 0.9 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  /**
   * Out, then in — never both at once.
   *
   * The images still cross-fade through Swiper, which is the right treatment
   * for them. Text is not: two paragraphs at half opacity in the same spot
   * are unreadable, which is exactly what a cross-fade of the copy produced.
   * So the outgoing copy leaves first, the content swaps while nothing is on
   * screen, and the new copy reveals. The whole handoff is ~0.85s, inside the
   * 900ms image cross-fade, so copy and image settle together.
   */
  useEffect(() => {
    if (displayed === active) return undefined;

    // A fast scroll can outrun the handoff; drop the in-flight one and play
    // the newest rather than queueing them up behind each other.
    textTlRef.current?.kill();

    const targets = [subRef.current, bodyRef.current].filter(Boolean);
    if (!targets.length) {
      setDisplayed(active);
      return undefined;
    }

    const tl = gsap.timeline();
    textTlRef.current = tl;
    tl.to(targets, {
      autoAlpha: 0,
      y: -14,
      duration: 0.25,
      ease: "power2.in",
    }).add(() => setDisplayed(active));

    return () => {
      tl.kill();
    };
  }, [active, displayed]);

  // Runs after React has committed the swapped copy, so `splitToWords` is
  // rewriting the new heading rather than the one on its way out.
  useEffect(() => {
    if (firstRevealRef.current) {
      firstRevealRef.current = false;
      return;
    }
    gsap.set([subRef.current, bodyRef.current].filter(Boolean), { y: 0 });
    revealCopy();
  }, [displayed]);

  useGSAP(
    () => {
      registerGsap();

      // ----- entrance for the big heading + side label (fires once) -----
      const titleWords = splitToWords(headingRef.current);
      gsap.set(titleWords, { yPercent: 110 });
      gsap.to(titleWords, {
        yPercent: 0,
        duration: 1.15,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });
      gsap.from(labelRef.current, {
        autoAlpha: 0,
        y: -30,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
      });

      // initial in-slide reveal
      requestAnimationFrame(() => revealCopy());

      // Maps a 0→1 ScrollTrigger progress onto a slide index and drives Swiper.
      const syncToProgress = (self) => {
        const idx = Math.min(
          SLIDES.length - 1,
          Math.round(self.progress * (SLIDES.length - 1))
        );
        if (
          swiperRef.current &&
          swiperRef.current.activeIndex !== idx &&
          !swiperRef.current.animating
        ) {
          swiperRef.current.slideTo(idx, 700, false);
        }
      };

      // ----- desktop: pin + snap, scroll drives swiper -----
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const st = (stRef.current = ScrollTrigger.create({
          trigger: rootRef.current,
          start: "top top",
          end: `+=${SLIDES.length * 100}%`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          snap: {
            snapTo: (value) => {
              const step = 1 / (SLIDES.length - 1);
              return Math.round(value / step) * step;
            },
            duration: { min: 0.25, max: 0.7 },
            delay: 0.04,
            ease: "expo.inOut",
          },
          onUpdate: syncToProgress,
        }));

        return () => {
          st.kill();
          stRef.current = null;
        };
      });

      // ----- mobile/tablet: no pin and no scroll-driving. The slider is
      // driven by native Swiper touch/swipe (allowTouchMove enabled on mobile)
      // plus the pagination buttons, so scroll no longer fights the swipe.
    },
    { scope: rootRef }
  );

  if (!data || !SLIDES.length) return null;

  // What the copy block is showing. Clamped because `displayed` trails
  // `active` by one beat and the CMS can shorten the slide list underneath it.
  const COPY = SLIDES[Math.min(displayed, SLIDES.length - 1)] || SLIDES[0];

  // Decorative bottom-left bloom — managed in /public, not in the CMS.
  // const floralImage = "/assets/myhome/whymyhome-floral.png";

  // Mobile/tablet (<lg) lays the section out in normal document flow — label,
  // heading, then the slider (sub-heading, body, image) — all sharing the
  // GUTTER below so every edge lines up. Only ≥lg uses the absolutely
  // positioned, scroll-pinned Figma composition.
  const GUTTER = "px-6 md:px-12 lg:px-0";

  return (
    <section
      ref={rootRef}
      id="why-my-home"
      className="relative w-full bg-[#2a2828] text-white overflow-hidden pb-[40px] lg:pb-0 lg:h-screen lg:min-h-[1024px] lg:max-h-[1080px]"
      data-section="why-my-home"
    >
      {/* ---------- Vertical side label "Why My Home"
          Mobile: centred tick + label in flow at the top of the section.
          Desktop (Figma 3152:3744): pinned left rail, rotated. */}
      <div
        ref={labelRef}
        className="z-[6] flex flex-row items-center justify-center gap-[8px] w-full pt-[24px] md:pt-[32px] lg:absolute lg:left-[4.17vw] lg:top-[4.687vw] lg:w-[28px] lg:flex-col lg:justify-start lg:gap-[1.094vw] lg:pt-0"
        style={{ color: "#ffffff" }}
      >
        <span
          className="block w-[28px] h-px lg:w-px lg:h-[3.125vw]"
          style={{ background: "currentColor" }}
        />
        <span
          className="font-montserrat font-medium capitalize text-[12px] md:text-[16px] lg:text-[1.25vw] whitespace-nowrap lg:[writing-mode:vertical-rl] lg:rotate-180"
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {data.label}
        </span>
      </div>

      {/* ---------- Big heading "Choose Unrivaled Prestige"
          Mobile: in flow under the label, full width inside the gutter.
          Desktop: top:[4.687vw] left:[11.15vw] w:[36.82vw] text:[5vw] */}
      <SectionHeading
        ref={headingRef}
        className={`relative z-[5] ${GUTTER} mt-[20px] md:mt-[28px] capitalize text-white will-change-transform leading-[1.2] tracking-[1px] text-[32px] md:text-[52px] lg:absolute lg:mt-0 lg:left-[11.15vw] lg:top-[4.687vw] lg:w-[36.82vw] lg:leading-[1.05] lg:tracking-[0.1vw] lg:text-[5vw]`}
      >
        {data.heading}
      </SectionHeading>

      {/* ---------- Decorative floral bottom-left (DESKTOP ONLY)
          Replicates Figma node 2609:1568 1:1.

          Figma container is 179×338 px (portrait) and the image inside is
          scaled to 431.17% width / 128.4% height (i.e. enlarged ~4.3×),
          anchored top-left. The wrapper is then vertically flipped with
          -scaleY so the bloom (which lives in the top-left of the natural
          image) lands at the section's bottom-left corner. overflow-hidden
          clips the oversized image to the 179×338 window without cropping
          the bloom itself. */}
      {/* {floralImage && (
        <div className="hidden lg:block absolute left-0 bottom-0 z-[2] pointer-events-none overflow-hidden w-[9.323vw] max-w-[200px] aspect-[179/338]">
          <div
            className="absolute inset-0"
            style={{ transform: "scaleY(-1)" }}
          >
           
            <img
              src={floralImage}
              alt=""
              className="absolute top-0 left-0 max-w-none h-auto select-none"
              style={{ width: "431.17%" }}
            />
          </div>
        </div>
      )} */}

      {/* ---------- Slide progress bar (vertical red-fill between text + image, desktop only) ---------- */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute z-[3] top-[40.86vw] left-[53.44vw] w-px h-[11.25vw] bg-white/20 overflow-hidden"
      > 
        <span
          className="absolute inset-x-0 top-0 block bg-[#ef493d] transition-[height] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ height: `${((active + 1) / SLIDES.length) * 100}%` }}
        />
      </div>

      {/* ---------- The copy: one block, outside the slider ----------
          Rendered once from `displayed` rather than once per slide. While it
          lived inside the slider every slide carried its own copy, and the
          cross-fade held two of them on screen at partial opacity for 900ms
          — the overlap this section was reported for. With a single node
          there is nothing to overlap with.

          Desktop keeps the Figma placement the slide version had
          (left 11.15vw, top 27.08vw, width 32.55vw); mobile stays in flow
          between the heading and the image, inside the shared gutter. */}
      <div className="relative z-[5] lg:absolute lg:left-[11.15vw] lg:w-[32.55vw] lg:top-[24vw]">
        <h3
          ref={subRef}
          className={`${GUTTER} lg:px-0 Tartuffo_Trial_Regular capitalize text-white tracking-[0.02em] mt-[28px] md:mt-[36px] lg:mt-0 text-[22px] leading-[32px] md:text-[28px] md:leading-[40px] lg:text-[1.823vw] lg:leading-[1.3] will-change-transform`}
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
          }}
        >
          {COPY.sub}
        </h3>
        <p
          ref={bodyRef}
          className={`${GUTTER} lg:px-0 font-montserrat font-normal text-white/85 text-left mt-[12px] md:mt-[16px] lg:mt-[0.781vw] text-[14px] leading-[24px] md:text-[16px] md:leading-[28px] lg:text-[0.833vw] lg:leading-[1.563vw] lg:max-w-[30.83vw]`}
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <RichText>{COPY.body}</RichText>
        </p>
      </div>

      {/* ---------- Arrow navigation (desktop) ----------
          Absolutely positioned rather than sitting under the copy, because
          the copy is a different height on every slide — measured at 1920 it
          ends at 734px on three slides and 764px on the fourth, so in flow
          the buttons would hop 30px each time the text changed. Pinned to
          the section instead, they hold still while the copy changes behind
          them.

          The offset also has to clear the fold: the section is
          `min-h-[1024px]` whatever the window height, so a control placed
          near its bottom edge is simply off-screen on a laptop. At 38.5vw the
          buttons end at ~809px on a 1920-wide screen, inside even an 860px
          viewport, and they scale with the rest of the vw layout below that.
          The copy moved up from 27.08vw to 24vw to make that room.

          Mobile is left alone: it already has swipe, autoplay and the
          tap-target bar under the image, and arrows here would sit above the
          image they drive.

          No wrap-around — the ends disable. The desktop track is a stretch of
          page scroll, so looping from the last slide back to the first would
          fling the page the length of the pinned section. */}
      <NavArrows
        light
        className="hidden lg:flex absolute z-[6] left-[11.15vw] top-[38.5vw] gap-[1.042vw]"
        // Sized in vw to match the rest of this section, which scales against
        // the same 1920 reference (70px = 3.646vw, the 22px glyph = 1.146vw).
        // Applied here rather than on `.mh-nav-arrow`, which other sections
        // share at its fixed 70px.
        buttonClassName="!w-[3.646vw] !h-[3.646vw] [&_svg]:w-[1.146vw] [&_svg]:h-auto"
        onPrev={() => goToIndex(active - 1)}
        onNext={() => goToIndex(active + 1)}
        prevDisabled={active === 0}
        nextDisabled={active === SLIDES.length - 1}
      />

      {/* ---------- Right image (Swiper, EffectFade) ---------- */}
      {/* Slides are driven purely by scroll (see the ScrollTrigger above) plus
          the pagination buttons — no autoplay, and no loop so `activeIndex`
          maps 1:1 onto the scroll progress index. */}
      <Swiper
        key={isMobile ? "swiper-mobile" : "swiper-desktop"}
        modules={[EffectFade, Autoplay]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={900}
        allowTouchMove={isMobile}
        autoplay={
          isMobile
            ? { delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: false }
            : false
        }
        rewind={isMobile}
        onSwiper={(s) => (swiperRef.current = s)}
        // Only records where we are. The copy handoff is driven by the
        // `active` effect above, which runs after React has re-rendered —
        // animating here would have played the reveal on the outgoing text,
        // because the refs still point at it until the next commit.
        onSlideChange={(s) => setActive(s.activeIndex)}
        // Mobile keeps the slider in flow so its content defines the section
        // height; desktop pins it across the whole (scroll-pinned) viewport.
        className="w-full !h-auto lg:!absolute lg:!inset-0 lg:!z-[4] lg:!h-full"
      >
        {SLIDES.map((slide, i) => (
          <SwiperSlide key={slide.id} className="relative !h-auto lg:!h-full">
            {/* Copy lives outside this slider — see the single text block
                below. Only the imagery cross-fades here. */}

            {/* Figma image box: w:460 h:395 (aspect 460/395), centred. */}
            {slide.image && (
              <div className={`lg:hidden ${GUTTER} mt-[28px] md:mt-[36px]`}>
                <div className="relative mx-auto w-full max-w-[460px] aspect-[460/395]">
                  <Image
                    src={slide.image}
                    alt={slide.sub}
                    fill
                    unoptimized
                    priority={i === 0}
                    sizes="(min-width:520px) 460px, calc(100vw - 48px)"
                    className="object-cover object-center select-none"
                  />
                </div>
              </div>
            )}

            {/* ===== DESKTOP LAYOUT (≥lg) — right-side image + bottom-left text ===== */}
            <div className="hidden lg:block absolute pointer-events-none inset-0">
              <div className="absolute right-0 top-0 h-full w-[42.4vw]">
                {slide.image && (
                  <Image
                    src={slide.image}
                    alt={slide.sub}
                    fill
                    unoptimized
                    priority={i === 0}
                    sizes="42vw"
                    className="object-cover object-center select-none"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#2a2828]/70 via-[#2a2828]/10 to-transparent" />
              </div>
            </div>

          </SwiperSlide>
        ))}
      </Swiper>

      {/* ---------- Mobile pagination: horizontal red-fill bar (Figma 3152:3744
          — w:160 h:2) with the per-slide tap targets overlaid on top. Sits in
          flow directly under the slider, so it follows the image instead of a
          hardcoded offset. */}
      <div className="lg:hidden relative z-[7] mx-auto mt-[28px] flex w-[180px] h-6 items-center justify-between">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[2px] overflow-hidden"
        >
          <span className="absolute inset-0 bg-white/25" />
          <span
            className="absolute left-0 top-0 h-full bg-[#ef493d] transition-[width] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${((active + 1) / SLIDES.length) * 100}%` }}
          />
        </span>

        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goToIndex(i)}
            className="relative w-12 h-6 -mx-2"
          />
        ))}
      </div>

      {/* ---------- Desktop pagination dots ---------- */}
      <div className="hidden lg:flex absolute z-[7] gap-[0.521vw] right-[4.17vw] bottom-[4.17vw]">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goToIndex(i)}
            className={`block h-[2px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              active === i
                ? "w-[3.125vw] bg-white"
                : "w-[1.563vw] bg-white/35"
            }`}
          />
        ))}
      </div>

      {/* ---------- Slide counter — desktop only (anchored right, above
          pagination, so it stays clear of the floral bottom-left) ---------- */}
      <div className="hidden lg:flex absolute z-[7] right-[4.17vw] bottom-[7vw] items-center gap-[0.625vw] font-montserrat text-white/70 text-[0.833vw] tracking-[0.18em]">
        <span className="text-white font-medium">
          {String(active + 1).padStart(2, "0")}
        </span>
        <span className="block w-[2vw] h-px bg-white/40" />
        <span>{String(SLIDES.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
