import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { mediaUrl } from "@/lib/strapi";
import SectionLabel from "@/components/myhome/SectionLabel";

/**
 * SustainabilityOverview — the "Green Building Pioneers" intro band.
 *
 * Layout matches the Figma: a vertical red side-label on the far left, a tall
 * photo on the left and a large serif heading + justified body copy on the
 * right. Copy is CMS richtext (rendered as HTML). Reveals on scroll.
 */
export default function SustainabilityOverview({
  label,
  heading,
  description,
  image,
  imageAlt,
}) {
  const sideLabel = label || "Sustainability Overview";
  const title = heading || "Green Building Pioneers";
  const imageUrl = mediaUrl(image);
  const alt = imageAlt || title;

  const rootRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      gsap.registerPlugin(ScrollTrigger);

      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const targets = rootRef.current?.querySelectorAll("[data-reveal]");
      if (targets?.length && !reduce) {
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
      data-section="sustainability-overview"
      className="relative w-full overflow-hidden bg-white text-[#333]
                 pt-[56px] pb-[48px] lg:pt-[4.687vw] lg:pb-[4.687vw]"
    >
      <SectionLabel
        className="absolute z-[5] left-[16px] top-[56px] lg:left-[4.166vw] lg:top-[4.687vw]"
        color="#ef493d"
      >
        {sideLabel}
      </SectionLabel>

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-[11.146vw]">
        <div className="flex max-lg:flex-col max-2xl:gap-[5vw] items-center justify-center">
          {/* Left — image */}
          <div
            data-reveal
            className="relative w-full overflow-hidden rounded-[4px] order-2 lg:order-1
                       h-[280px] sm:h-[360px] md:mt-[6vw] lg:h-[29.53vw]"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={alt}
                width={774}
                height={567}
                unoptimized
                sizes="md:w-[40.313vw]  md:h-[29.531vw]"
                className="object-cover object-center"
              />
            ) : null}
          </div>

          {/* Right — heading + copy */}
          <div className="order-1 lg:pb-[10vw] pb-6 lg:order-2">
            <h2
              data-reveal
              className="leading-[1.05] text-[40px] sm:text-[56px] md:text-[68px] lg:text-[5vw]"
              style={{
                fontFamily:
                  '"Tartuffo_Trial_Light","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                fontWeight: 300,
                letterSpacing: "0.02em",
              }}
            >
              {title}
            </h2>

            {description ? (
              <div
                data-reveal
                className="sus-richtext mt-[24px] lg:mt-[2.448vw] lg:max-w-[29.01vw] text-[#6d6d6d]
                           text-[15px] leading-[1.9] text-justify lg:text-[0.937vw] lg:leading-[1.9vw]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : null}
          </div>
        </div>
      </div>

      <style jsx>{`
        .sus-richtext :global(p) {
          margin-bottom: 1em;
        }
        .sus-richtext :global(p:last-child) {
          margin-bottom: 0;
        }
      `}</style>
    </section>
  );
}
