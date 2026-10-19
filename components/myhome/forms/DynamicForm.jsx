import React, { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CheckCircle2, Paperclip, X } from "lucide-react";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import SectionLabel from "@/components/myhome/SectionLabel";
import SectionHeading from "@/components/common/SectionHeading";
import CountryCodeSelect, { DEFAULT_COUNTRY_CODE } from "@/components/common/CountryCodeSelect";
import DocumentModal from "@/components/myhome/forms/DocumentModal";
import LegalDocument from "@/components/myhome/forms/LegalDocument";
import { dialCodeFor, validatePhone } from "@/lib/phone";
import { submitPublicForm } from "@/lib/strapi";

/**
 * DynamicForm — renders one of the printed My Home forms from a config in
 * lib/forms/ (sections → fields), validates it, and submits it to Strapi with
 * any uploaded documents. Field names in the config are the Strapi attribute
 * names, so what is submitted is the record as-is.
 *
 * Field types: text (default) · email · number · date · textarea · select ·
 * phone · radio · checkboxes · checkbox · file · group (a nested row, e.g.
 * title + first/middle/last name) · note (static text).
 *
 * A field or section with `showIf(values)` is only rendered while it returns
 * true; the form runs with `shouldUnregister`, so a hidden field is neither
 * validated nor submitted. Radio/checkbox fields can carry an `other` text box
 * shown when the "Others" option is picked.
 *
 * Visual language matches the Channel Partner Agreement form: underline
 * fields, red uppercase block titles, outlined red submit.
 */

const RED = "#ef493d";
const MONTSERRAT = "Montserrat, sans-serif";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_FILE_MB = 5;
const FILE_TYPES = {
  default: [".pdf", ".jpg", ".jpeg", ".png"],
  images: [".jpg", ".jpeg", ".png"],
};

/* Option grids — written out in full so Tailwind sees every class. */
const OPTION_COLS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};
const GROUP_COLS = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-[0.5fr_1fr_1fr_1fr]",
};

const inputCls = `flex-1 min-w-0 w-full bg-transparent outline-none border-none
                  text-[#333] placeholder:text-[#8a8a8a]
                  text-[14px] sm:text-[16px] lg:text-[1.042vw]
                  leading-[26px] lg:leading-[1.563vw] pb-[8px] lg:pb-[0.417vw]`;
const textCls = "text-[14px] sm:text-[15px] lg:text-[0.938vw] leading-[24px] lg:leading-[1.5vw]";
const errorCls = "text-[#ef493d] text-[12px] lg:text-[0.729vw]";

/** Every field in the config, groups and "other" boxes flattened. */
function allFields(config) {
  const out = [];
  const visit = (f) => {
    if (f.type === "group") return f.fields.forEach(visit);
    if (f.type === "note") return;
    out.push(f);
    if (f.other) out.push({ name: f.other.name, label: f.other.label });
  };
  config.sections.forEach((s) => s.fields.forEach(visit));
  return out;
}

function defaultValuesFor(config) {
  const values = {};
  for (const f of allFields(config)) {
    if (f.type === "checkboxes") values[f.name] = [];
    else if (f.type === "checkbox") values[f.name] = false;
    else if (f.type === "file") values[f.name] = null;
    else if (f.type === "select") values[f.name] = f.options[0];
    else values[f.name] = "";
    if (f.type === "phone") values[`${f.name}CountryCode`] = DEFAULT_COUNTRY_CODE;
  }
  if (config.terms) values[config.terms.name] = false;
  return values;
}

