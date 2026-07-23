import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { mediaUrl } from "@/lib/strapi";

const RED = "#ef493d";
const TARTUFFO =
  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif';

const DEFAULT_DESCRIPTION =
  "<p>At My Home Constructions, every landmark begins with people who bring ideas, expertise, and purpose to their work. We create an environment where collaboration is encouraged, responsibilities are meaningful, and every role contributes to shaping better communities.</p><p>Whether you work in design, engineering, sales, customer experience, finance, or project delivery, you become part of a team committed to quality, integrity, and continuous improvement.</p>";

/**
 * CareerWhy — the "A Place to Build, Learn and Lead" band (Career page,
 * section 2).
 *
 * Layout mirrors the Figma design: a vertical red "Why My Home" side-label, a
 * large centred serif heading, then a two-column row — editorial copy on the
 * left, a tall supporting photo on the right. Every field is CMS-driven
 * (career-page.why) with built-in fallbacks. Reveals on scroll.
 */
export default function CareerWhy({ section }) {
  const sideLabel = section?.sideLabel || "Why My Home";
  const heading = section?.heading || "A Place to Build, Learn and Lead";
  const description = section?.description || DEFAULT_DESCRIPTION;
  const imageUrl = mediaUrl(section?.image) || "/assets/myhome/whoweare-color.jpg";
  const imageAlt = section?.imageAlt || heading;

  const rootRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      gsap.registerPlugin(ScrollTrigger);

      const targets = rootRef.current?.querySelectorAll("[data-reveal]");
      if (targets?.length) {
        gsap.from(targets, {
          y: 40,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.12,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
        });
      }
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      data-section="career-why"
      className="relative w-full overflow-hidden bg-white text-[#333]
                 pt-[48px] pb-[56px] lg:pt-[4.688vw] lg:pb-[4.688vw]"
    >
      {/* Vertical side label */}
      <div
        className="absolute z-[5] flex flex-col items-center
                   left-[8px] top-[22px] w-[18px] gap-[10px]
                   lg:left-[4.166vw] lg:top-[4.688vw] lg:w-[2.812vw] lg:gap-[1.094vw]"
        style={{ color: RED }}
      >
        <span className="block w-px h-[26px] lg:h-[3.125vw]" style={{ background: RED }} />
        <span
          className="font-medium capitalize whitespace-nowrap text-[11px] lg:text-[1.25vw]"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {sideLabel}
        </span>
      </div>

      {/* Heading */}
      <h2
        data-reveal
        className="text-center capitalize leading-[1.1] tracking-[0.02em] px-5
                   text-[32px] xs:text-[40px] sm:text-[56px] md:text-[72px] lg:text-[5vw]"
        style={{ fontFamily: TARTUFFO, fontWeight: 300 }}
      >
        {heading}
      </h2>

      {/* Two-column body */}
      <div className="mt-[36px] lg:mt-[3.125vw] px-5 md:px-10 lg:px-[11.146vw]">
        <div className="grid grid-cols-1 lg:grid-cols-[35.833vw_1fr] gap-[32px] lg:gap-[8.072vw] items-center">
          <div
            data-reveal
            className="font-montserrat text-[#323232] text-justify
                       text-[15px] sm:text-[16px] lg:text-[0.938vw]
                       leading-[28px] sm:leading-[30px] lg:leading-[1.771vw]
                       [&>p]:mb-[18px] lg:[&>p]:mb-[1.25vw] [&>p:last-child]:mb-0"
            style={{ fontFamily: "Montserrat, sans-serif" }}
            dangerouslySetInnerHTML={{ __html: description }}
          />

          <div
            data-reveal
            className="relative w-full overflow-hidden rounded-[8px] lg:rounded-[0.417vw] aspect-[749/477]"
          >
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 39vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
