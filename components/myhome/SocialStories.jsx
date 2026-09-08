import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import RichText from "@/components/common/RichText";
import SectionHeading from "@/components/common/SectionHeading";

/**
 * Everyday Stories — live Instagram feed
 *
 * Copy on the left (side label → heading → body → "Explore on Instagram"),
 * a continuously scrolling wall of real Instagram posts on the right.
 *
 *   • Desktop (lg+) — two vertical columns running in opposite directions.
 *   • Mobile / tablet — two horizontal rows, same opposing pair, because a
 *     vertical marquee on a phone fights the page scroll.
 *
 * Posts come from `/api/instagram`, which holds the Graph API token
 * server-side and hands back `{ id, image, permalink, caption, isVideo }`.
 *
 * Aspect ratios are measured, not assumed. Instagram mixes 1:1, 4:5 and 1.91:1
 * in the feed and 9:16 for reels, and the endpoint doesn't report dimensions —
 * so each poster is preloaded off-DOM to read `naturalWidth/naturalHeight`
 * before anything renders. Cropping everything to one ratio would slice the
 * top off every reel; measuring first also means the marquee never reflows
 * mid-scroll, which a seamless -50% loop cannot survive.
 */

const BODY_FONT = { fontFamily: "Montserrat, sans-serif" };

/** Shown until the real feed has loaded, and the ratio for any poster we can't measure. */
const FALLBACK_RATIO = 4 / 5;
/** Seconds each card spends on screen — the track duration scales with the card count. */
const SECONDS_PER_CARD = 6;
/** Give up measuring a slow poster rather than holding the whole section back. */
const MEASURE_TIMEOUT_MS = 6000;

/** Lanes fade out at their ends instead of being chopped off mid-card. */
const FADE_Y = {
  WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 7%, #000 93%, transparent 100%)",
  maskImage: "linear-gradient(to bottom, transparent 0, #000 7%, #000 93%, transparent 100%)",
};
const FADE_X = {
  WebkitMaskImage: "linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%)",
  maskImage: "linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%)",
};
/** Horizontal lanes are height-driven — each card's width follows from its ratio. */
const ROW_H = "h-[190px] xs:h-[210px] sm:h-[250px] md:h-[290px]";

/** Matches the `postCount` min/max on the Strapi component and MAX_LIMIT on the API route. */
const MIN_POSTS = 4;
const MAX_POSTS = 50;

/** Matches the `postCount` default on the Strapi component. */
const FALLBACK_POSTS = 18;

/**
 * Is there anything authored to show?
 *
 * There is no default copy: an unconfigured section is hidden rather than
 * shipped with placeholder text, so the heading is what decides. The
 * Instagram wall alone is not a section — without the copy beside it there is
 * nothing to explain what the reader is looking at.
 */
function isAuthored(data) {
  return Boolean(data?.heading && String(data.heading).trim());
}

/**
 * Keep an authored `postCount` inside what the feed endpoint will serve.
 *
 * Unlike the copy, this one does fall back — it is a tuning number, not
 * content, and a blank field should still produce a working marquee.
 */
function clampCount(value) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return FALLBACK_POSTS;
  return Math.min(Math.max(n, MIN_POSTS), MAX_POSTS);
}

/**
 * Read a poster's real dimensions before it goes into the layout.
 *
 * Resolves to the aspect ratio, or the fallback if the image errors or is
 * still loading when the timeout fires — a `null` here would leave a hole in
 * the column, so there is deliberately no rejection path.
 */
function measure(src) {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(FALLBACK_RATIO);
    const img = new window.Image();
    let settled = false;
    const done = (ratio) => {
      if (settled) return;
      settled = true;
      resolve(ratio);
    };
    const timer = setTimeout(() => done(FALLBACK_RATIO), MEASURE_TIMEOUT_MS);
    img.onload = () => {
      clearTimeout(timer);
      done(img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : FALLBACK_RATIO);
    };
    img.onerror = () => {
      clearTimeout(timer);
      done(FALLBACK_RATIO);
    };
    img.referrerPolicy = "no-referrer";
    img.src = src;
  });
}

/**
 * Which way the marquee runs, as a real breakpoint rather than a CSS one.
 *
 * The two layouts can't both live in the DOM behind `hidden lg:flex`: each
 * lane renders its posts twice, so a CSS-only swap would put four copies of
 * every poster on the page and leave the off-breakpoint half eagerly decoding
 * images nobody can see. Returns `null` until mounted so the server and the
 * first client render agree.
 */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isDesktop;
}