/** Form values → the flat Strapi record plus a map of files to upload. */
function toPayload(config, v) {
  const data = { ...(config.fixed || {}), formSource: config.formSource };
  const files = {};
  for (const f of allFields(config)) {
    // Not rendered (showIf false) → unregistered → not part of the record.
    if (!(f.name in v)) continue;
    const val = v[f.name];
    switch (f.type) {
      case "file":
        if (val?.[0]) files[f.name] = val[0];
        break;
      case "checkboxes":
        data[f.name] = (val || []).join(", ") || null;
        break;
      case "checkbox":
        data[f.name] = !!val;
        break;
      case "date":
        data[f.name] = val || null;
        break;
      case "number":
        data[f.name] = val === "" || val == null ? null : Number(val);
        break;
      case "phone":
        data[f.name] = val ? `${dialCodeFor(v[`${f.name}CountryCode`])} ${String(val).trim()}` : null;
        break;
      default:
        // Blank → null: Strapi rejects "" for email fields, and an unanswered
        // question reads better as empty than as an empty string.
        data[f.name] = typeof val === "string" ? val.trim() || null : val ?? null;
    }
  }
  // "Same as above" is a UI convenience; store the copied address.
  for (const { flag, copy } of config.sameAs || []) {
    if (!data[flag]) continue;
    for (const [to, from] of Object.entries(copy)) data[to] = data[from] ?? null;
  }
  if (config.terms) data[config.terms.name] = !!v[config.terms.name];
  return { data, files };
}

/* ───────────────────────── primitives ───────────────────────── */

function FieldRow({ as: Tag = "label", error, className = "", children }) {
  return (
    <Tag className={`flex flex-col w-full gap-[10px] lg:gap-[0.625vw] ${className}`}>
      <div className="flex items-end justify-between w-full gap-[10px] lg:gap-[0.521vw]">{children}</div>
      <div className={`h-px w-full ${error ? "bg-[#ef493d]" : "bg-[#33333322]"} transition-colors duration-300`} />
      {error?.message && <span className={`${errorCls} -mt-[4px]`}>{error.message}</span>}
    </Tag>
  );
}

