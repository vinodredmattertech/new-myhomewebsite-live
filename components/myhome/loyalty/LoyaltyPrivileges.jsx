import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { Check, Images, Compass, Users, Play } from "lucide-react";
import SectionLabel from "@/components/myhome/SectionLabel";
import { mediaUrl } from "@/lib/strapi";
import SectionHeading from "@/components/common/SectionHeading";

const TARTUFFO =
  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif';

/* Lucide icons are UI chrome (not content) — used to render a filter tab when
   the CMS filter has no uploaded icon. Keyed by the filter `value`. */
const TAB_ICONS = {
  all: Check,
  gallery: Images,
  "virtual-tour": Compass,
  community: Users,
};

/** Resolve a CMS gallery item into the flat shape the UI consumes. */
function normaliseItem(raw, idx) {
  return {
    id: raw?.id ?? `item-${idx}`,
    title: raw?.title || "",
    category: raw?.category || "",
    mediaType: raw?.mediaType || "image",
    videoUrl: raw?.videoUrl || "",
    image: mediaUrl(raw?.image),
  };
}

/** Tab icon — CMS-uploaded icon (recoloured via mask) or a lucide fallback. */
function TabIcon({ filter, className }) {
  const cms = mediaUrl(filter?.icon);
  if (cms) {
    return (
      <span
        aria-hidden="true"
        className={`${className} inline-block bg-current`}
        style={{
          WebkitMaskImage: `url(${cms})`,
          maskImage: `url(${cms})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    );
  }
  const Icon = TAB_ICONS[filter?.value] || Check;
  return <Icon className={className} strokeWidth={1.8} />;
}

/**
 * Loyalty Programme — "Ownership That Gives More" intro split + the
 * "Privileges Designed Around You" filterable media gallery.
 *
 * Fully driven by the `privileges` component on the loyalty-page single type;
 * renders nothing until the section is populated in the admin.
 * Desktop sizing uses vw (1920 reference); small screens use px.
 */
export default function LoyaltyPrivileges({ data, headingAs = "h2" }) {
  const label = data?.label || "";
  const heading = data?.heading || "";
  const paragraphs = useMemo(
    () =>
      data?.intro
        ? String(data.intro)
            .split(/\n\s*\n/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    [data]
  );
  const image = mediaUrl(data?.image);
  const imageAlt = data?.imageAlt || "";
  const galleryLabel = data?.galleryLabel || "";
  const galleryHeading = data?.galleryHeading || "";

  const filters = useMemo(() => {
    const defined = Array.isArray(data?.filters) ? data.filters : [];
    return defined
      .map((f) => ({ label: f?.label || "", value: f?.value || "", icon: f?.icon }))
      .filter((f) => f.label && f.value);
  }, [data]);

  const items = useMemo(() => {
    const raw = Array.isArray(data?.items) ? data.items : [];
    return raw.map(normaliseItem).filter((i) => i.image);
  }, [data]);

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const galleryHeadingRef = useRef(null);
  const [activeTab, setActiveTab] = useState(filters[0]?.value || "all");

  // Content updates with the selected filter.
  const visibleItems = useMemo(() => {
    if (!activeTab || activeTab === "all") return items;
    const filtered = items.filter((i) => i.category === activeTab);
    return filtered.length ? filtered : items;
  }, [items, activeTab]);

  useGSAP(
    () => {
      registerGsap();
      [headingRef.current, galleryHeadingRef.current].forEach((el) => {
        if (!el) return;
        const words = splitToWords(el);
        gsap.from(words, {
          yPercent: 110,
          duration: 1.1,
          stagger: 0.05,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
    },
    { scope: rootRef }
  );

  // Nothing to show until the section is populated in the CMS.
  if (!data || (!heading && !items.length)) return null;

  const hasGallery = !!(galleryHeading || items.length);

  return (
    <section ref={rootRef} className="relative w-full bg-white overflow-hidden">
      {/* ===== Ownership That Gives More ===== */}
      {(heading || paragraphs.length || image) && (
        <div className="relative pt-[64px] md:pt-[90px] lg:pt-[7.292vw]">
          {label && (
            <div className="lg:absolute left-[6px] top-[60px] lg:left-[4.167vw] lg:top-[4.688vw] max-lg:static max-lg:w-full max-lg:flex max-lg:justify-center max-lg:mt-[15px] max-lg:mb-[18px]">
              <SectionLabel>{label}</SectionLabel>
            </div>
          )}

          <div className="pr-5 pl-5 md:px-10 lg:px-[9.896vw]">
            <div className="grid grid-cols-1 lg:grid-cols-[39.375vw_1fr] gap-y-[32px] gap-x-[40px] lg:gap-x-[4.635vw] items-start">
              {/* left: heading + copy */}
              <div className="flex flex-col">
                <SectionHeading
                  as={headingAs}
                  ref={headingRef}
                  className="text-[#333] capitalize will-change-transform leading-[1.06] tracking-[0.021em]
                             text-[40px] xs:text-[46px] sm:text-[58px] md:text-[72px] lg:text-[5vw]"
                >
                  {heading}
                </SectionHeading>

                {paragraphs.length > 0 && (
                  <div className="mt-[24px] md:mt-[32px] lg:mt-[1.823vw] flex flex-col gap-[18px] lg:gap-[1.25vw]">
                    {paragraphs.map((p, i) => (
                      <p
                        key={i}
                        className="font-montserrat text-[#555]
                                   text-[15px] sm:text-[16px] md:text-[17px] lg:text-[0.938vw]
                                   leading-[26px] sm:leading-[28px] lg:leading-[1.563vw]"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* right: image */}
              {image && (
                <div className="relative w-full overflow-hidden rounded-[12px] lg:rounded-[0.625vw]
                                aspect-[745/555]">
                  <Image
                    src={image}
                    alt={imageAlt}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 39vw, 100vw"
                    className="object-cover object-center"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== Privileges Designed Around You ===== */}
      {hasGallery && (
        <div className="relative mt-[64px] md:mt-[96px] lg:mt-[6.25vw] pb-[64px] md:pb-[96px] lg:pb-[6.25vw]">
          {galleryLabel && (
            <div className="lg:absolute left-[6px] top-[4px] lg:left-[4.167vw] lg:top-[9.5vw] max-lg:static max-lg:w-full max-lg:flex max-lg:justify-center max-lg:mt-[15px] max-lg:mb-[18px]">
              <SectionLabel>{galleryLabel}</SectionLabel>
            </div>
          )}

          {galleryHeading && (
            <h2
              ref={galleryHeadingRef}
              className="text-[#333] capitalize text-center will-change-transform leading-[1.08] tracking-[0.021em]
                         px-5 text-[30px] xs:text-[34px] sm:text-[44px] md:text-[54px] lg:text-[3.438vw]"
              style={{ fontFamily: TARTUFFO, fontWeight: 300 }}
            >
              {galleryHeading}
            </h2>
          )}

          {/* filter tabs — wrap on mobile so every option stays visible */}
          {filters.length > 0 && (
            <div className="mt-[28px] md:mt-[36px] lg:mt-[2.135vw] flex justify-center px-5">
              <div className="flex flex-wrap lg:flex-nowrap justify-center items-stretch
                              border border-[#e7e7e7] max-w-full h-auto lg:h-[3.854vw]">
                {filters.map((tab) => {
                  const isActive = activeTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setActiveTab(tab.value)}
                      aria-pressed={isActive}
                      className={`flex items-center justify-center gap-[8px] lg:gap-[0.625vw] lg:shrink-0 capitalize
                                  font-montserrat transition-colors duration-300
                                  px-[14px] sm:px-[22px] lg:px-[1.354vw]
                                  py-[10px] sm:py-[12px] lg:py-0
                                  text-[14px] sm:text-[16px] lg:text-[1.042vw]
                                  ${
                                    isActive
                                      ? "bg-[#ef493d] text-white"
                                      : "bg-transparent text-[#454545] hover:text-[#ef493d]"
                                  }`}
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      <TabIcon
                        filter={tab}
                        className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] lg:w-[1.042vw] lg:h-[1.042vw]"
                      />
                      <span className="whitespace-nowrap">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* gallery media — updates with the active filter */}
          {visibleItems.length > 0 && (
            <div className="mt-[28px] md:mt-[40px] lg:mt-[2.604vw] px-5 md:px-10 lg:px-[7.917vw]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] lg:gap-[1.25vw]">
                {visibleItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`group relative w-full overflow-hidden rounded-[14px] lg:rounded-[0.833vw]
                                aspect-[1616/725]
                                ${idx === 0 ? "lg:col-span-2" : ""}`}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      unoptimized
                      sizes={idx === 0 ? "(min-width: 1024px) 84vw, 100vw" : "(min-width: 1024px) 42vw, 100vw"}
                      className="object-cover object-center transition-transform duration-[1200ms] ease-premium group-hover:scale-[1.03]"
                    />
                    {item.mediaType === "video" && (
                      <button
                        type="button"
                        onClick={() =>
                          item.videoUrl &&
                          window.open(item.videoUrl, "_blank", "noopener,noreferrer")
                        }
                        aria-label="Play video"
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                   flex items-center justify-center rounded-full bg-[#ef493d] text-white border-0 p-0
                                   shadow-lg transition-transform duration-300 hover:scale-110
                                   w-[52px] h-[52px] lg:w-[3.6vw] lg:h-[3.6vw]"
                      >
                        <Play
                          className="ml-[2px] w-[20px] h-[20px] lg:w-[1.25vw] lg:h-[1.25vw] fill-current"
                          strokeWidth={0}
                        />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
