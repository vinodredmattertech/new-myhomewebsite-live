import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, A11y } from "swiper/modules";
import "swiper/css";
import { Check, Play, Quote, ArrowLeft, ArrowRight } from "lucide-react";
import SectionLabel from "@/components/myhome/SectionLabel";
import useFancybox from "@/components/common/useFancybox";
import { mediaUrl } from "@/lib/strapi";
import SectionHeading from "@/components/common/SectionHeading";

const BADGE_COLORS = { red: "#ef493d", gold: "#c39a3e" };

const HEADING_FONT = {
  fontFamily:
    '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
};
const BODY_FONT = { fontFamily: "Montserrat, sans-serif" };

/* Tab glyphs are inlined (rather than <Image src="/images/*.svg">) so they
   paint with currentColor and follow the pill's active / hover states. */
function VideoTabIcon(props) {
  return (
    <svg viewBox="0 0 25 19" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.01786 0C2.95226 0 1.9303 0.428953 1.1768 1.19249C0.423309 1.95603 0 2.99162 0 4.07143V14.9286C0 16.0084 0.423309 17.044 1.1768 17.8075C1.9303 18.571 2.95226 19 4.01786 19H14.7321C15.7977 19 16.8197 18.571 17.5732 17.8075C18.3267 17.044 18.75 16.0084 18.75 14.9286V13.5859L22.3402 16.388C23.4268 17.2348 25 16.4504 25 15.0616V3.93843C25 2.54962 23.4268 1.76519 22.3402 2.61205L18.75 5.4141V4.07143C18.75 2.99162 18.3267 1.95603 17.5732 1.19249C16.8197 0.428953 15.7977 0 14.7321 0H4.01786ZM17.8571 6.32881V14.9286C17.8571 15.7684 17.5279 16.5739 16.9419 17.1677C16.3558 17.7616 15.5609 18.0952 14.7321 18.0952H4.01786C3.18906 18.0952 2.3942 17.7616 1.80815 17.1677C1.2221 16.5739 0.892857 15.7684 0.892857 14.9286V4.07143C0.892857 3.23158 1.2221 2.42612 1.80815 1.83226C2.3942 1.23839 3.18906 0.904762 4.01786 0.904762H14.7321C15.5609 0.904762 16.3558 1.23839 16.9419 1.83226C17.5279 2.42612 17.8571 3.23158 17.8571 4.07143V6.32881ZM18.75 12.4441V6.5559L22.8848 3.32952C22.9971 3.2418 23.1314 3.1877 23.2725 3.17336C23.4136 3.15902 23.5558 3.18502 23.683 3.24841C23.8103 3.3118 23.9175 3.41004 23.9924 3.53199C24.0674 3.65395 24.1071 3.79475 24.1071 3.93843V15.0616C24.1071 15.2052 24.0674 15.346 23.9924 15.468C23.9175 15.59 23.8103 15.6882 23.683 15.7516C23.5558 15.815 23.4136 15.841 23.2725 15.8266C23.1314 15.8123 22.9971 15.7582 22.8848 15.6705L18.75 12.4441Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TextTabIcon(props) {
  return (
    <svg viewBox="0 0 24 21" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7.35 6.20962H16.15M7.35 9.4854H16.15M19.45 14.945H16.6725C16.5085 14.9452 16.3467 14.982 16.1991 15.0529C16.0514 15.1238 15.9219 15.2269 15.82 15.3545L12.6025 19.34C12.4994 19.4679 12.3687 19.5712 12.22 19.6422C12.0713 19.7132 11.9084 19.75 11.7434 19.75C11.5784 19.75 11.4155 19.7132 11.2668 19.6422C11.1181 19.5712 10.9874 19.4679 10.8843 19.34L7.6668 15.3545C7.56481 15.2268 7.43506 15.1236 7.28724 15.0527C7.13943 14.9818 6.97737 14.945 6.8132 14.945H4.05C2.2218 14.945 0.75 13.484 0.75 11.6692V4.02577C0.75 2.211 2.2218 0.75 4.05 0.75H19.45C21.2793 0.75 22.75 2.211 22.75 4.02577V11.6692C22.75 13.484 21.2793 14.945 19.45 14.945Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Filter tabs map onto the `type` enum of the testimonial-item component.
   "all" is a synthetic key that shows everything. */
const FILTERS = [
  { key: "all", label: "All" },
  { key: "video", label: "Video", Icon: VideoTabIcon },
  { key: "text", label: "Text", Icon: TextTabIcon },
];

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Normalise a CMS testimonial-item into a flat, render-ready shape. */
function normalise(t) {
  const videoFileUrl = mediaUrl(t.videoFile);
  // Uploaded file wins over an external URL; either may be present.
  const videoSrc = videoFileUrl || t.videoUrl || "";
  // Uploaded files and direct media URLs play as <video>; everything else
  // (YouTube/Vimeo/etc.) opens as an iframe inside Fancybox.
  const isDirectVideo =
    !!videoFileUrl ||
    /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(videoSrc || "");
  return {
    type: t.type === "text" ? "text" : "video",
    name: t.name || "",
    role: t.role || "",
    tag: t.tag || "Resident",
    date: t.date || "",
    quote: t.quote || "",
    image: mediaUrl(t.image),
    badge: BADGE_COLORS[t.badgeColor] || BADGE_COLORS.red,
    videoSrc,
    videoType: isDirectVideo ? "video" : "iframe",
  };
}

/** Meta row shared by both card types: "Resident | 16 Jan, 2026". */
function CardMeta({ t }) {
  return (
    <div className="flex flex-col gap-[4px] lg:gap-[0.26vw] mt-[12px] lg:mt-[0.83vw]">
      <h3
        className="text-[#333] capitalize text-[17px] lg:text-[1.04vw] leading-[1.2]"
        style={{ ...HEADING_FONT, fontWeight: 400 }}
      >
        {t.name}
      </h3>
      {t.role && (
        <p
          className="font-montserrat text-[#6d6d6d] text-[12px] lg:text-[0.78vw] leading-[1.4]"
          style={BODY_FONT}
        >
          {t.role}
        </p>
      )}
      {(t.tag || t.date) && (
        <p
          className="font-montserrat text-[#9a9a9a] text-[11px] lg:text-[0.68vw] tracking-[0.02em]"
          style={BODY_FONT}
        >
          {[t.tag, formatDate(t.date)].filter(Boolean).join(" | ")}
        </p>
      )}
    </div>
  );
}

/** Video testimonial card — thumbnail + centred play button (→ Fancybox). */
function VideoCard({ t, idx }) {
  return (
    <article className="group flex h-full flex-col">
      <div className="relative w-full h-[250px]  md:h-[25.625vw] md:w-[19.688vw] overflow-hidden rounded-[8px] lg:rounded-[0.52vw] bg-[#ece7e0]">
        {t.image && (
          <Image
            src={t.image}
            alt={t.name || "Testimonial"}
            fill
            unoptimized
            sizes="(min-width:1024px) 22vw, (min-width:640px) 45vw, 90vw"
            className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          />
        )}
        <div className="absolute inset-0 bg-black/10" />

        {t.videoSrc ? (
          <a
            href={t.videoSrc}
            data-fancybox={`testimonial-${idx}`}
            data-type={t.videoType}
            aria-label={`Play video testimonial — ${t.name}`}
            className="absolute inset-0 m-auto inline-flex items-center justify-center
                       w-[52px] h-[52px] lg:w-[3.4vw] lg:h-[3.4vw] rounded-full text-white
                       shadow-[0_12px_30px_-8px_rgba(0,0,0,0.5)]
                       transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                       hover:scale-110"
            style={{ background: t.badge }}
          >
            <Play
              className="w-[18px] h-[18px] lg:w-[1.15vw] lg:h-[1.15vw] translate-x-[1px]"
              fill="currentColor"
              strokeWidth={0}
            />
          </a>
        ) : (
          <span
            aria-label="Video unavailable"
            className="absolute inset-0 m-auto inline-flex items-center justify-center
                       w-[52px] h-[52px] lg:w-[3.4vw] lg:h-[3.4vw] rounded-full text-white opacity-60"
            style={{ background: t.badge }}
          >
            <Play className="w-[18px] h-[18px] lg:w-[1.15vw] lg:h-[1.15vw]" fill="currentColor" strokeWidth={0} />
          </span>
        )}
      </div>
      <CardMeta t={t} />
    </article>
  );
}

/** Text testimonial card — quote glyph + body + meta. */
function TextCard({ t }) {
  return (
    <article className="flex h-full flex-col rounded-[8px] lg:rounded-[0.52vw] border border-[#ececec] bg-white p-[24px] lg:p-[1.66vw]">
      <Quote
        className="w-[26px] h-[26px] lg:w-[1.66vw] lg:h-[1.66vw] text-[#ef493d] opacity-[0.25]"
        fill="currentColor"
        strokeWidth={0}
      />
      <p
        className="font-montserrat text-[#555] mt-[14px] lg:mt-[0.9vw]
                   text-[14px] lg:text-[0.94vw] leading-[24px] lg:leading-[1.66vw]"
        style={BODY_FONT}
      >
        {t.quote}
      </p>
      <div className="mt-auto pt-[18px] lg:pt-[1.2vw]">
        <span className="block h-px w-full bg-[#ececec]" aria-hidden="true" />
        <CardMeta t={t} />
      </div>
    </article>
  );
}

/** Slider of testimonial cards with prev/next navigation — shared by the
    Video and Text filters. Owns its own Swiper + nav refs so each filter
    gets independent controls. */
function CardSlider({ items, renderCard }) {
  const swiperRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const showNav = items.length > 1;

  return (
    <div className="relative">
      {showNav && (
        <>
          <button
            ref={prevRef}
            type="button"
            aria-label="Previous"
            onClick={() => swiperRef.current?.slidePrev()}
            className="hidden lg:inline-flex absolute left-0 top-[35%] -translate-y-1/2 z-10
                       items-center justify-center rounded-full bg-white
                       border border-[#33333333] text-[#333]
                       lg:w-[3.12vw] lg:h-[3.12vw]
                       shadow-[0_10px_30px_-12px_rgba(0,0,0,0.3)]
                       hover:bg-[#ef493d] hover:text-white hover:border-[#ef493d]
                       transition-colors duration-300"
          >
            <ArrowLeft className="lg:w-[1.04vw] lg:h-[1.04vw]" />
          </button>
          <button
            ref={nextRef}
            type="button"
            aria-label="Next"
            onClick={() => swiperRef.current?.slideNext()}
            className="hidden lg:inline-flex absolute right-0 top-[35%] -translate-y-1/2 z-10
                       items-center justify-center rounded-full bg-white
                       border border-[#33333333] text-[#333]
                       lg:w-[3.12vw] lg:h-[3.12vw]
                       shadow-[0_10px_30px_-12px_rgba(0,0,0,0.3)]
                       hover:bg-[#ef493d] hover:text-white hover:border-[#ef493d]
                       transition-colors duration-300"
          >
            <ArrowRight className="lg:w-[1.04vw] lg:h-[1.04vw]" />
          </button>
        </>
      )}

      <div className={showNav ? "lg:px-[4.5vw]" : ""}>
        <Swiper
          modules={[Navigation, Keyboard, A11y]}
          slidesPerView={1.15}
          spaceBetween={16}
          speed={600}
          keyboard={{ enabled: true }}
          onSwiper={(s) => (swiperRef.current = s)}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="w-full"
        >
          {items.map((t, i) => (
            <SwiperSlide key={`${t.name}-${i}`} className="!h-auto">
              {renderCard(t, i)}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {showNav && (
        <div className="flex lg:hidden items-center justify-center gap-[14px] mt-[28px]">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => swiperRef.current?.slidePrev()}
            className="inline-flex items-center justify-center rounded-full bg-white
                       border border-[#33333333] text-[#333] w-[46px] h-[46px]
                       shadow-[0_10px_30px_-12px_rgba(0,0,0,0.3)]
                       hover:bg-[#ef493d] hover:text-white hover:border-[#ef493d]
                       transition-colors duration-300"
          >
            <ArrowLeft className="w-[16px] h-[16px]" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => swiperRef.current?.slideNext()}
            className="inline-flex items-center justify-center rounded-full bg-white
                       border border-[#33333333] text-[#333] w-[46px] h-[46px]
                       shadow-[0_10px_30px_-12px_rgba(0,0,0,0.3)]
                       hover:bg-[#ef493d] hover:text-white hover:border-[#ef493d]
                       transition-colors duration-300"
          >
            <ArrowRight className="w-[16px] h-[16px]" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function TestimonialsListing({ heading, sectionLabel, items = [] }) {
  const ALL = useMemo(
    () => (Array.isArray(items) ? items.map(normalise).filter((t) => t.name || t.quote) : []),
    [items]
  );

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const gridRef = useRef(null);

  const [filter, setFilter] = useState("all");

  // Only offer filter tabs that actually have content behind them.
  const availableFilters = useMemo(() => {
    const types = new Set(ALL.map((t) => t.type));
    return FILTERS.filter((f) => f.key === "all" || types.has(f.key));
  }, [ALL]);

  const videos = useMemo(() => ALL.filter((t) => t.type === "video"), [ALL]);
  const texts = useMemo(() => ALL.filter((t) => t.type === "text"), [ALL]);

  // Bind Fancybox to the section so every [data-fancybox] play button opens
  // its video in a lightbox modal.
  const [fancyboxRoot] = useFancybox();
  const attachRoot = (el) => {
    rootRef.current = el;
    fancyboxRoot(el);
  };

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

  const animateGrid = (callback) => {
    if (!gridRef.current) {
      callback();
      return;
    }
    gsap.to(gridRef.current, {
      autoAlpha: 0,
      y: 16,
      duration: 0.22,
      ease: "sine.in",
      onComplete: () => {
        callback();
        gsap.fromTo(
          gridRef.current,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }
        );
      },
    });
  };

  const onFilterChange = (key) => {
    if (key === filter) return;
    animateGrid(() => setFilter(key));
  };

  // "Video" → slider of video cards. "Text" → slider of text cards.
  // "All" → every video as a grid card followed by text cards.
  const showVideoSlider = filter === "video";
  const showTextSlider = filter === "text";
  const gridItems = filter === "all" ? ALL : [];

  return (
    <section
      ref={attachRoot}
      id="testimonials"
      data-section="testimonials-listing"
      className="relative w-full bg-white overflow-hidden
                 pt-[56px] md:pt-[80px] lg:pt-[4.68vw]
                 pb-[60px] md:pb-[80px] lg:pb-[5.2vw]"
    >
      <div className="absolute left-[20px] top-[40px] lg:left-[4.16vw] lg:top-[4.68vw] z-10">
        <SectionLabel>{sectionLabel || "Video Story"}</SectionLabel>
      </div>

      <div className="relative z-10 px-5 md:px-10 lg:px-[8.33vw]">
        <SectionHeading
          ref={headingRef}
          className="text-[#333] capitalize text-center will-change-transform leading-[1.05] tracking-[0.02em]
                     text-[36px] xs:text-[44px] sm:text-[56px] md:text-[72px] lg:text-[3.5vw]
                     max-w-[1100px] mx-auto"
        >
          {heading || "Stories From Home"}
        </SectionHeading>

        {/* Filter tabs — All / Video / Text */}
        <div className="mt-[32px] md:mt-[44px] lg:mt-[2.6vw] flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-[10px] lg:gap-[0.62vw]">
            {availableFilters.map(({ key, label, Icon }) => {
              const isActive = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onFilterChange(key)}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-[7px] lg:gap-[0.41vw]
                              font-montserrat font-normal capitalize transition-all duration-300
                              rounded-full border
                              px-[18px] py-[9px] md:px-[22px] md:py-[11px]
                              lg:px-[1.3vw] lg:py-[0.62vw]
                              text-[13px] sm:text-[15px] lg:text-[0.94vw]
                              ${
                                isActive
                                  ? "bg-[#ef493d] text-white border-[#ef493d]"
                                  : "bg-transparent text-[#454545] border-[#e7e7e7] hover:border-[#ef493d] hover:text-[#ef493d]"
                              }`}
                  style={BODY_FONT}
                >
                  {/* Tabs with their own icon (Video / Text) skip the tick. */}
                  {isActive && !Icon && (
                    <Check
                      className="w-[15px] h-[15px] lg:w-[0.94vw] lg:h-[0.94vw]"
                      strokeWidth={2.5}
                    />
                  )}
                  {Icon && (
                    <Icon className="h-[14px] w-auto lg:h-[0.88vw] shrink-0" />
                  )}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results — slider for Video & Text, grid for All */}
        <div ref={gridRef} className="mt-[32px] md:mt-[40px] lg:mt-[2.6vw]">
          {ALL.length === 0 ? (
            <p
              className="text-center font-montserrat text-[#6d6d6d] py-[60px] text-[14px] lg:text-[1.04vw]"
              style={BODY_FONT}
            >
              Stories are on their way — please check back soon.
            </p>
          ) : showVideoSlider ? (
            videos.length === 0 ? (
              <p
                className="text-center font-montserrat text-[#6d6d6d] py-[60px] text-[14px] lg:text-[1.04vw]"
                style={BODY_FONT}
              >
                No video testimonials yet — try a different filter.
              </p>
            ) : (
              <CardSlider
                items={videos}
                renderCard={(t, i) => <VideoCard t={t} idx={i} />}
              />
            )
          ) : showTextSlider ? (
            texts.length === 0 ? (
              <p
                className="text-center font-montserrat text-[#6d6d6d] py-[60px] text-[14px] lg:text-[1.04vw]"
                style={BODY_FONT}
              >
                No text testimonials yet — try a different filter.
              </p>
            ) : (
              <CardSlider items={texts} renderCard={(t) => <TextCard t={t} />} />
            )
          ) : gridItems.length === 0 ? (
            <p
              className="text-center font-montserrat text-[#6d6d6d] py-[60px] text-[14px] lg:text-[1.04vw]"
              style={BODY_FONT}
            >
              No testimonials in this category yet — try a different filter.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px] md:gap-[24px] lg:gap-[1.66vw]">
              {gridItems.map((t, i) =>
                t.type === "video" ? (
                  <VideoCard key={`${t.name}-${i}`} t={t} idx={i} />
                ) : (
                  <TextCard key={`${t.name}-${i}`} t={t} />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