function PlayGlyph({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.75)" />
      <path d="M10 8.2l6 3.8-6 3.8V8.2z" fill="#fff" />
    </svg>
  );
}

/**
 * One post.
 *
 * `vertical` decides which side the measured ratio is spent on: a column has a
 * fixed width and derives height, a row has a fixed height and derives width.
 * Either way the poster is never cropped away from its native ratio.
 */
function PostCard({ post, vertical, spacing }) {
  const ratio = post.ratio || FALLBACK_RATIO;

  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={post.caption || "View this post on Instagram"}
      className={`group relative block shrink-0 overflow-hidden bg-[#efece7]
                  ring-1 ring-black/[0.05]
                  shadow-[0_14px_34px_-26px_rgba(0,0,0,0.45)]
                  transition-[box-shadow] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]
                  hover:shadow-[0_34px_60px_-32px_rgba(0,0,0,0.5)]
                  ${vertical ? "w-full" : "h-full"}`}
      style={
        vertical
          ? { aspectRatio: String(ratio), marginBottom: spacing }
          : { aspectRatio: String(ratio), marginRight: spacing }
      }
    >
      {/* Plain <img>: Instagram's CDN spreads posters across many rotating
          scontent/fbcdn hostnames with signed, expiring URLs, so next/image
          remotePatterns can't cover them and optimisation would cache a URL
          that dies within days. */}
      <img
        src={post.image}
        alt={post.caption || "My Home Group on Instagram"}
        /* Eager, not lazy: every poster was already fetched by the measuring
           pass, so this is a cache hit with no extra request — and a lazy card
           would pop in blank as the marquee carried it into view. */
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        draggable="false"
        className="absolute inset-0 h-full w-full object-cover object-center
                   transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]
                   group-hover:scale-[1.06]"
      />

      {/* Caption veil — stays out of the way until the card is hovered */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0
                   bg-gradient-to-t from-black/70 via-black/10 to-transparent
                   opacity-0 group-hover:opacity-100
                   transition-opacity duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      />

      {post.isVideo && (
        <PlayGlyph
          className="pointer-events-none absolute right-[10px] top-[10px]
                     h-[22px] w-[22px] lg:h-[1.354vw] lg:w-[1.354vw]
                     opacity-90"
        />
      )}

      {post.caption && (
        <span
          className="pointer-events-none absolute inset-x-0 bottom-0
                     px-[12px] pb-[12px] lg:px-[0.833vw] lg:pb-[0.833vw]
                     font-montserrat font-normal text-white
                     text-[11px] lg:text-[0.677vw] leading-[1.45]
                     line-clamp-3
                     translate-y-[8px] opacity-0
                     group-hover:translate-y-0 group-hover:opacity-100
                     transition-[transform,opacity] duration-[700ms]
                     ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={BODY_FONT}
        >
          {post.caption}
        </span>
      )}
    </a>
  );
}

/**
 * One marquee lane.
 *
 * The list is rendered twice and the track slides exactly one copy's length
 * (see `.mh-marquee-track` in globals.css), so the seam is invisible and no
 * measuring loop is needed. `reverse` flips a lane so it runs against its
 * neighbour. The duplicate copy is `aria-hidden` — the same posts twice in the
 * accessibility tree is noise, not content.
 */
function MarqueeLane({ posts, vertical, reverse, spacing, offset = 0, className = "" }) {
  const duration = Math.max(posts.length * SECONDS_PER_CARD, 20);

  // A vertical track is taller than its viewport and inherits the lane's width;
  // a horizontal one is wider than its viewport, so it has to size to content
  // (`w-max`) or flex would shrink every card to fit the lane.
  const axis = vertical
    ? "mh-marquee-track--y flex flex-col"
    : "mh-marquee-track--x flex flex-row h-full w-max";
  const copyAxis = vertical ? "flex flex-col" : "flex flex-row h-full w-max shrink-0";

  const copy = (hidden) => (
    <div className={copyAxis} aria-hidden={hidden || undefined}>
      {posts.map((post, i) => (
        <PostCard
          key={`${hidden ? "b" : "a"}-${post.id}-${i}`}
          post={post}
          vertical={vertical}
          spacing={spacing}
        />
      ))}
    </div>
  );

  return (
    <div className={`mh-marquee relative overflow-hidden ${className}`}>
      <div
        className={`mh-marquee-track ${axis} ${reverse ? "mh-marquee-track--rev" : ""}`}
        style={{
          animationDuration: `${duration}s`,
          // Start the neighbouring lane part-way through its own cycle so the
          // two never sit card-for-card in a row. A negative delay shifts the
          // phase without any layout offset — a margin nudge would leave a
          // bald patch at the far end of the lane.
          animationDelay: offset ? `-${(duration * offset).toFixed(2)}s` : undefined,
        }}
      >
        {copy(false)}
        {copy(true)}
      </div>
    </div>
  );
}

