import React, { useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap } from "@/lib/gsapSetup";
import { FileText } from "lucide-react";
import { fileMeta, STRAPI_URL } from "@/lib/strapi";
import SectionLabel from "@/components/myhome/SectionLabel";
import SectionHeading from "@/components/common/SectionHeading";

const NAVY = "#12295c";
const TAN = "#dcb579";

/**
 * Normalise one CMS document row into the flat shape a row consumes.
 *
 * An uploaded `file` wins over `externalUrl`. A row with neither resolves to
 * `href: null` and is dropped by the caller — the page shows what the backend
 * actually holds, never a placeholder row with dead buttons.
 */
function normaliseDoc(raw, idx) {
  const meta = fileMeta(raw?.file);
  const href = meta?.url || raw?.externalUrl || null;
  return {
    id: raw?.id ?? `${raw?.title || "document"}-${idx}`,
    title: raw?.title || "",
    href,
    fileName: meta?.name || null,
    showView: raw?.showView !== false,
    showDownload: raw?.showDownload !== false,
    order: typeof raw?.order === "number" ? raw.order : 0,
  };
}

/** `order` lets editors re-sequence; equal values keep the authoring order. */
function byOrder(list) {
  return list
    .map((item, i) => ({ item, i }))
    .sort((a, b) => a.item.order - b.item.order || a.i - b.i)
    .map(({ item }) => item);
}

/**
 * Target for the Download button.
 *
 * Strapi serves uploads from its own origin, where the browser ignores the
 * `download` attribute — the file would just open in a tab, duplicating View.
 * Documents on that origin are therefore routed through the same-origin proxy,
 * which sets `Content-Disposition: attachment`. Anything hosted elsewhere falls
 * back to a direct link.
 */
function downloadHref(doc) {
  if (!doc.href) return null;
  if (STRAPI_URL && doc.href.startsWith(STRAPI_URL)) {
    const params = new URLSearchParams({ url: doc.href });
    if (doc.fileName) params.set("name", doc.fileName);
    return `/api/download?${params.toString()}`;
  }
  return doc.href;
}

/** Shared button skin — solid navy pill-less rectangle, as in the reference. */
const BUTTON_CLASS =
  "inline-flex items-center justify-center whitespace-nowrap font-montserrat font-medium " +
  "text-white transition-colors duration-300 hover:bg-[#1d3d7d] " +
  "px-[18px] py-[11px] sm:px-[24px] lg:px-[1.927vw] lg:py-[0.833vw] " +
  "text-[13px] sm:text-[14px] lg:text-[0.833vw] leading-none " +
  "max-lg:flex-1";

