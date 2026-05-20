import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, A11y } from "swiper/modules";
import "swiper/css";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";

const FLOOR_PLAN_IMG = "/assets/myhome/projects/floor-plan.png";

const DEFAULT_TABS = [
  {
    key: "floor-plans",
    label: "Floor Plans",
    plans: [
      { bhk: "3 BHK", label: "Flat 1 - 1926 Sq. Ft.", image: FLOOR_PLAN_IMG },
      { bhk: "3 BHK", label: "Flat 2 - 1926 Sq. Ft.", image: FLOOR_PLAN_IMG },
      { bhk: "3 BHK", label: "Flat 3 - 1926 Sq. Ft.", image: FLOOR_PLAN_IMG },
      { bhk: "2 BHK", label: "Flat 4 - 1284 Sq. Ft.", image: FLOOR_PLAN_IMG },
      { bhk: "2 BHK", label: "Flat 5 - 1284 Sq. Ft.", image: FLOOR_PLAN_IMG },
    ],
  },
  {
    key: "master-plan",
    label: "Master Plan",
    plans: [
      { bhk: "Tower A", label: "12 Towers - G+39", image: FLOOR_PLAN_IMG },
      { bhk: "Tower B", label: "Master Layout", image: FLOOR_PLAN_IMG },
      { bhk: "Tower C", label: "Master Layout", image: FLOOR_PLAN_IMG },
    ],
  },
  {
    key: "unit-plan",
    label: "Unit Plan",
    plans: [
      { bhk: "Unit A", label: "Type A - 1926 Sq. Ft.", image: FLOOR_PLAN_IMG },
      { bhk: "Unit B", label: "Type B - 1284 Sq. Ft.", image: FLOOR_PLAN_IMG },
      { bhk: "Unit C", label: "Type C - 1748 Sq. Ft.", image: FLOOR_PLAN_IMG },
    ],
  },
];

export default function ProjectFloorPlans({
  sidebarLabel = "Space With Purpose",
  heading = "Live The Way You Want",
  description = "Discover the art of spatial intelligence. From the intimate comfort of our 2 BHK residences to the expansive luxury of our 3 BHK layouts, every floor plan is engineered to maximize natural light, cross-ventilation, and functional flow.",
  tabs = DEFAULT_TABS,
}) {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const descRef = useRef(null);
  const sidebarRef = useRef(null);
  const sliderWrapRef = useRef(null);
  const tabsRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  const [activeTab, setActiveTab] = useState(tabs[0]?.key);
  const activePlans = tabs.find((t) => t.key === activeTab)?.plans || [];

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

  // When tab changes, jump slider back to start
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(0, 500);
    }
  }, [activeTab]);

  const handleTabChange = (key) => {
    if (key === activeTab) return;
    setActiveTab(key);
  };

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white pt-[80px] pb-[80px] lg:pt-[1.667vw] lg:pb-[4.688vw] overflow-hidden"
      data-section="project-floor-plans"
    >
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="hidden lg:flex absolute left-[4.167vw] top-[4.688vw] flex-col items-center gap-[1.094vw] w-[2.813vw]"
        aria-hidden="true"
      >
        <span className="block h-[3.125vw] w-px bg-[#ef493d]" />
        <span className="flex items-center justify-center h-[12.917vw] w-[1.51vw]">
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
          className="mx-auto mt-[14px] lg:mt-[0.729vw] max-w-[760px] lg:max-w-[55.469vw]
                     text-center text-[#333]
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
          className="mt-[28px] lg:mt-[2.865vw] flex flex-wrap items-center justify-center gap-[12px] sm:gap-[16px] lg:gap-[1.094vw]"
          role="tablist"
          aria-label="Plan types"
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
                            min-w-[120px] sm:min-w-[140px] lg:min-w-[8.594vw]
                            text-[14px] sm:text-[16px] lg:text-[0.938vw]
                            ${
                              isActive
                                ? "bg-[#333] text-white"
                                : "bg-transparent text-[#333] border-[0.7px] border-[#333] hover:bg-[#333]/5"
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
        className="relative mt-[36px] lg:mt-[2.969vw] w-full pl-5 md:pl-12 lg:pl-[5.208vw]"
      >
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
            768: { slidesPerView: 1.8, spaceBetween: 28 },
            1024: { slidesPerView: 2.15, spaceBetween: 40 },
          }}
          className="!overflow-visible"
        >
          {activePlans.map((plan, idx) => (
            <SwiperSlide key={`${activeTab}-${idx}`} className="!h-auto">
              <div
                className="relative w-full aspect-[785/620] rounded-[12px] bg-[#f2f2f2]
                           border border-[rgba(51,51,51,0.1)] overflow-hidden
                           px-[16px] py-[16px] sm:px-[24px] sm:py-[22px] lg:px-[1.927vw] lg:py-[1.771vw]"
              >
                <div className="flex items-center gap-[10px] sm:gap-[14px] lg:gap-[0.833vw]">
                  <span
                    className="inline-flex items-center justify-center rounded-full bg-white
                               border-[1.068px] border-[#333] text-[#333]
                               h-[34px] sm:h-[42px] lg:h-[2.656vw]
                               px-[16px] sm:px-[20px] lg:px-[1.302vw]
                               text-[13px] sm:text-[15px] lg:text-[1.001vw]"
                    style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}
                  >
                    {plan.bhk}
                  </span>
                  <span
                    className="inline-flex items-center justify-center rounded-full bg-white
                               border-[1.068px] border-[#333] text-[#333]
                               h-[34px] sm:h-[42px] lg:h-[2.656vw]
                               px-[16px] sm:px-[20px] lg:px-[1.302vw]
                               text-[13px] sm:text-[15px] lg:text-[1.001vw]"
                    style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}
                  >
                    {plan.label}
                  </span>
                </div>
                <div className="mt-[14px] sm:mt-[20px] lg:mt-[1.667vw] relative w-full h-[calc(100%-58px)] sm:h-[calc(100%-72px)] lg:h-[calc(100%-4.323vw)]">
                  <Image
                    src={plan.image}
                    alt={`${plan.bhk} ${plan.label}`}
                    fill
                    sizes="(min-width:1024px) 41vw, (min-width:640px) 70vw, 95vw"
                    className="object-contain object-center select-none"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Side nav buttons */}
        <button
          ref={prevRef}
          type="button"
          aria-label="Previous plan"
          className="absolute z-[5] top-1/2 -translate-y-1/2
                     left-[12px] md:left-[24px] lg:left-[1.354vw]
                     inline-flex items-center justify-center rounded-full
                     bg-[#ef493d] text-white shadow-[0_6px_16px_rgba(0,0,0,0.18)]
                     w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] lg:w-[2.938vw] lg:h-[2.938vw]
                     transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-[18px] h-[18px] lg:w-[1.276vw] lg:h-[1.276vw]" />
        </button>
        <button
          ref={nextRef}
          type="button"
          aria-label="Next plan"
          className="absolute z-[5] top-1/2 -translate-y-1/2
                     right-[12px] md:right-[24px] lg:right-[1.354vw]
                     inline-flex items-center justify-center rounded-full
                     bg-[#ef493d] text-white shadow-[0_6px_16px_rgba(0,0,0,0.18)]
                     w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] lg:w-[2.938vw] lg:h-[2.938vw]
                     transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <ArrowRight className="w-[18px] h-[18px] lg:w-[1.276vw] lg:h-[1.276vw]" />
        </button>
      </div>
    </section>
  );
}
