import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Paperclip, X } from "lucide-react";
import CountryCodeSelect, {
  DEFAULT_COUNTRY_CODE,
} from "@/components/common/CountryCodeSelect";
import { dialCodeFor, registerPhone } from "@/lib/phone";
import { submitJobApplication } from "@/lib/strapi";

const RED = "#ef493d";
const MONTSERRAT = "Montserrat, sans-serif";

/* Resume constraints — mirrored in the validation messages below. */
const MAX_RESUME_MB = 5;
const ACCEPTED_EXT = [".pdf", ".doc", ".docx", ".rtf"];
const ACCEPT_ATTR = ACCEPTED_EXT.join(",");

/**
 * One underline field row: the control(s), the rule beneath it (red when the
 * field is in error) and the error message. Matches the Contact page form so
 * every enquiry form on the site reads the same.
 */
function FieldRow({ as: Tag = "label", hasError, errorMessage, compact, children }) {
  return (
    <Tag className="flex flex-col w-full gap-[10px] lg:gap-[0.833vw]">
      <div className="flex items-center justify-between w-full gap-[10px] lg:gap-[0.521vw]">
        {children}
      </div>
      <div
        className={`h-px w-full ${
          hasError ? "bg-[#ef493d]" : "bg-[#33333322]"
        } transition-colors duration-300`}
      />
      {hasError && errorMessage && (
        <span
          className={`text-[#ef493d] -mt-[4px] ${
            compact ? "text-[12px] lg:text-[0.677vw]" : "text-[12px] lg:text-[0.729vw]"
          }`}
          style={{ fontFamily: MONTSERRAT }}
        >
          {errorMessage}
        </span>
      )}
    </Tag>
  );
}

/**
 * JobApplicationForm — the shared Career application form.
 *
 * Renders the same five fields (full name, phone, email, resume, message) for
 * both entry points on the Career page: the open form above the footer and the
 * "Apply Now" modal on a vacant position. The position the candidate is
 * applying for is passed in as `designation` and saved with the submission, so
 * HR can see which role each resume belongs to.
 *
 * Submissions go straight to Strapi's Job Application collection, resume
 * included, via `submitJobApplication`.
 */
