import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import {
  Mail,
  MapPin,
  Phone,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
} from "lucide-react";
import { getFooterData, mediaUrl, submitLead } from "@/lib/strapi";
import CountryCodeSelect, { DEFAULT_COUNTRY_CODE } from "@/components/common/CountryCodeSelect";

const SOCIAL_ICON_MAP = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
};

const CONTACT_ICON_MAP = {
  location: MapPin,
  phone: Phone,
  email: Mail,
};

/**
 * Footer — Figma node 3152:3554
 *
 * Top section: two-column layout (left = heading + intro, right = form)
 *   - Left:  "Your Journey Starts With a Conversation" 70 Tartuffo + body
 *   - Right: "Let's get in touch" 70 Tartuffo + 3 underline-only inputs +
 *            outlined Submit button (224×58).
 *
 * Bottom section:
 *   - Logo + social icons (Instagram, Facebook, LinkedIn, YouTube, X)
 *   - Corporate Address block (32 Tartuffo header + 3 contact rows)
 *   - Quick Links column (32 Tartuffo header + 8 links)
 *
 * Footer bar:
 *   - © 2026 My Home Group line + "Created by Realatte™"
 *
 * Form uses react-hook-form. Submit posts to /api/pushToCRM via the
 * existing useLeadStore wired up in pages/api.
 */

/* "Home" always leads the Quick Links column. Kept out of the list below and
   prepended at render time so it survives whatever the CMS quick-links list
   contains (or omits). */
const HOME_LINK = { label: "Home", href: "/" };

const FALLBACK_QUICK_LINKS = [
  { label: "About Us", href: "/about-us" },
  { label: "Our Projects", href: "/projects" },
  { label: "CSR", href: "/csr" },
  { label: "NRI", href: "/nri" },
  { label: "Channel Partner", href: "/channel-partners" },
  { label: "Careers", href: "/careers" },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact Us", href: "/contact-us" },
];

const FALLBACK_LOGO = "/assets/myhome/logo-footer.svg";

/* Legal pages sit on the copyright line rather than in Quick Links, so they
   stay put no matter how the CMS quick-links list is edited. */
const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
];

