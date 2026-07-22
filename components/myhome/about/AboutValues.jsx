import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import SectionLabel from "@/components/myhome/SectionLabel";
import { mediaUrl } from "@/lib/strapi";
import RichText from "@/components/common/RichText";
import SectionHeading from "@/components/common/SectionHeading";

function ValueCard({ title, image, body }) {
  return (
    <div className="flex flex-col gap-[20px] md:gap-[28px] lg:gap-[1.875vw] h-full">
      <div className="relative w-full aspect-[500/529] rounded-[6px] lg:rounded-[0.625vw] overflow-hidden">
        {image && (
          <Image
            src={image}
            alt={title}
            fill
            unoptimized
            sizes="(min-width: 1024px) 26vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        )}
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
          <RichText>{body}</RichText>
        </p>
      </div>
    </div>
  );
}

export default function AboutValues({ data }) {
  const VALUES = Array.isArray(data?.items)
    ? data.items.map((v) => ({
        title: v.title || "",
        body: v.body || "",
        image: mediaUrl(v.image),
      }))
    : [];
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

  if (!data || !VALUES.length) return null;

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden
                 py-[60px] md:py-[80px] lg:pt-[4.166vw] lg:pb-[6.51vw]"
    >
      <div className="absolute left-[4.16vw] top-[4.166vw]">
        <SectionLabel>{data.label}</SectionLabel>
      </div>


      <SectionHeading
        ref={headingRef}
        className="text-center text-[#333] capitalize will-change-transform leading-[1.05] tracking-[0.02em] text-[32px] xs:text-[40px] sm:text-[52px] md:text-[64px] lg:text-[5vw] px-7 md:px-10 lg:px-[8.333vw]"
      >
        {data.heading}
      </SectionHeading>

      {/* Desktop: static three-column. Tablet/mobile: Swiper carousel. */}
      <div className="mt-[60px] md:mt-[56px] lg:mt-[3.645vw] px-5 md:px-10 lg:px-[11.146vw]">
        {/* Desktop grid */}
        <div className="hidden lg:grid grid-cols-3 gap-[2.604vw]">
          {VALUES.map((v) => (
            <ValueCard key={v.title} {...v} />
          ))}
        </div>

        {/* Mobile / tablet swiper */}
        <div className="lg:hidden">
          <Swiper
            modules={[Keyboard, A11y, Autoplay]}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            loop={true}
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
