import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ChevronDown, Download } from "lucide-react";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import SectionLabel from "@/components/myhome/SectionLabel";
import SectionHeading from "@/components/common/SectionHeading";
import {
  COVER_LETTER,
  REGISTRATION_TERMS,
  AGREEMENT_PREAMBLE,
  AGREEMENT_CLAUSES,
  ANNEXURE_A,
} from "@/lib/channelPartnerAgreement";

const MONTSERRAT = "Montserrat, sans-serif";

/** Printable copy of the agreement, for franking / e-stamping and signing. */
export const AGREEMENT_PDF = "/documents/channel-partner-agreement.pdf";

const bodyCls =
  "text-[#555] text-[14px] sm:text-[15px] lg:text-[0.938vw] leading-[24px] sm:leading-[26px] lg:leading-[1.6vw]";
const subheadCls =
  "font-semibold uppercase tracking-[0.06em] text-[#ef493d] text-[12px] sm:text-[13px] lg:text-[0.781vw]";

/**
 * Renders agreement copy, turning each `{{Label}}` blank into a marked
 * placeholder — the printed form's dotted line, labelled with what goes there.
 */
function AgreementText({ text }) {
  const parts = String(text).split(/(\{\{[^}]+\}\})/g);
  return parts.map((part, i) => {
    const blank = part.match(/^\{\{([^}]+)\}\}$/);
    if (!blank) return <React.Fragment key={i}>{part}</React.Fragment>;
    return (
      <span
        key={i}
        className="inline-block border-b border-dashed border-[#999] px-[4px] text-[#999] italic text-[0.9em]"
      >
        {blank[1]}
      </span>
    );
  });
}

