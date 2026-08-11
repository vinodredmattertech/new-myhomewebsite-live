import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { mediaUrl } from "@/lib/strapi";
import SectionLabel from "@/components/myhome/SectionLabel";
import SectionHeading from "@/components/common/SectionHeading";
import JobApplicationForm from "@/components/myhome/career/JobApplicationForm";

/* Copy defaults mirror career.application-form in Strapi so the section always
   renders, even before an editor fills the component in. */
export const APPLY_FORM_DEFAULTS = {
  sideLabel: "Join Our Team",
  heading: "Apply Now",
  description:
    "Share a few details and attach your resume — our people team reviews every application and will reach out when there's a fit.",
  submitText: "Submit Application",
  successMessage: "Thank you — your application has been received.",
  generalDesignation: "General Application",
  modalHeading: "Apply For",
};

/**
 * CareerApplyForm — the open application form that closes the Career page,
 * sitting directly above the footer (section 6).
 *
 * Same five fields as the "Apply Now" modal (full name, phone, email, resume,
 * message); submissions are saved to Strapi with the designation
 * "General Application" since no specific vacancy was selected. Layout follows
 * the Contact page form — optional image on the left, underline fields on the
 * right — so both lead forms on the site read as one system.
 */
export default function CareerApplyForm({ section }) {
  const copy = { ...APPLY_FORM_DEFAULTS, ...(section || {}) };
  const image = mediaUrl(section?.image);

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

  return (
    <section
      ref={rootRef}
      data-section="career-apply-form"
      className="relative w-full bg-white overflow-hidden
                 py-[30px] md:py-[70px] lg:pt-[2.343vw] lg:pb-[4.583vw]"
    >
      {/* top divider — mirrors the Contact page form section */}
      <div className="mx-auto h-px w-[calc(100%-40px)] sm:w-[calc(100%-64px)] lg:w-[89.896vw] bg-[#33333322]" />

      {/* vertical side label */}
      <div className="lg:absolute left-[4.16vw] top-[6.25vw] max-lg:static max-lg:w-full max-lg:flex max-lg:justify-center max-lg:mt-[25px] max-lg:mb-[18px]">
        <SectionLabel>{copy.sideLabel}</SectionLabel>
      </div>

      <div className="mt-[20px] md:mt-[56px] lg:mt-[2.604vw] px-5 md:px-10 lg:px-[9.375vw]">
        <SectionHeading
          ref={headingRef}
          className="text-[#333] capitalize text-center will-change-transform leading-[1.05] tracking-[0.02em]
                     text-[34px] xs:text-[40px] sm:text-[52px] md:text-[64px] lg:text-[5vw]"
        >
          {copy.heading}
        </SectionHeading>

        {copy.description && (
          <p
            className="mx-auto text-center text-[#5f5f5f] max-w-[640px] lg:max-w-[44vw]
                       mt-[14px] lg:mt-[1.042vw]
                       text-[14px] sm:text-[15px] lg:text-[0.938vw]
                       leading-[24px] sm:leading-[26px] lg:leading-[1.667vw]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {copy.description}
          </p>
        )}

        <div
          className={`mt-[30px] md:mt-[48px] lg:mt-[3.125vw] grid grid-cols-1 items-center
                      gap-y-[36px] gap-x-[40px] lg:gap-x-[10.208vw]
                      ${image ? "lg:grid-cols-2" : "max-w-[720px] lg:max-w-[38vw] mx-auto"}`}
        >
          {/* left: optional image */}
          {image && (
            <div
              className="relative w-full rounded-[10px] lg:rounded-[0.625vw] overflow-hidden
                         aspect-[734/653] lg:aspect-auto lg:h-[34vw]"
            >
              <Image
                src={image}
                alt="Life at My Home Group"
                fill
                unoptimized
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover"
              />
            </div>
          )}

          {/* right: the form */}
          <JobApplicationForm
            designation={copy.generalDesignation}
            formSource="Career Page — Apply Form"
            submitText={copy.submitText}
            successMessage={copy.successMessage}
            className={image ? "lg:w-[31.77vw]" : ""}
          />
        </div>
      </div>
    </section>
  );
}
