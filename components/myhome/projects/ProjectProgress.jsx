import React, { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowLeft, ArrowRight, Calendar, ChevronDown, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import useFancybox from "@/components/common/useFancybox";
import SectionHeading from "@/components/common/SectionHeading";
import { mediaUrl } from "@/lib/strapi";

const DEFAULT_METRICS = [
  {
    key: "overall",
    label: "Overall Project Completion",
    sublabel: "(Data as of July 2026)",
    value: 78.94,
  },
  { key: "superstructure", label: "Superstructure", value: 100 },
  { key: "building", label: "Building Work", value: 78 },
  { key: "infrastructure", label: "Infrastructure", value: 3.58 },
];

const MONTHS_LIST = [
  { short: "Jan", full: "January", index: 0, num: "01" },
  { short: "Feb", full: "February", index: 1, num: "02" },
  { short: "Mar", full: "March", index: 2, num: "03" },
  { short: "Apr", full: "April", index: 3, num: "04" },
  { short: "May", full: "May", index: 4, num: "05" },
  { short: "Jun", full: "June", index: 5, num: "06" },
  { short: "Jul", full: "July", index: 6, num: "07" },
  { short: "Aug", full: "August", index: 7, num: "08" },
  { short: "Sept", full: "September", index: 8, num: "09" },
  { short: "Oct", full: "October", index: 9, num: "10" },
  { short: "Nov", full: "November", index: 10, num: "11" },
  { short: "Dec", full: "December", index: 11, num: "12" },
];

// Rich dummy content across multiple months for frontend preview
const DEFAULT_IMAGES = [
  {
    src: "/assets/myhome/projects/progress-1.jpg",
    alt: "Tower 05 - Flooring Work",
    caption: "Tower 05 - Flooring Work",
    date: "2026-07-02",
  },
  {
    src: "/assets/myhome/projects/akrida-banner.jpg",
    alt: "Tower 08 - Terrace Waterproofing",
    caption: "Tower 08 - Terrace Waterproofing",
    date: "2026-07-18",
  },
  {
    src: "/assets/myhome/projects/progress-1.jpg",
    alt: "18 East - Facade work",
    caption: "18 East - Facade work",
    date: "2026-04-15",
  },
  {
    src: "/assets/myhome/projects/akrida-banner.jpg",
    alt: "Tower 07 - External Glass Facade",
    caption: "Tower 07 - External Glass Facade",
    date: "2026-04-22",
  },
  {
    src: "/assets/myhome/projects/akrida-entrance.jpg",
    alt: "Clubhouse - Roof Slab Completed",
    caption: "Clubhouse - Structural Work",
    date: "2026-05-08",
  },
  {
    src: "/assets/myhome/projects/luxury-design.jpg",
    alt: "Tower 02 - Interior Finishing",
    caption: "Tower 02 - Sample Flat Finishing",
    date: "2026-05-18",
  },
  {
    src: "/assets/myhome/projects/progress-1.jpg",
    alt: "Tower 04 - 39th Floor Slab Cast",
    caption: "Tower 04 - 39th Floor Roof Slab",
    date: "2026-06-02",
  },
  {
    src: "/assets/myhome/projects/akrida-banner.jpg",
    alt: "Podium Landscape & Paving",
    caption: "Podium Landscape & Paving",
    date: "2026-06-25",
  },
  {
    src: "/assets/myhome/projects/akrida-entrance.jpg",
    alt: "Tower 01 - Foundation Piling",
    caption: "Tower 01 - Foundation Piling",
    date: "2026-03-12",
  },
];

function parseDateInfo(dateStr) {
  if (!dateStr) return { monthKey: "", monthLabel: "", formattedDate: "" };
  const str = String(dateStr).trim();
  const parts = str.split("-");
  if (parts.length >= 2) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    if (!isNaN(year) && !isNaN(month) && month >= 0 && month < 12) {
      const d = new Date(year, month, 1);
      const monthLabel = d.toLocaleString("en-US", { month: "long", year: "numeric" });
      const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
      let formattedDate = monthLabel;
      if (parts.length === 3) {
        const day = parseInt(parts[2], 10);
        if (!isNaN(day)) {
          const suffix = (day) => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
              case 1: return "st";
              case 2: return "nd";
              case 3: return "rd";
              default: return "th";
            }
          };
          formattedDate = `${day}${suffix(day)} ${d.toLocaleString("en-US", { month: "long" })} ${year}`;
        }
      }
      return { monthKey, monthLabel, formattedDate };
    }
  }
  return { monthKey: str, monthLabel: str, formattedDate: str };
}

