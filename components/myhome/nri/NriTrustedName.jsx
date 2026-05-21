import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import SectionLabel from "@/components/myhome/SectionLabel";
import { mediaUrl } from "@/lib/strapi";
import RichText from "@/components/common/RichText";

export default function NriTrustedName({ data }) {
  const FEATURES = Array.isArray(data?.features)
    ? data.features.map((f) => ({ title: f.title || "", body: f.body || "" }))
    : [];

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const subRef = useRef(null);
  const listRef = useRef(null);
  const imgRef = useRef(null);

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
      gsap.from(subRef.current, {
        y: 24,
        autoAlpha: 0,
        duration: 0.9,
        ease: "expo.out",
        delay: 0.2,
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });
      if (listRef.current) {
        const items = listRef.current.querySelectorAll("[data-feature]");
        gsap.from(items, {
          y: 40,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "expo.out",
          scrollTrigger: { trigger: listRef.current, start: "top 80%" },
        });
      }
      gsap.from(imgRef.current, {
        x: 60,
        autoAlpha: 0,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: imgRef.current, start: "top 80%" },
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
                 py-[60px] md:py-[80px] lg:pt-[5.208vw] lg:pb-[5.208vw]"
      data-section="nri-trusted-name"
    >
      <div className="absolute left-[4.16vw] top-[4.687vw] hidden lg:block">
        <SectionLabel>{data.label}</SectionLabel>
      </div>

      {/* Top centered heading */}
      <div className="px-5 md:px-10 lg:px-[16vw] flex flex-col items-center text-center">
        <h2
          ref={headingRef}
          className="text-[#333] capitalize will-change-transform leading-[1.05] tracking-[0.02em]
                     text-[32px] xs:text-[40px] sm:text-[52px] md:text-[64px] lg:text-[5vw]"
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
            fontWeight: 300,
          }}
        >
          {data.heading}
        </h2>
        <p
          ref={subRef}
          className="font-montserrat font-normal text-[#333] mt-[16px] md:mt-[20px] lg:mt-[0.729vw]
                     text-[14px] sm:text-[15px] md:text-[16px] lg:text-[0.938vw]
                     leading-[24px] sm:leading-[26px] md:leading-[28px] lg:leading-[1.563vw]
                     max-w-[860px] lg:max-w-[53.281vw]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <RichText>{data.subTitle}</RichText>
        </p>
      </div>

      {/* Lower content: features list + image */}
      <div
        className="mt-[40px] md:mt-[56px] lg:mt-[3.125vw]
                   px-5 md:px-10 lg:px-[11.146vw]
                   grid grid-cols-1 lg:grid-cols-12 gap-y-[32px] gap-x-[40px] lg:gap-x-[3.125vw] items-start"
      >
        {/* Features list */}
        <div ref={listRef} className="lg:col-span-7 flex flex-col">
          {FEATURES.map((f, idx) => (
            <div
              key={f.title}
              data-feature
              className={`flex flex-col gap-[10px] lg:gap-[0.625vw] py-[22px] md:py-[28px] lg:py-[2.083vw] ${
                idx !== FEATURES.length - 1
                  ? "border-b border-[rgba(85,85,85,0.15)]"
                  : ""
              } ${idx === 0 ? "pt-[4px] md:pt-[6px] lg:pt-0" : ""}`}
            >
              <h3
                className="text-[#333] leading-[1.2] tracking-[0.01em]
                           text-[24px] sm:text-[28px] md:text-[32px] lg:text-[2.031vw]"
                style={{
                  fontFamily:
                    '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                  fontWeight: 400,
                }}
              >
                {f.title}
              </h3>
              <p
                className="font-montserrat font-normal text-[#5f5f5f]
                           text-[13px] sm:text-[14px] md:text-[16px] lg:text-[0.833vw]
                           leading-[22px] sm:leading-[24px] md:leading-[28px] lg:leading-[1.666vw]
                           max-w-[640px] lg:max-w-[31vw]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                <RichText>{f.body}</RichText>
              </p>
            </div>
          ))}
        </div>

        {/* Image */}
        <div className="lg:col-span-5 w-full">
          <div
            ref={imgRef}
            className="relative w-full aspect-[524/559] rounded-[10px] lg:rounded-[0.625vw] overflow-hidden"
          >
            {image && (
              <Image
                src={image}
                alt="My Home — guided NRI experience"
                fill
                unoptimized
                sizes="(min-width:1024px) 30vw, 100vw"
                className="object-cover object-center select-none"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
