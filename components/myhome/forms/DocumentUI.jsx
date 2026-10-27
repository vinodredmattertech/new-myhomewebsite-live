import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { HEADING_FONT_FAMILY } from "@/components/common/SectionHeading";

/**
 * The letterhead look shared by the standalone form pages (DynamicForm and the
 * Channel Partner AgreementForm): a framed paper sheet with a red top edge and
 * a watermark, serif headings with gold ornament, soft field boxes and option
 * tiles, and a charcoal submit bar. Forms own their fields and validation;
 * these pieces only draw them.
 */

const MONTSERRAT = "Montserrat, sans-serif";
const SERIF = { fontFamily: HEADING_FONT_FAMILY, fontWeight: 300 };

/** Brand gold, for ornament. */
export const GOLD = "#c39a3e";

export const inputCls = `flex-1 min-w-0 w-full bg-transparent outline-none border-none
                  text-[#1f1d1b] placeholder:text-[#a59d92] text-[14.5px] leading-[22px] py-[12px]`;
export const textCls = "text-[14px] sm:text-[14.5px] leading-[24px]";
export const errorCls = "text-[#d93d31] text-[12px] tracking-[0.01em]";
export const labelCls = "text-[#3d3935] font-medium text-[13px] leading-[19px] tracking-[0.01em]";

/** A question, with the required mark set in brand red. */
export function Label({ text, as: Tag = "span" }) {
  const required = text.endsWith("*");
  return (
    <Tag className={labelCls}>
      {required ? text.slice(0, -1) : text}
      {required && <span className="ml-[2px] text-[#ef493d]">*</span>}
    </Tag>
  );
}

