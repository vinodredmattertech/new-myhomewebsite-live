"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import { useGSAP } from "@gsap/react";

const PageLoader = ({ onComplete }) => {
  const loaderRef = useRef(null);
  const tlRef = useRef(null);

  const slide1 = useRef(null);
  const slide2 = useRef(null);
  const subText = useRef(null);
  const slide3 = useRef(null);
  const slide4 = useRef(null);

  /* ----------------------------------------------------
     Lock native scroll while loader is active
  ---------------------------------------------------- */
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  /* ----------------------------------------------------
     GSAP timeline (text transitions + stay on last slide)
  ---------------------------------------------------- */
  useGSAP(() => {
    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
    });

    tlRef.current = tl;

    // initial states
    gsap.set(slide2.current, {
      autoAlpha: 0,
      y: 30,
      filter: "blur(6px)",
    });

    gsap.set(subText.current, {
      autoAlpha: 0,
      y: 20,
    });

    // show main heading
    tl.to(slide2.current, {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.8,
    });

    // wait
    tl.to({}, { duration: 1 });

    // reveal bottom text
    tl.to(subText.current, {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
    });

    // stay
    tl.to({}, { duration: 2 });

    // exit loader
    tl.to(loaderRef.current, {
      yPercent: -100,
      duration: 1.8,
      ease: "power4.inOut",
      onComplete: () => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });

        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";

        if ("scrollRestoration" in window.history) {
          window.history.scrollRestoration = "auto";
        }

        onComplete?.();
      },
    });
  }, []);

  /* ----------------------------------------------------
     Exit loader (same behavior as SVG loader)
  ---------------------------------------------------- */
  const handleExplore = () => {
    tlRef.current?.kill();

    gsap.to(loaderRef.current, {
      yPercent: -100,
      duration: 1.8,
      ease: "power4.inOut",
      onComplete: () => {
        // ✅ force top FIRST
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });

        // ✅ then unlock scroll
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";

        // optional: restore auto behavior later
        if ("scrollRestoration" in window.history) {
          window.history.scrollRestoration = "auto";
        }

        onComplete?.();
      },
    });
  };

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[9999] bg-[#F9F7F4] flex items-center justify-center overflow-hidden"
    >
      {/* Left Shape */}
      <div className="absolute left-0 bottom-0 lg:h-[40.635vw] h-[40vh]">
        <Image
          src="/icons/left21.svg"
          alt="left shape"
          width={1000}
          height={1000}
          className="w-full h-full"
        />
      </div>

      {/* Right Shape */}
      <div className="absolute right-0 bottom-0 lg:h-[40.635vw] h-[40vh]">
        <Image
          src="/icons/left22.svg"
          alt="right shape"
          width={1000}
          height={1000}
          className="w-full h-full"
        />
      </div>

      {/* Rotated GIF */}
      <div className="absolute left-[10%] lg:top-[40%] top-[60%] z-10 -rotate-90 mix-blend-multiply">
        <Image
          src="/icons/bf.gif"
          alt="decor"
          width={1000}
          height={1000}
          className="lg:h-[7.229vw] h-[80px] w-auto"
        />
      </div>

      <div
        ref={slide2}
        className="absolute text-center px-6 mx-auto lg:max-w-[50vw] max-w-[80%]"
      >
        <h3 className="PPEditorialOld italic text-[#b08a57] md:text-[5.208vw] text-[40px]">
          Pristine Crafting Pune’s Legacy
        </h3>

        <div
          ref={subText}
          className="flex items-center justify-center gap-4 mt-4"
        >
          <div className="w-[30%] h-px bg-gradient-to-l from-[#5F5F5F] to-transparent opacity-50" />
          <span className="whitespace-nowrap lg:text-[1.823vw] flex-[30%] Avenir tracking-wide text-[#5F5F5F]">
            40 Years of Excellence
          </span>
          <div className="w-[30%] h-px bg-gradient-to-r from-[#5F5F5F] to-transparent opacity-50" />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
