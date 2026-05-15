import React, { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

/**
 * Testimonials — Figma node 3152:3507
 *
 * Two testimonials visible at a time on desktop (slidesPerView: 2):
 *   • Left: text column (quote glyph → body 20/36 → divider → name 26 Tartuffo)
 *           + portrait image card (360×541) with a red/gold play button overlay
 *   • Right: same structure, mirrored to the right side of the section.
 *
 * Header above (side label "Testimonial" red vertical, heading "Trust, in
 * their words" 96 Tartuffo, body 18/30, prev/next arrows on the right).
 *
 * Mobile collapses to one testimonial per Swiper slide, image first then
 * text below.
 */

const TESTIMONIALS = [
  {
    quote:
      "Buying a home from 3,000 miles away felt daunting until we met the My Home team. The transparency, documentation, and follow-through were flawless. From site selection to possession, every milestone was honoured. It wasn't just a transaction. It felt like a partnership.",
    name: "Dr. Srikanth Ega Spine, Hyderabad",
    image: "/assets/myhome/testimonial-1.jpg",
    badge: "#ef493d", // red play button
  },
  {
    quote:
      "What struck us most wasn't the finish or the amenities — it was the people. From our first site visit to the day we moved in, every interaction felt personal. The space planning, the light, the quiet attention to how we actually live — My Home understood before we had to explain.",
    name: "Mr. Gangula Sudheer, Hyderabad",
    image: "/assets/myhome/testimonial-2.jpg",
    badge: "#c39a3e", // gold play button
  },
  {
    quote:
      "Every detail spoke a language of care — the joinery, the natural light, the gardens. We feel rooted here in a way we hadn't experienced before. My Home didn't just deliver a house; they delivered a life we wanted to live.",
    name: "Mrs. Anjali Reddy, Hyderabad",
    image: "/assets/myhome/testimonial-1.jpg",
    badge: "#ef493d",
  },
  {
    quote:
      "The handover felt seamless — from the structural walk-through to the snag list. Months later we're still finding small acts of consideration the architects baked in. That's the difference between a building and a home.",
    name: "Mr. Rajesh Kumar, Hyderabad",
    image: "/assets/myhome/testimonial-2.jpg",
    badge: "#c39a3e",
  },
];

function QuoteGlyph({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 36 36"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M14 9c-4.4 0-8 3.6-8 8v10h10V17h-6c0-3.3 2.7-6 6-6V9zm16 0c-4.4 0-8 3.6-8 8v10h10V17h-6c0-3.3 2.7-6 6-6V9z" />
    </svg>
  );
}

function PlayIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 22 22"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6 4.5v13l11-6.5-11-6.5z" />
    </svg>
  );
}

