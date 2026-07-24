import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { mediaUrl } from "@/lib/strapi";
import RichText from "@/components/common/RichText";
import SectionHeading from "@/components/common/SectionHeading";

/**
 * Community Living
 *
 * Sits between the Lifestyle section and Testimonials. Left column carries the
 * community imagery, right column the copy plus the "What Makes My Home
 * Exceptional" list (on-time delivery, quality construction, brand trust).
 *
 * Strapi-driven (home.community-living):
 *   • the section renders only when a heading or at least one highlight exists
 *   • the highlights block renders only when highlights were added
 *   • the image column collapses cleanly when no image was uploaded
 *
 * Desktop sizing is vw-based (1920 reference); mobile/tablet use fixed
 * Tailwind steps and stack image → copy → highlights.
 */

const TITLE_FONT = {
  fontFamily:
    '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
};
const BODY_FONT = { fontFamily: "Montserrat, sans-serif" };

function HighlightRow({ index, title, body, value, icon, isLast }) {
  return (
    <li
      data-highlight
      className={`flex items-start gap-[14px] lg:gap-[1.25vw]
                  py-[18px] lg:py-[1.354vw]
                  ${isLast ? "" : "border-b border-[#333]/10"}`}
    >
      {/* Icon when one was uploaded, otherwise the 01 / 02 / 03 index */}
      <span
        className="shrink-0 inline-flex items-center justify-center rounded-full
                   border border-[#ef493d]/30 text-[#ef493d]
                   w-[42px] h-[42px] lg:w-[3.125vw] lg:h-[3.125vw]"
      >
        {icon ? (
          <span className="relative block w-[20px] h-[20px] lg:w-[1.458vw] lg:h-[1.458vw]">
            <Image
              src={icon}
              alt=""
              fill
              unoptimized
              sizes="(min-width:1024px) 2vw, 20px"
              className="object-contain"
            />
          </span>
        ) : (
          <span
            className="font-montserrat font-medium text-[13px] lg:text-[0.833vw]"
            style={BODY_FONT}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </span>

      <div className="flex flex-col">
        <span className="flex flex-wrap items-baseline gap-x-[10px] lg:gap-x-[0.625vw]">
          <h4
            className="capitalize text-[#333] leading-[1.2]
                       text-[19px] sm:text-[21px] md:text-[24px] lg:text-[1.354vw]"
            style={TITLE_FONT}
          >
            {title}
          </h4>
          {value && (
            <span
              className="font-montserrat font-medium text-[#ef493d]
                         text-[12px] md:text-[13px] lg:text-[0.729vw]
                         tracking-[0.08em] uppercase"
              style={BODY_FONT}
            >
              {value}
            </span>
          )}
        </span>

        {body && (
          <p
            className="font-montserrat font-normal text-[#6d6d6d]
                       mt-[6px] lg:mt-[0.416vw]
                       text-[13px] sm:text-[14px] md:text-[15px] lg:text-[0.833vw]
                       leading-[22px] sm:leading-[24px] md:leading-[26px] lg:leading-[1.458vw]"
            style={BODY_FONT}
          >
            <RichText>{body}</RichText>
          </p>
        )}
      </div>
    </li>
  );
}

export default function CommunityLiving({ data }) {
  const HIGHLIGHTS = Array.isArray(data?.highlights)
    ? data.highlights.map((h) => ({
        title: h.title || "",
        body: h.body || "",
        value: h.value || "",
        icon: mediaUrl(h.icon),
      }))
    : [];

  const image = mediaUrl(data?.image);
  const secondaryImage = mediaUrl(data?.secondaryImage);

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const paraRef = useRef(null);
  const labelRef = useRef(null);
  const imageRef = useRef(null);
  const listRef = useRef(null);

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

      if (imageRef.current) {
        gsap.from(imageRef.current, {
          y: 60,
          autoAlpha: 0,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 70%" },
        });
      }

      const rows = listRef.current
        ? gsap.utils.toArray(listRef.current.querySelectorAll("[data-highlight]"))
        : [];
      if (rows.length) {
        gsap.from(rows, {
          y: 40,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "expo.out",
          scrollTrigger: { trigger: listRef.current, start: "top 85%" },
        });
      }
    },
    { scope: rootRef }
  );

  // Nothing authored in Strapi → the section stays out of the page entirely.
  if (!data || (!data.heading && !HIGHLIGHTS.length)) return null;

  return (
    <section
      ref={rootRef}
      id="community-living"
      data-section="community-living"
      className="relative w-full bg-[#faf9f7] overflow-hidden
                 pt-[56px] pb-[64px]
                 lg:pt-[4.687vw] lg:pb-[5.208vw]"
    >
      {/* Side label — vertical red rule + rotated text (site-wide pattern) */}
      {data.label && (
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
              ...BODY_FONT,
            }}
          >
            {data.label}
          </span>
        </div>
      )}

      <div
        className="relative z-[3] flex flex-col lg:flex-row lg:items-start
                   gap-[32px] lg:gap-[4.687vw]
                   pl-[64px] pr-5 sm:pl-[80px] sm:pr-8
                   lg:pl-[11.146vw] lg:pr-[4.166vw]"
      >
        {/* IMAGE COLUMN */}
        {image && (
          <div
            ref={imageRef}
            className="relative order-1 shrink-0 w-full max-w-[560px] mx-auto
                       lg:w-[33.333vw] lg:max-w-none lg:mx-0"
          >
            <div
              className="relative w-full aspect-[640/720] overflow-hidden
                         rounded-[8px] lg:rounded-[0.416vw]
                         shadow-[0_30px_60px_-30px_rgba(0,0,0,0.4)]"
            >
              <Image
                src={image}
                alt={data.heading || "Community living at My Home"}
                fill
                unoptimized
                sizes="(min-width:1024px) 34vw, calc(100vw - 40px)"
                className="object-cover object-center"
              />
            </div>

            {/* Optional overlapping secondary image — desktop only so the
                mobile stack stays simple. */}
            {secondaryImage && (
              <div
                className="hidden lg:block absolute
                           right-[-3.125vw] bottom-[-3.125vw]
                           w-[13.541vw] aspect-[260/300]
                           rounded-[0.416vw] overflow-hidden
                           border-[0.416vw] border-[#faf9f7]
                           shadow-[0_20px_50px_-25px_rgba(0,0,0,0.45)]"
              >
                <Image
                  src={secondaryImage}
                  alt=""
                  fill
                  unoptimized
                  sizes="14vw"
                  className="object-cover object-center"
                />
              </div>
            )}
          </div>
        )}

        {/* COPY + HIGHLIGHTS COLUMN */}
        <div className="order-2 flex flex-col lg:flex-1 lg:pt-[1.041vw]">
          <SectionHeading
            ref={headingRef}
            className="capitalize text-[#333] tracking-[2px]
                       leading-[1.15] lg:leading-[normal]
                       text-[32px] xs:text-[35px] sm:text-[44px] md:text-[56px] lg:text-[3.333vw]
                       will-change-transform"
          >
            {data.heading}
          </SectionHeading>

          {data.body && (
            <p
              ref={paraRef}
              className="font-montserrat font-normal text-[#333] lg:text-[#6d6d6d] text-justify
                         mt-[16px] lg:mt-[1.563vw]
                         text-[14px] md:text-[16px] lg:text-[0.938vw]
                         leading-[24px] lg:leading-[1.563vw]
                         max-w-[742px] lg:max-w-[38vw]"
              style={BODY_FONT}
            >
              <RichText>{data.body}</RichText>
            </p>
          )}

          {/* What Makes My Home Exceptional */}
          {HIGHLIGHTS.length > 0 && (
            <div ref={listRef} className="mt-[32px] lg:mt-[2.604vw]">
              {data.highlightsHeading && (
                <h3
                  className="capitalize text-[#333] leading-[1.2]
                             text-[22px] sm:text-[26px] md:text-[30px] lg:text-[1.875vw]"
                  style={TITLE_FONT}
                >
                  {data.highlightsHeading}
                </h3>
              )}

              <ul className="mt-[8px] lg:mt-[0.833vw] border-t border-[#333]/10">
                {HIGHLIGHTS.map((h, i) => (
                  <HighlightRow
                    key={`${h.title}-${i}`}
                    index={i}
                    isLast={i === HIGHLIGHTS.length - 1}
                    {...h}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
