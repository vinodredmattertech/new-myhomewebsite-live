import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, A11y, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import SectionLabel from "@/components/myhome/SectionLabel";
import { mediaUrl } from "@/lib/strapi";
import RichText from "@/components/common/RichText";

/**
 * Why Hyderabad — Figma node 3189:4180.
 *
 * Desktop replicates the 1920×1200 Figma frame (= 100vw × 62.5vw) with five
 * cards fanned around a centred "Global Business Hub" card. Each card sits
 * at an absolute position derived from the Figma top/left, then rotated.
 *
 * Card geometry from Figma (centres, on a 1920×1200 canvas).
 * Each Figma card uses `-translate-x-1/2`, so `left-[calc(50%±Npx)]` is the
 * card's CENTRE anchor, not its left edge. Translating to vw:
 *
 *   1 Long-Term Value             centre x≈14.0vw  y≈48vw    rot  0deg
 *   3 Infrastructure Growth       centre x≈30.4vw  y≈48vw    rot -6.25deg
 *   5 Global Business Hub          centre x≈50.0vw  y≈47vw    rot  0deg   (largest, on top)
 *   4 Premium Residential Corr.   centre x≈69.0vw  y≈48vw    rot  +3deg
 *   2 Lifestyle & Community       centre x≈86.6vw  y≈48vw    rot  +8.23deg
 *
 * X centres come straight from Figma. Y centres are nudged ~3.5vw lower than
 * the raw Figma values (Figma had cy≈44.5 / 43.2) — the heading+subheading
 * block renders taller with the Tartuffo-Regular → Cormorant fallback than
 * Figma's Tartuffo Light, so the original Y pulled the fan up against the
 * subheading. The nudge restores Figma's visible gap between text and cards.
 *
 * Adjacent cards overlap by only ~3–5vw on their edges, leaving each card's
 * centred title clearly visible. Below `lg` the layout collapses to a Swiper
 * carousel for full responsiveness.
 */

// Position metadata only — design-fixed per card index. Title + image come
// from backend `cards` repeatable in display order.
const CARD_LAYOUT = [
  { cx: "14.02vw", cy: "48vw", w: "21.22vw", h: "24.52vw", rotate: 0, z: 2 },
  { cx: "30.42vw", cy: "48vw", w: "21.22vw", h: "24.52vw", rotate: -6.25, z: 3 },
  { cx: "50vw",    cy: "47vw", w: "22.76vw", h: "26.30vw", rotate: 0, z: 5 },
  { cx: "69.02vw", cy: "48vw", w: "21.22vw", h: "24.52vw", rotate: 3, z: 3 },
  { cx: "86.60vw", cy: "48vw", w: "21.22vw", h: "24.52vw", rotate: 8.23, z: 2 },
];

