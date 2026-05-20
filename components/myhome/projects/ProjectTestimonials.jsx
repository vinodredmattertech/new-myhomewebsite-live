import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, A11y } from "swiper/modules";
import "swiper/css";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";

const DEFAULT_TESTIMONIALS = [
  {
    quote:
      "Having invested in My Home Avatar previously, choosing Akrida was a natural step. The appreciation in value and the sheer scale of the gated communities they build are unmatched in Hyderabad. The transparency in construction updates is a huge plus.",
    author: "Dr. Srikanth Ega Spine, Hyderabad",
  },
  {
    quote:
      "Location was my primary concern. Being 10 minutes from the Financial District while living in a 39-floor high-rise with 81% open space is the dream. The dual clubhouses ensure my family has plenty of room to relax without the crowds.",
    author: "Mr. Gangula Sudheer, Hyderabad",
  },
  {
    quote:
      "What drew us to Akrida was the focus on wellness. The skywalk, the dedicated pet park, and the safety features for children in a G+39 structure give us complete peace of mind. It's not just a flat; it's a lifestyle upgrade.",
    author: "Mr. Gangula Sudheer, Hyderabad",
  },
  {
    quote:
      "Having invested in My Home Avatar previously, choosing Akrida was a natural step. The appreciation in value and the sheer scale of the gated communities they build are unmatched in Hyderabad. The transparency in construction updates is a huge plus.",
    author: "Dr. Srikanth Ega Spine, Hyderabad",
  },
    {
    quote:
      "Having invested in My Home Avatar previously, choosing Akrida was a natural step. The appreciation in value and the sheer scale of the gated communities they build are unmatched in Hyderabad. The transparency in construction updates is a huge plus.",
    author: "Dr. Srikanth Ega Spine, Hyderabad",
  },
    {
    quote:
      "Having invested in My Home Avatar previously, choosing Akrida was a natural step. The appreciation in value and the sheer scale of the gated communities they build are unmatched in Hyderabad. The transparency in construction updates is a huge plus.",
    author: "Dr. Srikanth Ega Spine, Hyderabad",
  },
    {
    quote:
      "Having invested in My Home Avatar previously, choosing Akrida was a natural step. The appreciation in value and the sheer scale of the gated communities they build are unmatched in Hyderabad. The transparency in construction updates is a huge plus.",
    author: "Dr. Srikanth Ega Spine, Hyderabad",
  },
];