/** Gold rule with a centred diamond: the letterhead's divider. */
export function Ornament({ className = "" }) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center gap-[12px] ${className}`}>
      <span className="h-px w-[56px] sm:w-[88px] bg-gradient-to-r from-transparent to-[#c39a3e]" />
      <span className="w-[6px] h-[6px] rotate-45 border border-[#c39a3e]" />
      <span className="h-px w-[56px] sm:w-[88px] bg-gradient-to-l from-transparent to-[#c39a3e]" />
    </div>
  );
}

/**
 * One field: the question, a soft paper-toned box holding the control(s), the
 * error. The box is translucent so the sheet's watermark reads through it.
 * `error` is a react-hook-form field error.
 */
export function FieldRow({ as: Tag = "label", label, error, dashed = false, className = "", children }) {
  const state = error
    ? "border-[#e0897f] bg-[#fdf6f5]/80"
    : `${dashed ? "border-[#d6cdbf]" : "border-[#e2dcd2]"} bg-[#fcfbf8]/70 hover:border-[#cbc1b2]
       focus-within:border-[#3d3935] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(195,154,62,0.12)]`;
  return (
    <Tag className={`flex flex-col w-full gap-[8px] ${className}`}>
      {label && <Label text={label} />}
      <div
        className={`flex items-center w-full gap-[10px] px-[14px] rounded-[3px] border ${dashed ? "border-dashed" : ""}
                    transition-[border-color,background-color,box-shadow] duration-200 ${state}`}
      >
        {children}
      </div>
      {error?.message && <span className={errorCls}>{error.message}</span>}
    </Tag>
  );
}

/**
 * A radio/checkbox option. As a `tile` (option grids) the whole option is a
 * bordered card that takes the brand red when chosen; plain otherwise
 * (consents). The control itself is drawn by `.mh-check` in globals.css.
 */
export const Choice = React.forwardRef(function Choice({ type = "checkbox", label, disabled, tile = false, ...inputProps }, ref) {
  const tileCls = tile
    ? `h-full rounded-[3px] border border-[#e6e0d6] bg-white/70 px-[14px] py-[11px]
       hover:border-[#cbc1b2] has-[:checked]:border-[#ef493d] has-[:checked]:bg-[#fef7f6] has-[:checked]:text-[#1f1d1b]
       transition-colors duration-200`
    : "";
  return (
    <label
      className={`flex items-start gap-[12px] text-[#3d3935] ${textCls} ${tileCls} ${
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <input ref={ref} type={type} disabled={disabled} className="mh-check" {...inputProps} />
      <span>{label}</span>
    </label>
  );
});

/** Serif section heading between a red diamond and a hairline. */
export function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-[16px]">
      <span aria-hidden="true" className="w-[5px] h-[5px] rotate-45 bg-[#ef493d] shrink-0" />
      <h2 className="shrink-0 max-w-[85%] text-[#1f1d1b] text-[21px] sm:text-[24px] leading-[1.2]" style={SERIF}>
        {children}
      </h2>
      <span aria-hidden="true" className="h-px flex-1 bg-[#e6e0d6]" />
    </div>
  );
}

/** A titled block of the form. */
export function FormSection({ title, className = "", children }) {
  return (
    <div role="group" aria-label={title} className={`flex flex-col gap-[24px] ${className}`}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  );
}

/** "Fields marked * are required" beside the charcoal submit button. */
export function SubmitBar({ submitting, label = "Submit", error }) {
  return (
    <div className="flex flex-col gap-[14px]">
      {error && (
        <p role="alert" className="text-[#d93d31] text-[13px]">
          {error}
        </p>
      )}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-[18px] border-t border-[#e6e0d6] pt-[28px]">
        <p className="text-[12.5px] text-[#8a837b]">
          Fields marked <span className="text-[#ef493d]">*</span> are required.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex items-center justify-center gap-[12px] h-[54px] px-[40px] rounded-[2px]
                     bg-[#1f1d1b] text-white uppercase font-semibold tracking-[0.18em] text-[12px]
                     hover:bg-[#ef493d] transition-colors duration-300
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting…" : label}
          <ArrowRight className="w-[16px] h-[16px] transition-transform duration-300 group-hover:translate-x-[3px]" strokeWidth={1.6} />
        </button>
      </div>
    </div>
  );
}

/** Shown in place of the form once it is submitted — the visitor stays on the page. */
export function SuccessMessage({ title, text }) {
  return (
    <div role="status" className="relative mt-[48px] mx-auto max-w-[560px] flex flex-col items-center text-center gap-[14px]">
      <CheckCircle2 className="w-[44px] h-[44px]" strokeWidth={1.2} style={{ color: GOLD }} />
      <p className="text-[#1f1d1b] text-[26px] sm:text-[30px] leading-[1.15]" style={SERIF}>
        {title}
      </p>
      {text && <p className={`text-[#6b645b] ${textCls}`}>{text}</p>}
    </div>
  );
}

/**
 * The page and its sheet: white paper with a brand-red top edge, a hairline
 * inner frame like a certificate's, and the logo watermarked at its centre;
 * the eyebrow, serif title and intro on top, the closing ornament below.
 * `children` is the form (or the success message).
 */
export const DocumentSheet = React.forwardRef(function DocumentSheet({ eyebrow, heading, intro = [], id, children, after }, ref) {
  return (
    <section
      ref={ref}
      id={id}
      className="relative w-full bg-[#efedea] scroll-mt-[80px] px-4 py-[32px] md:py-[64px]"
      style={{ fontFamily: MONTSERRAT }}
    >
      <div
        className="relative mx-auto w-full max-w-[1000px] bg-white border-t-[3px] border-t-[#ef493d]
                   bg-[url('/assets/myhome/logo-watermark.svg')] bg-no-repeat bg-center bg-[length:min(60%,480px)_auto] bg-fixed
                   shadow-[0_1px_2px_rgba(31,29,27,0.05),0_30px_70px_-30px_rgba(31,29,27,0.28)]
                   px-[20px] py-[40px] sm:px-[40px] md:px-[72px] md:py-[64px]"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-[8px] md:inset-[12px] border border-[#efe9df]" />

        <header className="relative text-center">
          {eyebrow && (
            <p className="text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-[0.32em] text-[#c39a3e]">{eyebrow}</p>
          )}
          <h1 className="mt-[14px] text-[#1f1d1b] leading-[1.08] tracking-[0.01em] text-[36px] sm:text-[44px] md:text-[54px]" style={SERIF}>
            {heading}
          </h1>
          <Ornament className="mt-[20px]" />
          {intro.map((t) => (
            <p key={t} className={`mt-[18px] mx-auto max-w-[620px] text-[#6b645b] ${textCls}`}>
              {t}
            </p>
          ))}
        </header>

        {children}

        <footer className="relative mt-[56px] flex flex-col items-center gap-[12px]">
          <Ornament />
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#a59d92]">My Home Group</p>
        </footer>
      </div>
      {after}
    </section>
  );
});

/** Form element with the sheet's section rhythm. */
export function DocumentForm({ children, ...props }) {
  return (
    <form noValidate className="relative mt-[48px] md:mt-[56px] flex flex-col gap-[48px] md:gap-[56px]" {...props}>
      {children}
    </form>
  );
}
