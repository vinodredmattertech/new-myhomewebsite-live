import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap } from "@/lib/gsapSetup";
import { mediaUrl } from "@/lib/strapi";
import RichText from "@/components/common/RichText";

/**
 * Vision & Mission — Figma node 3117:868 (Vission & mission, Default + alt states)
 *
 * Desktop layout is a 1:1 port of the Figma 2904×1080 canvas (= 151.25vw × 100vh).
 * The section is pinned and the wide track pans horizontally for the full
 * 51.25vw (= 2904 − 1920 px) so the user travels from "Our Vision" on the left
 * to "Our Mission" on the right while the building image stays anchored in
 * the middle of the canvas — exactly matching the two Figma states.
 *
 * Figma absolute coords inside the 2904×1080 panel:
 *   side label:    left:80   top:90                (= 4.16vw  / 8.33vh)
 *   building img:  left:1266 top:301 w:1684 h:779  (= 65.94vw / 27.87vh / 87.71vw / 72.13vh)
 *   "Our Vision":  left:214  top:130 w:257         (= 11.15vw / 12.04vh / 13.39vw)
 *   Vision body:   left:214  top:469 w:566         (= 11.15vw / 43.43vh / 29.48vw)
 *   "Our Mission": left:1948 top:130 w:376         (= 101.46vw / 12.04vh / 19.58vw)
 *   Mission body:  left:2138 top:469 w:566         (= 111.35vw / 43.43vh / 29.48vw)
 *
 * Mobile / tablet stacks the panels vertically with the building image as a hero.
 */

const headingStyle = {
  fontFamily:
    '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
  fontWeight: 300,
};
const bodyStyle = { fontFamily: "Montserrat, sans-serif" };

