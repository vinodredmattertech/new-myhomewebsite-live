import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { mediaUrl } from "@/lib/strapi";

/* Brand accent used across the page. */
const RED = "#ef493d";
const TARTUFFO =
  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif';

/* Tab icons taken from the Figma design (cleaned to single-colour SVGs that
   inherit `currentColor` via CSS mask). Keyed by the filter `value`; used as a
   fallback whenever the CMS filter has no uploaded icon. */
const LOCAL_TAB_ICONS = {
  all: "/assets/myhome/csr/icons/all.svg",
  education: "/assets/myhome/csr/icons/education.svg",
  healthcare: "/assets/myhome/csr/icons/healthcare.svg",
  "animal-welfare": "/assets/myhome/csr/icons/animal-welfare.svg",
  "rural-development": "/assets/myhome/csr/icons/rural-development.svg",
  "disaster-relief": "/assets/myhome/csr/icons/disaster-relief.svg",
};

/* Category-keyed fallback photos (used until real media is uploaded). */
const FALLBACK_BY_CATEGORY = {
  education: "/assets/myhome/csr/card-1.jpg",
  healthcare: "/assets/myhome/csr/card-2.jpg",
  "animal-welfare": "/assets/myhome/csr/card-2.jpg",
  "rural-development": "/assets/myhome/csr/card-3.jpg",
  "disaster-relief": "/assets/myhome/csr/featured.jpg",
};
const FALLBACK_DEFAULT = "/assets/myhome/csr/featured.jpg";

/* ---- Built-in defaults so the section renders the designed layout even
   before the CSR single type is populated in the admin. ---- */