/** One document row — static file glyph, the CMS title, then the buttons. */
function DocumentRow({ doc, viewLabel, downloadLabel }) {
  return (
    <article
      data-reveal
      className="flex flex-col gap-[14px] bg-white
                 px-[14px] py-[14px] sm:px-[18px]
                 lg:flex-row lg:items-center lg:gap-[1.25vw] lg:px-[1.302vw] lg:py-[1.042vw]
                 shadow-[0_14px_34px_-24px_rgba(18,41,92,0.45)]"
    >
      <div className="flex items-center gap-[12px] lg:gap-[1.25vw] flex-1 min-w-0">
        {/* The only thing on this page that isn't editor-managed: the document
            glyph is decorative and identical on every row. */}
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 items-center justify-center rounded-full
                     w-[42px] h-[42px] sm:w-[46px] sm:h-[46px]
                     lg:w-[2.813vw] lg:h-[2.813vw]"
          style={{ backgroundColor: TAN, color: NAVY }}
        >
          <FileText
            className="w-[19px] h-[19px] sm:w-[21px] sm:h-[21px] lg:w-[1.25vw] lg:h-[1.25vw]"
            strokeWidth={1.6}
          />
        </span>

        <p
          className="flex-1 min-w-0 border font-montserrat break-words
                     px-[12px] py-[10px] sm:px-[16px] sm:py-[12px]
                     lg:px-[1.042vw] lg:py-[0.833vw]
                     text-[13px] sm:text-[15px] lg:text-[0.938vw] leading-[1.45]"
          style={{ borderColor: NAVY, color: NAVY }}
        >
          {doc.title}
        </p>
      </div>

      {doc.showView || doc.showDownload ? (
        <div className="flex items-center gap-[10px] lg:gap-[0.833vw] shrink-0 max-lg:w-full">
          {doc.showView ? (
            <a
              href={doc.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${doc.title}`}
              className={BUTTON_CLASS}
              style={{ backgroundColor: NAVY }}
            >
              {viewLabel}
            </a>
          ) : null}

          {doc.showDownload ? (
            <a
              href={downloadHref(doc)}
              download={doc.fileName || ""}
              aria-label={`Download ${doc.title}`}
              className={BUTTON_CLASS}
              style={{ backgroundColor: NAVY }}
            >
              {downloadLabel}
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

/** One titled block — heading, underline rule, optional intro, then the rows. */
function DocumentBlock({ block, headingAs = "h2" }) {
  const docs = useMemo(() => {
    const list = (Array.isArray(block?.documents) ? block.documents : [])
      .map(normaliseDoc)
      // A row is only real once it has a title *and* something to open.
      .filter((d) => d.title && d.href);
    return byOrder(list);
  }, [block]);

  if (!docs.length) return null;

  const viewLabel = block?.viewLabel || "View";
  const downloadLabel = block?.downloadLabel || "Download";

  return (
    <div className="relative w-full">
      {block?.label ? (
        <SectionLabel
          className="lg:absolute z-[5] left-0 top-[8px] lg:left-[-5.2vw] lg:top-[0.521vw]
                     max-lg:static max-lg:w-full max-lg:mb-[14px]"
          color={NAVY}
        >
          {block.label}
        </SectionLabel>
      ) : null}

      <div className="flex flex-col items-center text-center">
        <SectionHeading
          as={headingAs}
          data-reveal
          className="uppercase leading-[1.15] tracking-[0.06em]
                     text-[26px] xs:text-[30px] sm:text-[38px] md:text-[46px] lg:text-[2.708vw]"
          style={{ color: NAVY }}
        >
          {block?.heading}
        </SectionHeading>

        {/* Hairline under the heading, fading out at both ends. */}
        <span
          data-reveal
          aria-hidden="true"
          className="mt-[10px] lg:mt-[0.625vw] h-px w-full
                     max-w-[280px] sm:max-w-[380px] lg:max-w-[23.958vw]"
          style={{
            background: `linear-gradient(90deg, transparent, ${NAVY}66, transparent)`,
          }}
        />

        {block?.description ? (
          <p
            data-reveal
            className="mt-[14px] lg:mt-[0.938vw] max-w-[70ch] font-montserrat text-[#5f5f5f]
                       text-[14px] leading-[1.7] sm:text-[15px] lg:text-[0.937vw]"
          >
            {block.description}
          </p>
        ) : null}
      </div>

      <div className="mt-[24px] lg:mt-[2.083vw] flex flex-col gap-[16px] lg:gap-[1.25vw]">
        {docs.map((doc) => (
          <DocumentRow
            key={doc.id}
            doc={doc}
            viewLabel={viewLabel}
            downloadLabel={downloadLabel}
          />
        ))}
      </div>

      {block?.note ? (
        <p
          data-reveal
          className="mt-[18px] lg:mt-[1.25vw] text-center font-montserrat text-[#8a8a8a]
                     text-[12px] leading-[1.6] lg:text-[0.729vw]"
        >
          {block.note}
        </p>
      ) : null}
    </div>
  );
}

/**
 * InvestorDocuments — the body of the Investor page.
 *
 * Renders every document block the backend serves (Annual Return, financial
 * statements, policies …) as one continuous cream band, so adding a block in
 * Strapi is all it takes to extend the page. Each block is a centred serif
 * heading over a stack of white rows: file glyph, the document title in a
 * bordered box, then View (opens the PDF) and Download (forces a save).
 *
 * Nothing here has built-in fallback content. A row without a file or URL is
 * dropped, a block whose rows are all empty is dropped, and with no populated
 * blocks the component renders nothing at all.
 *
 * Responsive: desktop (lg+) sizes in vw off the 1920 design; below that the
 * row switches to a stacked layout with full-width buttons and fixed-px type.
 */
export default function InvestorDocuments({ sections, titleAs = "h2" }) {
  const rootRef = useRef(null);

  const blocks = useMemo(() => {
    const list = (Array.isArray(sections) ? sections : [])
      .filter((s) => s?.heading)
      .map((s, i) => ({
        ...s,
        _key: s?.id ?? `${s?.heading}-${i}`,
        order: typeof s?.order === "number" ? s.order : 0,
      }))
      // Keep only blocks that will actually render a row.
      .filter((s) =>
        (Array.isArray(s.documents) ? s.documents : []).some(
          (d) => d?.title && (fileMeta(d?.file) || d?.externalUrl)
        )
      );
    return byOrder(list);
  }, [sections]);

  useGSAP(
    () => {
      registerGsap();
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const targets = rootRef.current?.querySelectorAll("[data-reveal]");
      if (targets?.length && !reduce) {
        gsap.from(targets, {
          y: 36,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.05,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 85%" },
        });
      }
    },
    { scope: rootRef, dependencies: [blocks.length] }
  );

  if (!blocks.length) return null;

  return (
    <section
      ref={rootRef}
      data-section="investor-documents"
      className="relative w-full overflow-hidden
                 pt-[44px] pb-[56px] lg:pt-[4.167vw] lg:pb-[5.208vw]"
      style={{
        background:
          "linear-gradient(180deg, #fbeedd 0%, #fdf5ea 45%, #fdf8f2 100%)",
      }}
    >
      <div
        className="mx-auto w-full px-5 sm:px-8 lg:px-[11.146vw]
                   flex flex-col gap-[48px] lg:gap-[4.167vw]"
      >
        {blocks.map((block, index) => (
          <DocumentBlock
            key={block._key}
            block={block}
            headingAs={index === 0 ? titleAs : "h2"}
          />
        ))}
      </div>
    </section>
  );
}
