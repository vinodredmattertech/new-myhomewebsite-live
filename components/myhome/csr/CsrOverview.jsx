import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { mediaUrl } from "@/lib/strapi";

/**
 * CsrOverview — the "Building Beyond Homes" intro band.
 *
 * Layout matches the design: a vertical red side-label, a large serif heading
 * and body copy on the left, and a tall photo on the right. Copy is CMS
 * richtext (rendered as HTML). Reveals on scroll.
 */
export default function CsrOverview({ label, heading, description, image }) {
  const sideLabel = label || "Our CSR Initiatives";
  const title = heading || "Building Beyond Homes";
  const imageUrl = mediaUrl(image) || "/assets/myhome/whoweare-color.jpg";

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
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 78%",
          },
        });
      }
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      data-section="csr-overview"
      className="relative w-full overflow-hidden bg-white text-[#1b1a1a]
                 pt-[26px] pb-[8px] lg:pt-[5.208vw] lg:pb-[4.166vw]"
    >
      {/* Vertical side label */}
      <div
        className="lg:absolute z-[5] flex flex-col items-center
                   left-[20px] top-[64px] gap-[11px] w-[28px] max-sm:left-[10px]
                   lg:left-[4.166vw] lg:top-[5.4vw] lg:w-[2.812vw] lg:gap-[1.094vw] max-lg:static max-lg:!w-full max-lg:flex-row max-lg:!justify-center max-lg:items-center max-lg:!gap-[8px] max-lg:mt-[15px] max-lg:mb-[18px]"
        style={{ color: "rgb(239, 73, 61)" }}
      >
        <span
          className="block w-px h-[31px] lg:h-[3.125vw] max-lg:!w-[28px] max-lg:!h-px"
          style={{ background: "rgb(239, 73, 61)" }}
        />
        <span
          className="font-medium capitalize whitespace-nowrap text-[12px] lg:text-[1.25vw] max-lg:[writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] lg:rotate-180"
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {sideLabel}
        </span>
      </div>

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-[11.146vw]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.62fr] gap-[32px] lg:gap-[3.125vw] items-center">
          {/* Left — heading + copy */}
          <div>
            <h2
              data-reveal
              className="leading-[1.1] text-[34px] sm:text-[44px] md:text-[52px] lg:text-[3.333vw]"
              style={{
                fontFamily:
                  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                fontWeight: 300,
              }}
            >
              {title}
            </h2>

            {description ? (
              <div
                data-reveal
                className="csr-richtext mt-[20px] lg:mt-[1.667vw] max-w-[44ch] text-black/65
                           font-montserrat text-[14px] leading-[1.85] lg:text-[0.937vw]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : null}
          </div>

          {/* Right — image */}
          <div
            data-reveal
            className="relative w-full overflow-hidden rounded-[4px]
                       h-[220px] sm:h-[280px] lg:h-[18.75vw]"
          >
            <Image
              src={imageUrl}
              alt={title}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .csr-richtext :global(p) {
          margin-bottom: 1em;
        }
        .csr-richtext :global(p:last-child) {
          margin-bottom: 0;
        }
      `}</style>
    </section>
  );
}
