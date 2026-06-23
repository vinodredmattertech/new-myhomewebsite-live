import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, A11y, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import {
  CalendarDays,
  ArrowRight,
  ArrowLeft,
  Check,
  Newspaper,
  BookOpen,
  Tv,
} from "lucide-react";
import SectionLabel from "@/components/myhome/SectionLabel";
import { mediaUrl } from "@/lib/strapi";
import SectionHeading from "@/components/common/SectionHeading";

/* Filter tabs map 1:1 onto the `mediaType` enum on the Strapi content type. */
const FILTERS = [
  { key: "all", label: "All", Icon: null },
  { key: "Print", label: "Print", Icon: Newspaper },
  { key: "Magazines", label: "Magazines", Icon: BookOpen },
  { key: "Electronic", label: "Electronic", Icon: Tv },
];

const HEADING_FONT = {
  fontFamily:
    '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
};
const BODY_FONT = { fontFamily: "Montserrat, sans-serif" };

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

function normaliseCmsNews(n) {
  return {
    title: n.title || "",
    excerpt: n.excerpt || "",
    mediaType: n.mediaType || "Print",
    publication: n.publication || "",
    publicationLogo: mediaUrl(n.publicationLogo),
    author: n.author || "",
    authorRole: n.authorRole || "",
    publishedDate: n.publishedDate || "",
    image: mediaUrl(n.coverImage),
    externalUrl: n.externalUrl || "",
    featured: !!n.featured,
    href: n.slug ? `/news/${n.slug}` : "#",
  };
}

/** Small publication masthead (logo if present, else the plain name). */
function PublicationMark({ news, className = "", logoClass = "" }) {
  if (news.publicationLogo) {
    return (
      <span className={`relative block ${logoClass}`}>
        <Image
          src={news.publicationLogo}
          alt={news.publication || "Publication"}
          fill
          unoptimized
          sizes="200px"
          className="object-contain object-left"
        />
      </span>
    );
  }
  if (!news.publication) return null;
  return (
    <span
      className={`font-montserrat font-semibold text-[#1f2937] ${className}`}
      style={BODY_FONT}
    >
      {news.publication}
    </span>
  );
}

function MediaTypeTag({ children }) {
  return (
    <span
      className="inline-flex items-center bg-[#fff] text-[#333] rounded-full
                 px-[14px] py-[6px] lg:px-[0.833vw] lg:py-[0.365vw]
                 font-montserrat font-medium uppercase tracking-[0.06em]
                 text-[11px] lg:text-[0.625vw]"
      style={BODY_FONT}
    >
      {children}
    </span>
  );
}

/**
 * Large featured feature — large image on the left, a "written & verified"
 * publication card on the right (the hero block above the slider).
 */
