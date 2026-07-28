import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { pillarImage } from "@/lib/sustainabilityPillars";
import SectionLabel from "@/components/myhome/SectionLabel";
import SectionHeading from "@/components/common/SectionHeading";

/**
 * PillarCommitment — the opening band of an ESG pillar detail page.
 *
 * Mirrors the Sustainability overview treatment: a serif heading over the
 * commitment statement on the left, a tall supporting image on the right, and
 * an optional pull quote set against the brand rule. The statement is rich text
 * from Strapi, so paragraph/emphasis markup authored in the admin survives.
 */
export default function PillarCommitment({ commitment, fallback, accent }) {
  const label = commitment?.label || fallback?.label || "Our Commitment";
  const heading = commitment?.heading || fallback?.heading;
  const description = commitment?.description || fallback?.description;
  const quote = commitment?.quote || fallback?.quote;
  const imageUrl = pillarImage(commitment?.image, fallback?.image);
  const imageAlt = commitment?.imageAlt || fallback?.imageAlt || heading || "";

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
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 78%" },
        });
      }
    },
    { scope: rootRef }
  );

  if (!heading && !description) return null;

  return (
    <section
      ref={rootRef}
      data-section="sustainability-pillar-commitment"
      className="relative w-full overflow-hidden bg-white text-[#333]
                 pt-[26px] pb-[48px] lg:pt-[4.687vw] lg:pb-[4.687vw]"
    >
      <SectionLabel
        className="lg:absolute z-[5] left-[16px] top-[56px] lg:left-[4.166vw] lg:top-[4.687vw] max-lg:static max-lg:w-full max-lg:mt-[15px] max-lg:mb-[18px]"
        color={accent}
      >
        {label}
      </SectionLabel>

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-[11.146vw]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.78fr] gap-[36px] lg:gap-[4.166vw] items-start">
          {/* Left — heading, statement, pull quote */}
          <div className="flex flex-col">
            {heading ? (
              <SectionHeading
                data-reveal
                className="leading-[1.1] tracking-[0.02em]
                           text-[34px] sm:text-[46px] md:text-[56px] lg:text-[3.646vw]"
              >
                {heading}
              </SectionHeading>
            ) : null}

            {description ? (
              <div
                data-reveal
                className="pillar-richtext mt-[22px] lg:mt-[1.667vw] max-w-[62ch] text-[#5f5f5f]
                           text-[15px] leading-[1.75] lg:text-[0.937vw] lg:leading-[1.667vw]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : null}

            {quote ? (
              <blockquote
                data-reveal
                className="mt-[28px] lg:mt-[2.083vw] max-w-[46ch] border-l pl-[20px] lg:pl-[1.302vw]
                           text-[#333] text-[19px] leading-[1.4] sm:text-[22px] lg:text-[1.458vw]"
                style={{
                  borderColor: accent,
                  fontFamily:
                    '"Tartuffo_Trial_Light","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                  fontWeight: 300,
                  letterSpacing: "0.02em",
                }}
              >
                {quote}
              </blockquote>
            ) : null}
          </div>

          {/* Right — supporting image */}
          {imageUrl ? (
            <div
              data-reveal
              className="relative w-full overflow-hidden rounded-[12px]
                         h-[280px] sm:h-[400px] lg:h-[31.25vw]"
            >
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 34vw"
                className="object-cover object-center"
              />
            </div>
          ) : null}
        </div>
      </div>

      <style jsx>{`
        .pillar-richtext :global(p) {
          margin-bottom: 1em;
        }
        .pillar-richtext :global(p:last-child) {
          margin-bottom: 0;
        }
        .pillar-richtext :global(a) {
          text-decoration: underline;
        }
        .pillar-richtext :global(ul),
        .pillar-richtext :global(ol) {
          margin-bottom: 1em;
          padding-left: 1.2em;
          list-style: revert;
        }
        .pillar-richtext :global(strong) {
          font-weight: 600;
          color: #333;
        }
      `}</style>
    </section>
  );
}
