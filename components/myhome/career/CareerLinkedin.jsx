import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { ThumbsUp, MessageSquare, Share2, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { mediaUrl } from "@/lib/strapi";

const RED = "#ef493d";
const TARTUFFO =
  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif';

const DEFAULT_IMAGES = ["/assets/myhome/whoweare-color.jpg"];

const ACTIONS = [
  { label: "Like", Icon: ThumbsUp },
  { label: "Comment", Icon: MessageSquare },
  { label: "Share", Icon: Share2 },
  { label: "Send", Icon: Send },
];

/* Built-in posts so the feed always renders (and is navigable) before content
   is published in the CMS. */
const DEFAULT_POSTS = [
  {
    postTitle: "Standing Together When It Mattered Most",
    postBody:
      "During the pandemic, My Home Group contributed ₹6 crore to state relief funds — ₹3 crore each to the Governments of Telangana and Andhra Pradesh.",
    hashtags:
      "#MyHome #SustainableSpaces #DesignExcellence #BuiltWithIntegrity #TrustedLiving",
    postedLabel: "Posted:",
    postedDate: "March 28, 2026",
    postUrl: "",
    images: DEFAULT_IMAGES,
  },
];

/** Pull a list of absolute image URLs out of the Strapi multi-media field. */
function imageList(images) {
  if (Array.isArray(images?.data)) {
    return images.data.map((row) => mediaUrl(row)).filter(Boolean);
  }
  if (Array.isArray(images)) {
    return images
      .map((m) => mediaUrl(m) || (typeof m === "string" ? m : null))
      .filter(Boolean);
  }
  return [];
}

/** Normalise one raw post (CMS component or legacy single-post shape). */
function normalisePost(raw) {
  const imgs = imageList(raw?.images);
  return {
    postTitle: raw?.postTitle || "",
    postBody: raw?.postBody || "",
    hashtags: raw?.hashtags || "",
    postedLabel: raw?.postedLabel || "Posted:",
    postedDate: raw?.postedDate || "",
    postUrl: raw?.postUrl || "",
    images: imgs.length ? imgs : DEFAULT_IMAGES,
  };
}

/**
 * CareerLinkedin — "Stay Connected on LinkedIn" (Latest updates) feed (Career
 * page, section 5).
 *
 * Layout mirrors the Figma design: a vertical "Latest updates" side-label, a
 * centred serif heading, then a two-column post — the editorial block on the
 * left (title, body, blue hashtags, a divider and a "Posted: <date>" row) and a
 * stack of post images on the right, with LinkedIn-style Like/Comment/Share/
 * Send actions beneath. Side navigation arrows page between posts on desktop;
 * a matching arrow pair sits below the post on mobile.
 *
 * Driven by the `linkedin` component on the Career single type — it reads the
 * repeatable `posts`, falling back to the legacy single-post fields and then to
 * built-in defaults so the section always renders.
 */
export default function CareerLinkedin({ section }) {
  const sideLabel = section?.sideLabel || "Latest updates";
  const heading = section?.heading || "Stay Connected on LinkedIn";

  // Prefer the repeatable `posts`; fall back to the legacy single-post fields,
  // then to built-in defaults.
  const posts = useMemo(() => {
    if (Array.isArray(section?.posts) && section.posts.length) {
      return section.posts.map(normalisePost);
    }
    if (section?.postTitle || section?.postBody || section?.images) {
      return [normalisePost(section)];
    }
    return DEFAULT_POSTS;
  }, [section]);

  const [index, setIndex] = useState(0);
  const count = posts.length;
  const active = posts[Math.min(index, count - 1)] || posts[0];
  const canNavigate = count > 1;

  const go = (dir) => {
    if (!canNavigate) return;
    setIndex((i) => (i + dir + count) % count);
  };

  const rootRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      gsap.registerPlugin(ScrollTrigger);
      const targets = rootRef.current?.querySelectorAll("[data-reveal]");
      if (targets?.length) {
        gsap.from(targets, {
          y: 40,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.12,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
        });
      }
    },
    { scope: rootRef }
  );

  const ActionLink = ({ label, Icon }) => {
    const content = (
      <span
        className="inline-flex items-center gap-[6px] lg:gap-[0.26vw] text-[#454545] text-[14px] lg:text-[0.833vw] hover:text-[#ef493d] transition-colors"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        <Icon className="w-[18px] h-[18px] lg:w-[1.25vw] lg:h-[1.25vw]" strokeWidth={1.6} />
        {label}
      </span>
    );
    return active.postUrl ? (
      <Link href={active.postUrl} target="_blank" rel="noopener noreferrer" aria-label={label}>
        {content}
      </Link>
    ) : (
      content
    );
  };

  const navBtn =
    "inline-flex items-center justify-center rounded-full border border-black/15 bg-white text-[#333] " +
    "transition-colors duration-300 hover:bg-[#ef493d] hover:border-[#ef493d] hover:text-white " +
    "disabled:opacity-40 disabled:pointer-events-none";

  return (
    <section
      ref={rootRef}
      data-section="career-linkedin"
      className="relative w-full overflow-hidden bg-white text-[#333]
                 pt-[30px] pb-[64px] lg:pt-[4.167vw] lg:pb-[5.208vw]"
    >
      {/* Vertical side label */}
      <div
        className="lg:absolute z-[5] flex flex-col items-center
                   left-[8px] top-[44px] w-[18px] gap-[10px]
                   lg:left-[4.166vw] lg:top-[4.688vw] lg:w-[2.812vw] lg:gap-[1.094vw] max-lg:static max-lg:!w-full max-lg:flex-row max-lg:!justify-center max-lg:items-center max-lg:!gap-[8px] max-lg:mt-[15px] max-lg:mb-[18px]"
        style={{ color: RED }}
      >
        <span className="block w-px h-[26px] lg:h-[3.125vw] max-lg:!w-[28px] max-lg:!h-px" style={{ background: RED }} />
        <span
          className="font-medium capitalize whitespace-nowrap text-[11px] lg:text-[1.25vw] max-lg:[writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] lg:rotate-180"
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {sideLabel}
        </span>
      </div>

      {/* Heading */}
      <h2
        data-reveal
        className="text-center capitalize leading-[1.1] tracking-[0.02em] px-5
                   text-[32px] xs:text-[40px] sm:text-[56px] md:text-[72px] lg:text-[5vw]"
        style={{ fontFamily: TARTUFFO, fontWeight: 300 }}
      >
        {heading}
      </h2>

      {/* Post */}
      <div data-reveal className="relative mt-[36px] lg:mt-[3.125vw] px-5 md:px-10 lg:px-[16.094vw]">
        {/* side nav arrows (desktop) */}
        {canNavigate && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous update"
              className={`hidden lg:flex absolute z-[5] left-[8.854vw] top-1/2 -translate-y-1/2 w-[3.646vw] h-[3.646vw] ${navBtn}`}
            >
              <ChevronLeft className="w-[1.25vw] h-[1.25vw]" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next update"
              className={`hidden lg:flex absolute z-[5] right-[8.854vw] top-1/2 -translate-y-1/2 w-[3.646vw] h-[3.646vw] ${navBtn}`}
            >
              <ChevronRight className="w-[1.25vw] h-[1.25vw]" strokeWidth={1.5} />
            </button>
          </>
        )}

        <div
          key={index}
          className="grid grid-cols-1 lg:grid-cols-[24.583vw_1fr] gap-[36px] lg:gap-[8.125vw] items-center"
        >
          {/* editorial block */}
          <div className="flex flex-col gap-[24px] lg:gap-[2.604vw]">
            <div className="flex flex-col gap-[14px] lg:gap-[0.781vw]">
              <h3
                className="capitalize text-[#333] leading-[1.25]
                           text-[26px] sm:text-[32px] lg:text-[2.18vw]"
                style={{ fontFamily: '"Tartuffo_Trial_Light","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif', fontWeight: 300 }}
              >
                {active.postTitle}
              </h3>
              {active.postBody && (
                <p
                  className="text-[#6d6d6d] text-[15px] sm:text-[16px] lg:text-[1.042vw]
                             leading-[28px] lg:leading-[2.083vw]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {active.postBody}
                </p>
              )}
              {active.hashtags && (
                <p
                  className="text-[#0966c2] text-[14px] lg:text-[0.833vw] leading-[1.6] break-words"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {active.hashtags}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-[16px] lg:gap-[1.563vw]">
              <div className="h-px w-full bg-[#0000001f]" />
              <div className="flex items-center justify-between">
                <span
                  className="text-[#333] text-[18px] lg:text-[1.146vw]"
                  style={{ fontFamily: TARTUFFO, fontWeight: 300 }}
                >
                  {active.postedLabel}
                </span>
                {active.postedDate && (
                  <span
                    className="capitalize text-[#3c3c3a] text-[14px] lg:text-[0.938vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {active.postedDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* image stack + actions */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="relative w-full max-w-[420px] lg:max-w-[26.927vw] aspect-[517/575]">
              {/* decorative stacked cards behind the main image */}
              {active.images[2] && (
                <div className="absolute right-0 top-[8%] h-[72%] w-[40%] overflow-hidden rounded-[6px] opacity-90">
                  <Image src={active.images[2]} alt="" fill unoptimized sizes="14vw" className="object-cover object-left" />
                </div>
              )}
              {active.images[1] && (
                <div className="absolute right-[8%] top-[4%] h-[84%] w-[60%] overflow-hidden rounded-[6px]">
                  <Image src={active.images[1]} alt="" fill unoptimized sizes="18vw" className="object-cover object-left" />
                </div>
              )}
              <div className="absolute left-0 top-0 h-full w-[88%] overflow-hidden rounded-[6px] lg:rounded-[0.313vw] shadow-lg">
                <Image
                  src={active.images[0]}
                  alt={active.postTitle}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 88vw, 24vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            <div className="mt-[20px] lg:mt-[2.083vw] w-full max-w-[420px] lg:max-w-[26.927vw]">
              <div className="h-px w-full bg-[#0000001f]" />
              <div className="mt-[16px] lg:mt-[1.302vw] flex items-center justify-between gap-[12px]">
                {ACTIONS.map((a) => (
                  <ActionLink key={a.label} label={a.label} Icon={a.Icon} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* mobile nav arrows */}
        {canNavigate && (
          <div className="mt-[28px] flex lg:hidden items-center justify-center gap-[14px]">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous update"
              className={`w-[44px] h-[44px] ${navBtn}`}
            >
              <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next update"
              className={`w-[44px] h-[44px] ${navBtn}`}
            >
              <ChevronRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
