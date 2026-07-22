import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import SectionLabel from "@/components/myhome/SectionLabel";

const BODY_FONT = { fontFamily: "Montserrat, sans-serif" };

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * LegalContent — the document body for the Privacy Policy / Terms pages.
 *
 * `content` is a Strapi richtext field, so it arrives as an HTML string and is
 * injected with dangerouslySetInnerHTML. Typography for the injected markup
 * (headings, lists, tables, links) lives in the `.legal-content` block in
 * globals.css, since Tailwind classes can't reach editor-authored nodes.
 */
export default function LegalContent({ label, heading, lastUpdated, content }) {
  const rootRef = useRef(null);
  const formattedDate = formatDate(lastUpdated);

  useGSAP(
    () => {
      registerGsap();
      gsap.registerPlugin(ScrollTrigger);

      const targets = rootRef.current?.querySelectorAll("[data-reveal]");
      if (targets?.length) {
        gsap.from(targets, {
          y: 36,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 82%" },
        });
      }
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      data-section="legal-content"
      className="relative w-full bg-white text-[#1b1a1a]
                 pt-[44px] pb-[56px] lg:pt-[4.166vw] lg:pb-[5.208vw]"
    >
      {/* Vertical side label — desktop only, same rail as the other sections */}
      {label && (
        <div className="absolute left-[4.166vw] top-[4.4vw] z-[5] hidden lg:block">
          <SectionLabel>{label}</SectionLabel>
        </div>
      )}

      <div className="px-5 md:px-12 lg:px-[9.323vw]">
        <div className="max-w-[900px] lg:max-w-[62vw]">
          {heading && (
            <h2
              className="font-montserrat font-medium capitalize text-[#333]
                         text-[20px] sm:text-[24px] lg:text-[1.35vw] leading-[1.3]"
              style={BODY_FONT}
              data-reveal
            >
              {heading}
            </h2>
          )}

          {formattedDate && (
            <p
              className="font-montserrat text-[#8a8a8a] mt-[8px] lg:mt-[0.5vw]
                         text-[12px] sm:text-[13px] lg:text-[0.78vw] tracking-[0.02em]"
              style={BODY_FONT}
              data-reveal
            >
              Last updated on {formattedDate}
            </p>
          )}

          {(heading || formattedDate) && (
            <div
              className="h-px w-full bg-[#e7e7e7] mt-[20px] lg:mt-[1.25vw]"
              aria-hidden="true"
            />
          )}

          {content ? (
            <div
              className="legal-content font-montserrat text-[#444] leading-[1.85]
                         mt-[26px] lg:mt-[1.667vw]
                         text-[14px] sm:text-[15px] lg:text-[0.938vw]"
              style={BODY_FONT}
              data-reveal
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p
              className="font-montserrat text-[#6d6d6d] mt-[26px] lg:mt-[1.667vw]
                         text-[14px] sm:text-[15px] lg:text-[0.938vw]"
              style={BODY_FONT}
              data-reveal
            >
              This page is being updated — please check back shortly.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
