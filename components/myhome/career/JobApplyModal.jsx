import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import { MapPin, X } from "lucide-react";
import JobApplicationForm from "@/components/myhome/career/JobApplicationForm";

const RED = "#ef493d";
const TARTUFFO =
  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif';

/**
 * JobApplyModal — the "Apply Now" dialog opened from a vacant position.
 *
 * The designation the candidate clicked sits at the top of the panel (with the
 * location and experience beneath it, when the CMS has them) and is submitted
 * with the application, so every resume lands in Strapi tagged with the role it
 * was sent for. The fields themselves are the shared JobApplicationForm, the
 * same five the open form above the footer uses.
 */
export default function JobApplyModal({ open, job, copy = {}, onClose }) {
  const [justSubmitted, setJustSubmitted] = useState(false);
  const closeTimer = useRef(null);

  // Let the success line show for a beat, then close on its own.
  useEffect(() => {
    if (!justSubmitted) return undefined;
    closeTimer.current = window.setTimeout(() => {
      setJustSubmitted(false);
      onClose?.();
    }, 1800);
    return () => window.clearTimeout(closeTimer.current);
  }, [justSubmitted, onClose]);

  // Reset the pending auto-close if the panel is dismissed by hand.
  useEffect(() => {
    if (!open) {
      window.clearTimeout(closeTimer.current);
      setJustSubmitted(false);
    }
  }, [open]);

  const designation = job?.title || copy.generalDesignation || "General Application";

  return (
    <Dialog open={open} onClose={() => onClose?.()} className="fixed inset-0 z-[100]">
      <div className="fixed inset-0 bg-black/55 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-start sm:items-center justify-center overflow-y-auto p-4 py-[24px]">
        <Dialog.Panel
          className="relative w-full max-w-[480px] lg:max-w-[30vw] my-auto
                     bg-white rounded-[10px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]
                     px-[22px] py-[26px] sm:px-[32px] sm:py-[34px] lg:px-[2.083vw] lg:py-[2.083vw]"
        >
          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Close"
            className="absolute right-[10px] top-[10px] lg:right-[0.781vw] lg:top-[0.781vw]
                       inline-flex items-center justify-center rounded-full
                       w-[34px] h-[34px] lg:w-[2.083vw] lg:h-[2.083vw]
                       text-[#333] hover:text-[#ef493d] transition-colors"
          >
            <X className="w-[18px] h-[18px] lg:w-[1.146vw] lg:h-[1.146vw]" strokeWidth={1.8} />
          </button>

          {/* Designation the candidate is applying for */}
          <span
            className="block font-medium capitalize
                       text-[11px] sm:text-[12px] lg:text-[0.729vw] tracking-[0.08em]"
            style={{ fontFamily: "Montserrat, sans-serif", color: RED }}
          >
            {copy.modalHeading || "Apply For"}
          </span>
          <Dialog.Title
            className="text-[#333] leading-[1.2] capitalize
                       mt-[6px] lg:mt-[0.365vw] pr-[30px] lg:pr-[2vw]
                       text-[24px] sm:text-[28px] lg:text-[1.771vw]"
            style={{ fontFamily: TARTUFFO, fontWeight: 400 }}
          >
            {designation}
          </Dialog.Title>

          {(job?.location || job?.experience) && (
            <div
              className="flex flex-wrap items-center gap-x-[16px] gap-y-[6px] lg:gap-x-[1.042vw]
                         mt-[10px] lg:mt-[0.625vw] text-[#5f5f5f]
                         text-[12px] sm:text-[13px] lg:text-[0.833vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {job?.location && (
                <span className="inline-flex items-center gap-[6px] lg:gap-[0.365vw] capitalize">
                  <MapPin
                    className="w-[14px] h-[14px] lg:w-[0.938vw] lg:h-[0.938vw]"
                    strokeWidth={1.6}
                  />
                  {job.location}
                </span>
              )}
              {job?.experience && (
                <span>
                  <span className="font-medium">Experience:</span> {job.experience}
                </span>
              )}
            </div>
          )}

          <div
            className="h-px w-full bg-[#0000001a] mt-[16px] lg:mt-[1.042vw]"
            aria-hidden="true"
          />

          <JobApplicationForm
            /* Remount per position so a previous entry never carries over. */
            key={designation}
            designation={designation}
            formSource="Career Page — Apply Now"
            submitText={copy.submitText || "Submit Application"}
            successMessage={
              copy.successMessage || "Thank you — your application has been received."
            }
            compact
            variant="solid"
            className="mt-[20px] lg:mt-[1.302vw]"
            onSuccess={() => setJustSubmitted(true)}
          />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
