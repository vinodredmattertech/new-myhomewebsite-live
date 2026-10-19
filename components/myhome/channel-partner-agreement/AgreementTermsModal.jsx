import React, { useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import {
  REGISTRATION_TERMS,
  AGREEMENT_PREAMBLE,
  AGREEMENT_CLAUSES,
  ANNEXURE_A,
} from "@/lib/channelPartnerAgreement";

const MONTSERRAT = "Montserrat, sans-serif";
const TARTUFFO =
  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif';

const bodyCls =
  "font-montserrat text-[#555] text-[13px] sm:text-[14px] lg:text-[0.833vw] leading-[22px] sm:leading-[24px] lg:leading-[1.458vw]";
const subheadCls =
  "font-montserrat font-semibold uppercase tracking-[0.06em] text-[#ef493d] text-[12px] sm:text-[13px] lg:text-[0.781vw]";
const clauseTitleCls = "font-montserrat text-[#333] font-semibold text-[14px] sm:text-[15px] lg:text-[0.938vw]";

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

/**
 * AgreementTermsModal — the full terms behind the "I have read and agree"
 * checkbox on the registration form: the registration terms, every clause of
 * the Domestic Channel Partner Agreement and the Annexure A payment matrix,
 * transcribed from the printed agreement (lib/channelPartnerAgreement.js).
 *
 * The body scrolls inside the panel; "Accept" ticks the checkbox via `onAccept`.
 */
export default function AgreementTermsModal({ open, onClose, onAccept }) {
  // Lenis owns page scrolling; pause it so the page behind stays put while
  // the terms are open.
  useEffect(() => {
    if (!open) return undefined;
    window.__lenis?.stop();
    return () => window.__lenis?.start();
  }, [open]);

  return (
    <Dialog open={open} onClose={() => onClose?.()} className="fixed inset-0 z-[100]">
      <div className="fixed inset-0 bg-black/55 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 py-[24px]">
        <Dialog.Panel
          className="relative flex flex-col w-full max-w-[860px] lg:max-w-[52vw]
                     max-h-[calc(100svh-48px)] bg-white rounded-[10px]
                     shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]"
          style={{ fontFamily: MONTSERRAT }}
        >
          {/* Header */}
          <div className="shrink-0 flex items-start justify-between gap-[16px] border-b border-[#0000001a]
                          px-[22px] pt-[24px] pb-[16px] sm:px-[32px] lg:px-[2.083vw] lg:pt-[1.667vw] lg:pb-[1.042vw]">
            <div>
              <span className="block font-medium text-[11px] sm:text-[12px] lg:text-[0.729vw] tracking-[0.08em] text-[#ef493d]">
                Terms &amp; Conditions
              </span>
              <Dialog.Title
                className="text-[#333] leading-[1.2] mt-[6px] lg:mt-[0.365vw] text-[24px] sm:text-[28px] lg:text-[1.771vw]"
                style={{ fontFamily: TARTUFFO, fontWeight: 400 }}
              >
                Channel Partner Agreement
              </Dialog.Title>
            </div>
            <button
              type="button"
              onClick={() => onClose?.()}
              aria-label="Close"
              className="shrink-0 inline-flex items-center justify-center rounded-full
                         w-[34px] h-[34px] lg:w-[2.083vw] lg:h-[2.083vw]
                         text-[#333] hover:text-[#ef493d] transition-colors"
            >
              <X className="w-[18px] h-[18px] lg:w-[1.146vw] lg:h-[1.146vw]" strokeWidth={1.8} />
            </button>
          </div>

          {/* Scrollable terms — data-lenis-prevent hands wheel/touch scrolling
              back to the browser, which Lenis otherwise swallows. */}
          <div
            data-lenis-prevent
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain
                          px-[22px] py-[20px] sm:px-[32px] lg:px-[2.083vw] lg:py-[1.563vw]
                          flex flex-col gap-[28px] lg:gap-[1.823vw]"
          >
            {/* Registration terms */}
            <section>
              <h3 className={subheadCls}>Registration Terms &amp; Conditions</h3>
              <ol className="mt-[12px] lg:mt-[0.781vw] list-decimal pl-[20px] lg:pl-[1.25vw] flex flex-col gap-[6px] lg:gap-[0.417vw]">
                {REGISTRATION_TERMS.map((t, i) => (
                  <li key={i} className={bodyCls}>
                    {t}
                  </li>
                ))}
              </ol>
            </section>

            {/* Agreement */}
            <section className="flex flex-col gap-[12px] lg:gap-[0.781vw]">
              <h3 className={subheadCls}>{AGREEMENT_PREAMBLE.title}</h3>
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
              <ol className="list-[upper-alpha] pl-[20px] lg:pl-[1.25vw] flex flex-col gap-[6px] lg:gap-[0.417vw]">
                {AGREEMENT_PREAMBLE.recitals.map((r, i) => (
                  <li key={i} className={`${bodyCls} text-justify`}>
                    {r}
                  </li>
                ))}
              </ol>
              <p className={`${bodyCls} font-semibold text-[#333]`}>
                NOW THIS CHANNEL PARTNER AGREEMENT WITNESSETH AS FOLLOWS
              </p>

              {AGREEMENT_CLAUSES.map((clause, i) => (
                <div key={clause.title} className="flex flex-col gap-[8px] lg:gap-[0.521vw] mt-[6px] lg:mt-[0.313vw]">
                  <h4 className={clauseTitleCls}>
                    {i + 1}. {clause.title}
                  </h4>
                  {clause.body?.map((p, j) => (
                    <p key={j} className={`${bodyCls} text-justify`}>
                      <AgreementText text={p} />
                    </p>
                  ))}
                  {clause.items?.map((item) => (
                    <div key={item.n} className="flex gap-[10px] lg:gap-[0.729vw]">
                      <span className={`${bodyCls} shrink-0 font-semibold text-[#333]`}>{item.n}</span>
                      <p className={`${bodyCls} text-justify`}>{item.text}</p>
                    </div>
                  ))}
                </div>
              ))}
            </section>

            {/* Annexure A */}
            <section>
              <h3 className={subheadCls}>
                {ANNEXURE_A.title}{" "}
                <span className="normal-case tracking-normal text-[#777]">{ANNEXURE_A.subtitle}</span>
              </h3>
              <div className="mt-[12px] lg:mt-[0.781vw] overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse">
                  <thead>
                    <tr className="bg-[#ef493d] text-white text-left">
                      {ANNEXURE_A.columns.map((c) => (
                        <th
                          key={c}
                          className="font-semibold align-top p-[10px] lg:p-[0.677vw] text-[12px] sm:text-[13px] lg:text-[0.781vw]"
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
                            className={`align-top p-[10px] lg:p-[0.677vw] ${c > 0 ? "border-l border-[#33333333]" : ""}`}
                          >
                            <div className="flex flex-col gap-[6px] lg:gap-[0.417vw]">
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
            </section>
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center justify-end gap-[12px] lg:gap-[0.781vw] border-t border-[#0000001a]
                          px-[22px] py-[14px] sm:px-[32px] lg:px-[2.083vw] lg:py-[0.938vw]">
            <button
              type="button"
              onClick={() => onClose?.()}
              className="h-[42px] lg:h-[2.5vw] px-[18px] lg:px-[1.25vw] border border-[#33333333] text-[#333]
                         hover:border-[#333] transition-colors text-[13px] sm:text-[14px] lg:text-[0.833vw]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onAccept?.()}
              className="h-[42px] lg:h-[2.5vw] px-[18px] lg:px-[1.25vw] bg-[#ef493d] border border-[#ef493d] text-white
                         hover:bg-[#d83e33] transition-colors text-[13px] sm:text-[14px] lg:text-[0.833vw]"
            >
              I Agree
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
