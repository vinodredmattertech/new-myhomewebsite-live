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
 * Sits between the Lifestyle section and Testimonials. Two blocks:
 *   1. Intro — community imagery on the left, copy on the right.
 *   2. "What Makes My Home Exceptional" — a full-width band with a centred
 *      heading over a 3-up row of visuals (on-time delivery, quality
 *      construction, brand trust), each with its name below the image.
 *
 * Strapi-driven (home.community-living):
 *   • the section renders only when a heading or at least one highlight exists
 *   • the highlights band renders only when highlights were added
 *   • the intro image column collapses cleanly when no image was uploaded
 *   • a highlight with no image falls back to a numbered tile
 *
 * Desktop sizing is vw-based (1920 reference); mobile/tablet use fixed
 * Tailwind steps — the intro stacks image → copy, and the 3-up row becomes a
 * single column below the `sm` breakpoint.
 */

const TITLE_FONT = {
  fontFamily:
    '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
};
const BODY_FONT = { fontFamily: "Montserrat, sans-serif" };

/**
 * One "What Makes My Home Exceptional" card — visual on top, name underneath,
 * mirroring the reference layout (3 across on desktop, stacked on mobile).
 *
 * Motion is split across two layers on purpose so the scroll reveal and the
 * hover state never fight over the same `transform`:
 *   • GSAP (see useGSAP below) owns the entrance — clip-path unmask, lift and
 *     image push-in — and hands every property back with `clearProps`.
 *   • CSS transitions own the hover — card lift, deeper shadow, slow image
 *     zoom, light sweep and the rule that draws under the title.
 */
function HighlightCard({ index, title, body, value, image }) {
  return (
    <li
      data-highlight
      /* The lift lives here, not on the media element: GSAP owns `transform`
         on the media during the reveal, and a CSS transform transition on the
         same node would interpolate against it and drag the entrance. */
      className="group flex flex-col will-change-transform
                 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]
                 hover:-translate-y-[6px] lg:hover:-translate-y-[0.42vw]"
    >
      <div
        data-card-media
        className="relative w-full aspect-[420/300] overflow-hidden bg-[#ece9e4]
                   rounded-[8px] lg:rounded-[0.52vw]
                   ring-1 ring-black/[0.06]
                   shadow-[0_14px_34px_-22px_rgba(0,0,0,0.4)]
                   transition-[box-shadow] duration-[900ms]
                   ease-[cubic-bezier(0.22,1,0.36,1)]
                   group-hover:shadow-[0_44px_70px_-34px_rgba(0,0,0,0.55)]"
      >
        {/* Zoom layer — GSAP animates this on entrance, CSS zooms the <img>
            inside it on hover, so neither overwrites the other. */}
        <div data-card-zoom className="absolute inset-0">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              unoptimized
              sizes="(min-width:1024px) 25vw, (min-width:640px) 32vw, calc(100vw - 40px)"
              className="object-cover object-center
                         transition-transform duration-[1400ms]
                         ease-[cubic-bezier(0.22,1,0.36,1)]
                         group-hover:scale-[1.08]"
            />
          ) : (
            /* No visual uploaded yet — a quiet numbered tile keeps the row even */
            <div className="absolute inset-0 flex items-center justify-center bg-[#f1efec]">
              <span
                className="font-montserrat font-medium text-[#ef493d]/50
                           text-[34px] lg:text-[2.604vw]"
                style={BODY_FONT}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>

        {/* Bottom veil — grounds the chip and deepens slightly on hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0
                     bg-gradient-to-t from-black/55 via-black/10 to-transparent
                     opacity-80 group-hover:opacity-95
                     transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        />

        {/* Index — quiet ordinal, brightens with the card */}
        <span
          aria-hidden="true"
          className="absolute right-[12px] top-[10px] lg:right-[0.833vw] lg:top-[0.729vw]
                     font-montserrat font-medium tracking-[0.18em]
                     text-white/45 group-hover:text-white/80
                     transition-colors duration-[900ms]
                     text-[10px] lg:text-[0.625vw]"
          style={BODY_FONT}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Proof point — frosted chip, rises into place on hover */}
        {value && (
          <span
            className="absolute left-[12px] bottom-[12px] right-[12px]
                       lg:left-[0.833vw] lg:bottom-[0.833vw] lg:right-[0.833vw]
                       inline-flex w-fit max-w-full items-center
                       rounded-full border border-white/25 bg-white/15 backdrop-blur-[6px]
                       px-[10px] py-[5px] lg:px-[0.729vw] lg:py-[0.312vw]
                       font-montserrat font-medium uppercase text-white
                       tracking-[0.12em] text-[9.5px] md:text-[10px] lg:text-[0.573vw]
                       transition-[transform,background-color] duration-[900ms]
                       ease-[cubic-bezier(0.22,1,0.36,1)]
                       group-hover:-translate-y-[2px] group-hover:bg-white/25"
            style={BODY_FONT}
          >
            {value}
          </span>
        )}
      </div>

      {/* Name below the image (reference layout) */}
      <h4
        data-card-copy
        className="text-center capitalize text-[#333] leading-[1.25]
                   mt-[16px] lg:mt-[1.145vw]
                   text-[18px] sm:text-[20px] md:text-[22px] lg:text-[1.25vw]
                   transition-colors duration-500 group-hover:text-[#111]"
        style={TITLE_FONT}
      >
        {title}
      </h4>

      {/* Accent rule — draws outward from the centre under the name */}
      <span
        aria-hidden="true"
        data-card-copy
        className="mx-auto mt-[8px] lg:mt-[0.52vw] h-px bg-[#ef493d]
                   w-[18px] lg:w-[1.25vw] group-hover:w-[46px] lg:group-hover:w-[3.125vw]
                   transition-[width] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      />

      {body && (
        <p
          data-card-copy
          className="text-center font-montserrat font-normal text-[#6d6d6d]
                     mt-[10px] lg:mt-[0.729vw] mx-auto
                     max-w-[420px] lg:max-w-[21vw]
                     text-[13px] sm:text-[14px] lg:text-[0.781vw]
                     leading-[22px] sm:leading-[24px] lg:leading-[1.354vw]"
          style={BODY_FONT}
        >
          <RichText>{body}</RichText>
        </p>
      )}
    </li>
  );
}

