import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import SectionHeading from "@/components/common/SectionHeading";

const DEFAULT_STATS = [
  { value: "24.99", label: "Acres" },
  { value: "12", label: "High Rise Towers" },
  { value: "G+39", label: "Floors" },
  { value: "81%", label: "Open Area" },
  { value: "3,780", label: "Units" },
  { value: "2, 2.5, 3", label: "BHK Apartments" },
];

export default function ProjectOverview({
  imageSrc = "/assets/myhome/projects/akrida-entrance.jpg",
  imageAlt = "My Home Akrida entrance",
  sidebarLabel = "A Legacy Of Joy",
  heading = "Where Life Finds its Center",
  description = "Spread across 24.99 sprawling acres, My Home Akrida is more than a residence it is a meticulously crafted ecosystem designed for those who seek the perfect equilibrium between urban vibrancy and personal sanctuary. Rising 39 floors into the Gopanpally skyline, our twelve majestic towers offer an elevated living experience where 81% open spaces invite the outdoors in.",
  stats = DEFAULT_STATS,
}) {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const sidebarRef = useRef(null);
  const imageRef = useRef(null);
  const descRef = useRef(null);
  const statsRef = useRef(null);

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

      gsap.from(sidebarRef.current, {
        autoAlpha: 0,
        y: 30,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: trigger,
      });

      gsap.from(imageRef.current, {
        autoAlpha: 0,
        y: 60,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: trigger,
      });

      gsap.from(descRef.current, {
        autoAlpha: 0,
        y: 30,
        duration: 0.9,
        ease: "expo.out",
        delay: 0.15,
        scrollTrigger: trigger,
      });

      gsap.from(statsRef.current?.children || [], {
        autoAlpha: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.08,
        ease: "expo.out",
        delay: 0.3,
        scrollTrigger: trigger,
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white pt-[80px] pb-[80px] lg:pt-[4.688vw] lg:pb-[4.688vw]"
      data-section="project-overview"
    >
      {/* Vertical sidebar — "A Legacy Of Joy" */}
      <div
        ref={sidebarRef}
        className="flex absolute left-[12px] top-[30px] lg:left-[4.167vw] lg:top-[4.688vw] flex-col items-center gap-[8px] md:gap-[12px] lg:gap-[1.094vw] w-auto lg:w-[2.813vw] z-[5]"
        aria-hidden="true"
      >
        <span className="block w-px h-[28px] md:h-[36px] lg:h-[3.125vw] bg-[#ef493d]" />
        <span
          className="font-montserrat font-medium capitalize whitespace-nowrap text-[#ef493d] text-[12px] md:text-[14px] lg:text-[1.25vw]"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {sidebarLabel}
        </span>
      </div>

      <div className="px-5 md:px-12 lg:px-[9.375vw]">
        {/* Heading */}
        <SectionHeading
          ref={headingRef}
          className="capitalize text-[#333] leading-[1.08] tracking-[0.022em] text-center
                     text-[34px] xs:text-[38px] sm:text-[48px] md:text-[64px] lg:text-[5vw]"
        >
          {heading}
        </SectionHeading>

        {/* Content grid: image left, text + stats right */}
        <div className="mt-[40px] lg:mt-[3.646vw] grid grid-cols-1 lg:grid-cols-[38.229vw_1fr] gap-[36px] lg:gap-[6.771vw] items-start">
          <div
            ref={imageRef}
            className="relative w-full aspect-[734/701] lg:h-[36.510vw] lg:w-[38.229vw] overflow-hidden rounded-[12px]"
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover object-center select-none"
            />
          </div>

          <div className="flex flex-col gap-[40px] lg:gap-[5.521vw] lg:pt-[6.771vw]">
            <p
              ref={descRef}
              className="text-[#6d6d6d] text-justify
                         text-[15px] leading-[26px]
                         sm:text-[16px] sm:leading-[28px]
                         lg:text-[0.938vw] lg:leading-[1.563vw]
                         lg:max-w-[36vw]"
              style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
              dangerouslySetInnerHTML={{ __html: description }}
            />

            <div
              ref={statsRef}
              className="grid grid-cols-2 sm:grid-cols-3 gap-y-[36px] sm:gap-y-[40px] lg:gap-y-[2.865vw]"
            >
              {stats.map((stat, idx) => (
                <div
                  key={`${stat.label}-${idx}`}
                  className={`flex flex-col gap-[6px] lg:gap-[0.365vw] px-[14px] sm:px-[18px] lg:px-[1.25vw] border-[#555]/25 ${
                    idx % 2 !== 1 ? "border-r" : ""
                  } ${idx % 3 === 2 ? "sm:border-r-0" : "sm:border-r"}`}
                >
                  <span
                    className="text-[#555] tracking-[0.03em]
                               text-[34px] sm:text-[42px] md:text-[48px] lg:text-[2.865vw]"
                    style={{
                      fontFamily:
                        '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                      fontWeight: 300,
                      lineHeight: 1.05,
                    }}
                  >
                    {stat.value}
                  </span>
                  <span
                    className="text-[#555]
                               text-[14px] leading-[20px]
                               sm:text-[16px] sm:leading-[24px]
                               lg:text-[1.042vw] lg:leading-[1.458vw]"
                    style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
