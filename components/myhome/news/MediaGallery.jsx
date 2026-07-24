import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import {
  Check,
  Newspaper,
  BookOpen,
  Tv,
  Play,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import SectionLabel from "@/components/myhome/SectionLabel";
import SectionHeading from "@/components/common/SectionHeading";
import useFancybox from "@/components/common/useFancybox";
import { mediaUrl } from "@/lib/strapi";

/* Tabs map 1:1 onto the `category` enum on the Media Gallery content type. */
const FILTERS = [
  { key: "all", label: "All", Icon: null },
  { key: "Print", label: "Print", Icon: Newspaper },
  { key: "Magazines", label: "Magazines", Icon: BookOpen },
  { key: "Electronics", label: "Electronics", Icon: Tv },
];

const HEADING_FONT = {
  fontFamily:
    '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
};
const BODY_FONT = { fontFamily: "Montserrat, sans-serif" };

/**
 * Turn any YouTube link (watch / youtu.be / shorts / embed) into an embeddable
 * URL. Plain `watch?v=` URLs are refused by YouTube inside an iframe, so the
 * conversion has to happen before the link reaches Fancybox.
 * Returns `null` when the URL isn't recognisably YouTube.
 */
function youtubeEmbedUrl(raw) {
  if (!raw || typeof raw !== "string") return null;
  const url = raw.trim();
  const id = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i
  )?.[1];
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
}

/**
 * Flatten a CMS record into everything the tile needs to render, resolving the
 * one link that matters for its category. `href` is null when the record is
 * incomplete — those tiles render as plain, non-interactive artwork rather than
 * as dead links.
 */
