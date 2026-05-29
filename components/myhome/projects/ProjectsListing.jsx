import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import {
  Check,
  Building,
  Building2,
  Warehouse,
  MapPin,
  X,
  ChevronDown,
  BedDouble,
  Maximize2,
  ArrowUpRight,
} from "lucide-react";
import SectionLabel from "@/components/myhome/SectionLabel";
import { mediaUrl } from "@/lib/strapi";

const STATUSES = [
  { key: "All", label: "All", Icon: Check },
  { key: "Residential", label: "Residential", Icon: Building },
  { key: "Commercial", label: "Commercial", Icon: Building2 },
  { key: "Completed", label: "Completed", Icon: Warehouse },
];

const LOCATIONS = [
  "Ameerpet",
  "Somajiguda",
  "Begumpet",
  "Punjagutta",
  "Abids",
  "HITEC City",
  "Gachibowli",
  "Kondapur",
  "Madhapur",
];

const CONFIGURATIONS = [
  "ALL",
  "2 BHK",
  "2.5 BHK",
  "3 BHK",
  "3.5 BHK",
  "4 BHK",
  "4.5 BHK",
  "5 BHK",
];

const SORT_OPTIONS = [
  "Select Sort option",
  "Newest First",
  "Price: Low to High",
  "Price: High to Low",
  "Name: A — Z",
];

const PRICE_MIN = 1000000;
const PRICE_MAX = 4000000;
const PAGE_SIZE = 4;

const FALLBACK_PROJECTS = [
  {
    title: "My Home Krishe",
    locationKey: "Madhapur",
    location: "Nallagandla, Hyderabad",
    description:
      "Udyan is a sense of liberation — from concrete to open spaces. It is not just about square feet.",
    bhks: ["2 BHK", "2.5 BHK", "3 BHK", "4 BHK"],
    bhkLabel: "2, 2.5, 3 & 4 BHK",
    acres: "24.12 Acres",
    image: "/assets/myhome/nri/project-1.jpg",
    status: "Residential",
    badge: null,
    price: 2200000,
    year: 2024,
    href: "/projects/my-home-krishe",
  },
  {
    title: "My Home Avatar",
    locationKey: "Madhapur",
    location: "Narsingi, Hyderabad",
    description:
      "Avatar redefines high-rise living with airy floor plates, premium finishes and panoramic city views.",
    bhks: ["3 BHK", "3.5 BHK", "4 BHK"],
    bhkLabel: "3, 3.5 & 4 BHK",
    acres: "18.40 Acres",
    image: "/assets/myhome/nri/hyderabad-5.jpg",
    status: "Residential",
    badge: "Completed",
    price: 3200000,
    year: 2022,
    href: "/projects/my-home-avatar",
  },
  {
    title: "My Home Vihanga",
    locationKey: "Gachibowli",
    location: "Gachibowli, Hyderabad",
    description:
      "Eleven towers of refined family living, set within sweeping landscaped greens and resort-style amenities.",
    bhks: ["2 BHK", "3 BHK", "4 BHK"],
    bhkLabel: "2, 3 & 4 BHK",
    acres: "21.50 Acres",
    image: "/assets/myhome/nri/hyderabad-2.jpg",
    status: "Residential",
    badge: "Completed",
    price: 2800000,
    year: 2021,
    href: "/projects/my-home-vihanga",
  },
  {
    title: "My Home 99",
    locationKey: "Kondapur",
    location: "Nallagandla, Hyderabad",
    description:
      "A new benchmark for premium living — generous decks, double-height lobbies and curated wellness spaces.",
    bhks: ["3 BHK", "4 BHK", "5 BHK"],
    bhkLabel: "3, 4 & 5 BHK",
    acres: "16.75 Acres",
    image: "/assets/myhome/nri/hyderabad-1.jpg",
    status: "Residential",
    badge: null,
    price: 3800000,
    year: 2025,
    href: "/projects/my-home-99",
  },
  {
    title: "My Home Twitza",
    locationKey: "Madhapur",
    location: "Financial District, Hyderabad",
    description:
      "Grade A office spaces with column-free floor plates, helipad-ready architecture and futuristic systems.",
    bhks: [],
    bhkLabel: "Grade A Offices",
    acres: "12.80 Acres",
    image: "/assets/myhome/nri/hyderabad-3.jpg",
    status: "Commercial",
    badge: null,
    price: 1800000,
    year: 2024,
    href: "/projects/my-home-twitza",
  },
  {
    title: "My Home Hub",
    locationKey: "Madhapur",
    location: "Madhapur, Hyderabad",
    description:
      "Hyderabad's most recognised commercial address — a fully leased ecosystem of global tenants and retail.",
    bhks: [],
    bhkLabel: "Grade A Offices",
    acres: "10.20 Acres",
    image: "/assets/myhome/nri/hyderabad-4.jpg",
    status: "Commercial",
    badge: "Completed",
    price: 1500000,
    year: 2019,
    href: "/projects/my-home-hub",
  },
  {
    title: "My Home Sayuk",
    locationKey: "Ameerpet",
    location: "Ameerpet, Hyderabad",
    description:
      "Boutique high-rise residences that pair sky-garden terraces with intimate community amenities.",
    bhks: ["2 BHK", "2.5 BHK", "3 BHK"],
    bhkLabel: "2, 2.5 & 3 BHK",
    acres: "8.60 Acres",
    image: "/assets/myhome/project-1.jpg",
    status: "Residential",
    badge: null,
    price: 1900000,
    year: 2026,
    href: "/projects/my-home-sayuk",
  },
  {
    title: "My Home Mangala",
    locationKey: "Begumpet",
    location: "Begumpet, Hyderabad",
    description:
      "Family residences in the heart of old Hyderabad — heritage charm with modern day infrastructure.",
    bhks: ["3 BHK", "4 BHK"],
    bhkLabel: "3 & 4 BHK",
    acres: "9.40 Acres",
    image: "/assets/myhome/project-2.png",
    status: "Residential",
    badge: null,
    price: 2600000,
    year: 2025,
    href: "/projects/my-home-mangala",
  },
];

