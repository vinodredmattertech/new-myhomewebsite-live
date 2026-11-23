import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { registerGsap, ScrollTrigger } from "@/lib/gsapSetup";
import { mediaUrl } from "@/lib/strapi";
import HomeBannerLeadPopup from "@/components/myhome/HomeBannerLeadPopup";

const AUTOPLAY_DELAY = 15000;

/**
 * Homepage-only hero banner (used by `pages/index.js`).
 *
 * Cinematic "Welcome HOME" loader, then CMS-driven media.
 *
 * Unlimited slides come from the Home Page admin field `heroSlides`
 * (or nested `hero.slides`). Add as many entries as you need in Strapi —
 * each can have its own image + anchor/URL.
 *
 * Click behaviour:
 *   - slide has link  → navigate there
 *   - no link         → open enquire popup
 *
 * With zero published slides, falls back to the legacy single hero image /
 * video + optional `ctaLink`.
 */
export default function HeroBanner({ data, slides: pageSlides }) {
  const rootRef = useRef(null);
  const bgRef = useRef(null);
  const loaderRef = useRef(null);
  const welcomeRef = useRef(null);
  const subtitleRef = useRef(null);
  const shimmerRef = useRef(null);
  const copyHeadingRef = useRef(null);
  const copyBodyRef = useRef(null);
  const swiperRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [leadOpen, setLeadOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const ctaLabel = String(data?.ctaText || "").trim();
  const headingLine1 = String(data?.headingLine1 || "").trim();
  const headingLine2 = String(data?.headingLine2 || "").trim();
  const hasCopyHeading = Boolean(headingLine1 || headingLine2);
  const LoaderTitle = hasCopyHeading ? "h2" : "h1";

  const [isMobileView, setIsMobileView] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsMobileView(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const items = useMemo(() => {
    const raw = [
      ...(Array.isArray(data?.slides) ? data.slides : []),
      ...(Array.isArray(pageSlides) ? pageSlides : []),
    ];

    const normalised = raw
      .map((slide, i) => {
        const desktop = mediaUrl(slide?.desktopImage);
        const mobile = mediaUrl(slide?.mobileImage);
        if (!desktop && !mobile) return null;
        const href = String(
          slide?.link ||
            slide?.url ||
            slide?.href ||
            slide?.anchor ||
            slide?.ctaLink ||
            ""
        ).trim();
        return {
          key: slide?.id ?? `slide-${i}`,
          desktop: desktop || mobile,
          mobile: mobile || desktop,
          alt: slide?.imageAlt || slide?.alt || ctaLabel || "My Home Group",
          href: href || null,
          newTab: Boolean(slide?.openInNewTab),
        };
      })
      .filter(Boolean);

    if (normalised.length) return normalised;

    const desktop = mediaUrl(data?.desktopImage);
    const mobile = mediaUrl(data?.mobileImage) || desktop;
    if (!desktop && !mobile) return [];

    const href = String(data?.ctaLink || "").trim();
    return [
      {
        key: "hero-fallback",
        desktop: desktop || mobile,
        mobile: mobile || desktop,
        alt: ctaLabel || "My Home Group",
        href: href || null,
        newTab: false,
      },
    ];
  }, [data, pageSlides, ctaLabel]);

  const isSlider = items.length > 1;

  useGSAP(
    () => {
      registerGsap();

      const lockScroll = () => {
        if (typeof window === "undefined" || typeof document === "undefined") return;
        const docEl = document.documentElement;
        const body = document.body;
        const scrollY = window.scrollY || window.pageYOffset || 0;
        if (body?.dataset?.mhScrollLocked === "true") return;
        if (!body || !docEl) return;
        body.dataset.mhScrollLocked = "true";
        body.dataset.mhScrollY = String(scrollY);
        body.style.overflow = "hidden";
        docEl.style.overflow = "hidden";
        body.style.position = "fixed";
        body.style.top = `-${scrollY}px`;
        body.style.left = "0";
        body.style.right = "0";
        body.style.width = "100%";
      };

      const unlockScroll = () => {
        if (typeof window === "undefined" || typeof document === "undefined") return;
        const docEl = document.documentElement;
        const body = document.body;
        if (!body || !docEl) return;
        if (body?.dataset?.mhScrollLocked !== "true") return;
        const scrollY = Number(body.dataset.mhScrollY || "0");
        body.dataset.mhScrollLocked = "false";
        body.style.overflow = "";
        docEl.style.overflow = "";
        body.style.position = "";
        body.style.top = "";
        body.style.left = "";
        body.style.right = "";
        body.style.width = "";
        window.scrollTo(0, scrollY);
      };

      const preventScroll = (e) => e.preventDefault();
      const preventTouch = (e) => {
        if (e.cancelable) e.preventDefault();
      };
      const preventKeys = (e) => {
        const keysToBlock = [
          "ArrowDown",
          "ArrowUp",
          "ArrowLeft",
          "ArrowRight",
          "PageDown",
          "PageUp",
          "Home",
          "End",
          " ",
          "Spacebar",
        ];
        if (keysToBlock.includes(e.key)) e.preventDefault();
      };

      gsap.set(bgRef.current, { scale: 1.18, autoAlpha: 0.7, filter: "blur(8px)" });
      gsap.set(welcomeRef.current, { y: 0, yPercent: 105, autoAlpha: 0 });
      gsap.set(subtitleRef.current, { y: 0, yPercent: 110, autoAlpha: 0 });
      gsap.set([copyHeadingRef.current, copyBodyRef.current].filter(Boolean), {
        y: 50,
        autoAlpha: 0,
      });

      lockScroll();

      if (typeof window !== "undefined") {
        window.addEventListener("wheel", preventScroll, { passive: false });
        window.addEventListener("touchmove", preventTouch, { passive: false });
        window.addEventListener("keydown", preventKeys);
      }

      window.dispatchEvent(new CustomEvent("mh:loader-start"));

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "expo.out" },
        onComplete: () => {
          if (typeof window !== "undefined") {
            window.removeEventListener("wheel", preventScroll);
            window.removeEventListener("touchmove", preventTouch);
            window.removeEventListener("keydown", preventKeys);
          }
          unlockScroll();
        },
      });

      tl.to(
        welcomeRef.current,
        { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out" },
        0.25
      )
        .to(
          subtitleRef.current,
          { yPercent: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out" },
          0.5
        )
        .addLabel("hold", "+=0.55")
        .to(
          welcomeRef.current,
          { yPercent: 115, autoAlpha: 0, duration: 0.6, ease: "power3.in" },
          "hold"
        )
        .to(
          subtitleRef.current,
          { yPercent: 120, autoAlpha: 0, duration: 0.55, ease: "power3.in" },
          "hold+=0.06"
        )
        .to(shimmerRef.current, { autoAlpha: 0, duration: 0.35 }, "hold")
        .to(
          loaderRef.current,
          { yPercent: -101, duration: 0.9, ease: "expo.inOut" },
          "hold+=0.45"
        )
        .to(
          bgRef.current,
          {
            scale: 1,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 1.1,
            ease: "expo.out",
          },
          "hold+=0.35"
        )
        .add(() => {
          window.dispatchEvent(new CustomEvent("mh:loader-done"));
          setLoading(false);
        }, "hold+=0.6")
        .to(
          copyHeadingRef.current,
          { y: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out" },
          "hold+=0.7"
        )
        .to(
          copyBodyRef.current,
          { y: 0, autoAlpha: 1, duration: 0.7, ease: "expo.out" },
          "hold+=0.85"
        );

      let fontTimeout = null;
      const startTimeline = () => {
        if (fontTimeout) clearTimeout(fontTimeout);
        fontTimeout = null;
        if (!tl.paused()) return;
        tl.play();
      };

      if (typeof document !== "undefined" && document.fonts?.load) {
        fontTimeout = setTimeout(startTimeline, 2000);
        document.fonts
          .load('88px "Tartuffo_Trial_Regular"')
          .then(() => document.fonts.ready)
          .then(startTimeline)
          .catch(startTimeline);
      } else {
        startTimeline();
      }

      gsap.to(bgRef.current, {
        yPercent: 14,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });

      return () => {
        if (fontTimeout) clearTimeout(fontTimeout);
        if (typeof window !== "undefined") {
          window.removeEventListener("wheel", preventScroll);
          window.removeEventListener("touchmove", preventTouch);
          window.removeEventListener("keydown", preventKeys);
        }
        unlockScroll();
      };
    },
    { scope: rootRef }
  );

  if (!data) return null;

  const desktopVideo = mediaUrl(data.desktopVideo);
  const mobileVideo = mediaUrl(data.mobileVideo) || desktopVideo;
  const activeVideo =
    isMobileView === null ? null : isMobileView ? mobileVideo : desktopVideo;
  const fallbackDesktop = items[0]?.desktop;
  const fallbackMobile = items[0]?.mobile || fallbackDesktop;
  const activePoster = isMobileView ? fallbackMobile : fallbackDesktop;
  const showVideo = Boolean(data.isVideo && activeVideo && !isSlider);

  function openLead() {
    setLeadOpen(true);
  }

  function renderSlideMedia(item, index) {
    return (
      <>
        {item.mobile && (
          <img
            src={item.mobile}
            alt={item.alt}
            className="lg:hidden block w-full h-auto"
            fetchPriority={index === 0 ? "high" : undefined}
          />
        )}
        {item.desktop && (
          <img
            src={item.desktop}
            alt={item.alt}
            className="hidden lg:block w-full h-auto"
            fetchPriority={index === 0 ? "high" : undefined}
          />
        )}
        {!loading &&
          (item.href ? (
            <Link
              href={item.href}
              target={item.newTab ? "_blank" : undefined}
              rel={item.newTab ? "noopener noreferrer" : undefined}
              aria-label={item.alt || ctaLabel || "Banner"}
              className="absolute inset-0 z-[4]"
              draggable={false}
            />
          ) : (
            <button
              type="button"
              onClick={openLead}
              aria-label={ctaLabel || item.alt || "Enquire now"}
              className="absolute inset-0 z-[4] cursor-pointer border-0 bg-transparent p-0"
            />
          ))}
      </>
    );
  }

  return (
    <section
      ref={rootRef}
      className="relative w-full overflow-hidden bg-[#2a2828]"
      data-section="hero"
    >
      <div
        ref={bgRef}
        className={`relative w-full will-change-transform ${
          fallbackDesktop || fallbackMobile ? "" : "lg:aspect-video"
        }`}
      >
        {isSlider ? (
          <Swiper
            modules={[Autoplay, EffectFade, A11y]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            loop
            speed={900}
            autoplay={{ delay: AUTOPLAY_DELAY, disableOnInteraction: false }}
            allowTouchMove
            onSwiper={(s) => {
              swiperRef.current = s;
            }}
            onSlideChange={(s) => setActiveIndex(s.realIndex)}
            className="w-full"
          >
            {items.map((item, i) => (
              <SwiperSlide key={item.key} className="relative">
                {renderSlideMedia(item, i)}
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="relative w-full">
            {items[0] ? renderSlideMedia(items[0], 0) : null}
            {showVideo && (
              <video
                key={activeVideo}
                className="absolute inset-0 h-full w-full object-contain lg:object-cover object-bottom"
                src={activeVideo}
                poster={activePoster || undefined}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
              />
            )}
          </div>
        )}
      </div>

      {/* Right-side vertical dots — gray inactive, elongated blue active. */}
      {isSlider && !loading && (
        <nav
          aria-label="Banner slides"
          className="pointer-events-none absolute right-[28px] sm:right-[40px] lg:right-[3.2vw]
                     top-1/2 -translate-y-1/2 z-[6] hidden sm:flex"
        >
          <div className="pointer-events-auto flex flex-col items-center gap-[10px] sm:gap-[12px] lg:gap-[0.7vw]">
            {items.map((item, i) => {
              const active = i === activeIndex;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => swiperRef.current?.slideToLoop(i)}
                  aria-label={`Go to banner ${i + 1}`}
                  aria-current={active ? "true" : undefined}
                  className={`block shrink-0 rounded-full border-0 p-0 transition-all duration-300
                              ${
                                active
                                  ? "w-[8px] h-[24px] sm:w-[9px] sm:h-[28px] lg:w-[0.48vw] lg:h-[1.45vw] bg-[#ef493d]"
                                  : "w-[9px] h-[9px] sm:w-[10px] sm:h-[10px] lg:w-[0.55vw] lg:h-[0.55vw] bg-[#E8E8E8] hover:bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
                              }`}
                />
              );
            })}
          </div>
        </nav>
      )}
      {/* Mobile: compact horizontal dots at bottom (vertical pills crowd small screens). */}
      {isSlider && !loading && (
        <nav
          aria-label="Banner slides"
          className="pointer-events-none absolute inset-x-0 bottom-[20px] z-[6] flex justify-center sm:hidden"
        >
          <div className="pointer-events-auto flex items-center gap-[8px]">
            {items.map((item, i) => {
              const active = i === activeIndex;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => swiperRef.current?.slideToLoop(i)}
                  aria-label={`Go to banner ${i + 1}`}
                  aria-current={active ? "true" : undefined}
                  className={`block shrink-0 rounded-full border-0 p-0 transition-all duration-300
                              ${
                                active
                                  ? "w-[22px] h-[8px] bg-[#ef493d]"
                                  : "w-[9px] h-[9px] bg-[#E8E8E8] shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
                              }`}
                />
              );
            })}
          </div>
        </nav>
      )}

      <div className="absolute inset-x-0 bottom-0 z-[5] pointer-events-none px-5 md:px-12 lg:px-[8.333vw] pb-[88px] sm:pb-20 md:pb-[5.5rem] lg:pb-[calc(8.2vw+30px)]">
        <div className="flex flex-col gap-[14px] sm:gap-6 md:gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-10 xl:gap-[4vw]">
          <div className="text-white w-full lg:max-w-[52vw] xl:max-w-[51.7vw]">
            {hasCopyHeading && (
              <h1
                ref={copyHeadingRef}
                className="will-change-transform leading-[1.4] tracking-[0.025em] capitalize"
                style={{
                  fontFamily:
                    '"Tartuffo_Trial_Light","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                }}
              >
                <span className="Tartuffo_Trial_Regular block text-[18px] xs:text-[20px] sm:text-[24px] md:text-[30px] lg:text-[2.083vw] tracking-[0.044em] font-[300] leading-[1.4]">
                  {headingLine1}
                </span>
                {headingLine2 && (
                  <span className="Tartuffo_Trial_Regular block italic mt-[2px] sm:mt-1.5 md:mt-2 text-[30px] xs:text-[34px] sm:text-[40px] md:text-[48px] lg:text-[3.125vw] font-[300] leading-[1.4]">
                    <i className="Tartuffo_Trial_Regular font-[300]">
                      {headingLine2}
                    </i>
                  </span>
                )}
              </h1>
            )}
            <p
              ref={copyBodyRef}
              className="font-montserrat font-medium mt-3 sm:mt-4 md:mt-5 lg:mt-[1.25vw] text-[12px] xs:text-[13px] md:text-[15px] lg:text-[0.938vw] leading-[22px] sm:leading-[1.65] lg:leading-[1.667vw] text-white/95 max-w-[309px] sm:max-w-[36ch] lg:max-w-none"
            >
              {data.description}
            </p>
          </div>
        </div>
      </div>

      <div
        ref={loaderRef}
        data-mh-loader
        className="absolute inset-0 z-[80] bg-[#2a2828] flex flex-col items-center justify-center will-change-transform"
        aria-hidden={hasCopyHeading ? !loading : undefined}
      >
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(239,73,61,0.05) 0%, transparent 55%)",
          }}
        />
        <div className="overflow-hidden h-[80px] xs:h-[96px] sm:h-[120px] md:h-[140px] lg:h-[7.812vw] flex items-center justify-center px-5">
          <LoaderTitle
            ref={welcomeRef}
            className="Tartuffo_Trial_Regular capitalize text-white text-center leading-[1] tracking-[0.04em] text-[44px] xs:text-[56px] sm:text-[72px] md:text-[88px] lg:text-[5.286vw] font-[300] will-change-transform"
            style={{
              fontFamily:
                '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
              visibility: "hidden",
              opacity: 0,
            }}
          >
            {data.loaderTitle}
          </LoaderTitle>
        </div>
        <div className="overflow-hidden mt-5 sm:mt-7 lg:mt-[2.083vw] h-[24px] sm:h-[32px] md:h-[40px] lg:h-[2.5vw] px-5">
          <p
            ref={subtitleRef}
            className="font-montserrat font-normal uppercase text-white/90 text-center text-[10px] xs:text-[11px] sm:text-[14px] md:text-[18px] lg:text-[1.458vw] tracking-[0.22em] sm:tracking-[0.28em] md:tracking-[0.32em] leading-[1.3] will-change-transform"
            style={{
              fontFamily: "Montserrat, sans-serif",
              visibility: "hidden",
              opacity: 0,
            }}
          >
            {data.loaderSubtitle}
          </p>
        </div>
        <div
          ref={shimmerRef}
          className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 w-[220px] md:w-[260px] h-px bg-white/15 overflow-hidden"
        >
          <span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/90 to-transparent animate-[loaderShimmer_2.2s_ease-in-out_infinite]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes loaderShimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(360%);
          }
        }
      `}</style>

      <HomeBannerLeadPopup open={leadOpen} onClose={() => setLeadOpen(false)} />
    </section>
  );
}
