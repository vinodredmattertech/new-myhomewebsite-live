import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, A11y, Controller, EffectFade, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SectionLabel from "@/components/myhome/SectionLabel";
import { mediaUrl } from "@/lib/strapi";
import RichText from "@/components/common/RichText";
import SectionHeading from "@/components/common/SectionHeading";

/* Desktop year-rail geometry (vw units, matched to the image column height).
   The rail is a fixed-height window over the full year list. It starts pinned
   to the first milestone and only scrolls once the active year would leave the
   window — so the list can hold any number of milestones without spilling out
   of the section, and the earliest year still reads from the top. */
const RAIL_VW = 33.75; // rail height — same as the image column
const ROW_VW = 3.125; // one year row (tall enough for the active pill)

/** Fade only the edge that actually has more list behind it. */
function railMask(fadeTop, fadeBottom) {
  const top = fadeTop ? "transparent 0%, #000 14%" : "#000 0%";
  const bottom = fadeBottom ? "#000 86%, transparent 100%" : "#000 100%";
  return `linear-gradient(to bottom, ${top}, ${bottom})`;
}

export default function AboutJourney({ data }) {
  const JOURNEY = Array.isArray(data?.items)
    ? data.items
        .slice()
        .sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
        .map((m) => ({
          year: m.year,
          title: m.title || "",
          body: m.body || "",
          image: mediaUrl(m.image),
        }))
    : [];
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const ribbonRef = useRef(null);
  const [active, setActive] = useState(0);
  const [imageSwiper, setImageSwiper] = useState(null);
  const [contentSwiper, setContentSwiper] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Autoplay is enabled on mobile/tablet only (below the lg breakpoint).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!contentSwiper?.autoplay) return;
    if (isMobile) contentSwiper.autoplay.start();
    else contentSwiper.autoplay.stop();
  }, [contentSwiper, isMobile]);

  // Keep the active chip centred in the mobile year ribbon.
  useEffect(() => {
    const wrap = ribbonRef.current;
    const chip = wrap?.querySelectorAll("li")?.[active];
    if (!wrap || !chip) return;
    wrap.scrollTo({
      left: chip.offsetLeft - wrap.clientWidth / 2 + chip.offsetWidth / 2,
      behavior: "smooth",
    });
  }, [active]);

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
    },
    { scope: rootRef }
  );

  if (!data || !JOURNEY.length) return null;

  const goTo = (i) => {
    if (imageSwiper) imageSwiper.slideToLoop(i);
    if (contentSwiper) contentSwiper.slideToLoop(i);
  };

  const goPrev = () => contentSwiper?.slidePrev();
  const goNext = () => contentSwiper?.slideNext();

  const total = JOURNEY.length;
  // Try to centre the active row, then clamp so the list can never scroll past
  // its own ends: the first year stays pinned to the top of the rail until the
  // active year has moved far enough down to push it off.
  const minShiftVw = Math.min(0, RAIL_VW - total * ROW_VW);
  const railShiftVw = Math.min(
    0,
    Math.max(minShiftVw, RAIL_VW / 2 - (active + 0.5) * ROW_VW)
  );
  const maskImage = railMask(railShiftVw < -0.01, railShiftVw > minShiftVw + 0.01);
  // The track bar reads like a scrollbar: the thumb shows where the active
  // year sits within the whole timeline, not just within the visible window.
  const thumbHeightPct = Math.max(100 / total, 9);
  const thumbTopPct =
    total > 1 ? (active / (total - 1)) * (100 - thumbHeightPct) : 0;

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden
                 py-[30px] md:py-[80px] lg:pt-[4.166vw] lg:pb-[4.166vw]"
    >
      <div className="lg:absolute left-[4.16vw] top-[4.166vw] max-lg:static max-lg:w-full max-lg:flex max-lg:justify-center max-lg:mt-[15px] max-lg:mb-[18px]">
        <SectionLabel>{data.label}</SectionLabel>
      </div>


      <SectionHeading
        ref={headingRef}
        className="text-center text-[#333] capitalize will-change-transform leading-[1.05] tracking-[0.02em]
                   text-[32px] xs:text-[40px] sm:text-[52px] md:text-[64px] lg:text-[5vw]
                   px-5 md:px-10 lg:px-[8.333vw]"
      >
        {data.heading}
      </SectionHeading>

      <div className="relative mt-[40px] md:mt-[56px] lg:mt-[2.604vw] px-5 md:px-10 lg:px-[11.146vw]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-[16px] lg:gap-x-[2vw] items-start">
          {/* ============ LEFT: Image Swiper ============ */}
          <div className="lg:col-span-4 relative w-full aspect-[549/500] lg:aspect-auto lg:h-[33.75vw] overflow-hidden">
            <Swiper
              modules={[Controller, EffectFade, A11y]}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              slidesPerView={1}
              speed={700}
              loop
              allowTouchMove={false}
              onSwiper={setImageSwiper}
              controller={{ control: contentSwiper }}
              className="w-full h-full"
            >
              {JOURNEY.map((slide) => (
                <SwiperSlide key={`img-${slide.year}`}>
                  <div className="relative w-full h-full">
                    {slide.image && (
                      <Image
                        src={slide.image}
                        alt={`${slide.title} — ${slide.year}`}
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 30vw, 100vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* ============ MIDDLE: Years rail + 2px track bar (desktop) ============ */}
          <div className="hidden lg:block lg:col-span-3 relative h-[33.75vw]">
            <div className="relative h-full flex items-stretch justify-end gap-[1.5vw]">
              {/* Windowed rail: starts on the first year and translates to keep
                  the active one in view; the fade hints at more timeline. */}
              <div
                className="relative h-full flex-1 overflow-hidden"
                style={{ maskImage, WebkitMaskImage: maskImage }}
              >
                <ul
                  className="absolute left-0 top-0 w-full transition-transform duration-500 ease-out will-change-transform"
                  style={{ transform: `translateY(${railShiftVw.toFixed(3)}vw)` }}
                >
                  {JOURNEY.map((slide, i) => {
                    const isActive = i === active;
                    return (
                      <li
                        key={`yr-${i}-${slide.year}`}
                        className="flex items-center justify-end h-[3.125vw]"
                      >
                        <button
                          type="button"
                          onClick={() => goTo(i)}
                          aria-label={`Go to ${slide.year}`}
                          aria-current={isActive ? "true" : undefined}
                          className={
                            isActive
                              ? "inline-flex items-center justify-center rounded-full border border-[#ef493d] px-[1.302vw] py-[0.521vw] font-montserrat font-medium text-[#ef493d] text-[1.458vw] tracking-[0.04em] bg-white whitespace-nowrap transition-colors duration-300"
                              : "font-montserrat font-normal text-[#333]/25 text-[1.458vw] tracking-[0.04em] transition-colors duration-300 cursor-pointer hover:text-[#ef493d]/60"
                          }
                          style={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          {slide.year}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* 2px vertical track bar with moving thumb */}
              <div className="relative h-full w-[2px] shrink-0 self-stretch">
                <div className="absolute inset-0 bg-[#33333322]" />
                <div
                  className="absolute left-0 w-full bg-[#333] transition-all duration-500 ease-out"
                  style={{
                    height: `${thumbHeightPct}%`,
                    top: `${thumbTopPct}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* ============ Mobile/tablet year ribbon — horizontally scrollable ============ */}
          <div
            ref={ribbonRef}
            className="lg:hidden -mx-5 md:-mx-10 px-5 md:px-10 overflow-x-auto no-scrollbar"
          >
            <ul className="flex w-max items-center gap-[10px] py-[2px]">
              {JOURNEY.map((slide, i) => {
                const isActive = i === active;
                return (
                  <li key={`myr-${i}-${slide.year}`}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Go to ${slide.year}`}
                      aria-current={isActive ? "true" : undefined}
                      className={
                        isActive
                          ? "inline-flex items-center justify-center rounded-full border border-[#ef493d] px-[20px] py-[8px] font-montserrat font-medium text-[#ef493d] text-[18px] md:text-[20px] tracking-[0.84px] whitespace-nowrap"
                          : "inline-flex items-center justify-center rounded-full border border-transparent px-[10px] py-[8px] font-montserrat font-normal text-[#333]/30 text-[18px] md:text-[20px] tracking-[0.84px] whitespace-nowrap"
                      }
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {slide.year}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ============ RIGHT: Content Swiper ============ */}
          <div className="lg:col-span-5 relative lg:h-[33.75vw]">
            <Swiper
              modules={[Controller, Keyboard, A11y, Autoplay]}
              slidesPerView={1}
              spaceBetween={32}
              speed={700}
              loop
              keyboard={{ enabled: true }}
              autoplay={
                isMobile
                  ? { delay: 3500, disableOnInteraction: false }
                  : false
              }
              onSwiper={setContentSwiper}
              onSlideChange={(s) => setActive(s.realIndex)}
              controller={{ control: imageSwiper }}
              className="w-full h-full"
            >
              {JOURNEY.map((slide) => (
                <SwiperSlide key={`txt-${slide.year}`}>
                  <div className="flex flex-col gap-[14px] md:gap-[20px] lg:gap-[1.302vw] relative lg:pt-[7.3vw]">
                    {/* Big translucent year (desktop ghost) */}
                    <p
                      className="hidden lg:block absolute -top-[.5vw] left-0 select-none pointer-events-none
                                 bg-clip-text bg-gradient-to-b from-[#161616] to-[rgba(51,51,51,0)]
                                 text-[transparent] text-[8.5vw] tracking-[0.18vw] leading-[0.95] capitalize whitespace-nowrap"
                      style={{
                        fontFamily:
                          '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                        fontWeight: 700,
                        opacity: 0.08,
                      }}
                    >
                      {slide.year}
                    </p>

                    <h3
                      className="capitalize text-[#333] tracking-[0.04em] leading-[1.15] relative
                                 text-[26px] sm:text-[32px] md:text-[36px] lg:text-[2.187vw]"
                      style={{
                        fontFamily:
                          '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                        fontWeight: 400,
                      }}
                    >
                      {slide.title}
                    </h3>
                    <p
                      className="font-montserrat font-normal text-[#323232] relative
                                 text-[14px] sm:text-[15px] md:text-[16px] lg:text-[0.938vw]
                                 leading-[24px] sm:leading-[26px] md:leading-[28px] lg:leading-[1.666vw]
                                 max-w-[640px] lg:max-w-[30.26vw]"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      <RichText>{slide.body}</RichText>
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Bottom row — separate row, NOT part of the swiper grid.
            "40 Years of Experience" is horizontally centred on the section;
            prev/next arrows are pinned to the right. */}
        <div className="mt-[16px] md:mt-[40px] lg:mt-[2.604vw] relative flex items-end justify-end max-sm:justify-between gap-[24px]">
          <div
            className="flex items-end gap-[12px] lg:gap-[0.98vw]
                       lg:absolute lg:left-1/2 lg:bottom-0 lg:-translate-x-1/2"
          >
            <span
              className="leading-none text-[#333]
                         text-[56px] sm:text-[72px] md:text-[80px] lg:text-[5.833vw]"
              style={{
                fontFamily:
                  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                fontWeight: 400,
              }}
            >
              {data.experienceYears ?? 40}
            </span>
            <span
              className="font-montserrat text-[#333]/80 max-w-[110px] lg:max-w-[5.781vw]
                         text-[12px] sm:text-[13px] lg:text-[0.818vw] leading-[1.4]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {data.experienceLabel || "Years of Experience"}
            </span>
          </div>

          <div className="flex items-center gap-[12px] lg:gap-[1.042vw]">
            <button
              type="button"
              aria-label="Previous year"
              onClick={goPrev}
              className="inline-flex items-center justify-center rounded-full
                         border border-[#33333344] text-[#333]
                         w-[44px] h-[44px] md:w-[54px] md:h-[54px] lg:w-[3.645vw] lg:h-[3.645vw]
                         hover:bg-[#ef493d] hover:text-white hover:border-[#ef493d]
                         transition-colors duration-300"
            >
              <ArrowLeft className="w-[16px] h-[16px] lg:w-[1.094vw] lg:h-[1.094vw]" />
            </button>
            <button
              type="button"
              aria-label="Next year"
              onClick={goNext}
              className="inline-flex items-center justify-center rounded-full
                         border border-[#33333344] text-[#333]
                         w-[44px] h-[44px] md:w-[54px] md:h-[54px] lg:w-[3.645vw] lg:h-[3.645vw]
                         hover:bg-[#ef493d] hover:text-white hover:border-[#ef493d]
                         transition-colors duration-300"
            >
              <ArrowRight className="w-[16px] h-[16px] lg:w-[1.094vw] lg:h-[1.094vw]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