function FanCard({ title, image }) {
  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-[10px] lg:rounded-[0.625vw]
                 border-[1.5px] border-solid border-white shadow-[0_4px_60px_0_rgba(0,0,0,0.1)]"
    >
      {image && (
        <Image
          src={image}
          alt={title}
          fill
          unoptimized
          sizes="(min-width:1024px) 22vw, (min-width:640px) 50vw, 90vw"
          className="object-cover object-center select-none"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/45" />
      <p
        className="absolute left-1/2 -translate-x-1/2 bottom-[18px] lg:bottom-[1.667vw]
                   w-[85%] text-center text-white font-montserrat font-normal
                   text-[16px] sm:text-[18px] lg:text-[1.042vw]
                   leading-[1.4] lg:leading-[1.563vw]"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        {title}
      </p>
    </div>
  );
}

export default function NriWhyHyderabad({ data }) {
  // Merge CMS card text + image onto design-fixed positions by index.
  const CARDS = CARD_LAYOUT.map((pos, i) => {
    const c = data?.cards?.[i];
    if (!c) return null;
    return {
      key: `card-${i}`,
      title: c.title || "",
      image: mediaUrl(c.image),
      ...pos,
    };
  }).filter(Boolean);

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const subRef = useRef(null);
  const cardsRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      const words = splitToWords(headingRef.current);
      gsap.from(words, {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.06,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
      });
      gsap.from(subRef.current, {
        y: 30,
        autoAlpha: 0,
        duration: 1.0,
        ease: "expo.out",
        delay: 0.2,
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });
      // ----- Fan cards:
      // Centring lives in pure CSS — each card's `left`/`top` is computed via
      // calc(cx − w/2, cy − h/2), so its top-left corner sits exactly half a
      // card-size up/left of the desired centre. The x-position never depends
      // on GSAP's transform manager, which means rotation + the y/autoAlpha
      // rise animation can compose without GSAP's xPercent/yPercent fighting
      // the rotation matrix.
      //
      // GSAP only owns rotation (set once) and the entry animation. Each card
      // rises from y:240 + autoAlpha:0 → its rotated resting position,
      // staggered from the centre outward. Plays on enter and reverses on
      // leave so the animation re-runs each scroll-through.
      if (cardsRef.current) {
        const cards = Array.from(
          cardsRef.current.querySelectorAll("[data-fan-card]")
        );
        gsap.set(cards, {
          rotation: (_i, el) => parseFloat(el.dataset.rotate || "0"),
          transformOrigin: "50% 50%",
        });
        gsap.from(cards, {
          y: 240,
          autoAlpha: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: {
            each: 0.1,
            from: "center",
          },
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        });
      }
    },
    { scope: rootRef }
  );

  if (!data || !CARDS.length) return null;

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden
                 py-[60px] md:py-[80px] lg:py-0 lg:h-[62.5vw]"
      data-section="nri-why-hyderabad"
    >
      {/* Side label */}
      <div className="absolute left-[4.16vw] top-[4.687vw] hidden lg:block z-[6]">
        <SectionLabel>{data.label}</SectionLabel>
      </div>

      {/* ---------- Heading + subheading (desktop: absolute, mobile: flow) ---------- */}
      <div
        className="px-5 md:px-10 lg:px-0 flex flex-col items-center text-center
                   lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-[4.687vw] lg:w-[52vw] lg:z-[4]"
      >
        <h2
          ref={headingRef}
          className="text-[#333] capitalize will-change-transform leading-[1.05] tracking-[0.02em]
                     text-[32px] xs:text-[40px] sm:text-[52px] md:text-[64px] lg:text-[5vw]"
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
            fontWeight: 300,
          }}
        >
          {data.heading}
        </h2>
        <p
          ref={subRef}
          className="font-montserrat font-normal text-[#333]
                     mt-[18px] md:mt-[22px] lg:mt-[0.677vw]
                     text-[14px] sm:text-[16px] md:text-[18px] lg:text-[1.458vw]
                     leading-[24px] sm:leading-[28px] md:leading-[32px] lg:leading-[2.5vw]
                     max-w-[860px] lg:max-w-none"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <RichText>{data.subTitle}</RichText>
        </p>
      </div>

      {/* ---------- Desktop fan: each card absolutely placed by centre ---------- */}
      <div
        ref={cardsRef}
        className="hidden lg:block absolute inset-0 z-[3] !p-0 "
        aria-hidden="false"
      >
        {CARDS.map((card) => (
          <div
            key={card.key}
            data-fan-card
            data-rotate={card.rotate}
            className="absolute will-change-transform"
            style={{
              // Position top-left corner so the card's CENTRE lands at (cx, cy).
              // Pure CSS centring keeps the x-position rock-solid; GSAP only
              // animates rotation + y/autoAlpha, no xPercent/yPercent in play.
              left: `calc(${card.cx} - ${card.w} / 2)`,
              top: `calc(${card.cy} - ${card.h} / 2)`,
              width: card.w,
              height: card.h,
              zIndex: card.z,
            }}
          >
            <FanCard title={card.title} image={card.image} />
          </div>
        ))}
      </div>

      {/* ---------- Mobile / tablet — Swiper carousel ---------- */}
      <div className="lg:hidden mt-[40px] md:mt-[56px] px-5 md:px-10">
        <Swiper
          modules={[Keyboard, A11y, Pagination]}
          spaceBetween={20}
          slidesPerView={1.1}
          centeredSlides
          keyboard={{ enabled: true }}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 1.6, spaceBetween: 24, centeredSlides: true },
            768: { slidesPerView: 2.2, spaceBetween: 28, centeredSlides: false },
          }}
          className="nri-hyderabad-swiper !pb-[40px]"
        >
          {CARDS.map((card) => (
            <SwiperSlide key={card.key} className="!h-auto">
              <div className="relative w-full aspect-[407/470]">
                <FanCard title={card.title} image={card.image} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .nri-hyderabad-swiper .swiper-pagination-bullet {
          background: #2a2828;
          opacity: 0.3;
        }
        .nri-hyderabad-swiper .swiper-pagination-bullet-active {
          background: #ef493d;
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
