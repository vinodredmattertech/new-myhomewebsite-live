import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import { mediaUrl } from "@/lib/strapi";
import RichText from "@/components/common/RichText";
import SectionHeading from "@/components/common/SectionHeading";

/**
 * Lifestyle — "Making Living Better"
 *
 * Sits between Where Stories Begin and Community Living. Carries the campaign
 * direction through three pillar cards (Sustainability / Amenities /
 * Community Living) built from amenities in delivered projects, followed by
 * the Chairman's vision that the philosophy comes from.
 *
 * Everything is Strapi-driven (home.lifestyle):
 *   • the section renders only when there is a heading or at least one pillar
 *   • the vision band renders only when a quote has been written
 *
 * Desktop sizing is vw-based (1920 reference: 1px = 0.0521vw) so the section
 * scales with the rest of the home page; mobile/tablet use fixed Tailwind
 * steps.
 */

const TITLE_FONT = {
  fontFamily:
    '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
};
const BODY_FONT = { fontFamily: "Montserrat, sans-serif" };

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

function PillarCard({ index, title, body, image, projectName }) {
  return (
    <article className="group flex flex-col h-full">
      {/* Image — portrait 480×560 on desktop, same ratio on mobile */}
      <div
        className="relative w-full aspect-[480/560] overflow-hidden
                   rounded-[6px] lg:rounded-[0.416vw]
                   shadow-[0_20px_50px_-25px_rgba(0,0,0,0.35)]"
      >
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            unoptimized
            sizes="(min-width:1024px) 24vw, (min-width:640px) 60vw, 90vw"
            className="object-cover object-center transition-transform duration-700
                       ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 bg-[#f1efec]" />
        )}

        {/* Index badge — keeps the three pillars readable as a sequence */}
        <span
          className="absolute left-[14px] top-[14px] lg:left-[1.041vw] lg:top-[1.041vw]
                     inline-flex items-center justify-center rounded-full
                     bg-white/90 text-[#ef493d] font-montserrat font-medium
                     w-[34px] h-[34px] text-[12px]
                     lg:w-[2.291vw] lg:h-[2.291vw] lg:text-[0.729vw]"
          style={BODY_FONT}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Delivered-project caption (optional) */}
        {projectName && (
          <span
            className="absolute left-0 bottom-0 right-0
                       bg-gradient-to-t from-black/60 to-transparent
                       px-[14px] pt-[28px] pb-[12px]
                       lg:px-[1.041vw] lg:pt-[2.083vw] lg:pb-[0.833vw]
                       font-montserrat font-medium text-white uppercase
                       tracking-[0.12em] text-[10px] lg:text-[0.625vw]"
            style={BODY_FONT}
          >
            {projectName}
          </span>
        )}
      </div>

      <h3
        className="capitalize text-[#333] leading-[1.15]
                   mt-[18px] lg:mt-[1.562vw]
                   text-[24px] sm:text-[28px] md:text-[32px] lg:text-[1.875vw]"
        style={TITLE_FONT}
      >
        {title}
      </h3>

      <p
        className="font-montserrat font-normal text-[#6d6d6d]
                   mt-[10px] lg:mt-[0.833vw]
                   text-[13px] sm:text-[14px] md:text-[15px] lg:text-[0.833vw]
                   leading-[22px] sm:leading-[24px] md:leading-[26px] lg:leading-[1.458vw]"
        style={BODY_FONT}
      >
        <RichText>{body}</RichText>
      </p>
    </article>
  );
}

