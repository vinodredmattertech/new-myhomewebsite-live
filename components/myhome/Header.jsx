import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, ScrollTrigger } from "@/lib/gsapSetup";

const NAV_ITEMS = [
  { label: "About Us", href: "#who-we-are" },
  { label: "Our Projects", href: "#featured" },
  { label: "Verticals", href: "#verticals" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Career", href: "#footer" },
  { label: "CSR", href: "#footer" },
  { label: "NRI", href: "#footer" },
  { label: "Blogs", href: "#footer" },
];

export default function MyHomeHeader() {
  const headerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useGSAP(() => {
    registerGsap();

    // Wait for hero loader to finish before sliding header in.
    gsap.set(headerRef.current, { yPercent: -110, autoAlpha: 0 });

    const slideIn = () => {
      gsap.to(headerRef.current, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 1.0,
        ease: "expo.out",
      });
    };

    // If no hero (other pages) or event missed, fall back to a delay.
    const fallback = window.setTimeout(slideIn, 4200);
    const onDone = () => {
      window.clearTimeout(fallback);
      slideIn();
    };
    window.addEventListener("mh:loader-done", onDone);

    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener("mh:loader-done", onDone);
      window.removeEventListener("scroll", onScroll);
    };
  });

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-[60] transition-all duration-500 ${
          scrolled
            ? "bg-[#2a2828]/85 backdrop-blur-md border-b border-white/10"
            : "bg-white/10 backdrop-blur-[6px] border-b border-white/30"
        }`}
      >
        <div className="relative h-[66px] md:h-[80px] lg:h-[5.77vw] flex items-center px-5 md:px-10 lg:px-[8.333vw]">
          {/* ===== Mobile (<md): logo LEFT, Menu RIGHT (matches Figma 3189:5437) ===== */}
          <Link href="/" className="md:hidden block">
            <Image
              src="/assets/myhome/logo.svg"
              alt="My Home Group"
              width={137}
              height={72}
              priority
              unoptimized
              className="w-[70px] h-auto select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            />
          </Link>

          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen(true)}
            className="md:hidden ml-auto group flex items-center gap-[12px] text-white"
          >
            <span className="relative flex flex-col gap-[4px] w-[24px] h-[14px] justify-center">
              <span className="block h-[1.5px] w-full bg-white transition-transform duration-500 group-hover:translate-y-[1px]" />
              <span className="block h-[1.5px] w-[70%] ml-auto bg-white transition-all duration-500 group-hover:w-full" />
              <span className="block h-[1.5px] w-full bg-white transition-transform duration-500 group-hover:-translate-y-[1px]" />
            </span>
            <span
              className="font-montserrat font-medium text-[16px] leading-[32px] tracking-wide"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Menu
            </span>
          </button>

          {/* ===== Desktop (md+): Menu LEFT, Logo CENTER, Contact RIGHT ===== */}
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen(true)}
            className="hidden md:flex group items-center gap-3 lg:gap-[0.781vw] text-white"
          >
            <span className="relative flex flex-col gap-[3px] w-[24px] lg:w-[1.459vw] h-[12px] justify-center">
              <span className="block h-[1.5px] w-full bg-white transition-transform duration-500 group-hover:translate-y-[1px]" />
              <span className="block h-[1.5px] w-[70%] bg-white transition-all duration-500 group-hover:w-full" />
              <span className="block h-[1.5px] w-full bg-white transition-transform duration-500 group-hover:-translate-y-[1px]" />
            </span>
            <span className="font-montserrat font-medium text-[16px] lg:text-[0.938vw] leading-none tracking-wide">
              Menu
            </span>
          </button>

          <Link
            href="/"
            className="hidden md:block absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
          >
            <Image
              src="/assets/myhome/logo.svg"
              alt="My Home Group"
              width={137}
              height={72}
              priority
              unoptimized
              className="w-[100px] lg:w-[7.135vw] h-auto select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            />
          </Link>

          <Link
            href="#footer"
            className="hidden md:inline-flex ml-auto items-center font-montserrat font-medium uppercase text-white text-[14px] lg:text-[0.833vw] tracking-[0.08em] relative group"
          >
            <span>Contact Us</span>
            <span className="ml-2 block w-0 h-px bg-white transition-all duration-500 group-hover:w-6" />
          </Link>
        </div>
      </header>

      {/* Slide-in mega menu */}
      <div
        className={`fixed inset-0 z-[80] pointer-events-none ${
          open ? "pointer-events-auto" : ""
        }`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black transition-opacity duration-500 ${
            open ? "opacity-60" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute top-0 left-0 h-full w-full sm:w-[440px] bg-[#2a2828] text-white transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-8 md:px-12 py-8">
            <Image
              src="/assets/myhome/logo.svg"
              alt="My Home Group"
              width={110}
              height={58}
              unoptimized
              className="h-auto w-[100px]"
            />
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center hover:bg-mh-red hover:border-mh-red transition-colors duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
          <nav className="px-8 md:px-12 py-6 flex flex-col gap-3">
            {NAV_ITEMS.map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="group inline-flex items-center justify-between border-b border-white/10 py-4 font-tartuffo text-[28px] md:text-[34px] capitalize tracking-wide hover:text-mh-red transition-colors duration-500"
                style={{
                  transitionDelay: open ? `${0.1 + i * 0.04}s` : "0s",
                  transform: open ? "translateX(0)" : "translateX(-30px)",
                  opacity: open ? 1 : 0,
                  transitionProperty: "opacity, transform, color",
                  transitionDuration: "0.7s",
                  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <span>{item.label}</span>
                <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">→</span>
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}