function FilterPanel({ title, children, className = "", collapsible = false }) {
  // On mobile, collapsible panels start closed and toggle open on tap.
  // On lg+ screens they are always expanded (toggling is disabled).
  const [open, setOpen] = useState(false);

  const headingFont = {
    fontFamily:
      '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
  };

  return (
    <div
      className={`relative border border-[#e7e7e7]
                  px-[20px] md:px-[24px] lg:px-[1.562vw]
                  pt-[18px] md:pt-[22px] lg:pt-[1.302vw]
                  pb-[20px] md:pb-[24px] lg:pb-[1.562vw]
                  ${className}`}
    >
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex lg:hidden w-full items-center justify-between text-left"
        >
          <h3
            className="text-[#333] text-[16px] md:text-[17px] leading-[32px]"
            style={headingFont}
          >
            {title}
          </h3>
          <ChevronDown
            className={`w-[16px] h-[16px] text-[#333] shrink-0 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
            strokeWidth={1.6}
          />
        </button>
      ) : null}

      {/* Desktop heading (always shown) — hidden on mobile when collapsible */}
      <h3
        className={`text-[#333] text-[16px] md:text-[17px] lg:text-[0.938vw]
                   leading-[32px] mb-[10px] lg:mb-[0.625vw]
                   ${collapsible ? "hidden lg:block" : ""}`}
        style={headingFont}
      >
        {title}
      </h3>

      <div
        className={
          collapsible
            ? `${open ? "block mt-[10px]" : "hidden"} lg:block lg:mt-0`
            : ""
        }
      >
        {children}
      </div>
    </div>
  );
}

function CheckRow({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="group flex items-center gap-[16px] lg:gap-[1.042vw] py-[6px] lg:py-[0.312vw] w-full text-left"
    >
      <span
        className={`inline-flex shrink-0 items-center justify-center
                    w-[14px] h-[14px] lg:w-[0.781vw] lg:h-[0.781vw]
                    border rounded-full transition-colors duration-300
                    ${
                      checked
                        ? "border-[#ef493d]"
                        : "border-[#cfcfcf] group-hover:border-[#ef493d]"
                    }`}
      >
        <span
          className={`block rounded-full transition-all duration-300
                      w-[6px] h-[6px] lg:w-[0.365vw] lg:h-[0.365vw]
                      ${checked ? "bg-[#ef493d] scale-100" : "bg-transparent scale-0"}`}
        />
      </span>
      <span
        className="font-montserrat font-normal text-[#333]
                   text-[14px] sm:text-[15px] lg:text-[0.938vw]
                   leading-[34px]"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        {label}
      </span>
    </button>
  );
}

function ProjectCard({ project }) {
  return (
    <Link
      href={project.href}
      className="group relative block w-full bg-white border-[0.7px] border-[rgba(43,43,43,0.14)]
                 rounded-[12px] overflow-hidden
                 transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]"
    >
      <div className="relative w-full px-[18px] pt-[18px] lg:px-[0.937vw] lg:pt-[0.937vw]">
        <div className="relative w-full aspect-[488/393] rounded-t-[10px] overflow-hidden bg-[#f5f1eb]">
          {project.image && (
            <Image
              src={project.image}
              alt={project.title}
              fill
              unoptimized
              sizes="(min-width:1024px) 28vw, (min-width:640px) 45vw, 90vw"
              className="object-cover object-center select-none transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            />
          )}
          {project.badge && (
            <span
              className="absolute top-[14px] right-[14px] lg:top-[1.042vw] lg:right-[1.042vw]
                         inline-flex items-center justify-center
                         bg-[rgba(221,221,221,0.25)] backdrop-blur-md
                         border border-white/40
                         rounded-full
                         px-[18px] py-[8px] lg:px-[1.302vw] lg:py-[0.521vw]
                         font-montserrat font-normal text-white
                         text-[12px] sm:text-[13px] lg:text-[0.729vw]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {project.badge}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-[18px] lg:gap-[1.042vw]
                      px-[24px] lg:px-[1.302vw]
                      pt-[20px] lg:pt-[1.198vw]
                      pb-[24px] lg:pb-[1.302vw]">
        <div className="flex items-start justify-between gap-[16px]">
          <div className="flex flex-col gap-[4px] min-w-0">
            <h3
              className="text-[#e31f24] leading-[1.15] tracking-[0.03em]
                         text-[22px] sm:text-[26px] lg:text-[1.458vw]"
              style={{
                fontFamily:
                  '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                fontWeight: 300,
              }}
            >
              {project.title}
            </h3>
            <p
              className="font-montserrat font-light text-[#333]
                         text-[11px] sm:text-[12px] lg:text-[0.625vw]
                         leading-[22px]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {project.location}
            </p>
          </div>
          <span
            className="inline-flex items-center justify-center shrink-0 rounded-full bg-white
                       border-[0.896px] border-[#e31f24] text-[#e31f24]
                       w-[44px] h-[44px] lg:w-[2.604vw] lg:h-[2.604vw]
                       transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                       group-hover:bg-[#e31f24] group-hover:text-white"
          >
            <ArrowUpRight className="w-[14px] h-[14px] lg:w-[0.833vw] lg:h-[0.833vw]" />
          </span>
        </div>

        <p
          className="font-montserrat font-light text-[#333]
                     text-[13px] sm:text-[14px] lg:text-[0.781vw]
                     leading-[22px] lg:leading-[1.302vw]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {project.description}
        </p>

        <div className="flex flex-wrap items-center gap-[10px] lg:gap-[0.625vw]">
          <span
            className="inline-flex items-center gap-[8px] lg:gap-[0.417vw]
                       bg-[rgba(221,221,221,0.15)] border-[0.5px] border-[#e7e7e7]
                       rounded-full
                       px-[18px] py-[10px] lg:px-[1.042vw] lg:py-[0.521vw]
                       font-montserrat font-normal text-[#333]
                       text-[12px] sm:text-[13px] lg:text-[0.729vw]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            <BedDouble className="w-[14px] h-[14px] lg:w-[0.781vw] lg:h-[0.781vw]" strokeWidth={1.4} />
            {project.bhkLabel}
          </span>
          <span
            className="inline-flex items-center gap-[8px] lg:gap-[0.417vw]
                       bg-[rgba(221,221,221,0.15)] border-[0.5px] border-[#e7e7e7]
                       rounded-full
                       px-[18px] py-[10px] lg:px-[1.042vw] lg:py-[0.521vw]
                       font-montserrat font-normal text-[#333]
                       text-[12px] sm:text-[13px] lg:text-[0.729vw]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            <Maximize2 className="w-[12px] h-[12px] lg:w-[0.729vw] lg:h-[0.729vw]" strokeWidth={1.4} />
            {project.acres}
          </span>
        </div>
      </div>
    </Link>
  );
}

function normaliseCmsProject(p) {
  return {
    title: p.title || "",
    locationKey: p.locationKey || "",
    location: p.location || "",
    description: p.description || "",
    bhks: (p.bhks || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    bhkLabel: p.bhkLabel || "",
    acres: p.acres || "",
    image: mediaUrl(p.image),
    status: p.status || "Residential",
    badge: p.badge || null,
    price: typeof p.price === "number" ? p.price : 0,
    year: typeof p.year === "number" ? p.year : 0,
    href: p.ctaLink || (p.slug ? `/projects/${p.slug}` : "#"),
  };
}

export default function ProjectsListing({ projects = [], heading }) {
  // Use the CMS list when present, otherwise fall back to the static list
  // so the page still renders during local development without the backend.
  const PROJECTS =
    projects.length > 0
      ? projects.map(normaliseCmsProject).filter((p) => p.title)
      : FALLBACK_PROJECTS;

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const gridRef = useRef(null);
  const locationDropdownRef = useRef(null);

  const [status, setStatus] = useState("All");
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedConfigs, setSelectedConfigs] = useState(["ALL"]);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const [sort, setSort] = useState(SORT_OPTIONS[0]);
  const [sortOpen, setSortOpen] = useState(false);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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

  useEffect(() => {
    if (!locationMenuOpen) return;
    const onClickOutside = (e) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(e.target)
      ) {
        setLocationMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [locationMenuOpen]);

  const filteredAll = useMemo(() => {
    let list = PROJECTS;

    if (status === "Completed") {
      list = list.filter((p) => p.badge === "Completed");
    } else if (status !== "All") {
      list = list.filter((p) => p.status === status);
    }

    if (selectedLocations.length > 0) {
      list = list.filter((p) => selectedLocations.includes(p.locationKey));
    }

    const configsActive =
      selectedConfigs.length > 0 && !selectedConfigs.includes("ALL");
    if (configsActive) {
      list = list.filter((p) =>
        p.bhks.some((b) => selectedConfigs.includes(b))
      );
    }

    list = list.filter((p) => p.price <= priceMax);

    switch (sort) {
      case "Newest First":
        list = [...list].sort((a, b) => b.year - a.year);
        break;
      case "Price: Low to High":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "Name: A — Z":
        list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return list;
  }, [status, selectedLocations, selectedConfigs, priceMax, sort]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [status, selectedLocations, selectedConfigs, priceMax, sort]);

  const visible = filteredAll.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAll.length;

  const animateGrid = (callback) => {
    if (!gridRef.current) {
      callback();
      return;
    }
    gsap.to(gridRef.current, {
      autoAlpha: 0,
      y: 16,
      duration: 0.22,
      ease: "sine.in",
      onComplete: () => {
        callback();
        gsap.fromTo(
          gridRef.current,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }
        );
      },
    });
  };

  const onStatusChange = (key) => {
    if (key === status) return;
    animateGrid(() => setStatus(key));
  };

  const toggleLocation = (loc) => {
    animateGrid(() =>
      setSelectedLocations((prev) =>
        prev.includes(loc) ? prev.filter((x) => x !== loc) : [...prev, loc]
      )
    );
  };

  const toggleConfig = (cfg) => {
    animateGrid(() =>
      setSelectedConfigs((prev) => {
        if (cfg === "ALL") return ["ALL"];
        const next = prev.includes(cfg)
          ? prev.filter((x) => x !== cfg && x !== "ALL")
          : [...prev.filter((x) => x !== "ALL"), cfg];
        return next.length === 0 ? ["ALL"] : next;
      })
    );
  };

  const onSortChange = (opt) => {
    setSortOpen(false);
    animateGrid(() => setSort(opt));
  };

  const onPriceChange = (n) => {
    setPriceMax(n);
  };

  const handleReset = () => {
    animateGrid(() => {
      setStatus("All");
      setSelectedLocations([]);
      setSelectedConfigs(["ALL"]);
      setPriceMax(PRICE_MAX);
      setSort(SORT_OPTIONS[0]);
    });
  };

  const handleViewMore = () => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredAll.length));
  };

  const handleShowLess = () => {
    setVisibleCount(PAGE_SIZE);
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const formatPrice = (n) => `₹ ${n.toLocaleString("en-IN")}`;

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden
                 pt-[60px] md:pt-[80px] lg:pt-[4.687vw]
                 pb-[60px] md:pb-[80px] lg:pb-[5.208vw]"
      data-section="projects-listing"
    >
      <div className="absolute left-[4.16vw] top-[4.687vw] hidden lg:block">
        <SectionLabel>Our Projects</SectionLabel>
      </div>

      <div className="px-5 md:px-10 lg:px-[8.333vw]">
        <h2
          ref={headingRef}
          className="text-[#333] capitalize text-center will-change-transform leading-[1.05] tracking-[0.02em]
                     text-[36px] xs:text-[44px] sm:text-[56px] md:text-[72px] lg:text-[5vw]
                     max-w-[1100px] mx-auto"
          style={{
            fontFamily:
              '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
            fontWeight: 300,
          }}
        >
          {heading || "A Portfolio Built on Excellence"}
        </h2>

        {/* Filter pill bar */}
        <div
          className="mt-[36px] md:mt-[48px] lg:mt-[3.125vw]
                     mx-auto max-w-[1149px] lg:max-w-[59.84vw]
                     border-[0.5px] border-[#e7e7e7]
                     px-[12px] lg:px-[0.781vw] py-[8px] lg:py-[0.417vw]
                     grid grid-cols-2 lg:flex lg:flex-nowrap items-stretch lg:items-center
                     gap-[8px] lg:gap-[0.521vw] whitespace-nowrap"
        >
          {STATUSES.map(({ key, label, Icon }) => {
            const isActive = status === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onStatusChange(key)}
                className={`inline-flex items-center justify-center lg:justify-start
                            gap-[10px] lg:gap-[0.625vw]
                            font-montserrat font-normal capitalize
                            transition-all duration-300
                            px-[16px] py-[10px] md:px-[20px] md:py-[14px]
                            lg:px-[1.302vw] lg:py-[0.781vw]
                            text-[14px] sm:text-[16px] lg:text-[1.042vw]
                            rounded-full
                            ${
                              isActive
                                ? "bg-[#ef493d] text-white"
                                : "bg-transparent text-[#454545] hover:text-[#ef493d]"
                            }`}
                style={{ fontFamily: "Montserrat, sans-serif" }}
                aria-pressed={isActive}
              >
                <Icon
                  className="w-[16px] h-[16px] lg:w-[1.094vw] lg:h-[1.094vw]"
                  strokeWidth={isActive ? 2.4 : 1.4}
                />
                {label}
              </button>
            );
          })}

          <div ref={locationDropdownRef} className="relative w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setLocationMenuOpen((v) => !v)}
              className={`inline-flex w-full lg:w-auto items-center justify-center lg:justify-start
                         gap-[12px] lg:gap-[0.625vw]
                         font-montserrat font-normal capitalize
                         px-[16px] py-[10px] md:px-[20px] md:py-[14px]
                         lg:px-[1.302vw] lg:py-[0.781vw]
                         text-[14px] sm:text-[16px] lg:text-[1.042vw]
                         transition-colors duration-300
                         ${
                           selectedLocations.length > 0
                             ? "text-[#ef493d]"
                             : "text-[#454545] hover:text-[#ef493d]"
                         }`}
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <MapPin className="w-[14px] h-[14px] lg:w-[0.833vw] lg:h-[0.833vw]" strokeWidth={1.4} />
              Location
              {selectedLocations.length > 0 && (
                <span className="inline-flex items-center justify-center bg-[#ef493d] text-white rounded-full text-[11px] lg:text-[0.625vw] w-[18px] h-[18px] lg:w-[1.042vw] lg:h-[1.042vw]">
                  {selectedLocations.length}
                </span>
              )}
              <ChevronDown
                className={`w-[12px] h-[12px] lg:w-[0.677vw] lg:h-[0.677vw] transition-transform duration-300 ${
                  locationMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {locationMenuOpen && (
              <div
                className="absolute z-20 top-full left-0 mt-[6px] min-w-[200px] lg:min-w-[12vw]
                           bg-white border border-[#e7e7e7] rounded-[6px] shadow-lg
                           p-[10px] flex flex-col max-h-[320px] overflow-y-auto"
              >
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => toggleLocation(loc)}
                    className={`text-left px-[12px] py-[6px] font-montserrat text-[14px]
                                hover:bg-[#fef2f1] rounded-[4px] flex items-center justify-between ${
                                  selectedLocations.includes(loc)
                                    ? "text-[#ef493d] font-medium"
                                    : "text-[#333]"
                                }`}
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {loc}
                    {selectedLocations.includes(loc) && (
                      <Check className="w-[12px] h-[12px] text-[#ef493d]" strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="hidden lg:block h-[36px] lg:h-[2.812vw] w-px bg-[#e7e7e7] mx-[10px] lg:mx-[0.521vw]" />

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center lg:justify-start
                       gap-[12px] lg:gap-[0.625vw]
                       font-montserrat font-normal capitalize
                       px-[16px] py-[10px] md:px-[20px] md:py-[14px]
                       lg:px-[1.302vw] lg:py-[0.781vw]
                       text-[14px] sm:text-[16px] lg:text-[1.042vw]
                       text-[#454545] hover:text-[#ef493d] transition-colors duration-300"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            <X className="w-[14px] h-[14px] lg:w-[0.781vw] lg:h-[0.781vw]" strokeWidth={1.6} />
            Reset
          </button>
        </div>

        {/* Sidebar + Cards grid */}
        <div
          className="mt-[36px] md:mt-[48px] lg:mt-[3.125vw]
                     grid grid-cols-1 lg:grid-cols-[23.7vw_1fr] gap-x-[2.083vw] gap-y-[30px]"
        >
          {/* === Sidebar === */}
          <aside className="flex flex-col gap-[20px] lg:gap-[1.094vw]">
            {/* Sort */}
            <div className="relative border border-[#e7e7e7] h-[55px] lg:h-[2.864vw] flex items-center px-[24px] lg:px-[1.562vw]">
              <span
                className="text-[#333] text-[16px] lg:text-[0.938vw] leading-[32px] mr-[12px] lg:mr-[0.625vw]"
                style={{
                  fontFamily:
                    '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
                }}
              >
                SORT BY:
              </span>
              <button
                type="button"
                onClick={() => setSortOpen((v) => !v)}
                className="ml-auto flex items-center gap-[10px] lg:gap-[0.521vw] flex-1 justify-between"
              >
                <span
                  className="font-montserrat font-normal text-[#333] text-[14px] lg:text-[0.938vw] leading-[32px] truncate"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {sort}
                </span>
                <ChevronDown
                  className={`w-[12px] h-[12px] lg:w-[0.677vw] lg:h-[0.677vw] text-[#333] transition-transform duration-300 shrink-0 ${
                    sortOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {sortOpen && (
                <div className="absolute z-10 top-full left-0 right-0 mt-[4px] bg-white border border-[#e7e7e7] rounded-[4px] shadow-lg">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onSortChange(opt)}
                      className={`block w-full text-left px-[20px] py-[10px] font-montserrat text-[14px] hover:bg-[#fef2f1] ${
                        sort === opt
                          ? "text-[#ef493d] font-medium"
                          : "text-[#333]"
                      }`}
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <FilterPanel title="LOCATION:" collapsible>
              <div className="flex flex-col">
                {LOCATIONS.map((loc) => (
                  <CheckRow
                    key={loc}
                    label={loc}
                    checked={selectedLocations.includes(loc)}
                    onChange={() => toggleLocation(loc)}
                  />
                ))}
              </div>
            </FilterPanel>

            <FilterPanel title="Configuration:" collapsible>
              <div className="flex flex-col">
                {CONFIGURATIONS.map((cfg) => (
                  <CheckRow
                    key={cfg}
                    label={cfg}
                    checked={selectedConfigs.includes(cfg)}
                    onChange={() => toggleConfig(cfg)}
                  />
                ))}
              </div>
            </FilterPanel>

            <FilterPanel title="PRICE">
              <div className="pt-[8px] lg:pt-[0.417vw]">
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={100000}
                  value={priceMax}
                  onChange={(e) => onPriceChange(Number(e.target.value))}
                  className="w-full accent-[#ef493d] cursor-pointer"
                />
                <div className="mt-[14px] lg:mt-[0.729vw] flex items-center justify-between">
                  <span
                    className="font-montserrat font-normal text-[#333] text-[16px] lg:text-[0.938vw] leading-[1.7] tracking-[0.36px]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {formatPrice(PRICE_MIN)}
                  </span>
                  <span
                    className="font-montserrat font-normal text-[#333] text-[16px] lg:text-[0.938vw] leading-[1.7] tracking-[0.36px]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {formatPrice(priceMax)}
                  </span>
                </div>
              </div>
            </FilterPanel>
          </aside>

          {/* === Cards grid === */}
          <div className="flex flex-col">
            <div
              ref={gridRef}
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-[20px] gap-y-[24px] md:gap-x-[28px] md:gap-y-[32px] lg:gap-x-[1.562vw] lg:gap-y-[1.562vw]"
            >
              {visible.length === 0 ? (
                <p
                  className="col-span-full text-center font-montserrat text-[#6d6d6d] py-[40px]
                             text-[14px] lg:text-[1.042vw]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  No projects match these filters — try resetting or broadening your selection.
                </p>
              ) : (
                visible.map((p) => <ProjectCard key={p.title} project={p} />)
              )}
            </div>

            {filteredAll.length > 0 && (
              <p
                className="mt-[16px] lg:mt-[1.042vw] text-center font-montserrat text-[#6d6d6d]
                           text-[12px] sm:text-[13px] lg:text-[0.781vw]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Showing {visible.length} of {filteredAll.length} project
                {filteredAll.length === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </div>

        {/* View More / Show Less */}
        {filteredAll.length > PAGE_SIZE && (
          <div className="mt-[36px] md:mt-[48px] lg:mt-[3.645vw] flex justify-center">
            <button
              type="button"
              onClick={hasMore ? handleViewMore : handleShowLess}
              className="relative inline-flex items-center justify-center
                         border border-[#ef493d]
                         w-[200px] h-[52px] md:w-[224px] md:h-[58px] lg:w-[11.666vw] lg:h-[3.020vw]
                         text-[#ef493d] hover:bg-[#ef493d] hover:text-white
                         font-montserrat font-medium capitalize
                         text-[15px] md:text-[16px] lg:text-[0.938vw]
                         transition-colors duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {hasMore ? "View More" : "Show Less"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
