import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, A11y, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import { mediaUrl } from "@/lib/strapi";
import SectionLabel from "@/components/myhome/SectionLabel";
import SectionHeading from "@/components/common/SectionHeading";

const RED = "#ef493d";

/** Flatten one CMS award item; items without a photo are dropped upstream. */
function normaliseAward(raw, idx) {
  // Strapi hands media back either flattened or wrapped in `data.attributes`.
  const media = raw?.image?.data?.attributes || raw?.image?.attributes || raw?.image;
  return {
    id: raw?.id ?? idx,
    image: mediaUrl(raw?.image),
    alt: media?.alternativeText || raw?.caption || "Award",
    caption: raw?.caption || "",
  };
}

/** Flatten one year tab, keeping only the items that carry an image. */
function normaliseTab(raw, idx) {
  const items = (Array.isArray(raw?.items) ? raw.items : [])
    .map(normaliseAward)
    .filter((a) => a.image);
  return {
    id: raw?.id ?? idx,
    key: `${raw?.label || "tab"}-${raw?.id ?? idx}`,
    label: raw?.label || "",
    items,
  };
}

/**
 * SustainabilityAwards — the "Awards" band that closes the Sustainability page,
 * directly under Sustainability Reports.
 *
 * • Year tabs come straight from the CMS (`awards.tabs`); the first tab with
 *   photos is selected on load and tabs with no usable photo are hidden.
 * • The selected tab's photos play in an auto-advancing Swiper (3-up on
 *   desktop, 2-up on tablet, 1-up on mobile) with the caption printed under
 *   each photo.
 * • Arrows only appear when there are more photos than fit in one view; the
 *   slider stays swipeable everywhere.
 * • The whole section render-skips when no tab has a photo.
 */
