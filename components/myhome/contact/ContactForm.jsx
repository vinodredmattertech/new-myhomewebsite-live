import React, { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { ChevronDown } from "lucide-react";
import SectionLabel from "@/components/myhome/SectionLabel";
import { mediaUrl, submitLead } from "@/lib/strapi";

const DEFAULT_PROJECT_OPTIONS = ["Apas", "Akrida", "Avali", "Sayuk", "Tridasa", "Vipina", "Other"];

const UnderlineField = React.forwardRef(function UnderlineField(
  { label, hasError, errorMessage, dropdown = false, children, ...inputProps },
  ref
) {
  return (
    <label className="flex flex-col gap-[12px] lg:gap-[1.302vw] w-full">
      <div className="flex items-center justify-between w-full">
        {dropdown ? (
          <>{children}</>
        ) : (
          <input
            ref={ref}
            placeholder={label}
            aria-invalid={hasError || undefined}
            className={`flex-1 bg-transparent outline-none border-none
                        font-montserrat text-[#333] placeholder:text-[#333]
                        text-[14px] sm:text-[16px] md:text-[18px] lg:text-[1.094vw]
                        leading-[26px] sm:leading-[28px] md:leading-[30px] lg:leading-[1.614vw]
                        pb-[8px] lg:pb-[0.521vw]`}
            style={{ fontFamily: "Montserrat, sans-serif" }}
            {...inputProps}
          />
        )}
      </div>
      <div
        className={`h-px w-full ${
          hasError ? "bg-[#ef493d]" : "bg-[#33333322]"
        } transition-colors duration-300`}
      />
      {hasError && errorMessage && (
        <span
          className="font-montserrat text-[12px] lg:text-[0.729vw] text-[#ef493d] -mt-[6px] lg:-mt-[0.312vw]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {errorMessage}
        </span>
      )}
    </label>
  );
});

export default function ContactForm({ data }) {
  const PROJECT_OPTIONS =
    (data?.projectOptions || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) ||
    DEFAULT_PROJECT_OPTIONS;
  const formImage = mediaUrl(data?.image);
  const backgroundImage = mediaUrl(data?.backgroundImage);

  const router = useRouter();
  const rootRef = useRef(null);
  const headingRef = useRef(null);
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
      phone: "",
      email: "",
      project: "",
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

  if (!data) return null;

  const onSubmit = async (formValues) => {
    setSubmitting(true);
    setSuccess(false);
    const payload = {
      name: formValues.name,
      email: formValues.email,
      phone: formValues.phone,
      project: formValues.project || "",
      message: formValues.message || "",
      formSource: "Contact Us Page",
    };
    try {
      // Fire CRM push + Strapi lead capture in parallel. A successful CRM
      // POST is still treated as the canonical success signal so the user
      // flow doesn't change if Strapi happens to be down.
      const [crmRes] = await Promise.all([
        fetch("/api/pushToCRM", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            project_name: payload.project || "-",
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
      window.setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden
                 py-[60px] md:py-[80px] lg:pt-[2.343vw] lg:pb-[4.583vw]"
    >
      {/* full-section background image */}
      {backgroundImage && (
        <div className="absolute inset-0 -z-[1] pointer-events-none">
          <Image
            src={backgroundImage}
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="object-cover object-center select-none"
          />
        </div>
      )}

      {/* top divider — Figma 3511:3639 */}
      <div className="mx-auto h-px w-[calc(100%-40px)] sm:w-[calc(100%-64px)] lg:w-[89.896vw] bg-[#33333322]" />

      {/* vertical side label */}
      <div className="absolute left-[4.16vw] top-[6.25vw]">
        <SectionLabel>{data.label}</SectionLabel>
      </div>

      <div className="mt-[40px] md:mt-[64px] lg:mt-[2.604vw] px-5 md:px-10 lg:px-[9.375vw]">
        <h2
          ref={headingRef}
          className="text-[#333] capitalize text-center will-change-transform leading-[1.05] tracking-[0.02em]
                     text-[34px] xs:text-[40px] sm:text-[52px] md:text-[64px] lg:text-[5vw]"
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
            fontWeight: 300,
          }}
        >
          {data.heading}
        </h2>

        <div className="mt-[60px] md:mt-[56px] lg:mt-[3.385vw] grid grid-cols-1 lg:grid-cols-2 gap-y-[40px] gap-x-[40px] lg:gap-x-[10.208vw] items-center">
          {/* left: image */}
          <div className="relative w-full rounded-[10px] lg:rounded-[0.625vw] overflow-hidden
                          aspect-[734/653] lg:aspect-auto lg:h-[34vw]">
            {formImage && (
              <Image
                src={formImage}
                alt="Residents enjoying a My Home apartment living room"
                fill
                unoptimized
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover"
              />
            )}
          </div>

          {/* right: form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-[28px] md:gap-[36px] lg:gap-[2.343vw] w-full lg:w-[31.77vw]"
          >
            <UnderlineField
              label="Full Name*"
              type="text"
              hasError={!!errors.name}
              errorMessage={errors.name?.message}
              {...register("name", {
                required: "Please enter your full name",
                minLength: { value: 2, message: "Too short" },
              })}
            />

            <UnderlineField
              label="Phone Number*"
              type="tel"
              hasError={!!errors.phone}
              errorMessage={errors.phone?.message}
              {...register("phone", {
                required: "Please enter your phone number",
                pattern: {
                  value: /^[0-9+\-\s()]{7,15}$/,
                  message: "Enter a valid phone number",
                },
              })}
            />

            <UnderlineField
              label="Email Address*"
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

            <UnderlineField
              dropdown
              hasError={!!errors.project}
              errorMessage={errors.project?.message}
            >
              <div className="relative w-full">
                <select
                  defaultValue=""
                  aria-invalid={!!errors.project || undefined}
                  className="w-full appearance-none bg-transparent outline-none border-none
                             font-montserrat text-[#333]
                             text-[14px] sm:text-[16px] md:text-[18px] lg:text-[1.094vw]
                             leading-[26px] sm:leading-[28px] md:leading-[30px] lg:leading-[1.614vw]
                             pb-[8px] lg:pb-[0.521vw] pr-[28px] lg:pr-[1.5vw]
                             cursor-pointer"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                  {...register("project", { required: "Please select a project" })}
                >
                  <option value="" disabled className="text-[#333]">
                    Preferred Project*
                  </option>
                  {PROJECT_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2
                             text-[#5f5f5f]
                             w-[16px] h-[16px] lg:w-[0.938vw] lg:h-[0.938vw]"
                  strokeWidth={2}
                />
              </div>
            </UnderlineField>

            <UnderlineField
              label="Message"
              type="text"
              hasError={!!errors.message}
              errorMessage={errors.message?.message}
              {...register("message")}
            />

            <button
              type="submit"
              disabled={submitting}
              className="group relative inline-flex items-center justify-center
                         self-start whitespace-nowrap overflow-hidden
                         mt-[8px] lg:mt-[0.521vw]
                         border border-[#ef493d] bg-transparent
                         transition-[border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                         disabled:opacity-60 disabled:cursor-not-allowed
                         w-[190px] sm:w-[210px] lg:w-[11.667vw]
                         h-[48px] sm:h-[54px] lg:h-[3.02vw]
                         px-[18px] lg:px-[1.5vw]"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-bottom translate-y-full
                           group-hover:translate-y-0 transition-transform duration-500
                           ease-[cubic-bezier(0.22,1,0.36,1)] bg-[#ef493d]"
              />
              <span
                className="relative z-[1] font-montserrat font-medium capitalize
                           text-[#ef493d] group-hover:text-white transition-colors duration-500
                           text-[14px] sm:text-[15px] lg:text-[0.938vw] tracking-[0.02em]"
                style={{ fontFamily: "Outfit, Montserrat, sans-serif" }}
              >
                {submitting ? "Sending…" : success ? "Sent ✓" : data.submitText || "Send Message"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