const Choice = React.forwardRef(function Choice({ type = "checkbox", label, disabled, ...inputProps }, ref) {
  return (
    <label
      className={`flex items-start gap-[10px] lg:gap-[0.625vw] text-[#333] ${textCls} ${
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        className="mt-[5px] lg:mt-[0.3vw] shrink-0 w-[16px] h-[16px] lg:w-[0.938vw] lg:h-[0.938vw] cursor-pointer disabled:cursor-not-allowed"
        style={{ accentColor: RED }}
        {...inputProps}
      />
      <span>{label}</span>
    </label>
  );
});

const requiredMsg = (label) => `Please fill in ${label.replace(/\s*\(.*\)$/, "")}`;

/* ───────────────────────── form ───────────────────────── */

export default function DynamicForm({ config }) {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [done, setDone] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  // Bumped per document to remount its file input, so removing a file also
  // clears the filename the browser holds on the DOM node.
  const [fileKeys, setFileKeys] = useState({});

  const defaultValues = useMemo(() => defaultValuesFor(config), [config]);
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    watch,
    formState: { errors },
  } = useForm({ defaultValues, mode: "onBlur", shouldUnregister: true });

  const values = watch();

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

  const visible = (item) => !item.showIf || item.showIf(values);

  const textRules = (f) => ({
    required: f.required ? requiredMsg(f.label) : false,
    ...(f.pattern ? { pattern: { value: f.pattern, message: f.patternMessage || "Invalid value" } } : {}),
    ...(f.type === "email" ? { pattern: { value: EMAIL_RE, message: "Enter a valid email" } } : {}),
    ...(f.validate ? { validate: (val, all) => !val || f.validate(val, all) } : {}),
  });

  const upperProps = {
    onInput: (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/\s/g, "");
    },
    style: { textTransform: "uppercase" },
  };

  const renderOther = (f, selected) => {
    if (!f.other || !selected) return null;
    return (
      <div className="mt-[6px] lg:max-w-[50%]">
        <FieldRow error={errors[f.other.name]}>
          <input
            type="text"
            placeholder={`${f.other.label}*`}
            className={inputCls}
            {...register(f.other.name, { required: requiredMsg(f.other.label) })}
          />
        </FieldRow>
      </div>
    );
  };

  const renderField = (f, key) => {
    if (!visible(f)) return null;
    const span = f.span === 2 ? "lg:col-span-2" : "";
    const label = `${f.label}${f.required ? "*" : ""}`;
    const err = errors[f.name];

    switch (f.type) {
      case "note":
        return (
          <p key={key} className={`lg:col-span-2 text-[#555] ${textCls}`}>
            {f.text}
          </p>
        );

      case "group":
        return (
          <div key={key} className={`lg:col-span-2 grid ${GROUP_COLS[f.cols] || GROUP_COLS[2]} gap-x-[24px] lg:gap-x-[2.083vw] gap-y-[26px] lg:gap-y-[1.823vw]`}>
            {f.fields.map((sub, i) => renderField(sub, `${key}-${i}`))}
          </div>
        );

      case "select":
        return (
          <FieldRow key={key} error={err} className={span}>
            <select aria-label={f.label} className={`${inputCls} cursor-pointer`} {...register(f.name)}>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </FieldRow>
        );

      case "textarea":
        return (
          <FieldRow key={key} error={err} className={span}>
            <textarea rows={2} placeholder={label} aria-invalid={!!err || undefined} className={`${inputCls} resize-none`} {...register(f.name, textRules(f))} />
          </FieldRow>
        );

      case "date":
        return (
          <FieldRow key={key} error={err} className={span}>
            <span className={`shrink-0 text-[#8a8a8a] pb-[8px] lg:pb-[0.417vw] ${textCls}`}>{label}</span>
            <input type="date" aria-label={f.label} aria-invalid={!!err || undefined} className={`${inputCls} text-right`} {...register(f.name, textRules(f))} />
          </FieldRow>
        );

      case "phone":
        return (
          <FieldRow key={key} error={err} className={span}>
            <CountryCodeSelect
              {...register(`${f.name}CountryCode`, {
                onChange: () => getValues(f.name) && trigger(f.name),
              })}
              className="text-[#333] pb-[8px] lg:pb-[0.417vw] text-[14px] sm:text-[16px] lg:text-[1.042vw]"
            />
            <input
              type="tel"
              placeholder={label}
              aria-invalid={!!err || undefined}
              className={inputCls}
              {...register(f.name, {
                required: f.required ? requiredMsg(f.label) : false,
                validate: (val, all) => !val || validatePhone(val, all[`${f.name}CountryCode`]),
              })}
            />
          </FieldRow>
        );

      case "radio":
      case "checkboxes": {
        const isRadio = f.type === "radio";
        const current = values[f.name];
        const count = isRadio ? 0 : (current || []).length;
        const otherSelected = f.other && (isRadio ? current === f.other.value : (current || []).includes(f.other.value));
        return (
          <div key={key} role="group" aria-label={f.label} className="lg:col-span-2 flex flex-col gap-[12px] lg:gap-[0.781vw]">
            <p className={`text-[#333] font-medium ${textCls}`}>{label}</p>
            <div className={`grid ${OPTION_COLS[f.columns] || OPTION_COLS[3]} gap-y-[12px] lg:gap-y-[0.781vw] gap-x-[20px] lg:gap-x-[1.563vw]`}>
              {f.options.map((o) => (
                <Choice
                  key={o}
                  type={isRadio ? "radio" : "checkbox"}
                  label={o}
                  value={o}
                  // "Choose up to N": lock the rest once N are ticked.
                  disabled={!isRadio && f.max && count >= f.max && !(current || []).includes(o)}
                  {...register(f.name, {
                    validate: (val) => {
                      if (isRadio) return !f.required || !!val || `Please select ${f.label.toLowerCase()}`;
                      const n = (val || []).length;
                      if (f.required && n === 0) return "Select at least one";
                      if (f.max && n > f.max) return `Choose up to ${f.max}`;
                      return true;
                    },
                  })}
                />
              ))}
            </div>
            {err?.message && <span className={errorCls}>{err.message}</span>}
            {renderOther(f, otherSelected)}
          </div>
        );
      }

      case "checkbox":
        return (
          <div key={key} className="lg:col-span-2">
            <Choice label={label} {...register(f.name, { required: f.required ? "Please tick to continue" : false })} />
            {err?.message && <span className={errorCls}>{err.message}</span>}
          </div>
        );

      case "file": {
        const types = FILE_TYPES[f.accept] || FILE_TYPES.default;
        const file = values[f.name]?.[0] || null;
        return (
          <FieldRow key={key} as="div" error={err} className={span}>
            <label className={`flex flex-1 min-w-0 items-center gap-[10px] lg:gap-[0.521vw] cursor-pointer pb-[8px] lg:pb-[0.417vw] ${textCls}`}>
              <Paperclip className="shrink-0 w-[16px] h-[16px] lg:w-[1.042vw] lg:h-[1.042vw]" strokeWidth={1.6} style={{ color: RED }} />
              <span className={`truncate ${file ? "text-[#333]" : "text-[#8a8a8a]"}`}>{file ? file.name : label}</span>
              <input
                key={fileKeys[f.name] || 0}
                type="file"
                accept={types.join(",")}
                className="sr-only"
                aria-label={f.label}
                aria-invalid={!!err || undefined}
                {...register(f.name, {
                  validate: {
                    required: (list) => !f.required || !!list?.[0] || `Please attach the ${f.label}`,
                    size: (list) => !list?.[0] || list[0].size <= MAX_FILE_MB * 1024 * 1024 || `File must be under ${MAX_FILE_MB}MB`,
                    type: (list) =>
                      !list?.[0] ||
                      types.some((ext) => list[0].name.toLowerCase().endsWith(ext)) ||
                      `Upload a ${types.map((t) => t.slice(1).toUpperCase()).join(", ")} file`,
                  },
                })}
              />
            </label>
            {file ? (
              <button
                type="button"
                onClick={() => {
                  setValue(f.name, null, { shouldValidate: false });
                  setFileKeys((k) => ({ ...k, [f.name]: (k[f.name] || 0) + 1 }));
                }}
                aria-label={`Remove ${f.label}`}
                className="shrink-0 text-[#8a8a8a] hover:text-[#ef493d] transition-colors pb-[8px] lg:pb-[0.417vw]"
              >
                <X className="w-[16px] h-[16px] lg:w-[0.938vw] lg:h-[0.938vw]" strokeWidth={1.8} />
              </button>
            ) : (
              <span className="shrink-0 pb-[8px] lg:pb-[0.417vw] text-[13px] lg:text-[0.833vw]" style={{ color: RED }}>
                Browse
              </span>
            )}
          </FieldRow>
        );
      }

      default:
        return (
          <FieldRow key={key} error={err} className={span}>
            <input
              type={f.type === "email" ? "email" : f.type === "number" ? "number" : "text"}
              placeholder={label}
              inputMode={f.inputMode || (f.type === "number" ? "decimal" : undefined)}
              min={f.type === "number" ? 0 : undefined}
              step={f.type === "number" ? "any" : undefined}
              maxLength={f.maxLength}
              aria-invalid={!!err || undefined}
              className={inputCls}
              {...(f.upper ? upperProps : {})}
              {...register(f.name, textRules(f))}
            />
          </FieldRow>
        );
    }
  };

  const onSubmit = async (v) => {
    setSubmitting(true);
    setSubmitError(null);
    const { data, files } = toPayload(config, v);
    const ok = await submitPublicForm(config.endpoint, data, files);
    setSubmitting(false);
    if (ok) {
      setDone(true);
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setSubmitError("Couldn't submit the form. Please check your connection and try again.");
    }
  };

  // Jump to the first invalid field — these forms are long.
  const onInvalid = () => {
    requestAnimationFrame(() => {
      rootRef.current?.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const terms = config.terms;

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden scroll-mt-[80px]
                 pt-[120px] md:pt-[150px] lg:pt-[10.417vw]
                 pb-[60px] md:pb-[90px] lg:pb-[7.5vw]"
      style={{ fontFamily: MONTSERRAT }}
    >
      {config.label && (
        <div className="lg:absolute left-[4.167vw] top-[10.417vw] max-lg:flex max-lg:justify-center max-lg:mb-[18px]">
          <SectionLabel>{config.label}</SectionLabel>
        </div>
      )}

      <div className="px-5 md:px-12 lg:px-[15.625vw]">
        <SectionHeading
          ref={headingRef}
          className="text-[#333] capitalize text-center will-change-transform leading-[1.05] tracking-[0.021em]
                     text-[38px] xs:text-[44px] sm:text-[56px] md:text-[72px] lg:text-[5vw]"
        >
          {config.heading}
        </SectionHeading>
        {config.intro?.map((t) => (
          <p key={t} className={`mt-[14px] lg:mt-[0.938vw] text-center text-[#555] ${textCls}`}>
            {t}
          </p>
        ))}

        {done ? (
          <div role="status" className="mt-[40px] lg:mt-[3.125vw] mx-auto max-w-[640px] lg:max-w-[40vw] flex flex-col items-center text-center gap-[16px] lg:gap-[1.042vw]">
            <CheckCircle2 className="w-[48px] h-[48px] lg:w-[3.125vw] lg:h-[3.125vw]" strokeWidth={1.4} style={{ color: RED }} />
            <p className="text-[#333] text-[18px] sm:text-[20px] lg:text-[1.302vw] font-medium">{config.success.title}</p>
            {config.success.text && <p className={`text-[#555] ${textCls}`}>{config.success.text}</p>}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="mt-[36px] lg:mt-[3.125vw] flex flex-col gap-[44px] lg:gap-[3.125vw]">
            {config.sections.filter(visible).map((section) => (
              <div key={section.title} role="group" aria-label={section.title} className="flex flex-col gap-[22px] lg:gap-[1.563vw]">
                <p className="font-semibold uppercase tracking-[0.06em] text-[#ef493d] text-[12px] sm:text-[13px] lg:text-[0.781vw]">
                  {section.title}
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[40px] lg:gap-x-[4.167vw] gap-y-[26px] lg:gap-y-[1.823vw]">
                  {section.fields.map((f, i) => renderField(f, `${section.title}-${i}`))}
                </div>
              </div>
            ))}

            {terms && (
              <div className="flex flex-col gap-[8px]">
                <Choice
                  label={
                    <>
                      {terms.before}
                      <button
                        type="button"
                        onClick={(e) => {
                          // Inside the checkbox's label: open the document
                          // without toggling the box.
                          e.preventDefault();
                          setTermsOpen(true);
                        }}
                        className="text-[#ef493d] underline underline-offset-2 hover:no-underline"
                      >
                        {terms.linkText}
                      </button>
                      {terms.after}
                    </>
                  }
                  {...register(terms.name, { required: "Please accept to continue" })}
                />
                {errors[terms.name] && <span className={errorCls}>{errors[terms.name].message}</span>}
              </div>
            )}

            {submitError && (
              <p role="alert" className="text-[#ef493d] text-[13px] lg:text-[0.833vw] -mt-[16px]">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group relative inline-flex items-center justify-center self-start
                         overflow-hidden border border-[#ef493d] bg-transparent
                         transition-[border-color] duration-500 ease-premium
                         disabled:opacity-60 disabled:cursor-not-allowed
                         px-[28px] lg:px-[2vw] min-w-[200px] sm:min-w-[224px] lg:min-w-[11.667vw]
                         h-[52px] sm:h-[58px] lg:h-[3.021vw]"
            >
              <span aria-hidden="true" className="absolute inset-0 origin-bottom translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-premium bg-[#ef493d]" />
              <span className="relative z-[1] capitalize text-[#ef493d] group-hover:text-white transition-colors duration-500 text-[15px] sm:text-[16px] lg:text-[0.938vw] tracking-[0.02em]">
                {submitting ? "Submitting…" : config.submitText || "Submit"}
              </span>
            </button>
          </form>
        )}
      </div>

      {terms && (
        <DocumentModal
          open={termsOpen}
          eyebrow={config.label}
          title={terms.modalTitle}
          onClose={() => setTermsOpen(false)}
          onAccept={() => {
            setValue(terms.name, true, { shouldValidate: true });
            setTermsOpen(false);
          }}
        >
          <LegalDocument blocks={terms.document} />
        </DocumentModal>
      )}
    </section>
  );
}
