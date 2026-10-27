import React, { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Paperclip, X } from "lucide-react";
import CountryCodeSelect, { DEFAULT_COUNTRY_CODE } from "@/components/common/CountryCodeSelect";
import DocumentModal from "@/components/myhome/forms/DocumentModal";
import LegalDocument from "@/components/myhome/forms/LegalDocument";
import {
  GOLD,
  inputCls,
  textCls,
  errorCls,
  Label,
  FieldRow,
  Choice,
  FormSection,
  SubmitBar,
  SuccessMessage,
  DocumentSheet,
  DocumentForm,
} from "@/components/myhome/forms/DocumentUI";
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
 * Drawn with the letterhead pieces in DocumentUI, shared with the Channel
 * Partner Agreement form.
 */

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

const requiredMsg = (label) => `Please fill in ${label.replace(/\s*\(.*\)$/, "")}`;

/* ───────────────────────── form ───────────────────────── */

export default function DynamicForm({ config }) {
  const rootRef = useRef(null);
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
        <FieldRow label={`${f.other.label}*`} error={errors[f.other.name]}>
          <input
            type="text"
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
          <p key={key} className="lg:col-span-2 border-l-2 border-[#c39a3e] pl-[14px] text-[#6b645b] text-[13.5px] leading-[22px]">
            {f.text}
          </p>
        );

      case "group":
        return (
          <div key={key} className={`lg:col-span-2 grid ${GROUP_COLS[f.cols] || GROUP_COLS[2]} gap-x-[16px] gap-y-[22px]`}>
            {f.fields.map((sub, i) => renderField(sub, `${key}-${i}`))}
          </div>
        );

      case "select":
        return (
          <FieldRow key={key} label={label} error={err} className={span}>
            <select className={`${inputCls} cursor-pointer`} {...register(f.name)}>
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
          <FieldRow key={key} label={label} error={err} className={span}>
            <textarea rows={2} aria-invalid={!!err || undefined} className={`${inputCls} resize-none`} {...register(f.name, textRules(f))} />
          </FieldRow>
        );

      case "date":
        return (
          <FieldRow key={key} label={label} error={err} className={span}>
            <input type="date" aria-invalid={!!err || undefined} className={inputCls} {...register(f.name, textRules(f))} />
          </FieldRow>
        );

      case "phone":
        return (
          <FieldRow key={key} label={label} error={err} className={span}>
            <CountryCodeSelect
              {...register(`${f.name}CountryCode`, {
                onChange: () => getValues(f.name) && trigger(f.name),
              })}
              className="text-[#333] text-[14px] sm:text-[16px]"
            />
            <input
              type="tel"
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
          <div key={key} role="group" aria-label={f.label} className="lg:col-span-2 flex flex-col gap-[10px]">
            <Label as="p" text={label} />
            <div className={`grid ${OPTION_COLS[f.columns] || OPTION_COLS[3]} gap-[8px]`}>
              {f.options.map((o) => (
                <Choice
                  key={o}
                  type={isRadio ? "radio" : "checkbox"}
                  tile
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
          <div key={key} className="lg:col-span-2 flex flex-col gap-[6px]">
            <Choice label={label} {...register(f.name, { required: f.required ? "Please tick to continue" : false })} />
            {err?.message && <span className={errorCls}>{err.message}</span>}
          </div>
        );

      case "file": {
        const types = FILE_TYPES[f.accept] || FILE_TYPES.default;
        const file = values[f.name]?.[0] || null;
        return (
          <FieldRow key={key} as="div" label={label} error={err} dashed className={span}>
            <label className={`flex flex-1 min-w-0 items-center gap-[12px] cursor-pointer py-[12px] ${textCls}`}>
              <Paperclip className="shrink-0 w-[16px] h-[16px]" strokeWidth={1.6} style={{ color: GOLD }} />
              <span className={`truncate ${file ? "text-[#1f1d1b]" : "text-[#a59d92]"}`}>
                {file ? file.name : `${types.map((t) => t.slice(1).toUpperCase()).filter((t) => t !== "JPEG").join(", ")} · up to ${MAX_FILE_MB}MB`}
              </span>
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
                className="shrink-0 text-[#a59d92] hover:text-[#ef493d] transition-colors"
              >
                <X className="w-[16px] h-[16px]" strokeWidth={1.8} />
              </button>
            ) : (
              <span
                aria-hidden="true"
                className="shrink-0 rounded-full border border-[#3d3935] px-[12px] py-[4px] text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#3d3935]"
              >
                Browse
              </span>
            )}
          </FieldRow>
        );
      }

      default:
        return (
          <FieldRow key={key} label={label} error={err} className={span}>
            <input
              type={f.type === "email" ? "email" : f.type === "number" ? "number" : "text"}
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
    <DocumentSheet
      ref={rootRef}
      eyebrow={config.label}
      heading={config.heading}
      intro={config.intro}
      after={
        terms && (
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
        )
      }
    >
      {done ? (
        <SuccessMessage title={config.success.title} text={config.success.text} />
      ) : (
        <DocumentForm onSubmit={handleSubmit(onSubmit, onInvalid)}>
          {config.sections.filter(visible).map((section) => (
            <FormSection key={section.title} title={section.title}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[24px] gap-y-[22px]">
                {section.fields.map((f, i) => renderField(f, `${section.title}-${i}`))}
              </div>
            </FormSection>
          ))}

          {terms && (
            <div className="flex flex-col gap-[8px] border-t border-[#e6e0d6] pt-[28px]">
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

          <SubmitBar submitting={submitting} label={config.submitText || "Submit"} error={submitError} />
        </DocumentForm>
      )}
    </DocumentSheet>
  );
}
