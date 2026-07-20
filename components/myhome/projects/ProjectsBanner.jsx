import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { mediaUrl } from "@/lib/strapi";
import SectionHeading from "@/components/common/SectionHeading";

const FALLBACK_IMAGE = "/assets/myhome/about/banner-cityscape.jpg";
const AUTOPLAY_DELAY = 4500;

/**
 * Projects listing banner.
 *
 * Renders a multi-image slider when the projects-page singleType publishes
 * `bannerSlides` (repeatable `projects.banner-slide`, each with an optional
 * hyperlink). When no slides are published it degrades to the single
 * `banner` image exactly as before, so nothing changes until content is added.
 *
 * This component is used by `pages/projects.js` only — the other page banners
 * (`PageBanner`, `NewsBanner`, `CsrBanner`, …) are separate components and are
 * deliberately left untouched.
 */
export default function ProjectsBanner({ banner, slides }) {
  const heading = banner?.heading || "A Collection of Signature Projects";
  const breadcrumbLabel = banner?.breadcrumbLabel || "Explore Our Projects";
  const fallbackAlt =
    banner?.imageAlt || "My Home Group projects shaping Hyderabad's skyline";

  // Normalise CMS slides -> render-ready shape, dropping any entry with no
  // usable artwork. Falls back to the legacy single-banner fields.
  const items = useMemo(() => {
    const normalised = (Array.isArray(slides) ? slides : [])
      .map((slide, i) => {
        const desktop = mediaUrl(slide?.desktopImage);
        const mobile = mediaUrl(slide?.mobileImage);
        if (!desktop && !mobile) return null;
        const href = (slide?.link || "").trim();
        return {
          key: slide?.id ?? i,
          desktop: desktop || mobile,
          mobile: mobile || desktop,
          alt: slide?.imageAlt || fallbackAlt,
          href: href || null,
          newTab: Boolean(slide?.openInNewTab),
        };
      })
      .filter(Boolean);

    if (normalised.length) return normalised;

    const desktop = mediaUrl(banner?.desktopImage) || FALLBACK_IMAGE;
    return [
      {
        key: "fallback",
        desktop,
        mobile: mediaUrl(banner?.mobileImage) || desktop,
        alt: fallbackAlt,
        href: null,
        newTab: false,
      },
    ];
  }, [slides, banner, fallbackAlt]);

  const isSlider = items.length > 1;

  // Swiper's `isActive` render prop is undefined during SSR, so the active
  // index is tracked in React state instead (same approach as WhereStoriesBegin).
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

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

  const renderMedia = (item, index) => (
    <>
      <Image
        src={item.mobile}
        alt={item.alt}
        fill
        priority={index === 0}
        unoptimized
        sizes="100vw"
        className="lg:hidden object-cover object-center select-none"
      />
      <Image
        src={item.desktop}
        alt={item.alt}
        fill
        priority={index === 0}
        unoptimized
        sizes="100vw"
        className="hidden lg:block object-cover object-center select-none"
      />
      {item.href && (
        <Link
          href={item.href}
          target={item.newTab ? "_blank" : undefined}
          rel={item.newTab ? "noopener noreferrer" : undefined}
          aria-label={item.alt}
          draggable={false}
          className="absolute inset-0 z-[2]"
        />
      )}
    </>
  );

  return (
    <section
      ref={rootRef}
      className="relative w-full overflow-hidden bg-[#2a2828] h-[100svh] min-h-[560px] lg:h-[56.25vw] lg:min-h-0"
      data-section="projects-banner"
    >
      <div ref={imgRef} className="absolute inset-0 will-change-transform">
        {isSlider ? (
          <Swiper
            modules={[Autoplay, EffectFade, A11y]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            loop
            speed={900}
            autoplay={{ delay: AUTOPLAY_DELAY, disableOnInteraction: false }}
            allowTouchMove
            onSwiper={(s) => (swiperRef.current = s)}
            onSlideChange={(s) => setActiveIndex(s.realIndex)}
            className="h-full w-full"
          >
            {items.map((item, i) => (
              <SwiperSlide key={item.key} className="relative">
                {renderMedia(item, i)}
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          renderMedia(items[0], 0)
        )}

        <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-b from-black/20 via-black/10 to-black/80" />
      </div>

      {isSlider && (
        <>
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="Previous banner"
            className="absolute left-3 lg:left-[2vw] top-1/2 -translate-y-1/2 z-[6] grid place-items-center
                       h-[38px] w-[38px] lg:h-[2.6vw] lg:w-[2.6vw] rounded-full
                       bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-[#ef493d]"
          >
            <ChevronLeft className="h-[18px] w-[18px] lg:h-[1.2vw] lg:w-[1.2vw]" />
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            aria-label="Next banner"
            className="absolute right-3 lg:right-[2vw] top-1/2 -translate-y-1/2 z-[6] grid place-items-center
                       h-[38px] w-[38px] lg:h-[2.6vw] lg:w-[2.6vw] rounded-full
                       bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-[#ef493d]"
          >
            <ChevronRight className="h-[18px] w-[18px] lg:h-[1.2vw] lg:w-[1.2vw]" />
          </button>
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 z-[5] px-5 md:px-12 lg:px-[9.323vw] pb-[40px] sm:pb-[56px] lg:pb-[2.812vw]">
        <div className="flex flex-col items-start gap-[18px] sm:gap-[22px] lg:gap-[1.562vw] w-full">
          <SectionHeading as="h1"
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
            className="flex items-center gap-[12px] sm:gap-[16px] lg:gap-[0.938vw] text-white"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="font-montserrat font-medium text-[13px] sm:text-[15px] lg:text-[1.042vw] hover:text-[#ef493d] transition-colors"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Home
            </Link>
            <ChevronRight className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] lg:w-[0.781vw] lg:h-[0.781vw] opacity-80" />
            <span
              className="font-montserrat font-medium text-[13px] sm:text-[15px] lg:text-[1.042vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {breadcrumbLabel}
            </span>
          </nav>
        </div>
      </div>

      {isSlider && (
        <div className="absolute inset-x-0 bottom-[16px] lg:bottom-[1vw] z-[6] flex justify-center gap-[8px] lg:gap-[0.5vw]">
          {items.map((item, i) => (
            <button
              key={item.key}
              type="button"
              onClick={() => swiperRef.current?.slideToLoop(i)}
              aria-label={`Go to banner ${i + 1}`}
              aria-current={i === activeIndex}
              className={`h-[6px] rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-[26px] bg-[#ef493d]"
                  : "w-[10px] bg-white/55 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
