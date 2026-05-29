import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import SectionLabel from "@/components/myhome/SectionLabel";
import { mediaUrl } from "@/lib/strapi";
import RichText from "@/components/common/RichText";

export default function AboutLegacy({ data }) {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const paraRef = useRef(null);
  const imgWrapRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      const words = splitToWords(headingRef.current);
      gsap.from(words, {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.07,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
      });
      gsap.from(paraRef.current, {
        y: 40,
        autoAlpha: 0,
        duration: 1.0,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });
      gsap.from(imgWrapRef.current, {
        y: 60,
        autoAlpha: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: imgWrapRef.current, start: "top 85%" },
      });
    },
    { scope: rootRef }
  );

  if (!data) return null;

  const image = mediaUrl(data.image);

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden
                 py-[60px] md:py-[80px] lg:pt-[4.687vw] lg:pb-[5.208vw]"
    >
      <div className="absolute left-[4.16vw] top-[4.687vw]">
        <SectionLabel>{data.label}</SectionLabel>
      </div>


      <div className="max-sm:pl-[80px] pr-5 md:px-10 lg:px-[11.146vw] grid grid-cols-1 lg:grid-cols-12 gap-y-[24px] gap-x-[40px] lg:gap-x-[4.166vw] items-start">
        <h2
          ref={headingRef}
          className="lg:col-span-6 text-[#333] capitalize will-change-transform leading-[1.05] tracking-[0.02em]
                     text-[34px] xs:text-[40px] sm:text-[52px] md:text-[64px] lg:text-[5vw]"
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
            fontWeight: 300,
          }}
        >
          {data.heading}
        </h2>
        <p
          ref={paraRef}
          className="lg:col-span-6 font-montserrat font-normal text-[#6d6d6d] text-justify
                     text-[14px] sm:text-[15px] md:text-[16px] lg:text-[0.938vw]
                     leading-[24px] sm:leading-[26px] md:leading-[28px] lg:leading-[1.77vw]
                     lg:pt-[6vw]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <RichText>{data.body}</RichText>
        </p>
      </div>

      <div
        ref={imgWrapRef}
        className="mx-auto mt-[40px] md:mt-[56px] lg:mt-[3.125vw]
                   w-[calc(100%-40px)] sm:w-[calc(100%-80px)] lg:w-[80.208vw]
                   aspect-[1540/725] rounded-[6px] lg:rounded-[0.625vw] overflow-hidden relative"
      >
        {image && (
          <Image
            src={image}
            alt={data.heading || "A family welcomed home by My Home Group"}
            fill
            unoptimized
            sizes="(min-width: 1024px) 80vw, 100vw"
            className="object-cover object-center"
          />
        )}
      </div>
    </section>
  );
}
