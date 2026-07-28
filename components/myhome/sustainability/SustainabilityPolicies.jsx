import React, { useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import { Download, FileText } from "lucide-react";
import { fileMeta } from "@/lib/strapi";
import SectionLabel from "@/components/myhome/SectionLabel";
import SectionHeading from "@/components/common/SectionHeading";

const RED = "#ef493d";
const CATEGORIES = ["Environment", "Social", "Governance"];

/* Built-in document list so the band renders before the `policies` component is
   filled in on the Sustainability single type — same convention as the rest of
   the page. Titles track My Home Group's published policy library; the real
   PDFs are attached per item in Strapi.

   The first document in each category points at a shipped placeholder PDF so
   both card states are visible without a backend: a document that is available
   (file glyph, "PDF" meta, red Download button, whole card clickable) next to
   ones that aren't yet ("Document coming soon", card dimmed and inert). Once
   Strapi serves a `policies` component this list is not used at all. */
const SAMPLE_PDF = "/assets/myhome/sustainability/policies/sample-policy.pdf";

const DEFAULT_ITEMS = [
  { title: "HSE Policy", category: "Environment", externalUrl: SAMPLE_PDF },
  { title: "ESG Policy", category: "Environment" },
  { title: "Conduct Policy", category: "Environment" },

  { title: "CSR Policy", category: "Social", externalUrl: SAMPLE_PDF },
  { title: "DEI Policy", category: "Social" },
  { title: "POSH Policy", category: "Social" },
  { title: "Employee Remuneration Policy", category: "Social" },
  { title: "Fire Safety Policy", category: "Social" },
  { title: "Well-being Policy", category: "Social" },
  { title: "Whistleblower Policy", category: "Social" },
  { title: "Conflict of Interest Policy", category: "Social" },

  { title: "Code of Conduct", category: "Governance", externalUrl: SAMPLE_PDF },
  { title: "Vigilance Policy", category: "Governance" },
  { title: "Human Policy", category: "Governance" },
  { title: "IMS Policy", category: "Governance" },
  { title: "IT Policy", category: "Governance" },
  { title: "IT Data Protection and Privacy Policy", category: "Governance" },
  { title: "Procurement Policy", category: "Governance" },
];

/** Normalise a CMS policy row into the flat shape the card consumes. An
 *  uploaded `file` wins over `externalUrl`; with neither, the card renders in a
 *  non-interactive "coming soon" state rather than a dead link. */
function normalisePolicy(raw, idx) {
  const meta = fileMeta(raw?.file);
  const href = meta?.url || raw?.externalUrl || null;
  return {
    id: raw?.id ?? `${raw?.title || "policy"}-${idx}`,
    title: raw?.title || "",
    description: raw?.description || "",
    category: CATEGORIES.includes(raw?.category) ? raw.category : "Governance",
    href,
    // An external URL has no metadata to read, so fall back to a plain PDF tag.
    ext: meta?.ext || (href ? "PDF" : null),
    sizeLabel: meta?.sizeLabel || null,
    order: typeof raw?.order === "number" ? raw.order : 0,
  };
}

/** One document row — file glyph, title, meta chips and a download affordance. */
function PolicyCard({ policy }) {
  const shell =
    "group relative flex h-full flex-col rounded-[12px] border bg-white " +
    "p-[20px] sm:p-[24px] lg:p-[1.667vw] transition-colors duration-500";

  const body = (
    <>
      {/* File glyph only — the category is already established by the active
          filter tab above, so repeating it on every card is redundant. */}
      <span
        aria-hidden="true"
        className="inline-flex shrink-0 items-center justify-center rounded-[8px]
                   w-[42px] h-[42px] lg:w-[2.604vw] lg:h-[2.604vw]
                   bg-[#ef493d]/8 text-[#ef493d]"
      >
        <FileText
          className="w-[19px] h-[19px] lg:w-[1.146vw] lg:h-[1.146vw]"
          strokeWidth={1.5}
        />
      </span>

      <h3
        className="mt-[16px] lg:mt-[1.042vw] leading-[1.25] text-[#333]
                   text-[18px] sm:text-[20px] lg:text-[1.25vw]"
        style={{
          fontFamily:
            '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
          fontWeight: 400,
        }}
      >
        {policy.title}
      </h3>

      {policy.description ? (
        <p
          className="mt-[8px] lg:mt-[0.521vw] text-[#5f5f5f]
                     text-[13px] leading-[1.6] lg:text-[0.781vw] lg:leading-[1.302vw]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {policy.description}
        </p>
      ) : null}

      <div className="mt-auto pt-[18px] lg:pt-[1.25vw] flex items-center justify-between gap-[12px]">
        <span
          className="font-montserrat text-[#8a8a8a] text-[11px] lg:text-[0.677vw] leading-none"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {policy.href
            ? [policy.ext, policy.sizeLabel].filter(Boolean).join(" · ")
            : "Document coming soon"}
        </span>

        {policy.href ? (
          <span
            className="inline-flex items-center gap-[7px] lg:gap-[0.417vw]
                       rounded-full border border-[#e31f24] text-[#e31f24]
                       px-[14px] py-[8px] lg:px-[0.99vw] lg:py-[0.521vw]
                       font-montserrat font-medium capitalize
                       text-[11px] lg:text-[0.677vw] leading-none whitespace-nowrap
                       transition-colors duration-300
                       group-hover:bg-[#e31f24] group-hover:text-white"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Download
            <Download
              className="w-[12px] h-[12px] lg:w-[0.729vw] lg:h-[0.729vw]"
              strokeWidth={1.6}
            />
          </span>
        ) : null}
      </div>
    </>
  );

  // No document attached yet — render the same card, minus the link semantics,
  // so the library stays complete without offering a broken download.
  if (!policy.href) {
    return (
      <article className={`${shell} border-black/10 opacity-70`}>{body}</article>
    );
  }

  return (
    <a
      href={policy.href}
      target="_blank"
      rel="noopener noreferrer"
      download
      aria-label={`Download ${policy.title} (PDF)`}
      className={`${shell} border-black/10 hover:border-[#e31f24]/45
                  hover:shadow-[0_24px_50px_-30px_rgba(0,0,0,0.35)]`}
    >
      {body}
    </a>
  );
}

/**
 * SustainabilityPolicies — the downloadable policy library that closes the
 * Sustainability page.
 *
 * Follows the "Strategic Pillars" band, so it opens white against that band's
 * off-white. The library runs to ~18 documents, which is too many to read as a
 * flat grid, so it reuses the CSR page's filter-tab pattern: one bordered row
 * of ESG categories with the active tab filled red. There is no "All" tab —
 * the grid always shows a single category, opening on the first one. Each
 * document is a card linking straight to its PDF; the card carries no category
 * tag, since the active tab already says which category you are looking at.
 *
 * Responsive: one column on mobile, two from `sm`, three from `lg`; the filter
 * tabs wrap rather than scroll so every category stays reachable.
 */
export default function SustainabilityPolicies({ policies }) {
  const label = policies?.label || "Policies & Reports";
  const heading = policies?.heading || "Sustainability Policies";
  const description =
    policies?.description ||
    "The commitments on this page are written down, approved and published. Every policy governing how we build is available here.";
  const note = policies?.note || "";

  const cmsItems = Array.isArray(policies?.items) ? policies.items : [];
  const source = cmsItems.length ? cmsItems : DEFAULT_ITEMS;

  const items = useMemo(() => {
    const mapped = source.map(normalisePolicy).filter((p) => p.title);
    // `order` lets editors override; equal values keep authoring order.
    return mapped
      .map((p, i) => ({ p, i }))
      .sort((a, b) => a.p.order - b.p.order || a.i - b.i)
      .map(({ p }) => p);
  }, [source]);

  // Only offer tabs for categories that actually have documents. There is no
  // "All" tab — the grid always shows exactly one ESG category.
  const tabs = useMemo(
    () => CATEGORIES.filter((c) => items.some((p) => p.category === c)),
    [items]
  );

  const [active, setActive] = useState(null);
  // Default to the first populated category; `active` is only pinned once the
  // visitor picks a tab, so the default survives the document list changing.
  const current = active && tabs.includes(active) ? active : tabs[0];

  const visible = useMemo(
    () => items.filter((p) => p.category === current),
    [items, current]
  );

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
      data-section="sustainability-policies"
      className="relative w-full overflow-hidden bg-white text-[#333]
                 pt-[26px] pb-[56px] lg:pt-[4.687vw] lg:pb-[5.208vw]"
    >
      <SectionLabel
        className="lg:absolute z-[5] left-[16px] top-[56px] lg:left-[4.166vw] lg:top-[4.687vw] max-lg:static max-lg:w-full max-lg:mt-[15px] max-lg:mb-[18px]"
        color={RED}
      >
        {label}
      </SectionLabel>

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-[11.146vw]">
        {/* Centred header */}
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

        {/* Category tabs — one per ESG category, no "All" */}
        {tabs.length > 1 ? (
          <div
            data-reveal
            className="mt-[26px] lg:mt-[1.823vw] flex justify-center"
          >
            <div
              className="flex flex-wrap justify-center items-stretch
                         border border-[#e7e7e7] rounded-[6px] max-w-full
                         p-[6px] lg:p-0 gap-[4px] lg:gap-0"
            >
              {tabs.map((t) => {
                const isActive = current === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActive(t)}
                    aria-pressed={isActive}
                    className={`font-montserrat capitalize transition-colors duration-300 rounded-[4px] lg:rounded-none
                                px-[14px] sm:px-[20px] lg:px-[1.302vw]
                                py-[9px] sm:py-[11px] lg:py-[0.833vw]
                                text-[12px] sm:text-[14px] lg:text-[0.833vw] leading-none
                                ${
                                  isActive
                                    ? "bg-[#ef493d] text-white"
                                    : "bg-transparent text-[#454545] hover:text-[#ef493d]"
                                }`}
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Document grid */}
        <div
          className="mt-[28px] lg:mt-[2.083vw] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                     gap-[16px] lg:gap-[1.25vw]"
        >
          {visible.map((p) => (
            <div key={p.id} data-reveal className="h-full">
              <PolicyCard policy={p} />
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
