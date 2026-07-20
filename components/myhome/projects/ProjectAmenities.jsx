import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, A11y } from "swiper/modules";
import "swiper/css";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import useFancybox from "@/components/common/useFancybox";
import { cleanImage } from "@/components/ImageHandle";
import SectionHeading from "@/components/common/SectionHeading";

// const DEFAULT_AMENITIES = [
//   {
//     title: "Infinity Pool & Deck",
//     image: "/assets/myhome/projects/amenity-pool.jpg",
//   },
//   {
//     title: "Open-Air Amphitheatre",
//     image: "/assets/myhome/projects/amenity-amphitheatre.jpg",
//   },
//   {
//     title: "Sports Zone Multipurpose Court",
//     image: "/assets/myhome/projects/amenity-sports.jpg",
//   },
//   {
//     title: "Infinity Pool & Deck",
//     image: "/assets/myhome/projects/amenity-pool.jpg",
//   },
//   {
//     title: "Open-Air Amphitheatre",
//     image: "/assets/myhome/projects/amenity-amphitheatre.jpg",
//   },
//   {
//     title: "Sports Zone Multipurpose Court",
//     image: "/assets/myhome/projects/amenity-sports.jpg",
//   },
// ];

export default function ProjectAmenities({
  sidebarLabel = "The Luxury Of Choice",
  heading = "Modern Living, Elevated",
  description = "To ensure a seamless experience for over 3,000 families, the amenities are divided into two distinct world-class clubhouses Cotta and Terra comprising over 100,000 sq. ft. of curated leisure space.",
  data,
  // Each card is an image tile, so items left without an image in the CMS are
  // skipped rather than rendered as an empty (and next/image-crashing) slide.
  amenities = (data?.items || []).filter(
    (a) => a?.image?.data?.attributes?.url
  ),
}) {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const descRef = useRef(null);
  const sidebarRef = useRef(null);
  const sliderRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
console.log(amenities[0]?.image?.data?.attributes?.url,"amenties")
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

      gsap.from(sliderRef.current, {
        autoAlpha: 0,
        y: 60,
        duration: 1.1,
        ease: "expo.out",
        delay: 0.25,
        scrollTrigger: trigger,
      });
    },
    { scope: rootRef },
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
      className="relative w-full bg-white pt-[80px] pb-[80px] lg:pt-[4.688vw] lg:pb-[4.688vw] overflow-hidden"
      data-section="project-amenities"
    >
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="flex absolute left-[12px] top-[30px] lg:left-[4.167vw] lg:top-[0.688vw] flex-col items-center gap-[8px] md:gap-[12px] lg:gap-[1.094vw] w-auto lg:w-[2.813vw] z-[5]"
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
      <div className="px-5 md:px-12 lg:px-[9.375vw] max-sm:pl-[35px]">
        <SectionHeading
          ref={headingRef}
          className="capitalize text-[#333] leading-[1.08] tracking-[0.022em] text-center
                     text-[34px] xs:text-[38px] sm:text-[48px] md:text-[64px] lg:text-[5vw]"
        >
          {data?.heading}
        </SectionHeading>
        <p
          ref={descRef}
          className="mx-auto mt-[14px] lg:mt-[0.729vw] max-w-[760px] lg:max-w-[53.281vw]
                     text-center text-[#333]
                     text-[14px] leading-[24px]
                     sm:text-[16px] sm:leading-[28px]
                     lg:text-[0.938vw] lg:leading-[1.563vw]"
          style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
          dangerouslySetInnerHTML={{ __html: data?.description }}
        />
      </div>
      <div ref={sliderRef} className="mt-[40px] lg:mt-[3.802vw] w-full">
        <Swiper
          modules={[Navigation, Keyboard, A11y]}
          slidesPerView={1.05}
          spaceBetween={16}
          centeredSlides
          loop={amenities.length > 3}
          keyboard={{ enabled: true }}
          speed={700}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          navigation={{ prevEl: null, nextEl: null }}
          breakpoints={{
            640: { slidesPerView: 1.3, spaceBetween: 18 },
            768: { slidesPerView: 1.6, spaceBetween: 20 },
            1024: { slidesPerView: 1.95, spaceBetween: 22 },
          }}
          className="amenities-swiper !overflow-visible"
        >
          {amenities.map((a, idx) => (
            <SwiperSlide key={`${a.title}-${idx}`} className="!h-auto">
              {({ isActive }) => (
                <div
                  className={`relative w-full rounded-[12px] overflow-hidden
                              aspect-[795/532]
                              transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                              ${isActive ? "scale-100" : "scale-[0.9]"}`}
                >
                  <a
                    href={cleanImage(a?.image?.data?.attributes?.url)}
                    data-fancybox="amenities-gallery"
                    data-caption={a.title}
                    className="block w-full h-full"
                  >
                    <Image
                      src={cleanImage(a?.image?.data?.attributes?.url)}
                      alt={a?.image?.data?.attributes?.alternativeText}
                      fill
                      unoptimized
                      sizes="(min-width:1024px) 42vw, (min-width:640px) 60vw, 90vw"
                      className="object-cover object-center select-none"
                    />
                  </a>
                  <div
                    className={`absolute bottom-[16px] sm:bottom-[24px] lg:bottom-[1.979vw]
                                left-[16px] sm:left-[24px] lg:left-[1.979vw]
                                inline-flex items-center justify-center
                                rounded-full px-[16px] sm:px-[22px] lg:px-[1.354vw]
                                h-[34px] sm:h-[40px] lg:h-[2.229vw]
                                transition-all duration-500
                                ${
                                  isActive
                                    ? "bg-white/70 backdrop-blur-[2px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]"
                                    : "bg-white"
                                }`}
                  >
                    <span
                      className="capitalize text-[#333] whitespace-nowrap
                                 text-[13px] sm:text-[15px] lg:text-[0.911vw]"
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 400,
                      }}
                    >
                      {a.title}
                    </span>
                  </div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Nav buttons */}
        <div className="mt-[28px] lg:mt-[2.083vw] flex items-center justify-center gap-[12px] lg:gap-[0.833vw]">
          <button
            ref={prevRef}
            type="button"
            aria-label="Previous amenity"
            className="inline-flex items-center justify-center rounded-full
                       bg-[#ef493d] text-white
                       w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] lg:w-[2.938vw] lg:h-[2.938vw]
                       transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-[18px] h-[18px] lg:w-[1.276vw] lg:h-[1.276vw]" />
          </button>
          <button
            ref={nextRef}
            type="button"
            aria-label="Next amenity"
            className="inline-flex items-center justify-center rounded-full
                       bg-[#ef493d] text-white
                       w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] lg:w-[2.938vw] lg:h-[2.938vw]
                       transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            <ArrowRight className="w-[18px] h-[18px] lg:w-[1.276vw] lg:h-[1.276vw]" />
          </button>
        </div>
      </div>
    </section>
  );
}
