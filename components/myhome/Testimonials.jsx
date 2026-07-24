import React, { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y, Autoplay} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { mediaUrl } from "@/lib/strapi";
import RichText from "@/components/common/RichText";
import useFancybox from "@/components/common/useFancybox";
import SectionHeading from "@/components/common/SectionHeading";

const BADGE_COLORS = { red: "#ef493d", gold: "#c39a3e" };

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

/**
 * Normalise one Strapi `home.testimonial-item` entry into the shape the slide
 * markup expects. Shared by both tabs so Community and Blockbuster render
 * identically — only the source list differs.
 */
function mapItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((t) => {
    const videoFileUrl = mediaUrl(t.videoFile);
    // isVideo=true → play the uploaded videoFile; else → use videoUrl
    const videoSrc = t.isVideo ? videoFileUrl : t.videoUrl || "";
    // Decide which Fancybox content type to use. Uploaded files and
    // direct .mp4/.webm/.mov URLs play as html5video. For YouTube/Vimeo
    // we leave the type undefined so Fancybox v5 auto-detects the
    // provider and builds the correct embed (forcing "iframe" would load
    // the raw watch page, which YouTube refuses to frame).
    const isDirectVideo =
      t.isVideo || /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(videoSrc || "");
    return {
      quote: t.quote || "",
      name: t.name || "",
      image: mediaUrl(t.image),
      badge: BADGE_COLORS[t.badgeColor] || BADGE_COLORS.red,
      videoSrc,
      videoType: isDirectVideo ? "html5video" : undefined,
    };
  });
}