export default function MyHomeFooter() {
  const router = useRouter();
  const rootRef = useRef(null);
  const headingARef = useRef(null);
  const headingBRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // CMS-driven footer config. Fetched once on mount; falls back to the
  // hardcoded defaults below when Strapi is unreachable.
  const [cms, setCms] = useState(null);
  useEffect(() => {
    let alive = true;
    getFooterData().then((data) => {
      if (alive && data) setCms(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  const FORM_HEADING =
    cms?.formHeading || "Your Journey Starts With a Conversation";
  const FORM_INTRO =
    cms?.formIntro ||
    "Our team walks alongside you — from first question to final key — making every step feel effortless, informed, and yours alone.";
  const FORM_CTA_HEADING = cms?.formCtaHeading || "Let's get in touch";
  const SUBMIT_LABEL = cms?.submitLabel || "Submit";
  const SUBMITTING_LABEL = cms?.submittingLabel || "Submitting…";
  const SUCCESS_LABEL = cms?.successLabel || "Submitted ✓";
  const FORM_SOURCE = cms?.formSource || "Website Footer";
  const NAME_PLACEHOLDER = cms?.namePlaceholder || "Your Name";
  const EMAIL_PLACEHOLDER = cms?.emailPlaceholder || "Your Email";
  const PHONE_PLACEHOLDER = cms?.phonePlaceholder || "Phone Number";
  const ADDRESS_HEADING = cms?.addressHeading || "Corporate Address";
  const QUICK_LINKS_HEADING = cms?.quickLinksHeading || "Quick Links";
  const CMS_QUICK_LINKS =
    Array.isArray(cms?.quickLinks) && cms.quickLinks.length > 0
      ? cms.quickLinks.map((l) => ({
          label: l.label,
          href: l.href,
          openInNewTab: !!l.openInNewTab,
        }))
      : FALLBACK_QUICK_LINKS;
  // Home first, and drop any editor-added Home so the column never shows two
  // (the <li> key is the label, which would also collide).
  const QUICK_LINKS = [
    HOME_LINK,
    ...CMS_QUICK_LINKS.filter(
      (l) =>
        l.href !== HOME_LINK.href &&
        l.label?.trim().toLowerCase() !== HOME_LINK.label.toLowerCase()
    ),
  ];
  const CONTACT_ROWS = Array.isArray(cms?.contactRows) ? cms.contactRows : [];
  const SOCIALS = Array.isArray(cms?.socials) ? cms.socials : [];
  const LOGO = mediaUrl(cms?.logo) || FALLBACK_LOGO;
  const COPYRIGHT =
    cms?.copyrightText || "© 2026 My Home Group . All Rights Reserved";
  const CREDIT = cms?.creditText || "Created by Realatte™";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", email: "", countryCode: DEFAULT_COUNTRY_CODE, phone: "" },
    mode: "onBlur",
  });

  useGSAP(
    () => {
      registerGsap();
      [headingARef.current, headingBRef.current].forEach((node) => {
        if (!node) return;
        const words = splitToWords(node);
        gsap.from(words, {
          yPercent: 110,
          rotate: 3,
          duration: 1.0,
          stagger: 0.05,
          ease: "expo.out",
          scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
        });
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
      formSource: FORM_SOURCE,
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
            FormSource: payload.formSource,
            project_name: "-",
          }),
        }),
        submitLead(payload),
      ]);
      if (crmRes.ok) {
        setSuccess(true);
        reset();
        router.push("/thank-you");
      }
    } catch (err) {
      // silent — UI still resets after timeout
    } finally {
      setSubmitting(false);
      window.setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <footer
      ref={rootRef}
      id="footer"
      data-section="footer"
      className="relative w-full bg-[#2a2828] text-white overflow-hidden
                 pt-[64px] pb-[40px]
                 lg:pt-[6.718vw] lg:pb-[2.083vw]"
    >
      {/* ============================================================
           TOP — heading + body (left) + form (right) — Figma 3152:3555
           left:160 top:129 — flex horizontal gap:146 w:1600
           Left col w:700 gap:30 — heading 70 Tartuffo + body 16/32
           Right col w:754 gap:30 — heading 70 + inputs + submit
         ============================================================ */}
      {/* <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-y-[40px] lg:gap-x-[7.604vw]
                   px-5 sm:px-8 lg:px-[8.333vw]"
      >
     
        <div className="flex flex-col gap-[20px] lg:gap-[1.563vw] capitalize">
          <h2
            ref={headingARef}
            className="text-white tracking-[2px] lg:tracking-[2.1px]
                       leading-[1.2] lg:leading-[5.208vw]
                       text-[35px] sm:text-[44px] md:text-[56px] lg:text-[3.646vw]
                       will-change-transform"
            style={{
              fontFamily:
                '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
              fontWeight: 400,
            }}
          >
            {FORM_HEADING}
          </h2>
          <p
            className="normal-case font-montserrat font-normal text-white/85
                       text-[14px] md:text-[15px] lg:text-[0.833vw]
                       leading-[24px] md:leading-[28px] lg:leading-[1.667vw]
                       max-w-[700px] lg:w-[36.458vw] lg:max-w-none"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {FORM_INTRO}
          </p>
        </div>

        
        <div className="flex flex-col gap-[20px] lg:gap-[1.563vw]">
          <h2
            ref={headingBRef}
            className="capitalize text-white tracking-[1.2812px] lg:tracking-[2.1px]
                       leading-[61.008px] lg:leading-[5.208vw]
                       text-[42.706px] lg:text-[3.646vw]
                       will-change-transform"
            style={{
              fontFamily:
                '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
              fontWeight: 400,
            }}
          >
            {FORM_CTA_HEADING}
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-[45.756px] lg:gap-[3.906vw] mt-[18.302px] lg:mt-[1.563vw]"
            noValidate
          >
            <div className="flex flex-col gap-[36.605px] lg:gap-[3.125vw]">
             
              <div className="grid grid-cols-2 gap-[18px] sm:gap-[24px] lg:gap-[4.375vw]">
                <FieldInput
                  placeholder={NAME_PLACEHOLDER}
                  type="text"
                  hasError={!!errors.name}
                  {...register("name", {
                    required: "Please enter your name",
                    minLength: { value: 2, message: "Too short" },
                  })}
                  errorMessage={errors.name?.message}
                />
                <FieldInput
                  placeholder={EMAIL_PLACEHOLDER}
                  type="email"
                  hasError={!!errors.email}
                  {...register("email", {
                    required: "Please enter your email",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email",
                    },
                  })}
                  errorMessage={errors.email?.message}
                />
              </div>

             
              <label className="block w-full">
                <div
                  className={`flex items-center gap-[8px] lg:gap-[0.417vw] w-full
                              border-b border-solid transition-colors duration-300
                              h-[37px] md:h-[48px] lg:h-[3.125vw]
                              ${errors.phone ? "border-[#ef493d]" : "border-white/85 focus-within:border-white"}`}
                >
                  <CountryCodeSelect
                    {...register("countryCode")}
                    className="text-white text-[11px] md:text-[14px] lg:text-[0.938vw] pl-[7px] lg:pl-[0.625vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  />
                  <input
                    type="tel"
                    placeholder={PHONE_PLACEHOLDER}
                    aria-invalid={!!errors.phone || undefined}
                    className="flex-1 min-w-0 bg-transparent border-none outline-none
                               text-white placeholder:text-white/65
                               text-[11px] md:text-[14px] lg:text-[0.938vw]
                               pr-[8px] pt-[8px] pb-[8px] lg:pt-[12px] lg:pb-[12px]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                    {...register("phone", {
                      required: "Please enter your phone number",
                      pattern: {
                        value: /^[0-9+\-\s()]{7,15}$/,
                        message: "Enter a valid phone number",
                      },
                    })}
                  />
                </div>
                {errors.phone && (
                  <span
                    className="mt-1 block font-montserrat text-[12px] text-[#ef493d]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {errors.phone.message}
                  </span>
                )}
              </label>
            </div>

            
            <button
              type="submit"
              disabled={submitting}
              className="group relative inline-flex items-center justify-center self-start
                         whitespace-nowrap overflow-hidden
                         w-[165px] h-[51px]
                         lg:w-[11.667vw] lg:h-[3.02vw]
                         border border-[#ef493d]
                         transition-[border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-bottom translate-y-full
                           group-hover:translate-y-0 transition-transform duration-500
                           ease-[cubic-bezier(0.22,1,0.36,1)] bg-[#ef493d]"
              />
              <span
                className="relative z-[1] font-montserrat font-medium capitalize
                           text-[18px] lg:text-[0.938vw] tracking-[0.04em]
                           text-white transition-colors duration-500"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {submitting ? SUBMITTING_LABEL : success ? SUCCESS_LABEL : SUBMIT_LABEL}
              </span>
            </button>
          </form>
        </div>
      </div> */}

      {/* ============================================================
           BOTTOM — Logo + socials (left) | Address + Quick Links (right)
           Figma 3152:3578 / 3152:3592 / 3152:3633
         ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-[40px] gap-x-[40px] px-5 sm:px-8 lg:px-[8.854vw]">
        {/* Logo + socials */}
        <div className="lg:col-span-4 flex flex-col gap-[28px] lg:gap-[2.343vw]">
          {/* Logo (Figma 3152:3579) — 276.743 × 146.039 = 14.413vw × 7.606vw */}
          <Link href="/" className="inline-block">
            <Image
              src={LOGO}
              alt="My Home Group"
              width={277}
              height={146}
              unoptimized
              className="w-[200px] sm:w-[220px] lg:w-[14.413vw] h-auto select-none"
            />
          </Link>

          {/* Social icons row — driven by CMS `socials` list. Falls back
              to an empty row when no socials are set. */}
          {SOCIALS.length > 0 && (
            <div className="flex items-center gap-[20px] sm:gap-[24px] lg:gap-[1.414vw] text-white/90">
              {SOCIALS.map((s, i) => {
                const Icon = SOCIAL_ICON_MAP[s.platform];
                if (!Icon || !s.href) return null;
                return (
                  <a
                    key={`${s.platform}-${i}`}
                    aria-label={s.label || s.platform}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#ef493d] transition-colors duration-300"
                  >
                    <Icon className="w-[24px] h-[24px] lg:w-[1.473vw] lg:h-[1.473vw]" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Corporate Address (Figma 3152:3634) — w:426 */}
        <div className="lg:col-span-5 flex flex-col gap-[20px] lg:gap-[1.302vw]">
          <h3
            className="capitalize text-white
                       text-[22px] sm:text-[26px] lg:text-[1.667vw]
                       leading-[1.2] lg:leading-[normal]"
            style={{
              fontFamily:
                '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
              fontWeight: 400,
            }}
          >
            {ADDRESS_HEADING}
          </h3>
          <ul className="flex flex-col gap-[12px] lg:gap-[0.625vw] font-montserrat font-normal text-white/90
                         text-[14px] md:text-[15px] lg:text-[0.833vw]
                         leading-[22px] md:leading-[26px] lg:leading-[1.667vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}>
            {CONTACT_ROWS.map((row, i) => {
              const Icon = CONTACT_ICON_MAP[row.kind] || MapPin;
              return (
                <li key={`row-${i}`} className="flex gap-3 lg:gap-[1.094vw]">
                  <Icon className="mt-1 lg:mt-[0.4vw] shrink-0 text-[#ef493d] w-[16px] h-[16px] lg:w-[0.833vw] lg:h-[0.833vw]" />
                  <span className="lg:w-[18.49vw]">
                    {row.label ? (
                      <>
                        {row.label}
                        <br />
                      </>
                    ) : null}
                    {row.href ? (
                      <a href={row.href} className="hover:text-white transition-colors">
                        {row.body}
                      </a>
                    ) : (
                      <span>{row.body}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Quick Links (Figma 3152:3646) — w:153, 8 items */}
        <div className="lg:col-span-3 flex flex-col gap-[20px] lg:gap-[1.302vw]">
          <h3
            className="capitalize text-white
                       text-[22px] sm:text-[26px] lg:text-[1.667vw]
                       leading-[1.2] lg:leading-[normal]"
            style={{
              fontFamily:
                '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
              fontWeight: 400,
            }}
          >
            {QUICK_LINKS_HEADING}
          </h3>
          <ul className="flex flex-col gap-[6px] lg:gap-[0.312vw] font-montserrat font-normal text-white/85
                         text-[14px] md:text-[15px] lg:text-[0.833vw]
                         leading-[26px] md:leading-[28px] lg:leading-[1.667vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}>
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  target={link.openInNewTab ? "_blank" : undefined}
                  rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                  className="relative inline-block hover:text-[#ef493d] transition-colors duration-300
                             after:content-[''] after:absolute after:left-0 after:-bottom-0.5
                             after:w-0 after:h-px after:bg-[#ef493d] after:transition-all
                             hover:after:w-full"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ============================================================
           Footer bar — divider + copyright row (Figma 3152:3657)
           top:1103.35 — w:1640 divider centered, h:64 content gap:40
         ============================================================ */}
      <div className="mt-[60px] lg:mt-[4.25vw] px-5 sm:px-8 lg:px-[8.854vw]">
        <div className="h-px w-full bg-white/15" />
        {/* Copyright row — Figma 3152:3969 + 3152:3970
            Mobile: copyright + legal links stacked above "Created by Realatte™"
            Desktop: copyright & legal links left, credit right */}
        <div
          className="mt-[20px] lg:mt-[2.083vw] flex flex-col gap-[10px]
                     sm:flex-row sm:items-center sm:justify-between sm:gap-[20px]"
        >
          <div className="flex flex-wrap items-center gap-x-[10px] gap-y-[6px] lg:gap-x-[0.833vw]">
            <p
              className="capitalize font-montserrat font-medium text-white/85
                         text-[11px] xs:text-[12px] md:text-[14px] lg:text-[0.938vw] tracking-[0.02em]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {COPYRIGHT}
            </p>
            {LEGAL_LINKS.map((link) => (
              <React.Fragment key={link.href}>
                <span
                  className="h-[11px] w-px bg-white/30 lg:h-[0.729vw]"
                  aria-hidden="true"
                />
                <Link
                  href={link.href}
                  className="capitalize font-montserrat font-medium text-white/85 whitespace-nowrap
                             hover:text-[#ef493d] transition-colors
                             text-[11px] xs:text-[12px] md:text-[14px] lg:text-[0.938vw] tracking-[0.02em]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {link.label}
                </Link>
              </React.Fragment>
            ))}
          </div>
          <p
            className="font-montserrat font-normal text-white/75 whitespace-nowrap
                       text-[11px] xs:text-[12px] md:text-[14px] lg:text-[0.833vw]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {CREDIT}
          </p>
        </div>
      </div>
    </footer>
  );
}

/**
 * Underline-only input — Figma 3152:3564
 * h:60 with bottom border, 18px placeholder white.
 * Wraps react-hook-form's `register` ref via forwardRef.
 */
const FieldInput = React.forwardRef(function FieldInput(
  { placeholder, type = "text", hasError, errorMessage, ...inputProps },
  ref
) {
  return (
    <label className="block w-full">
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        aria-invalid={hasError || undefined}
        className={`w-full bg-transparent
                    border-b border-solid outline-none
                    text-white placeholder:text-white/65
                    text-[11px] md:text-[14px] lg:text-[0.938vw]
                    h-[37px] md:h-[48px] lg:h-[3.125vw]
                    pl-[7px] lg:pl-[0.625vw] pr-[8px]
                    pt-[8px] pb-[8px] lg:pt-[12px] lg:pb-[12px]
                    transition-colors duration-300
                    ${hasError ? "border-[#ef493d]" : "border-white/85 focus:border-white"}`}
        style={{ fontFamily: "Montserrat, sans-serif" }}
        {...inputProps}
      />
      {hasError && errorMessage && (
        <span className="mt-1 block font-montserrat text-[12px] text-[#ef493d]"
              style={{ fontFamily: "Montserrat, sans-serif" }}>
          {errorMessage}
        </span>
      )}
    </label>
  );
});
