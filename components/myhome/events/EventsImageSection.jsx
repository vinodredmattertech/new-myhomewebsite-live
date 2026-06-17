import React, { useMemo, useState } from "react";
import Image from "next/image";
import { mediaUrl } from "@/lib/strapi";

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/**
 * Pull a { key, label } month out of a free-text event date such as
 * "10 Jan 2026" or "02 February 2026". `key` ("2026-02") is used for grouping
 * and matching; `label` ("February 2026") is what the dropdown shows.
 */
function parseMonth(dateStr) {
  if (!dateStr) return null;
  const tokens = String(dateStr).toLowerCase().split(/[\s,]+/).filter(Boolean);
  let monthIdx = -1;
  let year = "";
  for (const tk of tokens) {
    if (tk.length >= 3) {
      const idx = MONTH_NAMES.findIndex((m) => m.startsWith(tk));
      if (idx >= 0) monthIdx = idx;
    }
    if (/^\d{4}$/.test(tk)) year = tk;
  }
  if (monthIdx < 0) return null;
  const name = MONTH_NAMES[monthIdx];
  const label = `${name[0].toUpperCase()}${name.slice(1)}`;
  const key = `${year || "0000"}-${String(monthIdx + 1).padStart(2, "0")}`;
  return { key, label };
}

/**
 * Build a featured-card shape from a moment card, falling back to the
 * CMS-curated featured event for the fields a card doesn't carry (description,
 * location, button copy). Used to swap the big featured card per active filter.
 */
function featuredFromCard(card, base) {
  if (!card) return base;
  return {
    imageUrl: card.image || base?.imageUrl || "",
    title: card.title || base?.title || "",
    description: base?.description || "",
    eventType: card.categoryLabel || base?.eventType || "",
    location: base?.location || "",
    eventDate: card.eventDate || base?.eventDate || "",
    tags: card.categoryLabel ? [card.categoryLabel] : base?.tags || [],
    buttonLabel: base?.buttonLabel || "See Moments",
    buttonLink: card.externalLink || base?.buttonLink || "",
  };
}

/**
 * EventsImageSection — "Moments" gallery shown directly below
 * EventsExperiences on the events page.
 *
 * Layout:
 *   • A row of filter tabs (All / Launches / Celebrations / …) that filter the
 *     card grid client-side by each card's `category`.
 *   • A featured event card — large photo + tag pills on the left, copy and an
 *     "Event Details" block with a "See Moments" button on the right.
 *   • A responsive grid of moment cards. Each card carries a category badge,
 *     date, title and a circular arrow button that opens an external link.
 *
 * Every field is CMS-driven (events.image-section component). The section
 * render-skips when no data is present.
 */
