import React, { useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

const MONTSERRAT = "Montserrat, sans-serif";
const TARTUFFO =
  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif';

/**
 * DocumentModal — a scrollable reading panel for terms, letters and other legal
 * copy behind an "I have read and agree" checkbox. "I Agree" calls `onAccept`
 * (the form ticks its checkbox); Close / Esc / backdrop just dismiss.
 */
export default function DocumentModal({ open, eyebrow, title, onClose, onAccept, children }) {
  // Lenis owns page scrolling; pause it so the page behind stays put while
  // the panel is open.
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
          <div className="shrink-0 flex items-start justify-between gap-[16px] border-b border-[#0000001a]
                          px-[22px] pt-[24px] pb-[16px] sm:px-[32px] lg:px-[2.083vw] lg:pt-[1.667vw] lg:pb-[1.042vw]">
            <div>
              {eyebrow && (
                <span className="block font-montserrat font-medium text-[11px] sm:text-[12px] lg:text-[0.729vw] tracking-[0.08em] text-[#ef493d]">
                  {eyebrow}
                </span>
              )}
              <Dialog.Title
                className="text-[#333] leading-[1.2] mt-[6px] lg:mt-[0.365vw] text-[24px] sm:text-[28px] lg:text-[1.771vw]"
                style={{ fontFamily: TARTUFFO, fontWeight: 400 }}
              >
                {title}
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

          {/* data-lenis-prevent hands wheel/touch scrolling back to the
              browser, which Lenis otherwise swallows. */}
          <div
            data-lenis-prevent
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain
                       px-[22px] py-[20px] sm:px-[32px] lg:px-[2.083vw] lg:py-[1.563vw]"
          >
            {children}
          </div>

          <div className="shrink-0 flex items-center justify-end gap-[12px] lg:gap-[0.781vw] border-t border-[#0000001a]
                          px-[22px] py-[14px] sm:px-[32px] lg:px-[2.083vw] lg:py-[0.938vw]">
            <button
              type="button"
              onClick={() => onClose?.()}
              className="font-montserrat h-[42px] lg:h-[2.5vw] px-[18px] lg:px-[1.25vw] border border-[#33333333] text-[#333]
                         hover:border-[#333] transition-colors text-[13px] sm:text-[14px] lg:text-[0.833vw]"
            >
              Close
            </button>
            {onAccept && (
              <button
                type="button"
                onClick={() => onAccept()}
                className="font-montserrat h-[42px] lg:h-[2.5vw] px-[18px] lg:px-[1.25vw] bg-[#ef493d] border border-[#ef493d] text-white
                           hover:bg-[#d83e33] transition-colors text-[13px] sm:text-[14px] lg:text-[0.833vw]"
              >
                I Agree
              </button>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