export default function AboutVisionMission({ data }) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      const mm = gsap.matchMedia();

      // ============ DESKTOP — pin + horizontal pan (scrub:true) ============
      mm.add("(min-width: 1024px)", () => {
        const track = trackRef.current;
        if (!track) return;
        const distance = track.scrollWidth - window.innerWidth;
        if (distance <= 0) return;

        const headings = track.querySelectorAll("[data-vm-heading]");
        const bodies = track.querySelectorAll("[data-vm-body]");
        if (headings.length < 2 || bodies.length < 2) return;
        const [visionHeading, missionHeading] = headings;
        const [visionBody, missionBody] = bodies;

        // Vision begins fully visible; mission begins faded so it eases in as
        // the camera pans towards it, and eases out when the user scrolls back.
        gsap.set([visionHeading, visionBody], { autoAlpha: 1, y: 0 });
        gsap.set([missionHeading, missionBody], { autoAlpha: 0, y: 30 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: () => "+=" + distance,
            scrub: true,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Master horizontal pan — drives the whole 0→1 progress.
        tl.to(track, { x: -distance }, 0);
        // Vision fades out in the second half of the pan as we leave it behind.
        tl.to([visionHeading, visionBody], { autoAlpha: 0, y: -30 }, 0.55);
        // Mission eases in as it enters the viewport.
        tl.to([missionHeading, missionBody], { autoAlpha: 1, y: 0 }, 0.35);
      });

      // ============ MOBILE / TABLET — stacked vertical reveal ============
      mm.add("(max-width: 1023px)", () => {
        const headings = rootRef.current.querySelectorAll("[data-vm-heading]");
        const bodies = rootRef.current.querySelectorAll("[data-vm-body]");
        headings.forEach((node) => {
          gsap.from(node, {
            y: 40,
            autoAlpha: 0,
            duration: 1.0,
            ease: "expo.out",
            scrollTrigger: { trigger: node, start: "top 85%" },
          });
        });
        bodies.forEach((node) => {
          gsap.from(node, {
            y: 30,
            autoAlpha: 0,
            duration: 1.0,
            ease: "expo.out",
            scrollTrigger: { trigger: node, start: "top 85%" },
          });
        });
      });
    },
    { scope: rootRef }
  );

  if (!data) return null;

  const bgImage = mediaUrl(data.backgroundImage);

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-[#f5f1eb] overflow-hidden lg:h-[100vh] lg:min-h-[640px]"
    >
      {/* ===== Side label "Vission & mission" — Figma left:80 top:90 ===== */}
      <div
        className="lg:absolute z-[5] flex flex-col items-center left-[12px] top-[24px] gap-[11px] w-[28px] lg:left-[4.166vw] lg:top-[4.166vw] lg:w-[2.812vw] lg:gap-[1.094vw] text-[#2a2828] pointer-events-none max-lg:static max-lg:!w-full max-lg:flex-row max-lg:!justify-center max-lg:items-center max-lg:!gap-[8px] max-lg:mt-[25px]  "

        style={{ left: "4.16vw", top: "8.33vh" }}
        aria-hidden="true"
      >
        <span className="block w-px h-[31px] lg:h-[3.125vw] bg-[#2a2828] max-lg:!w-[28px] max-lg:!h-px" />
        <span
          className="font-montserrat font-medium capitalize whitespace-nowrap text-[12px] lg:text-[1.25vw] max-lg:[writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] lg:rotate-180"
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {data.label}
        </span>
      </div>

      {/* =======================================================
            DESKTOP — wide horizontal track (151.25vw, pinned)
         ======================================================= */}
      <div
        ref={trackRef}
        className="hidden lg:block absolute inset-y-0 left-0 will-change-transform"
        style={{ width: "151.25vw" }}
      >
        {/* ----- Building image — Figma x:1266 y:301 w:1684 h:779 ----- */}
        <div
          className="absolute"
          style={{
            left: "20.93vw",
            top: "27.87vh",
            width: "87.71vw",
            height: "72.13vh",
          }}
        >
          <div className="absolute inset-0 overflow-hidden opacity-90">
            {bgImage && (
              <Image
                src={bgImage}
                alt=""
                fill
                unoptimized
                sizes="88vw"
                priority
                className="object-cover object-center select-none"
              />
            )}
          </div>
          {/* Gradient blends the image into the cream bg: to-left from #f5f1eb 0%, via transparent 50%, to #f5f1eb 90.547% */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to left, #f5f1eb 0%, rgba(245,241,235,0) 50%, #f5f1eb 90.547%)",
            }}
          />

          {/* ----- Birds SVG overlay — Figma inset:27.87%/41.97%/61.54%/52.72% rotated 19.73deg ----- */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "27.87%",
              left: "52.72%",
              right: "41.97%",
              bottom: "61.54%",
              transform: "rotate(19.73deg)",
              transformOrigin: "center",
            }}
            aria-hidden="true"
          >
            <Image
              src="/assets/myhome/about/birds.svg"
              alt=""
              fill
              unoptimized
              className="object-contain !top-[-175px] !left-[30px]"
            />
          </div>
        </div>

        {/* ----- Our Vision : title at left:214 top:130 ----- */}
        <h2
          data-vm-heading="vision"
          className="absolute capitalize text-[#2a2828] leading-[0.95] tracking-[0.0188em] text-[5.52vw] will-change-transform"
          style={{ ...headingStyle, left: "11.15vw", top: "12.04vh" }}
        >
          {data.visionHeading}
        </h2>

        {/* ----- Vision body at left:214 top:469 w:566 ----- */}
        <p
          data-vm-body="vision"
          className="absolute font-montserrat font-normal text-[#2a2828] text-justify text-[0.938vw] leading-[1.77vw] will-change-transform"
          style={{
            ...bodyStyle,
            left: "11.15vw",
            top: "43.43vh",
            width: "29.48vw",
          }}
        >
          <RichText>{data.visionBody}</RichText>
        </p>

        {/* ----- Our Mission : title at left:1948 top:130 ----- */}
        <h2
          data-vm-heading="mission"
          className="absolute capitalize text-[#2a2828] leading-[0.95] tracking-[0.0188em] text-[5.52vw] will-change-transform"
          style={{ ...headingStyle, left: "111.35vw", top: "12.04vh" }}
        >
          {data.missionHeading}
        </h2>

        {/* ----- Mission body at left:2138 top:469 w:566 ----- */}
        <p
          data-vm-body="mission"
          className="absolute font-montserrat font-normal text-[#2a2828] text-justify text-[0.938vw] leading-[1.77vw] will-change-transform"
          style={{
            ...bodyStyle,
            left: "111.35vw",
            top: "43.43vh",
            width: "29.48vw",
          }}
        >
          <RichText>{data.missionBody}</RichText>
        </p>
      </div>

      {/* =======================================================
            MOBILE / TABLET — stacked vertical
         ======================================================= */}
      <div className="relative z-[2] lg:hidden px-5 md:px-10 py-[44px] md:py-[88px] flex flex-col gap-[48px] md:gap-[64px]">
        {[
          { title: data.visionHeading, body: data.visionBody },
          { title: data.missionHeading, body: data.missionBody },
        ].map((p, idx) => (
          <div key={p.title || `vm-${idx}`} className="flex flex-col gap-[20px] md:gap-[28px]">
            <h2
              data-vm-heading
              className="capitalize text-[#2a2828] leading-[0.95] tracking-[0.02em]
                         text-[44px] sm:text-[56px] md:text-[72px]"
              style={headingStyle}
            >
              {p.title}
            </h2>
            <p
              data-vm-body
              className="font-montserrat font-normal text-[#2a2828]/85 text-justify
                         text-[14px] sm:text-[15px] md:text-[16px]
                         leading-[24px] sm:leading-[26px] md:leading-[28px]"
              style={bodyStyle}
            >
              <RichText>{p.body}</RichText>
            </p>
            {idx === 0 && bgImage && (
              <div className="relative w-full aspect-[16/9] rounded-[8px] overflow-hidden mt-[10px] opacity-90">
                <Image
                  src={bgImage}
                  alt=""
                  fill
                  unoptimized
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
