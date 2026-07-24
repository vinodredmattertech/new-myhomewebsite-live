import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Dialog } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Download, X } from "lucide-react";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { submitLead } from "@/lib/strapi";
import SectionHeading from "@/components/common/SectionHeading";
import CountryCodeSelect, { DEFAULT_COUNTRY_CODE } from "@/components/common/CountryCodeSelect";

const DEFAULT_HIGHLIGHTS = [
  "24.99-Acre Master Planned Community",
  "1.05 Lakh Sq. Ft. Dual Clubhouse Amenities",
  "Detailed Unit Configurations & RERA Layouts",
  "Premium Architectural & Technical Specifications",
  "IGBC Gold Rated Green Building Features",
];

// localStorage namespaced per project so unlocking Akrida's brochure
// doesn't auto-unlock every other project's PDF.
const STORAGE_PREFIX = "mh:brochure-unlocked:";

/** Trigger an actual download of the given URL in a way that respects
 *  CORS and same-origin. For external URLs we open in a new tab so the
 *  browser handles the file headers. */
function triggerBrochureDownload(href) {
  if (!href || href === "#") return;
  if (typeof document === "undefined") return;
  const a = document.createElement("a");
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.download = "";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function ProjectBrochure({
  sidebarLabel = "Your Journey Starts Here",
  heading = "The Akrida Handbook",
  highlights = DEFAULT_HIGHLIGHTS,
  imageSrc = "/assets/myhome/projects/brochure-clubhouse.jpg",
  imageAlt = "My Home Akrida clubhouse",
  brochureHref = "/images/pdf-sample_0.pdf",
  buttonLabel = "Download Brochure",
  projectName = "Project Brochure",
}) {
  const rootRef = useRef(null);
  const sidebarRef = useRef(null);
  const headingRef = useRef(null);
  const listRef = useRef(null);
  const buttonRef = useRef(null);
  const imageRef = useRef(null);

  const storageKey = `${STORAGE_PREFIX}${projectName}`;
  const [unlocked, setUnlocked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  // Read unlocked flag from localStorage on the client (SSR-safe).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(storageKey) === "1") setUnlocked(true);
  }, [storageKey]);

  const handleDownloadClick = (e) => {
    e.preventDefault();
    // Brochure file missing in CMS → don't open the modal; just show a no-op
    // (the button is also disabled visually below).
    if (!brochureHref || brochureHref === "/images/pdf-sample_0.pdf") return;
    if (unlocked) {
      triggerBrochureDownload(brochureHref);
    } else {
      setModalOpen(true);
    }
  };

  const onUnlockSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError(null);
    const payload = {
      name: data.name,
      email: data.email,
      phone: `${data.countryCode || DEFAULT_COUNTRY_CODE} ${data.phone}`.trim(),
      project: projectName,
      message: "Requested project brochure download",
      formSource: "Project Brochure Download",
    };
    try {
      const [crmRes, leadOk] = await Promise.all([
        fetch("/api/pushToCRM", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            project_name: payload.project,
            message: payload.message,
            FormSource: payload.formSource,
          }),
        }),
        submitLead(payload),
      ]);
      if (crmRes.ok || leadOk) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(storageKey, "1");
        }
        setUnlocked(true);
        setModalOpen(false);
        reset();
        // Kick off the download in the next tick so the modal close
        // animation isn't blocked by the file open dialog.
        setTimeout(() => triggerBrochureDownload(brochureHref), 50);
      } else {
        setSubmitError("Couldn't save your details. Please try again.");
      }
    } catch (err) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useGSAP(
    () => {
      registerGsap();

      const trigger = {
        trigger: rootRef.current,
        start: "top 75%",
        toggleActions: "play none none none",
      };

      const headingWords = splitToWords(headingRef.current);
      gsap.from(headingWords, {
        yPercent: 110,
        duration: 1,
        stagger: 0.05,
        ease: "expo.out",
        scrollTrigger: trigger,
      });

      gsap.from(sidebarRef.current, {
        autoAlpha: 0,
        y: 24,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: trigger,
      });

      gsap.from(imageRef.current, {
        autoAlpha: 0,
        x: -40,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: trigger,
      });

      gsap.from(listRef.current?.children || [], {
        autoAlpha: 0,
        y: 20,
        duration: 0.7,
        stagger: 0.08,
        ease: "expo.out",
        delay: 0.3,
        scrollTrigger: trigger,
      });

      gsap.from(buttonRef.current, {
        autoAlpha: 0,
        y: 20,
        duration: 0.8,
        ease: "expo.out",
        delay: 0.7,
        scrollTrigger: trigger,
      });
    },
    { scope: rootRef }
  );

  const noFile = !brochureHref || brochureHref === "/images/pdf-sample_0.pdf";

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-[#2a2828] pt-[20px] pb-[60px] lg:pt-[4.167vw] lg:pb-[3.125vw] overflow-hidden"
      data-section="project-brochure"
    >
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="flex lg:absolute left-[12px] top-[30px] lg:left-[4.167vw] lg:top-[4.688vw] flex-col items-center gap-[8px] md:gap-[12px] lg:gap-[1.094vw] w-auto lg:w-[2.813vw] z-[5] max-lg:static max-lg:!w-full max-lg:flex-row max-lg:!justify-center max-lg:items-center max-lg:!gap-[8px] max-lg:mt-[15px] max-lg:mb-[18px]"
        aria-hidden="true"
      >
        <span className="block w-px h-[28px] md:h-[36px] lg:h-[3.125vw] bg-white/70 max-lg:!w-[28px] max-lg:!h-px" />
        <span
          className="font-montserrat font-medium capitalize whitespace-nowrap text-white text-[12px] md:text-[14px] lg:text-[1.25vw] max-lg:[writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] lg:rotate-180"
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {sidebarLabel}
        </span>
      </div>

      <div className="px-5 md:px-12 lg:pl-[9.375vw] lg:pr-[9.531vw]">
        <div className="grid grid-cols-1 lg:grid-cols-[32.5vw_1fr] gap-[36px] lg:gap-[5.573vw] items-center">
          {/* Image */}
          <div
            ref={imageRef}
            className="relative w-full aspect-[624/599] lg:h-[31.198vw] lg:w-[32.5vw] rounded-[12px] overflow-hidden bg-black/40"
          >
            {imageSrc && (
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                unoptimized
                sizes="(min-width:1024px) 33vw, 100vw"
                className="object-cover object-center select-none"
              />
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col items-start gap-[24px] lg:gap-[2.135vw] max-w-full lg:max-w-[43.021vw]">
            <SectionHeading
              ref={headingRef}
              className="capitalize text-white leading-[1.08] tracking-[0.022em]
                         text-[34px] xs:text-[38px] sm:text-[48px] md:text-[64px] lg:text-[5vw]"
            >
              {heading}
            </SectionHeading>

            {highlights.length > 0 && (
            <ul
              ref={listRef}
              className="flex flex-col text-white list-disc pl-[24px] lg:pl-[1.953vw]"
            >
              {highlights.map((h) => (
                <li
                  key={h}
                  className="text-[15px] leading-[28px]
                             sm:text-[17px] sm:leading-[34px]
                             lg:text-[1.302vw] lg:leading-[2.604vw]"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 400,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {h}
                </li>
              ))}
            </ul>
            )}

            <button
              ref={buttonRef}
              type="button"
              onClick={handleDownloadClick}
              disabled={noFile}
              aria-label={
                noFile
                  ? "Brochure coming soon"
                  : unlocked
                  ? buttonLabel
                  : `${buttonLabel} — fill form to download`
              }
              className="inline-flex items-center justify-between gap-[16px]
                         border border-white text-white capitalize
                         h-[48px] sm:h-[54px] lg:h-[3.021vw]
                         w-[260px] sm:w-[290px] lg:w-[15.833vw]
                         px-[20px] lg:px-[1.354vw]
                         text-[14px] sm:text-[16px] lg:text-[0.938vw]
                         transition-colors duration-300
                         hover:bg-white hover:text-[#2a2828]
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-white"
              style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}
            >
              <span>{noFile ? "Brochure Coming Soon" : buttonLabel}</span>
              <Download className="w-[18px] h-[18px] lg:w-[1.094vw] lg:h-[1.094vw]" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div className="mt-[36px] lg:mt-[3.385vw] h-px w-full bg-white/15" aria-hidden="true" />
      </div>

      {/* ===== Brochure unlock modal ===== */}
      <Dialog
        open={modalOpen}
        onClose={() => (submitting ? null : setModalOpen(false))}
        className="fixed inset-0 z-[100]"
      >
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            className="relative w-full max-w-[460px] lg:max-w-[28vw]
                       bg-white rounded-[10px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]
                       px-[24px] py-[28px] sm:px-[32px] sm:py-[36px] lg:px-[2.083vw] lg:py-[2.604vw]"
          >
            <button
              type="button"
              onClick={() => (submitting ? null : setModalOpen(false))}
              aria-label="Close"
              className="absolute right-[12px] top-[12px] lg:right-[0.781vw] lg:top-[0.781vw]
                         inline-flex items-center justify-center rounded-full
                         w-[34px] h-[34px] lg:w-[2.083vw] lg:h-[2.083vw]
                         text-[#333] hover:text-[#ef493d] transition-colors"
            >
              <X className="w-[18px] h-[18px] lg:w-[1.146vw] lg:h-[1.146vw]" strokeWidth={1.8} />
            </button>

            <Dialog.Title
              className="text-[#333] leading-[1.2] capitalize
                         text-[22px] sm:text-[26px] lg:text-[1.667vw]"
              style={{
                fontFamily:
                  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                fontWeight: 400,
              }}
            >
              Download {projectName} Brochure
            </Dialog.Title>
            <p
              className="font-montserrat text-[#6d6d6d] mt-[8px] lg:mt-[0.521vw]
                         text-[13px] sm:text-[14px] lg:text-[0.833vw]
                         leading-[20px] sm:leading-[22px] lg:leading-[1.302vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Share your details and we&apos;ll send the brochure your way right now.
            </p>

            <form
              onSubmit={handleSubmit(onUnlockSubmit)}
              className="mt-[20px] lg:mt-[1.302vw] flex flex-col gap-[16px] lg:gap-[1.042vw]"
              noValidate
            >
              <div>
                <input
                  type="text"
                  placeholder="Full Name*"
                  aria-invalid={!!errors.name || undefined}
                  className={`w-full bg-transparent outline-none border-b
                              text-[#333] placeholder:text-[#999]
                              text-[14px] sm:text-[16px] lg:text-[0.938vw]
                              py-[8px] lg:py-[0.417vw]
                              ${errors.name ? "border-[#ef493d]" : "border-[#33333322]"}`}
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                  {...register("name", {
                    required: "Please enter your name",
                    minLength: { value: 2, message: "Too short" },
                  })}
                />
                {errors.name && (
                  <p className="text-[#ef493d] text-[12px] mt-[4px]">{errors.name.message}</p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email Address*"
                  aria-invalid={!!errors.email || undefined}
                  className={`w-full bg-transparent outline-none border-b
                              text-[#333] placeholder:text-[#999]
                              text-[14px] sm:text-[16px] lg:text-[0.938vw]
                              py-[8px] lg:py-[0.417vw]
                              ${errors.email ? "border-[#ef493d]" : "border-[#33333322]"}`}
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                  {...register("email", {
                    required: "Please enter your email",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-[#ef493d] text-[12px] mt-[4px]">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div
                  className={`flex items-center gap-[8px] lg:gap-[0.417vw] w-full border-b
                              ${errors.phone ? "border-[#ef493d]" : "border-[#33333322]"}`}
                >
                  <CountryCodeSelect
                    {...register("countryCode")}
                    className="text-[#333] text-[14px] sm:text-[16px] lg:text-[0.938vw] py-[8px] lg:py-[0.417vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number*"
                    aria-invalid={!!errors.phone || undefined}
                    className="flex-1 min-w-0 bg-transparent outline-none border-none
                               text-[#333] placeholder:text-[#999]
                               text-[14px] sm:text-[16px] lg:text-[0.938vw]
                               py-[8px] lg:py-[0.417vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                    {...register("phone", {
                      required: "Please enter your phone",
                      pattern: {
                        value: /^[0-9+\-\s()]{7,15}$/,
                        message: "Enter a valid phone",
                      },
                    })}
                  />
                </div>
                {errors.phone && (
                  <p className="text-[#ef493d] text-[12px] mt-[4px]">{errors.phone.message}</p>
                )}
              </div>

              {submitError && (
                <p className="text-[#ef493d] text-[13px]" role="alert">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group relative inline-flex items-center justify-center gap-[10px] lg:gap-[0.521vw]
                           whitespace-nowrap overflow-hidden mt-[6px] lg:mt-[0.521vw]
                           h-[46px] sm:h-[50px] lg:h-[2.917vw]
                           px-[24px] lg:px-[1.563vw]
                           bg-[#ef493d] text-white border border-[#ef493d]
                           transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                           hover:bg-transparent hover:text-[#ef493d]
                           disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span
                  className="font-montserrat font-medium capitalize
                             text-[14px] sm:text-[15px] lg:text-[0.938vw] tracking-[0.02em]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {submitting ? "Sending…" : "Download Now"}
                </span>
                <Download
                  className="w-[16px] h-[16px] lg:w-[0.938vw] lg:h-[0.938vw]"
                  strokeWidth={1.8}
                />
              </button>

              <p
                className="font-montserrat text-[#999] text-center
                           text-[11px] sm:text-[12px] lg:text-[0.677vw]
                           leading-[1.5] mt-[2px] lg:mt-[0.156vw]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Submitting saves your details with our team and starts the brochure download.
              </p>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </section>
  );
}
