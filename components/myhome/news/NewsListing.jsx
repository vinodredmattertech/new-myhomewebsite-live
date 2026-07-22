import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, A11y, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import SectionLabel from "@/components/myhome/SectionLabel";
import SectionHeading from "@/components/common/SectionHeading";
import useFancybox from "@/components/common/useFancybox";
import { mediaUrl } from "@/lib/strapi";
import {
  PrintIcon,
  MagazinesIcon,
  ElectronicsIcon,
  CheckIcon,
  GuidanceArrow,
} from "./newsIcons";

/*
 * "Seen Across Publications That Matter" — Figma node 4166:1850.
 *
 * Desktop is a 1:1 translation of the 1920px frame: every dimension is
 * `px / 19.2` expressed in vw, so the section scales exactly with the viewport.
 * Below `lg` the layout falls back to ordinary Tailwind px steps.
 *
 * Data comes straight from the `media-galleries` collection — the tabs are the
 * `category` enum, and a tile's click behaviour follows its category:
 * Print opens `externalLink` — or, when the record has none, the cutting image
 * itself in a Fancybox lightbox. Magazines opens `pdfFile`, Electronics plays
 * the video in a Fancybox lightbox.
 */

/* Tabs map 1:1 onto the `category` enum on the Media Gallery content type. */
const FILTERS = [
  { key: "all", label: "All", Icon: null },
  { key: "Print", label: "Print", Icon: PrintIcon },
  { key: "Magazines", label: "Magazines", Icon: MagazinesIcon },
  { key: "Electronics", label: "Electronics", Icon: ElectronicsIcon },
];

const BODY_FONT = { fontFamily: "Montserrat, sans-serif" };
const DISPLAY_FONT = {
  fontFamily:
    '"Tartuffo_Trial_Light","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
  fontWeight: 300,
};