export default function EventsImageSection({ data }) {
  const filters = useMemo(
    () =>
      Array.isArray(data?.filters) && data.filters.length
        ? data.filters
            .map((f) => ({ label: f?.label || "", value: f?.value || "" }))
            .filter((f) => f.label)
        : [],
    [data]
  );

  const cards = useMemo(
    () =>
      Array.isArray(data?.cards)
        ? data.cards.map((c) => ({
            image: mediaUrl(c.image),
            category: c.category || "",
            categoryLabel: c.categoryLabel || "",
            eventDate: c.eventDate || "",
            title: c.title || "",
            externalLink: c.externalLink || "",
          }))
        : [],
    [data]
  );

  // CMS-curated featured event — the default shown when no filter is applied.
  const baseFeatured = useMemo(() => {
    const f = data?.featured;
    if (!f) return null;
    return {
      imageUrl: mediaUrl(f.image),
      title: f.title || "",
      description: f.description || "",
      eventType: f.eventType || "",
      location: f.location || "",
      eventDate: f.eventDate || "",
      tags: Array.isArray(f.tags)
        ? f.tags.map((t) => t?.label).filter(Boolean)
        : [],
      buttonLabel: f.buttonLabel || "",
      buttonLink: f.buttonLink || "",
    };
  }, [data]);

  const [activeFilter, setActiveFilter] = useState(filters[0]?.value || "all");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthOpen, setMonthOpen] = useState(false);

  // Distinct months derived from the cards, newest first — feeds the dropdown.
  const availableMonths = useMemo(() => {
    const map = new Map();
    cards.forEach((c) => {
      const m = parseMonth(c.eventDate);
      if (m && !map.has(m.key)) map.set(m.key, m);
    });
    return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [cards]);

  const visibleCards = useMemo(() => {
    if (activeFilter === "month") {
      if (!selectedMonth) return cards;
      return cards.filter((c) => parseMonth(c.eventDate)?.key === selectedMonth);
    }
    if (!activeFilter || activeFilter === "all") return cards;
    return cards.filter((c) => c.category === activeFilter);
  }, [cards, activeFilter, selectedMonth]);

  // The big featured card tracks the active filter: with a category (or a chosen
  // month) selected it shows that group's first moment; otherwise the CMS one.
  const activeFeatured = useMemo(() => {
    const narrowed =
      activeFilter &&
      activeFilter !== "all" &&
      !(activeFilter === "month" && !selectedMonth);
    if (narrowed && visibleCards.length) {
      return featuredFromCard(visibleCards[0], baseFeatured);
    }
    return baseFeatured;
  }, [activeFilter, selectedMonth, visibleCards, baseFeatured]);

  const handleFilterClick = (f) => {
    if (f.value === "month") {
      setActiveFilter("month");
      setMonthOpen((open) => !open);
      return;
    }
    setActiveFilter(f.value || "all");
    setSelectedMonth(null);
    setMonthOpen(false);
  };

  const handleMonthPick = (key) => {
    setSelectedMonth(key);
    setMonthOpen(false);
  };

  const featured = activeFeatured;
  const featuredImage = activeFeatured?.imageUrl || "";
  const featuredTags = activeFeatured?.tags || [];

  if (!data || (!baseFeatured && !cards.length)) return null;

  return (
    <section
      id="events-image-section"
      data-section="events-image-section"
      className="relative w-full overflow-hidden bg-white text-[#1b1a1a]
                 pt-[56px] pb-[64px]
                 lg:pt-[4.166vw] lg:pb-[5.208vw]"
    >
      {/* Vertical side label on the left rail */}
      <div
        className="absolute z-[5] flex flex-col items-center
                   left-[20px] top-[40px] gap-[11px] w-[28px] max-sm:top-[20px] max-sm:left-[10px]
                   lg:left-[4.166vw] lg:top-[3.5vw] lg:w-[2.812vw] lg:gap-[1.094vw]"
        style={{ color: "rgb(239, 73, 61)" }}
      >
        <span
          className="block w-px h-[31px] lg:h-[3.125vw]"
          style={{ background: "rgb(239, 73, 61)" }}
        />
        <span
          className="font-montserrat font-medium capitalize whitespace-nowrap text-[12px] lg:text-[1.25vw]"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {data.label || "Featured Event"}
        </span>
      </div>

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-[11.146vw]">
        {/* Accessible section heading (the design shows no visible title here,
            so it is kept screen-reader-only for structure/SEO). */}
        {data.heading && <h2 className="sr-only">{data.heading}</h2>}

        {/* ---------------- Filter tabs ---------------- */}
        {filters.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-[10px] lg:gap-[0.833vw]">
            {filters.map((f) => {
              const isMonth = f.value === "month";
              const isActive = isMonth
                ? activeFilter === "month"
                : activeFilter === f.value;
              const pillClass = `font-montserrat font-medium rounded-full border transition-colors duration-300
                              px-[16px] py-[8px] text-[12px]
                              lg:px-[1.146vw] lg:py-[0.625vw] lg:text-[0.833vw]
                              ${
                                isActive
                                  ? "bg-[#ef493d] border-[#ef493d] text-white"
                                  : "bg-white border-black/10 text-black/70 hover:border-black/30"
                              }`;

              if (isMonth) {
                const selected = availableMonths.find(
                  (m) => m.key === selectedMonth
                );
                return (
                  <div key="month" className="relative">
                    <button
                      type="button"
                      onClick={() => handleFilterClick(f)}
                      aria-haspopup="listbox"
                      aria-expanded={monthOpen}
                      className={`${pillClass} inline-flex items-center gap-[6px] lg:gap-[0.417vw]`}
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {selected ? selected.label : f.label}
                      <svg
                        viewBox="0 0 12 8"
                        fill="none"
                        aria-hidden="true"
                        className={`w-[10px] lg:w-[0.625vw] h-auto transition-transform duration-300 ${
                          monthOpen ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          d="M1 1.5L6 6.5L11 1.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {monthOpen && (
                      <div
                        role="listbox"
                        className="absolute left-1/2 z-20 mt-[8px] lg:mt-[0.521vw] -translate-x-1/2
                                   min-w-[160px] lg:min-w-[10vw] max-h-[260px] overflow-auto
                                   rounded-[10px] lg:rounded-[0.625vw] border border-black/10 bg-white
                                   p-[6px] lg:p-[0.417vw] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)]"
                      >
                        <button
                          type="button"
                          onClick={() => handleMonthPick(null)}
                          className={`block w-full rounded-[6px] px-[12px] py-[8px] text-left
                                      font-montserrat text-[12px] lg:text-[0.833vw] transition-colors duration-200
                                      ${
                                        selectedMonth === null
                                          ? "bg-[#ef493d]/10 text-[#ef493d]"
                                          : "text-black/70 hover:bg-black/5"
                                      }`}
                          style={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          All Months
                        </button>
                        {availableMonths.map((m) => (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() => handleMonthPick(m.key)}
                            className={`block w-full rounded-[6px] px-[12px] py-[8px] text-left
                                        font-montserrat text-[12px] lg:text-[0.833vw] transition-colors duration-200
                                        ${
                                          selectedMonth === m.key
                                            ? "bg-[#ef493d]/10 text-[#ef493d]"
                                            : "text-black/70 hover:bg-black/5"
                                        }`}
                            style={{ fontFamily: "Montserrat, sans-serif" }}
                          >
                            {m.label}
                          </button>
                        ))}
                        {availableMonths.length === 0 && (
                          <span
                            className="block px-[12px] py-[8px] font-montserrat text-[12px] lg:text-[0.833vw] text-black/40"
                            style={{ fontFamily: "Montserrat, sans-serif" }}
                          >
                            No dated moments
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={f.value || f.label}
                  type="button"
                  onClick={() => handleFilterClick(f)}
                  className={pillClass}
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ---------------- Featured event ---------------- */}
        {featured && (
          <div
            className="mt-[34px] lg:mt-[2.604vw]
                       grid grid-cols-1 lg:grid-cols-[1.55fr_1fr]
                       gap-[28px] lg:gap-[2.604vw] items-start"
          >
            {/* Photo + tag pills */}
            <div
              className="relative w-full overflow-hidden rounded-[10px] lg:rounded-[0.833vw]
                         aspect-[16/10] bg-[#2a2828]"
            >
              {featuredImage ? (
                <Image
                  src={featuredImage}
                  alt={featured.title || "Featured event"}
                  fill
                  unoptimized
                  sizes="(min-width:1024px) 50vw, 100vw"
                  className="object-cover object-center"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#3a3636] to-[#1f1d1d]" />
              )}

              {featuredTags.length > 0 && (
                <div className="absolute right-[14px] top-[14px] lg:right-[1.042vw] lg:top-[1.042vw] flex flex-wrap justify-end gap-[8px] lg:gap-[0.521vw]">
                  {featuredTags.map((t, i) => (
                    <span
                      key={`${t}-${i}`}
                      className="font-montserrat font-medium rounded-full bg-white/95 text-[#1b1a1a]
                                 px-[12px] py-[6px] text-[11px]
                                 lg:px-[0.833vw] lg:py-[0.417vw] lg:text-[0.729vw]
                                 shadow-[0_6px_18px_-8px_rgba(0,0,0,0.4)]"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Copy + event details */}
            <div className="flex flex-col">
              <h3
                className="capitalize text-[#1b1a1a]
                           text-[24px] sm:text-[28px] lg:text-[1.875vw]
                           leading-[1.18]"
                style={{
                  fontFamily:
                    '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                }}
              >
                {featured.title}
              </h3>

              {featured.description && (
                <p
                  className="mt-[12px] lg:mt-[0.833vw] font-montserrat font-normal text-black/55
                             text-[14px] lg:text-[0.885vw] leading-[22px] lg:leading-[1.458vw]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {featured.description}
                </p>
              )}

              <div className="mt-[22px] lg:mt-[1.563vw]">
                <h4
                  className="text-[#1b1a1a] text-[18px] lg:text-[1.25vw]"
                  style={{
                    fontFamily:
                      '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                  }}
                >
                  Event Details
                </h4>
                <span className="mt-[10px] lg:mt-[0.625vw] block h-px w-full bg-black/10" />

                <dl className="mt-[14px] lg:mt-[0.937vw] flex flex-col gap-[12px] lg:gap-[0.833vw]">
                  {[
                    ["Event Type", featured.eventType],
                    ["Location", featured.location],
                    ["Date", featured.eventDate],
                  ]
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between font-montserrat
                                   text-[13px] lg:text-[0.833vw]"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        <dt className="text-black/40">{k}</dt>
                        <dd className="text-black/80 font-medium text-right">{v}</dd>
                      </div>
                    ))}
                </dl>
              </div>

              {featured.buttonLabel &&
                (featured.buttonLink ? (
                  <a
                    href={featured.buttonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-[24px] lg:mt-[1.667vw] inline-flex w-max items-center
                               rounded-full border border-[#ef493d] text-[#ef493d]
                               font-montserrat font-medium transition-colors duration-300
                               px-[22px] py-[11px] text-[13px]
                               lg:px-[1.563vw] lg:py-[0.781vw] lg:text-[0.833vw]
                               hover:bg-[#ef493d] hover:text-white"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {featured.buttonLabel}
                  </a>
                ) : (
                  <span
                    className="mt-[24px] lg:mt-[1.667vw] inline-flex w-max items-center
                               rounded-full border border-[#ef493d] text-[#ef493d]
                               font-montserrat font-medium
                               px-[22px] py-[11px] text-[13px]
                               lg:px-[1.563vw] lg:py-[0.781vw] lg:text-[0.833vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {featured.buttonLabel}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* ---------------- Card grid ---------------- */}
        {visibleCards.length > 0 && (
          <div
            className="mt-[34px] lg:mt-[2.604vw]
                       grid grid-cols-1 sm:grid-cols-2
                       gap-x-[24px] gap-y-[40px] lg:gap-x-[2.083vw] lg:gap-y-[3.125vw]"
          >
            {visibleCards.map((c, i) => (
              <article key={`${c.title}-${i}`} className="flex flex-col">
                <div
                  className="relative w-full overflow-hidden rounded-[10px] lg:rounded-[0.833vw]
                             aspect-[16/9] bg-[#2a2828]"
                >
                  {c.image ? (
                    <Image
                      src={c.image}
                      alt={c.title || c.categoryLabel || "Event moment"}
                      fill
                      unoptimized
                      sizes="(min-width:1024px) 40vw, 100vw"
                      className="object-cover object-center"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#3a3636] to-[#1f1d1d]" />
                  )}

                  {c.categoryLabel && (
                    <span
                      className="absolute right-[14px] top-[14px] lg:right-[1.042vw] lg:top-[1.042vw]
                                 font-montserrat font-medium rounded-full bg-white/95 text-[#1b1a1a]
                                 px-[12px] py-[6px] text-[11px]
                                 lg:px-[0.833vw] lg:py-[0.417vw] lg:text-[0.729vw]
                                 shadow-[0_6px_18px_-8px_rgba(0,0,0,0.4)]"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {c.categoryLabel}
                    </span>
                  )}
                </div>

                <div className="mt-[16px] lg:mt-[1.042vw] flex items-start justify-between gap-[16px]">
                  <div className="flex-1">
                    {c.eventDate && (
                      <span
                        className="block font-montserrat text-black/40
                                   text-[12px] lg:text-[0.781vw]"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {c.eventDate}
                      </span>
                    )}
                    {c.title && (
                      <p
                        className="mt-[8px] lg:mt-[0.521vw] font-montserrat font-normal text-black/70
                                   text-[14px] lg:text-[0.885vw] leading-[21px] lg:leading-[1.354vw]"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {c.title}
                      </p>
                    )}
                  </div>

                  {/* External-link arrow */}
                  {c.externalLink ? (
                    <a
                      href={c.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${c.title || "event"}`}
                      className="group mt-[2px] inline-flex shrink-0 items-center justify-center rounded-full
                                 border border-[#ef493d] text-[#ef493d]
                                 w-[40px] h-[40px] lg:w-[2.604vw] lg:h-[2.604vw]
                                 transition-colors duration-300 hover:bg-[#ef493d] hover:text-white"
                    >
                      <svg
                        viewBox="0 0 22 14"
                        fill="none"
                        className="w-[16px] lg:w-[0.937vw] h-auto"
                      >
                        <path
                          d="M21.707 7.707L15.414 14 14 12.586 17.586 9H0V7h17.586L14 3.414 15.414 2l6.293 6.293a1 1 0 010 1.414z"
                          fill="currentColor"
                        />
                      </svg>
                    </a>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="mt-[2px] inline-flex shrink-0 items-center justify-center rounded-full
                                 border border-black/15 text-black/30
                                 w-[40px] h-[40px] lg:w-[2.604vw] lg:h-[2.604vw]"
                    >
                      <svg
                        viewBox="0 0 22 14"
                        fill="none"
                        className="w-[16px] lg:w-[0.937vw] h-auto"
                      >
                        <path
                          d="M21.707 7.707L15.414 14 14 12.586 17.586 9H0V7h17.586L14 3.414 15.414 2l6.293 6.293a1 1 0 010 1.414z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
