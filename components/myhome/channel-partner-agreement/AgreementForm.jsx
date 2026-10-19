import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CheckCircle2, Paperclip, X } from "lucide-react";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import SectionLabel from "@/components/myhome/SectionLabel";
import SectionHeading from "@/components/common/SectionHeading";
import CountryCodeSelect, { DEFAULT_COUNTRY_CODE } from "@/components/common/CountryCodeSelect";
import { dialCodeFor, registerPhone } from "@/lib/phone";
import { submitChannelPartnerApplication } from "@/lib/strapi";
import AgreementTermsModal from "@/components/myhome/channel-partner-agreement/AgreementTermsModal";
import {
  PLEASE_READ,
  NATURE_OF_BUSINESS,
  ORGANISATION_TYPES,
  CONTACT_TITLES,
  DECLARATION,
} from "@/lib/channelPartnerAgreement";

const RED = "#ef493d";
const MONTSERRAT = "Montserrat, sans-serif";

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

const inputCls = `flex-1 min-w-0 w-full bg-transparent outline-none border-none
                  text-[#333] placeholder:text-[#8a8a8a]
                  text-[14px] sm:text-[16px] lg:text-[1.042vw]
                  leading-[26px] lg:leading-[1.563vw] pb-[8px] lg:pb-[0.417vw]`;
const textCls = "text-[14px] sm:text-[15px] lg:text-[0.938vw] leading-[24px] lg:leading-[1.5vw]";

/**
 * One underline field row: the control(s), the rule beneath it (red when the
 * field is in error) and the error message — the same row the Career and
 * Contact forms use, so every form on the site reads the same.
 */
function FieldRow({ as: Tag = "label", hasError, errorMessage, className = "", children }) {
  return (
    <Tag className={`flex flex-col w-full gap-[10px] lg:gap-[0.625vw] ${className}`}>
      <div className="flex items-end justify-between w-full gap-[10px] lg:gap-[0.521vw]">
        {children}
      </div>
      <div
        className={`h-px w-full ${
          hasError ? "bg-[#ef493d]" : "bg-[#33333322]"
        } transition-colors duration-300`}
      />
      {hasError && errorMessage && (
        <span className="text-[#ef493d] -mt-[4px] text-[12px] lg:text-[0.729vw]">
          {errorMessage}
        </span>
      )}
    </Tag>
  );
}