export default function CommunityLiving({ data }) {
  const HIGHLIGHTS = Array.isArray(data?.highlights)
    ? data.highlights.map((h) => ({
        title: h.title || "",
        body: h.body || "",
        value: h.value || "",
        image: mediaUrl(h.image),
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

      /* Highlight cards — each reveals as a clip-path unmask with the image
         pushing in behind it, copy trailing just after. Every tween ends with
         `clearProps` so the inline transforms GSAP writes don't outrank the
         CSS hover states afterwards. */
      const cards = listRef.current
        ? gsap.utils.toArray(listRef.current.querySelectorAll("[data-highlight]"))
        : [];
      cards.forEach((card, i) => {
        const media = card.querySelector("[data-card-media]");
        const zoom = card.querySelector("[data-card-zoom]");
        const copy = gsap.utils.toArray(card.querySelectorAll("[data-card-copy]"));

        const tl = gsap.timeline({
          delay: i * 0.14, // the three cards enter together — stagger by delay
          scrollTrigger: { trigger: card, start: "top 88%" },
        });

        if (media) {
          tl.fromTo(
            media,
            { clipPath: "inset(100% 0% 0% 0%)", y: 48, autoAlpha: 0 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              y: 0,
              autoAlpha: 1,
              duration: 1.25,
              ease: "expo.out",
              clearProps: "transform,clipPath",
            },
            0
          );
        }
        if (zoom) {
          tl.fromTo(
            zoom,
            { scale: 1.28 },
            { scale: 1, duration: 1.6, ease: "expo.out", clearProps: "transform" },
            0
          );
        }
        if (copy.length) {
          tl.from(
            copy,
            {
              y: 26,
              autoAlpha: 0,
              duration: 0.85,
              stagger: 0.08,
              ease: "expo.out",
              clearProps: "transform",
            },
            0.28
          );
        }
      });
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
                 pt-[46px] pb-[64px]
                 lg:pt-[2.687vw] lg:pb-[5.208vw]"
    >
      {/* Side label — vertical red rule + rotated text (site-wide pattern) */}
      {data.label && (
        <div
          ref={labelRef}
          className="lg:absolute z-[5] flex flex-col items-center
                     left-[12px] top-[4px] gap-[11px] w-[28px]
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

      <div
        className="relative z-[3] flex flex-col lg:flex-row lg:items-start
                   gap-[32px] lg:gap-[4.687vw]
                   pl-5 pr-5 sm:pl-8 sm:pr-8
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

        </div>
      </div>

      {/* ============================================================
           WHAT MAKES MY HOME EXCEPTIONAL
           Full-width band under the intro: centred heading, then the
           points as a 3-up row of visuals with the name below each
           (stacked on mobile, 3 across from tablet up).
         ============================================================ */}
      {HIGHLIGHTS.length > 0 && (
        <div
          ref={listRef}
          className="relative z-[3] mt-[48px] lg:mt-[4.687vw]
                     px-5 md:px-10 lg:px-[11.146vw]"
        >
          {data.highlightsHeading && (
            <h3
              className="text-center capitalize text-[#333] leading-[1.2]
                         text-[24px] xs:text-[26px] sm:text-[32px] md:text-[38px] lg:text-[2.291vw]"
              style={TITLE_FONT}
            >
              {data.highlightsHeading}
            </h3>
          )}

          <ul
            className="mt-[38px] lg:mt-[2.604vw]
                       grid grid-cols-1 sm:grid-cols-3
                       gap-[28px] sm:gap-[20px] md:gap-[28px] lg:gap-[2.083vw]"
          >
            {HIGHLIGHTS.map((h, i) => (
              <HighlightCard key={`${h.title}-${i}`} index={i} {...h} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
