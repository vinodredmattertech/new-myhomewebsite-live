import React, { useMemo, useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { Download } from "lucide-react";
import { mediaUrl, fileMeta } from "@/lib/strapi";
import SectionLabel from "@/components/myhome/SectionLabel";
import SectionHeading from "@/components/common/SectionHeading";

const RED = "#ef493d";

const COVER_PLACEHOLDER =
  "/assets/myhome/sustainability/reports/report-cover-placeholder.svg";
const SAMPLE_PDF = "/assets/myhome/sustainability/reports/sample-report.pdf";

const DEFAULT_ITEMS = [
  {
    title: "Integrated ESG Report",
    year: "2025-26",
    description: "Our annual disclosure on environmental, social and governance performance.",
    externalUrl: SAMPLE_PDF,
  },
  {
    title: "Sustainability Report",
    year: "2024-25",
    description: "A year-on-year account of our green building and community initiatives.",
    externalUrl: SAMPLE_PDF,
  },
  {
    title: "Business Responsibility Report",
    year: "2023-24",
    description: "Our commitments and progress against the National Guidelines on Responsible Business Conduct.",
  },
  {
    title: "Annual Report",
    year: "2022-23",
    description: "Financial and operational highlights alongside our sustainability roadmap.",
  },
];

function normaliseReport(raw, idx) {
  const meta = fileMeta(raw?.file);
  const href = meta?.url || raw?.externalUrl || null;
  return {
    id: raw?.id ?? `${raw?.title || "report"}-${idx}`,
    title: raw?.title || "",
    year: raw?.year || "",
    description: raw?.description || "",
    cover: mediaUrl(raw?.coverImage) || COVER_PLACEHOLDER,
    href,
    // An external URL has no metadata to read, so fall back to a plain PDF tag.
    ext: meta?.ext || (href ? "PDF" : null),
    sizeLabel: meta?.sizeLabel || null,
    order: typeof raw?.order === "number" ? raw.order : 0,
  };
}

/** One report tile — cover thumbnail, title, year badge and a download affordance. */
function ReportCard({ report }) {
  const shell =
    "group relative flex h-full flex-col overflow-hidden rounded-[12px] border bg-white " +
    "transition-colors duration-500";

  const body = (
    <>
    <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-[#161616]">
  <Image
    src={report.cover}
    alt={`${report.title} cover`}
    fill
    sizes="(max-width:640px) 100vw,
           (max-width:1024px) 50vw,
           25vw"
    className="object-cover transition-transform duration-700 group-hover:scale-105"
  />

  {/* Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

  {/* Year Badge */}
  {report.year && (
    <span
      className="
        absolute left-3 top-3 z-10
        rounded-full bg-[#ef493d] text-white
        px-2.5 py-1
        text-[10px] sm:text-[11px] lg:text-[0.68vw]
        font-medium
      "
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      {report.year}
    </span>
  )}

  {/* Bottom Section */}
  <div
    className="
      absolute bottom-0 left-0 right-0 z-10
      p-3
      sm:p-4
      lg:p-[1.15vw]
    "
  >
    <div className="flex items-center justify-between gap-2 sm:gap-3">
      {/* File Meta */}
      <span
        className="
          flex-1
          truncate
          text-white/90
          text-[10px]
          sm:text-[11px]
          lg:text-[0.68vw]
        "
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        {report.href
          ? [report.ext, report.sizeLabel].filter(Boolean).join(" • ")
          : "Report coming soon"}
      </span>

      {/* Download Button */}
      {report.href && (
        <span
          className="
            inline-flex
            items-center
            gap-1.5
            sm:gap-2
            shrink-0

            rounded-full
            border border-white

            bg-white/10
            backdrop-blur-md

            px-3 py-2
            sm:px-4

            text-[10px]
            sm:text-[11px]
            lg:text-[0.68vw]

            font-medium
            text-white

            transition-all
            duration-300

            group-hover:bg-[#ef493d]
            group-hover:border-[#ef493d]
          "
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <span className="hidden xs:inline">Download</span>

          <Download
            className="h-3.5 w-3.5 sm:h-4 sm:w-4"
            strokeWidth={1.8}
          />
        </span>
      )}
    </div>
  </div>
</div>

    </>
  );

  if (!report.href) {
    return (
      <article className={`${shell} border-black/10 opacity-70`}>{body}</article>
    );
  }

  return (
    <a
      href={report.href}
      target="_blank"
      rel="noopener noreferrer"
      download
      aria-label={`Download ${report.title} (PDF)`}
      className={`${shell} border-black/10 hover:border-[#e31f24]/45
                  hover:shadow-[0_24px_50px_-30px_rgba(0,0,0,0.35)]`}
    >
      {body}
    </a>
  );
}


export default function SustainabilityReports({ reports }) {
  const label = reports?.label || "Reports";
  const heading = reports?.heading || "Sustainability Reports";
  const description =
    reports?.description ||
    "Our annual and ESG reports, published for shareholders, partners and the communities we build in.";
  const note = reports?.note || "";

  const cmsItems = Array.isArray(reports?.items) ? reports.items : [];
  const source = cmsItems.length ? cmsItems : DEFAULT_ITEMS;

  const items = useMemo(() => {
    const mapped = source.map(normaliseReport).filter((r) => r.title);
    // `order` lets editors override; equal values keep authoring order.
    return mapped
      .map((r, i) => ({ r, i }))
      .sort((a, b) => a.r.order - b.r.order || a.i - b.i)
      .map(({ r }) => r);
  }, [source]);

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
          stagger: 0.06,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 82%" },
        });
      }
    },
    { scope: rootRef }
  );

  if (!items.length) return null;

  return (
    <section
      ref={rootRef}
      data-section="sustainability-reports"
      className="relative w-full overflow-hidden bg-[#faf9f7] text-[#333]
                 pt-[26px] pb-[56px] lg:pt-[4.687vw] lg:pb-[5.208vw]"
    >
      <SectionLabel
        className="lg:absolute z-[5] left-[16px] top-[56px] lg:left-[4.166vw] lg:top-[4.687vw] max-lg:static max-lg:w-full max-lg:mt-[15px] max-lg:mb-[18px]"
        color={RED}
      >
        {label}
      </SectionLabel>

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-[11.146vw]">
        <div className="flex flex-col items-center text-center gap-[14px] lg:gap-[0.729vw]">
          <SectionHeading
            data-reveal
            className="leading-[1.05] tracking-[0.02em]
                       text-[34px] xs:text-[38px] sm:text-[48px] md:text-[60px] lg:text-[3.646vw]"
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

        <div
          className="mt-[28px] lg:mt-[2.083vw] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
                     gap-[16px] lg:gap-[1.25vw]"
        >
          {items.map((r) => (
            <div key={r.id} data-reveal className="h-full">
              <ReportCard report={r} />
            </div>
          ))}
        </div>

        {note ? (
          <p
            data-reveal
            className="mt-[24px] lg:mt-[1.667vw] text-center text-[#8a8a8a]
                       text-[12px] leading-[1.6] lg:text-[0.729vw]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {note}
          </p>
        ) : null}
      </div>
    </section>
  );
}
