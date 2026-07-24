import React, { useMemo, useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import { ArrowUpRight } from "lucide-react";
import "swiper/css";
import { mediaUrl } from "@/lib/strapi";
import SectionHeading from "@/components/common/SectionHeading";

/* Brand accent used across the page. */
const RED = "#ef493d";

/* Fallback photos (used until real media is uploaded in the admin) so every
   card always renders an image. The featured card and the slider cycle through
   this pool by index. */
const FALLBACKS = [
  "/assets/myhome/verticals-1.jpg",
  "/assets/myhome/whymyhome-1.jpg",
  "/assets/myhome/verticals-2.jpg",
  "/assets/myhome/project-1.jpg",
  "/assets/myhome/verticals-3.jpg",
  "/assets/myhome/whoweare-color.jpg",
];

/** Format an ISO date (e.g. "2026-06-28") as "Jun 28, 2026". Falls back to the
 *  raw string when it isn't a parseable date. */
function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Normalise a raw Strapi award card (a component on the page) into the flat
 *  shape the UI consumes. Components carry no `id` of their own that we rely
 *  on, so the array index doubles as the stable key. */
function normaliseAward(raw, index) {
  return {
    key: raw.id ?? index,
    title: raw.title || "",
    excerpt: raw.excerpt || "",
    issuer: raw.issuer || "",
    recognitionType: raw.recognitionType || "",
    publishedDate: raw.publishedDate || "",
    externalUrl: raw.externalUrl || "",
    featured: !!raw.featured,
    image: mediaUrl(raw.image) || FALLBACKS[index % FALLBACKS.length],
  };
}

/* Small circular arrow button that opens an award's external link. */
function ArrowLink({ href, label, light = false }) {
  if (!href) return null;
  const base =
    "group/arrow inline-flex shrink-0 items-center justify-center rounded-full border transition-colors duration-300 " +
    "w-[36px] h-[36px] lg:w-[2.5vw] lg:h-[2.5vw]";
  const theme = light
    ? "border-white/40 text-white hover:bg-white hover:border-white hover:text-[#1b1a1a]"
    : "border-black/15 text-[#1b1a1a] hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label ? `Open ${label}` : "Open link"}
      className={`${base} ${theme}`}
    >
      <ArrowUpRight className="w-[16px] h-[16px] lg:w-[1.04vw] lg:h-[1.04vw]" />
    </a>
  );
}

/**
 * FeaturedRecognition — "Trust, Recognised At The Highest Level".
 *
 * • A vertical "Featured Recognition" side label rides the left rail.
 * • The first featured award (else the first award) renders as a large main
 *   card: a wide image alongside a details panel (recognition type + date).
 * • Beneath it, a Swiper slider of the remaining awards, each a tile with an
 *   image, title and date.
 * • When there are more than three slider cards, circular prev/next arrows are
 *   shown on desktop (hidden on mobile, where the slider is swipeable).
 *
 * All data is CMS-driven — the `featuredRecognition` section component on the
 * awards-page single type (label + heading + repeatable award cards). The
 * section render-skips entirely when there are no cards.
 */