export default function SustainabilityAwards({ awards }) {
  const label = awards?.label || "Recognition";
  const heading = awards?.heading || "Awards";
  const description = awards?.description || "";

  const tabs = useMemo(() => {
    const raw = Array.isArray(awards?.tabs) ? awards.tabs : [];
    return raw.map(normaliseTab).filter((t) => t.items.length);
  }, [awards]);

  const [activeKey, setActiveKey] = useState(null);

  // Keep the selection valid when the CMS data changes (e.g. a tab is emptied).
  useEffect(() => {
    if (!tabs.length) {
      setActiveKey(null);
      return;
    }
    setActiveKey((prev) =>
      prev && tabs.some((t) => t.key === prev) ? prev : tabs[0].key
    );
  }, [tabs]);

  const activeTab = tabs.find((t) => t.key === activeKey) || tabs[0] || null;
  const items = activeTab?.items || [];

  // Arrows / loop only make sense once the row is fuller than a single view.
  const showArrows = items.length > 3;
  const canLoop = items.length > 3;

  const [prevEl, setPrevEl] = useState(null);
  const [nextEl, setNextEl] = useState(null);

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
          stagger: 0.06,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 82%" },
        });
      }
    },
    { scope: rootRef }
  );

  if (!tabs.length) return null;

  return (
    <section
      ref={rootRef}
      data-section="sustainability-awards"
      className="relative w-full overflow-hidden bg-white text-[#333]
                 pt-[26px] pb-[56px] lg:pt-[4.687vw] lg:pb-[5.208vw]"
    >
      <SectionLabel
        className="lg:absolute z-[5] left-[16px] top-[56px] lg:left-[4.166vw] lg:top-[4.687vw] max-lg:static max-lg:w-full max-lg:mt-[15px] max-lg:mb-[18px]"
        color={RED}
      >
        {label}
      </SectionLabel>

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-[11.146vw]">
        <div className="flex flex-col items-center text-center gap-[14px] lg:gap-[0.729vw]">
          <SectionHeading
            data-reveal
            className="leading-[1.05] tracking-[0.02em]
                       text-[34px] xs:text-[38px] sm:text-[48px] md:text-[60px] lg:text-[3.646vw]"
          >
            {heading}
          </SectionHeading>
          {description ? (
            <p
              data-reveal
              className="max-w-[70ch] text-[#5f5f5f] text-[15px] leading-[1.7] lg:text-[0.937vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {description}
            </p>
          ) : null}
        </div>

        {/* ---------------- Year tabs ---------------- */}
        {tabs.length > 1 ? (
          <div
            data-reveal
            role="tablist"
            aria-label="Award years"
            className="mt-[22px] lg:mt-[1.822vw] flex flex-nowrap lg:flex-wrap items-center justify-start lg:justify-center
                       gap-[18px] sm:gap-[26px] lg:gap-[2.083vw]
                       overflow-x-auto lg:overflow-visible
                       -mx-6 px-6 sm:-mx-10 sm:px-10 lg:mx-0 lg:px-0
                       [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab?.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveKey(tab.key)}
                  className={`relative shrink-0 pb-[8px] lg:pb-[0.52vw] transition-colors duration-300
                              text-[15px] sm:text-[16px] lg:text-[1.041vw]
                              ${
                                isActive
                                  ? "text-[#ef493d]"
                                  : "text-[#5f5f5f] hover:text-[#1b1a1a]"
                              }`}
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <span className="whitespace-nowrap">{tab.label}</span>
                  <span
                    className={`pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-center
                                transition-transform duration-300
                                ${isActive ? "scale-x-100" : "scale-x-0"}`}
                    style={{ background: RED }}
                  />
                </button>
              );
            })}
          </div>
        ) : null}

        {/* ---------------- Slider ---------------- */}
        <div data-reveal className="relative mt-[26px] lg:mt-[2.083vw]">
          <Swiper
            // Re-mount per tab so autoplay/loop restart cleanly with the new set.
            key={activeTab?.key}
            modules={[Navigation, Keyboard, A11y, Autoplay]}
            slidesPerView={1.1}
            spaceBetween={16}
            speed={650}
            loop={canLoop}
            keyboard={{ enabled: true }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{ prevEl, nextEl }}
            centerInsufficientSlides
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
            className="!overflow-hidden"
          >
            {items.map((item, idx) => (
              <SwiperSlide key={item.id ?? idx} className="!h-auto">
                <figure className="group flex h-full flex-col">
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[10px] lg:rounded-[0.625vw] bg-[#161616]">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      unoptimized
                      sizes="(max-width:640px) 90vw, (max-width:1024px) 45vw, 26vw"
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                  {item.caption ? (
                    <figcaption
                      className="mt-[12px] lg:mt-[0.833vw] text-center text-[#333]
                                 text-[13px] leading-[1.6] sm:text-[14px] lg:text-[0.833vw] lg:leading-[1.5vw]"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {item.caption}
                    </figcaption>
                  ) : null}
                </figure>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Arrows — desktop only, and only when the row overflows one view. */}
          {showArrows ? (
            <>
              <button
                ref={setPrevEl}
                type="button"
                aria-label="Previous awards"
                className="hidden lg:inline-flex absolute left-[-3.4vw] top-[35%] z-[5] -translate-y-1/2
                           h-[2.5vw] w-[2.5vw] items-center justify-center rounded-full
                           border border-black/15 bg-white text-[#1b1a1a]
                           transition-colors duration-300 hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white"
              >
                <ChevronLeft className="h-[1.04vw] w-[1.04vw]" />
              </button>
              <button
                ref={setNextEl}
                type="button"
                aria-label="Next awards"
                className="hidden lg:inline-flex absolute right-[-3.4vw] top-[35%] z-[5] -translate-y-1/2
                           h-[2.5vw] w-[2.5vw] items-center justify-center rounded-full
                           border border-black/15 bg-white text-[#1b1a1a]
                           transition-colors duration-300 hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white"
              >
                <ChevronRight className="h-[1.04vw] w-[1.04vw]" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
