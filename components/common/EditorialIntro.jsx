"use client";

import React from "react";
import Image from "next/image";
import AnimatedHeading from "@/components/common/AnimatedHeading";

export default function EditorialIntro({
  heading,
  paragraphs = [],
  imageSrc,
  imageAlt = "editorial image",
  decoSrc = "/icons/flw.svg",
  butterfly = "/icons/bf.gif",
}) {
  return (
    <section className="relative w-full overflow-hidden containerx containery">
      
      {/* Floral */}
      {decoSrc && (
        <div className="pointer-events-none absolute right-0 top-[6vw] opacity-70">
          <Image
            src={decoSrc}
            alt="decoration"
            width={260}
            height={260}
            className="w-[140px] sm:w-[180px] lg:w-[9.74vw] h-auto"
          />
        </div>
      )}

      {/* Butterfly */}
      {butterfly && (
        <div className="pointer-events-none absolute right-[7%] top-[4vw] mix-blend-multiply opacity-70">
          <Image
            src={butterfly}
            alt="decoration"
            width={260}
            height={260}
            className="w-[90px] sm:w-[3.7vw] lg:w-[4.792vw] h-auto"
          />
        </div>
      )}

      {/* Heading */}
      <div className="flex justify-center text-center">
        <AnimatedHeading
          as="h2"
          className="heading text-[#7B766C] italic"
          text={heading}
        />
      </div>

      {/* Flex Content */}
      <div
        className="
          mt-12 sm:mt-14 lg:mt-[4.5vw]
          flex flex-col
          lg:flex-row
          items-center
          justify-between
          gap-10 lg:gap-[8.281vw] 
        "
      >
        {/* LEFT TEXT */}
        <div className="w-full  h-auto">
          <div className="space-y-6 sm:space-y-7 lg:space-y-[1.6vw]">
            {paragraphs.map((p, idx) => (
              <p
                key={idx}
                className="
                  text-[#6B6B6B]
                  leading-relaxed
                  text-[15px] sm:text-[16px]
                  lg:text-[1.05vw]
                  Avenir
                "
              >
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="w-full flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[560px] lg:max-w-none">
            
            <div className="relative overflow-hidden rounded-[14px]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={1200}
                height={850}
                className="
                  w-full object-cover
                  h-[240px] sm:h-[320px]
                  lg:w-[31.823vw]
                  lg:h-[22.656vw]
                "
                priority
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}