/** Red uppercase subheading that opens each block, as on the printed form. */
function Block({ title, children, className = "" }) {
  return (
    <div role="group" aria-label={title} className={`flex flex-col gap-[26px] lg:gap-[1.823vw] ${className}`}>
      <p
        className="-mb-[4px] font-semibold uppercase tracking-[0.06em]
                   text-[#ef493d] text-[12px] sm:text-[13px] lg:text-[0.781vw]"
      >
        {title}
      </p>
      {children}
    </div>
  );
}

/** Small square checkbox / round radio with its label. */
const Choice = React.forwardRef(function Choice({ type = "checkbox", label, ...inputProps }, ref) {
  return (
    <label className={`flex items-start gap-[10px] lg:gap-[0.625vw] cursor-pointer text-[#333] ${textCls}`}>
      <input
        ref={ref}
        type={type}
        className="mt-[5px] lg:mt-[0.3vw] shrink-0 w-[16px] h-[16px] lg:w-[0.938vw] lg:h-[0.938vw] cursor-pointer"
        style={{ accentColor: RED }}
        {...inputProps}
      />
      <span>{label}</span>
    </label>
  );
});

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
  const headingRef = useRef(null);
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

  /** Plain underline text input. */
  const text = (name, placeholder, rules = {}, props = {}) => (
    <FieldRow hasError={!!errors[name]} errorMessage={errors[name]?.message}>
      <input
        type="text"
        placeholder={placeholder}
        aria-invalid={!!errors[name] || undefined}
        className={inputCls}
        {...props}
        {...register(name, rules)}
      />
    </FieldRow>
  );

  /** Multi-line address/list input, same underline treatment. */
  const area = (name, placeholder, rules = {}, props = {}) => (
    <FieldRow hasError={!!errors[name]} errorMessage={errors[name]?.message}>
      <textarea
        rows={2}
        placeholder={placeholder}
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
      <FieldRow key={field} as="div" hasError={!!errors[field]} errorMessage={errors[field]?.message}>
        <label className={`flex flex-1 min-w-0 items-center gap-[10px] lg:gap-[0.521vw] cursor-pointer pb-[8px] lg:pb-[0.417vw] ${textCls}`}>
          <Paperclip
            className="shrink-0 w-[16px] h-[16px] lg:w-[1.042vw] lg:h-[1.042vw]"
            strokeWidth={1.6}
            style={{ color: RED }}
          />
          <span className={`truncate ${file ? "text-[#333]" : "text-[#8a8a8a]"}`}>
            {file ? file.name : `${label}${isRequired ? "*" : " (optional)"}`}
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
    <section
      ref={rootRef}
      id="register"
      className="relative w-full bg-white overflow-hidden scroll-mt-[80px]
                 pt-[120px] md:pt-[150px] lg:pt-[10.417vw]
                 pb-[60px] md:pb-[90px] lg:pb-[7.5vw]"
      style={{ fontFamily: MONTSERRAT }}
    >
      <div className="lg:absolute left-[4.167vw] top-[10.417vw] max-lg:flex max-lg:justify-center max-lg:mb-[18px]">
        <SectionLabel>Become A Partner</SectionLabel>
      </div>

      <div className="px-5 md:px-12 lg:px-[15.625vw]">
        <SectionHeading
          ref={headingRef}
          className="text-[#333] capitalize text-center will-change-transform leading-[1.05] tracking-[0.021em]
                     text-[38px] xs:text-[44px] sm:text-[56px] md:text-[72px] lg:text-[5vw]"
        >
          Partner Registration Form
        </SectionHeading>

        {done ? (
          <div
            role="status"
            className="mt-[40px] lg:mt-[3.125vw] mx-auto max-w-[640px] lg:max-w-[40vw] flex flex-col items-center text-center gap-[16px] lg:gap-[1.042vw]"
          >
            <CheckCircle2 className="w-[48px] h-[48px] lg:w-[3.125vw] lg:h-[3.125vw]" strokeWidth={1.4} style={{ color: RED }} />
            <p className="text-[#333] text-[18px] sm:text-[20px] lg:text-[1.302vw] font-medium">
              Thank you — your registration has been received.
            </p>
            <p className={`text-[#555] ${textCls}`}>
              Our team will review your details and documents. Once approved, we will send you the
              Channel Partner Agreement to be franked or e-stamped, signed on each page with your
              company stamp and witnessed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-[36px] lg:mt-[3.125vw] flex flex-col gap-[44px] lg:gap-[3.125vw]">
            {/* Please read */}
            <ol className={`list-decimal pl-[20px] lg:pl-[1.25vw] flex flex-col gap-[6px] lg:gap-[0.417vw] text-[#555] ${textCls}`}>
              {PLEASE_READ.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>

            {/* RERA */}
            <Block title="RERA Registration">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[40px] lg:gap-x-[4.167vw] gap-y-[26px] lg:gap-y-[1.823vw]">
                {text("reraNumber", "RERA Registration No.*", { required: "Please enter your RERA registration number" })}
                {text("reraState", "State of RERA Registration*", { required: "Please enter the state you are registered in" })}
              </div>
            </Block>

            {/* Company details */}
            <Block title="Company Details">
              {text("entityName", "Company / Partnership / Individual Name*", {
                required: "Please enter the company, firm or individual name",
              })}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[40px] lg:gap-x-[4.167vw] gap-y-[26px] lg:gap-y-[1.823vw]">
                <FieldRow hasError={!!errors.contactName} errorMessage={errors.contactName?.message}>
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
                    placeholder="Contact Person Name*"
                    aria-invalid={!!errors.contactName || undefined}
                    className={inputCls}
                    {...register("contactName", { required: "Please enter the contact person's name" })}
                  />
                </FieldRow>

                <FieldRow hasError={!!errors.email} errorMessage={errors.email?.message}>
                  <input
                    type="email"
                    placeholder="Email ID*"
                    aria-invalid={!!errors.email || undefined}
                    className={inputCls}
                    {...register("email", {
                      required: "Please enter your email",
                      pattern: { value: EMAIL_RE, message: "Enter a valid email" },
                    })}
                  />
                </FieldRow>

                <FieldRow hasError={!!errors.primaryContact} errorMessage={errors.primaryContact?.message}>
                  <CountryCodeSelect
                    {...register("countryCode", {
                      onChange: () => getValues("primaryContact") && trigger("primaryContact"),
                    })}
                    className={`text-[#333] pb-[8px] lg:pb-[0.417vw] text-[14px] sm:text-[16px] lg:text-[1.042vw]`}
                  />
                  <input
                    type="tel"
                    placeholder="Primary Contact No.*"
                    aria-invalid={!!errors.primaryContact || undefined}
                    className={inputCls}
                    {...registerPhone(register, "primaryContact", () => getValues("countryCode"), {
                      required: "Please enter your contact number",
                    })}
                  />
                </FieldRow>

                <FieldRow hasError={!!errors.alternativeContact} errorMessage={errors.alternativeContact?.message}>
                  <CountryCodeSelect
                    {...register("altCountryCode", {
                      onChange: () => getValues("alternativeContact") && trigger("alternativeContact"),
                    })}
                    className={`text-[#333] pb-[8px] lg:pb-[0.417vw] text-[14px] sm:text-[16px] lg:text-[1.042vw]`}
                  />
                  <input
                    placeholder="Alternative Contact No."
                    aria-invalid={!!errors.alternativeContact || undefined}
                    className={inputCls}
                    {...registerPhone(register, "alternativeContact", () => getValues("altCountryCode"))}
                  />
                </FieldRow>

                {!isSoleProp && (
                  <FieldRow hasError={!!errors.dateOfIncorporation} errorMessage={errors.dateOfIncorporation?.message}>
                    <span className={`shrink-0 text-[#8a8a8a] pb-[8px] lg:pb-[0.417vw] ${textCls}`}>
                      Date of Incorporation*
                    </span>
                    <input
                      type="date"
                      max={new Date().toISOString().slice(0, 10)}
                      aria-invalid={!!errors.dateOfIncorporation || undefined}
                      className={`${inputCls} text-right`}
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
            </Block>

            {/* Addresses */}
            <Block title="Address">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_14vw] gap-x-[40px] lg:gap-x-[4.167vw] gap-y-[26px] lg:gap-y-[1.823vw]">
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
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_14vw] gap-x-[40px] lg:gap-x-[4.167vw] gap-y-[26px] lg:gap-y-[1.823vw]">
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
            </Block>

            {/* Nature of business + organisation type */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-x-[40px] lg:gap-x-[4.167vw] gap-y-[44px]">
              <Block title="Nature of Business*">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-[14px] lg:gap-y-[0.938vw] gap-x-[24px] lg:gap-x-[1.563vw]">
                  {NATURE_OF_BUSINESS.map((n) => (
                    <Choice
                      key={n}
                      label={n}
                      value={n}
                      {...register("natureOfBusiness", {
                        validate: (list) => (list && list.length > 0) || "Select at least one",
                      })}
                    />
                  ))}
                </div>
                {errors.natureOfBusiness && (
                  <span className="text-[#ef493d] text-[12px] lg:text-[0.729vw]">{errors.natureOfBusiness.message}</span>
                )}
              </Block>

              <Block title="Organisation Type*">
                <div className="flex flex-col gap-[14px] lg:gap-[0.938vw]">
                  {ORGANISATION_TYPES.map((o) => (
                    <Choice
                      key={o}
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
                  <span className="text-[#ef493d] text-[12px] lg:text-[0.729vw]">{errors.organisationType.message}</span>
                )}
              </Block>
            </div>

            {/* Memberships */}
            <Block title="Memberships">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[40px] lg:gap-x-[4.167vw] gap-y-[26px] lg:gap-y-[1.823vw]">
                {text("membershipNumber", "Membership Number, if any")}
                {text("associationName", "Member of any Association (Mention Name)")}
              </div>
            </Block>

            {/* Signatory and witness */}
            <Block title="Authorised Signatory & Witness">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[40px] lg:gap-x-[4.167vw] gap-y-[26px] lg:gap-y-[1.823vw]">
                {text("signatoryName", "Authorised Signatory Name*", {
                  required: "Please enter the authorised signatory's name",
                })}
                {text("signatoryDesignation", "Designation*", {
                  required: "Please enter the signatory's designation",
                })}
                {text("witnessName", "Witness Name*", { required: "Please enter a witness name" })}
                {area("witnessAddress", "Witness Address*", { required: "Please enter the witness's address" })}
              </div>
            </Block>

            {/* Documents */}
            <Block title="Documents">
              <p className={`text-[#555] -mt-[8px] ${textCls}`}>
                PDF, JPG or PNG, up to {MAX_FILE_MB}MB each.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[40px] lg:gap-x-[4.167vw] gap-y-[26px] lg:gap-y-[1.823vw]">
                {DOCUMENTS.map(fileField)}
              </div>
            </Block>

            {/* Declaration */}
            <Block title="Declaration">
              <div className="flex flex-col gap-[16px] lg:gap-[1.042vw]">
                <Choice
                  label={DECLARATION}
                  {...register("declarationAccepted", { required: "Please accept the declaration" })}
                />
                {errors.declarationAccepted && (
                  <span className="text-[#ef493d] text-[12px] lg:text-[0.729vw]">{errors.declarationAccepted.message}</span>
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
                  <span className="text-[#ef493d] text-[12px] lg:text-[0.729vw]">{errors.agreementAccepted.message}</span>
                )}
              </div>
            </Block>

            {submitError && (
              <p role="alert" className="text-[#ef493d] text-[13px] lg:text-[0.833vw] -mt-[16px]">
                {submitError}
              </p>
            )}

            {/* Submit — red outline with hover fill */}
            <button
              type="submit"
              disabled={submitting}
              className="group relative inline-flex items-center justify-center self-start
                         overflow-hidden border border-[#ef493d] bg-transparent
                         transition-[border-color] duration-500 ease-premium
                         disabled:opacity-60 disabled:cursor-not-allowed
                         w-[200px] sm:w-[224px] lg:w-[11.667vw]
                         h-[52px] sm:h-[58px] lg:h-[3.021vw]"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-bottom translate-y-full
                           group-hover:translate-y-0 transition-transform duration-500
                           ease-premium bg-[#ef493d]"
              />
              <span
                className="relative z-[1] capitalize text-[#ef493d] group-hover:text-white transition-colors duration-500
                           text-[15px] sm:text-[16px] lg:text-[0.938vw] tracking-[0.02em]"
              >
                {submitting ? "Submitting…" : "Submit Registration"}
              </span>
            </button>
          </form>
        )}
      </div>

      <AgreementTermsModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAccept={() => {
          setValue("agreementAccepted", true, { shouldValidate: true });
          setTermsOpen(false);
        }}
      />
    </section>
  );
}