export default function JobApplicationForm({
  designation = "General Application",
  formSource = "Career Page",
  submitText = "Submit Application",
  successMessage = "Thank you — your application has been received.",
  /* Tighter spacing/type for the modal. */
  compact = false,
  /* Solid red CTA in the modal, outlined on the page section. */
  variant = "outline",
  onSuccess,
  className = "",
}) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  // Bumped to remount the file input so clearing/resetting also clears the
  // filename the browser holds on the DOM node.
  const [fileKey, setFileKey] = useState(0);

  const {
    register,
    getValues,
    trigger,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      countryCode: DEFAULT_COUNTRY_CODE,
      phone: "",
      email: "",
      resume: null,
      message: "",
    },
    mode: "onBlur",
  });

  const resumeFile = watch("resume")?.[0] || null;

  const clearResume = () => {
    setValue("resume", null, { shouldValidate: false });
    setFileKey((k) => k + 1);
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    setSubmitError(null);
    setSuccess(false);

    const file = values.resume?.[0] || null;
    const ok = await submitJobApplication(
      {
        name: values.name,
        email: values.email,
        phone: `${dialCodeFor(values.countryCode)} ${values.phone}`.trim(),
        countryCode: dialCodeFor(values.countryCode),
        designation,
        message: values.message || "",
        formSource,
      },
      file
    );

    if (ok) {
      setSuccess(true);
      reset();
      setFileKey((k) => k + 1);
      onSuccess?.();
    } else {
      setSubmitError("Couldn't submit your application. Please try again.");
    }
    setSubmitting(false);
  };

  const inputCls = `flex-1 min-w-0 bg-transparent outline-none border-none
                    text-[#333] placeholder:text-[#8a8a8a]
                    ${
                      compact
                        ? "text-[14px] sm:text-[15px] lg:text-[0.938vw] leading-[24px] lg:leading-[1.5vw]"
                        : "text-[14px] sm:text-[16px] md:text-[18px] lg:text-[1.094vw] leading-[26px] sm:leading-[28px] md:leading-[30px] lg:leading-[1.614vw]"
                    }
                    pb-[8px] lg:pb-[0.417vw]`;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={`flex flex-col w-full ${
        compact
          ? "gap-[18px] lg:gap-[1.146vw]"
          : "gap-[26px] md:gap-[32px] lg:gap-[2.083vw]"
      } ${className}`}
    >
      {/* Full name */}
      <FieldRow
        hasError={!!errors.name}
        errorMessage={errors.name?.message}
        compact={compact}
      >
        <input
          type="text"
          placeholder="Full Name*"
          aria-invalid={!!errors.name || undefined}
          className={inputCls}
          style={{ fontFamily: MONTSERRAT }}
          {...register("name", {
            required: "Please enter your full name",
            minLength: { value: 2, message: "Too short" },
          })}
        />
      </FieldRow>

      {/* Phone */}
      <FieldRow
        hasError={!!errors.phone}
        errorMessage={errors.phone?.message}
        compact={compact}
      >
        <CountryCodeSelect
          {...register("countryCode", {
            onChange: () => getValues("phone") && trigger("phone"),
          })}
          className={`text-[#333] pb-[8px] lg:pb-[0.417vw] ${
            compact
              ? "text-[14px] sm:text-[15px] lg:text-[0.938vw]"
              : "text-[14px] sm:text-[16px] md:text-[18px] lg:text-[1.094vw]"
          }`}
          style={{ fontFamily: MONTSERRAT }}
        />
        <input
          type="tel"
          placeholder="Phone Number*"
          aria-invalid={!!errors.phone || undefined}
          className={inputCls}
          style={{ fontFamily: MONTSERRAT }}
          {...registerPhone(register, "phone", () => getValues("countryCode"), {
            required: "Please enter your phone number",
          })}
        />
      </FieldRow>

      {/* Email */}
      <FieldRow
        hasError={!!errors.email}
        errorMessage={errors.email?.message}
        compact={compact}
      >
        <input
          type="email"
          placeholder="Email Address*"
          aria-invalid={!!errors.email || undefined}
          className={inputCls}
          style={{ fontFamily: MONTSERRAT }}
          {...register("email", {
            required: "Please enter your email",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email",
            },
          })}
        />
      </FieldRow>

      {/* Resume — a hidden file input behind a styled row, so the control
          matches the underline fields around it. */}
      <FieldRow
        as="div"
        hasError={!!errors.resume}
        errorMessage={errors.resume?.message}
        compact={compact}
      >
        <label
          className={`flex flex-1 min-w-0 items-center gap-[10px] lg:gap-[0.521vw]
                      cursor-pointer pb-[8px] lg:pb-[0.417vw]
                      ${
                        compact
                          ? "text-[14px] sm:text-[15px] lg:text-[0.938vw]"
                          : "text-[14px] sm:text-[16px] md:text-[18px] lg:text-[1.094vw]"
                      }`}
          style={{ fontFamily: MONTSERRAT }}
        >
          <Paperclip
            className="shrink-0 w-[16px] h-[16px] lg:w-[1.042vw] lg:h-[1.042vw]"
            strokeWidth={1.6}
            style={{ color: RED }}
          />
          <span
            className={`truncate ${resumeFile ? "text-[#333]" : "text-[#8a8a8a]"}`}
          >
            {resumeFile ? resumeFile.name : "Attach Resume* (PDF or DOC)"}
          </span>
          <input
            key={fileKey}
            type="file"
            accept={ACCEPT_ATTR}
            className="sr-only"
            aria-invalid={!!errors.resume || undefined}
            {...register("resume", {
              required: "Please attach your resume",
              validate: {
                size: (list) =>
                  !list?.[0] ||
                  list[0].size <= MAX_RESUME_MB * 1024 * 1024 ||
                  `Resume must be under ${MAX_RESUME_MB}MB`,
                type: (list) =>
                  !list?.[0] ||
                  ACCEPTED_EXT.some((ext) =>
                    list[0].name.toLowerCase().endsWith(ext)
                  ) ||
                  "Upload a PDF, DOC, DOCX or RTF file",
              },
            })}
          />
        </label>

        {resumeFile ? (
          <button
            type="button"
            onClick={clearResume}
            aria-label="Remove attached resume"
            className="shrink-0 text-[#8a8a8a] hover:text-[#ef493d] transition-colors pb-[8px] lg:pb-[0.417vw]"
          >
            <X className="w-[16px] h-[16px] lg:w-[0.938vw] lg:h-[0.938vw]" strokeWidth={1.8} />
          </button>
        ) : (
          <span
            className={`shrink-0 capitalize pb-[8px] lg:pb-[0.417vw] ${
              compact ? "text-[12px] lg:text-[0.729vw]" : "text-[13px] lg:text-[0.833vw]"
            }`}
            style={{ fontFamily: MONTSERRAT, color: RED }}
          >
            Browse
          </span>
        )}
      </FieldRow>

      {/* Message */}
      <FieldRow
        hasError={!!errors.message}
        errorMessage={errors.message?.message}
        compact={compact}
      >
        <input
          type="text"
          placeholder="Message"
          className={inputCls}
          style={{ fontFamily: MONTSERRAT }}
          {...register("message", {
            maxLength: { value: 1000, message: "Message is too long" },
          })}
        />
      </FieldRow>

      {submitError && (
        <p
          role="alert"
          className="text-[#ef493d] text-[13px] lg:text-[0.833vw] -mt-[6px]"
          style={{ fontFamily: MONTSERRAT }}
        >
          {submitError}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="text-[#1f7a4d] text-[13px] sm:text-[14px] lg:text-[0.833vw] -mt-[6px]"
          style={{ fontFamily: MONTSERRAT }}
        >
          {successMessage}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className={`group relative inline-flex items-center justify-center self-start
                    whitespace-nowrap overflow-hidden border border-[#ef493d]
                    transition-[border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                    disabled:opacity-60 disabled:cursor-not-allowed
                    ${variant === "solid" ? "bg-[#ef493d]" : "bg-transparent"}
                    ${
                      compact
                        ? "w-full sm:w-[220px] lg:w-[13vw] h-[46px] sm:h-[50px] lg:h-[2.813vw] px-[18px] lg:px-[1.25vw]"
                        : "mt-[8px] lg:mt-[0.521vw] w-[200px] sm:w-[220px] lg:w-[12.5vw] h-[48px] sm:h-[54px] lg:h-[3.02vw] px-[18px] lg:px-[1.5vw]"
                    }`}
      >
        <span
          aria-hidden="true"
          className={`absolute inset-0 origin-bottom translate-y-full
                      group-hover:translate-y-0 transition-transform duration-500
                      ease-[cubic-bezier(0.22,1,0.36,1)]
                      ${variant === "solid" ? "bg-white" : "bg-[#ef493d]"}`}
        />
        <span
          className={`relative z-[1] font-medium capitalize tracking-[0.02em]
                      transition-colors duration-500
                      text-[14px] sm:text-[15px] lg:text-[0.938vw]
                      ${
                        variant === "solid"
                          ? "text-white group-hover:text-[#ef493d]"
                          : "text-[#ef493d] group-hover:text-white"
                      }`}
          style={{ fontFamily: "Outfit, Montserrat, sans-serif" }}
        >
          {submitting ? "Sending…" : success ? "Sent ✓" : submitText}
        </span>
      </button>
    </form>
  );
}
