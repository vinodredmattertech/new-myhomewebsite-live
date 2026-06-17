import React, { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { mediaUrl } from "@/lib/strapi";

const BADGE_COLORS = { red: "#ef493d", gold: "#c39a3e" };

/**
 * EventsExperiences — "Experiences That Bring People Together"
 *
 * The twist: a full-bleed event photo crossfades behind a frosted-glass
 * detail card that overlaps it from the lower-left. The card content
 * (date → title → description → location) is driven off the active slide so
 * the photo and the copy animate together on every advance. A vertical
 * "Recent Event" label rides the left rail; circular prev/next arrows sit at
 * the lower-right of the photo.
 *
 *   Desktop: heading row on top, then the photo+card stage below.
 *   Mobile:  heading, photo, then the card stacked beneath (no overlap).
 */
export default function EventsExperiences({ data }) {
  const EVENTS =
    Array.isArray(data?.items) && data.items.length
      ? data.items.map((e) => ({
          eventDate: e.eventDate || "",
          title: e.title || "",
          description: e.description || "",
          location: e.location || "",
          image: mediaUrl(e.image),
          badge: BADGE_COLORS[e.badgeColor] || BADGE_COLORS.red,
        }))
      : [];

  const bgImage = mediaUrl(data?.backgroundImage);

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const cardRef = useRef(null);
  const swiperRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useGSAP(
    () => {
      registerGsap();
      const words = splitToWords(headingRef.current);
      gsap.set(words, { yPercent: 110, rotate: 4 });
      gsap.to(words, {
        yPercent: 0,
        rotate: 0,
        duration: 1.15,
        stagger: 0.075,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });
    },
    { scope: rootRef }
  );

  // Re-animate the overlay card whenever the active event changes so the copy
  // "lifts" into place in sync with the photo crossfade.
  useGSAP(
    () => {
      if (!cardRef.current) return;
      gsap.fromTo(
        cardRef.current,
        { y: 26, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, ease: "expo.out" }
      );
    },
    { dependencies: [activeIdx], scope: rootRef }
  );

  if (!data || !EVENTS.length) return null;

  const active = EVENTS[activeIdx] || EVENTS[0];

  return (
    <section
      ref={rootRef}
      id="events-experiences"
      data-section="events-experiences"
      className="relative w-full overflow-hidden text-white
                 pt-[56px] pb-[56px]
                 lg:pt-[4.166vw] lg:pb-[4.687vw]"
    >
      {/* Configurable section background image (CMS-driven). Falls back to the
          solid #1b1a1a base color when no image is set. A dark overlay keeps
          the foreground copy readable. */}
      {bgImage && (
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src={bgImage}
            alt={data.heading || "Recent events background"}
            fill
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
            priority={false}
          />
          <div className="absolute inset-0 " />
        </div>
      )}

      {/* Vertical side label on the left rail — kept on the left on mobile too,
          consistent with the desktop design. */}
      <div
        className="absolute z-[5] flex flex-col items-center
                   left-[20px] top-[40px] gap-[11px] w-[28px]
                   lg:left-[4.166vw] lg:top-[14vw] lg:w-[2.812vw] lg:gap-[1.094vw]"
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
          {data.label || "Recent Event"}
        </span>
      </div>

      {/* Centered heading */}
      <div
        className="relative z-[3] flex flex-col items-center text-center
                   px-6 sm:px-10 lg:px-[11.146vw]
                   mx-auto max-w-[1000px] lg:max-w-[66vw]"
      >
        <h2
          ref={headingRef}
          className="capitalize tracking-[0.5px]
                     leading-[1.12] lg:leading-[1.06]
                     text-[30px] xs:text-[34px] sm:text-[42px] md:text-[56px] lg:text-[3.541vw]
                     will-change-transform max-sm:pl-[30px]"
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
          }}
        >
          {data.heading}
        </h2>
      </div>

      {/* ============================================================
           STAGE — crossfading photo with the overlapping glass card
         ============================================================ */}
      <div
        className="relative z-[2] mt-[55px] lg:mt-[3.125vw]
                   px-5 sm:px-8 lg:pl-[11.146vw] lg:pr-[4.166vw]"
      >
        <div className="relative">
          {/* Tilted card behind the photo — gives the stacked, angled look from
              the reference. Desktop only; the front photo card sits straight on
              top of it. */}
          <div
            aria-hidden
            className="hidden lg:block absolute inset-0 z-0
                       rounded-[0.833vw] rotate-[4deg] origin-center
                       bg-[#2a2828]
                       shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]"
          />

          {/* Photo carousel (fade) — front card, sits straight on top. */}
          <div
            className="relative z-[1] w-full overflow-hidden rounded-[10px] lg:rounded-[0.833vw]
                       aspect-[16/11] sm:aspect-[16/9] lg:aspect-[16/8]
                       shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] bg-[#2a2828]"
          >
            <Swiper
              modules={[Navigation, A11y, Autoplay, EffectFade]}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              slidesPerView={1}
              speed={900}
              loop={EVENTS.length > 1}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              onSwiper={(s) => (swiperRef.current = s)}
              onSlideChange={(s) => setActiveIdx(s.realIndex)}
              className="h-full w-full"
            >
              {EVENTS.map((e, i) => (
                <SwiperSlide key={`${e.title}-${i}`} className="!h-full">
                  <div className="relative h-full w-full">
                    {e.image ? (
                      <Image
                        src={e.image}
                        alt={e.title}
                        fill
                        unoptimized
                        sizes="(min-width:1024px) 85vw, 100vw"
                        className="object-cover object-center"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#3a3636] to-[#1f1d1d]" />
                    )}
                    {/* Light scrim toward the lower-left, kept subtle so the
                        photo stays visible behind the white card. */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/45 via-black/15 to-transparent" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* White detail card — overlaps the photo from the lower-left on
              desktop, stacks beneath on mobile. */}
          <div
            ref={cardRef}
            className="relative lg:absolute lg:z-[4] lg:bottom-[2.604vw] lg:left-[2.604vw]
                       mt-[-32px] lg:mt-0 mx-3 lg:mx-0
                       w-auto lg:w-[30vw]
                       rounded-[16px] lg:rounded-[1.25vw]
                       border border-black/[0.06]
                       bg-white
                       shadow-[0_30px_60px_-25px_rgba(0,0,0,0.45)]
                       p-[24px] sm:p-[30px] lg:p-[2.083vw] max-sm:mt-[20px]"
          >
            {/* Date */}
            <span
              className="block font-montserrat font-medium tracking-[0.02em]
                         text-[13px] lg:text-[0.833vw] text-black/45"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {active.eventDate}
            </span>

            {/* Title */}
            <h3
              className="mt-[14px] lg:mt-[0.937vw] capitalize text-[#1b1a1a]
                         text-[22px] sm:text-[26px] lg:text-[1.667vw]
                         leading-[1.25]"
              style={{
                fontFamily:
                  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
              }}
            >
              {active.title}
            </h3>

            {/* Description */}
            <p
              className="mt-[12px] lg:mt-[0.833vw] font-montserrat font-normal text-black/60
                         text-[14px] sm:text-[15px] lg:text-[0.885vw]
                         leading-[22px] lg:leading-[1.458vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {active.description}
            </p>

            {/* Location */}
            {/* {active.location && (
              <p
                className="mt-[14px] lg:mt-[0.937vw] flex items-center gap-[6px]
                           font-montserrat font-medium uppercase tracking-[0.12em]
                           text-[10px] lg:text-[0.625vw] text-black/40"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-[12px] h-[12px] lg:w-[0.78vw] lg:h-[0.78vw]">
                  <path
                    d="M12 21s7-5.686 7-11a7 7 0 10-14 0c0 5.314 7 11 7 11z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                {active.location}
              </p>
            )} */}
          </div>

          {/* Arrows + counter — lower-right of the photo on desktop */}
          <div
            className="mt-[20px] lg:mt-0 flex items-center justify-center lg:justify-end gap-[16px] lg:gap-[1.042vw]
                       lg:absolute lg:z-[5] lg:right-[2.604vw] lg:bottom-[2.604vw]"
          >
            <span className="font-montserrat text-white/70 text-[13px] lg:text-[0.833vw] tracking-[0.12em]">
              {String(activeIdx + 1).padStart(2, "0")} /{" "}
              {String(EVENTS.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              aria-label="Previous event"
              onClick={() => swiperRef.current?.slidePrev()}
              className="group inline-flex items-center justify-center rounded-full border border-white/40 text-white
                         w-[44px] h-[44px] lg:w-[3.125vw] lg:h-[3.125vw]
                         transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                         hover:bg-white hover:text-[#1b1a1a]"
            >
              <svg viewBox="0 0 22 14" fill="none" className="w-[18px] lg:w-[1.042vw] h-auto">
                <path
                  d="M0.293 6.293L6.586 0 8 1.414 4.414 5 22 5v2H4.414L8 10.586 6.586 12 .293 5.707a1 1 0 010-1.414z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next event"
              onClick={() => swiperRef.current?.slideNext()}
              className="group inline-flex items-center justify-center rounded-full text-white
                         w-[44px] h-[44px] lg:w-[3.125vw] lg:h-[3.125vw]
                         transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                         hover:scale-110"
              style={{ background: active.badge }}
            >
              <svg viewBox="0 0 22 14" fill="none" className="w-[18px] lg:w-[1.042vw] h-auto">
                <path
                  d="M21.707 7.707L15.414 14 14 12.586 17.586 9H0V7h17.586L14 3.414 15.414 2l6.293 6.293a1 1 0 010 1.414z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