/** One collapsible clause of the agreement. */
function Clause({ index, title, open, onToggle, children }) {
  const id = `cpa-clause-${index}`;
  return (
    <div className="border-b border-[#33333322]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center justify-between gap-[16px] text-left
                   py-[16px] lg:py-[1.042vw] group"
      >
        <span
          className="text-[#333] group-hover:text-[#ef493d] transition-colors font-medium
                     text-[15px] sm:text-[16px] lg:text-[1.042vw]"
        >
          {title}
        </span>
        <ChevronDown
          className={`shrink-0 w-[18px] h-[18px] lg:w-[1.146vw] lg:h-[1.146vw] text-[#ef493d]
                      transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          strokeWidth={1.6}
        />
      </button>
      <div id={id} hidden={!open} className="pb-[18px] lg:pb-[1.25vw]">
        {children}
      </div>
    </div>
  );
}

/**
 * Channel Partner Agreement — the cover letter, the registration terms, every
 * clause of the Domestic Channel Partner Agreement and the Annexure A payment
 * matrix, transcribed from the printed agreement. The clauses collapse so the
 * form below stays within reach; "Expand all" opens the whole document.
 */
export default function AgreementTerms() {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  // Index 0 is the parties & recitals block, clauses follow from 1.
  const total = AGREEMENT_CLAUSES.length + 1;
  const [openSet, setOpenSet] = useState(() => new Set([0]));
  const allOpen = openSet.size === total;

  const toggle = (i) =>
    setOpenSet((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const toggleAll = () =>
    setOpenSet(allOpen ? new Set() : new Set(Array.from({ length: total }, (_, i) => i)));

  useGSAP(
    () => {
      registerGsap();
      const words = splitToWords(headingRef.current);
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

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden
                 pt-[60px] md:pt-[90px] lg:pt-[5.208vw]
                 pb-[40px] md:pb-[60px] lg:pb-[3.125vw]"
      style={{ fontFamily: MONTSERRAT }}
    >
      <div className="lg:absolute left-[4.167vw] top-[5.208vw] max-lg:flex max-lg:justify-center max-lg:mb-[18px]">
        <SectionLabel>The Agreement</SectionLabel>
      </div>

      <div className="px-5 md:px-12 lg:px-[15.625vw]">
        <SectionHeading
          ref={headingRef}
          className="text-[#333] capitalize text-center will-change-transform leading-[1.05] tracking-[0.021em]
                     text-[38px] xs:text-[44px] sm:text-[56px] md:text-[72px] lg:text-[5vw]"
        >
          Channel Partner Agreement
        </SectionHeading>

        {/* Cover letter */}
        <div className="mt-[36px] lg:mt-[3.125vw] bg-[#f4f4f3] p-[22px] sm:p-[32px] lg:p-[2.604vw] flex flex-col gap-[14px] lg:gap-[0.938vw]">
          <p className={`${bodyCls} text-[#333]`}>Dear Partner,</p>
          <p className={`${bodyCls} italic`}>{COVER_LETTER.greeting}</p>
          {COVER_LETTER.paragraphs.map((p, i) => (
            <p key={i} className={`${bodyCls} text-justify`}>
              {p}
            </p>
          ))}
          <a
            href={AGREEMENT_PDF}
            download
            className="self-start inline-flex items-center gap-[8px] lg:gap-[0.521vw] mt-[6px]
                       text-[#ef493d] hover:underline underline-offset-4
                       text-[14px] sm:text-[15px] lg:text-[0.938vw] font-medium"
          >
            <Download className="w-[16px] h-[16px] lg:w-[1.042vw] lg:h-[1.042vw]" strokeWidth={1.8} />
            Download the printable agreement (PDF)
          </a>
        </div>

        {/* Registration terms */}
        <div className="mt-[36px] lg:mt-[2.604vw]">
          <h3 className={subheadCls}>Registration Terms &amp; Conditions</h3>
          <ol className="mt-[14px] lg:mt-[0.938vw] list-decimal pl-[20px] lg:pl-[1.25vw] flex flex-col gap-[8px] lg:gap-[0.521vw]">
            {REGISTRATION_TERMS.map((t, i) => (
              <li key={i} className={bodyCls}>
                {t}
              </li>
            ))}
          </ol>
        </div>

        {/* Agreement clauses */}
        <div className="mt-[36px] lg:mt-[2.604vw]">
          <div className="flex items-center justify-between gap-[16px] border-b border-[#33333344] pb-[12px] lg:pb-[0.781vw]">
            <h3 className={subheadCls}>{AGREEMENT_PREAMBLE.title}</h3>
            <button
              type="button"
              onClick={toggleAll}
              className="shrink-0 text-[#ef493d] hover:underline underline-offset-4 text-[13px] lg:text-[0.833vw]"
            >
              {allOpen ? "Collapse all" : "Expand all"}
            </button>
          </div>

          <Clause index={0} title="Parties & Recitals" open={openSet.has(0)} onToggle={() => toggle(0)}>
            <div className="flex flex-col gap-[12px] lg:gap-[0.781vw]">
              {AGREEMENT_PREAMBLE.paragraphs.map((p, i) =>
                p === "BETWEEN" || p === "AND" ? (
                  <p key={i} className={`${bodyCls} text-center font-semibold text-[#333]`}>
                    {p}
                  </p>
                ) : (
                  <p key={i} className={`${bodyCls} text-justify`}>
                    <AgreementText text={p} />
                  </p>
                )
              )}
              <p className={`${bodyCls} font-semibold text-[#333]`}>RECITALS</p>
              <ol className="list-[upper-alpha] pl-[20px] lg:pl-[1.25vw] flex flex-col gap-[8px] lg:gap-[0.521vw]">
                {AGREEMENT_PREAMBLE.recitals.map((r, i) => (
                  <li key={i} className={`${bodyCls} text-justify`}>
                    {r}
                  </li>
                ))}
              </ol>
              <p className={`${bodyCls} font-semibold text-[#333]`}>
                NOW THIS CHANNEL PARTNER AGREEMENT WITNESSETH AS FOLLOWS
              </p>
            </div>
          </Clause>

          {AGREEMENT_CLAUSES.map((clause, i) => {
            const idx = i + 1;
            return (
              <Clause
                key={clause.title}
                index={idx}
                title={`${idx}. ${clause.title}`}
                open={openSet.has(idx)}
                onToggle={() => toggle(idx)}
              >
                <div className="flex flex-col gap-[12px] lg:gap-[0.781vw]">
                  {clause.body?.map((p, j) => (
                    <p key={j} className={`${bodyCls} text-justify`}>
                      <AgreementText text={p} />
                    </p>
                  ))}
                  {clause.items?.map((item) => (
                    <div key={item.n} className="flex gap-[12px] lg:gap-[0.833vw]">
                      <span className={`${bodyCls} shrink-0 font-semibold text-[#333]`}>{item.n}</span>
                      <p className={`${bodyCls} text-justify`}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </Clause>
            );
          })}
        </div>

        {/* Annexure A */}
        <div className="mt-[36px] lg:mt-[2.604vw]">
          <h3 className={subheadCls}>
            {ANNEXURE_A.title} <span className="normal-case tracking-normal text-[#777]">{ANNEXURE_A.subtitle}</span>
          </h3>
          <div className="mt-[14px] lg:mt-[0.938vw] overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="bg-[#ef493d] text-white text-left">
                  {ANNEXURE_A.columns.map((c) => (
                    <th
                      key={c}
                      className="font-semibold align-top p-[12px] lg:p-[0.833vw] text-[13px] sm:text-[14px] lg:text-[0.885vw]"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ANNEXURE_A.rows.map((row, r) => (
                  <tr key={r} className="border-b border-x border-[#33333333]">
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className={`align-top p-[12px] lg:p-[0.833vw] ${c > 0 ? "border-l border-[#33333333]" : ""}`}
                      >
                        <div className="flex flex-col gap-[8px] lg:gap-[0.521vw]">
                          {cell.map((p, k) => (
                            <p key={k} className={bodyCls}>
                              {p}
                            </p>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
