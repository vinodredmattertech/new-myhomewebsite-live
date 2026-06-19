import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import SectionLabel from "@/components/myhome/SectionLabel";
import { mediaUrl } from "@/lib/strapi";

const TARTUFFO =
  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif';

/** Circular 70px nav arrow (reuses the global .mh-nav-arrow chrome). */
function Arrow({ dir, onClick }) {
  const isPrev = dir === "prev";
  return (
    <button
      type="button"
      aria-label={isPrev ? "Previous" : "Next"}
      onClick={onClick}
      className="mh-nav-arrow shrink-0 w-[52px] h-[52px] lg:w-[3.646vw] lg:h-[3.646vw]"
    >
      <svg
        width="22"
        height="14"
        viewBox="0 0 22 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={isPrev ? "" : "rotate-180"}
      >
        <path
          d="M0.293 6.293L6.586 0 8 1.414 4.414 5 22 5v2H4.414L8 10.586 6.586 12 .293 5.707a1 1 0 010-1.414z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}

/** Resolve a CMS slide into the flat shape the carousel consumes. */
function normaliseSlide(raw, idx) {
  return {
    id: raw?.id ?? `slide-${idx}`,
    title: raw?.title || "",
    image: mediaUrl(raw?.image),
  };
}

/**
 * Channel Partner — "Partner Advantages": the centred "Everything You Need to
 * Move Forward" heading + an image carousel with the active slide enlarged in
 * the middle and its neighbours peeking behind on either side. Circular arrows
 * at the far edges rotate the deck.
 *
 * Fully driven by the `advantages` component on the channel-partner-page
 * single type; renders nothing until populated. Desktop sizing uses vw (1920
 * reference); small screens use px.
 */
export default function PartnerAdvantages({ data }) {
  const label = data?.label || "";
  const heading = data?.heading || "";
  const slides = useMemo(() => {
    const raw = Array.isArray(data?.slides) ? data.slides : [];
    return raw.map(normaliseSlide).filter((s) => s.image);
  }, [data]);

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const [active, setActive] = useState(0);

  const count = slides.length;
  const go = (delta) => setActive((i) => (i + delta + count) % count);
  const at = (offset) => slides[(active + offset + count) % count];

  useGSAP(
    () => {
      registerGsap();
      const el = headingRef.current;
      if (!el) return;
      const words = splitToWords(el);
      gsap.from(words, {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.05,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
      });
    },
    { scope: rootRef }
  );

  // Nothing to show until the section is populated in the CMS.
  if (!data || (!heading && !count)) return null;

  const current = slides[active];
  const prev = count > 1 ? at(-1) : null;
  const next = count > 1 ? at(1) : null;

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden
                 pt-[40px] md:pt-[64px] lg:pt-[5.208vw]
                 pb-[64px] md:pb-[90px] lg:pb-[4.167vw]"
    >
      {/* vertical side label */}
      {label && (
        <div className="absolute left-[6px] top-[40px] lg:left-[4.167vw] lg:top-[5.208vw]">
          <SectionLabel>{label}</SectionLabel>
        </div>
      )}

      {/* heading, centred */}
      {heading && (
        <h2
          ref={headingRef}
          className="text-[#333] capitalize text-center will-change-transform leading-[1.04] tracking-[0.021em]
                     px-5 mx-auto max-w-[1265px] lg:max-w-[66vw]
                     text-[36px] xs:text-[44px] sm:text-[60px] md:text-[76px] lg:text-[5vw]"
          style={{ fontFamily: TARTUFFO, fontWeight: 300 }}
        >
          {heading}
        </h2>
      )}

      {/* carousel */}
      {count > 0 && (
        <div className="relative mt-[32px] md:mt-[48px] lg:mt-[3.646vw] max-sm:pr-[24px] max-sm:pl-[40px]">
          {/* peeking neighbours (desktop only) */}
          <div className="relative mx-auto h-[58vw] sm:h-[44vw] lg:h-[33.229vw] max-w-[1920px]">
            {prev && (
              <div
                key={`prev-${prev.id}`}
                aria-hidden="true"
                className="hidden lg:block absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-[78%]
                           w-[51.25vw] aspect-[984/566] overflow-hidden rounded-[0.625vw]
                           opacity-60 scale-[0.9] z-0"
              >
                <Image
                  src={prev.image}
                  alt=""
                  fill
                  unoptimized
                  sizes="51vw"
                  className="object-cover object-center"
                />
              </div>
            )}
            {next && (
              <div
                key={`next-${next.id}`}
                aria-hidden="true"
                className="hidden lg:block absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-[22%]
                           w-[51.25vw] aspect-[984/566] overflow-hidden rounded-[0.625vw]
                           opacity-60 scale-[0.9] z-0"
              >
                <Image
                  src={next.image}
                  alt=""
                  fill
                  unoptimized
                  sizes="51vw"
                  className="object-cover object-center"
                />
              </div>
            )}

            {/* active slide */}
            <div
              key={`active-${current.id}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2]
                         w-[90vw] sm:w-[80vw] lg:w-[57.813vw] aspect-[1110/638]
                         overflow-hidden rounded-[12px] lg:rounded-[0.625vw] shadow-xl"
            >
              <Image
                src={current.image}
                alt={current.title}
                fill
                unoptimized
                sizes="(min-width: 1024px) 58vw, 90vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* edge arrows — desktop only */}
          {count > 1 && (
            <>
              <div className="hidden lg:block absolute z-[3] top-1/2 -translate-y-1/2 left-[7.375vw]">
                <Arrow dir="prev" onClick={() => go(-1)} />
              </div>
              <div className="hidden lg:block absolute z-[3] top-1/2 -translate-y-1/2 right-[7.375vw]">
                <Arrow dir="next" onClick={() => go(1)} />
              </div>
            </>
          )}

          {/* arrows below the slider — mobile / tablet only */}
          {count > 1 && (
            <div className="flex lg:hidden items-center justify-center gap-[20px] mt-[28px] md:mt-[36px]">
              <Arrow dir="prev" onClick={() => go(-1)} />
              <Arrow dir="next" onClick={() => go(1)} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
