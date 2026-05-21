import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import RichText from "@/components/common/RichText";

const DEFAULT_IMAGE = "/assets/myhome/projects/luxury-design.jpg";

const DEFAULT_SPECS = [
  {
    key: "structure",
    title: "RCC Shear Wall-framed Structure",
    image: DEFAULT_IMAGE,
  },
  {
    key: "flooring",
    title: "Flooring & Finishes",
    image: "/assets/myhome/projects/akrida-entrance.jpg",
  },
  {
    key: "doors",
    title: "Doors & Windows",
    image: "/assets/myhome/projects/amenity-amphitheatre.jpg",
  },
  {
    key: "electrical",
    title: "Electrical & Utilities",
    image: "/assets/myhome/projects/akrida-banner.jpg",
  },
  {
    key: "security",
    title: "Security & Safety",
    image: "/assets/myhome/projects/amenity-sports.jpg",
  },
  {
    key: "kitchen",
    title: "Kitchen, Utility & Wash",
    image: "/assets/myhome/projects/amenity-pool.jpg",
  },
];

export default function ProjectSpecifications({
  sidebarLabel = "The Standard Of Excellence",
  heading = "Luxury By Design",
  description = "My Home Akrida exemplifies superior craftsmanship in every detail. We merge industrial durability with sophisticated aesthetics, from the towers' structure to each room's premium finishes.",
  specs = DEFAULT_SPECS,
}) {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const descRef = useRef(null);
  const sidebarRef = useRef(null);
  const gridRef = useRef(null);
  const imageRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeSpec = specs[activeIndex];

  useGSAP(
    () => {
      registerGsap();

      const trigger = {
        trigger: rootRef.current,
        start: "top 75%",
        toggleActions: "play none none none",
      };

      const headingWords = splitToWords(headingRef.current);
      gsap.from(headingWords, {
        yPercent: 110,
        duration: 1,
        stagger: 0.05,
        ease: "expo.out",
        scrollTrigger: trigger,
      });

      gsap.from([sidebarRef.current, descRef.current], {
        autoAlpha: 0,
        y: 24,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.1,
        delay: 0.15,
        scrollTrigger: trigger,
      });

      // Only animate y on entrance — no autoAlpha. The image wrapper was
      // sometimes stuck at opacity:0 because of a race between the
      // scrollTrigger and the tab-change fade tween below.
      gsap.from(imageRef.current, {
        y: 50,
        duration: 1.1,
        ease: "expo.out",
        delay: 0.25,
        scrollTrigger: trigger,
      });

      gsap.from(gridRef.current?.children || [], {
        autoAlpha: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.06,
        ease: "expo.out",
        delay: 0.4,
        scrollTrigger: trigger,
      });
    },
    { scope: rootRef }
  );

  // Crossfade the image on tab change
  useGSAP(
    () => {
      if (!imageRef.current) return;
      gsap.fromTo(
        imageRef.current,
        { autoAlpha: 0.4 },
        { autoAlpha: 1, duration: 0.6, ease: "power2.out" }
      );
    },
    { scope: rootRef, dependencies: [activeIndex] }
  );

  const goPrev = () =>
    setActiveIndex((i) => (i - 1 + specs.length) % specs.length);
  const goNext = () => setActiveIndex((i) => (i + 1) % specs.length);

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white pt-[80px] pb-[80px] lg:pt-[4.688vw] lg:pb-[4.688vw] overflow-hidden"
      data-section="project-specifications"
    >
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="hidden lg:flex absolute left-[4.167vw] top-[4.688vw] flex-col items-center gap-[1.094vw] w-[2.813vw]"
        aria-hidden="true"
      >
        <span className="block h-[3.125vw] w-px bg-[#ef493d]" />
        <span className="flex items-center justify-center h-[17.448vw] w-[1.51vw]">
          <span
            className="-rotate-90 whitespace-nowrap capitalize text-[#ef493d] text-[1.25vw]"
            style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}
          >
            {sidebarLabel}
          </span>
        </span>
      </div>

      <div className="px-5 md:px-12 lg:px-[9.375vw]">
        <h2
          ref={headingRef}
          className="capitalize text-[#333] leading-[1.08] tracking-[0.022em] text-center
                     text-[34px] xs:text-[38px] sm:text-[48px] md:text-[64px] lg:text-[5vw]"
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
            fontWeight: 300,
          }}
        >
          {heading}
        </h2>
        <p
          ref={descRef}
          className="mx-auto mt-[14px] lg:mt-[0.729vw] max-w-[760px] lg:max-w-[46.615vw]
                     text-center text-[#333]
                     text-[14px] leading-[24px]
                     sm:text-[16px] sm:leading-[28px]
                     lg:text-[0.938vw] lg:leading-[1.563vw]"
          style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
        >
          <RichText>{description}</RichText>
        </p>

        {/* Content row */}
        <div className="mt-[40px] lg:mt-[3.385vw] grid grid-cols-1 lg:grid-cols-[43.021vw_1fr] gap-[24px] lg:gap-[3.802vw] items-start">
          {/* Image */}
          <div
            ref={imageRef}
            className="relative w-full aspect-[826/656] lg:h-[34.167vw] lg:w-[43.021vw] overflow-hidden rounded-[12px] bg-[#eee]"
          >
            {activeSpec?.image ? (
              // Plain <img> — `next/image` with `fill` + a Strapi-hosted
              // remote URL was rendering blank for several specs even with
              // `unoptimized`. A raw <img> is fine here since we're
              // displaying CMS media that's already sized appropriately.
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={activeSpec.image}
                alt={activeSpec.title || ""}
                loading={activeIndex === 0 ? "eager" : "lazy"}
                className="absolute inset-0 w-full h-full object-cover object-center select-none"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#aaa]">
                <span
                  className="font-montserrat text-[13px] lg:text-[0.833vw] tracking-[0.06em] uppercase"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Image coming soon
                </span>
              </div>
            )}
          </div>

          {/* Right column: 2x3 category grid + controls */}
          <div className="flex flex-col gap-[24px] lg:gap-[2.083vw] lg:pt-[2.917vw]">
            <div
              ref={gridRef}
              className="grid grid-cols-3 grid-rows-2 border-t border-l border-[#333]/12 rounded-[8px]"
              role="tablist"
              aria-label="Specifications"
            >
              {specs.map((spec, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={spec.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveIndex(idx)}
                    className={`group relative flex items-center justify-center
                                px-[10px] py-[20px] sm:px-[14px] sm:py-[28px]
                                lg:px-[1.042vw] lg:py-[2.396vw]
                                border-r border-b border-[#333]/12
                                transition-colors duration-300
                                ${
                                  isActive
                                    ? "bg-[rgba(239,73,61,0.06)]"
                                    : "bg-transparent hover:bg-[rgba(239,73,61,0.04)]"
                                }`}
                  >
                    <span
                      className={`text-center capitalize transition-colors duration-300
                                  text-[13px] leading-[20px]
                                  sm:text-[15px] sm:leading-[22px]
                                  lg:text-[0.938vw] lg:leading-[1.25vw]
                                  ${isActive ? "text-[#ef493d]" : "text-[#333] group-hover:text-[#ef493d]"}`}
                      style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
                    >
                      {spec.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Controls: prev arrow + dots + next arrow */}
            <div className="flex items-center justify-center gap-[16px] sm:gap-[22px] lg:gap-[1.563vw]">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous specification"
                className="inline-flex items-center justify-center text-[#ef493d]
                           w-[36px] h-[36px] lg:w-[2.135vw] lg:h-[2.135vw]
                           transition-transform duration-300 hover:scale-110 active:scale-95"
              >
                <ArrowLeft className="w-[20px] h-[20px] lg:w-[1.563vw] lg:h-[1.563vw]" />
              </button>

              <div className="flex items-center gap-[8px] lg:gap-[0.521vw] rounded-full bg-[rgba(239,73,61,0.10)] px-[12px] py-[8px] lg:px-[0.781vw] lg:py-[0.417vw]">
                {specs.map((spec, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={`dot-${spec.key}`}
                      type="button"
                      aria-label={`Show ${spec.title}`}
                      onClick={() => setActiveIndex(idx)}
                      className={`rounded-full transition-all duration-300
                                  ${
                                    isActive
                                      ? "w-[10px] h-[10px] lg:w-[0.625vw] lg:h-[0.625vw] bg-[#ef493d]"
                                      : "w-[8px] h-[8px] lg:w-[0.469vw] lg:h-[0.469vw] bg-[#ef493d]/40 hover:bg-[#ef493d]/70"
                                  }`}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={goNext}
                aria-label="Next specification"
                className="inline-flex items-center justify-center text-[#ef493d]
                           w-[36px] h-[36px] lg:w-[2.135vw] lg:h-[2.135vw]
                           transition-transform duration-300 hover:scale-110 active:scale-95"
              >
                <ArrowRight className="w-[20px] h-[20px] lg:w-[1.563vw] lg:h-[1.563vw]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
