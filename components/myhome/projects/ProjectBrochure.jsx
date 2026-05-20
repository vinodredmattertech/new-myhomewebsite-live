import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Download } from "lucide-react";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";

const DEFAULT_HIGHLIGHTS = [
  "24.99-Acre Master Planned Community",
  "1.05 Lakh Sq. Ft. Dual Clubhouse Amenities",
  "Detailed Unit Configurations & RERA Layouts",
  "Premium Architectural & Technical Specifications",
  "IGBC Gold Rated Green Building Features",
];

export default function ProjectBrochure({
  sidebarLabel = "Your Journey Starts Here",
  heading = "The Akrida Handbook",
  highlights = DEFAULT_HIGHLIGHTS,
  imageSrc = "/assets/myhome/projects/brochure-clubhouse.jpg",
  imageAlt = "My Home Akrida clubhouse",
  brochureHref = "#",
  buttonLabel = "Download Brochure",
}) {
  const rootRef = useRef(null);
  const sidebarRef = useRef(null);
  const headingRef = useRef(null);
  const listRef = useRef(null);
  const buttonRef = useRef(null);
  const imageRef = useRef(null);

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
        y: 24,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: trigger,
      });

      gsap.from(imageRef.current, {
        autoAlpha: 0,
        x: -40,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: trigger,
      });

      gsap.from(listRef.current?.children || [], {
        autoAlpha: 0,
        y: 20,
        duration: 0.7,
        stagger: 0.08,
        ease: "expo.out",
        delay: 0.3,
        scrollTrigger: trigger,
      });

      gsap.from(buttonRef.current, {
        autoAlpha: 0,
        y: 20,
        duration: 0.8,
        ease: "expo.out",
        delay: 0.7,
        scrollTrigger: trigger,
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-[#2a2828] pt-[60px] pb-[60px] lg:pt-[4.167vw] lg:pb-[3.125vw] overflow-hidden"
      data-section="project-brochure"
    >
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="hidden lg:flex absolute left-[4.167vw] top-[4.688vw] flex-col items-center gap-[1.094vw] w-[2.813vw]"
        aria-hidden="true"
      >
        <span className="block h-[3.125vw] w-px bg-white/70" />
        <span className="flex items-center justify-center h-[15.781vw] w-[1.51vw]">
          <span
            className="-rotate-90 whitespace-nowrap capitalize text-white text-[1.25vw]"
            style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}
          >
            {sidebarLabel}
          </span>
        </span>
      </div>

      <div className="px-5 md:px-12 lg:pl-[9.375vw] lg:pr-[9.531vw]">
        <div className="grid grid-cols-1 lg:grid-cols-[32.5vw_1fr] gap-[36px] lg:gap-[5.573vw] items-center">
          {/* Image */}
          <div
            ref={imageRef}
            className="relative w-full aspect-[624/599] lg:h-[31.198vw] lg:w-[32.5vw] rounded-[12px] overflow-hidden bg-black/40"
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(min-width:1024px) 33vw, 100vw"
              className="object-cover object-center select-none"
            />
          </div>

          {/* Right column */}
          <div className="flex flex-col items-start gap-[24px] lg:gap-[2.135vw] max-w-full lg:max-w-[43.021vw]">
            <h2
              ref={headingRef}
              className="capitalize text-white leading-[1.08] tracking-[0.022em]
                         text-[34px] xs:text-[38px] sm:text-[48px] md:text-[64px] lg:text-[5vw]"
              style={{
                fontFamily:
                  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                fontWeight: 300,
              }}
            >
              {heading}
            </h2>

            <ul
              ref={listRef}
              className="flex flex-col text-white list-disc pl-[24px] lg:pl-[1.953vw]"
            >
              {highlights.map((h) => (
                <li
                  key={h}
                  className="text-[15px] leading-[28px]
                             sm:text-[17px] sm:leading-[34px]
                             lg:text-[1.302vw] lg:leading-[2.604vw]"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 400,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {h}
                </li>
              ))}
            </ul>

            <a
              ref={buttonRef}
              href={brochureHref}
              download
              className="inline-flex items-center justify-between gap-[16px]
                         border border-white text-white capitalize
                         h-[48px] sm:h-[54px] lg:h-[3.021vw]
                         w-[260px] sm:w-[290px] lg:w-[15.833vw]
                         px-[20px] lg:px-[1.354vw]
                         text-[14px] sm:text-[16px] lg:text-[0.938vw]
                         transition-colors duration-300
                         hover:bg-white hover:text-[#2a2828]"
              style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}
            >
              <span>{buttonLabel}</span>
              <Download className="w-[18px] h-[18px] lg:w-[1.094vw] lg:h-[1.094vw]" strokeWidth={1.8} />
            </a>
          </div>
        </div>

        <div className="mt-[36px] lg:mt-[3.385vw] h-px w-full bg-white/15" aria-hidden="true" />
      </div>
    </section>
  );
}