export default function FeaturedRecognition({ section }) {
  const sideLabel = section?.label || "Featured Recognition";
  const title = section?.heading || "Trust, Recognised At The Highest Level";
  const bgImage = mediaUrl(section?.backgroundImage);

  const items = useMemo(
    () => (section?.cards || []).map(normaliseAward),
    [section]
  );

  // Featured = first featured card, else the first overall.
  const featured = useMemo(() => {
    if (!items.length) return null;
    return items.find((a) => a.featured) || items[0];
  }, [items]);

  // Everything except the featured one flows into the slider.
  const cards = useMemo(
    () => items.filter((a) => a.key !== featured?.key),
    [items, featured]
  );

  // Arrows only appear on desktop when there are more than three cards.
  const showArrows = cards.length > 3;

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const swiperRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      const words = splitToWords(headingRef.current);
      gsap.set(words, { yPercent: 110 });
      gsap.to(words, {
        yPercent: 0,
        duration: 1.1,
        stagger: 0.06,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
      });
    },
    { scope: rootRef }
  );

  if (!items.length || !featured) return null;

  return (
    <section
      ref={rootRef}
      data-section="featured-recognition"
      className="relative w-full overflow-hidden bg-white text-[#1b1a1a]
                 pt-[44px] pb-[64px] lg:pt-[3.125vw] lg:pb-[5.208vw]"
    >
      {/* Configurable section background image (CMS-driven). Falls back to the
          solid white base color when no image is set. A light white scrim keeps
          the dark foreground copy readable without hiding the image. */}
      {bgImage && (
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src={bgImage}
            alt={title || "Featured recognition background"}
            fill
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
            priority={false}
          />
          <div className="absolute inset-0 bg-white/25" />
        </div>
      )}

      {/* Vertical side label */}
      <div
        className="lg:absolute z-[5] flex flex-col items-center
                   left-[20px] top-[44px] gap-[11px] w-[28px] max-sm:left-[10px]
                   lg:left-[4.166vw] lg:top-[3.4vw] lg:w-[2.812vw] lg:gap-[1.094vw] max-lg:static max-lg:!w-full max-lg:flex-row max-lg:!justify-center max-lg:items-center max-lg:!gap-[8px] max-lg:mt-[15px] max-lg:mb-[18px]"
        style={{ color: RED }}
      >
        <span
          className="block w-px h-[31px] lg:h-[3.125vw] max-lg:!w-[28px] max-lg:!h-px"
          style={{ background: RED }}
        />
        <span
          className="font-medium capitalize whitespace-nowrap text-[12px] lg:text-[1.25vw] max-lg:[writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] lg:rotate-180"
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {sideLabel}
        </span>
      </div>

      <div className="relative z-[1] mx-auto w-full px-6 sm:px-10 lg:px-[11.146vw]">
        {/* Heading */}
        <SectionHeading
          ref={headingRef}
          className="text-center leading-[1.1] will-change-transform
                     text-[30px] sm:text-[40px] md:text-[48px] lg:text-[3.125vw]"
        >
          {title}
        </SectionHeading>

        {/* ---------------- Featured main card ---------------- */}
        <article
          className="mt-[34px] lg:mt-[2.604vw] grid grid-cols-1 lg:grid-cols-[1.55fr_1fr]
                     overflow-hidden rounded-[16px] lg:rounded-[1.25vw]
                     border border-black/[0.06] bg-white"
        >
          {/* Image */}
          <div className="relative w-full aspect-[16/10] lg:aspect-auto lg:min-h-[26vw] bg-[#2a2828]">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              unoptimized
              sizes="(min-width:1024px) 55vw, 100vw"
              className="object-cover object-center"
              priority={false}
            />
          </div>

          {/* Details panel */}
          <div className="flex flex-col justify-center gap-[16px] lg:gap-[1.25vw] p-[26px] sm:p-[34px] lg:p-[2.604vw]">
            {featured.issuer && (
              <span
                className="font-montserrat font-medium uppercase tracking-[0.16em]
                           text-[11px] lg:text-[0.72vw]"
                style={{ fontFamily: "Montserrat, sans-serif", color: RED }}
              >
                {featured.issuer}
              </span>
            )}

            <h3
              className="capitalize text-[#1b1a1a] leading-[1.18]
                         text-[24px] sm:text-[28px] lg:text-[1.875vw]"
              style={{
                fontFamily:
                  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
              }}
            >
              {featured.title}
            </h3>

            {featured.excerpt && (
              <p
                className="font-montserrat font-normal text-black/60
                           text-[14px] sm:text-[15px] lg:text-[0.885vw]
                           leading-[22px] lg:leading-[1.458vw]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {featured.excerpt}
              </p>
            )}

            {/* Meta rows */}
            <dl className="mt-[6px] lg:mt-[0.4vw] flex flex-col gap-[12px] lg:gap-[0.9vw]">
              {featured.recognitionType && (
                <div className="flex items-center justify-between gap-4 border-t border-black/[0.08] pt-[12px] lg:pt-[0.9vw]">
                  <dt
                    className="font-montserrat text-black/45 text-[12px] lg:text-[0.78vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    Recognition Type
                  </dt>
                  <dd
                    className="font-montserrat font-medium text-[#1b1a1a] text-[12px] lg:text-[0.78vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {featured.recognitionType}
                  </dd>
                </div>
              )}
              {featured.publishedDate && (
                <div className="flex items-center justify-between gap-4 border-t border-black/[0.08] pt-[12px] lg:pt-[0.9vw]">
                  <dt
                    className="font-montserrat text-black/45 text-[12px] lg:text-[0.78vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    Published
                  </dt>
                  <dd
                    className="font-montserrat font-medium text-[#1b1a1a] text-[12px] lg:text-[0.78vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {formatDate(featured.publishedDate)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </article>

        {/* ---------------- Recognition slider ---------------- */}
        {cards.length > 0 && (
          <div className="relative mt-[28px] lg:mt-[2.083vw] overflow-hidden">
            <Swiper
              modules={[Navigation, A11y]}
              onSwiper={(s) => {
                swiperRef.current = s;
              }}
              spaceBetween={20}
              slidesPerView={1.15}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 22 },
                1024: { slidesPerView: 3, spaceBetween: 28 },
              }}
              className="!overflow-visible"
            >
              {cards.map((a) => (
                <SwiperSlide key={a.key} className="!h-auto">
                  <article className="group flex h-full flex-col">
                    <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[12px] lg:rounded-[0.833vw] bg-[#2a2828]">
                      <Image
                        src={a.image}
                        alt={a.title}
                        fill
                        unoptimized
                        sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 85vw"
                        className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                      />
                      {a.externalUrl && (
                        <div className="absolute right-[12px] top-[12px] lg:right-[0.8vw] lg:top-[0.8vw]">
                          <ArrowLink href={a.externalUrl} label={a.title} light />
                        </div>
                      )}
                    </div>

                    <h4
                      className="mt-[16px] lg:mt-[1.04vw] capitalize text-[#1b1a1a] leading-[1.25]
                                 text-[18px] sm:text-[20px] lg:text-[1.25vw]"
                      style={{
                        fontFamily:
                          '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                      }}
                    >
                      {a.title}
                    </h4>

                    {a.publishedDate && (
                      <span
                        className="mt-[8px] lg:mt-[0.52vw] font-montserrat text-black/45
                                   text-[12px] lg:text-[0.78vw]"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {formatDate(a.publishedDate)}
                      </span>
                    )}
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation — sits below the cards, aligned to the right edge of
                the same content column. On desktop the arrows only appear when
                there are more than three cards; on mobile the slider stays
                swipeable so they're hidden. */}
            {showArrows && (
              <div className="mt-[26px] lg:mt-[1.823vw] flex items-center gap-[20px] lg:gap-[0.833vw] justify-center ">
                <button
                  type="button"
                  aria-label="Previous awards"
                  className="group inline-flex items-center justify-center rounded-full border border-black/15 text-[#1b1a1a]
                             lg:w-[2.6vw] lg:h-[2.6vw] w-[45px] h-[45px]
                             transition-colors duration-300 hover:bg-[#1b1a1a] hover:text-white hover:border-[#1b1a1a] "
                  onClick={() => swiperRef.current?.slidePrev()}
                >
                  <svg viewBox="0 0 22 14" fill="none" className="lg:w-[1.04vw] h-auto w-[20px]">
                    <path
                      d="M0.293 6.293L6.586 0 8 1.414 4.414 5 22 5v2H4.414L8 10.586 6.586 12 .293 5.707a1 1 0 010-1.414z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next awards"
                  className="group inline-flex items-center justify-center rounded-full text-white
                             lg:w-[2.6vw] lg:h-[2.6vw] w-[45px] h-[45px]
                             transition-transform duration-300 hover:scale-110"
                  style={{ background: RED }}
                  onClick={() => swiperRef.current?.slideNext()}
                >
                  <svg viewBox="0 0 22 14" fill="none" className="lg:w-[1.04vw] h-auto w-[20px]">
                    <path
                      d="M21.707 7.707L15.414 14 14 12.586 17.586 9H0V7h17.586L14 3.414 15.414 2l6.293 6.293a1 1 0 010 1.414z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
