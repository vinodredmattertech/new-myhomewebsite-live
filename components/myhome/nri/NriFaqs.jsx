import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import SectionLabel from "@/components/myhome/SectionLabel";
import RichText from "@/components/common/RichText";
import SectionHeading from "@/components/common/SectionHeading";

function FaqItem({ item, isOpen, onToggle, index }) {
  const contentRef = useRef(null);

  useGSAP(
    () => {
      if (!contentRef.current) return;
      if (isOpen) {
        gsap.fromTo(
          contentRef.current,
          { height: 0, autoAlpha: 0 },
          {
            height: "auto",
            autoAlpha: 1,
            duration: 0.55,
            ease: "expo.out",
          }
        );
      } else {
        gsap.to(contentRef.current, {
          height: 0,
          autoAlpha: 0,
          duration: 0.4,
          ease: "expo.in",
        });
      }
    },
    { dependencies: [isOpen] }
  );

  return (
    <div className="border-b border-[rgba(85,85,85,0.2)] w-full">
      <button
        type="button"
        onClick={() => onToggle(index)}
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${index}`}
        className="flex w-full items-start justify-between gap-[16px] md:gap-[24px] lg:gap-[2.083vw]
                   text-left
                   px-[16px] md:px-[24px] lg:px-[2.083vw]
                   py-[20px] md:py-[28px] lg:py-[2.083vw]"
      >
        <span
          className={`capitalize tracking-[0.03em] transition-colors duration-300
                       text-[18px] sm:text-[22px] md:text-[26px] lg:text-[1.667vw]
                       leading-[1.3] lg:leading-[1.4]
                       ${isOpen ? "text-[#ef493d]" : "text-[#333]"}`}
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
            fontWeight: 300,
          }}
        >
          {item.q}
        </span>
        <span
          className={`shrink-0 inline-flex items-center justify-center rounded-full
                       border border-solid transition-all duration-300
                       backdrop-blur-[25px]
                       h-[36px] md:h-[44px] lg:h-[2.604vw]
                       w-[78px] md:w-[96px] lg:w-[5.99vw]
                       text-[12px] md:text-[15px] lg:text-[0.938vw]
                       font-montserrat font-medium
                       ${
                         isOpen
                           ? "border-[#ef493d] text-[#ef493d]"
                           : "border-[#a1a1a1] text-[#a1a1a1]"
                       }`}
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {isOpen ? "Close" : "Read"}
        </span>
      </button>

      <div
        id={`faq-panel-${index}`}
        ref={contentRef}
        className="overflow-hidden"
        style={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
      >
        <p
          className="font-montserrat font-normal text-[#6c6c6c]
                     px-[16px] md:px-[24px] lg:px-[2.083vw]
                     pb-[20px] md:pb-[28px] lg:pb-[2.083vw]
                     text-[13px] sm:text-[14px] md:text-[15px] lg:text-[0.833vw]
                     leading-[22px] sm:leading-[24px] md:leading-[26px] lg:leading-[1.302vw]
                     max-w-[1200px] lg:max-w-[65.26vw]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <RichText>{item.a}</RichText>
        </p>
      </div>
    </div>
  );
}

export default function NriFaqs({ data }) {
  const FAQS = Array.isArray(data?.items)
    ? data.items.map((it) => ({ q: it.question || "", a: it.answer || "" }))
    : [];

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(0);

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

  const handleToggle = (i) => setOpenIndex(openIndex === i ? -1 : i);

  if (!data || !FAQS.length) return null;

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden
                 py-[30px] md:py-[80px] lg:pt-[5.208vw] lg:pb-[5.208vw]"
      data-section="nri-faqs"
    >
      <div className="lg:absolute left-[4.16vw] top-[4.687vw] block max-lg:static max-lg:w-full max-lg:flex max-lg:justify-center max-lg:mt-[15px] max-lg:mb-[18px]">
        <SectionLabel>{data.label}</SectionLabel>
      </div>

      <div className="px-5 md:px-10 lg:px-[11.146vw] flex flex-col items-center">
        <SectionHeading
          ref={headingRef}
          className="text-[#333] capitalize will-change-transform leading-[1.05] tracking-[0.02em] text-center
                     text-[32px] xs:text-[40px] sm:text-[52px] md:text-[64px] lg:text-[5vw]"
        >
          {data.heading}
        </SectionHeading>

        <div className="w-full mt-[50px] md:mt-[56px] lg:mt-[3.125vw] max-w-[1480px] lg:max-w-[77.03vw] border-t border-[rgba(85,85,85,0.2)]">
          {FAQS.map((item, idx) => (
            <FaqItem
              key={item.q}
              item={item}
              index={idx}
              isOpen={openIndex === idx}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
