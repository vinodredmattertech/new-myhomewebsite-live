import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { ChevronRight } from "lucide-react";
import { pillarImage } from "@/lib/sustainabilityPillars";
import SectionHeading from "@/components/common/SectionHeading";

/**
 * PillarBanner — hero for an ESG pillar detail page.
 *
 * Identical treatment to SustainabilityBanner (zooming cover, word-by-word
 * heading reveal, underline draw, breadcrumb fade) with one difference: the
 * breadcrumb carries the extra Sustainability level, so a visitor who arrived
 * from a "Know More" button can step back up one page rather than to the root.
 */
export default function PillarBanner({ banner, fallback, pillarTitle }) {
  const heading = banner?.heading || fallback?.heading || pillarTitle || "";
  const breadcrumbLabel =
    banner?.breadcrumbLabel || fallback?.breadcrumbLabel || pillarTitle || "";
  const desktopImage = pillarImage(banner?.desktopImage, fallback?.desktopImage);
  const mobileImage =
    pillarImage(banner?.mobileImage, fallback?.mobileImage) || desktopImage;
  const imageAlt = banner?.imageAlt || fallback?.imageAlt || heading;

  const rootRef = useRef(null);
  const imgRef = useRef(null);
  const headingRef = useRef(null);
  const lineRef = useRef(null);
  const crumbRef = useRef(null);

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
    },
    { scope: rootRef }
  );

  const crumbLink =
    "font-montserrat font-medium text-[13px] sm:text-[15px] lg:text-[1.042vw] hover:text-[#ef493d] transition-colors";
  const chevron =
    "w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] lg:w-[0.781vw] lg:h-[0.781vw] opacity-80";

  return (
    <section
      ref={rootRef}
      className="relative w-full overflow-hidden bg-[#2a2828] h-[100svh] min-h-[560px] lg:h-[56.25vw] lg:min-h-0"
      data-section="sustainability-pillar-banner"
    >
      <div ref={imgRef} className="absolute inset-0 will-change-transform">
        {mobileImage ? (
          <Image
            src={mobileImage}
            alt={imageAlt}
            fill
            priority
            unoptimized
            sizes="100vw"
            className="lg:hidden object-cover object-center select-none"
          />
        ) : null}
        {desktopImage ? (
          <Image
            src={desktopImage}
            alt={imageAlt}
            fill
            priority
            unoptimized
            sizes="100vw"
            className="hidden lg:block object-cover object-center select-none"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/80" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[5] px-5 md:px-12 lg:px-[9.323vw] pb-[40px] sm:pb-[56px] lg:pb-[2.812vw]">
        <div className="flex flex-col items-start gap-[18px] sm:gap-[22px] lg:gap-[1.562vw] w-full">
          <SectionHeading
            as="h1"
            ref={headingRef}
            className="capitalize text-white will-change-transform leading-[1.08] tracking-[0.025em]
                       text-[32px] xs:text-[36px] sm:text-[44px] md:text-[56px] lg:text-[3.646vw]"
          >
            {heading}
          </SectionHeading>

          <div
            ref={lineRef}
            className="h-px w-full bg-white/55 lg:w-[81.30vw]"
            aria-hidden="true"
          />

          <nav
            ref={crumbRef}
            className="flex flex-wrap items-center gap-[10px] sm:gap-[16px] lg:gap-[0.938vw] text-white"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className={crumbLink}
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Home
            </Link>
            <ChevronRight className={chevron} />
            <Link
              href="/sustainability"
              className={crumbLink}
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Sustainability
            </Link>
            <ChevronRight className={chevron} />
            <span
              className="font-montserrat font-medium text-[13px] sm:text-[15px] lg:text-[1.042vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {breadcrumbLabel}
            </span>
          </nav>
        </div>
      </div>
    </section>
  );
}