// Full Calendar Month & Year Date Picker Popover matching the screenshot design
function MonthYearCalendarPicker({ selectedMonthKey, onSelectMonthKey, onClear }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const [pickerYear, setPickerYear] = useState(() => {
    if (selectedMonthKey && selectedMonthKey !== "all") {
      const parts = selectedMonthKey.split("-");
      if (parts[0]) return parseInt(parts[0], 10) || currentYear;
    }
    return 2026; // Default to 2026 matching screenshot design
  });

  const selectedMonthInfo = useMemo(() => {
    if (!selectedMonthKey || selectedMonthKey === "all") return null;
    const parts = selectedMonthKey.split("-");
    if (parts.length >= 2) {
      const yr = parts[0];
      const mNum = parts[1];
      const mObj = MONTHS_LIST.find((m) => m.num === mNum);
      if (mObj) return { year: yr, month: mObj };
    }
    return null;
  }, [selectedMonthKey]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMonthClick = (mObj) => {
    const monthKey = `${pickerYear}-${mObj.num}`;
    onSelectMonthKey(monthKey);
    setIsOpen(false);
  };

  const handleThisMonth = () => {
    const now = new Date();
    const yr = now.getFullYear();
    const mNum = String(now.getMonth() + 1).padStart(2, "0");
    setPickerYear(yr);
    onSelectMonthKey(`${yr}-${mNum}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    onClear();
    setIsOpen(false);
  };

  const displayLabel = selectedMonthInfo
    ? `${selectedMonthInfo.month.full} ${selectedMonthInfo.year}`
    : "------------ ----";

  return (
    <div
      ref={containerRef}
      className="relative inline-block w-full max-w-[280px] sm:max-w-[300px]"
    >
      {/* Input Box matching screenshot */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full h-[46px] sm:h-[48px] px-4 bg-white border-[1.5px] border-[#0066cc] rounded-[8px] flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30 shadow-sm transition-all text-left group"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span
          className={`text-[15px] sm:text-[16px] font-normal truncate tracking-wider ${selectedMonthInfo ? "text-[#111]" : "text-[#555]"
            }`}
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {displayLabel}
        </span>
        <Calendar
          className="w-5 h-5 text-[#0066cc] shrink-0 ml-2 group-hover:scale-105 transition-transform"
          strokeWidth={1.75}
        />
      </button>

      {/* Popover Calendar Picker Dialog matching screenshot */}
      {isOpen && (
        <div
          className="absolute left-0 z-40 mt-1 w-[280px] sm:w-[300px] bg-white border border-[#0066cc]/40 rounded-[8px] shadow-2xl p-3 animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {/* Year selector header */}
          <div className="flex items-center justify-between bg-[#f1f3f5] px-3 py-1.5 rounded-[4px] mb-3">
            <button
              type="button"
              onClick={() => setPickerYear((y) => y - 1)}
              className="text-[#555] hover:text-[#0066cc] px-1.5 py-0.5 text-sm font-bold cursor-pointer"
            >
              &lt;
            </button>
            <span className="text-[#111] font-semibold text-[15px]">
              {pickerYear}
            </span>
            <button
              type="button"
              onClick={() => setPickerYear((y) => y + 1)}
              className="text-[#555] hover:text-[#0066cc] px-1.5 py-0.5 text-sm font-bold cursor-pointer"
            >
              &gt;
            </button>
          </div>

          {/* 3x4 Month Grid matching screenshot */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {MONTHS_LIST.map((m) => {
              const isSelected =
                selectedMonthInfo &&
                selectedMonthInfo.year === String(pickerYear) &&
                selectedMonthInfo.month.num === m.num;

              return (
                <button
                  key={m.short}
                  type="button"
                  onClick={() => handleMonthClick(m)}
                  className={`py-2 px-1 text-[13px] sm:text-[14px] text-center transition-all cursor-pointer rounded-[4px] ${isSelected
                      ? "bg-[#0066cc] text-white font-bold ring-2 ring-[#0066cc] ring-offset-1"
                      : "text-[#333] hover:bg-[#f0f7ff] hover:text-[#0066cc] font-medium"
                    }`}
                >
                  {m.short}
                </button>
              );
            })}
          </div>

          {/* Footer action links matching screenshot */}
          <div className="flex items-center justify-between border-t border-[#eee] pt-2.5 px-1">
            <button
              type="button"
              onClick={handleClear}
              className="text-[#0066cc] text-[13px] sm:text-[14px] font-medium hover:underline cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleThisMonth}
              className="text-[#0066cc] text-[13px] sm:text-[14px] font-medium hover:underline cursor-pointer"
            >
              This month
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectProgress({
  sidebarLabel = "Milestones In Motion",
  heading = "Crafting Dreams Into Reality",
  description = "Designed with superior construction quality to deliver safe, durable, and comfortable homes.",
  metrics = DEFAULT_METRICS,
  images = [],
  entries = [],
}) {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const descRef = useRef(null);
  const sidebarRef = useRef(null);
  const metricsRef = useRef(null);
  const sliderWrapRef = useRef(null);
  // Held in a ref so the arrow handlers always reach the live instance —
  // Swiper's navigation prop is re-applied on every re-render, so binding the
  // buttons through params.navigation gets torn off as soon as state changes.
  const swiperRef = useRef(null);

  const [fancyboxRoot] = useFancybox();
  const attachFancy = (el) => {
    rootRef.current = el;
    fancyboxRoot(el);
  };

  // Compile all slide images from entries, images props or DEFAULT_IMAGES
  const allSlides = useMemo(() => {
    let combined = [];

    // Extract images from repeatable progress entries if available
    if (Array.isArray(entries) && entries.length > 0) {
      entries.forEach((entry) => {
        const date = entry.date || "";
        const entryTitle = entry.title || "";
        const rawImgs = Array.isArray(entry.images)
          ? entry.images
          : Array.isArray(entry.images?.data)
            ? entry.images.data
            : [];
        rawImgs.forEach((imgItem) => {
          const src = mediaUrl(imgItem) || imgItem.src || (typeof imgItem === "string" ? imgItem : null);
          if (src) {
            combined.push({
              src,
              caption: imgItem.caption || imgItem.attributes?.caption || entryTitle || "",
              alt: imgItem.altText || imgItem.attributes?.alternativeText || entryTitle || "",
              date,
            });
          }
        });
      });
    }

    // Include images prop items
    if (Array.isArray(images) && images.length > 0) {
      images.forEach((img) => {
        if (img?.src && !combined.some((c) => c.src === img.src)) {
          combined.push(img);
        }
      });
    }

    // Fall back to DEFAULT_IMAGES if no images are present
    if (combined.length === 0) {
      combined = DEFAULT_IMAGES;
    }

    return combined.map((img, i) => {
      const fallbackCaption = DEFAULT_IMAGES[i % DEFAULT_IMAGES.length].caption;
      const dateInfo = parseDateInfo(img.date);
      return {
        ...img,
        caption: img.caption || fallbackCaption,
        ...dateInfo,
      };
    });
  }, [entries, images]);

  const [selectedMonthKey, setSelectedMonthKey] = useState("");

  // The filter options are the dates authored in the CMS (progress.entries[].date)
  // — one chip per distinct date, newest first — instead of a free month/year
  // calendar that could offer months with no updates behind them.
  const availableDates = useMemo(() => {
    const seen = new Map();
    allSlides.forEach((slide) => {
      if (slide.date && !seen.has(slide.date)) {
        seen.set(slide.date, slide.formattedDate || slide.date);
      }
    });
    return Array.from(seen, ([key, label]) => ({ key, label })).sort((a, b) =>
      String(b.key).localeCompare(String(a.key))
    );
  }, [allSlides]);

  // Dynamic slide filtering based on selected Year & Month
  const displayedSlides = useMemo(() => {
    if (!selectedMonthKey || selectedMonthKey === "all") return allSlides;
    return allSlides.filter(
      (s) => s.monthKey === selectedMonthKey || s.date?.startsWith(selectedMonthKey)
    );
  }, [allSlides, selectedMonthKey]);

  // A lone slide would sit in the left half of the 2-up track, so it gets its
  // own single-column layout: the wrapper narrows to about one card's width
  // (~40vw, matching a 2-up card inside the 9.375vw page gutters) and stays
  // centred by the existing mx-auto.
  const isSingleSlide = displayedSlides.length === 1;

  const handleSelectMonthKey = (key) => {
    setSelectedMonthKey(key);
  };

  const handleClearFilter = () => {
    setSelectedMonthKey("");
  };

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

      gsap.from(sliderWrapRef.current, {
        autoAlpha: 0,
        y: 60,
        duration: 1.1,
        ease: "expo.out",
        delay: 0.3,
        scrollTrigger: trigger,
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={attachFancy}
      className="relative w-full bg-white pt-[15px] pb-[80px] lg:pt-[4.688vw] lg:pb-[4.688vw] overflow-hidden"
      data-section="project-progress"
    >
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="flex lg:absolute left-[12px] top-[30px] lg:left-[4.167vw] lg:top-[4.688vw] flex-col items-center gap-[8px] md:gap-[12px] lg:gap-[1.094vw] w-auto lg:w-[2.813vw] z-[5] max-lg:static max-lg:!w-full max-lg:flex-row max-lg:!justify-center max-lg:items-center max-lg:!gap-[8px] max-lg:mt-[15px] max-lg:mb-[18px]"
        aria-hidden="true"
      >
        <span className="block w-px h-[28px] md:h-[36px] lg:h-[3.125vw] bg-[#ef493d] max-lg:!w-[28px] max-lg:!h-px" />
        <span
          className="font-montserrat font-medium capitalize whitespace-nowrap text-[#ef493d] text-[12px] md:text-[14px] lg:text-[1.25vw] max-lg:[writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] lg:rotate-180"
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
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
            className="mx-auto mt-[14px] lg:mt-[0.729vw] max-w-[760px] lg:max-w-[49.948vw]
                       text-center text-[#555]
                       text-[14px] leading-[24px]
                       sm:text-[16px] sm:leading-[28px]
                       lg:text-[0.938vw] lg:leading-[1.563vw]"
            style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ) : null}

        {/* Full Calendar Month & Year Date Picker Popover matching screenshot */}
        {/*
        <div className="mt-[20px] lg:mt-[1.5vw] flex justify-center px-4">
          <MonthYearCalendarPicker
            selectedMonthKey={selectedMonthKey}
            onSelectMonthKey={handleSelectMonthKey}
            onClear={handleClearFilter}
          />
        </div>
        */}

        {/* Update date — plain text, taken from the dates set on
            progress.entries in Strapi */}
        {availableDates.length > 0 && (
          <div className="mt-[20px] lg:mt-[1.5vw] flex flex-wrap items-center justify-center gap-x-[16px] gap-y-[6px] lg:gap-x-[1.042vw] px-4 text-center text-[#333]">
            {availableDates.map((d) => (
              <span
                key={d.key}
                className="text-[14px] !font-medium text-[#ef493d] sm:text-[16px] lg:text-[0.938vw] leading-[24px] lg:leading-[1.563vw]"
                style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
              >
                {d.label}
              </span>
            ))}
          </div>
        )}

        <div className="mt-[32px] lg:mt-[2.5vw] flex flex-col items-center gap-[36px] lg:gap-[3.333vw]">
          {/* Image slider */}
          <div
            ref={sliderWrapRef}
            className={`relative w-full min-w-0 mx-auto max-w-[560px] ${
              isSingleSlide ? "lg:max-w-[40vw]" : "lg:max-w-none"
            }`}
          >
            {displayedSlides.length === 0 ? (
              <div className="py-[40px] text-center text-[#777] font-montserrat text-[15px]">
                <p>No progress updates found for the selected date filter.</p>
                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#ef493d] text-white rounded-[6px] text-[14px] font-medium hover:bg-[#d9382d] transition-colors cursor-pointer"
                >
                  Show All Updates
                </button>
              </div>
            ) : (
              <Swiper
                key={`progress-swiper-${selectedMonthKey}-${isSingleSlide ? "single" : "multi"}`}
                modules={[Keyboard, A11y, Autoplay]}
                slidesPerView={1}
                spaceBetween={16}
                breakpoints={
                  isSingleSlide
                    ? undefined
                    : {
                        768: { slidesPerView: 2, spaceBetween: 24 },
                        1024: { slidesPerView: 2, spaceBetween: 28 },
                      }
                }
                speed={650}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                keyboard={{ enabled: true }}
                loop={displayedSlides.length >= 4}
                rewind={displayedSlides.length > 1 && displayedSlides.length < 4}
                onSwiper={(s) => {
                  swiperRef.current = s;
                }}
                className="w-full !overflow-hidden rounded-[16px]"
              >
                {displayedSlides.map((img, idx) => (
                  <SwiperSlide key={`${img.src}-${idx}`} className="!h-auto">
                    <figure className="flex h-full flex-col bg-white">
                      <div className="relative w-full aspect-[657/520] lg:aspect-auto lg:h-[26vw] rounded-[16px] overflow-hidden bg-[#eee] border border-[#e5e5e5] group">
                        <a
                          href={img.src}
                          data-fancybox="progress-gallery"
                          data-caption={`${img.formattedDate ? `[${img.formattedDate}] ` : ""}${img.caption || img.alt || ""}`}
                          className="block w-full h-full"
                        >
                          <Image
                            src={img.src}
                            alt={img.alt || img.caption || ""}
                            fill
                            sizes="(min-width:1024px) 40vw, 100vw"
                            className="object-cover object-center select-none transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        </a>
                      </div>

                      {/* Caption text fetched from backend beneath corresponding card */}
                      <figcaption
                        className="mt-[14px] lg:mt-[1vw] flex flex-col items-center justify-center px-[8px] lg:px-[0.625vw] text-center !text-[#333]"
                      >
                        {img.caption ? (
                          <span
                            className="capitalize text-[16px] leading-[22px] sm:text-[18px] sm:leading-[26px] lg:text-[1.146vw] lg:leading-[1.615vw]"
                            style={{
                              fontFamily:
                                '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                              fontWeight: 400,
                            }}
                          >
                            {img.caption}
                          </span>
                        ) : null}
                      </figcaption>
                    </figure>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            {displayedSlides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slidePrev()}
                  aria-label="Previous progress photo"
                  className="absolute z-[5] top-1/2 -translate-y-1/2
                             left-[-12px] sm:left-[-20px] lg:left-[-1.5vw]
                             inline-flex items-center justify-center rounded-full
                             bg-[#ef493d] text-white shadow-[0_6px_16px_rgba(0,0,0,0.25)]
                             w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] lg:w-[3.092vw] lg:h-[3.092vw]
                             transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ArrowLeft className="w-[18px] h-[18px] lg:w-[1.342vw] lg:h-[1.342vw]" />
                </button>
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slideNext()}
                  aria-label="Next progress photo"
                  className="absolute z-[5] top-1/2 -translate-y-1/2
                             right-[-12px] sm:right-[-20px] lg:right-[-1.5vw]
                             inline-flex items-center justify-center rounded-full
                             bg-[#ef493d] text-white shadow-[0_6px_16px_rgba(0,0,0,0.25)]
                             w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] lg:w-[3.092vw] lg:h-[3.092vw]
                             transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ArrowRight className="w-[18px] h-[18px] lg:w-[1.342vw] lg:h-[1.342vw]" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
