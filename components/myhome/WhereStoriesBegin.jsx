import React, { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { mediaUrl, relationList } from "@/lib/strapi";
import RichText from "@/components/common/RichText";

/**
 * Where Stories Begin — Figma node 3152:3465
 *
 * 3-up centered Swiper carousel:
 *   • Active (center) slide  — large landscape image (aspect 647/485),
 *                              60px Tartuffo title, 18px body,
 *                              "Know More" outlined button.
 *   • Side slides            — smaller portrait images (aspect 878/1011),
 *                              33px title, 10px body, 50% opacity.
 *
 * Layout: side label + heading/body on the left, prev/next arrows on the
 * right, all in one top row (Figma 3152:3466). Carousel below.
 * Smooth slide change driven by Swiper's own `loop: true` + speed 800ms.
 */

/* Each project has two images:
   - `image`  → real photo shown when slide is the active centre
   - `sketch` → b&w architectural sketch shown when slide sits on either
                side (Figma 3152:3497 / 3152:3502 use the sketch artwork for
                both flanking cards). Shared whoweare-sketch.png placeholder. */
export default function WhereStoriesBegin({ data }) {
  // `projects` is now a relation to the Project collection. Flatten the v4
  // envelope, sort by `order`, then map onto the shape this section expects.
  const rawProjects = relationList(data?.projects);
  rawProjects.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const PROJECTS = rawProjects.map((p) => ({
    title: p.title || "",
    sub: p.subTitle || "",
    image: mediaUrl(p.image),
    ctaText: p.ctaText || "",
    ctaLink: p.ctaLink || (p.slug ? `/projects/${p.slug}` : ""),
  }));

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const paraRef = useRef(null);
  const labelRef = useRef(null);
  const swiperRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useGSAP(
    () => {
      if (!rootRef.current) return;
      registerGsap();
      const words = splitToWords(headingRef.current);
      if (words.length) {
        gsap.set(words, { yPercent: 110, rotate: 4 });
        gsap.to(words, {
          yPercent: 0,
          rotate: 0,
          duration: 1.15,
          stagger: 0.075,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
        });
      }
      const introTargets = [paraRef.current, labelRef.current].filter(Boolean);
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
    },
    { scope: rootRef }
  );

  if (!data || !PROJECTS.length) return null;

  const SIDE_SKETCH = mediaUrl(data.sideSketchImage);

  return (
    <section
      ref={rootRef}
      id="featured"
      data-section="featured"
      className="relative w-full bg-white overflow-hidden
                 pt-[64px] pb-[64px]
                 lg:pt-[4.687vw] lg:pb-[4.166vw]"
    >
      {/* ============================================================
           HEADER (Figma 3152:3466)
           left:80 top:90 — flex horizontal gap:80
           Side label (w:54, tick h:60, gap:21, 24px Montserrat red)
           Heading + body block (w:934, gap:30) — 96px Tartuffo + 18/30
           Arrows (2× 70×70 circular, gap:20) on the right edge
         ============================================================ */}
      <div className="relative z-[3] grid grid-cols-12 gap-x-[1.25vw] items-start
                      px-5 md:px-10 lg:px-[4.166vw]
                      pl-[64px] sm:pl-[80px] lg:pl-[4.166vw]">
        {/* ===== Side label "Featured Projects"
            Mobile (Figma 3152:3810) — left:12 top:30 vertical 12px red, tick h:31, gap:11
            Desktop (Figma 3152:3467) — left:80 top:90 vertical 24px red, tick h:60, gap:21 */}
        <div
          ref={labelRef}
          className="absolute z-[5] flex flex-col items-center
                     left-[12px] top-[30px] gap-[11px] w-[28px]
                     lg:relative lg:left-auto lg:top-auto lg:col-span-1 lg:w-[2.812vw] lg:gap-[1.094vw]"
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

        {/* Heading + body */}
        <div className="col-span-12 lg:col-span-7 lg:col-start-2 flex flex-col gap-[16px] lg:gap-[1.563vw]">
          <h2
            ref={headingRef}
            className="capitalize text-[#333] tracking-[2px]
                       leading-[1.15] lg:leading-[normal]
                       text-[35px] xs:text-[35px] sm:text-[44px] md:text-[64px] lg:text-[5vw]
                       w-full max-w-[359px] lg:max-w-none
                       will-change-transform"
            style={{
              fontFamily:
                '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
            }}
          >
            {data.heading}
          </h2>
          <p
            ref={paraRef}
            className="font-montserrat font-normal text-[#333] lg:text-[#6d6d6d] text-justify
                       text-[14px] md:text-[16px] lg:text-[0.938vw]
                       leading-[24px] lg:leading-[1.563vw]
                       w-full max-w-[318px] lg:w-[39.114vw] lg:max-w-none"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            <RichText>{data.body}</RichText>
          </p>
        </div>

        {/* Arrows */}
        <div className="hidden lg:flex col-span-3 col-start-10 justify-end items-end gap-[1.042vw] pb-[1vw]">
          <button
            type="button"
            aria-label="Previous project"
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
            aria-label="Next project"
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
      </div>

      {/* ============================================================
           SWIPER — 3-up centered carousel
           Center slide: aspect 647/485 + 60px title + 18px body + button
           Side slides:  aspect 878/1011 + 33px title + 10px body + opacity 50%
         ============================================================ */}
      <div className="relative z-[2] mt-[60px] lg:mt-[3.125vw]">
        <Swiper
          modules={[Navigation, A11y]}
          slidesPerView={1}
          centeredSlides
          loop
          speed={800}
          spaceBetween={24}
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 32 },
            1024: { slidesPerView: 3, spaceBetween: 60 },
          }}
          onSwiper={(s) => (swiperRef.current = s)}
          onSlideChange={(s) => setActiveIdx(s.realIndex)}
          className="!px-5 md:!px-10 lg:!px-[5.104vw]
                     [&_.swiper-slide]:transition-[opacity,transform]
                     [&_.swiper-slide]:duration-700
                     [&_.swiper-slide]:ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          {PROJECTS.map((p, i) => {
            // Use our own state instead of Swiper's `isActive` render prop —
            // that prop is undefined during SSR (Swiper hasn't booted), so the
            // "Know More" button + landscape image would only appear after
            // hydration. `activeIdx` is initialised to 0 so slide 0 renders
            // active on the server too.
            const isActive = i === activeIdx;
            return (
            <SwiperSlide
              key={`${p.title}-${i}`}
              className="!h-auto group/slide"
            >
                <div
                  className={`flex flex-col items-center w-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                              opacity-100
                              ${isActive
                                ? ""
                                : "lg:opacity-50 lg:translate-y-[1.5vw]"}`}
                >
                  {/* Image
                      Mobile (Figma 3152:3829) — landscape 452×338.825 always full slot width.
                      Desktop active (3152:3488) — landscape 647/485 full slot width.
                      Desktop side (3152:3497) — portrait 327/376 at 60% of slot width centred,
                      with SKETCH artwork instead of the real photo. */}
                  <div
                    className={`relative rounded-[6.986px] lg:rounded-[10px] overflow-hidden
                                shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]
                                w-full aspect-[452/338.825]
                                ${isActive
                                  ? "lg:w-full lg:aspect-[647/485] lg:shadow-[0_30px_70px_-25px_rgba(0,0,0,0.35)]"
                                  : "lg:w-[60%] lg:mx-auto lg:aspect-[327/376]"}`}
                  >
                    {p.image && (
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        unoptimized
                        sizes={isActive ? "(min-width:1024px) 34vw, calc(100vw - 48px)" : "(min-width:1024px) 20vw, calc(100vw - 48px)"}
                        className={`object-cover object-bottom ${isActive ? "" : "lg:hidden"}`}
                      />
                    )}
                    {/* Desktop side card uses the b&w sketch (Figma 3152:3497).
                        Mobile keeps the real photo on every slide. */}
                    {!isActive && SIDE_SKETCH && (
                      <Image
                        src={SIDE_SKETCH}
                        alt=""
                        fill
                        unoptimized
                        sizes="(min-width:1024px) 20vw, 1px"
                        className="hidden lg:block object-cover object-bottom"
                      />
                    )}
                  </div>

                  {/* Title + sub
                      Mobile (Figma 3152:3831): 35px Tartuffo + 12px Montserrat
                      Desktop active (3152:3491):    60 Tartuffo + 18 Montserrat
                      Desktop inactive (3152:3499):  33 Tartuffo + 10 Montserrat (opacity 50)
                  */}
                  <div
                    className={`mt-[17.465px] lg:mt-[2.291vw] flex flex-col items-center
                                gap-[10.479px] lg:gap-[0.44vw] text-center w-full
                                ${isActive ? "" : "lg:opacity-50"}`}
                  >
                    <h3
                      className={`capitalize text-[#333] leading-[1.1] whitespace-nowrap
                                  text-[35px]
                                  ${isActive ? "lg:text-[3.125vw]" : "lg:text-[1.719vw]"}`}
                      style={{
                        fontFamily:
                          '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                      }}
                    >
                      {p.title}
                    </h3>
                    <p
                      className={`font-montserrat font-normal text-[#6d6d6d]
                                  text-[12px]
                                  ${isActive ? "lg:text-[0.938vw]" : "lg:text-[0.521vw]"}`}
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {p.sub}
                    </p>

                    {/* Know More button
                        Mobile (Figma 3152:3834): 156.488×40.519 outlined red, 12.575px
                        Desktop active (3152:3493): 224×58 outlined, 18px
                        Desktop inactive: hidden (Figma side cards have no button) */}
                    <a
                      href={p.ctaLink || "#"}
                      className={`group relative mt-[24.451px] lg:mt-[1.823vw] inline-flex items-center justify-center
                                  whitespace-nowrap overflow-hidden
                                  w-[156.488px] h-[40.519px]
                                  lg:w-[11.667vw] lg:h-[3.02vw]
                                  border border-[#ef493d]
                                  transition-[border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                                  ${isActive ? "lg:inline-flex" : "lg:hidden"}`}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 origin-bottom translate-y-full
                                   group-hover:translate-y-0 transition-transform duration-500
                                   ease-[cubic-bezier(0.22,1,0.36,1)] bg-[#ef493d]"
                      />
                      <span
                        className="relative z-[1] font-montserrat font-medium capitalize
                                   text-[12.575px] lg:text-[0.938vw] tracking-[0.04em]
                                   text-[#ef493d] group-hover:!text-white transition-colors duration-500"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {p.ctaText}
                      </span>
                    </a>
                  </div>
                </div>
            </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Mobile arrows below carousel */}
      <div className="lg:hidden mt-[36px] flex items-center justify-center gap-[16px]">
        <button
          type="button"
          aria-label="Previous project"
          onClick={() => swiperRef.current?.slidePrev()}
          className="group inline-flex items-center justify-center rounded-full border border-[#333]/30 text-[#333]
                     w-[46px] h-[46px]
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
          {String(activeIdx + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}
        </span>
        <button
          type="button"
          aria-label="Next project"
          onClick={() => swiperRef.current?.slideNext()}
          className="group inline-flex items-center justify-center rounded-full border border-[#333]/30 text-[#333]
                     w-[46px] h-[46px]
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

      {/* Bottom divider (Figma 3152:3506) — 1726/1920 = 89.896vw centered */}
      <div className="relative z-[1] mt-[60px] lg:mt-[3.646vw] mx-auto h-px bg-[#333]/15
                      w-[calc(100%-40px)] md:w-[calc(100%-80px)] lg:w-[89.896vw]" />
    </section>
  );
}
