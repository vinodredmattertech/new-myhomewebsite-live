import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Dialog } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { Phone, X } from "lucide-react";
import { submitLead } from "@/lib/strapi";

const MESSAGE_ICON = "/assets/myhome/tabler_message-filled.png";

/**
 * Floating "Call Now" + "Request Site Visit" actions for project detail pages.
 *
 * Desktop (lg+): pinned to the right edge, vertically centred. Each button
 * shows only its icon by default and expands smoothly on hover to reveal the
 * label. Mobile: a sticky two-button bar fixed to the bottom of the viewport.
 *
 * "Call Now" dials the configured number; "Request Site Visit" opens a lead
 * form modal that posts to the CRM (same flow as the other project forms).
 */
export default function ProjectFloatingActions({
  phone = "+917996006262",
  projectName = "Project",
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const telHref = `tel:${(phone || "").replace(/\s+/g, "")}`;

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError(null);
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      project: projectName,
      message: [
        "Requested a site visit",
        data.preferredDate && `Preferred date: ${data.preferredDate}`,
        data.message,
      ]
        .filter(Boolean)
        .join("\n\n"),
      formSource: "Request Site Visit",
    };
    try {
      const [crmRes] = await Promise.all([
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
      if (crmRes.ok) {
        reset();
        setModalOpen(false);
        router.push("/thank-you");
      } else {
        setSubmitError("Couldn't submit your request. Please try again.");
      }
    } catch (err) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ===== Desktop: right-edge expanding pills ===== */}
      <div className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-[70] flex-col items-end gap-[0.833vw]">
        <a
          href={telHref}
          aria-label="Call Now"
          className="group flex items-center overflow-hidden rounded-l-full
                     bg-[#fff] hover:bg-[#fff] text-[#d83a2f] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]
                     h-[3.333vw] pl-[1.042vw] pr-[1.042vw]
                     transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <Phone className="w-[1.25vw] h-[1.25vw] shrink-0" strokeWidth={1.8} />
          <span
            className="max-w-0 group-hover:max-w-[10vw] group-hover:ml-[0.625vw]
                       overflow-hidden whitespace-nowrap
                       font-montserrat font-medium capitalize text-[0.938vw]
                       transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Call Now
          </span>
        </a>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="Request Site Visit"
          className="group flex items-center overflow-hidden rounded-l-full
                     bg-[#ef493d] hover:bg-[#d83a2f] text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]
                     h-[3.333vw] pl-[1.042vw] pr-[1.042vw]
                     transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <Image
            src={MESSAGE_ICON}
            alt=""
            width={26}
            height={26}
            unoptimized
            className="w-[1.25vw] h-[1.25vw] shrink-0 object-contain select-none [filter:brightness(0)_invert(1)]"
          />
          <span
            className="max-w-0 group-hover:max-w-[12vw] group-hover:ml-[0.625vw]
                       overflow-hidden whitespace-nowrap
                       font-montserrat font-medium capitalize text-[0.938vw]
                       transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Request Site Visit
          </span>
        </button>
      </div>

      {/* ===== Mobile: sticky bottom bar ===== */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-[70] flex shadow-[0_-6px_20px_-8px_rgba(0,0,0,0.35)]">
        <a
          href={telHref}
          className="flex-1 flex items-center justify-center gap-[8px]
                     bg-[#fff] text-[#ef493d] h-[56px]
                     font-montserrat font-medium capitalize text-[15px]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <Phone className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
          Call Now
        </a>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex-1 flex items-center justify-center gap-[8px]
                     bg-[#d83a2f] text-white h-[56px]
                     font-montserrat font-medium capitalize text-[15px]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <Image
            src={MESSAGE_ICON}
            alt=""
            width={20}
            height={20}
            unoptimized
            className="w-[18px] h-[18px] shrink-0 object-contain select-none [filter:brightness(0)_invert(1)]"
          />
          Request Site Visit
        </button>
      </div>

      {/* ===== Request Site Visit modal ===== */}
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
              Request A Site Visit
            </Dialog.Title>
            <p
              className="font-montserrat text-[#6d6d6d] mt-[8px] lg:mt-[0.521vw]
                         text-[13px] sm:text-[14px] lg:text-[0.833vw]
                         leading-[20px] sm:leading-[22px] lg:leading-[1.302vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Share your details for {projectName} and our team will arrange a
              visit at your convenience.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
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
                  type="tel"
                  placeholder="Phone Number*"
                  aria-invalid={!!errors.phone || undefined}
                  className={`w-full bg-transparent outline-none border-b
                              text-[#333] placeholder:text-[#999]
                              text-[14px] sm:text-[16px] lg:text-[0.938vw]
                              py-[8px] lg:py-[0.417vw]
                              ${errors.phone ? "border-[#ef493d]" : "border-[#33333322]"}`}
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                  {...register("phone", {
                    required: "Please enter your phone",
                    pattern: {
                      value: /^[0-9+\-\s()]{7,15}$/,
                      message: "Enter a valid phone",
                    },
                  })}
                />
                {errors.phone && (
                  <p className="text-[#ef493d] text-[12px] mt-[4px]">{errors.phone.message}</p>
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
                <input
                  type="date"
                  aria-label="Preferred visit date"
                  className="w-full bg-transparent outline-none border-b border-[#33333322]
                             text-[#333] placeholder:text-[#999]
                             text-[14px] sm:text-[16px] lg:text-[0.938vw]
                             py-[8px] lg:py-[0.417vw]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                  {...register("preferredDate")}
                />
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
                  {submitting ? "Submitting…" : "Request Site Visit"}
                </span>
              </button>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
