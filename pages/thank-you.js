import React, { useEffect, useRef } from "react";
import { startPendingBrochureDownload } from "@/lib/brochureDownload";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import SectionLabel from "@/components/myhome/SectionLabel";
import { CheckCircle2, ArrowUpRight } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";

/**
 * Thank You — confirmation page rendered after every lead form submission.
 *
 * Visual language matches the rest of the site: vertical SectionLabel,
 * Tartuffo display heading with italic accent, Montserrat body, outlined
 * red CTAs with slide-up fill on hover. A soft floral accent in the lower
 * corners mirrors the home + about sections.
 */
export default function ThankYou() {
  const rootRef = useRef(null);
  const checkRef = useRef(null);
  const headingRef = useRef(null);
  const bodyRef = useRef(null);
  const ctasRef = useRef(null);

  useEffect(() => {
    startPendingBrochureDownload();
  }, []);

  useGSAP(
    () => {
      registerGsap();

      gsap.from(checkRef.current, {
        scale: 0.6,
        autoAlpha: 0,
        duration: 0.9,
        ease: "back.out(2)",
      });

      const words = splitToWords(headingRef.current);
      gsap.from(words, {
        yPercent: 110,
        rotate: 4,
        duration: 1.1,
        stagger: 0.07,
        ease: "expo.out",
        delay: 0.2,
      });

      gsap.from(bodyRef.current, {
        y: 30,
        autoAlpha: 0,
        duration: 1.0,
        ease: "expo.out",
        delay: 0.55,
      });

      gsap.from(ctasRef.current?.children || [], {
        y: 26,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "expo.out",
        delay: 0.75,
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden flex items-center justify-center
                 min-h-[100svh] py-[80px] md:py-[100px] lg:py-[6.25vw]"
      data-section="thank-you"
    >
      {/* ===== Side label "Confirmation" — same pattern as inner pages ===== */}
      <div className="absolute left-[4.16vw] top-[4.687vw] hidden lg:block z-[2]">
        <SectionLabel>Confirmation</SectionLabel>
      </div>

      {/* ===== Decorative floral accents (corners) ===== */}
      <div
        className="hidden lg:block absolute -left-[2vw] -bottom-[2vw] z-[1] pointer-events-none w-[18vw] aspect-[179/338] opacity-60"
        aria-hidden="true"
      >
        <div className="absolute inset-0" style={{ transform: "scaleY(-1)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/myhome/whymyhome-floral.png"
            alt=""
            className="absolute top-0 left-0 max-w-none h-auto select-none"
            style={{ width: "200%" }}
          />
        </div>
      </div>
      <div
        className="hidden lg:block absolute -right-[2vw] -bottom-[2vw] z-[1] pointer-events-none w-[18vw] aspect-[179/338] opacity-60"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0"
          style={{ transform: "scale(-1, -1)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/myhome/whymyhome-floral.png"
            alt=""
            className="absolute top-0 left-0 max-w-none h-auto select-none"
            style={{ width: "200%" }}
          />
        </div>
      </div>

      {/* ===== Main content ===== */}
      <div
        className="relative z-[3] w-full max-w-[760px] lg:max-w-[44vw]
                   px-5 md:px-8 lg:px-0
                   flex flex-col items-center text-center"
      >
        {/* Success ring */}
        <div
          ref={checkRef}
          className="relative flex items-center justify-center
                     w-[88px] h-[88px] md:w-[104px] md:h-[104px] lg:w-[6.25vw] lg:h-[6.25vw]
                     rounded-full bg-[#ef493d]/10 border border-[#ef493d]/30
                     mb-[28px] md:mb-[36px] lg:mb-[2.083vw]"
        >
          <CheckCircle2
            className="text-[#ef493d] w-[44px] h-[44px] md:w-[52px] md:h-[52px] lg:w-[3.125vw] lg:h-[3.125vw]"
            strokeWidth={1.6}
          />
        </div>

        {/* Heading */}
        <SectionHeading as="h1"
          ref={headingRef}
          className="text-[#333] capitalize will-change-transform leading-[1.05] tracking-[0.02em]
                     text-[36px] xs:text-[44px] sm:text-[56px] md:text-[72px] lg:text-[5vw]"
        >
          Thank You,{" "}
          <span
            className="italic text-[#ef493d]"
            style={{
              fontFamily:
                '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
            }}
          >
            we&apos;ll be in touch.
          </span>
        </SectionHeading>

        {/* Body */}
        <p
          ref={bodyRef}
          className="font-montserrat font-normal text-[#6d6d6d]
                     mt-[20px] md:mt-[28px] lg:mt-[1.563vw]
                     text-[14px] sm:text-[16px] md:text-[17px] lg:text-[0.938vw]
                     leading-[24px] sm:leading-[26px] md:leading-[28px] lg:leading-[1.667vw]
                     max-w-[560px] lg:max-w-[36vw]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Your enquiry has reached our team. A My Home advisor will reach out
          within one business day with the project details, availability, and
          next steps. Meanwhile, feel free to explore more of our work.
        </p>

        {/* CTAs */}
        <div
          ref={ctasRef}
          className="mt-[36px] md:mt-[48px] lg:mt-[2.604vw]
                     flex flex-col sm:flex-row items-center justify-center
                     gap-[14px] sm:gap-[16px] lg:gap-[1.042vw]"
        >
          {/* Back to home — outlined red */}
          <Link
            href="/"
            className="group relative inline-flex items-center justify-center
                       whitespace-nowrap overflow-hidden
                       w-[200px] sm:w-[210px] lg:w-[12.448vw]
                       h-[48px] sm:h-[54px] lg:h-[3.02vw]
                       px-[18px] lg:px-[1vw]
                       border border-[#ef493d] bg-transparent
                       transition-[border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 origin-bottom translate-y-full
                         group-hover:translate-y-0 transition-transform duration-500
                         ease-[cubic-bezier(0.22,1,0.36,1)] bg-[#ef493d]"
            />
            <span
              className="relative z-[1] font-montserrat font-medium capitalize
                         text-[#ef493d] group-hover:text-white transition-colors duration-500
                         text-[14px] sm:text-[15px] lg:text-[0.938vw] tracking-[0.02em]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Back to Home
            </span>
          </Link>

          {/* Secondary — explore projects (filled red, arrow) */}
          <Link
            href="/projects"
            className="group relative inline-flex items-center justify-center gap-[10px] lg:gap-[0.521vw]
                       whitespace-nowrap overflow-hidden
                       w-[220px] sm:w-[230px] lg:w-[13.5vw]
                       h-[48px] sm:h-[54px] lg:h-[3.02vw]
                       px-[18px] lg:px-[1vw]
                       bg-[#ef493d] text-white border border-[#ef493d]
                       transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                       hover:bg-transparent"
          >
            <span
              className="relative z-[1] font-montserrat font-medium capitalize
                         text-white group-hover:text-[#ef493d] transition-colors duration-500
                         text-[14px] sm:text-[15px] lg:text-[0.938vw] tracking-[0.02em]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Explore Projects
            </span>
            <ArrowUpRight
              className="relative z-[1] text-white group-hover:text-[#ef493d] transition-colors duration-500
                         w-[16px] h-[16px] lg:w-[0.885vw] lg:h-[0.885vw]"
              strokeWidth={1.8}
            />
          </Link>
        </div>

        {/* Foot caption */}
        <p
          className="font-montserrat font-normal text-[#6d6d6d]/80
                     mt-[24px] md:mt-[32px] lg:mt-[1.563vw]
                     text-[11px] sm:text-[12px] lg:text-[0.729vw] tracking-[0.06em] uppercase"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Reference saved · You may close this tab.
        </p>
      </div>
    </section>
  );
}

ThankYou.getLayout = (page) => (
  <MyHomeLayout
    title="Thank You | My Home Group"
    description="Your enquiry has reached our team. A My Home advisor will reach out shortly."
  >
    {page}
  </MyHomeLayout>
);