/** "10 jan, 2026" — the card format used throughout the frame. */
function formatCardDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.getDate()} ${d.toLocaleString("en-GB", {
    month: "short",
  })}, ${d.getFullYear()}`;
}

/** "March 28, 2026" — the long form used on the featured card. */
function formatLongDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Turn any YouTube link (watch / youtu.be / shorts / embed) into an embeddable
 * URL. Plain `watch?v=` URLs are refused by YouTube inside an iframe, so the
 * conversion has to happen before the link reaches Fancybox.
 */
function youtubeEmbedUrl(raw) {
  if (!raw || typeof raw !== "string") return null;
  const id = raw
    .trim()
    .match(
      /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i
    )?.[1];
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
}

/**
 * Flatten a CMS record into everything a tile needs, resolving the one link
 * that matters for its category. `href` is null when the record is incomplete —
 * those tiles render as plain artwork rather than as dead links.
 */
function normalise(item) {
  const category = item.category || "Print";

  const tile = {
    id: item.id,
    title: item.displayText || item.title || "",
    category,
    image: mediaUrl(item.image),
    logo: mediaUrl(item.publicationLogo),
    author: item.author || "",
    authorRole: item.authorRole || "",
    publishedDate: item.publishedDate || "",
    featured: !!item.featured,
    href: null,
    // Fancybox opens `video`/`iframe` types in the lightbox; `null` means the
    // link is a normal new-tab navigation instead.
    fancyType: null,
  };

  if (category === "Print") {
    const link = item.externalLink?.trim();
    if (link) {
      tile.href = link;
    } else {
      // No article link on the record — the cutting itself is the content, so
      // open the artwork in the Fancybox lightbox instead of rendering a dead tile.
      tile.href = tile.image;
      tile.fancyType = tile.image ? "image" : null;
    }
  } else if (category === "Magazines") {
    tile.href = mediaUrl(item.pdfFile);
  } else if (category === "Electronics") {
    if (item.videoType === "YouTube") {
      tile.href = youtubeEmbedUrl(item.youtubeUrl);
      tile.fancyType = tile.href ? "iframe" : null;
    } else {
      tile.href = mediaUrl(item.mp4Video);
      tile.fancyType = tile.href ? "video" : null;
    }
  }

  return tile;
}

function tileLabel(tile) {
  if (tile.category === "Electronics") return `Play video — ${tile.title}`;
  if (tile.category === "Magazines") return `Open PDF — ${tile.title}`;
  if (tile.fancyType === "image") return `View cutting — ${tile.title}`;
  return `Read article — ${tile.title}`;
}

/**
 * Wraps tile content in the right click target for its category, or in a plain
 * div when the record has no usable link.
 */
function TileLink({ tile, className = "", children }) {
  if (!tile.href) return <div className={className}>{children}</div>;

  return (
    <a
      href={tile.href}
      aria-label={tileLabel(tile)}
      className={className}
      {...(tile.fancyType
        ? {
            "data-fancybox": "news-listing",
            "data-type": tile.fancyType,
            ...(tile.title ? { "data-caption": tile.title } : null),
          }
        : { target: "_blank", rel: "noopener noreferrer" })}
    >
      {children}
    </a>
  );
}

/** Publication masthead — the logo when there is one, else the plain title. */
function PublicationMark({ tile, className = "" }) {
  if (tile.logo) {
    return (
      <span className={`relative block ${className}`}>
        <Image
          src={tile.logo}
          alt={tile.title || "Publication"}
          fill
          unoptimized
          sizes="280px"
          className="object-contain object-left"
        />
      </span>
    );
  }
  return null;
}

const HAIRLINE = "h-px w-full bg-[rgba(69,69,69,0.35)]";

/**
 * Featured row — the wide image on the left with the bordered
 * "Written and Verified By" card alongside it.
 */
function FeaturedRow({ tile }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-[24px] lg:gap-[2.031vw]">
      <TileLink
        tile={tile}
        className="group relative block w-full aspect-[1193/671] lg:aspect-auto lg:w-[62.135vw] lg:h-[34.948vw] overflow-hidden bg-[#f5f1eb]"
      >
        {tile.image && (
          <Image
            src={tile.image}
            alt={tile.title}
            fill
            priority
            unoptimized
            sizes="(min-width:1024px) 63vw, 100vw"
            className="object-cover object-center transition-transform duration-700 ease-premium group-hover:scale-[1.03]"
          />
        )}
      </TileLink>

      <article
        className="w-full lg:w-[20.208vw] lg:min-h-[19.271vw] shrink-0 bg-white
                   border-[0.8px] border-[rgba(69,69,69,0.5)]
                   px-[22px] pt-[24px] pb-[24px]
                   lg:px-[1.51vw] lg:pt-[2.135vw] lg:pb-[1.15vw]"
      >
        <PublicationMark
          tile={tile}
          className="w-[200px] h-[34px] lg:w-[13.698vw] lg:h-[2.344vw]"
        />

        {tile.author && (
          <>
            <p
              className="mt-[26px] lg:mt-[2.188vw] font-montserrat font-medium uppercase
                         text-[#555] text-[13px] lg:text-[0.938vw]
                         tracking-[0.9px] lg:tracking-[0.066vw]"
              style={BODY_FONT}
            >
              Written and Verified By
            </p>

            <div className="mt-[16px] lg:mt-[1.354vw] flex flex-col gap-[7px] lg:gap-[0.521vw]">
              <span
                className="text-[#333] text-[18px] lg:text-[1.146vw] tracking-[0.8px] lg:tracking-[0.057vw]"
                style={DISPLAY_FONT}
              >
                {tile.author}
              </span>
              {tile.authorRole && (
                <span
                  className="font-montserrat capitalize text-[#555] text-[14px] lg:text-[0.938vw]"
                  style={BODY_FONT}
                >
                  {tile.authorRole}
                </span>
              )}
            </div>
          </>
        )}

        {tile.publishedDate && (
          <>
            <div
              className={`mt-[20px] lg:mt-[1.406vw] ${HAIRLINE}`}
              aria-hidden="true"
            />
            <div className="mt-[18px] lg:mt-[1.481vw] flex items-center justify-between gap-[12px]">
              <span
                className="text-[#333] text-[18px] lg:text-[1.146vw]"
                style={DISPLAY_FONT}
              >
                Published On:
              </span>
              <span
                className="font-montserrat capitalize text-[#3c3c3a] text-[14px] lg:text-[0.938vw]"
                style={BODY_FONT}
              >
                {formatLongDate(tile.publishedDate)}
              </span>
            </div>
            <div
              className={`mt-[18px] lg:mt-[1.406vw] ${HAIRLINE}`}
              aria-hidden="true"
            />
          </>
        )}
      </article>
    </div>
  );
}

/** One card in the coverage slider below the featured row. */
function SlideCard({ tile }) {
  return (
    <TileLink tile={tile} className="group flex h-full flex-col">
      <div className="relative w-full aspect-[378/492] overflow-hidden bg-[#f5f1eb]">
        {tile.image && (
          <Image
            src={tile.image}
            alt={tile.title}
            fill
            unoptimized
            loading="lazy"
            sizes="(min-width:1024px) 20vw, (min-width:640px) 45vw, 90vw"
            className="object-cover object-center transition-transform duration-700 ease-premium group-hover:scale-[1.05]"
          />
        )}
      </div>

      <div className="mt-[18px] lg:mt-[1.403vw] flex flex-1 flex-col">
        <PublicationMark
          tile={tile}
          className="w-[120px] h-[22px] lg:w-[7.813vw] lg:h-[1.354vw]"
        />

        {tile.publishedDate && (
          <span
            className="mt-[8px] lg:mt-[0.417vw] font-montserrat font-medium
                       text-[rgba(51,51,51,0.35)]
                       text-[13px] lg:text-[0.781vw]
                       leading-[24px] lg:leading-[1.563vw]"
            style={BODY_FONT}
          >
            {formatCardDate(tile.publishedDate)}
          </span>
        )}

        <div className="mt-auto pt-[10px] lg:pt-[0.521vw] flex items-end justify-between gap-[18px] lg:gap-[1.563vw]">
          <p
            className="font-montserrat font-normal capitalize text-[#333]
                       w-full lg:w-[15.521vw]
                       text-[14px] lg:text-[0.833vw]
                       leading-[22px] lg:leading-[1.354vw]"
            style={BODY_FONT}
          >
            {tile.title}
          </p>

          <span
            className="inline-flex shrink-0 items-center justify-center rounded-full
                       border-[0.896px] border-[#e31f24] text-[#e31f24]
                       w-[42px] h-[42px] lg:w-[2.604vw] lg:h-[2.604vw]
                       transition-colors duration-500 ease-premium
                       group-hover:bg-[#e31f24] group-hover:text-white"
          >
            <span className="block rotate-90 w-[12px] h-[12px] lg:w-[0.767vw] lg:h-[0.767vw]">
              <GuidanceArrow />
            </span>
          </span>
        </div>
      </div>
    </TileLink>
  );
}

/** Outlined circular slider control — the pair sitting at the frame edges. */
function NavButton({ direction, onClick, className = "" }) {
  const isNext = direction === "next";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isNext ? "Next" : "Previous"}
      className={`inline-flex items-center justify-center rounded-full
                  border border-[rgba(51,51,51,0.35)] bg-white/70 text-[#333]
                  backdrop-blur-[2px]
                  transition-colors duration-300
                  hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white
                  ${className}`}
    >
      <span
        className={`block w-[14px] h-[14px] lg:w-[0.885vw] lg:h-[0.885vw] ${
          isNext ? "rotate-90" : "-rotate-90"
        }`}
      >
        <GuidanceArrow strokeWidth={1.1} />
      </span>
    </button>
  );
}

export default function NewsListing({
  items = [],
  heading,
  sectionLabel,
  backgroundImage,
}) {
  const TILES = useMemo(
    () => items.map(normalise).filter((t) => t.image),
    [items]
  );
  const bgImage = mediaUrl(backgroundImage);

  const headingRef = useRef(null);
  const gridRef = useRef(null);
  const swiperRef = useRef(null);
  const heroSwiperRef = useRef(null);
  const rootRef = useRef(null);

  // Active category: "all" | "Print" | "Magazines" | "Electronics".
  const [filter, setFilter] = useState("all");

  // Hide tabs that have no published tiles behind them.
  const availableFilters = useMemo(() => {
    const present = new Set(TILES.map((t) => t.category));
    return FILTERS.filter((f) => f.key === "all" || present.has(f.key));
  }, [TILES]);

  const filtered = useMemo(
    () =>
      filter === "all" ? TILES : TILES.filter((t) => t.category === filter),
    [TILES, filter]
  );

  // Tiles ticked `featured` become the hero row; everything else fills the
  // slider. With nothing flagged, the newest tile stands in as the hero.
  const { heroItems, sliderItems } = useMemo(() => {
    const featured = filtered.filter((t) => t.featured);
    if (featured.length) {
      return {
        heroItems: featured,
        sliderItems: filtered.filter((t) => !t.featured),
      };
    }
    return { heroItems: filtered.slice(0, 1), sliderItems: filtered.slice(1) };
  }, [filtered]);

  // Desktop shows 4 cards at a time, so the edge arrows only earn their place
  // past 4. Smaller screens show fewer, so any overflow warrants them.
  const showDesktopNav = sliderItems.length > 4;
  const showMobileNav = sliderItems.length > 1;

  // Bind Fancybox to the section so Electronics tiles open in a lightbox.
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

  // Reset both carousels to the first slide whenever the category changes.
  useEffect(() => {
    swiperRef.current?.slideTo(0, 0);
    heroSwiperRef.current?.slideTo(0, 0);
  }, [filter]);

  const onFilterChange = (key) => {
    if (key === filter || !gridRef.current) {
      setFilter(key);
      return;
    }
    gsap.to(gridRef.current, {
      autoAlpha: 0,
      y: 16,
      duration: 0.22,
      ease: "sine.in",
      onComplete: () => {
        setFilter(key);
        gsap.fromTo(
          gridRef.current,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }
        );
      },
    });
  };

  return (
    <section
      ref={attachRoot}
      className="relative w-full bg-white overflow-hidden
                 pt-[56px] md:pt-[72px] lg:pt-[4.688vw]
                 pb-[56px] md:pb-[72px] lg:pb-[4.688vw]"
      data-section="news-listing"
    >
      <style jsx global>{`
        .news-hero-swiper .swiper-pagination {
          bottom: 16px;
        }
        .news-hero-swiper .swiper-pagination-bullet {
          background: #ffffff;
          opacity: 0.45;
          width: 9px;
          height: 9px;
        }
        .news-hero-swiper .swiper-pagination-bullet-active {
          opacity: 1;
        }
        @media (min-width: 1024px) {
          .news-hero-swiper .swiper-pagination {
            /* Centred over the hero image (62.135vw wide), 45px up from its
               bottom edge — exactly where the dots sit in the frame. The
               !important beats Swiper's own .swiper-horizontal rule, which
               pins the bullets to the full width of the slide. */
            bottom: 2.344vw !important;
            left: 31.067vw !important;
            width: auto !important;
            transform: translateX(-50%) !important;
          }
          .news-hero-swiper .swiper-pagination-bullet {
            width: 0.677vw;
            height: 0.677vw;
            margin: 0 0.26vw !important;
          }
        }
      `}</style>

      {/* Section background artwork (from the CMS) — a faint 10% wash behind
          the slider, faded out into white at the top and bottom. */}
      {bgImage && (
        <div
          className="pointer-events-none absolute inset-x-0 z-0
                     top-[40%] h-[60%] lg:top-[27.448vw] lg:h-[56.042vw]"
          aria-hidden="true"
        >
          <Image
            src={bgImage}
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="object-cover object-center opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent via-[58.5%] to-white" />
        </div>
      )}

      {/* Rotated "Media Presence" rail */}
      <div className="absolute left-[16px] top-[56px] lg:left-[4.167vw] lg:top-[4.688vw] z-10">
        <SectionLabel>{sectionLabel || "Media Presence"}</SectionLabel>
      </div>

      <div className="relative z-10">
        <SectionHeading
          ref={headingRef}
          className="text-[#333] capitalize text-center will-change-transform
                     leading-[1.08] lg:leading-[1]
                     tracking-[1px] lg:tracking-[0.104vw]
                     text-[30px] xs:text-[38px] sm:text-[50px] md:text-[68px] lg:text-[5vw]
                     px-[56px] sm:px-[64px] lg:px-[9.375vw]"
        >
          {heading || "Seen Across Publications That Matter"}
        </SectionHeading>

        {/* Category tabs — All / Print / Magazines / Electronics.
            One hairline box with a solid red block marking the active tab. */}
        <div className="mt-[28px] md:mt-[40px] lg:mt-[4.063vw] flex justify-center px-[16px] lg:px-0">
          <div
            className="flex items-center overflow-x-auto no-scrollbar max-w-full
                       border-[0.5px] border-[#e7e7e7]
                       h-[52px] md:h-[62px] lg:h-[3.854vw]
                       px-[6px] lg:px-[0.755vw]
                       gap-[4px] md:gap-[10px] lg:gap-[1.25vw]"
          >
            {availableFilters.map(({ key, label, Icon }) => {
              const isActive = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onFilterChange(key)}
                  aria-pressed={isActive}
                  className={`shrink-0 inline-flex items-center justify-center
                              font-montserrat font-normal capitalize whitespace-nowrap
                              transition-colors duration-300
                              gap-[7px] lg:gap-[0.781vw]
                              h-[40px] md:h-[48px] lg:h-[3vw]
                              px-[12px] md:px-[16px] lg:px-[1.042vw]
                              text-[13px] md:text-[16px] lg:text-[1.042vw]
                              ${
                                isActive
                                  ? "bg-[#ef493d] text-white"
                                  : "bg-transparent text-[#454545] hover:text-[#ef493d]"
                              }`}
                  style={BODY_FONT}
                >
                  {key === "all"
                    ? isActive && (
                        <span className="block w-[14px] h-[14px] lg:w-[0.984vw] lg:h-[0.984vw]">
                          <CheckIcon />
                        </span>
                      )
                    : Icon && (
                        <span className="block w-[16px] h-[16px] lg:w-[1.25vw] lg:h-[1.25vw]">
                          <Icon />
                        </span>
                      )}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          ref={gridRef}
          className="mt-[28px] md:mt-[40px] lg:mt-[3.646vw]
                     px-[16px] md:px-[32px] lg:px-0"
        >
          {filtered.length === 0 ? (
            <p
              className="text-center font-montserrat text-[#6d6d6d] py-[60px] text-[14px] lg:text-[1.042vw]"
              style={BODY_FONT}
            >
              No coverage in this category yet — try a different filter.
            </p>
          ) : (
            <>
              {/* Featured row — a slider once more than one tile is featured */}
              {heroItems.length > 0 && (
                <div className="news-hero-swiper lg:pl-[9.375vw] lg:pr-[6.25vw]">
                  <Swiper
                    modules={[Pagination, Keyboard, A11y]}
                    slidesPerView={1}
                    speed={600}
                    keyboard={{ enabled: true }}
                    onSwiper={(s) => (heroSwiperRef.current = s)}
                    pagination={{ clickable: true }}
                    className="w-full"
                  >
                    {heroItems.map((tile) => (
                      <SwiperSlide key={tile.id} className="!h-auto">
                        <FeaturedRow tile={tile} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}

              {sliderItems.length > 0 && (
                <div className="relative mt-[40px] md:mt-[56px] lg:mt-[4.688vw]">
                  {/* Edge arrows, vertically centred on the card artwork */}
                  {showDesktopNav && (
                    <>
                      <NavButton
                        direction="prev"
                        onClick={() => swiperRef.current?.slidePrev()}
                        className="hidden lg:inline-flex absolute z-20
                                   left-[1.3vw] top-[12.813vw] -translate-y-1/2
                                   w-[3.646vw] h-[3.646vw]"
                      />
                      <NavButton
                        direction="next"
                        onClick={() => swiperRef.current?.slideNext()}
                        className="hidden lg:inline-flex absolute z-20
                                   right-[1.3vw] top-[12.813vw] -translate-y-1/2
                                   w-[3.646vw] h-[3.646vw]"
                      />
                    </>
                  )}

                  <div className="lg:pl-[9.375vw] lg:pr-[6.25vw]">
                    <Swiper
                      modules={[Keyboard, A11y]}
                      slidesPerView={1.15}
                      spaceBetween={16}
                      speed={600}
                      keyboard={{ enabled: true }}
                      onSwiper={(s) => (swiperRef.current = s)}
                      breakpoints={{
                        640: { slidesPerView: 2, spaceBetween: 20 },
                        768: { slidesPerView: 3, spaceBetween: 24 },
                        // 35px of the 1620px track — a percentage so the gap
                        // keeps scaling with the vw-sized container.
                        1024: { slidesPerView: 4, spaceBetween: "2.1605%" },
                      }}
                      className="w-full"
                    >
                      {sliderItems.map((tile) => (
                        <SwiperSlide key={tile.id} className="!h-auto">
                          <SlideCard tile={tile} />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>

                  {/* Mobile / tablet controls sit below the cards */}
                  {showMobileNav && (
                    <div className="flex lg:hidden items-center justify-center gap-[14px] mt-[28px]">
                      <NavButton
                        direction="prev"
                        onClick={() => swiperRef.current?.slidePrev()}
                        className="w-[46px] h-[46px] md:w-[52px] md:h-[52px]"
                      />
                      <NavButton
                        direction="next"
                        onClick={() => swiperRef.current?.slideNext()}
                        className="w-[46px] h-[46px] md:w-[52px] md:h-[52px]"
                      />
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
