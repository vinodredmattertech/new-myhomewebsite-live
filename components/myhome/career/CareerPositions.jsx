import React, { useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { MapPin, ArrowUpRight } from "lucide-react";

/* Number of positions shown before the user clicks "View More". */
const INITIAL_COUNT = 4;

const RED = "#ef493d";
const TARTUFFO =
  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif';

const DEFAULT_DESC =
  "We’re looking for a creative and analytical professional to plan, execute, and optimize marketing campaigns across multiple channels.";

const DEFAULT_JOBS = [
  { location: "Mumbai", title: "Senior Design Architect", experience: "5 Year", description: DEFAULT_DESC, applyLabel: "Apply Now", applyUrl: "/contact-us" },
  { location: "Hyderabad", title: "Project Manager", experience: "8 Year", description: DEFAULT_DESC, applyLabel: "Apply Now", applyUrl: "/contact-us" },
  { location: "Mumbai", title: "Civil Site Engineer", experience: "3 Year", description: DEFAULT_DESC, applyLabel: "Apply Now", applyUrl: "/contact-us" },
  { location: "Bengaluru", title: "Sales & CRM Executive", experience: "4 Year", description: DEFAULT_DESC, applyLabel: "Apply Now", applyUrl: "/contact-us" },
];

/**
 * CareerPositions — "Vacant Positions" (Position Overview) listing (Career
 * page, section 4).
 *
 * Layout mirrors the Figma design: a vertical "Position Overview" side-label, a
 * centred serif heading, then a divider-separated list of job rows (location +
 * title on the left, experience + description in the middle, an "Apply Now"
 * link on the right) and a centred "View More" link.
 *
 * Driven by the `positions` component on the Career single type; falls back to
 * built-in defaults so the section always renders.
 */
export default function CareerPositions({ section }) {
  const sideLabel = section?.sideLabel || "Position Overview";
  const heading = section?.heading || "Vacant Positions";
  const viewMoreLabel = section?.viewMoreLabel || "View More";
  const jobs =
    Array.isArray(section?.jobs) && section.jobs.length
      ? section.jobs
      : DEFAULT_JOBS;

  // Show the first 4 positions; reveal the rest inline on "View More".
  const [expanded, setExpanded] = useState(false);
  const hasMore = jobs.length > INITIAL_COUNT;
  const visibleJobs = expanded ? jobs : jobs.slice(0, INITIAL_COUNT);

  const rootRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      gsap.registerPlugin(ScrollTrigger);
      const targets = rootRef.current?.querySelectorAll("[data-reveal]");
      if (targets?.length) {
        gsap.from(targets, {
          y: 36,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 82%" },
        });
      }
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      data-section="career-positions"
      className="relative w-full overflow-hidden bg-white text-[#333]
                 pt-[40px] pb-[56px] lg:pt-[4.688vw] lg:pb-[5.208vw]"
    >
      {/* Vertical side label */}
      <div
        className="absolute z-[5] flex flex-col items-center
                   left-[8px] top-[-10px] w-[18px] gap-[10px]
                   lg:left-[4.166vw] lg:top-[4.688vw] lg:w-[2.812vw] lg:gap-[1.094vw]"
        style={{ color: RED }}
      >
        <span className="block w-px h-[26px] lg:h-[3.125vw]" style={{ background: RED }} />
        <span
          className="font-medium capitalize whitespace-nowrap text-[11px] lg:text-[1.25vw]"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
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

      {/* Job rows */}
      <div className="mt-[36px] lg:mt-[2.5vw] px-5 md:px-10 lg:px-[15.052vw]">
        {visibleJobs.map((job, idx) => (
          <div key={job.id ?? idx} data-reveal>
            <div className="grid grid-cols-1 lg:grid-cols-[20.5vw_1fr_auto] gap-[16px] lg:gap-[2vw] items-start lg:items-center py-[24px] lg:py-[2.083vw]">
              {/* location + title */}
              <div className="flex flex-col gap-[10px] lg:gap-[0.833vw]">
                <span
                  className="inline-flex items-center gap-[10px] lg:gap-[0.729vw] capitalize text-[#5f5f5f]
                             text-[14px] lg:text-[0.938vw]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  <MapPin className="w-[16px] h-[16px] lg:w-[1.094vw] lg:h-[1.094vw]" strokeWidth={1.6} />
                  Location: {job.location}
                </span>
                <h3
                  className="text-[#454545] text-[22px] sm:text-[26px] lg:text-[1.563vw] leading-[1.2]"
                  style={{ fontFamily: TARTUFFO, fontWeight: 400 }}
                >
                  {job.title}
                </h3>
              </div>

              {/* experience + description */}
              <div className="flex flex-col gap-[8px] lg:gap-[0.521vw]">
                {job.experience && (
                  <p
                    className="text-[#5f5f5f] text-[14px] lg:text-[0.938vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    <span className="font-medium">Experience Required:</span> {job.experience}
                  </p>
                )}
                {job.description && (
                  <p
                    className="text-[#343434] text-[14px] sm:text-[15px] lg:text-[0.833vw]
                               leading-[24px] lg:leading-[1.667vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {job.description}
                  </p>
                )}
              </div>

              {/* apply */}
              <Link
                href={job.applyUrl || "/contact-us"}
                className="inline-flex items-center gap-[6px] lg:gap-[0.26vw] capitalize whitespace-nowrap
                           text-[15px] lg:text-[0.938vw] hover:opacity-80 transition-opacity"
                style={{ color: RED, fontFamily: "Montserrat, sans-serif" }}
              >
                {job.applyLabel || "Apply Now"}
                <ArrowUpRight className="w-[18px] h-[18px] lg:w-[1.198vw] lg:h-[1.198vw]" strokeWidth={1.6} />
              </Link>
            </div>
            <div className="h-px w-full bg-[#0000001a]" />
          </div>
        ))}
      </div>

      {/* View more — reveals positions from the 5th onward, inline. */}
      {hasMore && (
        <div data-reveal className="mt-[36px] lg:mt-[2.917vw] flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="underline underline-offset-4 text-[#333] text-[16px] lg:text-[0.938vw] hover:text-[#ef493d] transition-colors"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {expanded ? "View Less" : viewMoreLabel}
          </button>
        </div>
      )}
    </section>
  );
}
