import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, A11y } from "swiper/modules";
import "swiper/css";
import { ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import SectionLabel from "@/components/myhome/SectionLabel";

const PROJECTS = [
  {
    title: "My Home Krishe",
    location: "Nallagandla, Hyderabad",
    image: "/assets/myhome/nri/project-1.jpg",
    href: "/projects/my-home-krishe",
  },
  {
    title: "My Home 99",
    location: "Nallagandla, Hyderabad",
    image: "/assets/myhome/nri/hyderabad-1.jpg",
    href: "/projects/my-home-99",
  },
  {
    title: "My Home Avatar",
    location: "Narsingi, Hyderabad",
    image: "/assets/myhome/nri/hyderabad-5.jpg",
    href: "/projects/my-home-avatar",
  },
  {
    title: "My Home Vihanga",
    location: "Gachibowli, Hyderabad",
    image: "/assets/myhome/nri/hyderabad-2.jpg",
    href: "/projects/my-home-vihanga",
  },
];

function ProjectCard({ title, location, image, href }) {
  return (
    <Link
      href={href}
      className="group relative block w-full overflow-hidden rounded-[10px] lg:rounded-[0.625vw]
                 bg-white border border-[rgba(43,43,43,0.14)]"
    >
      <div className="relative w-full aspect-[488/488] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width:1024px) 28vw, (min-width:640px) 50vw, 90vw"
          className="object-cover object-center select-none transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
        />
      </div>
      <div className="flex items-center justify-between px-[18px] md:px-[24px] lg:px-[1.25vw] py-[20px] md:py-[24px] lg:py-[1.302vw]">
        <div className="flex flex-col gap-[6px] lg:gap-[0.312vw]">
          <h3
            className="text-[#e31f24] leading-[1.2] tracking-[0.03em]
                       text-[20px] sm:text-[24px] md:text-[26px] lg:text-[1.458vw]"
            style={{
              fontFamily:
                '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
              fontWeight: 300,
            }}
          >
            {title}
          </h3>
          <p
            className="font-montserrat font-light text-[#2b2b2b]
                       text-[13px] sm:text-[14px] md:text-[16px] lg:text-[0.938vw]
                       leading-[1.5]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {location}
          </p>
        </div>
        <span
          className="inline-flex items-center justify-center shrink-0 rounded-full bg-white
                     border-[0.896px] border-[#e31f24] text-[#e31f24]
                     w-[44px] h-[44px] md:w-[48px] md:h-[48px] lg:w-[2.604vw] lg:h-[2.604vw]
                     transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                     group-hover:bg-[#e31f24] group-hover:text-white"
        >
          <ArrowUpRight className="w-[14px] h-[14px] md:w-[16px] md:h-[16px] lg:w-[0.833vw] lg:h-[0.833vw]" />
        </span>
      </div>
    </Link>
  );
}

export default function NriFeaturedProjects() {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const subRef = useRef(null);
  const swiperRef = useRef(null);

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
      gsap.from(subRef.current, {
        y: 24,
        autoAlpha: 0,
        duration: 0.9,
        ease: "expo.out",
        delay: 0.2,
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden
                 py-[60px] md:py-[80px] lg:pt-[4.687vw] lg:pb-[5.208vw]"
      data-section="nri-featured-projects"
    >
      <div className="absolute left-[4.16vw] top-[4.687vw] hidden lg:block">
        <SectionLabel>Featured Projects</SectionLabel>
      </div>

      {/* Top: left heading + right (cards begin below on mobile) */}
      <div
        className="px-5 md:px-10 lg:pl-[13.59vw] lg:pr-[8.333vw]
                   grid grid-cols-1 lg:grid-cols-12 gap-y-[20px] gap-x-[40px] lg:gap-x-[3.125vw] items-start"
      >
        <div className="lg:col-span-5 flex flex-col lg:relative lg:z-[10]">
          <h2
            ref={headingRef}
            className="text-[#333] capitalize will-change-transform leading-[1.05] tracking-[0.02em]
                       text-[32px] xs:text-[40px] sm:text-[52px] md:text-[64px] lg:text-[5vw]"
            style={{
              fontFamily:
                '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
              fontWeight: 300,
            }}
          >
            Curated Addresses for Global Indians
          </h2>
          <p
            ref={subRef}
            className="font-montserrat font-normal text-[#6d6d6d] text-justify
                       mt-[20px] md:mt-[28px] lg:mt-[1.875vw]
                       text-[14px] sm:text-[15px] md:text-[16px] lg:text-[0.938vw]
                       leading-[24px] sm:leading-[26px] md:leading-[28px] lg:leading-[1.563vw]
                       max-w-[520px] lg:max-w-[26.197vw]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Explore landmark My Home communities crafted for modern living, long-term value, and a meaningful connection to Hyderabad.
          </p>
        </div>

        {/* Cards swiper on the right */}
        <div className="lg:col-span-7 w-full relative lg:z-[1]">
          {/* Left-edge mask overlay.
              The swiper uses `!overflow-visible` so its cards can render
              outside the column bounds for a clean continuous slide feel.
              This solid-white div sits at the column's LEFT edge, extending
              leftward, at z-[5] — above the swiper cards (z-auto inside the
              swiper column at z-[1]) but BELOW the heading column (z-[10]).
              Cards animating in/out pass behind it and are visually hidden,
              while the heading text remains visible on top. */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute right-full top-[-20px] bottom-[-20px]
                       w-[60vw] bg-white z-[5] pointer-events-none"
          />

          <Swiper
            modules={[Keyboard, A11y]}
            slidesPerView={1.05}
            spaceBetween={16}
            speed={700}
            keyboard={{ enabled: true }}
            onSwiper={(s) => (swiperRef.current = s)}
            breakpoints={{
              640: { slidesPerView: 1.5, spaceBetween: 20 },
              768: { slidesPerView: 1.8, spaceBetween: 24 },
              1024: { slidesPerView: 2, spaceBetween: 22 },
            }}
            className="w-full !overflow-visible"
          >
            {PROJECTS.map((p) => (
              <SwiperSlide key={p.title} className="!h-auto">
                <ProjectCard {...p} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Bottom row: nav arrows aligned with heading column */}
      <div className="mt-[28px] md:mt-[40px] lg:mt-[3.125vw] px-5 md:px-10 lg:pl-[13.59vw] lg:pr-[8.333vw]">
        <div className="flex items-center gap-[12px] lg:gap-[1.042vw]">
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => swiperRef.current?.slidePrev()}
            className="inline-flex items-center justify-center rounded-full
                       border border-[#33333344] text-[#333]
                       w-[44px] h-[44px] md:w-[54px] md:h-[54px] lg:w-[3.645vw] lg:h-[3.645vw]
                       hover:bg-[#ef493d] hover:text-white hover:border-[#ef493d]
                       transition-colors duration-300"
          >
            <ArrowLeft className="w-[16px] h-[16px] lg:w-[1.094vw] lg:h-[1.094vw]" />
          </button>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => swiperRef.current?.slideNext()}
            className="inline-flex items-center justify-center rounded-full
                       border border-[#33333344] text-[#333]
                       w-[44px] h-[44px] md:w-[54px] md:h-[54px] lg:w-[3.645vw] lg:h-[3.645vw]
                       hover:bg-[#ef493d] hover:text-white hover:border-[#ef493d]
                       transition-colors duration-300"
          >
            <ArrowRight className="w-[16px] h-[16px] lg:w-[1.094vw] lg:h-[1.094vw]" />
          </button>
        </div>
      </div>
    </section>
  );
}
