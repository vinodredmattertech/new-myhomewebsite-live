import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Paperclip, X } from "lucide-react";
import CountryCodeSelect, { DEFAULT_COUNTRY_CODE } from "@/components/common/CountryCodeSelect";
import { dialCodeFor, registerPhone } from "@/lib/phone";
import { submitChannelPartnerApplication } from "@/lib/strapi";
import AgreementTermsModal from "@/components/myhome/channel-partner-agreement/AgreementTermsModal";
import {
  GOLD,
  inputCls,
  textCls,
  errorCls,
  FieldRow,
  Choice,
  FormSection,
  SubmitBar,
  SuccessMessage,
  DocumentSheet,
  DocumentForm,
} from "@/components/myhome/forms/DocumentUI";
import {
  PLEASE_READ,
  NATURE_OF_BUSINESS,
  ORGANISATION_TYPES,
  CONTACT_TITLES,
  DECLARATION,
} from "@/lib/channelPartnerAgreement";

/* Document constraints — mirrored in the validation messages below. */
const MAX_FILE_MB = 5;
const ACCEPTED_EXT = [".pdf", ".jpg", ".jpeg", ".png"];
const ACCEPT_ATTR = ACCEPTED_EXT.join(",");

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PIN_RE = /^[1-9][0-9]{5}$/;

/**
 * The documents the cover letter asks partners to enclose. `field` is the
 * media attribute on the channel-partner-application schema. `required` may
 * depend on the organisation type: a sole proprietor has no board to pass a
 * resolution.
 */
const DOCUMENTS = [
  { field: "panFile", label: "PAN Card", required: () => true },
  { field: "aadhaarFile", label: "Aadhaar Card", required: () => true },
  { field: "gstFile", label: "GST Certificate", required: () => true },
  { field: "reraFile", label: "RERA Registration Certificate", required: () => true },
  {
    field: "authorisationFile",
    label: "Board Resolution / Authorisation Letter",
    required: (orgType) => orgType && orgType !== "Sole Proprietorship",
  },
  { field: "companyProfileFile", label: "Company Profile", required: () => false },
];

/**
 * ChannelPartnerAgreementForm — the "Channel Partner Registration Form" from
 * the printed agreement, online. Every field on the form is captured, plus
 * the agreement particulars the printed agreement leaves blank (RERA state,
 * registration number, signatory, witness) and the documents the cover letter
 * asks for. Submissions go to Strapi's Channel Partner Application collection
 * with the documents attached, via `submitChannelPartnerApplication`.
 */
