import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ChevronDown } from "lucide-react";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { submitLead } from "@/lib/strapi";
import SectionHeading from "@/components/common/SectionHeading";
import CountryCodeSelect, { DEFAULT_COUNTRY_CODE } from "@/components/common/CountryCodeSelect";

const CONFIG_OPTIONS = ["2 BHK", "2.5 BHK", "3 BHK", "Not Sure"];

const UnderlineField = React.forwardRef(function UnderlineField(
  { label, hasError, errorMessage, type = "text", prefix, ...inputProps },
  ref
) {
  return (
    <label className="flex flex-col gap-[14px] lg:gap-[1.302vw] w-full">
      <div className="flex items-center gap-[10px] lg:gap-[0.521vw] w-full">
        {prefix}
        <input
          ref={ref}
          type={type}
          placeholder={label}
          aria-invalid={hasError || undefined}
          className="flex-1 bg-transparent outline-none border-none text-[#333]
                     placeholder:text-[#333]
                     text-[15px] sm:text-[18px] lg:text-[1.094vw]
                     leading-[26px] sm:leading-[30px] lg:leading-[1.615vw]"
          style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
          {...inputProps}
        />
      </div>
      <div
        className={`h-px w-full ${
          hasError ? "bg-[#ef493d]" : "bg-[#33333322]"
        } transition-colors duration-300`}
      />
      {hasError && errorMessage ? (
        <span
          className="text-[#ef493d] -mt-[8px] lg:-mt-[0.521vw]
                     text-[12px] lg:text-[0.729vw]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {errorMessage}
        </span>
      ) : null}
    </label>
  );
});

export default function ProjectInquiry({
  sidebarLabel = "Transparency & Trust",
  heading = "Secure Your Future At Akrida",
  description = "We believe in complete regulatory compliance and open communication. Review our official registration details or reach out to our dedicated consultants to take the next step toward your new home.",
  address = "My Home Akrida, Nallagandla - Tellapur Rd, Tellapur Village, Ramachandrapuram, Tellapur, Nallagandla, Hyderabad, Telangana 502034",
  disclaimer = "Images are for representation only. Specifications and details are subject to change. Please refer to the sanctioned plans and MahaRERA website for accurate project information.",
  reraNumber = "P02400005741",
  reraUrl = "https://maharera.mahaonline.gov.in",
  qrSrc = "/assets/myhome/projects/akrida-qr.png",
  configOptions = CONFIG_OPTIONS,
  projectName,
}) {
  const router = useRouter();
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const descRef = useRef(null);
  const sidebarRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      countryCode: DEFAULT_COUNTRY_CODE,
      phone: "",
      email: "",
      configuration: "",
      message: "",
    },
    mode: "onBlur",
  });

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

      gsap.from([sidebarRef.current, descRef.current], {
        autoAlpha: 0,
        y: 24,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.1,
        delay: 0.15,
        scrollTrigger: trigger,
      });

      gsap.from([formRef.current, infoRef.current], {
        autoAlpha: 0,
        y: 40,
        duration: 1,
        stagger: 0.15,
        ease: "expo.out",
        delay: 0.3,
        scrollTrigger: trigger,
      });
    },
    { scope: rootRef }
  );

  const onSubmit = async (formValues) => {
    setSubmitting(true);
    setSuccess(false);
    const payload = {
      name: formValues.name,
      email: formValues.email,
      phone: `${formValues.countryCode || DEFAULT_COUNTRY_CODE} ${formValues.phone}`.trim(),
      // Tag the lead with the actual CMS project title when the parent
      // page passes it; falls back to the section heading otherwise so
      // local-dev rendering still gets a useful project label.
      project: projectName || heading || "Project Inquiry",
      message: [
        formValues.configuration && `Configuration: ${formValues.configuration}`,
        formValues.message,
      ]
        .filter(Boolean)
        .join("\n\n"),
      formSource: "Project Inquiry",
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
        setSuccess(true);
        reset();
        router.push("/thank-you");
      }
    } catch (e) {
      /* silent */
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white pt-[80px] pb-[80px] lg:pt-[4.688vw] lg:pb-[2.5vw] overflow-hidden"
      data-section="project-inquiry"
    >
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="flex absolute left-[12px] top-[30px] lg:left-[4.167vw] lg:top-[4.688vw] flex-col items-center gap-[8px] md:gap-[12px] lg:gap-[1.094vw] w-auto lg:w-[2.813vw] z-[5]"
        aria-hidden="true"
      >
        <span className="block w-px h-[28px] md:h-[36px] lg:h-[3.125vw] bg-[#ef493d]" />
        <span
          className="font-montserrat font-medium capitalize whitespace-nowrap text-[#ef493d] text-[12px] md:text-[14px] lg:text-[1.25vw]"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {sidebarLabel}
        </span>
      </div>

      <div className="px-5 md:px-12 lg:px-[9.74vw]">
        <SectionHeading
          ref={headingRef}
          className="capitalize text-[#333] leading-[1.08] tracking-[0.022em] text-center
                     text-[34px] xs:text-[38px] sm:text-[48px] md:text-[64px] lg:text-[5vw]"
        >
          {heading}
        </SectionHeading>
        <p
          ref={descRef}
          className="mx-auto mt-[14px] lg:mt-[0.729vw] max-w-[760px] lg:max-w-[53.49vw]
                     text-center text-[#333]
                     text-[14px] leading-[24px]
                     sm:text-[16px] sm:leading-[28px]
                     lg:text-[0.938vw] lg:leading-[1.563vw]"
          style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
        >
          {description}
        </p>

        {/* Form + info row */}
        <div className="mt-[40px] lg:mt-[3.125vw] grid grid-cols-1 lg:grid-cols-[31.771vw_1fr] gap-[40px] lg:gap-[8.281vw] items-start lg:divide-x lg:divide-[#33333322]">
          {/* Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-[28px] lg:gap-[2.344vw] w-full"
          >
            <UnderlineField
              label="Full Name*"
              hasError={!!errors.name}
              errorMessage="Please enter your name"
              {...register("name", { required: true, minLength: 2 })}
            />
            <UnderlineField
              label="Phone Number*"
              type="tel"
              hasError={!!errors.phone}
              errorMessage="Please enter a valid phone number"
              prefix={
                <CountryCodeSelect
                  {...register("countryCode")}
                  className="text-[#333] text-[15px] sm:text-[18px] lg:text-[1.094vw]"
                  style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
                />
              }
              {...register("phone", {
                required: true,
                pattern: /^[+0-9 ()-]{7,}$/,
              })}
            />
            <UnderlineField
              label="Email Address*"
              type="email"
              hasError={!!errors.email}
              errorMessage="Please enter a valid email"
              {...register("email", {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              })}
            />

            <label className="flex flex-col gap-[14px] lg:gap-[1.302vw] w-full">
              <div className="relative flex items-center">
                <select
                  aria-invalid={!!errors.configuration || undefined}
                  defaultValue=""
                  className={`appearance-none w-full bg-transparent outline-none border-none
                              ${errors.configuration ? "text-[#ef493d]" : "text-[#333]"}
                              text-[15px] sm:text-[18px] lg:text-[1.094vw]
                              leading-[26px] sm:leading-[30px] lg:leading-[1.615vw]
                              pr-[24px] cursor-pointer`}
                  style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
                  {...register("configuration", { required: true })}
                >
                  <option value="" disabled>
                    Interested Configuration*
                  </option>
                  {configOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-0 text-[#5f5f5f]
                             w-[16px] h-[16px] lg:w-[1.094vw] lg:h-[1.094vw]"
                />
              </div>
              <div
                className={`h-px w-full ${
                  errors.configuration ? "bg-[#ef493d]" : "bg-[#33333322]"
                } transition-colors duration-300`}
              />
              {errors.configuration ? (
                <span
                  className="text-[#ef493d] -mt-[8px] lg:-mt-[0.521vw]
                             text-[12px] lg:text-[0.729vw]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Please choose a configuration
                </span>
              ) : null}
            </label>

            <UnderlineField
              label="Message"
              hasError={false}
              {...register("message")}
            />

            <div className="flex items-center gap-[16px] lg:gap-[1.354vw] flex-wrap">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center
                           rounded-[2px] border border-[#ef493d] text-[#ef493d] capitalize
                           h-[48px] sm:h-[54px] lg:h-[3.021vw]
                           w-[180px] sm:w-[210px] lg:w-[11.667vw]
                           text-[14px] sm:text-[16px] lg:text-[0.938vw]
                           transition-colors duration-300
                           hover:bg-[#ef493d] hover:text-white
                           disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}
              >
                {submitting ? "Submitting..." : "Submit Inquiry"}
              </button>
              {success ? (
                <span
                  className="text-[#1a7a3a] text-[13px] lg:text-[0.833vw]"
                  style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}
                >
                  Thank you! We'll be in touch shortly.
                </span>
              ) : null}
            </div>
          </form>

          {/* Info column */}
          <div
            ref={infoRef}
            className="flex flex-col gap-[36px] lg:gap-[5.208vw] w-full lg:pl-[3.385vw]"
          >
            {(address || disclaimer) && (
              <div className="flex flex-col gap-[24px] lg:gap-[2.344vw]">
                {address && (
                  <p
                    className="text-[#333]
                           text-[15px] leading-[26px]
                           sm:text-[17px] sm:leading-[30px]
                           lg:text-[1.094vw] lg:leading-[1.823vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    <span style={{ fontWeight: 600 }}>Address:</span>{" "}
                    <span style={{ fontWeight: 400 }}>{address}</span>
                  </p>
                )}
                {disclaimer && (
                  <p
                    className="text-[#333]
                           text-[15px] leading-[26px]
                           sm:text-[17px] sm:leading-[30px]
                           lg:text-[1.094vw] lg:leading-[1.823vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    <span style={{ fontWeight: 600 }}>Disclaimer:</span>{" "}
                    <span style={{ fontWeight: 400 }}>{disclaimer}</span>
                  </p>
                )}
              </div>
            )}

            {/* RERA block — each piece (QR, number, link) is optional in the
                CMS, so render only the parts that actually have data. */}
            {(qrSrc || reraNumber || reraUrl) && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-[20px] sm:gap-[30px] lg:gap-[1.563vw]">
                {qrSrc && (
                  <div className="relative shrink-0 w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] lg:w-[10.625vw] lg:h-[10.833vw] bg-white">
                    <Image
                      src={qrSrc}
                      alt={
                        reraNumber ? `RERA QR code for ${reraNumber}` : "RERA QR code"
                      }
                      fill
                      unoptimized
                      sizes="180px"
                      className="object-contain object-left select-none"
                    />
                  </div>
                )}
                {(reraNumber || reraUrl) && (
                  <div className="flex flex-col gap-[4px] lg:gap-[0.156vw] min-w-0">
                    {reraNumber && (
                      <>
                        <p
                          className="text-[#333]
                             text-[15px] lg:text-[1.094vw] leading-[1.4]"
                          style={{
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: 600,
                          }}
                        >
                          MahaRERA No.:
                        </p>
                        <p
                          className="text-[#333]
                             text-[28px] sm:text-[36px] lg:text-[2.344vw] leading-[1.1]"
                          style={{
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: 700,
                          }}
                        >
                          {reraNumber}
                        </p>
                      </>
                    )}
                    {reraUrl && (
                      <Link
                        href={reraUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#333] hover:text-[#ef493d] transition-colors break-all
                             text-[13px] sm:text-[15px] lg:text-[1.094vw] leading-[1.4]"
                        style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        {reraUrl}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
