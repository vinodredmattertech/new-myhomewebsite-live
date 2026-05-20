import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, A11y } from "swiper/modules";
import "swiper/css";
import SectionLabel from "@/components/myhome/SectionLabel";

const VALUES = [
  {
    title: "Commitment",
    image: "/assets/myhome/about/value-commitment.jpg",
    body: "To provide the highest quality construction and the best of amenities with on-time delivery to delight our customers.",
  },
  {
    title: "Quality",
    image: "/assets/myhome/about/value-quality.jpg",
    body: "In creating elegant and perfect spaces, supported by flawless planning and matchless service.",
  },
  {
    title: "Integrity",
    image: "/assets/myhome/about/value-integrity.jpg",
    body: "In uplifting domain standards with global best practices, backed by a legacy of benchmarks in real estate.",
  },
];

function ValueCard({ title, image, body }) {
  return (
    <div className="flex flex-col gap-[20px] md:gap-[28px] lg:gap-[1.875vw] h-full">
      <div className="relative w-full aspect-[500/529] rounded-[6px] lg:rounded-[0.625vw] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 26vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-[10px] md:gap-[14px] lg:gap-[0.781vw]">
        <h3
          className="capitalize text-[#333] tracking-[0.03em] leading-[1.15]
                     text-[26px] sm:text-[32px] md:text-[38px] lg:text-[2.343vw]"
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
            fontWeight: 300,
          }}
        >
          {title}
        </h3>
        <p
          className="font-montserrat font-normal text-[#454545]
                     text-[13px] sm:text-[14px] md:text-[15px] lg:text-[0.833vw]
                     leading-[22px] sm:leading-[24px] md:leading-[26px] lg:leading-[1.458vw]
                     max-w-[495px] lg:max-w-[25.78vw]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {body}
        </p>
      </div>
    </div>
  );
}

export default function AboutValues() {
  const rootRef = useRef(null);
  const headingRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      const words = splitToWords(headingRef.current);
      gsap.from(words, {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.06,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden
                 py-[60px] md:py-[80px] lg:pt-[4.166vw] lg:pb-[6.51vw]"
    >
      <div className="absolute left-[4.16vw] top-[4.166vw] hidden lg:block">
        <SectionLabel>Values of the Brand</SectionLabel>
      </div>

      <h2
        ref={headingRef}
        className="text-[#333] capitalize will-change-transform leading-[1.05] tracking-[0.02em]
                   text-[32px] xs:text-[40px] sm:text-[52px] md:text-[64px] lg:text-[5vw]
                   px-5 md:px-10 lg:px-[11.146vw] max-w-[1100px] lg:max-w-[57.291vw]"
        style={{
          fontFamily:
            '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
          fontWeight: 300,
        }}
      >
        The Principles That Define Us
      </h2>

      {/* Desktop: static three-column. Tablet/mobile: Swiper carousel. */}
      <div className="mt-[40px] md:mt-[56px] lg:mt-[3.645vw] px-5 md:px-10 lg:px-[11.146vw]">
        {/* Desktop grid */}
        <div className="hidden lg:grid grid-cols-3 gap-[2.604vw]">
          {VALUES.map((v) => (
            <ValueCard key={v.title} {...v} />
          ))}
        </div>

        {/* Mobile / tablet swiper */}
        <div className="lg:hidden">
          <Swiper
            modules={[Keyboard, A11y]}
            spaceBetween={20}
            slidesPerView={1.05}
            keyboard={{ enabled: true }}
            breakpoints={{
              640: { slidesPerView: 1.6, spaceBetween: 28 },
              768: { slidesPerView: 2.2, spaceBetween: 32 },
            }}
          >
            {VALUES.map((v) => (
              <SwiperSlide key={v.title} className="!h-auto">
                <ValueCard {...v} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
