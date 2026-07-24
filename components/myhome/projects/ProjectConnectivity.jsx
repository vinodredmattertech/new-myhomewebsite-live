import React, { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ChevronDown } from "lucide-react";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import SectionHeading from "@/components/common/SectionHeading";

const DEFAULT_CATEGORIES = [
  {
    title: "Connectivity",
    items: [
      "Netaji Subash Road - 190 Meters",
      "Doltala Market - 600 Meters",
      "Daily Market - 100 Meters",
    ],
  },
  { title: "Health Care", items: [] },
  { title: "Malls & Hypermarket", items: [] },
  { title: "Transport Connectivity", items: [] },
];

export default function ProjectConnectivity({
  sidebarLabel = "The Pulse Of Connectivity",
  heading = "Seamlessly Connected",
  categories = DEFAULT_CATEGORIES,
  mapEmbedUrl = "https://www.google.com/maps?q=Hyderabad,+Telangana&z=12&output=embed",
  mapSrc = "/assets/myhome/projects/akrida-map.png",
  mapAlt = "My Home Akrida location map",
}) {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const sidebarRef = useRef(null);
  const cardRef = useRef(null);
  const mapRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(0);

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

      gsap.from(cardRef.current, {
        autoAlpha: 0,
        y: 60,
        duration: 1.1,
        ease: "expo.out",
        delay: 0.15,
        scrollTrigger: trigger,
      });

      gsap.from(mapRef.current, {
        autoAlpha: 0,
        y: 60,
        duration: 1.1,
        ease: "expo.out",
        delay: 0.25,
        scrollTrigger: trigger,
      });
    },
    { scope: rootRef }
  );

  const toggle = (idx) => {
    setOpenIndex((prev) => (prev === idx ? -1 : idx));
  };

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-[#2a2828] pt-[20px] pb-[80px] lg:pt-[4.688vw] lg:pb-[4.688vw]"
      data-section="project-connectivity"
    >
      {/* Vertical sidebar */}
      <div
        ref={sidebarRef}
        className="flex lg:absolute left-[12px] top-[30px] lg:left-[4.167vw] lg:top-[4.688vw] flex-col items-center gap-[8px] md:gap-[12px] lg:gap-[1.094vw] w-auto lg:w-[2.813vw] z-[5] max-lg:static max-lg:!w-full max-lg:flex-row max-lg:!justify-center max-lg:items-center max-lg:!gap-[8px] max-lg:mt-[15px] max-lg:mb-[18px]"
        aria-hidden="true"
      >
        <span className="block w-px h-[28px] md:h-[36px] lg:h-[3.125vw] bg-white/70 max-lg:!w-[28px] max-lg:!h-px" />
        <span
          className="font-montserrat font-medium capitalize whitespace-nowrap text-white text-[12px] md:text-[14px] lg:text-[1.25vw] max-lg:[writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] lg:rotate-180"
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {sidebarLabel}
        </span>
      </div>

      <div className="px-5 md:px-12 lg:px-[9.531vw]">
        <SectionHeading
          ref={headingRef}
          className="capitalize text-white leading-[1.08] tracking-[0.022em] text-center
                     text-[34px] xs:text-[38px] sm:text-[48px] md:text-[64px] lg:text-[5vw]"
        >
          {heading}
        </SectionHeading>

        <div className="mt-[40px] lg:mt-[3.385vw] grid grid-cols-1 lg:grid-cols-[35.696vw_44.219vw] gap-[24px] lg:gap-[3.438vw] items-start">
          {/* Accordion card */}
          <div
            ref={cardRef}
            className="relative w-full lg:h-[33.073vw] rounded-[12px] border border-white/14
                       px-[24px] py-[28px] sm:px-[32px] sm:py-[36px]
                       lg:px-[2.5vw] lg:py-[2.292vw]"
          >
            <ul className="flex flex-col">
              {categories.map((cat, idx) => {
                const isOpen = idx === openIndex;
                const isLast = idx === categories.length - 1;
                return (
                  <li key={cat.title} className={isLast ? "" : "border-b border-white/15"}>
                    <button
                      type="button"
                      onClick={() => toggle(idx)}
                      aria-expanded={isOpen}
                      className="w-full flex items-start justify-between gap-[16px] py-[18px] sm:py-[22px] lg:py-[1.354vw] text-left"
                    >
                      <span
                        className="capitalize text-white text-[20px] sm:text-[22px] lg:text-[1.354vw] leading-[1.2]"
                        style={{
                          fontFamily:
                            '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                          fontWeight: 400,
                        }}
                      >
                        {cat.title}
                      </span>
                      <ChevronDown
                        className={`shrink-0 mt-[6px] lg:mt-[0.365vw] w-[16px] h-[16px] lg:w-[0.938vw] lg:h-[0.938vw] text-white transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        {cat.items.length ? (
                          <ul className="list-disc pl-[26px] lg:pl-[1.667vw] pb-[18px] lg:pb-[1.094vw] text-white">
                            {cat.items.map((item) => (
                              <li
                                key={item}
                                className="capitalize text-[15px] sm:text-[16px] lg:text-[0.938vw] leading-[1.78] lg:leading-[1.667vw]"
                                style={{
                                  fontFamily: "Montserrat, sans-serif",
                                  fontWeight: 400,
                                }}
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p
                            className="pb-[18px] lg:pb-[1.094vw] text-white/60 text-[14px] lg:text-[0.833vw]"
                            style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
                          >
                            Details coming soon.
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Map card — interactive Google Maps embed when mapEmbedUrl
              is set, fallback to a static image otherwise. */}
          <div
            ref={mapRef}
            className="relative w-full aspect-[849/635] lg:h-[33.073vw] lg:w-[44.219vw] rounded-[12px] overflow-hidden bg-white border border-[#3333331a] shadow-[0_0_10px_rgba(0,0,0,0.05)]"
          >
            {mapEmbedUrl ? (
              <iframe
                title={mapAlt || "Project location map"}
                src={mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            ) : mapSrc ? (
              <Image
                src={mapSrc}
                alt={mapAlt}
                fill
                unoptimized
                sizes="(min-width: 1024px) 44vw, 100vw"
                className="object-cover object-center select-none pointer-events-none"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