export default function ProjectTestimonials({
  sidebarLabel = "Voices Of The Community",
  heading = "Trust Built On Delivery",
  description = "More than just a name, \"My Home\" represents quality living. Read testimonials from residents and investors who've experienced our dedication.",
  testimonials = DEFAULT_TESTIMONIALS,
}) {
  const rootRef = useRef(null);
  const sidebarRef = useRef(null);
  const headingRef = useRef(null);
  const descRef = useRef(null);
  const navRef = useRef(null);
  const sliderRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

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

      gsap.from([sidebarRef.current, descRef.current, navRef.current], {
        autoAlpha: 0,
        y: 24,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.1,
        delay: 0.15,
        scrollTrigger: trigger,
      });

      gsap.from(sliderRef.current, {
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

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-[#2a2828] pt-[80px] pb-[80px] lg:pt-[4.167vw] lg:pb-[5.208vw] overflow-hidden"
      data-section="project-testimonials"
    >
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="hidden lg:flex absolute left-[4.167vw] top-[4.167vw] flex-col items-center gap-[1.094vw] w-[2.813vw]"
        aria-hidden="true"
      >
        <span className="block h-[3.125vw] w-px bg-white/70" />
        <span className="flex items-center justify-center h-[16.51vw] w-[1.51vw]">
          <span
            className="-rotate-90 whitespace-nowrap capitalize text-white text-[1.25vw]"
            style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}
          >
            {sidebarLabel}
          </span>
        </span>
      </div>

      {/* Top row: heading + nav */}
      <div className="px-5 md:px-12 lg:pl-[11.146vw] lg:pr-[9.375vw]">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-[24px] lg:gap-[3.125vw]">
          <div className="flex flex-col gap-[16px] lg:gap-[1.198vw] lg:max-w-[41.927vw]">
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
            <p
              ref={descRef}
              className="text-white text-justify
                         text-[14px] leading-[24px]
                         sm:text-[16px] sm:leading-[28px]
                         lg:text-[0.938vw] lg:leading-[1.563vw]
                         lg:max-w-[39.531vw]"
              style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
            >
              {description}
            </p>
          </div>

          <div
            ref={navRef}
            className="flex items-center gap-[12px] lg:gap-[1.042vw] lg:pt-[2.604vw]"
          >
            <button
              ref={prevRef}
              type="button"
              aria-label="Previous testimonial"
              className="relative inline-flex items-center justify-center
                         w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] lg:w-[3.646vw] lg:h-[3.646vw]
                         transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              <Image
                src="/assets/myhome/projects/testimonial-arrow.svg"
                alt=""
                fill
                sizes="56px"
                className="select-none pointer-events-none -scale-x-100"
              />
            </button>
            <button
              ref={nextRef}
              type="button"
              aria-label="Next testimonial"
              className="relative inline-flex items-center justify-center
                         w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] lg:w-[3.646vw] lg:h-[3.646vw]
                         transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              <Image
                src="/assets/myhome/projects/testimonial-arrow.svg"
                alt=""
                fill
                sizes="56px"
                className="select-none pointer-events-none"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Swiper */}
      <div
        ref={sliderRef}
        className="mt-[40px] lg:mt-[3.385vw] pl-5 md:pl-12 lg:pl-[8.438vw]"
      >
        <Swiper
          modules={[Navigation, Keyboard, A11y]}
          slidesPerView={1.05}
          spaceBetween={24}
          speed={700}
          keyboard={{ enabled: true }}
          rewind={true}
          // loop={true}
          watchSlidesProgress={true}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          navigation={{ prevEl: null, nextEl: null }}
          breakpoints={{
            640: { slidesPerView: 1.6, spaceBetween: 36 },
            768: { slidesPerView: 2.2, spaceBetween: 60 },
            1024: { slidesPerView: 3.2, spaceBetween: 96 },
            1440: { slidesPerView: 3.4, spaceBetween: 132 },
          }}
          className="!overflow-visible"
        >
          {testimonials.map((t, idx) => (
            <SwiperSlide key={`${t.author}-${idx}`} className="!h-auto">
              <article className="relative h-full pl-[28px] sm:pl-[36px] lg:pl-[3.125vw] flex flex-col">
                {/* Left vertical divider */}
                <span
                  className="absolute left-0 top-[12px] bottom-[12px] w-px bg-white/30"
                  aria-hidden="true"
                />

                {/* Quote icon */}
                <span
                  className="relative inline-block shrink-0
                             w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] lg:w-[1.875vw] lg:h-[1.875vw]"
                  aria-hidden="true"
                >
                  <Image
                    src="/assets/myhome/projects/testimonial-quote.svg"
                    alt=""
                    fill
                    sizes="32px"
                    className="select-none pointer-events-none"
                  />
                </span>

                <p
                  className="mt-[24px] lg:mt-[2.292vw] text-white
                             text-[15px] leading-[28px]
                             sm:text-[17px] sm:leading-[32px]
                             lg:text-[1.042vw] lg:leading-[1.875vw]
                             lg:max-w-[20.052vw]"
                  style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
                >
                  {t.quote}
                </p>

                <p
                  className="mt-auto pt-[32px] lg:pt-[3.385vw] text-white capitalize
                             text-[18px] sm:text-[22px] lg:text-[1.354vw] leading-[1.2]"
                  style={{
                    fontFamily:
                      '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                    fontWeight: 400,
                  }}
                >
                  {t.author}
                </p>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
