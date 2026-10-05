import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { ChevronRight } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";

export default function ProjectDetailBanner({
  imageSrc = "/assets/myhome/projects/akrida-banner.jpg",
  mobileImageSrc,
  imageAlt = "My Home Akrida",
  title = "My Home Akrida",
  location = "Gopanpally, Hyderabad",
  logoSrc = "/assets/myhome/projects/akrida-logo.png",
}) {
  const rootRef = useRef(null);
  const imgRef = useRef(null);
  const headingRef = useRef(null);
  const subRef = useRef(null);
  const lineRef = useRef(null);
  const crumbRef = useRef(null);
  const logoCardRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();

      gsap.set(imgRef.current, { scale: 1.14, autoAlpha: 0.6 });
      gsap.to(imgRef.current, {
        scale: 1,
        autoAlpha: 1,
        duration: 1.8,
        ease: "expo.out",
        delay: 0.1,
      });

      const words = splitToWords(headingRef.current);
      gsap.from(words, {
        yPercent: 110,
        duration: 1.2,
        stagger: 0.06,
        ease: "expo.out",
        delay: 0.35,
      });

      gsap.from(subRef.current, {
        y: 20,
        autoAlpha: 0,
        duration: 0.9,
        ease: "expo.out",
        delay: 0.7,
      });

      gsap.from(lineRef.current, {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.1,
        ease: "expo.out",
        delay: 0.85,
      });

      gsap.from(crumbRef.current, {
        y: 24,
        autoAlpha: 0,
        duration: 0.9,
        ease: "expo.out",
        delay: 1.0,
      });

      if (logoCardRef.current) {
        gsap.from(logoCardRef.current, {
          y: 30,
          autoAlpha: 0,
          duration: 0.9,
          ease: "expo.out",
          delay: 1.1,
        });
      }
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-[#2a2828] lg:h-[56.25vw] lg:min-h-0"
      data-section="project-detail-banner"
    >
      <div ref={imgRef} className="relative w-full lg:absolute lg:inset-0 overflow-hidden will-change-transform">
        {/* Mobile: full artwork at its own ratio, fitted to the screen width. */}
        <img
          src={mobileImageSrc || imageSrc}
          alt={imageAlt}
          className="block w-full h-auto max-h-[100svh] object-contain object-center select-none lg:hidden"
        />
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center select-none hidden lg:block"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[56.759%] to-black to-[119.35%]" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[5] px-5 md:px-12 lg:px-[9.323vw] pb-[40px] sm:pb-[56px] lg:pb-[1.794vw]">
        <div className="flex flex-col items-start gap-[18px] sm:gap-[22px] lg:gap-[1.562vw] w-full">
          <div className="flex flex-col gap-[8px] sm:gap-[10px] lg:gap-[0.521vw]">
            <SectionHeading as="h1"
              ref={headingRef}
              className="capitalize text-white will-change-transform leading-[1.08] tracking-[0.03em]
                         text-[36px] xs:text-[40px] sm:text-[48px] md:text-[58px] lg:text-[3.646vw]"
            >
              {title}
            </SectionHeading>

            <p
              ref={subRef}
              className="capitalize text-white leading-[1.2] tracking-[0.03em]
                         text-[16px] sm:text-[20px] md:text-[24px] lg:text-[1.562vw]"
              style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
            >
              {location}
            </p>
          </div>

          <div
            ref={lineRef}
            className="h-px w-full bg-white/55 lg:w-[81.30vw]"
            aria-hidden="true"
          />

          <nav
            ref={crumbRef}
            className="flex items-center gap-[12px] sm:gap-[16px] lg:gap-[0.938vw] text-white"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="font-medium text-[13px] sm:text-[15px] lg:text-[1.042vw] hover:text-[#ef493d] transition-colors"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Home
            </Link>
            <ChevronRight className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] lg:w-[0.781vw] lg:h-[0.781vw] opacity-80" />
            <Link
              href="/projects"
              className="font-medium text-[13px] sm:text-[15px] lg:text-[1.042vw] hover:text-[#ef493d] transition-colors"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Projects
            </Link>
            <ChevronRight className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] lg:w-[0.781vw] lg:h-[0.781vw] opacity-80" />
            <span
              className="font-medium text-[13px] sm:text-[15px] lg:text-[1.042vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {title}
            </span>
          </nav>
        </div>
      </div>

      {logoSrc ? (
        // z-[60] clears the sticky ProjectSectionNav (z-[50]) that follows this
        // section — the card hangs half its height into the nav's band, so a
        // lower value leaves it clipped. Stays under the header chrome (z-[70]+).
        <div
          ref={logoCardRef}
          className="hidden lg:flex absolute bottom-0 right-[3vw] z-[60] translate-y-1/2
                     items-center justify-center bg-white rounded-[12px]
                     border border-[rgba(85,85,85,0.1)]
                     shadow-[0_0_30px_0_rgba(0,0,0,0.05)]
                     w-[10.563vw] h-[8.438vw]
                     min-w-[160px] min-h-[128px]"
          aria-hidden="true"
        >
          <Image
            src={logoSrc}
            alt={`${title} logo`}
            width={165}
            height={93}
            className="w-[8.594vw] h-[4.844vw] min-w-[130px] min-h-[74px] object-contain select-none pointer-events-none"
          />
        </div>
      ) : null}
    </section>
  );
}
