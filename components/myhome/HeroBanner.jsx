import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, ScrollTrigger } from "@/lib/gsapSetup";
import { mediaUrl } from "@/lib/strapi";

/**
 * Hero banner — opens with a cinematic "Welcome HOME" loader on a #2a2828
 * panel. The loader text fades + mask-reveals, the text slides down out of
 * its clip mask, then the entire dark panel slides up off-screen to reveal
 * the property image with bottom-left copy + the white Enquire-Now button.
 *
 * Animation states (replicated from Figma 2609:2746 → 2609:2774 → 2609:2808).
 */
export default function HeroBanner({ data }) {
  const rootRef = useRef(null);
  const bgRef = useRef(null);
  const loaderRef = useRef(null);
  const welcomeRef = useRef(null);
  const subtitleRef = useRef(null);
  const shimmerRef = useRef(null);
  const copyHeadingRef = useRef(null);
  const copyBodyRef = useRef(null);
  const btnRef = useRef(null);

  const [loading, setLoading] = useState(true);

  // Strapi can leave `ctaText` blank — treat blank/whitespace as "no button".
  const hasCta = Boolean(data?.ctaText && String(data.ctaText).trim());

  // Which breakpoint we're on — `null` until hydration so the server and the
  // first client render agree. Only the matching video is ever mounted, so we
  // never download both the desktop and the mobile file.
  const [isMobileView, setIsMobileView] = useState(null);

  useEffect(() => {
    // 1023px = just under Tailwind's `lg`, matching the image swap below.
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsMobileView(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useGSAP(
    () => {
      registerGsap();

      const lockScroll = () => {
        if (typeof window === "undefined" || typeof document === "undefined") return;

        // Store scroll position + preserve styles
        const docEl = document.documentElement;
        const body = document.body;

        const scrollY = window.scrollY || window.pageYOffset || 0;

        // Avoid double-locking
        if (body?.dataset?.mhScrollLocked === "true") return;
        if (!body || !docEl) return;

        body.dataset.mhScrollLocked = "true";
        body.dataset.mhScrollY = String(scrollY);

        body.style.overflow = "hidden";
        docEl.style.overflow = "hidden";

        // Prevent viewport jump by fixing body in place
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

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };

      const preventScroll = (e) => {
        // wheel / trackpad
        e.preventDefault();
      };

      const preventTouch = (e) => {
        // touch drag
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
          " ", // Space
          "Spacebar",
        ];

        if (keysToBlock.includes(e.key)) {
          e.preventDefault();
        }
      };

      // Initial visual state
      gsap.set(bgRef.current, { scale: 1.18, autoAlpha: 0.7, filter: "blur(8px)" });
      gsap.set(welcomeRef.current, { y: 0, yPercent: 105, autoAlpha: 0 });
      gsap.set(subtitleRef.current, { y: 0, yPercent: 110, autoAlpha: 0 });
      gsap.set(
        [copyHeadingRef.current, copyBodyRef.current, btnRef.current].filter(
          Boolean
        ),
        {
          y: 50,
          autoAlpha: 0,
        }
      );

      // Lock scroll while loader plays
      lockScroll();

      if (typeof window !== "undefined") {
        // Passive must be false so preventDefault works
        window.addEventListener("wheel", preventScroll, { passive: false });
        window.addEventListener("touchmove", preventTouch, { passive: false });
        window.addEventListener("keydown", preventKeys);
      }

      window.dispatchEvent(new CustomEvent("mh:loader-start"));

      const tl = gsap.timeline({
        // Held until the display webfont is ready — see `startTimeline` below.
        paused: true,
        defaults: { ease: "expo.out" },
        onComplete: () => {
          // Remove scroll lock only after the final frame is revealed
          if (typeof window !== "undefined") {
            window.removeEventListener("wheel", preventScroll);
            window.removeEventListener("touchmove", preventTouch);
            window.removeEventListener("keydown", preventKeys);
          }
          unlockScroll();
        },
      });



      // Phase 1 — "Welcome HOME" rises into its mask + fades in
      tl.to(
        welcomeRef.current,
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "expo.out",
        },
        0.25
      )
        // subtitle staggered just after
        .to(
          subtitleRef.current,
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "expo.out",
          },
          0.5
        )
        // Phase 2 — hold (let the eye breathe)
        .addLabel("hold", "+=0.55")
        // Phase 3 — text slides DOWN out of mask
        .to(
          welcomeRef.current,
          {
            yPercent: 115,
            autoAlpha: 0,
            duration: 0.6,
            ease: "power3.in",
          },
          "hold"
        )
        .to(
          subtitleRef.current,
          {
            yPercent: 120,
            autoAlpha: 0,
            duration: 0.55,
            ease: "power3.in",
          },
          "hold+=0.06"
        )
        // shimmer line fades out
        .to(
          shimmerRef.current,
          { autoAlpha: 0, duration: 0.35 },
          "hold"
        )
        // Phase 4 — dark loader slides UP off-screen + slight blur
        .to(
          loaderRef.current,
          {
            yPercent: -101,
            duration: 0.9,
            ease: "expo.inOut",
          },
          "hold+=0.45"
        )
        // image scales in & un-blurs simultaneously
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
        // Phase 5 — notify header to slide in
        .add(() => {
          window.dispatchEvent(new CustomEvent("mh:loader-done"));
          setLoading(false);
        }, "hold+=0.6")
        // Phase 6 — bottom-left copy & button fade in
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

      // The CTA is optional — when Strapi sends an empty `ctaText` the button
      // isn't rendered at all, so there's nothing to fade in.
      if (btnRef.current) {
        tl.to(
          btnRef.current,
          { y: 0, autoAlpha: 1, duration: 0.65, ease: "expo.out" },
          "hold+=0.95"
        );
      }

      // The loader title is set in "Tartuffo_Trial_Regular", declared without a
      // `font-display`, so the browser blocks its text while the .otf loads.
      // The Montserrat subtitle has no such delay — start the sequence only
      // after the face resolves, otherwise the subtitle is the first (and for a
      // moment the only) text on screen.
      let fontTimeout = null;
      const startTimeline = () => {
        if (fontTimeout) clearTimeout(fontTimeout);
        fontTimeout = null;
        if (!tl.paused()) return;
        tl.play();
      };

      if (typeof document !== "undefined" && document.fonts?.load) {
        // Never let a slow or failed font hold the loader hostage.
        fontTimeout = setTimeout(startTimeline, 2000);
        document.fonts
          .load('88px "Tartuffo_Trial_Regular"')
          .then(() => document.fonts.ready)
          .then(startTimeline)
          .catch(startTimeline);
      } else {
        startTimeline();
      }

      // Scroll parallax on the hero image — kicks in after loader is gone
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
        // Always clean up in case the component unmounts mid-animation
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

  const desktopImage = mediaUrl(data.desktopImage);
  // Fall back to the desktop image if a mobile-specific upload isn't set.
  const mobileImage = mediaUrl(data.mobileImage) || desktopImage;

  // Same desktop/mobile pairing for video, gated behind the `isVideo` toggle.
  const desktopVideo = mediaUrl(data.desktopVideo);
  const mobileVideo = mediaUrl(data.mobileVideo) || desktopVideo;
  const activeVideo =
    isMobileView === null ? null : isMobileView ? mobileVideo : desktopVideo;
  const activePoster = isMobileView ? mobileImage : desktopImage;
  const showVideo = Boolean(data.isVideo && activeVideo);

  return (
    <section
      ref={rootRef}
      className="relative w-full overflow-hidden bg-[#2a2828] h-[100svh] min-h-[640px]"
      data-section="hero"
    >
      {/* ---------- Hero image (revealed under the loader) ----------
          Render two <Image>s — mobile-only crop swaps to desktop crop at lg. */}
      <div ref={bgRef} className="absolute inset-0 will-change-transform">
        {mobileImage && (
          <Image
            src={mobileImage}
            alt="My Home Group flagship tower at twilight"
            fill
            priority
            quality={92}
            sizes="100vw"
            unoptimized
            className="lg:hidden object-cover object-bottom"
          />
        )}
        {desktopImage && (
          <Image
            src={desktopImage}
            alt="My Home Group flagship tower at twilight"
            fill
            priority
            quality={92}
            sizes="100vw"
            unoptimized
            className="hidden lg:block object-cover object-bottom"
          />
        )}
        {/* ---------- Hero video ----------
            Layered over the image, which stays as the poster/fallback so the
            hero still paints if the file is slow or fails. Mounted only after
            the breakpoint is known, so exactly one source is requested. */}
        {showVideo && (
          <video
            key={activeVideo}
            className="absolute inset-0 h-full w-full object-cover object-bottom"
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

      {/* ---------- Bottom hero block: copy + Enquire button ---------- */}
      <div className="absolute inset-x-0 bottom-0 z-[5] px-5 md:px-12 lg:px-[8.333vw] pb-[40px] sm:pb-12 md:pb-14 lg:pb-[7.291vw]">
        <div className="flex flex-col gap-[14px] sm:gap-6 md:gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-10 xl:gap-[4vw]">
          {/* Copy */}
          <div
            className="text-white w-full lg:max-w-[52vw] xl:max-w-[51.7vw]"
          >
            <h1
              ref={copyHeadingRef}
              className="will-change-transform leading-[1.4] tracking-[0.025em] capitalize"
              style={{ fontFamily:  '"Tartuffo_Trial_Light","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif' }}
            >
              <span className="Tartuffo_Trial_Regular block text-[18px] xs:text-[20px] sm:text-[24px] md:text-[30px] lg:text-[2.083vw] tracking-[0.044em] font-[300] leading-[1.4]">
                {data.headingLine1}
              </span>
              <span className="Tartuffo_Trial_Regular block italic mt-[2px] sm:mt-1.5 md:mt-2 text-[30px] xs:text-[34px] sm:text-[40px] md:text-[48px] lg:text-[3.125vw] font-[300] leading-[1.4]">
                <i className="Tartuffo_Trial_Regular font-[300]">
                  {data.headingLine2}
                </i>
              </span>
            </h1>
            <p
              ref={copyBodyRef}
              className="font-montserrat font-medium mt-3 sm:mt-4 md:mt-5 lg:mt-[1.25vw] text-[12px] xs:text-[13px] md:text-[15px] lg:text-[0.938vw] leading-[22px] sm:leading-[1.65] lg:leading-[1.667vw] text-white/95 max-w-[309px] sm:max-w-[36ch] lg:max-w-none"
            >
              {data.description}
            </p>
          </div>

          {/* Enquire button — only when the CMS actually supplies a label */}
          {hasCta && (
          <a
            ref={btnRef}
            href={data.ctaLink || "#"}
            className="group self-start lg:self-end shrink-0 inline-flex items-center justify-center lg:justify-between gap-0 lg:gap-[1.041vw] w-[152px] sm:w-[180px] lg:w-[15.354vw] xl:w-[15.354vw] h-[42px] sm:h-[50px] lg:h-[3.125vw] px-4 sm:px-5 lg:px-[1.5vw] bg-white text-[#2a2828] hover:bg-mh-red hover:text-white transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden whitespace-nowrap"
          >
            <span
              className="font-montserrat font-medium capitalize text-[12px] sm:text-[13px] lg:text-[0.833vw] tracking-[0.08em] whitespace-nowrap"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {data.ctaText}
            </span>
            <svg
              viewBox="0 0 36 14"
              fill="none"
              className="hidden lg:block shrink-0 w-[28px] sm:w-[32px] lg:w-[2.03vw] h-auto transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5"
            >
              <path
                d="M0 7h33M27 1l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="square"
              />
            </svg>
          </a>
          )}
        </div>
      </div>

      {/* ============== LOADER OVERLAY ============== */}
      <div
        ref={loaderRef}
        data-mh-loader
        className="absolute inset-0 z-[80] bg-[#2a2828] flex flex-col items-center justify-center will-change-transform"
        aria-hidden={!loading}
      >
        {/* subtle noise/texture for premium feel */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
          }}
        />

        {/* radial glow accent */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(239,73,61,0.05) 0%, transparent 55%)",
          }}
        />

        {/* mask container for "Welcome HOME" */}
        <div className="overflow-hidden h-[80px] xs:h-[96px] sm:h-[120px] md:h-[140px] lg:h-[7.812vw] flex items-center justify-center px-5">
          <h2
            ref={welcomeRef}
            className="Tartuffo_Trial_Regular capitalize text-white text-center leading-[1] tracking-[0.04em] text-[44px] xs:text-[56px] sm:text-[72px] md:text-[88px] lg:text-[5.286vw] font-[300] will-change-transform"
            style={{
              fontFamily: '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
              // Hidden until the timeline reveals it — otherwise the raw markup
              // flashes before GSAP's initial `set` runs. Deliberately no
              // `transform` here: GSAP folds any existing translate into its
              // own `y` and adds `yPercent` on top of it.
              visibility: "hidden",
              opacity: 0,
            }}
          >
            {data.loaderTitle}
          </h2>
        </div>

        {/* mask container for subtitle */}
        <div className="overflow-hidden mt-5 sm:mt-7 lg:mt-[2.083vw] h-[24px] sm:h-[32px] md:h-[40px] lg:h-[2.5vw] px-5">
          <p
            ref={subtitleRef}
            className="font-montserrat font-normal uppercase text-white/90 text-center text-[10px] xs:text-[11px] sm:text-[14px] md:text-[18px] lg:text-[1.458vw] tracking-[0.22em] sm:tracking-[0.28em] md:tracking-[0.32em] leading-[1.3] will-change-transform"
            style={{
              fontFamily: "Montserrat, sans-serif",
              // Same guard as the title — Montserrat resolves instantly, so
              // without this the subtitle paints before "Welcome Home" does.
              visibility: "hidden",
              opacity: 0,
            }}
          >
            {data.loaderSubtitle}
          </p>
        </div>

        {/* thin shimmer progress line */}
        <div
          ref={shimmerRef}
          className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 w-[220px] md:w-[260px] h-px bg-white/15 overflow-hidden"
        >
          <span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/90 to-transparent animate-[loaderShimmer_2.2s_ease-in-out_infinite]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes loaderShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(360%); }
        }
      `}</style>
    </section>
  );
}