function FeaturedFeature({ news }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_22vw] gap-[24px] lg:gap-[1.667vw] items-stretch">
      <Link
        href={news.href}
        className="group relative block w-full aspect-[16/10] lg:aspect-auto rounded-[12px] overflow-hidden bg-[#f5f1eb]"
      >
        {news.image && (
          <Image
            src={news.image}
            alt={news.title}
            fill
            priority
            unoptimized
            sizes="(min-width:1024px) 70vw, 100vw"
            className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        )}
        <div className="absolute top-[16px] left-[16px] lg:top-[1.042vw] lg:left-[1.042vw]">
          <MediaTypeTag>{news.mediaType}</MediaTypeTag>
        </div>
      </Link>

      <article className="flex flex-col justify-between bg-white border-[0.7px] border-[rgba(43,43,43,0.14)] rounded-[12px] p-[24px] lg:p-[1.667vw]">
        <div className="flex flex-col gap-[18px] lg:gap-[1.146vw]">
          <PublicationMark
            news={news}
            className="text-[18px] lg:text-[1.146vw]"
            logoClass="w-[150px] h-[34px] lg:w-[9.5vw] lg:h-[2.2vw]"
          />

          <div className="h-px w-full bg-[#ededed]" aria-hidden="true" />

          {news.author && (
            <div className="flex flex-col gap-[6px] lg:gap-[0.365vw]">
              <span
                className="font-montserrat font-semibold uppercase tracking-[0.12em] text-[#9a9a9a] text-[10px] lg:text-[0.625vw]"
                style={BODY_FONT}
              >
                Written and Verified By
              </span>
              <span
                className="font-montserrat font-semibold text-[#1f2937] text-[16px] lg:text-[1.04vw]"
                style={BODY_FONT}
              >
                {news.author}
              </span>
              {news.authorRole && (
                <span
                  className="font-montserrat text-[#6d6d6d] text-[13px] lg:text-[0.781vw]"
                  style={BODY_FONT}
                >
                  {news.authorRole}
                </span>
              )}
            </div>
          )}

          <h3
            className="text-[#333] leading-[1.22] text-[20px] lg:text-[1.354vw] line-clamp-3"
            style={{ ...HEADING_FONT, fontWeight: 300 }}
          >
            {news.title}
          </h3>
        </div>

        <div className="mt-[20px] lg:mt-[1.302vw] flex flex-col gap-[14px] lg:gap-[0.833vw]">
          {news.publishedDate && (
            <div className="flex items-center justify-between border-t border-[#ededed] pt-[14px] lg:pt-[0.833vw]">
              <span
                className="font-montserrat text-[#9a9a9a] text-[12px] lg:text-[0.729vw]"
                style={BODY_FONT}
              >
                Published On
              </span>
              <span
                className="inline-flex items-center gap-[6px] font-montserrat font-medium text-[#333] text-[12px] lg:text-[0.729vw]"
                style={BODY_FONT}
              >
                <CalendarDays className="w-[14px] h-[14px]" strokeWidth={1.5} />
                {formatDate(news.publishedDate)}
              </span>
            </div>
          )}
          <Link
            href={news.href}
            className="group/btn inline-flex items-center gap-[8px] text-[#ef493d] font-montserrat font-medium text-[14px] lg:text-[0.833vw]"
            style={BODY_FONT}
          >
            Read Feature
            <ArrowRight className="w-[16px] h-[16px] transition-transform duration-300 group-hover/btn:translate-x-[4px]" />
          </Link>
        </div>
      </article>
    </div>
  );
}

