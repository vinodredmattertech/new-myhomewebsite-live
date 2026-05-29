import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, A11y } from "swiper/modules";
import "swiper/css";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import useFancybox from "@/components/common/useFancybox";

/**
 * Default content shown when no CMS data is wired (e.g. local dev).
 * Image tabs carry { image, alt }; video tabs carry
 * { title, image (thumbnail), videoSrc, videoType: "video" | "iframe" }.
 */
const DEFAULT_TABS = [
  {
    key: "gallery",
    label: "Gallery",
    kind: "images",
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
    kind: "videos",
    items: [
      {
        title: "360° Tower Walkthrough",
        image: "/assets/myhome/projects/akrida-banner.jpg",
        alt: "360° tower walkthrough",
        videoSrc: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        videoType: "iframe",
      },
    ],
  },
];

export default function ProjectGallery({
  sidebarLabel = "A Visual Odyssey",
  heading = "Step Into Your Future Home",
  description = "Experience the lifestyle before it's even built. Explore meticulously designed interiors, sprawling landscapes, and architectural grandeur through our gallery and immersive walkthroughs.",
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

  // Bind Fancybox to the section so every [data-fancybox] walkthrough
  // tile opens its video in a lightbox modal.
  const [fancyboxRoot] = useFancybox();
  const attachFancy = (el) => {
    rootRef.current = el;
    fancyboxRoot(el);
  };

  const [activeTab, setActiveTab] = useState(tabs[0]?.key);
  const currentTab = tabs.find((t) => t.key === activeTab) || tabs[0];
  const activeItems = currentTab?.items || [];
  // Fall back to legacy detection (key === "walkthroughs") when `kind`
  // hasn't been set yet — keeps older CMS data + the static defaults working.
  const activeKind =
    currentTab?.kind || (activeTab === "walkthroughs" ? "videos" : "images");

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

  // For the image tab we keep one big slide per image. For the video tab
  // we show a 2-up grid on desktop so multiple walkthroughs are visible.
  const isVideoTab = activeKind === "videos";

  return (
    <section
      ref={attachFancy}
      className="relative w-full bg-[#2a2828] pt-[80px] pb-[80px] lg:pt-[3.125vw] lg:pb-[4.688vw] overflow-hidden"
      data-section="project-gallery"
    >
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="flex absolute left-[12px] top-[30px] lg:left-[4.167vw] lg:top-[4.688vw] flex-col items-center gap-[8px] md:gap-[12px] lg:gap-[1.094vw] w-auto lg:w-[2.813vw] z-[5]"
        aria-hidden="true"
      >
        <span className="block w-px h-[28px] md:h-[36px] lg:h-[3.125vw] bg-white/70" />
        <span
          className="font-montserrat font-medium capitalize whitespace-nowrap text-white text-[12px] md:text-[14px] lg:text-[1.25vw]"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {sidebarLabel}
        </span>
      </div>

      <div className="px-5 md:px-12 lg:px-[9.375vw] max-sm:pl-[40px]">
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

      {/* ===== Slider ===== */}
      <div
        ref={sliderWrapRef}
        className="relative mt-[36px] lg:mt-[2.917vw] w-full px-5 md:px-12 lg:px-[2.083vw]"
      >
        {activeItems.length === 0 ? (
          <div className="mx-auto max-w-[760px] py-[40px] text-center">
            <p
              className="font-montserrat text-white/70 text-[14px] lg:text-[0.938vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              No {isVideoTab ? "walkthroughs" : "gallery"} available yet.
            </p>
          </div>
        ) : isVideoTab ? (
          <Swiper
            key={activeTab}
            modules={[Navigation, Keyboard, A11y]}
            slidesPerView={1.05}
            spaceBetween={16}
            speed={650}
            keyboard={{ enabled: true }}
            onSwiper={(s) => {
              swiperRef.current = s;
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            navigation={{ prevEl: null, nextEl: null }}
            breakpoints={{
              640: { slidesPerView: 1.4, spaceBetween: 20 },
              768: { slidesPerView: 1.8, spaceBetween: 24 },
              1024: { slidesPerView: 2, spaceBetween: 32 },
            }}
            className="!overflow-visible"
          >
            {activeItems.map((item, idx) => {
              const hasVideo = !!item.videoSrc;
              return (
                <SwiperSlide
                  key={`video-${idx}`}
                  className="!h-auto"
                >
                  <div className="relative w-full aspect-[785/440] rounded-[12px] overflow-hidden bg-black/40 group">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.alt || item.title || ""}
                        fill
                        unoptimized
                        sizes="(min-width:1024px) 36vw, 95vw"
                        className="object-cover object-center select-none transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                        priority={idx === 0}
                      />
                    )}
                    <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/15 transition-colors duration-300" />

                    {/* Play / disabled */}
                    {hasVideo ? (
                      <a
                        href={item.videoSrc}
                        data-fancybox={`walkthrough-${activeTab}`}
                        data-type={item.videoType}
                        data-caption={item.title || ""}
                        aria-label={`Play walkthrough — ${item.title || "video"}`}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span
                          className="inline-flex items-center justify-center rounded-full
                                     bg-white/95 text-[#ef493d] shadow-[0_8px_24px_rgba(0,0,0,0.45)]
                                     w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] lg:w-[4.167vw] lg:h-[4.167vw]
                                     transition-transform duration-300 group-hover:scale-110"
                        >
                          <Play
                            className="w-[22px] h-[22px] lg:w-[1.563vw] lg:h-[1.563vw] ml-[3px] lg:ml-[0.156vw] fill-current"
                            strokeWidth={0}
                          />
                        </span>
                      </a>
                    ) : (
                      <span
                        className="absolute inset-0 flex items-center justify-center"
                        aria-label="Walkthrough coming soon"
                      >
                        <span
                          className="inline-flex items-center justify-center rounded-full
                                     bg-white/40 text-white opacity-70
                                     w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] lg:w-[4.167vw] lg:h-[4.167vw]"
                        >
                          <Play
                            className="w-[22px] h-[22px] lg:w-[1.563vw] lg:h-[1.563vw] ml-[3px] lg:ml-[0.156vw] fill-current"
                            strokeWidth={0}
                          />
                        </span>
                      </span>
                    )}

                    {/* Title overlay */}
                    {item.title && (
                      <div className="absolute inset-x-0 bottom-0 px-[20px] py-[18px] lg:px-[1.563vw] lg:py-[1.302vw] pointer-events-none">
                        <p
                          className="text-white text-[14px] sm:text-[16px] lg:text-[1.042vw] leading-[1.3] capitalize"
                          style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}
                        >
                          {item.title}
                        </p>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
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
              <SwiperSlide key={`image-${idx}`} className="!h-auto">
                <a
                  href={item.image}
                  data-fancybox={`gallery-${activeTab}`}
                  data-caption={item.alt || ""}
                  className="relative w-full aspect-[1398/632] rounded-[12px] overflow-hidden bg-black/30 block group"
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.alt || ""}
                      fill
                      unoptimized
                      sizes="(min-width:1024px) 73vw, 95vw"
                      className="object-cover object-center select-none transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                      priority={idx === 0}
                    />
                  )}
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

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
