import React, { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Play } from "lucide-react";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { mediaUrl } from "@/lib/strapi";
import SectionLabel from "@/components/myhome/SectionLabel";
import RichText from "@/components/common/RichText";
import SectionHeading from "@/components/common/SectionHeading";

/**
 * AboutVideo — video block that sits below the Journey section.
 *
 * Everything comes from Strapi (about-page.videoSection) and the section is
 * fully optional: with no video source in the CMS it renders nothing at all,
 * so an empty component never leaves a blank strip on the page.
 *
 * Two sources are supported, matching the project gallery's convention:
 *   • videoFile — an uploaded MP4/WebM, played inline with native controls
 *   • videoUrl  — a YouTube/Vimeo link, embedded in an iframe on play
 * An uploaded file wins when both are filled in.
 */

/** Turn a YouTube/Vimeo watch link into its embeddable player URL.
 *  Watch URLs can't be dropped into an iframe directly (YouTube blocks it
 *  with X-Frame-Options), so the id is pulled out and rebuilt as /embed/. */
function toEmbedUrl(url) {
  if (!url) return "";
  const yt = String(url).match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vimeo = String(url).match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return url;
}

export default function AboutVideo({ data }) {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const label = data?.label || "";
  const heading = data?.heading || "";
  const description = data?.description || "";
  const fileSrc = mediaUrl(data?.videoFile);
  const embedSrc = toEmbedUrl(data?.videoUrl);
  const poster = mediaUrl(data?.poster);
  const hasVideo = Boolean(fileSrc || embedSrc);

  useGSAP(
    () => {
      if (!rootRef.current) return;
      registerGsap();
      const words = splitToWords(headingRef.current);
      if (!words.length) return;
      gsap.from(words, {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.06,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
      });
    },
    { scope: rootRef }
  );

  // No video in the CMS → the section doesn't exist on the page.
  if (!data || !hasVideo) return null;

  const handlePlay = () => {
    setPlaying(true);
    // The uploaded-file case keeps its own <video>, so start it directly;
    // the embed case swaps in an autoplaying iframe instead.
    if (fileSrc) {
      const el = videoRef.current;
      if (el) {
        const started = el.play();
        if (started?.catch) started.catch(() => {});
      }
    }
  };

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden
                 py-[30px] md:py-[80px] lg:pt-[4.166vw] lg:pb-[4.166vw]"
      data-section="about-video"
    >
      {label && (
        <div className="lg:absolute left-[4.16vw] top-[4.166vw] max-lg:static max-lg:w-full max-lg:flex max-lg:justify-center max-lg:mt-[15px] max-lg:mb-[18px]">
          <SectionLabel>{label}</SectionLabel>
        </div>
      )}

      {heading && (
        <SectionHeading
          ref={headingRef}
          className="text-center text-[#333] capitalize will-change-transform leading-[1.05] tracking-[0.02em]
                     text-[32px] xs:text-[40px] sm:text-[52px] md:text-[64px] lg:text-[5vw]
                     px-5 md:px-10 lg:px-[8.333vw]"
        >
          {heading}
        </SectionHeading>
      )}

      {description && (
        <div
          className="mx-auto text-center text-[#323232]
                     mt-[12px] md:mt-[16px] lg:mt-[0.833vw]
                     px-5 md:px-10 lg:px-[8.333vw]
                     max-w-[760px] lg:max-w-[52vw]
                     text-[14px] sm:text-[15px] md:text-[16px] lg:text-[0.938vw]
                     leading-[24px] sm:leading-[26px] md:leading-[28px] lg:leading-[1.666vw]"
          style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
        >
          <RichText>{description}</RichText>
        </div>
      )}

      <div
        className={`px-5 md:px-10 lg:px-[11.146vw] ${
          heading || description || label
            ? "mt-[24px] md:mt-[40px] lg:mt-[2.604vw]"
            : ""
        }`}
      >
        {/* 16:9 frame — scales with the viewport at every breakpoint. */}
        <div className="relative w-full aspect-video overflow-hidden bg-black rounded-[8px] lg:rounded-[0.521vw]">
          {fileSrc ? (
            <video
              ref={videoRef}
              src={fileSrc}
              poster={poster || undefined}
              controls
              playsInline
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : playing ? (
            <iframe
              src={embedSrc}
              title={heading || "About video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            poster && (
              <Image
                src={poster}
                alt={heading || "Video cover"}
                fill
                unoptimized
                sizes="(min-width: 1024px) 78vw, 100vw"
                className="object-cover object-center select-none"
              />
            )
          )}

          {/* Play overlay — shown until playback starts. For an embed with no
              poster the frame is plain black, so the button is the only cue. */}
          {!playing && (
            <button
              type="button"
              onClick={handlePlay}
              aria-label={heading ? `Play ${heading}` : "Play video"}
              className="absolute inset-0 z-[2] flex items-center justify-center
                         bg-black/25 hover:bg-black/35 transition-colors duration-300 cursor-pointer"
            >
              <span
                className="inline-flex items-center justify-center rounded-full
                           bg-[#ef493d] text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]
                           w-[56px] h-[56px] sm:w-[68px] sm:h-[68px] md:w-[76px] md:h-[76px]
                           lg:w-[4.166vw] lg:h-[4.166vw]
                           transition-transform duration-300 hover:scale-105"
              >
                <Play
                  className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] md:w-[26px] md:h-[26px]
                             lg:w-[1.458vw] lg:h-[1.458vw] translate-x-[1px]"
                  fill="currentColor"
                  strokeWidth={0}
                />
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
