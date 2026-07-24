import React, { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import RichText from "@/components/common/RichText";
import SectionHeading from "@/components/common/SectionHeading";

/**
 * Project Before / After
 *
 * Sits directly above the Inquiry section on the project detail page. One
 * framed visual holds both stages: the state chip sits top-left over the
 * image, and the Before / After toggle floats over the bottom edge. Switching
 * crossfades between the two images rather than swapping them, so the
 * transformation reads as one continuous view of the same frame.
 *
 * Strapi-driven (projects.before-after) — the section is only rendered by the
 * page when at least one of the two images exists. A single-image entry keeps
 * working: the toggle simply hides.
 *
 * Desktop sizing is vw-based (1920 reference); mobile/tablet use fixed
 * Tailwind steps.
 */

const BODY_FONT = { fontFamily: "Montserrat, sans-serif" };

export default function ProjectBeforeAfter({
  sidebarLabel = "",
  heading = "",
  description = "",
  beforeLabel = "Before",
  afterLabel = "After",
  beforeSrc = "",
  afterSrc = "",
  beforeCaption = "",
  afterCaption = "",
  projectName = "",
}) {
  const STAGES = [
    { key: "before", label: beforeLabel || "Before", src: beforeSrc, caption: beforeCaption },
    { key: "after", label: afterLabel || "After", src: afterSrc, caption: afterCaption },
  ].filter((s) => s.src);

  const [active, setActive] = useState(STAGES[0]?.key || "before");

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const descRef = useRef(null);
  const sidebarRef = useRef(null);
  const frameRef = useRef(null);

  useGSAP(
    () => {
      if (!rootRef.current) return;
      registerGsap();

      const words = splitToWords(headingRef.current);
      if (words.length) {
        gsap.from(words, {
          yPercent: 110,
          duration: 1,
          stagger: 0.05,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
          clearProps: "transform",
        });
      }

      const intro = [descRef.current, sidebarRef.current].filter(Boolean);
      if (intro.length) {
        gsap.from(intro, {
          y: 28,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
          clearProps: "transform",
        });
      }

      if (frameRef.current) {
        gsap.fromTo(
          frameRef.current,
          { clipPath: "inset(100% 0% 0% 0%)", y: 50, autoAlpha: 0 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            autoAlpha: 1,
            duration: 1.3,
            ease: "expo.out",
            scrollTrigger: { trigger: frameRef.current, start: "top 85%" },
            clearProps: "transform,clipPath",
          }
        );
      }
    },
    { scope: rootRef }
  );

  if (!STAGES.length) return null;

  const current = STAGES.find((s) => s.key === active) || STAGES[0];

  return (
    <section
      ref={rootRef}
      data-section="project-before-after"
      className="relative w-full bg-white overflow-hidden
                 pt-[64px] pb-[64px] lg:pt-[4.688vw] lg:pb-[4.688vw]"
    >
      {/* Sidebar label — site-wide vertical rule + rotated text */}
      {sidebarLabel && (
        <div
          ref={sidebarRef}
          className="flex absolute left-[12px] top-[30px] lg:left-[4.167vw] lg:top-[4.688vw]
                     flex-col items-center gap-[8px] md:gap-[12px] lg:gap-[1.094vw]
                     w-auto lg:w-[2.813vw] z-[5]"
          aria-hidden="true"
        >
          <span className="block w-px h-[28px] md:h-[36px] lg:h-[3.125vw] bg-[#ef493d]" />
          <span
            className="font-montserrat font-medium capitalize whitespace-nowrap text-[#ef493d]
                       text-[12px] md:text-[14px] lg:text-[1.25vw]"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              ...BODY_FONT,
            }}
          >
            {sidebarLabel}
          </span>
        </div>
      )}

      <div className="px-5 md:px-12 lg:px-[9.375vw] max-sm:pl-[40px]">
        {heading && (
          <SectionHeading
            ref={headingRef}
            className="capitalize text-[#333] leading-[1.08] tracking-[0.022em] text-center
                       text-[34px] xs:text-[38px] sm:text-[48px] md:text-[64px] lg:text-[5vw]"
          >
            {heading}
          </SectionHeading>
        )}

        {description && (
          <p
            ref={descRef}
            className="mx-auto mt-[14px] lg:mt-[0.729vw] max-w-[760px] lg:max-w-[46.615vw]
                       text-center text-[#333]
                       text-[14px] leading-[24px]
                       sm:text-[16px] sm:leading-[28px]
                       lg:text-[0.938vw] lg:leading-[1.563vw]"
            style={{ ...BODY_FONT, fontWeight: 400 }}
          >
            <RichText>{description}</RichText>
          </p>
        )}

        {/* Framed visual — both stages stacked, crossfaded on toggle */}
        <div
          ref={frameRef}
          className="relative mx-auto mt-[32px] lg:mt-[2.604vw]
                     w-full max-w-[1320px] lg:max-w-none
                     rounded-[14px] lg:rounded-[0.833vw]
                     bg-[#0f0f0f] p-[8px] lg:p-[0.416vw]
                     shadow-[0_30px_70px_-40px_rgba(0,0,0,0.55)]
                     will-change-transform"
        >
          <div className="relative w-full aspect-[1280/830] overflow-hidden rounded-[10px] lg:rounded-[0.625vw]">
            {STAGES.map((s) => (
              <Image
                key={s.key}
                src={s.src}
                alt={`${s.label}${projectName ? ` — ${projectName}` : ""}`}
                fill
                unoptimized
                priority={s.key === STAGES[0].key}
                sizes="(min-width:1024px) 82vw, 100vw"
                className={`object-cover object-center
                            transition-opacity duration-[900ms]
                            ease-[cubic-bezier(0.22,1,0.36,1)]
                            ${s.key === current.key ? "opacity-100" : "opacity-0"}`}
              />
            ))}

            {/* State chip — top-left over the image */}
            <span
              className="absolute left-[12px] top-[12px] lg:left-[0.833vw] lg:top-[0.833vw]
                         inline-flex items-center rounded-full
                         bg-black/65 backdrop-blur-[6px] text-white
                         px-[14px] py-[6px] lg:px-[1.041vw] lg:py-[0.416vw]
                         font-montserrat font-medium
                         text-[12px] md:text-[13px] lg:text-[0.781vw]"
              style={BODY_FONT}
            >
              {current.label}
            </span>

            {/* Toggle — floats over the bottom edge */}
            {STAGES.length > 1 && (
              <div
                role="tablist"
                aria-label="Construction stage"
                className="absolute left-1/2 -translate-x-1/2
                           bottom-[12px] lg:bottom-[1.041vw]
                           inline-flex items-center gap-[4px] lg:gap-[0.208vw]
                           rounded-full bg-black/60 backdrop-blur-[8px]
                           p-[4px] lg:p-[0.208vw]"
              >
                {STAGES.map((s) => {
                  const isActive = s.key === current.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActive(s.key)}
                      className={`rounded-full font-montserrat font-medium
                                  px-[20px] py-[8px] lg:px-[1.562vw] lg:py-[0.52vw]
                                  text-[12px] md:text-[13px] lg:text-[0.781vw]
                                  transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                                  ${
                                    isActive
                                      ? "bg-[#c39a3e] text-white"
                                      : "bg-transparent text-white/75 hover:text-white"
                                  }`}
                      style={BODY_FONT}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Caption for the visible stage */}
        {current.caption && (
          <p
            key={current.key}
            className="mx-auto mt-[16px] lg:mt-[1.041vw] text-center text-[#6d6d6d]
                       font-montserrat font-normal
                       text-[13px] sm:text-[14px] lg:text-[0.833vw]"
            style={BODY_FONT}
          >
            {current.caption}
          </p>
        )}
      </div>
    </section>
  );
}