export default function Testimonials() {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const paraRef = useRef(null);
  const labelRef = useRef(null);
  const swiperRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useGSAP(
    () => {
      registerGsap();
      const words = splitToWords(headingRef.current);
      gsap.set(words, { yPercent: 110, rotate: 4 });
      gsap.to(words, {
        yPercent: 0,
        rotate: 0,
        duration: 1.15,
        stagger: 0.075,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });
      gsap.from([paraRef.current, labelRef.current], {
        y: 30,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 70%" },
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      id="testimonials"
      data-section="testimonials"
      className="relative w-full bg-white overflow-hidden
                 pt-[64px] pb-[64px]
                 lg:pt-[4.166vw] lg:pb-[4.166vw]"
    >
      {/* ============================================================
           HEADER (Figma 3152:3508 + 3152:3511 + 3152:3541)
           - Side label "Testimonial" at left:80 top:80, w:54 (red 24/normal)
           - Heading "Trust, in their words" at left:214 top:80 w:805 (96 Tartuffo)
           - Body at gap:30 below — 18/30 Montserrat #6d6d6d w:742
           - Arrows at left:1600 top:150 — 2×70×70 circular gap:20
         ============================================================ */}

      {/* Side label */}
      <div
        ref={labelRef}
        className="absolute z-[5] flex flex-col items-center
                   left-[12px] top-[24px] gap-[11px] w-[28px]
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
          Testimonial
        </span>
      </div>

      {/* Heading + body block */}
      <div
        className="relative z-[3] flex flex-col gap-[16px] lg:gap-[1.563vw]
                   pl-[64px] pr-5 sm:pl-[80px] sm:pr-8
                   lg:pl-[11.146vw] lg:pr-[4.166vw]
                   max-w-[805px] lg:max-w-[41.927vw]"
      >
        <h2
          ref={headingRef}
          className="capitalize text-[#333] tracking-[2px]
                     leading-[1.15] lg:leading-[normal]
                     text-[32px] xs:text-[35px] sm:text-[44px] md:text-[64px] lg:text-[5vw]
                     will-change-transform"
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
          }}
        >
          Trust, in their words
        </h2>
        <p
          ref={paraRef}
          className="font-montserrat font-normal text-[#333] lg:text-[#6d6d6d] text-justify
                     text-[14px] md:text-[16px] lg:text-[0.938vw]
                     leading-[24px] lg:leading-[1.563vw]
                     max-w-[742px] lg:w-[38.646vw] lg:max-w-none"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Real stories from real homeowners — because the best proof of what we
          build is how it feels to live there.
        </p>
      </div>

      {/* Arrows — desktop top-right, mobile below carousel */}
      <div className="hidden lg:flex absolute z-[5] right-[4.166vw] top-[7.812vw] items-center gap-[1.042vw]">
        <button
          type="button"
          aria-label="Previous testimonial"
          onClick={() => swiperRef.current?.slidePrev()}
          className="group inline-flex items-center justify-center rounded-full border border-[#333]/30 text-[#333]
                     w-[3.646vw] h-[3.646vw]
                     transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                     hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white"
        >
          <svg viewBox="0 0 22 14" fill="none" className="w-[1.146vw] h-auto">
            <path
              d="M0.293 6.293L6.586 0 8 1.414 4.414 5 22 5v2H4.414L8 10.586 6.586 12 .293 5.707a1 1 0 010-1.414z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next testimonial"
          onClick={() => swiperRef.current?.slideNext()}
          className="group inline-flex items-center justify-center rounded-full border border-[#333]/30 text-[#333]
                     w-[3.646vw] h-[3.646vw]
                     transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                     hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white"
        >
          <svg viewBox="0 0 22 14" fill="none" className="w-[1.146vw] h-auto">
            <path
              d="M21.707 7.707L15.414 14 14 12.586 17.586 9H0V7h17.586L14 3.414 15.414 2l6.293 6.293a1 1 0 010 1.414z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      {/* ============================================================
           SWIPER — 2 testimonials per view on desktop, 1 on mobile
         ============================================================ */}
      <div className="relative z-[2] mt-[36px] lg:mt-[7.812vw]">
        <Swiper
          modules={[Navigation, A11y]}
          slidesPerView={1}
          spaceBetween={24}
          speed={700}
          loop
          breakpoints={{
            640: { slidesPerView: 1.1, spaceBetween: 32 },
            1024: { slidesPerView: 1.5, spaceBetween: 60 },
          }}
          onSwiper={(s) => (swiperRef.current = s)}
          onSlideChange={(s) => setActiveIdx(s.realIndex)}
          className="!px-5 md:!px-8 lg:!px-[7.448vw] !overflow-visible"
        >
          {TESTIMONIALS.map((t, i) => (
            <SwiperSlide key={`${t.name}-${i}`} className="!h-auto">
              {/* Per-testimonial layout (Figma 3152:3515 / 3152:3528):
                  Mobile — stack: image then text below
                  Desktop — flex row, text left (385 wide), image right (360x541) */}
              <div className="flex flex-col lg:flex-row lg:items-stretch gap-[24px] lg:gap-[6.25vw]">
                {/* TEXT COLUMN */}
                <div className="relative flex flex-col order-2 lg:order-1
                                lg:w-[20.052vw] lg:min-h-[28.177vw]">
                  {/* Quote glyph (Figma 3152:3520) — 36px size, opacity 23% */}
                  <QuoteGlyph
                    className="w-[28px] h-[28px] lg:w-[1.875vw] lg:h-[1.875vw]
                               text-[#ef493d] opacity-[0.23]"
                  />

                  {/* Body text (Figma 3152:3517)
                      20/36 Montserrat #555 w:385 */}
                  <p
                    className="font-montserrat font-normal text-[#555]
                               text-[15px] md:text-[16px] lg:text-[1.042vw]
                               leading-[26px] md:leading-[28px] lg:leading-[1.875vw]
                               max-w-[440px] lg:w-[20.052vw] lg:max-w-none
                               mt-[16px] lg:mt-[2.083vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {t.quote}
                  </p>

                  {/* Spacer to push divider + name to bottom on desktop */}
                  <div className="hidden lg:block flex-1" />

                  {/* Horizontal divider — Figma 3152:3516 (rotated line) */}
                  <span
                    aria-hidden="true"
                    className="hidden lg:block w-full max-w-[20.052vw] h-px bg-[#333]/15
                               mt-[24px] lg:mt-[2.083vw] mb-[16px] lg:mb-[1.302vw]"
                  />

                  {/* Name + place (Figma 3152:3518)
                      26 Tartuffo Regular #555 */}
                  <p
                    className="capitalize text-[#555]
                               text-[18px] md:text-[22px] lg:text-[1.354vw]
                               mt-[20px] lg:mt-0"
                    style={{
                      fontFamily:
                        '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                    }}
                  >
                    {t.name}
                  </p>
                </div>

                {/* IMAGE COLUMN (Figma 3152:3522 / 3152:3535)
                    360 × 541 portrait with overlay + play button at center */}
                <div
                  className="relative shrink-0 order-1 lg:order-2
                             w-full max-w-[440px] mx-auto aspect-[360/541]
                             lg:w-[18.75vw] lg:max-w-none lg:mx-0 lg:h-[28.177vw]
                             rounded-[6px] overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)]"
                >
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    unoptimized
                    sizes="(min-width:1024px) 19vw, calc(100vw - 40px)"
                    className="object-cover object-center"
                  />
                  {/* Dark overlay (Figma rgba(0,0,0,0.1)) */}
                  <div className="absolute inset-0 bg-black/10" />

                  {/* Play button — red OR gold per Figma */}
                  <button
                    type="button"
                    aria-label={`Play video testimonial — ${t.name}`}
                    className="absolute inset-0 m-auto inline-flex items-center justify-center
                               w-[60px] h-[40px] lg:w-[4.125vw] lg:h-[2.719vw]
                               rounded-full text-white
                               transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                               hover:scale-110"
                    style={{ background: t.badge }}
                  >
                    <PlayIcon className="w-[18px] h-[18px] lg:w-[1.125vw] lg:h-[1.125vw]" />
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Mobile arrows */}
      <div className="lg:hidden mt-[28px] flex items-center justify-center gap-[16px]">
        <button
          type="button"
          aria-label="Previous testimonial"
          onClick={() => swiperRef.current?.slidePrev()}
          className="group inline-flex items-center justify-center rounded-full border border-[#333]/30 text-[#333]
                     w-[44px] h-[44px]
                     transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                     hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white"
        >
          <svg viewBox="0 0 22 14" fill="none" className="w-[16px] h-auto">
            <path
              d="M0.293 6.293L6.586 0 8 1.414 4.414 5 22 5v2H4.414L8 10.586 6.586 12 .293 5.707a1 1 0 010-1.414z"
              fill="currentColor"
            />
          </svg>
        </button>
        <span className="font-montserrat text-[#6d6d6d] text-[13px] tracking-[0.12em]">
          {String(activeIdx + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}
        </span>
        <button
          type="button"
          aria-label="Next testimonial"
          onClick={() => swiperRef.current?.slideNext()}
          className="group inline-flex items-center justify-center rounded-full border border-[#333]/30 text-[#333]
                     w-[44px] h-[44px]
                     transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                     hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white"
        >
          <svg viewBox="0 0 22 14" fill="none" className="w-[16px] h-auto">
            <path
              d="M21.707 7.707L15.414 14 14 12.586 17.586 9H0V7h17.586L14 3.414 15.414 2l6.293 6.293a1 1 0 010 1.414z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
