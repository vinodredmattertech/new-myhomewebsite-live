import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import useFancybox from "@/components/common/useFancybox";
import SectionHeading from "@/components/common/SectionHeading";



const DEFAULT_METRICS = [
  {
    key: "overall",
    label: "Overall Project Completion",
    sublabel: "(Data as of May 2026)",
    value: 78.94,
  },
  { key: "superstructure", label: "Superstructure", value: 100 },
  { key: "building", label: "Building Work", value: 78 },
  { key: "infrastructure", label: "Infrastructure", value: 3.58 },
];

const DEFAULT_IMAGES = [
  { src: "/assets/myhome/projects/progress-1.jpg", alt: "On-site progress May 2026" },
  { src: "/assets/myhome/projects/akrida-banner.jpg", alt: "Tower elevation" },
  { src: "/assets/myhome/projects/akrida-entrance.jpg", alt: "Tower entrance" },
];

function CircularProgress({
  value,
  trackColor = "#E5E5E5",
  progressColor = "#ef493d",
  strokeWidth = 10,
  className = "",
}) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const size = 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-[#555] tracking-[0.03em]
                     text-[22px] sm:text-[26px] lg:text-[1.563vw]"
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
            fontWeight: 400,
            lineHeight: 1,
          }}
        >
          {clamped}%
        </span>
      </div>
    </div>
  );
}

