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

/* Filter tabs map onto the `type` enum of the testimonial-item component.
   "all" is a synthetic key that shows everything. */
const FILTERS = [
  { key: "all", label: "All" },
  { key: "video", label: "Video" },
  { key: "text", label: "Text" },
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
      <div className="relative w-full aspect-[16/11] overflow-hidden rounded-[8px] lg:rounded-[0.52vw] bg-[#ece7e0]">
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
            {availableFilters.map(({ key, label }) => {
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
                  {isActive && (
                    <Check
                      className="w-[15px] h-[15px] lg:w-[0.94vw] lg:h-[0.94vw]"
                      strokeWidth={2.5}
                    />
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