export default function Testimonials({ data }) {
  // Two tabs, each backed by its own repeatable component in Strapi:
  //   Community   → testimonials.items
  //   Blockbuster → testimonials.blockbusterItems
  const COMMUNITY = mapItems(data?.items);
  const BLOCKBUSTER = mapItems(data?.blockbusterItems);

  const TABS = [
    {
      key: "community",
      label: data?.communityTabLabel || "Community",
      items: COMMUNITY,
    },
    {
      key: "blockbuster",
      label: data?.blockbusterTabLabel || "Blockbuster",
      items: BLOCKBUSTER,
    },
  ];

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const paraRef = useRef(null);
  const labelRef = useRef(null);
  const swiperRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("community");

  // Only offer a tab that actually has entries behind it, so Blockbuster stays
  // hidden until stories are added in Strapi. If the selected tab drops to
  // empty (content unpublished), fall back to the first tab that still has
  // slides instead of rendering an empty carousel.
  const availableTabs = TABS.filter((t) => t.items.length);
  const effectiveTab = availableTabs.some((t) => t.key === activeTab)
    ? activeTab
    : availableTabs[0]?.key;
  const TESTIMONIALS =
    availableTabs.find((t) => t.key === effectiveTab)?.items || [];

  const onTabChange = (key) => {
    if (key === activeTab) return;
    setActiveTab(key);
    setActiveIdx(0);
  };

  // Bind Fancybox to the section so every [data-fancybox] play button opens
  // its testimonial video in a lightbox modal.
  const [fancyboxRoot] = useFancybox();
  const attachFancy = (el) => {
    rootRef.current = el;
    fancyboxRoot(el);
  };

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

  if (!data || !TESTIMONIALS.length) return null;

  return (
    <section
      ref={attachFancy}
      id="testimonials"
      data-section="testimonials"
      className="relative w-full bg-white overflow-hidden
                 pt-[20px] pb-[64px]
                 lg:pt-[4vw] lg:pb-[4.166vw]"
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
          {data.label}
        </span>
      </div>

      {/* Heading + body block */}
      <div
        className="relative z-[3] flex flex-col gap-[16px] lg:gap-[1.563vw]
                   pl-[64px] pr-5 sm:pl-[80px] sm:pr-8
                   lg:pl-[11.146vw] lg:pr-[4.166vw]
                   max-w-[805px] lg:max-w-[61.927vw]"
      >
        {/* Tabs — Community / Blockbuster. Each switches the carousel to its
            own set of testimonials managed in Strapi. Rendered only when both
            tabs have content; a single populated tab needs no switcher. */}
        {availableTabs.length > 1 && (
          <div
            role="tablist"
            aria-label="Testimonial categories"
            className="flex flex-wrap items-center gap-[10px] lg:gap-[0.833vw]"
          >
            {availableTabs.map((t) => {
              const isActive = t.key === effectiveTab;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTabChange(t.key)}
                  className={`font-montserrat font-medium capitalize rounded-full border
                              px-[18px] py-[9px] md:px-[22px] md:py-[11px]
                              lg:px-[1.302vw] lg:py-[0.625vw]
                              text-[13px] sm:text-[15px] lg:text-[0.938vw]
                              transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                              ${
                                isActive
                                  ? "bg-[#ef493d] text-white border-[#ef493d]"
                                  : "bg-transparent text-[#454545] border-[#e7e7e7] hover:border-[#ef493d] hover:text-[#ef493d]"
                              }`}
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        <SectionHeading
          ref={headingRef}
          className="capitalize text-[#333] tracking-[2px]
                     leading-[1.15] lg:leading-[normal]
                     text-[32px] xs:text-[35px] sm:text-[44px] md:text-[64px] lg:text-[4vw]
                     will-change-transform"
        >
          {data.heading}
        </SectionHeading>
        <p
          ref={paraRef}
          className="font-montserrat font-normal text-[#333] lg:text-[#6d6d6d] text-justify
                     text-[14px] md:text-[16px] lg:text-[0.938vw]
                     leading-[24px] lg:leading-[1.563vw]
                     max-w-[742px] lg:w-[38.646vw] lg:max-w-none"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <RichText>{data.body}</RichText>
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
      <div className="relative z-[2] mt-[36px] lg:mt-[5vw]">
        <Swiper
          /* Remount on tab change — loop mode caches its slide clones, so
             swapping the children in place leaves stale duplicates behind. */
          key={effectiveTab}
              modules={[Navigation, A11y, Autoplay]}
          slidesPerView="auto"
          spaceBetween={24}
          speed={700}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          breakpoints={{
            640: { spaceBetween: 32 },
            1024: { spaceBetween: 60 },
          }}
          onSwiper={(s) => (swiperRef.current = s)}
          onSlideChange={(s) => setActiveIdx(s.realIndex)}
          className="!px-5 md:!px-8 lg:!px-[7.448vw] !overflow-visible"
        >
          {TESTIMONIALS.map((t, i) => (
            <SwiperSlide key={`${effectiveTab}-${t.name}-${i}`}      className="!h-auto !w-[calc(100vw-40px)] md:!w-[calc(100vw-64px)] lg:!w-[45.052vw]">
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
                  {t.image && (
                    <Image
                      src={t.image}
                      alt={t.name}
                      fill
                      unoptimized
                      sizes="(min-width:1024px) 19vw, calc(100vw - 40px)"
                      className="object-cover object-center"
                    />
                  )}
                  {/* Dark overlay (Figma rgba(0,0,0,0.1)) */}
                  <div className="absolute inset-0 bg-black/10" />

                  {/* Play button — red OR gold per Figma. Opens the
                      testimonial video in a Fancybox modal. When the item
                      has no playable source it's rendered disabled. */}
                  {t.videoSrc ? (
                    <a
                      href={t.videoSrc}
                      data-fancybox={`testimonial-${effectiveTab}-${i}`}
                      {...(t.videoType ? { "data-type": t.videoType } : {})}
                      aria-label={`Play video testimonial — ${t.name}`}
                      className="absolute inset-0 m-auto inline-flex items-center justify-center
                                 w-[60px] h-[40px] lg:w-[4.125vw] lg:h-[2.719vw]
                                 rounded-full text-white
                                 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                                 hover:scale-110"
                      style={{ background: t.badge }}
                    >
                      <PlayIcon className="w-[18px] h-[18px] lg:w-[1.125vw] lg:h-[1.125vw]" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-label={`Video unavailable — ${t.name}`}
                      className="absolute inset-0 m-auto inline-flex items-center justify-center
                                 w-[60px] h-[40px] lg:w-[4.125vw] lg:h-[2.719vw]
                                 rounded-full text-white opacity-60 cursor-not-allowed"
                      style={{ background: t.badge }}
                    >
                      <PlayIcon className="w-[18px] h-[18px] lg:w-[1.125vw] lg:h-[1.125vw]" />
                    </button>
                  )}
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