function normalise(item) {
  const category = item.category || "Print";
  const image = mediaUrl(item.image);

  const tile = {
    id: item.id,
    title: item.title || "",
    category,
    image,
    // Print tiles are artwork only; the other two carry a caption.
    caption:
      category === "Print" ? "" : item.displayText || item.title || "",
    href: null,
    // Fancybox opens `video`/`iframe` types in the lightbox; `null` means the
    // link is a normal new-tab navigation instead.
    fancyType: null,
  };

  if (category === "Print") {
    tile.href = item.externalLink?.trim() || null;
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

function CategoryTag({ children }) {
  return (
    <span
      className="inline-flex items-center bg-white/95 text-[#333] rounded-full
                 px-[12px] py-[5px] lg:px-[0.729vw] lg:py-[0.313vw]
                 font-montserrat font-medium uppercase tracking-[0.06em]
                 text-[10px] lg:text-[0.625vw]"
      style={BODY_FONT}
    >
      {children}
    </span>
  );
}

/**
 * One gallery tile. All three categories share the same 3:4 frame so the "All"
 * tab stays a clean, even grid — only the click target and the hover affordance
 * change per category.
 */
function GalleryTile({ tile }) {
  const isVideo = tile.category === "Electronics";
  const isPdf = tile.category === "Magazines";

  const frame = (
    <>
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[8px] lg:rounded-[0.521vw] bg-[#f5f1eb]">
        {tile.image && (
          <Image
            src={tile.image}
            alt={tile.title || tile.category}
            fill
            unoptimized
            loading="lazy"
            sizes="(min-width:1024px) 22vw, (min-width:640px) 45vw, 90vw"
            className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          />
        )}

        {/* Video tiles carry a permanent scrim so the play button stays legible
            over a bright thumbnail; the others darken on hover only. */}
        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            isVideo
              ? "bg-black/25 group-hover:bg-black/35"
              : "bg-transparent group-hover:bg-black/15"
          }`}
        />

        <div className="absolute top-[12px] left-[12px] lg:top-[0.833vw] lg:left-[0.833vw]">
          <CategoryTag>{tile.category}</CategoryTag>
        </div>

        {/* Play overlay — always visible on Electronics tiles. */}
        {isVideo && tile.href && (
          <span
            className="absolute inset-0 m-auto inline-flex items-center justify-center
                       w-[52px] h-[52px] lg:w-[3.4vw] lg:h-[3.4vw] rounded-full
                       bg-[#ef493d] text-white
                       shadow-[0_12px_30px_-8px_rgba(0,0,0,0.5)]
                       transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                       group-hover:scale-110"
          >
            <Play
              className="w-[18px] h-[18px] lg:w-[1.15vw] lg:h-[1.15vw] translate-x-[1px]"
              fill="currentColor"
              strokeWidth={0}
            />
          </span>
        )}

        {/* Print / Magazines get a corner affordance that fades in on hover. */}
        {!isVideo && tile.href && (
          <span
            className="absolute bottom-[12px] right-[12px] lg:bottom-[0.833vw] lg:right-[0.833vw]
                       inline-flex items-center justify-center rounded-full
                       bg-[#ef493d] text-white
                       w-[36px] h-[36px] lg:w-[2.188vw] lg:h-[2.188vw]
                       opacity-0 translate-y-[6px]
                       transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                       group-hover:opacity-100 group-hover:translate-y-0"
          >
            {isPdf ? (
              <FileText className="w-[16px] h-[16px] lg:w-[0.99vw] lg:h-[0.99vw]" strokeWidth={1.8} />
            ) : (
              <ArrowUpRight className="w-[16px] h-[16px] lg:w-[0.99vw] lg:h-[0.99vw]" strokeWidth={1.8} />
            )}
          </span>
        )}
      </div>

      {tile.caption && (
        <h3
          className="mt-[14px] lg:mt-[0.833vw] text-[#333] leading-[1.3] line-clamp-2
                     text-[15px] lg:text-[1.042vw]
                     transition-colors duration-300 group-hover:text-[#ef493d]"
          style={{ ...HEADING_FONT, fontWeight: 300 }}
        >
          {tile.caption}
        </h3>
      )}
    </>
  );

  // Incomplete tile (no link for its category) — render the artwork, but don't
  // pretend it's clickable.
  if (!tile.href) {
    return <div className="group flex h-full flex-col">{frame}</div>;
  }

  const label = isVideo
    ? `Play video — ${tile.title}`
    : isPdf
    ? `Open PDF — ${tile.title}`
    : `Read article — ${tile.title}`;

  return (
    <a
      href={tile.href}
      aria-label={label}
      className="group flex h-full flex-col"
      // Videos open in the Fancybox lightbox; links and PDFs open in a new tab.
      {...(tile.fancyType
        ? { "data-fancybox": "media-gallery", "data-type": tile.fancyType }
        : { target: "_blank", rel: "noopener noreferrer" })}
    >
      {frame}
    </a>
  );
}

/**
 * Media Gallery — the tabbed Print / Magazines / Electronics grid on the News
 * page. Fully data-driven: every tile, its category and its click behaviour
 * come from the `media-galleries` collection, so new coverage needs no code
 * changes.
 */
export default function MediaGallery({
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

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const gridRef = useRef(null);

  // Active category: "all" | "Print" | "Magazines" | "Electronics".
  const [filter, setFilter] = useState("all");

  // Hide tabs that have no published tiles behind them.
  const availableFilters = useMemo(() => {
    const present = new Set(TILES.map((t) => t.category));
    return FILTERS.filter((f) => f.key === "all" || present.has(f.key));
  }, [TILES]);

  const filtered = useMemo(
    () => (filter === "all" ? TILES : TILES.filter((t) => t.category === filter)),
    [TILES, filter]
  );

  // Bind Fancybox to the section so every [data-fancybox] tile opens its video
  // in a lightbox — MP4s as <video>, YouTube as an embedded iframe.
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

  return (
    <section
      ref={attachRoot}
      className="relative w-full bg-white overflow-hidden
                 pt-[60px] md:pt-[80px] lg:pt-[4.687vw]
                 pb-[60px] md:pb-[80px] lg:pb-[5.208vw]"
      data-section="media-gallery"
    >
      {/* Section background artwork (from CMS) — already a subtle, pre-faded
          asset, so it renders as-is with a light wash at the bottom. */}
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

      <div className="lg:absolute left-[20px] top-[40px] lg:left-[4.16vw] lg:top-[4.687vw] z-10 max-lg:static max-lg:w-full max-lg:flex max-lg:justify-center max-lg:mt-[15px] max-lg:mb-[18px]">
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

        {/* Category tabs — All / Print / Magazines / Electronics */}
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

        {/* Tile grid — same layout for every tab */}
        <div ref={gridRef} className="mt-[32px] md:mt-[40px] lg:mt-[2.604vw]">
          {filtered.length === 0 ? (
            <p
              className="text-center font-montserrat text-[#6d6d6d] py-[60px] text-[14px] lg:text-[1.042vw]"
              style={BODY_FONT}
            >
              No coverage in this category yet — try a different filter.
            </p>
          ) : (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
                         gap-x-[16px] gap-y-[28px]
                         md:gap-x-[24px] md:gap-y-[36px]
                         lg:gap-x-[1.667vw] lg:gap-y-[2.604vw]"
            >
              {filtered.map((tile) => (
                <GalleryTile key={tile.id} tile={tile} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