export default function ProjectProgress({
  sidebarLabel = "Milestones In Motion",
  heading = "Crafting Dreams Into Reality",
  description = "Transparency is the foundation of our trust. Stay updated with the real-time evolution of My Home Akrida as we transform architectural blueprints into a thriving 39-floor landmark.",
  metrics = DEFAULT_METRICS,
  images = DEFAULT_IMAGES,
}) {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const descRef = useRef(null);
  const sidebarRef = useRef(null);
  const metricsRef = useRef(null);
  const sliderWrapRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [visible, setVisible] = useState(false);

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

      gsap.from(metricsRef.current?.children || [], {
        autoAlpha: 0,
        y: 40,
        duration: 0.9,
        stagger: 0.1,
        ease: "expo.out",
        delay: 0.25,
        scrollTrigger: trigger,
        onStart: () => setVisible(true),
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

    const [fancyboxRoot] = useFancybox();
  const attachFancy = (el) => {
    rootRef.current = el;
    fancyboxRoot(el);
  };

  return (
    <section
      ref={(el) => {
    rootRef.current = el;
    fancyboxRoot(el);
  }}
      className="relative w-full bg-white pt-[15px] pb-[80px] lg:pt-[4.688vw] lg:pb-[4.688vw] overflow-hidden"
      data-section="project-progress"
    >
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="flex lg:absolute left-[12px] top-[30px] lg:left-[4.167vw] lg:top-[4.688vw] flex-col items-center gap-[8px] md:gap-[12px] lg:gap-[1.094vw] w-auto lg:w-[2.813vw] z-[5] max-lg:static max-lg:!w-full max-lg:flex-row max-lg:!justify-center max-lg:items-center max-lg:!gap-[8px] max-lg:mt-[15px] max-lg:mb-[18px]"
        aria-hidden="true"
      >
        <span className="block w-px h-[28px] md:h-[36px] lg:h-[3.125vw] bg-[#ef493d] max-lg:!w-[28px] max-lg:!h-px" />
        <span
          className="font-montserrat font-medium capitalize whitespace-nowrap text-[#ef493d] text-[12px] md:text-[14px] lg:text-[1.25vw] max-lg:[writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] lg:rotate-180"
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {sidebarLabel}
        </span>
      </div>

      <div className="px-5 md:px-12 lg:px-[9.375vw]">
        <SectionHeading
          ref={headingRef}
          className="capitalize text-[#333] leading-[1.08] tracking-[0.022em] text-center
                     text-[34px] xs:text-[38px] sm:text-[48px] md:text-[64px] lg:text-[5vw]"
        >
          {heading}
        </SectionHeading>
        <p
          ref={descRef}
          className="mx-auto mt-[14px] lg:mt-[0.729vw] max-w-[760px] lg:max-w-[49.948vw]
                     text-center text-[#333]
                     text-[14px] leading-[24px]
                     sm:text-[16px] sm:leading-[28px]
                     lg:text-[0.938vw] lg:leading-[1.563vw]"
          style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
          dangerouslySetInnerHTML={{ __html: description }}
        />

        {/* Content row. The charts column is currently disabled, so the slider
            is centred on its own. Restore the two-column grid
            (lg:grid-cols-[37.969vw_minmax(0,1fr)]) when the charts come back. */}
        <div className="mt-[40px] lg:mt-[3.385vw] flex flex-col items-center gap-[36px] lg:gap-[3.333vw]">
          {/* Charts grid — hidden for now */}
          {/* <div
            ref={metricsRef}
            className="min-w-0 grid grid-cols-2 gap-y-[40px] gap-x-[20px]
                       sm:gap-y-[48px] sm:gap-x-[40px]
                       lg:gap-y-[2.604vw] lg:gap-x-[5.26vw]"
          >
            {metrics.map((m) => (
              <div
                key={m.key}
                className="flex flex-col items-center text-center gap-[14px] lg:gap-[1.354vw]"
              >
                <CircularProgress
                  value={visible ? m.value : 0}
                  className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] lg:w-[9.063vw] lg:h-[9.063vw]"
                  strokeWidth={9}
                />
                <div className="flex flex-col gap-[4px] lg:gap-[0.365vw]">
                  <span
                    className="capitalize text-[#555] tracking-[0.025em]
                               text-[18px] sm:text-[22px] lg:text-[1.563vw] leading-[1.15]"
                    style={{
                      fontFamily:
                        '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                      fontWeight: 300,
                    }}
                  >
                    {m.label}
                  </span>
                  {m.sublabel ? (
                    <span
                      className="text-[#555]
                                 text-[12px] sm:text-[14px] lg:text-[1.042vw] leading-[1.4]"
                      style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
                    >
                      {m.sublabel}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div> */}

          {/* Image slider — centred, since it is the only column now */}
          <div
            ref={sliderWrapRef}
            className="relative w-full min-w-0 mx-auto max-w-[560px] lg:max-w-none"
          >
            <Swiper
              modules={[Navigation, Keyboard, A11y, Autoplay]}
              slidesPerView={1}
              spaceBetween={16}
              breakpoints={{
                1024: { slidesPerView: 2, spaceBetween: 24 },
              }}
              speed={650}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              keyboard={{ enabled: true }}
              loop={images.length >= 4}
              rewind={images.length > 1 && images.length < 4}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }}
              navigation={{ prevEl: null, nextEl: null }}
              className="w-full !overflow-hidden rounded-[12px]"
            >
              {images.map((img, idx) => (
                <SwiperSlide key={`${img.src}-${idx}`} className="!h-auto">
                  <div className="relative w-full aspect-[657/639] lg:aspect-auto lg:h-[27.604vw] rounded-[12px] overflow-hidden bg-[#eee]">
                   <a
  href={img.src}
  data-fancybox="progress-gallery"
  data-caption={img.alt || ""}
  className="block w-full h-full"
>
  <Image
    src={img.src}
    alt={img.alt || ""}
    fill
    sizes="(min-width:1024px) 40vw, 100vw"
    className="object-cover object-center select-none"
  />
</a>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <button
              ref={prevRef}
              type="button"
              aria-label="Previous progress photo"
              className="absolute z-[5] top-1/2 -translate-y-1/2
                         left-[10px] sm:left-[16px] lg:left-[1.354vw]
                         inline-flex items-center justify-center rounded-full
                         bg-[#ef493d] text-white shadow-[0_6px_16px_rgba(0,0,0,0.25)]
                         w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] lg:w-[3.092vw] lg:h-[3.092vw]
                         transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-[18px] h-[18px] lg:w-[1.342vw] lg:h-[1.342vw]" />
            </button>
            <button
              ref={nextRef}
              type="button"
              aria-label="Next progress photo"
              className="absolute z-[5] top-1/2 -translate-y-1/2
                         right-[10px] sm:right-[16px] lg:right-[1.354vw]
                         inline-flex items-center justify-center rounded-full
                         bg-[#ef493d] text-white shadow-[0_6px_16px_rgba(0,0,0,0.25)]
                         w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] lg:w-[3.092vw] lg:h-[3.092vw]
                         transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              <ArrowRight className="w-[18px] h-[18px] lg:w-[1.342vw] lg:h-[1.342vw]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
