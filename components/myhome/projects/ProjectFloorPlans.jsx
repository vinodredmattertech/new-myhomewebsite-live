import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Dialog } from "@headlessui/react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowLeft, ArrowRight, Lock, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, A11y } from "swiper/modules";
import "swiper/css";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { submitLead } from "@/lib/strapi";
import useFancybox from "@/components/common/useFancybox";
import SectionHeading from "@/components/common/SectionHeading";
import CountryCodeSelect from "@/components/common/CountryCodeSelect";
import { dialCodeFor, registerPhone } from "@/lib/phone";
import { pushToCRM } from "@/lib/crm";

const FLOOR_PLAN_IMG = "/assets/myhome/projects/floor-plan.png";

const DEFAULT_TABS = [
  {
    key: "floor-plans",
    label: "Floor Plans",
    plans: [
      { bhk: "3 BHK", label: "Flat 1 - 1926 Sq. Ft.", image: FLOOR_PLAN_IMG },
      { bhk: "3 BHK", label: "Flat 2 - 1926 Sq. Ft.", image: FLOOR_PLAN_IMG },
      { bhk: "3 BHK", label: "Flat 3 - 1926 Sq. Ft.", image: FLOOR_PLAN_IMG },
      { bhk: "2 BHK", label: "Flat 4 - 1284 Sq. Ft.", image: FLOOR_PLAN_IMG },
      { bhk: "2 BHK", label: "Flat 5 - 1284 Sq. Ft.", image: FLOOR_PLAN_IMG },
    ],
  },
  {
    key: "master-plan",
    label: "Master Plan",
    plans: [
      { bhk: "Tower A", label: "12 Towers - G+39", image: FLOOR_PLAN_IMG },
      { bhk: "Tower B", label: "Master Layout", image: FLOOR_PLAN_IMG },
      { bhk: "Tower C", label: "Master Layout", image: FLOOR_PLAN_IMG },
    ],
  },
  {
    key: "unit-plan",
    label: "Unit Plan",
    plans: [
      { bhk: "Unit A", label: "Type A - 1926 Sq. Ft.", image: FLOOR_PLAN_IMG },
      { bhk: "Unit B", label: "Type B - 1284 Sq. Ft.", image: FLOOR_PLAN_IMG },
      { bhk: "Unit C", label: "Type C - 1748 Sq. Ft.", image: FLOOR_PLAN_IMG },
    ],
  },
];

// localStorage namespaced by project so unlocking Akrida doesn't auto-unlock
// every other project's plans.
const STORAGE_PREFIX = "mh:floorplans-unlocked:";

