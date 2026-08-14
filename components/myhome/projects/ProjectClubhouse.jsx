import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import SectionHeading from "@/components/common/SectionHeading";

export default function ProjectClubhouse({
  sidebarLabel = "Clubhouse",
  heading = "",
  // Rendered after `heading` in the accent colour, so the CMS can pick which
  // words carry the highlight (reference: "…Turn into *Memories*").
  headingAccent = "",
  description = "",
  imageSrc = "",
  imageAlt = "",
}) {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const accentRef = useRef(null);
  const sidebarRef = useRef(null);
  const descRef = useRef(null);
  const imageRef = useRef(null);
  const rulesRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();

      const trigger = {
        trigger: rootRef.current,
        start: "top 75%",
        toggleActions: "play none none none",
      };

      // Each half of the heading is split on its own node, so the accent span
      // keeps its colour — splitToWords rewrites the node it is handed.
      const words = [
        ...splitToWords(headingRef.current),
        ...splitToWords(accentRef.current),
      ];
      gsap.from(words, {
        yPercent: 110,
        duration: 1,
        stagger: 0.05,
        ease: "expo.out",
        scrollTrigger: trigger,
      });

      gsap.from([sidebarRef.current, rulesRef.current, descRef.current], {
        autoAlpha: 0,
        y: 24,
        duration: 0.9,
        stagger: 0.1,
        ease: "expo.out",
        delay: 0.15,
        scrollTrigger: trigger,
      });

      gsap.from(imageRef.current, {
        autoAlpha: 0,
        x: 60,
        duration: 1.1,
        ease: "expo.out",
        delay: 0.2,
        scrollTrigger: trigger,
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden pt-[20px] pb-[40px] lg:pt-[4.688vw] lg:pb-[4.688vw]"
      data-section="project-clubhouse"
    >
      {/* Vertical sidebar — same rail every other section uses */}
      <div
        ref={sidebarRef}
        className="flex lg:absolute left-[12px] top-[30px] lg:left-[4.167vw] lg:top-[4.688vw] flex-col items-center gap-[8px] md:gap-[12px] lg:gap-[1.094vw] w-auto lg:w-[2.813vw] z-[5] max-lg:static max-lg:!w-full max-lg:flex-row max-lg:!justify-center max-lg:items-center max-lg:!gap-[8px] max-lg:mt-[15px] max-lg:mb-[18px]"
        aria-hidden="true"
      >
        <span className="block w-px h-[28px] md:h-[36px] lg:h-[3.125vw] bg-[#ef493d] max-lg:!w-[28px] max-lg:!h-px" />
        <span
          className="font-montserrat font-medium capitalize whitespace-nowrap text-[#ef493d] text-[12px] md:text-[14px] lg:text-[1.25vw] max-lg:[writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] lg:rotate-180"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {sidebarLabel}
        </span>
      </div>

      {/* Text left, image bleeding off the right edge */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_50.5vw] items-center gap-[32px] lg:gap-[3.646vw]">
        <div className="px-5 md:px-12 lg:pl-[9.375vw] lg:pr-0">
          <span
            ref={rulesRef}
            className="block h-px w-[64px] lg:w-[4.167vw] bg-[#ef493d]/60 mb-[20px] lg:mb-[1.563vw]"
            aria-hidden="true"
          />

          <SectionHeading
            className="text-[#333] leading-[1.08] tracking-[0.022em]
                       text-[32px] xs:text-[36px] sm:text-[44px] md:text-[56px] lg:text-[3.646vw]"
          >
            <span ref={headingRef}>{heading}</span>
            {headingAccent ? (
              <>
                {" "}
                <span ref={accentRef} className="text-[#ef493d]">
                  {headingAccent}
                </span>
              </>
            ) : null}
          </SectionHeading>

          {description ? (
            <p
              ref={descRef}
              className="mt-[22px] lg:mt-[1.823vw] max-w-[560px] lg:max-w-[29vw] text-[#6d6d6d]
                         text-[15px] leading-[26px]
                         sm:text-[16px] sm:leading-[28px]
                         lg:text-[0.938vw] lg:leading-[1.667vw]"
              style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : null}

          {/* Dot grid, echoing the reference's quiet corner detail */}
          <span
            className="mt-[28px] lg:mt-[2.604vw] hidden lg:grid grid-cols-6 gap-[0.521vw] w-fit opacity-40"
            aria-hidden="true"
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="block w-[0.208vw] h-[0.208vw] rounded-full bg-[#c9c3b6]"
              />
            ))}
          </span>
        </div>

        {imageSrc ? (
          // Gutter matches the text block on small screens; on lg the photo
          // runs to the right edge of the viewport as in the reference.
          <div className="px-5 md:px-12 lg:px-0">
            <div
              ref={imageRef}
              className="relative w-full overflow-hidden
                         aspect-[821/658] lg:aspect-auto lg:h-[36.458vw]
                         rounded-[12px] lg:rounded-r-none lg:rounded-l-[12px]"
            >
              <Image
                src={imageSrc}
                alt={imageAlt || "Clubhouse"}
                fill
                unoptimized
                sizes="(min-width:1024px) 51vw, 100vw"
                className="object-cover object-center select-none"
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
