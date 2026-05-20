import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, A11y } from "swiper/modules";
import "swiper/css";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";

const DEFAULT_TABS = [
  {
    key: "gallery",
    label: "Gallery",
    items: [
      { image: "/assets/myhome/projects/gallery-pool.jpg", alt: "Resort-style pool view" },
      { image: "/assets/myhome/projects/amenity-pool.jpg", alt: "Infinity pool and deck" },
      { image: "/assets/myhome/projects/amenity-amphitheatre.jpg", alt: "Open-air amphitheatre" },
      { image: "/assets/myhome/projects/amenity-sports.jpg", alt: "Sports zone court" },
      { image: "/assets/myhome/projects/akrida-entrance.jpg", alt: "Tower entrance" },
      { image: "/assets/myhome/projects/akrida-banner.jpg", alt: "Tower skyline view" },
    ],
  },
  {
    key: "walkthroughs",
    label: "Walkthroughs",
    items: [
      { image: "/assets/myhome/projects/akrida-banner.jpg", alt: "360° tower walkthrough" },
      { image: "/assets/myhome/projects/akrida-entrance.jpg", alt: "Entrance walkthrough" },
      { image: "/assets/myhome/projects/amenity-amphitheatre.jpg", alt: "Amphitheatre walkthrough" },
      { image: "/assets/myhome/projects/gallery-pool.jpg", alt: "Pool deck walkthrough" },
    ],
  },
];

