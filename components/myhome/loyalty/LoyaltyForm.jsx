import React, { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import SectionLabel from "@/components/myhome/SectionLabel";
import { submitLoyaltyApplication } from "@/lib/strapi";
import SectionHeading from "@/components/common/SectionHeading";
import CountryCodeSelect, { DEFAULT_COUNTRY_CODE } from "@/components/common/CountryCodeSelect";
import { dialCodeFor, registerPhone } from "@/lib/phone";
import { pushToCRM } from "@/lib/crm";
import ConsentNote from "@/components/common/ConsentNote";

const TARTUFFO =
  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif';

/** Underline input — Montserrat 21px label/placeholder on a thin rule. */
const Field = React.forwardRef(function Field(
  { label, hasError, errorMessage, prefix, ...inputProps },
  ref
) {
  return (
    <label className="flex flex-col gap-[12px] lg:gap-[1.042vw] w-full">
      <div className="flex items-center gap-[10px] lg:gap-[0.521vw] w-full">
        {prefix}
        <input
          ref={ref}
          placeholder={label}
          aria-invalid={hasError || undefined}
          className="w-full bg-transparent outline-none border-none
                     font-montserrat text-[#333] placeholder:text-[#333]
                     text-[16px] sm:text-[18px] lg:text-[1.094vw]
                     leading-[26px] lg:leading-[1.615vw] pb-[8px] lg:pb-[0.521vw]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
          {...inputProps}
        />
      </div>
      <div
        className={`h-px w-full ${
          hasError ? "bg-[#ef493d]" : "bg-[#33333333]"
        } transition-colors duration-300`}
      />
      {hasError && errorMessage && (
        <span
          className="font-montserrat text-[12px] lg:text-[0.729vw] text-[#ef493d] -mt-[4px]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {errorMessage}
        </span>
      )}
    </label>
  );
});

/**
 * "Unlock Your Privileges" — loyalty enrolment form over a faded
 * networking-event backdrop. The form UI is fixed in the frontend; on submit
 * every field is persisted to Strapi as a Loyalty Application.
 * vw sizing on desktop, px on small screens.
 */
export default function LoyaltyForm({
  label = "Join The Programme",
  heading = "Unlock Your Privileges",
  background = "/assets/myhome/loyalty/form-bg.jpg",
  submitText = "Submit",
}) {
  const router = useRouter();
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    getValues,
    trigger,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      countryCode: DEFAULT_COUNTRY_CODE,
      phone: "",
      email: "",
      city: "",
      project: "",
      apartment: "",
      customerId: "",
      message: "",
    },
    mode: "onBlur",
  });

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

  const onSubmit = async (v) => {
    setSubmitting(true);

    // Every field is captured individually so the full application is stored
    // in Strapi (not flattened into a single message blob).
    const application = {
      name: v.name,
      email: v.email,
      mobile: `${dialCodeFor(v.countryCode)} ${v.phone}`.trim(),
      city: v.city || "",
      project: v.project || "",
      apartmentUnit: v.apartment || "",
      customerBookingId: v.customerId || "",
      message: v.message || "",
      formSource: "Loyalty Programme Page",
    };

    // Keep the existing CRM push for parity with the other site forms; the
    // CRM message stays a readable summary of the extra fields.
    const crmMessage = [
      v.message,
      v.city && `City: ${v.city}`,
      v.apartment && `Apartment/Unit: ${v.apartment}`,
      v.customerId && `Customer/Booking ID: ${v.customerId}`,
    ]
      .filter(Boolean)
      .join(" | ");

    try {
      const [crmRes] = await Promise.all([
        pushToCRM({
          name: application.name,
          email: application.email,
          phone: application.mobile,
          project_name: application.project || "-",
          message: crmMessage,
          FormSource: application.formSource,
        }),
        // Persist the full submission in Strapi (every field as its own column).
        submitLoyaltyApplication(application),
      ]);
      if (crmRes.ok) {
        reset();
        router.push("/thank-you");
      }
    } catch (e) {
      /* silent */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      ref={rootRef}
      className="relative w-full overflow-hidden bg-white
                 py-[60px] md:py-[90px] lg:py-[7.5vw]"
    >
      {/* faded backdrop */}
      <div className="absolute inset-0 -z-0">
        {background && (
          <Image
            src={background}
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="object-cover object-center opacity-[0.18]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/70" />
      </div>

      {/* vertical side label */}
      <div className="lg:block lg:absolute left-[4.167vw] top-[6.25vw] z-[2] max-lg:static max-lg:w-full max-lg:flex max-lg:justify-center max-lg:mt-[15px] max-lg:mb-[18px]">
        <SectionLabel>{label}</SectionLabel>
      </div>

      <div className="relative z-[1] px-5 md:px-12 lg:px-[15.625vw]">
        <SectionHeading
          ref={headingRef}
          className="text-[#333] capitalize text-center will-change-transform leading-[1.05] tracking-[0.021em]
                     text-[38px] xs:text-[44px] sm:text-[56px] md:text-[72px] lg:text-[5vw]"
        >
          {heading}
        </SectionHeading>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-[44px] md:mt-[64px] lg:mt-[3.646vw]
                     grid grid-cols-1 lg:grid-cols-2
                     gap-x-[40px] lg:gap-x-[5.208vw]
                     gap-y-[36px] lg:gap-y-[4.167vw]"
        >
          <Field
            label="Full Name"
            type="text"
            hasError={!!errors.name}
            errorMessage={errors.name?.message}
            {...register("name", { required: "Please enter your full name" })}
          />
          <Field
            label="Mobile Number"
            type="tel"
            hasError={!!errors.phone}
            errorMessage={errors.phone?.message}
            prefix={
              <CountryCodeSelect
                {...register("countryCode", {
                  onChange: () => getValues("phone") && trigger("phone"),
                })}
                className="font-montserrat text-[#333] pb-[8px] lg:pb-[0.521vw]
                           text-[16px] sm:text-[18px] lg:text-[1.094vw]"
              />
            }
            {...registerPhone(register, "phone", () => getValues("countryCode"), {
              required: "Please enter your mobile number",
            })}
          />
          <Field
            label="Email Address"
            type="email"
            hasError={!!errors.email}
            errorMessage={errors.email?.message}
            {...register("email", {
              required: "Please enter your email",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email",
              },
            })}
          />
          <Field label="City" type="text" {...register("city")} />
          <Field label="Project Name" type="text" {...register("project")} />
          <Field
            label="Apartment / Unit Number"
            type="text"
            {...register("apartment")}
          />
          <Field
            label="Customer ID / Booking ID"
            type="text"
            {...register("customerId")}
          />
          <Field label="Message" type="text" {...register("message")} />

          <ConsentNote className="lg:col-span-2" />

          {/* submit — red outline with hover fill */}
          <div className="lg:col-span-2 mt-[8px] lg:mt-[1.302vw]">
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
                className="relative z-[1] font-montserrat capitalize
                           text-[#ef493d] group-hover:text-white transition-colors duration-500
                           text-[15px] sm:text-[16px] lg:text-[0.938vw] tracking-[0.02em]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {submitting ? "Submitting…" : submitText}
              </span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
