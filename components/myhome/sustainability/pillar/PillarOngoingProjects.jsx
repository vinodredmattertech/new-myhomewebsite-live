import React, { useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { ArrowUpRight, BedDouble, Maximize2 } from "lucide-react";
import { mediaUrl } from "@/lib/strapi";
import { DEFAULT_ONGOING_PROJECTS } from "@/lib/sustainabilityPillars";
import SectionLabel from "@/components/myhome/SectionLabel";
import SectionHeading from "@/components/common/SectionHeading";

/* Cards shown when the Projects collection is unreachable (local dev without
   the backend running), so the band never collapses to a bare heading. */
const FALLBACK_PROJECTS = [
  {
    title: "My Home Grava",
    location: "Tellapur, Hyderabad",
    description:
      "A green-certified township of tall towers set within landscaped open ground and resort-scale amenities.",
    bhkLabel: "3 & 4 BHK",
    acres: "26.00 Acres",
    image: "/assets/myhome/nri/hyderabad-3.jpg",
    href: "/projects",
  },
  {
    title: "My Home Apas",
    location: "Kokapet, Hyderabad",
    description:
      "IGBC pre-certified Gold living, planned around daylight, cross-ventilation and water reuse from the outset.",
    bhkLabel: "3 & 4 BHK",
    acres: "12.60 Acres",
    image: "/assets/myhome/nri/hyderabad-1.jpg",
    href: "/projects",
  },
  {
    title: "My Home Sayuk",
    location: "Tellapur, Hyderabad",
    description:
      "Family homes built to an IGBC pre-certified Gold standard, with native landscaping across the podium.",
    bhkLabel: "2, 3 & 4 BHK",
    acres: "18.00 Acres",
    image: "/assets/myhome/nri/hyderabad-2.jpg",
    href: "/projects",
  },
];

/**
 * Which phase a CMS project sits in. Mirrors `projectStatus` on the Projects
 * listing exactly — the phase is derived from `status` + the free-text `badge`
 * rather than a dedicated schema field, and the two views must not disagree
 * about what "Ongoing" means.
 */
function projectPhase(p) {
  if (p?.status === "Completed" || p?.badge === "Completed") return "Completed";
  if (String(p?.badge || "").toLowerCase() === "upcoming") return "Upcoming";
  return "Ongoing";
}

function normaliseProject(p) {
  return {
    id: p?.id,
    title: p?.title || "",
    location: p?.location || "",
    description: p?.description || "",
    bhkLabel: p?.bhkLabel || "",
    acres: p?.acres || "",
    image: mediaUrl(p?.image),
    href: p?.ctaLink || (p?.slug ? `/projects/${p.slug}` : "/projects"),
  };
}

/** Project card — the Projects-listing card, trimmed to the fields this band
 *  needs (no phase badge: everything here is Ongoing by definition). */
function ProjectCard({ project }) {
  return (
    <Link
      href={project.href}
      className="group relative block w-full bg-white border-[0.7px] border-[rgba(43,43,43,0.14)]
                 rounded-[12px] overflow-hidden
                 transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]"
    >
      <div className="relative w-full px-[18px] pt-[18px] lg:px-[0.937vw] lg:pt-[0.937vw]">
        <div className="relative w-full aspect-[488/393] rounded-t-[10px] overflow-hidden bg-[#f5f1eb]">
          {project.image && (
            <Image
              src={project.image}
              alt={project.title}
              fill
              unoptimized
              sizes="(min-width:1024px) 28vw, (min-width:640px) 45vw, 90vw"
              className="object-cover object-center select-none transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            />
          )}
        </div>
      </div>

      <div
        className="flex flex-col gap-[18px] lg:gap-[1.042vw]
                   px-[24px] lg:px-[1.302vw]
                   pt-[20px] lg:pt-[1.198vw]
                   pb-[24px] lg:pb-[1.302vw]"
      >
        <div className="flex items-start justify-between gap-[16px]">
          <div className="flex flex-col gap-[4px] min-w-0">
            <h3
              className="text-[#e31f24] leading-[1.15] tracking-[0.03em]
                         text-[22px] sm:text-[26px] lg:text-[1.458vw]"
              style={{
                fontFamily:
                  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                fontWeight: 300,
              }}
            >
              {project.title}
            </h3>
            {project.location ? (
              <p
                className="font-montserrat font-light text-[#333]
                           text-[11px] sm:text-[12px] lg:text-[0.625vw] leading-[22px]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {project.location}
              </p>
            ) : null}
          </div>
          <span
            className="inline-flex items-center justify-center shrink-0 rounded-full bg-white
                       border-[0.896px] border-[#e31f24] text-[#e31f24]
                       w-[44px] h-[44px] lg:w-[2.604vw] lg:h-[2.604vw]
                       transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                       group-hover:bg-[#e31f24] group-hover:text-white"
          >
            <ArrowUpRight className="w-[14px] h-[14px] lg:w-[0.833vw] lg:h-[0.833vw]" />
          </span>
        </div>

        {project.description ? (
          <p
            className="font-montserrat font-light text-[#333]
                       text-[13px] sm:text-[14px] lg:text-[0.781vw]
                       leading-[22px] lg:leading-[1.302vw]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {project.description}
          </p>
        ) : null}

        {(project.bhkLabel || project.acres) && (
          <div className="flex flex-wrap items-center gap-[10px] lg:gap-[0.625vw]">
            {project.bhkLabel ? (
              <span
                className="inline-flex items-center gap-[8px] lg:gap-[0.417vw]
                           bg-[rgba(221,221,221,0.15)] border-[0.5px] border-[#e7e7e7] rounded-full
                           px-[18px] py-[10px] lg:px-[1.042vw] lg:py-[0.521vw]
                           font-montserrat font-normal text-[#333]
                           text-[12px] sm:text-[13px] lg:text-[0.729vw]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                <BedDouble
                  className="w-[14px] h-[14px] lg:w-[0.781vw] lg:h-[0.781vw]"
                  strokeWidth={1.4}
                />
                {project.bhkLabel}
              </span>
            ) : null}
            {project.acres ? (
              <span
                className="inline-flex items-center gap-[8px] lg:gap-[0.417vw]
                           bg-[rgba(221,221,221,0.15)] border-[0.5px] border-[#e7e7e7] rounded-full
                           px-[18px] py-[10px] lg:px-[1.042vw] lg:py-[0.521vw]
                           font-montserrat font-normal text-[#333]
                           text-[12px] sm:text-[13px] lg:text-[0.729vw]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                <Maximize2
                  className="w-[12px] h-[12px] lg:w-[0.729vw] lg:h-[0.729vw]"
                  strokeWidth={1.4}
                />
                {project.acres}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </Link>
  );
}

/**
 * PillarOngoingProjects — the closing "Ongoing Projects" band shared by all
 * three ESG pillar detail pages.
 *
 * The cards are pulled live from the Projects collection and filtered to the
 * Ongoing phase rather than being re-authored per pillar, so a project that is
 * handed over drops off all three pages at once. Only the surrounding copy is
 * CMS-editable, on the pillar entry itself.
 */
export default function PillarOngoingProjects({
  section,
  projects = [],
  accent,
  limit = 6,
}) {
  const label = section?.label || DEFAULT_ONGOING_PROJECTS.label;
  const heading = section?.heading || DEFAULT_ONGOING_PROJECTS.heading;
  const description = section?.description || DEFAULT_ONGOING_PROJECTS.description;
  const ctaLabel = section?.ctaLabel || DEFAULT_ONGOING_PROJECTS.ctaLabel;
  const ctaUrl = section?.ctaUrl || DEFAULT_ONGOING_PROJECTS.ctaUrl;

  const cards = useMemo(() => {
    const ongoing = projects
      .filter((p) => projectPhase(p) === "Ongoing")
      .map(normaliseProject)
      .filter((p) => p.title);
    return (ongoing.length ? ongoing : FALLBACK_PROJECTS).slice(0, limit);
  }, [projects, limit]);

  const rootRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      gsap.registerPlugin(ScrollTrigger);
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const targets = rootRef.current?.querySelectorAll("[data-reveal]");
      if (targets?.length && !reduce) {
        gsap.from(targets, {
          y: 40,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.08,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 82%" },
        });
      }
    },
    { scope: rootRef }
  );

  if (!cards.length) return null;

  return (
    <section
      ref={rootRef}
      data-section="sustainability-pillar-projects"
      className="relative w-full overflow-hidden bg-[#faf9f7] text-[#333]
                 pt-[26px] pb-[56px] lg:pt-[4.687vw] lg:pb-[5.208vw]"
    >
      <SectionLabel
        className="lg:absolute z-[5] left-[16px] top-[56px] lg:left-[4.166vw] lg:top-[4.687vw] max-lg:static max-lg:w-full max-lg:mt-[15px] max-lg:mb-[18px]"
        color={accent}
      >
        {label}
      </SectionLabel>

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-[11.146vw]">
        <div className="flex flex-col items-center text-center gap-[14px] lg:gap-[0.729vw] mb-[36px] lg:mb-[3.333vw]">
          <SectionHeading
            data-reveal
            className="leading-[1.05] tracking-[0.02em]
                       text-[34px] sm:text-[48px] md:text-[60px] lg:text-[3.646vw]"
          >
            {heading}
          </SectionHeading>
          {description ? (
            <p
              data-reveal
              className="max-w-[70ch] text-[#5f5f5f] text-[15px] leading-[1.7] lg:text-[0.937vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {description}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px] lg:gap-[2.083vw]">
          {cards.map((p, i) => (
            <div key={p.id ?? `${p.title}-${i}`} data-reveal>
              <ProjectCard project={p} />
            </div>
          ))}
        </div>

        {ctaUrl && ctaLabel ? (
          <div className="mt-[36px] lg:mt-[3.125vw] flex justify-center">
            <Link
              href={ctaUrl}
              data-reveal
              className="inline-flex items-center gap-[10px] lg:gap-[0.625vw] rounded-full border
                         px-[28px] py-[14px] lg:px-[1.823vw] lg:py-[0.937vw]
                         font-montserrat font-medium capitalize
                         text-[13px] sm:text-[14px] lg:text-[0.833vw]
                         transition-colors duration-300"
              // The accent is per-pillar and therefore inline, which outranks a
              // Tailwind `hover:` class — so the fill is driven from JS instead.
              style={{
                fontFamily: "Montserrat, sans-serif",
                borderColor: accent,
                color: accent,
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = accent;
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = accent;
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = accent;
                e.currentTarget.style.color = "#fff";
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = accent;
              }}
            >
              {ctaLabel}
              <ArrowUpRight
                className="w-[15px] h-[15px] lg:w-[0.833vw] lg:h-[0.833vw]"
                strokeWidth={1.6}
              />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
