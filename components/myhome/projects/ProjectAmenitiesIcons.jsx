import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Grid, Keyboard, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/grid";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import SectionHeading from "@/components/common/SectionHeading";

// Columns per view, per breakpoint. Kept in JS as well as in the Swiper
// `breakpoints` map so the arrows can be hidden when everything fits on one
// page.
const ROWS = 2;
const COLUMNS = { base: 2, sm: 3, lg: 5 };

export default function ProjectAmenitiesIcons({
  sidebarLabel = "The Luxury Of Choice",
  heading = "",
  description = "",
  // Tiles are icon + label, so an entry left without an icon in the CMS is
  // skipped rather than rendered as an empty (and next/image-crashing) cell.
  items = [],
}) {
  const amenities = (items || []).filter((a) => a?.icon);

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const descRef = useRef(null);
  const sidebarRef = useRef(null);
  const sliderRef = useRef(null);
  // The swiper instance is held in a ref so the click handlers never close
  // over a stale (or not-yet-set) instance.
  const swiperRef = useRef(null);
  const [columns, setColumns] = useState(COLUMNS.lg);

  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const sm = window.matchMedia("(min-width: 640px)");
    const update = () =>
      setColumns(lg.matches ? COLUMNS.lg : sm.matches ? COLUMNS.sm : COLUMNS.base);
    update();
    lg.addEventListener("change", update);
    sm.addEventListener("change", update);
    return () => {
      lg.removeEventListener("change", update);
      sm.removeEventListener("change", update);
    };
  }, []);

  const perPage = columns * ROWS;
  const hasNav = amenities.length > perPage;

  // With `fill: "row"` Swiper spreads the tiles over ceil(total / rows)
  // columns — NOT over `slidesPerView` — and then scrolls that grid sideways.
  // So a tile's column is its index modulo the real column count, not modulo
  // the number of columns on screen. Only the tile in the very last column
  // drops its right rule; every other right rule is a genuine divider, and the
  // one that lands on the container's edge is clipped away by the wrapper.
  const gridColumns = Math.max(1, Math.ceil(amenities.length / ROWS));

  const slidePrev = () => swiperRef.current?.slidePrev();
  const slideNext = () => swiperRef.current?.slideNext();

  useGSAP(
    () => {
      registerGsap();

      const trigger = {
        trigger: rootRef.current,
        start: "top 75%",
        toggleActions: "play none none none",
      };

      const headingWords = splitToWords(headingRef.current);
      gsap.from(headingWords, {
        yPercent: 110,
        duration: 1,
        stagger: 0.05,
        ease: "expo.out",
        scrollTrigger: trigger,
      });

      gsap.from([sidebarRef.current, descRef.current], {
        autoAlpha: 0,
        y: 24,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.1,
        delay: 0.15,
        scrollTrigger: trigger,
      });

      gsap.from(sliderRef.current, {
        autoAlpha: 0,
        y: 60,
        duration: 1.1,
        ease: "expo.out",
        delay: 0.25,
        scrollTrigger: trigger,
      });
    },
    { scope: rootRef }
  );

  if (!amenities.length) return null;

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white pt-[20px] pb-[40px] lg:pt-[4.688vw] lg:pb-[4.688vw] overflow-hidden"
      data-section="project-amenities-icons"
    >
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="flex lg:absolute left-[12px] top-[30px] lg:left-[4.167vw] lg:top-[0.688vw] flex-col items-center gap-[8px] md:gap-[12px] lg:gap-[1.094vw] w-auto lg:w-[2.813vw] z-[5] max-lg:static max-lg:!w-full max-lg:flex-row max-lg:!justify-center max-lg:items-center max-lg:!gap-[8px] max-lg:mt-[15px] max-lg:mb-[18px]"
        aria-hidden="true"
      >
        <span className="block w-px h-[28px] md:h-[36px] lg:h-[3.125vw] bg-[#ef493d] max-lg:!w-[28px] max-lg:!h-px" />
        <span
          className="font-montserrat font-medium capitalize whitespace-nowrap text-[#ef493d] text-[12px] md:text-[14px] lg:text-[1.25vw] max-lg:[writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] lg:rotate-180"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {sidebarLabel}
        </span>
      </div>

      <div className="px-5 md:px-12 lg:px-[9.375vw]">
        <SectionHeading
          ref={headingRef}
          className="capitalize text-[#333] leading-[1.08] tracking-[0.022em] text-center
                     text-[34px] xs:text-[38px] sm:text-[48px] md:text-[64px] lg:text-[5vw]"
        >
          {heading}
        </SectionHeading>
        {description ? (
          <p
            ref={descRef}
            className="mx-auto mt-[14px] lg:mt-[0.729vw] max-w-[760px] lg:max-w-[53.281vw]
                       text-center text-[#333]
                       text-[14px] leading-[24px]
                       sm:text-[16px] sm:leading-[28px]
                       lg:text-[0.938vw] lg:leading-[1.563vw]"
            style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ) : null}
      </div>

      <div
        ref={sliderRef}
        className="mt-[32px] lg:mt-[3.021vw] w-full px-5 md:px-12 lg:px-[4.167vw]"
      >
        {/* The wrapper clips the 1px the swiper hangs over by, so the right
            rule of whichever tile ends up flush with the edge doesn't read as
            a frame around the grid. */}
        <div className="overflow-hidden">
          <Swiper
            style={{ marginRight: -1 }}
            modules={[Grid, Keyboard, A11y]}
            slidesPerView={COLUMNS.base}
            grid={{ rows: ROWS, fill: "row" }}
            spaceBetween={0}
            keyboard={{ enabled: true }}
            speed={700}
            onSwiper={(s) => {
              swiperRef.current = s;
            }}
            breakpoints={{
              640: { slidesPerView: COLUMNS.sm, grid: { rows: ROWS, fill: "row" } },
              1024: { slidesPerView: COLUMNS.lg, grid: { rows: ROWS, fill: "row" } },
            }}
            className="amenities-icons-swiper
                       !h-[320px] sm:!h-[380px] lg:!h-[30.208vw]"
          >
            {amenities.map((a, idx) => {
              const isLastColumn = idx % gridColumns === gridColumns - 1;
              const isLastRow = Math.floor(idx / gridColumns) === ROWS - 1;
              return (
                <SwiperSlide
                  key={`${a.title}-${idx}`}
                  className={`!flex flex-col items-center justify-center text-center
                              px-[8px] sm:px-[14px] lg:px-[1.042vw]
                              ${isLastColumn ? "" : "border-r border-[#e5e1d8]"}
                              ${isLastRow ? "" : "border-b border-[#e5e1d8]"}`}
                >
                  <span
                    className="relative flex items-center justify-center rounded-full bg-[#f7f5f0]
                               w-[62px] h-[62px] sm:w-[76px] sm:h-[76px] lg:w-[5.938vw] lg:h-[5.938vw]"
                  >
                    <span className="relative block w-[52%] h-[52%]">
                      <Image
                        src={a.icon}
                        alt={a.iconAlt || a.title || "Amenity"}
                        fill
                        unoptimized
                        sizes="(min-width:1024px) 4vw, 40px"
                        className="object-contain object-center select-none"
                      />
                    </span>
                  </span>
                  <span
                    className="mt-[14px] sm:mt-[20px] lg:mt-[1.771vw] block uppercase text-[#16264a]
                               tracking-[0.06em] leading-[1.3]
                               text-[11px] sm:text-[12px] lg:text-[0.833vw]"
                    style={{
                      fontFamily:
                        '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                      fontWeight: 400,
                    }}
                  >
                    {a.title}
                  </span>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* Nav buttons — only when the tiles overflow a single page */}
        {hasNav && (
          <div className="mt-[28px] lg:mt-[2.083vw] flex items-center justify-center gap-[12px] lg:gap-[0.833vw]">
            <button
              type="button"
              onClick={slidePrev}
              aria-label="Previous amenities"
              className="inline-flex items-center justify-center rounded-full
                         bg-[#ef493d] text-white
                         w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] lg:w-[2.938vw] lg:h-[2.938vw]
                         transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-[18px] h-[18px] lg:w-[1.276vw] lg:h-[1.276vw]" />
            </button>
            <button
              type="button"
              onClick={slideNext}
              aria-label="Next amenities"
              className="inline-flex items-center justify-center rounded-full
                         bg-[#ef493d] text-white
                         w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] lg:w-[2.938vw] lg:h-[2.938vw]
                         transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              <ArrowRight className="w-[18px] h-[18px] lg:w-[1.276vw] lg:h-[1.276vw]" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
