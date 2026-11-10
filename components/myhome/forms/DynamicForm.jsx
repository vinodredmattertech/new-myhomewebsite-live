import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { checkSurveyPhone, submitPublicForm } from "@/lib/strapi";

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
  // Phone fields with `uniqueCheck`: the existing response for the number
  // typed, by field name (null = not registered), and the answers so far by
  // full number, so re-validating doesn't call the backend again.
  const [registered, setRegistered] = useState({});
  const phoneChecks = useRef(new Map());
  // `honeypot`: a hidden field only bots fill in, and when the form opened —
  // both go to the backend, which quietly drops a submission that trips them.
  const honeypotRef = useRef(null);
  const openedAt = useRef(0);
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

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

  const renderOther = (f, selected, full = false) => {
    if (!f.other || !selected) return null;
    return (
      <div className={`mt-[6px] ${full ? "" : "lg:max-w-[50%]"}`}>
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

      case "phone": {
        // `uniqueCheck`: one response per number — a number already in the
        // backend fails validation (and so blocks submitting), and what was
        // saved against it is shown below the field.
        const checkUnique = async (val, cc) => {
          const full = `${dialCodeFor(cc)} ${String(val).trim()}`;
          if (!phoneChecks.current.has(full)) phoneChecks.current.set(full, checkSurveyPhone(full));
          const result = await phoneChecks.current.get(full);
          if (result === null) phoneChecks.current.delete(full); // couldn't check; the backend still refuses duplicates
          setRegistered((r) => ({ ...r, [f.name]: result?.exists ? result.response : null }));
          return result?.exists ? "This mobile number is already registered. You can't submit the survey again." : true;
        };
        const existing = f.uniqueCheck ? registered[f.name] : null;
        return (
          <div key={key} className={`flex flex-col gap-[10px] ${span}`}>
          <FieldRow label={label} error={err}>
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
                validate: async (val, all) => {
                  const cc = all[`${f.name}CountryCode`];
                  if (!val) {
                    if (f.uniqueCheck) setRegistered((r) => ({ ...r, [f.name]: null }));
                    return true;
                  }
                  const valid = validatePhone(val, cc);
                  if (valid !== true || !f.uniqueCheck) return valid;
                  return checkUnique(val, cc);
                },
              })}
            />
          </FieldRow>
          {existing && <RegisteredResponse response={existing} />}
          </div>
        );
      }

      // Single-choice questions are dropdowns — far less scrolling on mobile
      // than a grid of radio tiles.
      case "radio":
        return (
          <div key={key} className={`flex flex-col ${span}`}>
            <FieldRow label={label} error={err}>
              <select
                aria-invalid={!!err || undefined}
                className={`${inputCls} cursor-pointer ${values[f.name] ? "" : "text-[#a59d92]"}`}
                {...register(f.name, {
                  validate: (val) => !f.required || !!val || `Please select ${f.label.replace(/\s*\(.*\)$/, "").toLowerCase()}`,
                })}
              >
                <option value="">Select</option>
                {f.options.map((o) => (
                  <option key={o} value={o} className="text-[#1f1d1b]">
                    {o}
                  </option>
                ))}
              </select>
            </FieldRow>
            {renderOther(f, f.other && values[f.name] === f.other.value, true)}
          </div>
        );

      case "checkboxes": {
        const current = values[f.name];
        const count = (current || []).length;
        const otherSelected = f.other && (current || []).includes(f.other.value);
        return (
          <div key={key} role="group" aria-label={f.label} className="lg:col-span-2 flex flex-col gap-[10px]">
            <Label as="p" text={label} />
            <div className={`grid ${OPTION_COLS[f.columns] || OPTION_COLS[3]} gap-[8px]`}>
              {f.options.map((o) => (
                <Choice
                  key={o}
                  type="checkbox"
                  tile
                  label={o}
                  value={o}
                  // "Choose up to N": lock the rest once N are ticked.
                  disabled={f.max && count >= f.max && !(current || []).includes(o)}
                  {...register(f.name, {
                    validate: (val) => {
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
    if (config.honeypot) {
      data.hpWebsite = honeypotRef.current?.value || "";
      data.hpElapsedMs = Date.now() - openedAt.current;
    }
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
            {config.honeypot && <Honeypot inputRef={honeypotRef} />}
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

/** What's already saved against a number (masked by the backend). */
function RegisteredResponse({ response }) {
  const rows = [
    ["Name", response.name],
    ["Mobile", response.phone],
    ["Email", response.email],
    ["City", response.city],
    ["Channel partner", response.channelPartner],
    [
      "Submitted on",
      response.submittedAt &&
        new Date(response.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    ],
  ].filter(([, v]) => v);
  return (
    <div role="status" className="rounded-[3px] border border-[#e0897f] bg-[#fdf6f5] px-[16px] py-[14px] flex flex-col gap-[8px]">
      <p className="text-[#1f1d1b] text-[13.5px] font-semibold">A survey has already been submitted with this number</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-[16px] gap-y-[4px] text-[13px]">
        {rows.map(([k, v]) => (
          <React.Fragment key={k}>
            <dt className="text-[#8a837b]">{k}</dt>
            <dd className="text-[#1f1d1b]">{v}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
}

/**
 * Bot trap: a "Website" field moved off-screen and out of the tab order, so
 * people never see or reach it while form-filling bots tend to complete it.
 * Not display:none — some bots skip fields that are plainly hidden.
 */
function Honeypot({ inputRef }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
      <label>
        Website
        <input ref={inputRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