export default function AgreementForm() {
  const rootRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [done, setDone] = useState(false);
  // Bumped per document to remount its file input, so removing a file also
  // clears the filename the browser holds on the DOM node.
  const [fileKeys, setFileKeys] = useState({});
  const [termsOpen, setTermsOpen] = useState(false);

  const {
    register,
    getValues,
    trigger,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      reraNumber: "",
      reraState: "",
      entityName: "",
      contactTitle: "Mr.",
      contactName: "",
      countryCode: DEFAULT_COUNTRY_CODE,
      altCountryCode: DEFAULT_COUNTRY_CODE,
      primaryContact: "",
      alternativeContact: "",
      email: "",
      dateOfIncorporation: "",
      directorsPartners: "",
      pan: "",
      aadhaarNo: "",
      gstNo: "",
      registeredAddress: "",
      registeredPincode: "",
      communicationSameAsRegistered: false,
      communicationAddress: "",
      communicationPincode: "",
      natureOfBusiness: [],
      organisationType: "",
      organisationTypeOther: "",
      registrationNumber: "",
      website: "",
      membershipNumber: "",
      associationName: "",
      signatoryName: "",
      signatoryDesignation: "",
      witnessName: "",
      witnessAddress: "",
      declarationAccepted: false,
      agreementAccepted: false,
    },
    mode: "onBlur",
  });

  const orgType = watch("organisationType");
  const isSoleProp = orgType === "Sole Proprietorship";
  const sameAddress = watch("communicationSameAsRegistered");


  /** Single-line text field. */
  const text = (name, label, rules = {}, props = {}) => (
    <FieldRow label={label} error={errors[name]}>
      <input
        type="text"
        aria-invalid={!!errors[name] || undefined}
        className={inputCls}
        {...props}
        {...register(name, rules)}
      />
    </FieldRow>
  );

  /** Multi-line address/list field. */
  const area = (name, label, rules = {}, props = {}) => (
    <FieldRow label={label} error={errors[name]}>
      <textarea
        rows={2}
        aria-invalid={!!errors[name] || undefined}
        className={`${inputCls} resize-none`}
        {...props}
        {...register(name, rules)}
      />
    </FieldRow>
  );

  /** Upper-cases ID numbers (PAN, GST) as they are typed. */
  const upper = () => ({
    onInput: (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/\s/g, "");
    },
    style: { textTransform: "uppercase" },
  });

  const fileField = ({ field, label, required }) => {
    const isRequired = required(orgType);
    const file = watch(field)?.[0] || null;
    return (
      <FieldRow
        key={field}
        as="div"
        label={`${label}${isRequired ? "*" : " (optional)"}`}
        error={errors[field]}
        dashed
      >
        <label className={`flex flex-1 min-w-0 items-center gap-[12px] cursor-pointer py-[12px] ${textCls}`}>
          <Paperclip className="shrink-0 w-[16px] h-[16px]" strokeWidth={1.6} style={{ color: GOLD }} />
          <span className={`truncate ${file ? "text-[#1f1d1b]" : "text-[#a59d92]"}`}>
            {file ? file.name : `PDF, JPG, PNG · up to ${MAX_FILE_MB}MB`}
          </span>
          <input
            key={fileKeys[field] || 0}
            type="file"
            accept={ACCEPT_ATTR}
            className="sr-only"
            aria-label={label}
            aria-invalid={!!errors[field] || undefined}
            {...register(field, {
              validate: {
                required: (list) =>
                  !required(getValues("organisationType")) ||
                  !!list?.[0] ||
                  `Please attach the ${label}`,
                size: (list) =>
                  !list?.[0] ||
                  list[0].size <= MAX_FILE_MB * 1024 * 1024 ||
                  `File must be under ${MAX_FILE_MB}MB`,
                type: (list) =>
                  !list?.[0] ||
                  ACCEPTED_EXT.some((ext) => list[0].name.toLowerCase().endsWith(ext)) ||
                  "Upload a PDF, JPG or PNG file",
              },
            })}
          />
        </label>
        {file ? (
          <button
            type="button"
            onClick={() => {
              setValue(field, null, { shouldValidate: false });
              setFileKeys((k) => ({ ...k, [field]: (k[field] || 0) + 1 }));
            }}
            aria-label={`Remove ${label}`}
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
  };

  const onSubmit = async (v) => {
    setSubmitting(true);
    setSubmitError(null);

    const soleProp = v.organisationType === "Sole Proprietorship";
    const data = {
      reraNumber: v.reraNumber.trim(),
      reraState: v.reraState.trim(),
      entityName: v.entityName.trim(),
      contactTitle: v.contactTitle,
      contactName: v.contactName.trim(),
      primaryContact: `${dialCodeFor(v.countryCode)} ${v.primaryContact}`.trim(),
      alternativeContact: v.alternativeContact
        ? `${dialCodeFor(v.altCountryCode)} ${v.alternativeContact}`
        : "",
      email: v.email.trim(),
      dateOfIncorporation: (!soleProp && v.dateOfIncorporation) || null,
      directorsPartners: soleProp ? "" : v.directorsPartners.trim(),
      pan: v.pan.trim(),
      aadhaarNo: v.aadhaarNo.replace(/\s/g, ""),
      gstNo: v.gstNo.trim(),
      registeredAddress: v.registeredAddress.trim(),
      registeredPincode: v.registeredPincode.trim(),
      communicationSameAsRegistered: v.communicationSameAsRegistered,
      communicationAddress: v.communicationSameAsRegistered
        ? v.registeredAddress.trim()
        : v.communicationAddress.trim(),
      communicationPincode: v.communicationSameAsRegistered
        ? v.registeredPincode.trim()
        : v.communicationPincode.trim(),
      natureOfBusiness: (v.natureOfBusiness || []).join(", "),
      organisationType: v.organisationType,
      organisationTypeOther: v.organisationType === "Others" ? v.organisationTypeOther.trim() : "",
      registrationNumber: soleProp ? "" : v.registrationNumber.trim(),
      website: v.website.trim(),
      membershipNumber: v.membershipNumber.trim(),
      associationName: v.associationName.trim(),
      signatoryName: v.signatoryName.trim(),
      signatoryDesignation: v.signatoryDesignation.trim(),
      witnessName: v.witnessName.trim(),
      witnessAddress: v.witnessAddress.trim(),
      declarationAccepted: v.declarationAccepted,
      agreementAccepted: v.agreementAccepted,
    };

    const files = Object.fromEntries(DOCUMENTS.map(({ field }) => [field, v[field]?.[0] || null]));

    const ok = await submitChannelPartnerApplication(data, files);
    setSubmitting(false);
    if (ok) {
      setDone(true);
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setSubmitError("Couldn't submit your registration. Please check your connection and try again.");
    }
  };

  return (
    <DocumentSheet
      ref={rootRef}
      id="register"
      eyebrow="Channel Partner"
      heading="Customer Survey Form"
      after={
        <AgreementTermsModal
          open={termsOpen}
          onClose={() => setTermsOpen(false)}
          onAccept={() => {
            setValue("agreementAccepted", true, { shouldValidate: true });
            setTermsOpen(false);
          }}
        />
      }
    >
      {done ? (
        <SuccessMessage
          title="Thank you — your registration has been received."
          text="Our team will review your details and documents. Once approved, we will send you the Channel Partner Agreement to be signed on each page with your company stamp and witnessed."
        />
      ) : (
        <DocumentForm onSubmit={handleSubmit(onSubmit)}>
          {/* Please read */}
          <ol className="list-decimal border-l-2 border-[#c39a3e] pl-[32px] flex flex-col gap-[6px] text-[#6b645b] text-[13.5px] leading-[22px]">
            {PLEASE_READ.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>

          {/* RERA */}
          <FormSection title="RERA Registration">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[24px] gap-y-[22px]">
              {text("reraNumber", "RERA Registration No.*", { required: "Please enter your RERA registration number" })}
              {text("reraState", "State of RERA Registration*", { required: "Please enter the state you are registered in" })}
            </div>
          </FormSection>

          {/* Company details */}
          <FormSection title="Company Details">
            {text("entityName", "Company / Partnership / Individual Name*", {
              required: "Please enter the company, firm or individual name",
            })}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[24px] gap-y-[22px]">
              <FieldRow label="Contact Person Name*" error={errors.contactName}>
                <select
                  aria-label="Title"
                  className={`${inputCls} !flex-none !w-auto pr-[6px] cursor-pointer`}
                  {...register("contactTitle")}
                >
                  {CONTACT_TITLES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  aria-invalid={!!errors.contactName || undefined}
                  className={inputCls}
                  {...register("contactName", { required: "Please enter the contact person's name" })}
                />
              </FieldRow>

              <FieldRow label="Email ID*" error={errors.email}>
                <input
                  type="email"
                  aria-invalid={!!errors.email || undefined}
                  className={inputCls}
                  {...register("email", {
                    required: "Please enter your email",
                    pattern: { value: EMAIL_RE, message: "Enter a valid email" },
                  })}
                />
              </FieldRow>

              <FieldRow label="Primary Contact No.*" error={errors.primaryContact}>
                <CountryCodeSelect
                  {...register("countryCode", {
                    onChange: () => getValues("primaryContact") && trigger("primaryContact"),
                  })}
                  className="text-[#1f1d1b] text-[14.5px]"
                />
                <input
                  type="tel"
                  aria-invalid={!!errors.primaryContact || undefined}
                  className={inputCls}
                  {...registerPhone(register, "primaryContact", () => getValues("countryCode"), {
                    required: "Please enter your contact number",
                  })}
                />
              </FieldRow>

              <FieldRow label="Alternative Contact No." error={errors.alternativeContact}>
                <CountryCodeSelect
                  {...register("altCountryCode", {
                    onChange: () => getValues("alternativeContact") && trigger("alternativeContact"),
                  })}
                  className="text-[#1f1d1b] text-[14.5px]"
                />
                <input
                  type="tel"
                  aria-invalid={!!errors.alternativeContact || undefined}
                  className={inputCls}
                  {...registerPhone(register, "alternativeContact", () => getValues("altCountryCode"))}
                />
              </FieldRow>

              {!isSoleProp && (
                <FieldRow label="Date of Incorporation*" error={errors.dateOfIncorporation}>
                  <input
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    aria-invalid={!!errors.dateOfIncorporation || undefined}
                    className={inputCls}
                    {...register("dateOfIncorporation", {
                      validate: (val) =>
                        getValues("organisationType") === "Sole Proprietorship" ||
                        !!val ||
                        "Please enter the date of incorporation",
                    })}
                  />
                </FieldRow>
              )}

              {!isSoleProp &&
                text("registrationNumber", "Firm Regn. No. / CIN / LLPIN*", {
                  validate: (val) =>
                    getValues("organisationType") === "Sole Proprietorship" ||
                    !!val.trim() ||
                    "Please enter the registration number, CIN or LLPIN",
                })}

              {text(
                "pan",
                "PAN*",
                {
                  required: "Please enter your PAN",
                  pattern: { value: PAN_RE, message: "Enter a valid PAN, e.g. ABCDE1234F" },
                },
                { maxLength: 10, ...upper() }
              )}

              {text(
                "aadhaarNo",
                "Aadhaar No.*",
                {
                  required: "Please enter your Aadhaar number",
                  validate: (val) =>
                    /^[2-9][0-9]{11}$/.test(val.replace(/\s/g, "")) || "Enter a valid 12-digit Aadhaar number",
                },
                { inputMode: "numeric", maxLength: 14 }
              )}

              {text(
                "gstNo",
                "GST No.*",
                {
                  required: "Please enter your GST number",
                  pattern: { value: GST_RE, message: "Enter a valid 15-character GSTIN" },
                },
                { maxLength: 15, ...upper() }
              )}

              {text("website", "Website", {})}
            </div>

            {!isSoleProp &&
              area("directorsPartners", "Name of the Directors / Partners*", {
                validate: (val) =>
                  getValues("organisationType") === "Sole Proprietorship" ||
                  !!val.trim() ||
                  "Please list the directors or partners",
              })}
          </FormSection>

          {/* Addresses */}
          <FormSection title="Address">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-x-[24px] gap-y-[22px]">
              {area("registeredAddress", "Registered Address*", { required: "Please enter the registered address" })}
              {text(
                "registeredPincode",
                "Pin Code*",
                {
                  required: "Please enter the pin code",
                  pattern: { value: PIN_RE, message: "Enter a valid 6-digit pin code" },
                },
                { inputMode: "numeric", maxLength: 6 }
              )}
            </div>

            <Choice label="Communication address is the same as the registered address" {...register("communicationSameAsRegistered")} />

            {!sameAddress && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-x-[24px] gap-y-[22px]">
                {area("communicationAddress", "Communication Address*", {
                  validate: (val) =>
                    getValues("communicationSameAsRegistered") || !!val.trim() || "Please enter the communication address",
                })}
                {text(
                  "communicationPincode",
                  "Pin Code*",
                  {
                    validate: (val) =>
                      getValues("communicationSameAsRegistered") || PIN_RE.test(val) || "Enter a valid 6-digit pin code",
                  },
                  { inputMode: "numeric", maxLength: 6 }
                )}
              </div>
            )}
          </FormSection>

          {/* Nature of business + organisation type */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-x-[40px] gap-y-[44px]">
            <FormSection title="Nature of Business*">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[8px]">
                {NATURE_OF_BUSINESS.map((n) => (
                  <Choice
                    key={n}
                    tile
                    label={n}
                    value={n}
                    {...register("natureOfBusiness", {
                      validate: (list) => (list && list.length > 0) || "Select at least one",
                    })}
                  />
                ))}
              </div>
              {errors.natureOfBusiness && (
                <span className={errorCls}>{errors.natureOfBusiness.message}</span>
              )}
            </FormSection>

            <FormSection title="Organisation Type*">
              <div className="grid grid-cols-1 gap-[8px]">
                {ORGANISATION_TYPES.map((o) => (
                  <Choice
                    key={o}
                    tile
                    type="radio"
                    label={o}
                    value={o}
                    {...register("organisationType", {
                      required: "Select your organisation type",
                      // The authorisation letter is optional for a sole
                      // proprietor; clear an error already showing for it.
                      onChange: () => errors.authorisationFile && trigger("authorisationFile"),
                    })}
                  />
                ))}
              </div>
              {orgType === "Others" &&
                text("organisationTypeOther", "Please specify*", {
                  validate: (val) =>
                    getValues("organisationType") !== "Others" || !!val.trim() || "Please specify the organisation type",
                })}
              {errors.organisationType && (
                <span className={errorCls}>{errors.organisationType.message}</span>
              )}
            </FormSection>
          </div>

          {/* Memberships */}
          <FormSection title="Memberships">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[24px] gap-y-[22px]">
              {text("membershipNumber", "Membership Number, if any")}
              {text("associationName", "Member of any Association (Mention Name)")}
            </div>
          </FormSection>

          {/* Signatory and witness */}
          <FormSection title="Authorised Signatory & Witness">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[24px] gap-y-[22px]">
              {text("signatoryName", "Authorised Signatory Name*", {
                required: "Please enter the authorised signatory's name",
              })}
              {text("signatoryDesignation", "Designation*", {
                required: "Please enter the signatory's designation",
              })}
              {text("witnessName", "Witness Name*", { required: "Please enter a witness name" })}
              {area("witnessAddress", "Witness Address*", { required: "Please enter the witness's address" })}
            </div>
          </FormSection>

          {/* Documents */}
          <FormSection title="Documents">
            <p className="-mt-[10px] text-[12.5px] text-[#8a837b]">
              PDF, JPG or PNG, up to {MAX_FILE_MB}MB each.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[24px] gap-y-[22px]">
              {DOCUMENTS.map(fileField)}
            </div>
          </FormSection>

          {/* Declaration */}
          <FormSection title="Declaration">
            <div className="flex flex-col gap-[16px]">
              <Choice
                label={DECLARATION}
                {...register("declarationAccepted", { required: "Please accept the declaration" })}
              />
              {errors.declarationAccepted && (
                <span className={errorCls}>{errors.declarationAccepted.message}</span>
              )}
              <Choice
                label={
                  <>
                    I have read and agree to the{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        // Inside the checkbox's label: open the terms without
                        // toggling the box.
                        e.preventDefault();
                        setTermsOpen(true);
                      }}
                      className="text-[#ef493d] underline underline-offset-2 hover:no-underline"
                    >
                      Channel Partner Agreement
                    </button>
                    , including the Annexure A payment matrix.
                  </>
                }
                {...register("agreementAccepted", { required: "Please accept the agreement" })}
              />
              {errors.agreementAccepted && (
                <span className={errorCls}>{errors.agreementAccepted.message}</span>
              )}
            </div>
          </FormSection>

          <SubmitBar submitting={submitting} label="Submit Registration" error={submitError} />
        </DocumentForm>
      )}
    </DocumentSheet>
  );
}