/** Slide card used inside the coverage carousel (matches the slider design). */
function SlideCard({ news }) {
  return (
    <Link href={news.href} className="group flex h-full flex-col">
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[8px] lg:rounded-[0.521vw] bg-[#f5f1eb]">
        {news.image && (
          <Image
            src={news.image}
            alt={news.title}
            fill
            unoptimized
            sizes="(min-width:1024px) 22vw, (min-width:640px) 45vw, 90vw"
            className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col pt-[16px] lg:pt-[1.042vw]">
        <PublicationMark
          news={news}
          className="text-[14px] lg:text-[0.833vw]"
          logoClass="w-[120px] h-[24px] lg:w-[7.5vw] lg:h-[1.55vw]"
        />

        {news.publishedDate && (
          <span
            className="mt-[10px] lg:mt-[0.625vw] font-montserrat text-[#9a9a9a] text-[12px] lg:text-[0.729vw]"
            style={BODY_FONT}
          >
            {formatDate(news.publishedDate)}
          </span>
        )}

        <div className="mt-auto flex items-end justify-between gap-[16px] pt-[16px] lg:pt-[1.042vw]">
          <h3
            className="text-[#333] leading-[1.3] text-[16px] lg:text-[1.042vw] line-clamp-2"
            style={{ ...HEADING_FONT, fontWeight: 300 }}
          >
            {news.title}
          </h3>
          <span
            className="inline-flex shrink-0 items-center justify-center rounded-full
                       border-[0.9px] border-[#ef493d] text-[#ef493d]
                       w-[42px] h-[42px] lg:w-[2.604vw] lg:h-[2.604vw]
                       transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                       group-hover:bg-[#ef493d] group-hover:text-white"
          >
            <ArrowRight className="w-[16px] h-[16px] lg:w-[0.833vw] lg:h-[0.833vw]" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function NewsListing({
  news = [],
  heading,
  sectionLabel,
  backgroundImage,
}) {
  const NEWS = news.map(normaliseCmsNews).filter((n) => n.title);
  const bgImage = mediaUrl(backgroundImage);

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const gridRef = useRef(null);
  const swiperRef = useRef(null);
  const heroSwiperRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  // Active media-type filter: "all" | "Print" | "Magazines" | "Electronic".
  const [filter, setFilter] = useState("all");

  // Hide filter tabs that have no published articles behind them.
  const availableFilters = useMemo(() => {
    const present = new Set(NEWS.map((n) => n.mediaType));
    return FILTERS.filter((f) => f.key === "all" || present.has(f.key));
  }, [NEWS]);

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

  const filtered = useMemo(() => {
    if (filter === "all") return NEWS;
    return NEWS.filter((n) => n.mediaType === filter);
  }, [NEWS, filter]);

  // Featured items make the hero block above the slider; everything else
  // (or all items, when nothing is flagged featured) fills the carousel.
  const { heroItems, sliderItems } = useMemo(() => {
    const featured = filtered.filter((n) => n.featured);
    if (featured.length) {
      return {
        heroItems: featured,
        sliderItems: filtered.filter((n) => !n.featured),
      };
    }
    return {
      heroItems: filtered.slice(0, 1),
      sliderItems: filtered.slice(1),
    };
  }, [filtered]);

  // Desktop shows 4 cards at a time, so arrows are only useful past 4.
  // Mobile/tablet show fewer, so any overflow warrants the below-card nav.
  const showDesktopNav = sliderItems.length > 4;
  const showMobileNav = sliderItems.length > 1;

  // Reset both carousels to the first slide whenever the filter changes.
  useEffect(() => {
    swiperRef.current?.slideTo(0, 0);
    heroSwiperRef.current?.slideTo(0, 0);
  }, [filter]);

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

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden
                 pt-[60px] md:pt-[80px] lg:pt-[4.687vw]
                 pb-[60px] md:pb-[80px] lg:pb-[5.208vw]"
      data-section="news-listing"
    >
      {/* Section background image (from CMS). The uploaded asset is already a
          pre-faded / subtle artwork, so render it as-is at full opacity. A very
          light white wash at the bottom keeps the slider cards legible. */}
      {bgImage && (
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <Image
            src={bgImage}
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40" />
        </div>
      )}

      <div className="absolute left-[20px] top-[40px] lg:left-[4.16vw] lg:top-[4.687vw] z-10">
        <SectionLabel>{sectionLabel || "Media Presence"}</SectionLabel>
      </div>

      <div className="relative z-10 px-5 md:px-10 lg:px-[8.333vw]">
        <SectionHeading
          ref={headingRef}
          className="text-[#333] capitalize text-center will-change-transform leading-[1.05] tracking-[0.02em]
                     text-[36px] xs:text-[44px] sm:text-[56px] md:text-[72px] lg:text-[3.5vw]
                     max-w-[1100px] mx-auto"
        >
          {heading || "Seen Across Publications That Matter"}
        </SectionHeading>

        {/* Filter tabs — Print / Magazines / Electronic */}
        <div className="mt-[36px] md:mt-[48px] lg:mt-[3.125vw] flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-[10px] lg:gap-[0.625vw]">
            {availableFilters.map(({ key, label, Icon }) => {
              const isActive = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onFilterChange(key)}
                  className={`inline-flex items-center gap-[7px] lg:gap-[0.417vw]
                              font-montserrat font-normal capitalize transition-all duration-300
                              rounded-full border
                              px-[18px] py-[9px] md:px-[22px] md:py-[11px]
                              lg:px-[1.302vw] lg:py-[0.625vw]
                              text-[13px] sm:text-[15px] lg:text-[0.938vw]
                              ${
                                isActive
                                  ? "bg-[#ef493d] text-white border-[#ef493d]"
                                  : "bg-transparent text-[#454545] border-[#e7e7e7] hover:border-[#ef493d] hover:text-[#ef493d]"
                              }`}
                  style={BODY_FONT}
                  aria-pressed={isActive}
                >
                  {key === "all" && isActive ? (
                    <Check
                      className="w-[15px] h-[15px] lg:w-[0.938vw] lg:h-[0.938vw]"
                      strokeWidth={2.5}
                    />
                  ) : (
                    Icon && (
                      <Icon
                        className="w-[15px] h-[15px] lg:w-[0.938vw] lg:h-[0.938vw]"
                        strokeWidth={1.6}
                      />
                    )
                  )}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured hero + coverage carousel */}
        <div ref={gridRef} className="mt-[32px] md:mt-[40px] lg:mt-[2.604vw]">
          {filtered.length === 0 ? (
            <p
              className="text-center font-montserrat text-[#6d6d6d] py-[60px] text-[14px] lg:text-[1.042vw]"
              style={BODY_FONT}
            >
              No coverage in this category yet — try a different filter.
            </p>
          ) : (
            <>
              {/* Featured hero card (slides when more than one is featured) */}
              {heroItems.length > 0 && (
                <div className="news-hero-swiper mb-[40px] md:mb-[52px] lg:mb-[3.125vw]">
                  <style jsx global>{`
                    .news-hero-swiper .swiper-pagination-bullet {
                      background: #c9c2bb;
                      opacity: 1;
                    }
                    .news-hero-swiper .swiper-pagination-bullet-active {
                      background: #ef493d;
                    }
                  `}</style>
                  <Swiper
                    modules={[Pagination, Keyboard, A11y]}
                    slidesPerView={1}
                    spaceBetween={24}
                    speed={600}
                    keyboard={{ enabled: true }}
                    onSwiper={(s) => (heroSwiperRef.current = s)}
                    pagination={{ clickable: true }}
                    className="w-full !pb-[36px] lg:!pb-[2.4vw]"
                  >
                    {heroItems.map((n) => (
                      <SwiperSlide key={n.href + n.title} className="!h-auto">
                        <FeaturedFeature news={n} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}

              {sliderItems.length > 0 && (
            <div className="relative">
              {/* Desktop prev/next arrows — only when the slider actually
                  overflows the 4-up desktop view (more than 4 cards). */}
              {showDesktopNav && (
                <>
                  <button
                    ref={prevRef}
                    type="button"
                    aria-label="Previous"
                    onClick={() => swiperRef.current?.slidePrev()}
                    className="hidden lg:inline-flex absolute left-0 top-[30%] -translate-y-1/2 z-10
                               items-center justify-center rounded-full bg-white
                               border border-[#33333333] text-[#333]
                               lg:w-[3.125vw] lg:h-[3.125vw]
                               shadow-[0_10px_30px_-12px_rgba(0,0,0,0.3)]
                               hover:bg-[#ef493d] hover:text-white hover:border-[#ef493d]
                               transition-colors duration-300
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="lg:w-[1.042vw] lg:h-[1.042vw]" />
                  </button>
                  <button
                    ref={nextRef}
                    type="button"
                    aria-label="Next"
                    onClick={() => swiperRef.current?.slideNext()}
                    className="hidden lg:inline-flex absolute right-0 top-[30%] -translate-y-1/2 z-10
                               items-center justify-center rounded-full bg-white
                               border border-[#33333333] text-[#333]
                               lg:w-[3.125vw] lg:h-[3.125vw]
                               shadow-[0_10px_30px_-12px_rgba(0,0,0,0.3)]
                               hover:bg-[#ef493d] hover:text-white hover:border-[#ef493d]
                               transition-colors duration-300
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="lg:w-[1.042vw] lg:h-[1.042vw]" />
                  </button>
                </>
              )}

              <div className={showDesktopNav ? "lg:px-[4.5vw]" : ""}>
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
                  navigation={{
                    prevEl: prevRef.current,
                    nextEl: nextRef.current,
                  }}
                  breakpoints={{
                    640: { slidesPerView: 2, spaceBetween: 20 },
                    768: { slidesPerView: 3, spaceBetween: 24 },
                    1024: { slidesPerView: 4, spaceBetween: 24 },
                  }}
                  className="w-full"
                >
                  {sliderItems.map((n) => (
                    <SwiperSlide key={n.href + n.title} className="!h-auto">
                      <SlideCard news={n} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Mobile / tablet nav — placed below the cards */}
              {showMobileNav && (
                <div className="flex lg:hidden items-center justify-center gap-[14px] mt-[28px] md:mt-[36px]">
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={() => swiperRef.current?.slidePrev()}
                    className="inline-flex items-center justify-center rounded-full bg-white
                               border border-[#33333333] text-[#333]
                               w-[46px] h-[46px] md:w-[52px] md:h-[52px]
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
                               border border-[#33333333] text-[#333]
                               w-[46px] h-[46px] md:w-[52px] md:h-[52px]
                               shadow-[0_10px_30px_-12px_rgba(0,0,0,0.3)]
                               hover:bg-[#ef493d] hover:text-white hover:border-[#ef493d]
                               transition-colors duration-300"
                  >
                    <ArrowRight className="w-[16px] h-[16px]" />
                  </button>
                </div>
              )}
            </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