/** Grey blocks holding the lane's shape while the feed is still being measured. */
function LaneSkeleton({ vertical, spacing, count = 4 }) {
  return (
    <div
      className={`h-full overflow-hidden ${
        vertical ? "flex flex-col" : "flex flex-row w-max"
      }`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`shrink-0 animate-pulse bg-black/[0.05] ${vertical ? "w-full" : "h-full"}`}
          style={
            vertical
              ? { aspectRatio: String(FALLBACK_RATIO), marginBottom: spacing }
              : { aspectRatio: String(FALLBACK_RATIO), marginRight: spacing }
          }
        />
      ))}
    </div>
  );
}

export default function SocialStories({ data }) {
  const authored = isAuthored(data);

  const [posts, setPosts] = useState([]);
  const [profileUrl, setProfileUrl] = useState(data?.profileUrl || "");
  const isDesktop = useIsDesktop();
  const postCount = clampCount(data?.postCount);

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const introRef = useRef(null);
  const feedRef = useRef(null);

  // Load the feed, then measure every poster before handing it to the marquee.
  useEffect(() => {
    // Nothing authored — the section is hidden, so skip the Graph API call
    // and the poster preloading entirely rather than paying for both.
    if (!authored) return undefined;

    let alive = true;

    (async () => {
      try {
        const res = await fetch(`/api/instagram?limit=${postCount}`);
        if (!res.ok) return;
        const json = await res.json();
        const items = Array.isArray(json?.items) ? json.items : [];
        if (!alive || !items.length) return;

        if (json.profileUrl && !data?.profileUrl) setProfileUrl(json.profileUrl);

        const ratios = await Promise.all(items.map((p) => measure(p.image)));
        if (!alive) return;
        setPosts(items.map((p, i) => ({ ...p, ratio: ratios[i] })));
      } catch (err) {
        // A dead token or an offline visitor just leaves the copy column —
        // the section still reads correctly without the wall.
        console.warn("[social-stories] feed unavailable:", err.message);
      }
    })();

    return () => {
      alive = false;
    };
  }, [authored, postCount, data?.profileUrl]);

  // Split into the two lanes by alternating, so neighbouring columns never
  // show the same post side by side.
  const [laneA, laneB] = useMemo(() => {
    const a = [];
    const b = [];
    posts.forEach((p, i) => (i % 2 ? b : a).push(p));
    // A single-item lane can't loop convincingly — pad it from the other side.
    if (a.length && b.length < 2) b.push(...a.slice(0, 2));
    if (b.length && a.length < 2) a.push(...b.slice(0, 2));
    return [a, b];
  }, [posts]);

  useGSAP(
    () => {
      if (!rootRef.current) return;
      registerGsap();

      const words = splitToWords(headingRef.current);
      if (words.length) {
        gsap.set(words, { yPercent: 110, rotate: 4 });
        gsap.to(words, {
          yPercent: 0,
          rotate: 0,
          duration: 1.15,
          stagger: 0.045,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
        });
      }

      const intro = introRef.current ? gsap.utils.toArray(introRef.current.children) : [];
      if (intro.length) {
        gsap.from(intro, {
          y: 30,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 70%" },
        });
      }

      if (feedRef.current) {
        // Fade the wall in only — no transform, or it would sit on the same
        // property the marquee animation drives.
        gsap.from(feedRef.current, {
          autoAlpha: 0,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 72%" },
        });
      }
    },
    { scope: rootRef }
  );

  const hasFeed = laneA.length > 0 || laneB.length > 0;

  // Authored in Strapi or not on the page at all — no placeholder copy ships.
  // Sits below the hooks above so the hook order stays identical either way.
  if (!authored) return null;

  return (
    <section
      ref={rootRef}
      id="social-stories"
      data-section="social-stories"
      className="relative w-full overflow-hidden bg-white
                 pt-[46px] pb-[46px]
                 lg:pt-[4.166vw] lg:pb-0"
    >
      <div
        className="relative flex flex-col
                   lg:flex-row lg:items-center lg:gap-[4.166vw]"
      >
        {/* ------------------------------ COPY ------------------------------ */}
        <div
          ref={introRef}
          className="order-1 w-full
                     px-5 sm:px-8 lg:pl-[11.146vw] lg:pr-0
                     lg:w-[42%] lg:shrink-0"
        >
          {data.label && (
            <span
              className="block font-montserrat font-medium capitalize text-[#ef493d]
                         text-[13px] md:text-[15px] lg:text-[0.937vw]"
              style={BODY_FONT}
            >
              {data.label}
            </span>
          )}

          <SectionHeading
            ref={headingRef}
            className="capitalize text-[#2a2828] tracking-[1px]
                       mt-[14px] lg:mt-[1.302vw]
                       leading-[1.2] lg:leading-[1.25]
                       text-[30px] xs:text-[34px] sm:text-[42px] md:text-[48px] lg:text-[2.5vw]
                       will-change-transform"
          >
            {data.heading}
          </SectionHeading>

          {data.body && (
            <p
              className="font-montserrat font-normal text-[#555]
                         mt-[16px] lg:mt-[1.562vw]
                         max-w-[560px] lg:max-w-[29vw]
                         text-[14px] md:text-[16px] lg:text-[0.885vw]
                         leading-[24px] lg:leading-[1.666vw]"
              style={BODY_FONT}
            >
              <RichText>{data.body}</RichText>
            </p>
          )}

          {/* Only a real label pointing at a real profile — never a bare arrow
              or a dead link when the CMS is missing one of the two. */}
          {data.ctaLabel && profileUrl && (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-[14px] lg:gap-[0.937vw]
                       mt-[28px] lg:mt-[3.125vw]
                       font-montserrat font-medium uppercase tracking-[0.08em] text-[#2a2828]
                       text-[12px] md:text-[13px] lg:text-[0.781vw]
                       transition-colors duration-500 hover:text-[#ef493d]"
            style={BODY_FONT}
          >
            {data.ctaLabel}
            <svg
              viewBox="0 0 72 34"
              fill="none"
              aria-hidden="true"
              className="h-[30px] w-[64px] lg:h-[1.771vw] lg:w-[3.75vw] overflow-visible"
            >
              <circle
                cx="17"
                cy="17"
                r="16"
                stroke="currentColor"
                strokeWidth="1"
                className="opacity-60 transition-opacity duration-500 group-hover:opacity-100"
              />
              <g
                stroke="currentColor"
                strokeWidth="1.2"
                className="transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[4px]"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              >
                <line x1="6" y1="17" x2="66" y2="17" />
                <path d="M58 10.5L65.5 17 58 23.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>
          </a>
          )}
        </div>

        {/* ------------------------------ FEED ------------------------------ */}
        <div
          ref={feedRef}
          className="order-2 relative w-full min-w-0
                     mt-[36px] lg:mt-0 lg:flex-1"
        >
          {isDesktop === false ? (
            /* Mobile / tablet — the same opposing pair turned on its side, so
               it never competes with the page scroll. Fixed row height, width
               derived from each post's own ratio. */
            <div className="flex flex-col gap-[14px] sm:gap-[18px]" style={FADE_X}>
              {hasFeed ? (
                <>
                  <MarqueeLane posts={laneA} spacing="14px" className={ROW_H} />
                  <MarqueeLane posts={laneB} reverse offset={0.5} spacing="14px" className={ROW_H} />
                </>
              ) : (
                <>
                  <div className={ROW_H}><LaneSkeleton spacing="14px" /></div>
                  <div className={ROW_H}><LaneSkeleton spacing="14px" /></div>
                </>
              )}
            </div>
          ) : (
            /* Desktop — two vertical lanes running against each other. Also the
               pre-mount render, where only the imageless skeleton shows. */
            <div className="flex gap-[1.562vw] pr-[4.166vw] h-[46.875vw]" style={FADE_Y}>
              {hasFeed && isDesktop ? (
                <>
                  <MarqueeLane
                    posts={laneA}
                    vertical
                    spacing="1.562vw"
                    className="flex-1 min-w-0 h-full"
                  />
                  <MarqueeLane
                    posts={laneB}
                    vertical
                    reverse
                    offset={0.5}
                    spacing="1.562vw"
                    className="flex-1 min-w-0 h-full"
                  />
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <LaneSkeleton vertical spacing="1.562vw" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <LaneSkeleton vertical spacing="1.562vw" />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
