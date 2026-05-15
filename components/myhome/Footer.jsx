import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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

const QUICK_LINKS = [
  { label: "About Us", href: "#who-we-are" },
  { label: "Our Projects", href: "#featured" },
  { label: "CSR", href: "#footer" },
  { label: "NRI", href: "#footer" },
  { label: "Channel Partner", href: "#footer" },
  { label: "Career", href: "#footer" },
  { label: "Blogs", href: "#footer" },
  { label: "Contact Us", href: "#footer" },
];

export default function MyHomeFooter() {
  const rootRef = useRef(null);
  const headingARef = useRef(null);
  const headingBRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", email: "", phone: "" },
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

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/pushToCRM", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          FormSource: "Website Footer",
          project_name: "-",
        }),
      });
      if (res.ok) {
        setSuccess(true);
        reset();
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
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-y-[40px] lg:gap-x-[7.604vw]
                   px-5 sm:px-8 lg:px-[8.333vw]"
      >
        {/* Left column */}
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
            Your Journey Starts With a Conversation
          </h2>
          <p
            className="normal-case font-montserrat font-normal text-white/85
                       text-[14px] md:text-[15px] lg:text-[0.833vw]
                       leading-[24px] md:leading-[28px] lg:leading-[1.667vw]
                       max-w-[700px] lg:w-[36.458vw] lg:max-w-none"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Our team walks alongside you — from first question to final key —
            making every step feel effortless, informed, and yours alone.
          </p>
        </div>

        {/* Right column — Form */}
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
            Let&apos;s get in touch
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-[45.756px] lg:gap-[3.906vw] mt-[18.302px] lg:mt-[1.563vw]"
            noValidate
          >
            <div className="flex flex-col gap-[36.605px] lg:gap-[3.125vw]">
              {/* Row 1: name + email */}
              <div className="grid grid-cols-2 gap-[18px] sm:gap-[24px] lg:gap-[4.375vw]">
                <FieldInput
                  placeholder="Your name"
                  type="text"
                  hasError={!!errors.name}
                  {...register("name", {
                    required: "Please enter your name",
                    minLength: { value: 2, message: "Too short" },
                  })}
                  errorMessage={errors.name?.message}
                />
                <FieldInput
                  placeholder="Your Email"
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

              {/* Row 2: phone (full width) */}
              <FieldInput
                placeholder="+91 |  Enter your number"
                type="tel"
                hasError={!!errors.phone}
                {...register("phone", {
                  required: "Please enter your phone number",
                  pattern: {
                    value: /^[0-9+\-\s()]{7,15}$/,
                    message: "Enter a valid phone number",
                  },
                })}
                errorMessage={errors.phone?.message}
              />
            </div>

            {/* Submit button
                Mobile (Figma 3189:5402): 165×51 outlined #ef493d, 18px Montserrat Medium white
                Desktop (Figma 3189:5398): 224×58 — lg:w-[11.667vw] lg:h-[3.02vw] */}
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
                {submitting ? "Submitting…" : success ? "Submitted ✓" : "Submit"}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* ============================================================
           BOTTOM — Logo + socials (left) | Address + Quick Links (right)
           Figma 3152:3578 / 3152:3592 / 3152:3633
         ============================================================ */}
      <div className="mt-[60px] lg:mt-[7.812vw] grid grid-cols-1 lg:grid-cols-12 gap-y-[40px] gap-x-[40px] px-5 sm:px-8 lg:px-[8.854vw]">
        {/* Logo + socials */}
        <div className="lg:col-span-4 flex flex-col gap-[28px] lg:gap-[2.343vw]">
          {/* Logo (Figma 3152:3579) — 276.743 × 146.039 = 14.413vw × 7.606vw */}
          <Link href="/" className="inline-block">
            <Image
              src="/assets/myhome/logo-footer.svg"
              alt="My Home Group"
              width={277}
              height={146}
              unoptimized
              className="w-[200px] sm:w-[220px] lg:w-[14.413vw] h-auto select-none"
            />
          </Link>

          {/* Social icons row (Figma 3152:3592) — gap:27.145, ~28×28 each */}
          <div className="flex items-center gap-[20px] sm:gap-[24px] lg:gap-[1.414vw] text-white/90">
            <a aria-label="Instagram" href="#" className="hover:text-[#ef493d] transition-colors duration-300">
              <Instagram className="w-[24px] h-[24px] lg:w-[1.473vw] lg:h-[1.473vw]" />
            </a>
            <a aria-label="Facebook" href="#" className="hover:text-[#ef493d] transition-colors duration-300">
              <Facebook className="w-[24px] h-[24px] lg:w-[1.473vw] lg:h-[1.473vw]" />
            </a>
            <a aria-label="LinkedIn" href="#" className="hover:text-[#ef493d] transition-colors duration-300">
              <Linkedin className="w-[24px] h-[24px] lg:w-[1.473vw] lg:h-[1.473vw]" />
            </a>
            <a aria-label="YouTube" href="#" className="hover:text-[#ef493d] transition-colors duration-300">
              <Youtube className="w-[28px] h-[28px] lg:w-[2.062vw] lg:h-[1.473vw]" />
            </a>
            <a aria-label="X (Twitter)" href="#" className="hover:text-[#ef493d] transition-colors duration-300">
              <Twitter className="w-[24px] h-[24px] lg:w-[1.414vw] lg:h-[1.473vw]" />
            </a>
          </div>
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
            Corporate address
          </h3>
          <ul className="flex flex-col gap-[12px] lg:gap-[0.625vw] font-montserrat font-normal text-white/90
                         text-[14px] md:text-[15px] lg:text-[0.833vw]
                         leading-[22px] md:leading-[26px] lg:leading-[1.667vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}>
            <li className="flex gap-3 lg:gap-[1.094vw]">
              <MapPin className="mt-1 lg:mt-[0.4vw] shrink-0 text-[#ef493d] w-[16px] h-[16px] lg:w-[0.833vw] lg:h-[0.833vw]" />
              <span className="lg:w-[18.49vw]">
                My Home Constructions Pvt. Ltd. H No 1-123, 8th Floor, 3rd Block, My Home Hub, HITEC City, Madhapur, Hyderabad — 500 081.
              </span>
            </li>
            <li className="flex gap-3 lg:gap-[1.094vw]">
              <Phone className="mt-1 lg:mt-[0.4vw] shrink-0 text-[#ef493d] w-[16px] h-[16px] lg:w-[0.833vw] lg:h-[0.833vw]" />
              <span className="lg:w-[17.55vw]">
                For Sales Enquiries:<br />
                <a href="tel:+919989555777" className="hover:text-white transition-colors">
                  +91 99895 55777 / +91 99895 55777
                </a>
              </span>
            </li>
            <li className="flex gap-3 lg:gap-[1.094vw]">
              <Mail className="mt-1 lg:mt-[0.4vw] shrink-0 text-[#ef493d] w-[16px] h-[16px] lg:w-[0.833vw] lg:h-[0.833vw]" />
              <span className="lg:w-[17.55vw]">
                Mail Us:<br />
                <a href="mailto:mktg@myhomeconstructions.com" className="hover:text-white transition-colors">
                  mktg@myhomeconstructions.com
                </a>
              </span>
            </li>
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
            Quick links
          </h3>
          <ul className="flex flex-col gap-[6px] lg:gap-[0.312vw] font-montserrat font-normal text-white/85
                         text-[14px] md:text-[15px] lg:text-[0.833vw]
                         leading-[26px] md:leading-[28px] lg:leading-[1.667vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}>
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
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
      <div className="mt-[60px] lg:mt-[6.25vw] px-5 sm:px-8 lg:px-[8.854vw]">
        <div className="h-px w-full bg-white/15" />
        {/* Copyright row — Figma 3152:3969 + 3152:3970
            Mobile: copyright left, "Created by Realatte™" right, both 12 Montserrat
            Desktop: same row, larger text */}
        <div className="mt-[20px] lg:mt-[2.083vw] flex flex-row items-center justify-between gap-[12px] sm:gap-[20px]">
          <p
            className="capitalize font-montserrat font-medium text-white/85
                       text-[11px] xs:text-[12px] md:text-[14px] lg:text-[0.938vw] tracking-[0.02em]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            © 2026 My Home Group . All Rights Reserved
          </p>
          <p
            className="font-montserrat font-normal text-white/75 whitespace-nowrap
                       text-[11px] xs:text-[12px] md:text-[14px] lg:text-[0.833vw]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Created by <span className="text-white font-medium">Realatte™</span>
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