export default function ProjectFloorPlans({
  sidebarLabel = "Space With Purpose",
  heading = "Live The Way You Want",
  description = "Discover the art of spatial intelligence. From the intimate comfort of our 2 BHK residences to the expansive luxury of our 3 BHK layouts, every floor plan is engineered to maximize natural light, cross-ventilation, and functional flow.",
  tabs = DEFAULT_TABS,
  projectName = "Project Floor Plans",
  projectSlug,
}) {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const descRef = useRef(null);
  const sidebarRef = useRef(null);
  const sliderWrapRef = useRef(null);
  const tabsRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  // Bind Fancybox to the section so every unlocked [data-fancybox] plan
  // opens its image in a lightbox modal.
  const [fancyboxRoot] = useFancybox();
  const attachFancy = (el) => {
    rootRef.current = el;
    fancyboxRoot(el);
  };

  const [activeTab, setActiveTab] = useState(tabs[0]?.key);
  const activePlans = tabs.find((t) => t.key === activeTab)?.plans || [];
  const isSingle = activePlans.length <= 1;
  // Desktop fits 2.15 plans per view, so two cards are already fully visible
  // and the arrows have nothing to scroll to. Narrower breakpoints show far
  // fewer (1.05–1.8), where two plans still overflow and keep their nav.
  const hideNavOnDesktop = activePlans.length <= 2;

  // ===== Unlock state =====
  // Lead-gating is disabled for now — floor plans are visible to everyone.
  // To re-enable, flip `unlocked` back to useState(false) and uncomment the
  // localStorage init, the locked overlay, and the unlock modal below.
  const storageKey = `${STORAGE_PREFIX}${projectName}`;
  const [unlocked, setUnlocked] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const {
    register,
    getValues,
    trigger,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  // Initialise unlock state from localStorage on the client (SSR-safe).
  // useEffect(() => {
  //   if (typeof window === "undefined") return;
  //   if (window.localStorage.getItem(storageKey) === "1") setUnlocked(true);
  // }, [storageKey]);

  const onUnlockSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError(null);
    const payload = {
      name: data.name,
      email: data.email,
      phone: `${dialCodeFor(data.countryCode)} ${data.phone}`.trim(),
      project: projectName,
      formSource: "Project Floor Plans Unlock",
    };
    try {
      // CRM push + Strapi lead in parallel — Strapi is canonical here since
      // the CRM route is currently a no-op (still resolves OK).
      const [crmRes, leadOk] = await Promise.all([
        pushToCRM({
          projectSlug,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          project_name: payload.project,
          FormSource: payload.formSource,
        }),
        submitLead(payload),
      ]);
      if (crmRes.ok || leadOk) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(storageKey, "1");
        }
        setUnlocked(true);
        setModalOpen(false);
        reset();
      } else {
        setSubmitError("Couldn't save your details. Please try again.");
      }
    } catch (err) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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

      gsap.from([sidebarRef.current, descRef.current, tabsRef.current], {
        autoAlpha: 0,
        y: 24,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.1,
        delay: 0.15,
        scrollTrigger: trigger,
      });

      gsap.from(sliderWrapRef.current, {
        autoAlpha: 0,
        y: 60,
        duration: 1.1,
        ease: "expo.out",
        delay: 0.3,
        scrollTrigger: trigger,
      });
    },
    { scope: rootRef }
  );

  // When tab changes, jump slider back to start
  useEffect(() => {
    if (!isSingle && swiperRef.current && !swiperRef.current.destroyed) {
      swiperRef.current.slideTo(0, 500);
    }
  }, [activeTab, isSingle]);

  const handleTabChange = (key) => {
    if (key === activeTab) return;
    setActiveTab(key);
  };

  const renderCard = (plan, idx) => {
    const card = (
      <div
        className="relative w-full aspect-[785/620] rounded-[12px] bg-[#f2f2f2]
                   border border-[rgba(51,51,51,0.1)] overflow-hidden
                   px-[16px] py-[16px] sm:px-[24px] sm:py-[22px] lg:px-[1.927vw] lg:py-[1.771vw]"
      >
        <div className="flex items-center gap-[10px] sm:gap-[14px] lg:gap-[0.833vw]">
          {plan.bhk && (
            <span
            className="inline-flex items-center justify-center rounded-full bg-white
                       border-[1.068px] border-[#333] text-[#333]
                       h-[34px] sm:h-[42px] lg:h-[2.656vw]
                       px-[16px] sm:px-[20px] lg:px-[1.302vw]
                       text-[13px] sm:text-[15px] lg:text-[1.001vw]"
            style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}
          >
            {plan.bhk}
          </span>
          )}
    {plan.label &&(
      <span
            className="inline-flex items-center justify-center rounded-full bg-white
                       border-[1.068px] border-[#333] text-[#333]
                       h-[34px] sm:h-[42px] lg:h-[2.656vw]
                       px-[16px] sm:px-[20px] lg:px-[1.302vw]
                       text-[13px] sm:text-[15px] lg:text-[1.001vw]"
            style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}
          >
            {plan.label}
          </span>
    )}      
          
        </div>
        <div className="mt-[14px] sm:mt-[20px] lg:mt-[1.667vw] relative w-full h-[calc(100%-58px)] sm:h-[calc(100%-72px)] lg:h-[calc(100%-4.323vw)]">
          <Image
            src={plan.image}
            alt={`${plan.bhk} ${plan.label}`}
            fill
            sizes="(min-width:1024px) 41vw, (min-width:640px) 70vw, 95vw"
            className={`object-contain object-center select-none transition-[filter] duration-500 ease-out ${
              unlocked ? "" : "blur-[14px] scale-[1.03]"
            }`}
          />
        </div>
      </div>
    );

    // Once unlocked, the whole card opens the plan in a Fancybox lightbox.
    // Grouped by tab so multiple plans navigate together inside the lightbox.
    if (unlocked) {
      return (
        <a
          href={plan.image}
          data-fancybox={`floor-plans-${activeTab}`}
          data-caption={`${plan.bhk} — ${plan.label}`}
          className="block cursor-zoom-in"
          aria-label={`Open ${plan.bhk} ${plan.label} floor plan`}
        >
          {card}
        </a>
      );
    }
    return card;
  };

  return (
    <section
      ref={attachFancy}
      className="relative w-full bg-white pt-[0px] pb-[80px] lg:pt-[1.667vw] lg:pb-[4.688vw] overflow-hidden"
      data-section="project-floor-plans"
    >
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="flex lg:absolute left-[12px] top-0 lg:left-[1.167vw] lg:top-[0] flex-col items-center gap-[8px] md:gap-[12px] lg:gap-[1.094vw] w-auto lg:w-[2.813vw] z-[5] max-lg:static max-lg:!w-full max-lg:flex-row max-lg:!justify-center max-lg:items-center max-lg:!gap-[8px] max-lg:mt-[15px] max-lg:mb-[18px]"
        aria-hidden="true"
      >
        <span className="block w-px h-[28px] md:h-[36px] lg:h-[2.125vw] bg-[#ef493d] max-lg:!w-[28px] max-lg:!h-px" />
        <span
          className="font-montserrat font-medium capitalize whitespace-nowrap text-[#ef493d] text-[12px] md:text-[14px] lg:text-[1vw] max-lg:[writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] lg:rotate-180"
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {sidebarLabel}
        </span>
      </div>

      <div className="px-5 md:px-12 lg:px-[9.375vw]">
        <SectionHeading
          ref={headingRef}
          className="capitalize text-[#333] leading-[1.08] tracking-[0.022em] text-center
                     text-[34px] xs:text-[38px] sm:text-[48px] md:text-[64px] lg:text-[5vw]"
        >
          {heading}
        </SectionHeading>
        <p
          ref={descRef}
          className="mx-auto mt-[14px] lg:mt-[0.729vw] max-w-[760px] lg:max-w-[55.469vw]
                     text-center text-[#333]
                     text-[14px] leading-[24px]
                     sm:text-[16px] sm:leading-[28px]
                     lg:text-[0.938vw] lg:leading-[1.563vw]"
          style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}
          dangerouslySetInnerHTML={{ __html: description }}
        />

        {/* Tabs */}
        <div
          ref={tabsRef}
          className="mt-[28px] lg:mt-[2.865vw] flex flex-wrap items-center justify-center gap-[12px] sm:gap-[16px] lg:gap-[1.094vw]"
          role="tablist"
          aria-label="Plan types"
        >
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab.key)}
                className={`inline-flex items-center justify-center transition-colors duration-300
                            h-[44px] sm:h-[50px] lg:h-[2.76vw]
                            px-[18px] sm:px-[22px] lg:px-[1.354vw]
                            min-w-[120px] sm:min-w-[140px] lg:min-w-[8.594vw]
                            text-[14px] sm:text-[16px] lg:text-[0.938vw]
                            ${
                              isActive
                                ? "bg-[#333] text-white"
                                : "bg-transparent text-[#333] border-[0.7px] border-[#333] hover:bg-[#333]/5"
                            }`}
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span className="capitalize whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slider with side nav arrows */}
      <div
        ref={sliderWrapRef}
        className={`relative mt-[36px] lg:mt-[2.969vw] w-full ${
          isSingle
            ? "px-5 md:px-12 lg:px-[9.375vw]"
            : "pl-5 md:pl-12 lg:pl-[5.208vw]"
        }`}
      >
        {isSingle ? (
          // Single plan: centered, no slider / nav arrows.
          <div className="flex justify-center">
            <div className="w-full max-w-[785px] lg:max-w-[41vw]">
              {activePlans[0] && renderCard(activePlans[0], 0)}
            </div>
          </div>
        ) : (
          <Swiper
            key={activeTab}
            modules={[Navigation, Keyboard, A11y]}
            slidesPerView={1.05}
            spaceBetween={16}
            speed={650}
            keyboard={{ enabled: true }}
            onSwiper={(s) => {
              swiperRef.current = s;
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            navigation={{ prevEl: null, nextEl: null }}
            breakpoints={{
              640: { slidesPerView: 1.4, spaceBetween: 20 },
              768: { slidesPerView: 1.8, spaceBetween: 28 },
              1024: { slidesPerView: 2.15, spaceBetween: 40 },
            }}
            className="!overflow-visible"
          >
            {activePlans.map((plan, idx) => (
              <SwiperSlide key={`${activeTab}-${idx}`} className="!h-auto">
                {renderCard(plan, idx)}
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Locked overlay — disabled, plans are open to everyone
        {!unlocked && (
          <div
            className="absolute inset-0 z-[6] flex items-center justify-center
                       pointer-events-none"
          >
            <div
              className="pointer-events-none bg-white/95 backdrop-blur-md border border-[rgba(51,51,51,0.12)]
                         rounded-[12px] shadow-[0_30px_60px_-25px_rgba(0,0,0,0.3)]
                         px-[24px] py-[20px] sm:px-[32px] sm:py-[26px] lg:px-[2.083vw] lg:py-[1.563vw]
                         flex flex-col items-center text-center gap-[12px] lg:gap-[0.781vw]
                         max-w-[440px] lg:max-w-[28vw] mx-4"
            >
              <span
                className="inline-flex items-center justify-center rounded-full
                           bg-[#ef493d]/10 text-[#ef493d]
                           w-[44px] h-[44px] lg:w-[2.604vw] lg:h-[2.604vw]"
              >
                <Lock className="w-[20px] h-[20px] lg:w-[1.146vw] lg:h-[1.146vw]" strokeWidth={1.8} />
              </span>
              <h3
                className="text-[#333] leading-[1.2]
                           text-[20px] sm:text-[24px] lg:text-[1.563vw]"
                style={{
                  fontFamily:
                    '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                  fontWeight: 400,
                }}
              >
                View Detailed Floor Plans
              </h3>
              <p
                className="font-montserrat text-[#6d6d6d]
                           text-[13px] sm:text-[14px] lg:text-[0.833vw]
                           leading-[20px] sm:leading-[22px] lg:leading-[1.302vw]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Share a few details and we&apos;ll unlock every plan instantly. Your details stay with our advisors only.
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="pointer-events-auto group relative inline-flex items-center justify-center
                           whitespace-nowrap overflow-hidden mt-[6px] lg:mt-[0.417vw]
                           h-[44px] sm:h-[48px] lg:h-[2.708vw]
                           px-[24px] lg:px-[1.563vw]
                           bg-[#ef493d] text-white border border-[#ef493d]
                           transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                           hover:bg-transparent hover:text-[#ef493d]"
              >
                <span
                  className="font-montserrat font-medium capitalize
                             text-[14px] sm:text-[15px] lg:text-[0.938vw] tracking-[0.02em]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Unlock Floor Plans
                </span>
              </button>
            </div>
          </div>
        )}
        */}

        {/* Side nav buttons — more than one plan, and (on desktop) more than two */}
        {!isSingle && (
          <>
            <button
              ref={prevRef}
              type="button"
              aria-label="Previous plan"
              onClick={() => swiperRef.current?.slidePrev()}
              className={`absolute z-[7] top-1/2 -translate-y-1/2
                         left-[12px] md:left-[24px] lg:left-[1.354vw]
                         inline-flex items-center justify-center rounded-full
                         bg-[#ef493d] text-white shadow-[0_6px_16px_rgba(0,0,0,0.18)]
                         w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] lg:w-[2.938vw] lg:h-[2.938vw]
                         transition-transform duration-300 hover:scale-105 active:scale-95
                         ${hideNavOnDesktop ? "lg:hidden" : ""}`}
            >
              <ArrowLeft className="w-[18px] h-[18px] lg:w-[1.276vw] lg:h-[1.276vw]" />
            </button>
            <button
              ref={nextRef}
              type="button"
              aria-label="Next plan"
              onClick={() => swiperRef.current?.slideNext()}
              className={`absolute z-[7] top-1/2 -translate-y-1/2
                         right-[12px] md:right-[24px] lg:right-[1.354vw]
                         inline-flex items-center justify-center rounded-full
                         bg-[#ef493d] text-white shadow-[0_6px_16px_rgba(0,0,0,0.18)]
                         w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] lg:w-[2.938vw] lg:h-[2.938vw]
                         transition-transform duration-300 hover:scale-105 active:scale-95
                         ${hideNavOnDesktop ? "lg:hidden" : ""}`}
            >
              <ArrowRight className="w-[18px] h-[18px] lg:w-[1.276vw] lg:h-[1.276vw]" />
            </button>
          </>
        )}
      </div>

      {/* ===== Unlock modal — disabled, no form needed to view plans =====
      <Dialog
        open={modalOpen}
        onClose={() => (submitting ? null : setModalOpen(false))}
        className="fixed inset-0 z-[100]"
      >
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            className="relative w-full max-w-[460px] lg:max-w-[28vw]
                       bg-white rounded-[10px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]
                       px-[24px] py-[28px] sm:px-[32px] sm:py-[36px] lg:px-[2.083vw] lg:py-[2.604vw]"
          >
            <button
              type="button"
              onClick={() => (submitting ? null : setModalOpen(false))}
              aria-label="Close"
              className="absolute right-[12px] top-[12px] lg:right-[0.781vw] lg:top-[0.781vw]
                         inline-flex items-center justify-center rounded-full
                         w-[34px] h-[34px] lg:w-[2.083vw] lg:h-[2.083vw]
                         text-[#333] hover:text-[#ef493d] transition-colors"
            >
              <X className="w-[18px] h-[18px] lg:w-[1.146vw] lg:h-[1.146vw]" strokeWidth={1.8} />
            </button>

            <Dialog.Title
              className="text-[#333] leading-[1.2] capitalize
                         text-[22px] sm:text-[26px] lg:text-[1.667vw]"
              style={{
                fontFamily:
                  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                fontWeight: 400,
              }}
            >
              Unlock {projectName} Plans
            </Dialog.Title>
            <p
              className="font-montserrat text-[#6d6d6d] mt-[8px] lg:mt-[0.521vw]
                         text-[13px] sm:text-[14px] lg:text-[0.833vw]
                         leading-[20px] sm:leading-[22px] lg:leading-[1.302vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Share your details and we&apos;ll reveal every floor plan instantly.
            </p>

            <form
              onSubmit={handleSubmit(onUnlockSubmit)}
              className="mt-[20px] lg:mt-[1.302vw] flex flex-col gap-[16px] lg:gap-[1.042vw]"
              noValidate
            >
              <div>
                <input
                  type="text"
                  placeholder="Full Name*"
                  aria-invalid={!!errors.name || undefined}
                  className={`w-full bg-transparent outline-none border-b
                              text-[#333] placeholder:text-[#999]
                              text-[14px] sm:text-[16px] lg:text-[0.938vw]
                              py-[8px] lg:py-[0.417vw]
                              ${errors.name ? "border-[#ef493d]" : "border-[#33333322]"}`}
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                  {...register("name", {
                    required: "Please enter your name",
                    minLength: { value: 2, message: "Too short" },
                  })}
                />
                {errors.name && (
                  <p className="text-[#ef493d] text-[12px] mt-[4px]">{errors.name.message}</p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email Address*"
                  aria-invalid={!!errors.email || undefined}
                  className={`w-full bg-transparent outline-none border-b
                              text-[#333] placeholder:text-[#999]
                              text-[14px] sm:text-[16px] lg:text-[0.938vw]
                              py-[8px] lg:py-[0.417vw]
                              ${errors.email ? "border-[#ef493d]" : "border-[#33333322]"}`}
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                  {...register("email", {
                    required: "Please enter your email",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-[#ef493d] text-[12px] mt-[4px]">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div
                  className={`flex items-center gap-[8px] lg:gap-[0.417vw] w-full border-b
                              ${errors.phone ? "border-[#ef493d]" : "border-[#33333322]"}`}
                >
                  <CountryCodeSelect
                    {...register("countryCode", {
                      onChange: () => getValues("phone") && trigger("phone"),
                    })}
                    className="text-[#333] text-[14px] sm:text-[16px] lg:text-[0.938vw] py-[8px] lg:py-[0.417vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number*"
                    aria-invalid={!!errors.phone || undefined}
                    className="flex-1 min-w-0 bg-transparent outline-none border-none
                               text-[#333] placeholder:text-[#999]
                               text-[14px] sm:text-[16px] lg:text-[0.938vw]
                               py-[8px] lg:py-[0.417vw]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                    {...registerPhone(register, "phone", () => getValues("countryCode"), {
                      required: "Please enter your phone",
                    })}
                  />
                </div>
                {errors.phone && (
                  <p className="text-[#ef493d] text-[12px] mt-[4px]">{errors.phone.message}</p>
                )}
              </div>

              // Hidden project name — sent with the lead
              <input type="hidden" value={projectName} readOnly />

              {submitError && (
                <p className="text-[#ef493d] text-[13px]" role="alert">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group relative inline-flex items-center justify-center
                           whitespace-nowrap overflow-hidden mt-[6px] lg:mt-[0.521vw]
                           h-[46px] sm:h-[50px] lg:h-[2.917vw]
                           px-[24px] lg:px-[1.563vw]
                           bg-[#ef493d] text-white border border-[#ef493d]
                           transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                           hover:bg-transparent hover:text-[#ef493d]
                           disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span
                  className="font-montserrat font-medium capitalize
                             text-[14px] sm:text-[15px] lg:text-[0.938vw] tracking-[0.02em]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {submitting ? "Unlocking…" : "Unlock Floor Plans"}
                </span>
              </button>

              <p
                className="font-montserrat text-[#999] text-center
                           text-[11px] sm:text-[12px] lg:text-[0.677vw]
                           leading-[1.5] mt-[2px] lg:mt-[0.156vw]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Submitting will save your details with our team and unlock all floor plans on this device.
              </p>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
      */}
    </section>
  );
}
