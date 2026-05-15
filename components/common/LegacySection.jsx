"use client";

import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { cleanImage } from "./ImageClear";
import SectionCursor from "./SectionCursor";

gsap.registerPlugin(ScrollTrigger);

const LegacySection = ({ data: datas }) => {
  const data = useMemo(() => {
    if (!datas) return [];

    return datas.map((item) => ({
      badge: item.badge,
      title: item.title,
      description: item.description?.replace(/<[^>]+>/g, ""), // remove html tags
      buttonText: item.buttonText,
      CTA: item.CTA,
      images: {
        top: cleanImage(item?.topImage?.data?.attributes?.url),
        bottom: cleanImage(item?.bottomImage?.data?.attributes?.url),
        left: cleanImage(item?.leftImage?.data?.attributes?.url),
        right: cleanImage(item?.rightImage?.data?.attributes?.url),
      },
    }));
  }, [datas]);
  const containerRef = useRef(null);
  const sectionRefs = useRef([]);
  const router = useRouter();

  useGSAP(() => {
    const container = containerRef.current;
    const sections = sectionRefs.current.filter(Boolean);
    if (!container || sections.length === 0) return;

    const mm = gsap.matchMedia();

    // ✅ Desktop only
    mm.add("(min-width: 1024px)", () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());

      // ---- initial states ----
      sections.forEach((section, index) => {
        const imgs = section.querySelectorAll("[data-reveal-img]");

        // keep your section reveal behavior
        gsap.set(section, {
          clipPath: index === 0 ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
          opacity: 1,
        });

        // ✅ ONLY FIRST SECTION images start hidden (so they can animate)
        if (index === 0) {
          gsap.set(imgs, { opacity: 0, y: 200 });
        } else {
          // ✅ other sections images should NOT animate -> keep visible
          gsap.set(imgs, { opacity: 1, y: 0, clearProps: "transform" });
        }
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: `+=${sections.length * 120}%`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          // markers: true,
        },
      });

      // ✅ ONLY animate first section images
      tl.to(sections[0].querySelectorAll("[data-reveal-img]"), {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.2,
      });

      // ✅ Slides 2..N: only reveal section + fade prev (NO image animations)
      for (let i = 1; i < sections.length; i++) {
        const current = sections[i];
        const prev = sections[i - 1];

        tl.to(current, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1,
          ease: "power2.out",
        });

        tl.to(
          prev,
          {
            opacity: 0,
            duration: 0.25,
            ease: "power1.out",
          },
          "<",
        );
      }

      ScrollTrigger.refresh();

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    });

    // ✅ Mobile/Tablet: normal flow (no pin/animation)
    mm.add("(max-width: 1023px)", () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      sections.forEach((section) => {
        const imgs = section.querySelectorAll("[data-reveal-img]");
        gsap.set(section, { clearProps: "all" });
        gsap.set(imgs, { clearProps: "all", opacity: 1, y: 0 });
      });
      return () => { };
    });

    return () => mm.revert();
  }, []);

  console.log({ data });

  const [cursorActive, setCursorActive] = useState(false);
  const [cursorText, setCursorText] = useState("Explore");
  const [expandedIndex, setExpandedIndex] = useState(null);

  return (
    <section
      className="overflow-hidden"
      style={{ backgroundImage: "url('/images/pillar/pillar_bg.webp')" }}
    >
      <div
        ref={containerRef}

        className="lg:h-[100vh] bg-[#F9F7F4] relative overflow-hidden max-lg:h-auto max-lg:overflow-visible"
      >
        {data.map((item, index) => (
          <div
            key={index}
            ref={(el) => (sectionRefs.current[index] = el)}
            className="
              legacy-slide
              absolute lg:min-h-[100vh] bg-[#F9F7F4]
              flex flex-col text-center items-center gap-4 lg:gap-[1vw]
              justify-center w-full lg:mt-10 mt-0
              max-lg:static max-lg:min-h-0
              max-lg:py-14 max-lg:px-4
              max-lg:overflow-hidden
            "
            onMouseEnter={() => {
              setCursorActive(true);
              setCursorText(expandedIndex === index ? "Read Less" : "Read More");
            }}
            onMouseLeave={() => setCursorActive(false)}
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >

            {/* Top-left image — always visible */}
            <div className="absolute lg:left-[15%] left-0 lg:top-[0%] top-0 lg:z-auto z-[1] max-lg:hidden">
              <Image
                data-reveal-img
                src={item.images.top}
                height={294}
                width={294}
                alt="decor"
                className="w-auto lg:h-[15.313vw] rounded-xl"
              />
            </div>

            {/* Bottom-left image — hidden until Read More */}
            <div
              className={`absolute lg:left-[1%] left-0 lg:bottom-[10%] bottom-[4.5%] lg:z-auto z-[1] max-lg:hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                expandedIndex === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
              }`}
            >
              <Image
                data-reveal-img
                src={item.images.bottom}
                height={597}
                width={496}
                alt="decor"
                className="w-auto lg:h-[25.094vw] rounded-xl"
              />
            </div>

            {/* Top-right image — pushed more right */}
            <div className="absolute lg:right-[8%] right-[10%] top-0 lg:-top-[0%] lg:z-auto z-[1] max-lg:hidden">
              <Image
                data-reveal-img
                src={item.images.right}
                height={492}
                width={393}
                alt="decor"
                className="w-auto lg:h-[20.625vw] rounded-xl"
              />
            </div>

            {/* Bottom-right image — hidden until Read More */}
            <div
              className={`absolute lg:right-[0%] right-0 bottom-[4.5%] lg:bottom-[10%] lg:z-auto z-[1] max-lg:hidden transition-all duration-700 delay-100 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                expandedIndex === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
              }`}
            >
              <Image
                data-reveal-img
                src={item.images.left}
                height={264}
                width={388}
                alt="decor"
                className="w-auto lg:h-[13.75vw] rounded-xl"
              />
            </div>

            {/* Mobile: one main image */}
            <div className="hidden max-lg:grid grid-cols-2 gap-4 w-full max-w-[420px] mx-auto mb-6">
  <Image
    src={item.images.top}
    width={500}
    height={500}
    alt="visual-1"
    className="w-full h-auto rounded-xl object-cover"
  />
  <Image
    src={item.images.bottom}
    width={500}
    height={500}
    alt="visual-2"
    className="w-full h-auto rounded-xl object-cover"
  />
</div>

            <div className="absolute lg:right-[0%] left-0 bottom-[40%] -translate-y-1/2 lg:z-auto z-[1] -rotate-180 max-lg:hidden">
              <Image
                src={"/icons/left.svg"}
                height={202}
                width={132}
                alt="decor"
                className="w-auto lg:h-[6.875vw]"
              />
            </div>

            {index % 2 !== 0 && (
              <div className="absolute lg:left-[8%] mix-blend-multiply lg:top-[12%] lg:z-auto z-[1] -rotate-90 max-lg:hidden">
                <Image
                  src={"/icons/bf.gif"}
                  height={72}
                  width={50}
                  alt="bf"
                  className="w-full bg-transparent mix-blend-multiply lg:h-[2.62vw]"
                />
              </div>
            )}

            {/* Content */}
            <div className="lg:w-[37.5vw] max-lg:w-full max-lg:max-w-[520px] relative z-[2]">
              <div className="flex gap-2 justify-center items-center mb-3 max-lg:mb-2">
                <Image
                  src={"/icons/bf.png"}
                  width={22}
                  height={24}
                  alt="bf"
                  className="w-auto h-[18px] lg:h-[1.25vw]"
                />
                <h2 className="Avenir text-[#C6A664] text-center lg:text-[1.302vw] text-xs tracking-wide">
                  {item.badge}
                </h2>
              </div>

              <h2 className="text-[#7B766C] heading PPEditorialOld italic max-lg:text-2xl">
                {item.title}
              </h2>

              {/* Truncated / Full text */}
              <div className="relative">
                <p
                  className={`whitespace-pre-wrap content-sm text-[#5F5F5F] max-lg:text-sm max-lg:leading-6 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    expandedIndex === index ? "max-h-[200vh]" : "line-clamp-3"
                  }`}
                >
                  {item.description}
                </p>

                {/* Fade gradient when collapsed */}
                {expandedIndex !== index && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F9F7F4] to-transparent pointer-events-none" />
                )}
              </div>

              {/* Read More / Read Less button */}
              {/* <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpandedIndex(expandedIndex === index ? null : index);
                }}
                className="relative z-[3] mt-3 lg:mt-[0.8vw] Avenir text-[#BE9C58] text-sm lg:text-[0.833vw] tracking-[2px] uppercase border-b border-[#BE9C58] hover:tracking-[4px] transition-all duration-300"
              >
                {expandedIndex === index ? "Read Less" : "Read More"}
              </button> */}

              <div
                className="mt-[2vw] max-lg:mt-6 lg:hidden block relative inline-flex w-fit overflow-hidden rounded-full border border-[#BE9C58] group cursor-pointer"
                onClick={() => router.push(item?.CTA)}
              >
                <span
                  className="
                    absolute inset-0 bg-[#BE9C58]
                    scale-x-0 origin-center opacity-0
                    transition-all duration-500
                    ease-[cubic-bezier(0.4,0,0.2,1)]
                    group-hover:scale-x-100 group-hover:opacity-100
                  "
                />
                <p
                  className="
                    relative !font-[500]
                    px-6 py-3 lg:py-[1vw] lg:px-[2vw]
                    content text-[#BE9C58] whitespace-nowrap
                    transition-colors duration-400 ease-out
                    group-hover:text-white
                    max-lg:text-sm
                  "
                >
                  {item.buttonText}
                </p>
              </div>
            </div>

            {/* Mobile divider */}
            <div className="hidden max-lg:block w-full max-w-[520px] h-px bg-[#E6E0D7] mt-10" />
          </div>
        ))}
      </div>
      <SectionCursor className="lg:w-[6.5vw] lg:h-[6.5vw]" text={cursorText} active={cursorActive} />
    </section>
  );
};

export default LegacySection;