export default function ProjectGallery({
  sidebarLabel = "A Visual Odyssey",
  heading = "Step Into Your Future Home",
  description = "Experience the Akrida lifestyle before it's even built. Explore our meticulously designed interiors, sprawling landscapes, and architectural grandeur through our high-definition gallery and immersive 360° virtual tours.",
  tabs = DEFAULT_TABS,
}) {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const descRef = useRef(null);
  const sidebarRef = useRef(null);
  const tabsRef = useRef(null);
  const sliderWrapRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  const [activeTab, setActiveTab] = useState(tabs[0]?.key);
  const activeItems = tabs.find((t) => t.key === activeTab)?.items || [];
  const isWalkthrough = activeTab === "walkthroughs";

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

      gsap.from([sidebarRef.current, descRef.current, tabsRef.current], {
        autoAlpha: 0,
        y: 24,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.1,
        delay: 0.15,
        scrollTrigger: trigger,
      });

      gsap.from(sliderWrapRef.current, {
        autoAlpha: 0,
        y: 60,
        duration: 1.1,
        ease: "expo.out",
        delay: 0.3,
        scrollTrigger: trigger,
      });
    },
    { scope: rootRef }
  );

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(0, 500);
    }
  }, [activeTab]);

  const handleTabChange = (key) => {
    if (key !== activeTab) setActiveTab(key);
  };

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-[#2a2828] pt-[80px] pb-[80px] lg:pt-[3.125vw] lg:pb-[4.688vw] overflow-hidden"
      data-section="project-gallery"
    >
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="hidden lg:flex absolute left-[4.167vw] top-[4.688vw] flex-col items-center gap-[1.094vw] w-[2.813vw]"
        aria-hidden="true"
      >
        <span className="block h-[3.125vw] w-px bg-white/70" />
        <span className="flex items-center justify-center h-[10.677vw] w-[1.51vw]">
          <span
            className="-rotate-90 whitespace-nowrap capitalize text-white text-[1.25vw]"
            style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}
          >
            {sidebarLabel}
          </span>
        </span>
      </div>

      <div className="px-5 md:px-12 lg:px-[9.375vw]">
        <h2
          ref={headingRef}
          className="capitalize text-white leading-[1.08] tracking-[0.022em] text-center
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
          className="mx-auto mt-[14px] lg:mt-[0.729vw] max-w-[760px] lg:max-w-[56.719vw]
                     text-center text-white
                     text-[14px] leading-[24px]
                     sm:text-[16px] sm:leading-[28px]
                     lg:text-[0.938vw] lg:leading-[1.563vw]"
          style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
        >
          {description}
        </p>

        {/* Tabs */}
        <div
          ref={tabsRef}
          className="mt-[28px] lg:mt-[2.708vw] flex flex-wrap items-center justify-center gap-[12px] sm:gap-[16px] lg:gap-[1.094vw]"
          role="tablist"
          aria-label="Gallery types"
        >
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab.key)}
                className={`inline-flex items-center justify-center transition-colors duration-300
                            h-[44px] sm:h-[50px] lg:h-[2.76vw]
                            px-[18px] sm:px-[22px] lg:px-[1.354vw]
                            min-w-[120px] sm:min-w-[140px] lg:min-w-[7.083vw]
                            text-[14px] sm:text-[16px] lg:text-[0.938vw]
                            ${
                              isActive
                                ? "bg-white text-[#333]"
                                : "bg-transparent text-white border-[0.7px] border-white hover:bg-white/10"
                            }`}
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span className="capitalize whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slider with side nav arrows */}
      <div
        ref={sliderWrapRef}
        className="relative mt-[36px] lg:mt-[2.917vw] w-full px-5 md:px-12 lg:px-[2.083vw]"
      >
        <Swiper
          key={activeTab}
          modules={[Navigation, Keyboard, A11y]}
          slidesPerView={1}
          spaceBetween={16}
          speed={650}
          keyboard={{ enabled: true }}
          loop={activeItems.length > 1}
          onSwiper={(s) => {
            swiperRef.current = s;
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          navigation={{ prevEl: null, nextEl: null }}
          breakpoints={{
            1024: { slidesPerView: 1, spaceBetween: 24 },
          }}
          className="!overflow-visible"
        >
          {activeItems.map((item, idx) => (
            <SwiperSlide key={`${activeTab}-${idx}`} className="!h-auto">
              <div className="relative w-full aspect-[1398/632] rounded-[12px] overflow-hidden bg-black/30">
                <Image
                  src={item.image}
                  alt={item.alt || ""}
                  fill
                  sizes="(min-width:1024px) 73vw, 95vw"
                  className="object-cover object-center select-none"
                  priority={idx === 0}
                />
                {isWalkthrough ? (
                  <button
                    type="button"
                    aria-label={`Play walkthrough — ${item.alt || ""}`}
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <span className="absolute inset-0 bg-black/25 transition-colors duration-300 group-hover:bg-black/15" />
                    <span
                      className="relative inline-flex items-center justify-center rounded-full
                                 bg-white/90 text-[#ef493d] shadow-[0_8px_24px_rgba(0,0,0,0.35)]
                                 w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] lg:w-[5vw] lg:h-[5vw]
                                 transition-transform duration-300 group-hover:scale-110"
                    >
                      <Play className="w-[24px] h-[24px] lg:w-[1.875vw] lg:h-[1.875vw] ml-[3px] lg:ml-[0.156vw] fill-current" />
                    </span>
                  </button>
                ) : null}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Side nav buttons */}
        <button
          ref={prevRef}
          type="button"
          aria-label="Previous"
          className="absolute z-[5] top-1/2 -translate-y-1/2
                     left-[12px] md:left-[24px] lg:left-[3.125vw]
                     inline-flex items-center justify-center rounded-full
                     bg-[#ef493d] text-white shadow-[0_6px_16px_rgba(0,0,0,0.35)]
                     w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] lg:w-[3.092vw] lg:h-[3.092vw]
                     transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-[18px] h-[18px] lg:w-[1.342vw] lg:h-[1.342vw]" />
        </button>
        <button
          ref={nextRef}
          type="button"
          aria-label="Next"
          className="absolute z-[5] top-1/2 -translate-y-1/2
                     right-[12px] md:right-[24px] lg:right-[3.125vw]
                     inline-flex items-center justify-center rounded-full
                     bg-[#ef493d] text-white shadow-[0_6px_16px_rgba(0,0,0,0.35)]
                     w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] lg:w-[3.092vw] lg:h-[3.092vw]
                     transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <ArrowRight className="w-[18px] h-[18px] lg:w-[1.342vw] lg:h-[1.342vw]" />
        </button>
      </div>
    </section>
  );
}
