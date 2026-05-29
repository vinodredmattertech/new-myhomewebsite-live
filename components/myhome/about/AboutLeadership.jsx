import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { Quote } from "lucide-react";
import { mediaUrl } from "@/lib/strapi";
import RichText from "@/components/common/RichText";

export default function AboutLeadership({ data }) {
  const rootRef = useRef(null);
  const nameRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      const words = splitToWords(nameRef.current);
      gsap.from(words, {
        yPercent: 110,
        duration: 1.0,
        stagger: 0.06,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });
      gsap.from(cardRef.current, {
        y: 60,
        autoAlpha: 0,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 70%" },
      });
    },
    { scope: rootRef }
  );

  if (!data) return null;

  const portrait = mediaUrl(data.portraitImage);

  return (
    <section
      ref={rootRef}
      className="relative w-full overflow-hidden bg-[#1d1d1d]
                 min-h-[640px] lg:h-[48.7vw]"
    >
      {/* Background portrait */}
      <div className="absolute inset-0 pointer-events-none">
        {portrait && (
          <Image
            src={portrait}
            alt={`${data.name || "Chairman"} — ${data.role || "Chairman, My Home Group"}`}
            fill
            unoptimized
            sizes="100vw"
            className="object-cover object-center select-none"
          />
        )}
        {/* <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/15 to-black/55 lg:from-black/25 lg:via-transparent lg:to-black/70" /> */}
      </div>

      {/* Side label */}
      <div
        className="absolute z-[5] flex flex-col items-center left-[12px] top-[30px] w-[28px] gap-[11px] lg:left-[4.166vw] lg:top-[4.166vw] lg:w-[2.812vw] lg:gap-[1.094vw] text-white"

        aria-hidden="true"
      >
        <span className="block w-px h-[60px] bg-white" />
        <span
          className="font-montserrat font-medium capitalize whitespace-nowrap text-[12px] lg:text-[1.25vw]"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {data.label}
        </span>
      </div>

      {/* Right card */}
      <div className="relative z-[2] h-full min-h-[640px] lg:min-h-0 lg:h-[48.7vw]
                      flex items-center justify-center lg:justify-end
                      px-5 md:px-10 lg:pr-[8.75vw] py-[60px] md:py-[80px] lg:py-0 max-sm:pl-[80px]">
        <div
          ref={cardRef}
          className="relative bg-white rounded-[10px] lg:rounded-[0.625vw] overflow-hidden
                     w-full max-w-[640px] lg:w-[41.66vw] lg:max-w-none
                     px-5 sm:px-8 md:px-12 lg:px-[3.333vw]
                     pt-[40px] md:pt-[56px] lg:pt-[4.687vw]
                     pb-[56px] md:pb-[64px] lg:pb-[4.687vw]"
        >
          <div className="flex flex-col gap-[18px] md:gap-[24px] lg:gap-[1.562vw]">
            <p
              className="capitalize text-[#323232] font-montserrat font-normal
                         text-[14px] sm:text-[16px] md:text-[18px] lg:text-[1.042vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {data.role}
            </p>
            <h3
              ref={nameRef}
              className="text-[#323232] tracking-[0.03em] leading-[1.15] will-change-transform
                         text-[28px] sm:text-[32px] md:text-[36px] lg:text-[2.187vw]"
              style={{
                fontFamily:
                  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                fontWeight: 300,
              }}
            >
              {data.name}
            </h3>
            <div className="h-px w-full bg-[#33333322] my-[6px] lg:my-[0.312vw]" />
            <div
              className="text-[#323232] font-montserrat font-normal text-justify
                         text-[13px] sm:text-[14px] md:text-[16px] lg:text-[0.938vw]
                         leading-[22px] sm:leading-[24px] md:leading-[28px] lg:leading-[1.666vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <RichText>{data.body}</RichText>
            </div>
          </div>

          <Quote
            className="absolute right-[20px] bottom-[20px] lg:right-[1.562vw] lg:bottom-[1.562vw]
                       text-[#ef493d] opacity-30
                       w-[36px] h-[36px] lg:w-[2.604vw] lg:h-[2.604vw]"
            strokeWidth={1.4}
          />
        </div>
      </div>
    </section>
  );
}
