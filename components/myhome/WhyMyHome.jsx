import React, { useRef, useState } from "react";
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

  /** GSAP word-mask reveal fired every time the active slide index changes */
  const animateActive = () => {
    if (!subRef.current || !bodyRef.current) return;
    const words = splitToWords(subRef.current);
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
      requestAnimationFrame(() => animateActive());

      // ----- desktop: pin + snap, scroll drives swiper -----
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const st = ScrollTrigger.create({
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
          onUpdate: (self) => {
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
          },
        });

        return () => st.kill();
      });
    },
    { scope: rootRef }
  );

  if (!data || !SLIDES.length) return null;

  // Decorative bottom-left bloom — managed in /public, not in the CMS.
  // const floralImage = "/assets/myhome/whymyhome-floral.png";

  return (
    <section
      ref={rootRef}
      id="why-my-home"
      className="relative w-full bg-[#2a2828] text-white overflow-hidden h-auto min-h-[920px] lg:h-screen lg:min-h-[1024px] lg:max-h-[1080px]"
      data-section="why-my-home"
    >
      {/* ---------- Vertical side label "Why My Home"
          Figma 3152:3744 — left:12 top:30, w:28, tick h:31, gap:11,
          text container 15×90, Montserrat Medium 12px white -rotate-90 */}
      <div
        ref={labelRef}
        className="absolute z-[6] left-[12px] top-[30px] w-[28px] flex flex-col items-center gap-[11px] md:left-[28px] md:top-[36px] md:w-auto md:gap-[14px] lg:left-[4.17vw] lg:top-[4.687vw] lg:gap-[1.094vw]"
        style={{ color: "#ffffff" }}
      >
        <span
          className="block w-px h-[31px] md:h-[40px] lg:h-[3.125vw]"
          style={{ background: "currentColor" }}
        />
        <span
          className="font-montserrat font-medium capitalize text-[12px] md:text-[16px] lg:text-[1.25vw] whitespace-nowrap"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {data.label}
        </span>
      </div>

      {/* ---------- Big heading "Choose Unrivaled Prestige"
          Mobile (Figma 3152:3744): top:56 left:[calc(50%-180px)] w:337
          text:35px tracking:2px leading:normal
          Desktop: top:[4.687vw] left:[11.15vw] w:[36.82vw] text:[5vw] */}
      <h2
        ref={headingRef}
        className="absolute z-[5] capitalize text-white will-change-transform leading-[1.2] lg:leading-[1.05] tracking-[2px] lg:tracking-[0.1vw] left-[max(52px,calc(50%-180px))] md:left-12 lg:left-[11.15vw] top-[56px] md:top-[80px] lg:top-[4.687vw] w-[337px] max-w-[calc(100vw-64px)] md:w-auto md:max-w-none md:right-12 lg:right-auto lg:w-[36.82vw] text-[35px] md:text-[56px] lg:text-[5vw]"
        style={{
          fontFamily:
            '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
        }}
      >
        {data.heading}
      </h2>

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

      {/* ---------- Right image + left text (Swiper, EffectFade) ---------- */}
      <Swiper
        modules={[EffectFade, Autoplay]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={900}
        allowTouchMove={false}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        loop={true}
        onSwiper={(s) => (swiperRef.current = s)}
        onSlideChange={(s) => {
          setActive(s.activeIndex);
          animateActive();
        }}
        style={{ position: "absolute", inset: 0, zIndex: 4, height: "100%" }}
      >
        {SLIDES.map((slide, i) => (
          <SwiperSlide
            key={slide.id}
            style={{ height: "100%", position: "relative" }}
          >
            {/* ===== MOBILE LAYOUT (<lg) — text first, image below =====
                Sub-heading: top:250, body: top:307, image: top:467
                (positions translated from Figma 3152:3744 to vh / px) */}

            {/* ===== Mobile sub-heading
                Figma: top:250 with -translate-y-1/2 + h:68
                → visual top = 250 - 34 = 216
                left:[calc(50%-180px)] w:329 text:22 leading:36 tracking:0.44 (= 0.02em) */}
            <h3
              ref={i === active ? subRef : null}
              className="lg:hidden absolute z-[5] left-[max(52px,calc(50%-180px))] w-[329px] max-w-[calc(100vw-64px)] top-[216px] capitalize text-white tracking-[0.02em] leading-[36px] text-[22px] will-change-transform"
              style={{
                fontFamily:
                  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
              }}
            >
              {slide.sub}
            </h3>

            {/* ===== Mobile body
                Figma: top:307 left:[calc(50%-180px)] w:329 text:14 leading:24 text-justify */}
            <p
              ref={i === active ? bodyRef : null}
              className="lg:hidden absolute z-[5] left-[max(52px,calc(50%-180px))] w-[329px] max-w-[calc(100vw-64px)] top-[307px] font-montserrat font-normal text-white text-[14px] leading-[24px] text-justify"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <RichText>{slide.body}</RichText>
            </p>

            {/* ===== Mobile image
                Figma: top:467 centered, w:460 h:395 (aspect 460/395 = 1.165) */}
            {slide.image && (
              <div className="lg:hidden absolute z-[3] left-1/2 -translate-x-1/2 top-[467px] w-[min(460px,calc(100vw-24px))] aspect-[460/395]">
                <Image
                  src={slide.image}
                  alt={slide.sub}
                  fill
                  unoptimized
                  priority={i === 0}
                  sizes="(min-width:480px) 460px, calc(100vw-24px)"
                  className="object-cover object-center select-none"
                />
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

            {/* Desktop text block (sub + body) */}
            <div className="hidden lg:block absolute z-[5] left-[11.15vw] w-[32.55vw] top-[27.08vw]">
              <h3
                ref={i === active ? subRef : null}
                className="Tartuffo_Trial_Regular capitalize text-white leading-[1.3] tracking-[0.02em] text-[1.823vw] will-change-transform"
                style={{
                  fontFamily:
                    '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                }}
              >
                {slide.sub}
              </h3>
              <p
                ref={i === active ? bodyRef : null}
                className="font-montserrat font-normal mt-[0.781vw] text-white/85 text-[0.833vw] leading-[1.563vw] max-w-[30.83vw]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                <RichText>{slide.body}</RichText>
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ---------- Mobile pagination: horizontal red-fill bar
          Figma 3152:3744 — top:888 left:[calc(50%-80px)] w:160 h:2
          background line + red fill (54.074px ≈ 33.8% for slide 1 of 3) */}
      <div
        aria-hidden="true"
        className="lg:hidden absolute z-[7] left-1/2 -translate-x-1/2 top-[888px] w-[160px] h-[2px]"
      >
        <span className="absolute inset-0 bg-white/25" />
        <span
          className="absolute left-0 top-0 h-full bg-[#ef493d] transition-[width] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${((active + 1) / SLIDES.length) * 100}%` }}
        />
      </div>

      {/* Mobile clickable hit areas overlaid on the bar */}
      <div className="lg:hidden absolute z-[8] left-1/2 -translate-x-1/2 top-[876px] w-[180px] h-6 flex items-center justify-between">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => swiperRef.current?.slideTo(i, 700, false)}
            className="w-12 h-6 -mx-2"
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
            onClick={() => swiperRef.current?.slideTo(i, 700, false)}
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