const DEFAULT_FILTERS = [
  { label: "All", value: "all" },
  { label: "Education", value: "education" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Animal Welfare", value: "animal-welfare" },
  { label: "Rural Development", value: "rural-development" },
  { label: "Disaster Relief", value: "disaster-relief" },
];

const DEFAULT_CARDS = [
  {
    title: "Standing Together When It Mattered Most",
    category: "disaster-relief",
    categoryLabel: "Disaster Relief",
    featured: true,
    date: "March 28, 2026",
    projectLabel: "Our Project",
    excerpt:
      "During the pandemic, My Home Group contributed ₹6 crore to state relief funds — ₹3 crore each to the Governments of Telangana and Andhra Pradesh.",
    ctaLabel: "KNOW MORE",
    ctaUrl: "/csr",
    image: "/assets/myhome/csr/featured.jpg",
  },
  {
    title: "How Business Hubs Are Shaping Residential Demand",
    category: "education",
    categoryLabel: "Education",
    date: "10 Jan, 2026",
    externalUrl: "/csr",
    image: "/assets/myhome/csr/card-1.jpg",
  },
  {
    title: "How Business Hubs Are Shaping Residential Demand",
    category: "rural-development",
    categoryLabel: "Rural Development",
    date: "10 Jan, 2026",
    externalUrl: "/csr",
    image: "/assets/myhome/csr/card-2.jpg",
  },
  {
    title: "How Business Hubs Are Shaping Residential Demand",
    category: "healthcare",
    categoryLabel: "Healthcare",
    date: "10 Jan, 2026",
    externalUrl: "/csr",
    image: "/assets/myhome/csr/card-3.jpg",
  },
];

/** `initiative-card.image` is a *multiple* media field, so Strapi returns
 *  `{ data: [...] }` (or a flat array) rather than the single-media shape
 *  `mediaUrl` understands. Take the first upload, falling back to the plain
 *  single-media / string forms. */
function cardImageUrl(image) {
  if (!image) return null;
  const list = Array.isArray(image) ? image : Array.isArray(image?.data) ? image.data : null;
  if (list) return list.length ? mediaUrl(list[0]) : null;
  return mediaUrl(image) || (typeof image === "string" ? image : null);
}

/** Normalise a raw CSR card component into the flat shape the UI consumes. */
function normaliseCard(raw, idx) {
  const catSlug = raw?.category || "";
  return {
    id: raw?.id ?? `${catSlug}-${idx}`,
    title: raw?.title || "",
    excerpt: raw?.excerpt || "",
    categorySlug: catSlug,
    categoryName: raw?.categoryLabel || "",
    image:
      cardImageUrl(raw?.image) ||
      FALLBACK_BY_CATEGORY[catSlug] ||
      FALLBACK_DEFAULT,
    date: raw?.date || "",
    projectLabel: raw?.projectLabel || "Our Project",
    ctaLabel: raw?.ctaLabel || "KNOW MORE",
    ctaUrl: raw?.ctaUrl || "",
    externalUrl: raw?.externalUrl || raw?.ctaUrl || "",
    featured: !!raw?.featured,
  };
}

/** Tab icon — prefers the CMS-uploaded icon, falls back to the built-in Figma
 *  SVG. Rendered via CSS mask so the (monochrome) glyph recolours with the
 *  tab's text colour: dark when idle, white when the tab is active on red. */
function TabIcon({ filter, className }) {
  const src = mediaUrl(filter?.icon) || LOCAL_TAB_ICONS[filter?.value];
  if (!src) return null;
  return (
    <span
      aria-hidden="true"
      className={`${className} inline-block bg-current`}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
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

/* Circular up-right arrow button used on each initiative card. */
function CardArrow({ href }) {
  const cls =
    "inline-flex shrink-0 items-center justify-center rounded-full border transition-colors duration-300 " +
    "w-[44px] h-[44px] lg:w-[2.604vw] lg:h-[2.604vw] " +
    "border-[#e31f24] text-[#e31f24] hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white";
  const icon = (
    <ArrowUpRight
      className="w-[18px] h-[18px] lg:w-[0.99vw] lg:h-[0.99vw]"
      strokeWidth={1.5}
    />
  );
  if (!href) return <span className={cls}>{icon}</span>;
  return (
    <Link href={href} aria-label="Open initiative" className={cls}>
      {icon}
    </Link>
  );
}

/**
 * CsrInitiatives — "Impact That Reaches Beyond Homes" (CSR page, section 3).
 *
 * Layout mirrors the Figma design:
 *   • centred heading + a single bordered filter bar (icon + label per tab,
 *     the active tab filled red);
 *   • a featured row — large image left, editorial block right (title,
 *     copy + KNOW MORE, a divider and an "Our Project / date" meta row);
 *   • a 3-up row of initiative cards (image, date, title, circular arrow)
 *     with side navigation arrows.
 *
 * Driven by the `initiatives` component on the CSR single type; falls back to
 * built-in defaults (and Figma assets) so the section always renders.
 */
export default function CsrInitiatives({ section }) {
  const sideLabel = section?.label || "Our Key Initatives";
  const title = section?.heading || "Impact That Reaches Beyond Homes";

  const rawCards =
    Array.isArray(section?.cards) && section.cards.length
      ? section.cards
      : DEFAULT_CARDS;
  const items = useMemo(() => rawCards.map(normaliseCard), [rawCards]);

  // Filter tabs: prefer CMS filters; else built-in defaults. "All" is always
  // the first tab — editors don't have to remember to add it in Strapi, and
  // without it the section would open on a single category and hide the rest.
  const tabs = useMemo(() => {
    const defined = Array.isArray(section?.filters) ? section.filters : [];
    const source = defined.length ? defined : DEFAULT_FILTERS;
    const mapped = source
      .map((f) => ({
        slug: f?.value || "",
        value: f?.value || "",
        name: f?.label || "",
        icon: f?.icon,
      }))
      .filter((f) => f.slug && f.name);

    const hasAll = mapped.some((f) => f.slug.toLowerCase() === "all");
    return hasAll
      ? mapped
      : [{ slug: "all", value: "all", name: "All", icon: null }, ...mapped];
  }, [section]);

  const [active, setActive] = useState(tabs[0]?.slug || "all");

  const visible = useMemo(() => {
    if (!active || active === "all") return items;
    return items.filter((i) => i.categorySlug === active);
  }, [items, active]);

  const featured = useMemo(() => {
    if (!visible.length) return null;
    return visible.find((i) => i.featured) || visible[0];
  }, [visible]);

  const cards = useMemo(
    () => visible.filter((i) => i.id !== featured?.id),
    [visible, featured],
  );

  const trackRef = useRef(null);
  const scrollByCards = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9 * (dir === "next" ? 1 : -1);
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section
      data-section="csr-initiatives"
      className="relative w-full overflow-hidden bg-white text-[#333]
                 pt-[48px] pb-[64px] lg:pt-[3.646vw] lg:pb-[5.208vw] max-sm:pl-[20px]"
    >
      {/* Vertical side label — visible on every breakpoint */}
      <div
        className="absolute z-[5] flex flex-col items-center
                   left-[8px] top-[52px] w-[18px] gap-[10px]
                   lg:left-[4.166vw] lg:top-[4.688vw] lg:w-[2.812vw] lg:gap-[1.094vw]"
        style={{ color: RED }}
      >
        <span
          className="block w-px h-[26px] lg:h-[3.125vw]"
          style={{ background: RED }}
        />
        <span
          className="font-medium capitalize whitespace-nowrap text-[11px] lg:text-[1.25vw]"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {sideLabel}
        </span>
      </div>

      {/* Heading */}
      <h2
        className="text-center capitalize leading-[1.1] tracking-[0.02em] px-5
                   text-[32px] xs:text-[38px] sm:text-[52px] md:text-[68px] lg:text-[5vw]"
        style={{ fontFamily: TARTUFFO, fontWeight: 300 }}
      >
        {title}
      </h2>

      {/* ---------------- Filter tabs ---------------- */}
      {tabs.length > 0 && (
        <div className="mt-[28px] lg:mt-[1.823vw] flex justify-center px-5">
          {/* On mobile the tabs wrap so every filter stays visible; on desktop
              they sit in a single bordered row. */}
          <div
            className="flex flex-wrap lg:flex-nowrap justify-center items-stretch
                       border border-[#e7e7e7] max-w-full h-auto lg:h-[3.154vw] max-sm:p-[10px]"
          >
            {tabs.map((t) => {
              const isActive = active === t.slug;
              return (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => setActive(t.slug)}
                  aria-pressed={isActive}
                  className={`flex items-center justify-center gap-[8px] lg:gap-[0.521vw] lg:shrink-0 capitalize
                              font-montserrat transition-colors duration-300
                              px-[14px] sm:px-[20px] lg:px-[.8vw]
                              py-[10px] sm:py-[12px] lg:py-0
                              text-[13px] sm:text-[15px] lg:text-[1.042vw]
                              ${
                                isActive
                                  ? "bg-[#ef493d] text-white"
                                  : "bg-transparent text-[#454545] hover:text-[#ef493d]"
                              }`}
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  <TabIcon
                    filter={t}
                    className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] lg:w-[1.042vw] lg:h-[1.042vw]"
                  />
                  <span className="whitespace-nowrap">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- Featured row ---------------- */}
      {featured && (
        <div className="mt-[32px] lg:mt-[3.125vw] px-5 md:px-10 lg:px-[9.583vw]">
          <div className="grid grid-cols-1 lg:grid-cols-[53.18vw_1fr] gap-[28px] lg:gap-[3.125vw] items-center">
            {/* image */}
            <div
              className="relative w-full overflow-hidden rounded-[8px] lg:rounded-[0.417vw]
                            aspect-[1021/589]"
            >
              <Image
                key={featured.id}
                src={featured.image}
                alt={featured.title}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 53vw"
                className="object-cover object-center"
              />
            </div>

            {/* editorial block */}
            <div className="flex flex-col lg:max-w-[23.333vw]">
              <h3
                className="capitalize leading-[1.15] tracking-[0.02em]
                           text-[24px] sm:text-[30px] lg:text-[1.823vw]"
                style={{ fontFamily: TARTUFFO, fontWeight: 300 }}
              >
                {featured.title}
              </h3>

              {featured.excerpt && (
                <p
                  className="mt-[14px] lg:mt-[0.625vw] text-[#6d6d6d] font-montserrat
                             text-[14px] sm:text-[15px] lg:text-[0.833vw]
                             leading-[26px] sm:leading-[28px] lg:leading-[1.667vw]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {featured.excerpt}{" "}
                  {(featured.ctaUrl || featured.ctaLabel) && (
                    <Link
                      href={featured.ctaUrl || "#"}
                      className="font-medium hover:underline"
                      style={{ color: RED }}
                    >
                      {featured.ctaLabel}
                    </Link>
                  )}
                </p>
              )}

              {/* meta row */}
              <div className="mt-[28px] lg:mt-[1.927vw] w-full lg:w-[17.24vw]">
                <div className="h-px w-full bg-[#33333322]" />
                <div className="mt-[16px] lg:mt-[1.042vw] flex items-center justify-between">
                  <span
                    className="text-[#333] text-[18px] lg:text-[1.146vw]"
                    style={{ fontFamily: TARTUFFO, fontWeight: 300 }}
                  >
                    {featured.projectLabel}
                  </span>
                  {featured.date && (
                    <span
                      className="capitalize text-[#3c3c3a] font-montserrat text-[14px] lg:text-[0.938vw]"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {featured.date}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Cards row ---------------- */}
      {cards.length > 0 && (
        <div className="relative mt-[40px] lg:mt-[3.385vw] px-5 md:px-10 lg:px-[9.583vw]">
          {/* side nav arrows (desktop) */}
          <button
            type="button"
            onClick={() => scrollByCards("prev")}
            aria-label="Previous initiatives"
            className="hidden lg:flex absolute z-[5] left-[2.604vw] top-[12.8vw] -translate-y-1/2
                       items-center justify-center rounded-full border border-black/15 bg-white
                       w-[3.646vw] h-[3.646vw] text-[#333]
                       hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white transition-colors duration-300"
          >
            <ChevronLeft className="w-[1.25vw] h-[1.25vw]" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards("next")}
            aria-label="Next initiatives"
            className="hidden lg:flex absolute z-[5] right-[2.604vw] top-[12.8vw] -translate-y-1/2
                       items-center justify-center rounded-full border border-black/15 bg-white
                       w-[3.646vw] h-[3.646vw] text-[#333]
                       hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white transition-colors duration-300"
          >
            <ChevronRight className="w-[1.25vw] h-[1.25vw]" strokeWidth={1.5} />
          </button>

          <div
            ref={trackRef}
            className="flex gap-[18px] lg:gap-[2.083vw] overflow-x-auto scroll-smooth snap-x snap-mandatory pb-[8px]
                       [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {cards.map((c) => (
              <article
                key={c.id}
                className="snap-start shrink-0 w-full sm:w-[46%]
                           lg:w-[calc((100%-4.166vw)/3)]"
              >
                <div className="relative w-full overflow-hidden rounded-[8px] lg:rounded-[0.417vw] aspect-[494/492]">
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 82vw, (max-width: 1024px) 46vw, 26vw"
                    className="object-cover object-center"
                  />
                </div>

                <div className="mt-[16px] lg:mt-[1.042vw] flex items-end justify-between gap-[16px] lg:gap-[1.04vw]">
                  <div className="min-w-0">
                    {c.date && (
                      <p
                        className="font-montserrat font-medium text-[#33333359]
                                   text-[13px] lg:text-[0.781vw] leading-[1.6]"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {c.date}
                      </p>
                    )}
                    <h4
                      className="mt-[6px] lg:mt-[0.417vw] capitalize text-[#333] font-montserrat font-normal
                                 text-[15px] lg:text-[0.833vw] leading-[22px] lg:leading-[1.354vw]"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {c.title}
                    </h4>
                  </div>
                  <CardArrow href={c.externalUrl} />
                </div>
              </article>
            ))}
          </div>

          {/* mobile nav arrows */}
          <div className="mt-[20px] flex lg:hidden items-center justify-center gap-[12px]">
            <button
              type="button"
              onClick={() => scrollByCards("prev")}
              aria-label="Previous initiatives"
              className="inline-flex items-center justify-center rounded-full border border-black/15
                         w-[40px] h-[40px] text-[#333] hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards("next")}
              aria-label="Next initiatives"
              className="inline-flex items-center justify-center rounded-full border border-black/15
                         w-[40px] h-[40px] text-[#333] hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white transition-colors"
            >
              <ChevronRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