export default function Lifestyle({ data }) {
  const PILLARS = Array.isArray(data?.pillars)
    ? data.pillars.map((p) => ({
        title: p.title || "",
        body: p.body || "",
        projectName: p.projectName || "",
        image: mediaUrl(p.image),
      }))
    : [];

  const visionQuote = data?.visionQuote || "";
  const visionImage = mediaUrl(data?.visionImage);
  const hasVision = Boolean(visionQuote);

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const paraRef = useRef(null);
  const labelRef = useRef(null);
  const cardsRef = useRef(null);
  const visionRef = useRef(null);

  // Chairman's message — collapsed by default, "See more / See less" toggles it
  // open with a smooth height transition on both mobile and desktop.
  const quoteBodyRef = useRef(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [canCollapse, setCanCollapse] = useState(false);
  const COLLAPSED_H = 270; // px of message shown while collapsed

  useEffect(() => {
    const el = quoteBodyRef.current;
    if (!el) return;
    const check = () => setCanCollapse(el.scrollHeight > COLLAPSED_H + 24);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [visionQuote]);

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

      const intro = [paraRef.current, labelRef.current].filter(Boolean);
      if (intro.length) {
        gsap.from(intro, {
          y: 30,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 70%" },
        });
      }

      const cards = cardsRef.current
        ? gsap.utils.toArray(cardsRef.current.querySelectorAll("[data-pillar]"))
        : [];
      if (cards.length) {
        gsap.from(cards, {
          y: 60,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.12,
          ease: "expo.out",
          scrollTrigger: { trigger: cardsRef.current, start: "top 85%" },
        });
      }

      if (visionRef.current) {
        gsap.from(visionRef.current, {
          y: 50,
          autoAlpha: 0,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: visionRef.current, start: "top 85%" },
        });
      }
    },
    { scope: rootRef }
  );

  // Nothing authored in Strapi → the section stays out of the page entirely.
  if (!data || (!data.heading && !PILLARS.length)) return null;

  return (
    <section
      ref={rootRef}
      id="lifestyle"
      data-section="lifestyle"
      className="relative w-full bg-white overflow-hidden
                 pt-[56px] pb-[64px]
                 lg:pt-[4.166vw] lg:pb-[4.687vw]"
    >
      {/* Side label — vertical red rule + rotated text (site-wide pattern) */}
      {data.label && (
        <div
          ref={labelRef}
          className="lg:absolute z-[5] flex flex-col items-center
                     left-[12px] top-[24px] gap-[11px] w-[28px]
                     lg:left-[4.166vw] lg:top-[4.166vw] lg:w-[2.812vw] lg:gap-[1.094vw] max-lg:static max-lg:!w-full max-lg:flex-row max-lg:!justify-center max-lg:items-center max-lg:!gap-[8px] max-lg:mt-[15px] max-lg:mb-[18px]"
          style={{ color: "#ef493d" }}
        >
          <span
            className="block w-px h-[31px] lg:h-[3.125vw] max-lg:!w-[28px] max-lg:!h-px"
            style={{ background: "currentColor" }}
          />
          <span
            className="font-montserrat font-medium capitalize whitespace-nowrap text-[12px] lg:text-[1.25vw] max-lg:[writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] lg:rotate-180"
            style={{
              ...BODY_FONT,
            }}
          >
            {data.label}
          </span>
        </div>
      )}

      {/* Header — heading left, intro copy right on desktop; stacked on mobile */}
      <div
        className="relative z-[3] flex flex-col lg:flex-row lg:items-end lg:justify-between
                   gap-[16px] lg:gap-[4.166vw]
                   pl-5 pr-5 sm:pl-8 sm:pr-8
                   lg:pl-[11.146vw] lg:pr-[4.166vw]"
      >
        <SectionHeading
          ref={headingRef}
          className="capitalize text-[#333] tracking-[2px]
                     leading-[1.15] lg:leading-[normal]
                     text-[32px] xs:text-[35px] sm:text-[44px] md:text-[64px] lg:text-[4vw]
                     max-w-[805px] lg:max-w-[42vw]
                     will-change-transform"
        >
          {data.heading}
        </SectionHeading>

        {data.body && (
          <p
            ref={paraRef}
            className="font-montserrat font-normal text-[#333] lg:text-[#6d6d6d] text-justify
                       text-[14px] md:text-[16px] lg:text-[0.938vw]
                       leading-[24px] lg:leading-[1.563vw]
                       max-w-[742px] lg:w-[30vw] lg:max-w-none lg:pb-[0.5vw]"
            style={BODY_FONT}
          >
            <RichText>{data.body}</RichText>
          </p>
        )}
      </div>

      {/* Pillars — desktop grid, tablet/mobile carousel */}
      {PILLARS.length > 0 && (
        <div
          ref={cardsRef}
          className="relative z-[2] mt-[36px] lg:mt-[3.645vw]
                     px-5 md:px-10 lg:px-[11.146vw]"
        >
          <div className="hidden lg:grid grid-cols-3 gap-[2.604vw]">
            {PILLARS.map((p, i) => (
              <div data-pillar key={`${p.title}-${i}`} className="h-full">
                <PillarCard index={i} {...p} />
              </div>
            ))}
          </div>

          <div className="lg:hidden">
            <Swiper
              modules={[Keyboard, A11y, Autoplay]}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={PILLARS.length > 1}
              spaceBetween={20}
              slidesPerView={1.05}
              keyboard={{ enabled: true }}
              breakpoints={{
                640: { slidesPerView: 1.6, spaceBetween: 28 },
                768: { slidesPerView: 2.2, spaceBetween: 32 },
              }}
            >
              {PILLARS.map((p, i) => (
                <SwiperSlide key={`${p.title}-${i}`} className="!h-auto">
                  <PillarCard index={i} {...p} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      {/* Chairman's vision — the philosophy behind Making Living Better */}
      {hasVision && (
        <div
          ref={visionRef}
          className="relative z-[2] mt-[48px] lg:mt-[5.208vw]
                     mx-5 md:mx-10 lg:mx-[11.146vw]
                     bg-[#f7f5f2] rounded-[8px] lg:rounded-[0.416vw]
                     overflow-hidden
                     flex flex-col"
        >
          {visionImage && (
            /* Image banner on top; the Chairman's message flows below it. A wide
               environmental shot, so it's centred and top-anchored to keep him
               (and his face) in frame across the banner ratios. */
            <div
              className="relative w-full overflow-hidden
                         aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/7]
                         max-h-[560px]"
            >
              <Image
                src={visionImage}
                alt={data.visionName || "Chairman"}
                fill
                unoptimized
                sizes="100vw"
                className="object-cover max-md:object-left"
              />
            </div>
          )}

          <div
            className="flex flex-col
                       px-5 py-[36px] md:px-10 md:py-[48px]
                       lg:px-[3.645vw] lg:py-[3.125vw]"
          >
            {data.visionLabel && (
              <span
                className="font-montserrat font-medium uppercase text-[#ef493d]
                           tracking-[0.16em]
                           text-[11px] lg:text-[0.729vw]"
                style={BODY_FONT}
              >
                {data.visionLabel}
              </span>
            )}

            {/* Opening quote glyph — anchors the message as a quotation and
                keeps the top of the column from feeling empty on long copy. */}
            <Image
              src="/assets/myhome/about/comma.svg"
              width={100}
              height={100}
              aria-hidden="true"
              className="mt-[16px] lg:mt-[1.041vw] w-9 h-9 md:w-[3.2vw] md:h-[3.2vw] rotate-180 opacity-90"
            />

            <div className="mt-[12px] lg:mt-[0.833vw]">
              {/* Smoothly collapsing message body */}
              <div
                ref={quoteBodyRef}
                className="relative overflow-hidden
                           transition-[max-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  maxHeight: quoteOpen
                    ? `${quoteBodyRef.current?.scrollHeight ?? 4000}px`
                    : `${COLLAPSED_H}px`,
                }}
              >
                <blockquote
                  className="text-[#333] leading-[1.5]
                             text-[18px] sm:text-[20px] md:text-[22px] lg:text-[1.354vw]"
                  style={TITLE_FONT}
                >
                  <RichText>{visionQuote}</RichText>
                </blockquote>

                {/* Fade hint — only while collapsed and there is more to read */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-x-0 bottom-0
                              h-[64px] lg:h-[4vw] bg-gradient-to-t from-[#f7f5f2] to-transparent
                              transition-opacity duration-300
                              ${canCollapse && !quoteOpen ? "opacity-100" : "opacity-0"}`}
                />
              </div>

              {canCollapse && (
                <button
                  type="button"
                  onClick={() => setQuoteOpen((o) => !o)}
                  aria-expanded={quoteOpen}
                  className="mt-[14px] lg:mt-[1.041vw] inline-flex items-center
                             gap-[6px] lg:gap-[0.416vw]
                             font-montserrat font-medium uppercase tracking-[0.14em]
                             text-[#ef493d] text-[11px] lg:text-[0.729vw]
                             transition-colors hover:text-[#c9382e]"
                  style={BODY_FONT}
                >
                  {quoteOpen ? "See less" : "See more"}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`w-[14px] h-[14px] lg:w-[0.9vw] lg:h-[0.9vw]
                                transition-transform duration-300 ${quoteOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>

            {(data.visionName || data.visionRole) && (
              <footer className="mt-[24px] lg:mt-[1.822vw] flex items-center gap-[12px] lg:gap-[0.833vw]">
                <span
                  aria-hidden="true"
                  className="block h-px bg-[#ef493d] w-[28px] lg:w-[2.083vw]"
                />
                <span className="flex flex-col">
                  {data.visionName && (
                    <span
                      className="capitalize text-[#333] leading-[1.2]
                                 text-[16px] md:text-[18px] lg:text-[1.041vw]"
                      style={TITLE_FONT}
                    >
                      {data.visionName}
                    </span>
                  )}
                  {data.visionRole && (
                    <span
                      className="font-montserrat font-normal text-[#6d6d6d]
                                 text-[12px] md:text-[13px] lg:text-[0.729vw]"
                      style={BODY_FONT}
                    >
                      {data.visionRole}
                    </span>
                  )}
                </span>
              </footer>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
