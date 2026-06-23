import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import { CalendarDays, Clock, ArrowUpRight, ArrowRight, Check, ChevronDown } from "lucide-react";
import SectionLabel from "@/components/myhome/SectionLabel";
import { mediaUrl } from "@/lib/strapi";
import SectionHeading from "@/components/common/SectionHeading";

const PAGE_SIZE = 6;

const FILTERS = [
  { key: "all", label: "All", Icon: null },
  { key: "featured", label: "Featured", Icon: FeaturedIcon },
  { key: "recent", label: "Recently Published", Icon: RecentIcon },
  { key: "month", label: "Month", Icon: MonthIcon },
];

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normaliseCmsBlog(b) {
  return {
    title: b.title || "",
    excerpt: b.excerpt || "",
    category: b.category || "Uncategorised",
    author: b.author || "",
    readTime: b.readTime || "",
    publishedDate: b.publishedDate || "",
    image: mediaUrl(b.coverImage),
    featured: !!b.featured,
    href: b.slug ? `/blogs/${b.slug}` : "#",
  };
}

const HEADING_FONT = {
  fontFamily:
    '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
};
const BODY_FONT = { fontFamily: "Montserrat, sans-serif" };

/* ── Filter tab icons (inline so they inherit the active/idle text colour) ── */
function FeaturedIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M9.5 2.17712C8.97908 2.17712 8.46688 2.34496 7.18833 2.78196L6.7355 2.93712C5.53771 3.34721 4.6645 3.64646 4.05175 3.89504C3.81674 3.98598 3.58821 4.09283 3.36775 4.21487C3.31062 4.24808 3.25562 4.28483 3.20308 4.32491C3.18737 4.33673 3.1728 4.34998 3.15954 4.3645C3.14915 4.38312 3.14066 4.40275 3.13421 4.42308C3.11838 4.46636 3.10175 4.5318 3.08433 4.61942C3.04056 4.8701 3.01411 5.12351 3.00517 5.37783C2.96875 6.04362 2.96875 6.97304 2.96875 8.24683V9.49291C2.96875 13.5906 6.0325 15.607 8.07421 16.4984C8.36792 16.6266 8.53813 16.6995 8.72733 16.7477C8.90783 16.7945 9.12792 16.823 9.5 16.823C9.87208 16.823 10.0922 16.7945 10.2727 16.7477C10.4627 16.7002 10.6321 16.6266 10.9258 16.4984C12.9683 15.607 16.0312 13.5898 16.0312 9.49291V8.24683C16.0312 6.97304 16.0313 6.04362 15.9948 5.37783C15.9859 5.12351 15.9594 4.8701 15.9157 4.61942C15.9032 4.55297 15.8866 4.48739 15.8658 4.42308C15.8593 4.40275 15.8509 4.38312 15.8405 4.3645C15.8272 4.34998 15.8126 4.33673 15.7969 4.32491C15.7444 4.28456 15.6894 4.24755 15.6323 4.21408C15.4117 4.09258 15.1832 3.98625 14.9483 3.89583C14.3355 3.64646 13.4623 3.34721 12.2645 2.93792L11.8109 2.78196C10.5331 2.34496 10.0209 2.17712 9.5 2.17712ZM6.90571 1.62375C8.04887 1.23267 8.75821 0.989624 9.5 0.989624C10.2418 0.989624 10.9511 1.23267 12.0943 1.62375L12.1956 1.65858L12.6698 1.82087C13.8423 2.22225 14.748 2.53258 15.3955 2.79542C15.7217 2.92762 16.0028 3.05667 16.2284 3.18729C16.4461 3.31396 16.6638 3.4715 16.8118 3.68287C16.9583 3.89108 17.0343 4.14758 17.0818 4.39537C17.1317 4.65187 17.161 4.95983 17.1807 5.31371C17.2188 6.01512 17.2188 6.97779 17.2188 8.22546V9.49291C17.2188 14.3229 13.5708 16.6385 11.4016 17.5869L11.3802 17.5956C11.111 17.7136 10.8577 17.8236 10.5672 17.898C10.2608 17.9772 9.93463 18.0105 9.5 18.0105C9.06458 18.0105 8.74 17.9772 8.43283 17.898C8.14229 17.8236 7.88896 17.7136 7.61979 17.5956L7.59842 17.5869C5.42925 16.6385 1.78125 14.3229 1.78125 9.49212V8.22546C1.78125 6.97779 1.78125 6.01512 1.81925 5.31291C1.83904 4.95983 1.86833 4.65187 1.91821 4.39458C1.96571 4.14758 2.04171 3.89108 2.18738 3.68208C2.33621 3.4715 2.55392 3.31396 2.77162 3.18729C2.99725 3.05667 3.27829 2.92762 3.60446 2.79542C4.25204 2.53258 5.15771 2.22225 6.33017 1.82167L6.80438 1.65858L6.90571 1.62375ZM9.5 6.255C9.36426 6.46871 9.23645 6.68736 9.11683 6.9105L9.01392 7.09654L8.99017 7.13929C8.90308 7.29604 8.78671 7.50821 8.59433 7.65387C8.39721 7.8035 8.1605 7.85575 7.99108 7.89296L7.94517 7.90325L7.74329 7.94837C7.37517 8.03229 7.14558 8.08533 6.99121 8.13916C7.08621 8.28246 7.24692 8.47166 7.50658 8.77487L7.64433 8.93558L7.676 8.97279C7.79238 9.10737 7.94833 9.28787 8.01958 9.51904C8.09083 9.74862 8.06708 9.98533 8.04887 10.1658L8.04413 10.2149L8.02275 10.4295C7.98554 10.8126 7.96338 11.0604 7.96338 11.2354C8.11617 11.1815 8.32438 11.0865 8.64262 10.9401L8.83104 10.853L8.87458 10.8332C9.03133 10.7596 9.253 10.6559 9.5 10.6559C9.747 10.6559 9.96867 10.7596 10.1254 10.8332L10.169 10.8538L10.3574 10.9409C10.6756 11.0865 10.8838 11.1815 11.0366 11.2354C11.0366 11.0604 11.0145 10.8126 10.9773 10.4295L10.9559 10.2157L10.9511 10.1658C10.9329 9.98533 10.9092 9.74862 10.9804 9.51904C11.0517 9.28787 11.2076 9.10737 11.3248 8.97279L11.3565 8.93558L11.4934 8.77487C11.7531 8.47166 11.913 8.28246 12.008 8.13916C11.8544 8.08533 11.6248 8.03229 11.2559 7.94916L11.0548 7.90325L11.0089 7.89296C10.8395 7.85575 10.6028 7.8035 10.4065 7.65387C10.2133 7.50821 10.0969 7.29604 10.0106 7.13929L9.98687 7.09654L9.88317 6.9105C9.76357 6.68709 9.63576 6.46897 9.5 6.255ZM8.61571 5.44987C8.78671 5.22662 9.06538 4.94717 9.5 4.94717C9.93463 4.94717 10.2133 5.22662 10.3843 5.44987C10.5482 5.66441 10.7168 5.96683 10.8997 6.29458L10.9202 6.331L11.0232 6.51704L11.1285 6.69912L11.1799 6.71258L11.3169 6.74425L11.5188 6.78937L11.5599 6.79887C11.9138 6.87883 12.2439 6.95325 12.4933 7.05221C12.7625 7.15829 13.0894 7.34987 13.2153 7.75441C13.3396 8.15262 13.1868 8.49621 13.0332 8.74083C12.8883 8.97041 12.6651 9.23166 12.4228 9.51508L12.3959 9.54675L12.2582 9.70666L12.1648 9.8175L12.1196 9.87371C12.1238 9.94934 12.1301 10.0248 12.1386 10.1001L12.1624 10.3542C12.1996 10.7342 12.2336 11.0802 12.221 11.3525C12.2083 11.636 12.1418 12.016 11.8045 12.2709C11.4586 12.5345 11.0715 12.483 10.7968 12.4039C10.5395 12.3302 10.2307 12.1885 9.89979 12.0357L9.861 12.0183L9.67258 11.9312L9.5 11.8537L9.45646 11.8727L9.32742 11.9312L9.139 12.0183L9.10021 12.0357C8.76929 12.1885 8.46054 12.3302 8.20325 12.4039C7.92854 12.483 7.54142 12.5345 7.19546 12.2709C6.85821 12.016 6.79171 11.636 6.77904 11.3525C6.76638 11.0802 6.80042 10.7342 6.83683 10.355L6.84079 10.3139L6.86137 10.1001C6.87325 9.97979 6.87879 9.91804 6.88037 9.87371L6.83525 9.8175L6.74183 9.70666L6.60408 9.54596L6.57717 9.51508C6.33492 9.23166 6.11167 8.97041 5.96758 8.74083C5.81321 8.49621 5.66042 8.15262 5.78471 7.75441C5.91058 7.35066 6.23675 7.15829 6.50671 7.05221C6.75608 6.95325 7.08621 6.87883 7.44088 6.79887L7.48125 6.78937L7.68313 6.74425L7.87233 6.69912L7.904 6.6445L7.97604 6.51783L8.07975 6.331L8.10033 6.29458C8.28242 5.96683 8.45183 5.66441 8.61571 5.44987Z" fill="currentColor" />
    </svg>
  );
}

function RecentIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9.50033 3.76038C8.74659 3.76038 8.00024 3.90883 7.30388 4.19728C6.60752 4.48572 5.9748 4.90849 5.44183 5.44146C4.90886 5.97443 4.48608 6.60716 4.19764 7.30352C3.9092 7.99987 3.76074 8.74623 3.76074 9.49996C3.76074 10.2537 3.9092 11 4.19764 11.6964C4.48608 12.3928 4.90886 13.0255 5.44183 13.5585C5.9748 14.0914 6.60752 14.5142 7.30388 14.8026C8.00024 15.0911 8.74659 15.2395 9.50033 15.2395C11.0226 15.2395 12.4824 14.6348 13.5588 13.5585C14.6352 12.4821 15.2399 11.0222 15.2399 9.49996C15.2399 7.97773 14.6352 6.51784 13.5588 5.44146C12.4824 4.36508 11.0226 3.76038 9.50033 3.76038ZM2.57324 9.49996C2.57324 7.66278 3.30306 5.90085 4.60214 4.60177C5.90122 3.30269 7.66315 2.57288 9.50033 2.57288C11.3375 2.57288 13.0994 3.30269 14.3985 4.60177C15.6976 5.90085 16.4274 7.66278 16.4274 9.49996C16.4274 11.3371 15.6976 13.0991 14.3985 14.3981C13.0994 15.6972 11.3375 16.427 9.50033 16.427C7.66315 16.427 5.90122 15.6972 4.60214 14.3981C3.30306 13.0991 2.57324 11.3371 2.57324 9.49996ZM9.50033 5.73954C9.6578 5.73954 9.80882 5.8021 9.92017 5.91345C10.0315 6.0248 10.0941 6.17582 10.0941 6.33329V9.25454L11.5032 10.6637C11.5616 10.7181 11.6084 10.7836 11.6408 10.8565C11.6733 10.9293 11.6907 11.0079 11.6921 11.0876C11.6935 11.1674 11.6789 11.2465 11.649 11.3205C11.6191 11.3944 11.5747 11.4616 11.5183 11.5179C11.4619 11.5743 11.3948 11.6188 11.3208 11.6486C11.2469 11.6785 11.1677 11.6932 11.088 11.6918C11.0083 11.6904 10.9296 11.6729 10.8568 11.6405C10.784 11.608 10.7184 11.5612 10.6641 11.5029L9.08074 9.91954C8.96936 9.8083 8.90671 9.65738 8.90658 9.49996V6.33329C8.90658 6.17582 8.96913 6.0248 9.08048 5.91345C9.19183 5.8021 9.34285 5.73954 9.50033 5.73954Z" fill="currentColor" />
    </svg>
  );
}

function MonthIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16.625 1.9H13.775V0.475C13.775 0.349022 13.725 0.228204 13.6359 0.139124C13.5468 0.0500446 13.426 0 13.3 0C13.174 0 13.0532 0.0500446 12.9641 0.139124C12.875 0.228204 12.825 0.349022 12.825 0.475V1.9H6.175V0.475C6.175 0.349022 6.12496 0.228204 6.03588 0.139124C5.9468 0.0500446 5.82598 0 5.7 0C5.57402 0 5.4532 0.0500446 5.36412 0.139124C5.27504 0.228204 5.225 0.349022 5.225 0.475V1.9H2.375C1.74534 1.90075 1.14169 2.15122 0.696454 2.59645C0.251219 3.04169 0.000754232 3.64534 0 4.275V16.625C0.000754232 17.2547 0.251219 17.8583 0.696454 18.3035C1.14169 18.7488 1.74534 18.9992 2.375 19H16.625C17.2549 19 17.859 18.7498 18.3044 18.3044C18.7498 17.859 19 17.2549 19 16.625V4.275C19 3.64511 18.7498 3.04102 18.3044 2.59562C17.859 2.15022 17.2549 1.9 16.625 1.9ZM18.05 16.625C18.05 17.0029 17.8999 17.3654 17.6326 17.6326C17.3654 17.8999 17.0029 18.05 16.625 18.05H2.375C1.99707 18.05 1.63461 17.8999 1.36737 17.6326C1.10013 17.3654 0.95 17.0029 0.95 16.625V8.55H18.05V16.625ZM18.05 7.6H0.95V4.275C0.95 3.4884 1.5865 2.85 2.375 2.85H5.225V4.275C5.225 4.40098 5.27504 4.5218 5.36412 4.61088C5.4532 4.69996 5.57402 4.75 5.7 4.75C5.82598 4.75 5.9468 4.69996 6.03588 4.61088C6.12496 4.5218 6.175 4.40098 6.175 4.275V2.85H12.825V4.275C12.825 4.40098 12.875 4.5218 12.9641 4.61088C13.0532 4.69996 13.174 4.75 13.3 4.75C13.426 4.75 13.5468 4.69996 13.6359 4.61088C13.725 4.5218 13.775 4.40098 13.775 4.275V2.85H16.625C17.0029 2.85 17.3654 3.00013 17.6326 3.26737C17.8999 3.53461 18.05 3.89707 18.05 4.275V7.6Z" fill="currentColor" />
    </svg>
  );
}

function MetaRow({ blog, className = "" }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-[18px] gap-y-[6px] font-montserrat text-[#6d6d6d] ${className}`}
      style={BODY_FONT}
    >
      {blog.publishedDate && (
        <span className="inline-flex items-center gap-[6px]">
          <CalendarDays className="w-[14px] h-[14px]" strokeWidth={1.5} />
          {formatDate(blog.publishedDate)}
        </span>
      )}
      {blog.readTime && (
        <span className="inline-flex items-center gap-[6px]">
          <Clock className="w-[14px] h-[14px]" strokeWidth={1.5} />
          {blog.readTime}
        </span>
      )}
    </div>
  );
}

function CategoryTag({ children }) {
  return (
    <span
      className="inline-flex items-center bg-[#fff] text-[#333] rounded-full
                 px-[14px] py-[6px] lg:px-[0.833vw] lg:py-[0.365vw]
                 font-montserrat font-medium uppercase tracking-[0.06em]
                 text-[11px] lg:text-[0.625vw]"
      style={BODY_FONT}
    >
      {children}
    </span>
  );
}

/** Large hero article — the left-hand featured card in the design. */
function FeaturedCard({ blog }) {
  return (
    <Link
      href={blog.href}
      className="group relative flex flex-col bg-white border-[0.7px] border-[rgba(43,43,43,0.14)]
                 rounded-[12px] overflow-hidden h-full
                 transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]"
    >
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#f5f1eb]">
        {blog.image && (
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            unoptimized
            sizes="(min-width:1024px) 60vw, 100vw"
            className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        )}
        <div className="absolute top-[16px] left-[16px] lg:top-[1.042vw] lg:left-[1.042vw]">
          <CategoryTag>{blog.category}</CategoryTag>
        </div>
      </div>

      <div className="flex flex-col gap-[14px] lg:gap-[0.833vw] px-[24px] lg:px-[1.562vw] py-[26px] lg:py-[1.667vw]">
        <MetaRow blog={blog} className="text-[12px] lg:text-[0.729vw]" />
        <h3
          className="text-[#333] leading-[1.18] tracking-[0.01em]
                     text-[24px] sm:text-[30px] lg:text-[1.875vw]"
          style={{ ...HEADING_FONT, fontWeight: 300 }}
        >
          {blog.title}
        </h3>
        <p
          className="font-montserrat font-light text-[#555]
                     text-[14px] lg:text-[0.833vw] leading-[1.7]"
          style={BODY_FONT}
        >
          {blog.excerpt}
        </p>
        <span
          className="mt-[6px] inline-flex items-center gap-[8px] text-[#ef493d]
                     font-montserrat font-medium text-[14px] lg:text-[0.833vw]"
          style={BODY_FONT}
        >
          Read More
          <ArrowRight className="w-[16px] h-[16px] transition-transform duration-300 group-hover:translate-x-[4px]" />
        </span>
      </div>
    </Link>
  );
}

/** Compact horizontal card used in the "Other Articles" rail. */
function SideCard({ blog }) {
  return (
    <Link
      href={blog.href}
      className="group flex items-stretch gap-[16px] lg:gap-[0.937vw]
                 border-b border-[#ededed] pb-[18px] lg:pb-[1.042vw] last:border-b-0 last:pb-0"
    >
      <div className="relative shrink-0 w-[96px] h-[78px] lg:w-[7.29vw] lg:h-[5.2vw] rounded-[8px] overflow-hidden bg-[#f5f1eb]">
        {blog.image && (
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            unoptimized
            sizes="120px"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.06]"
          />
        )}
      </div>
      <div className="flex flex-col justify-center gap-[6px] min-w-0">
        <span
          className="font-montserrat font-semibold uppercase tracking-[0.06em] text-[#ef493d]
                     text-[10px] lg:text-[0.573vw]"
          style={BODY_FONT}
        >
          {blog.category}
        </span>
        <h4
          className="font-montserrat font-medium text-[#333] leading-[1.35]
                     text-[14px] lg:text-[0.833vw] line-clamp-2
                     transition-colors duration-300 group-hover:text-[#ef493d]"
          style={BODY_FONT}
        >
          {blog.title}
        </h4>
        <MetaRow blog={blog} className="text-[11px] lg:text-[0.625vw]" />
      </div>
    </Link>
  );
}

/** Standard article card for the grid below the hero. */
function GridCard({ blog }) {
  return (
    <Link
      href={blog.href}
      className="group relative flex flex-col bg-white border-[0.7px] border-[rgba(43,43,43,0.14)]
                 rounded-[12px] overflow-hidden
                 transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]"
    >
      <div className="relative w-full aspect-[16/11] overflow-hidden bg-[#f5f1eb]">
        {blog.image && (
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            unoptimized
            sizes="(min-width:1024px) 28vw, (min-width:640px) 45vw, 90vw"
            className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          />
        )}
        <div className="absolute top-[14px] left-[14px] lg:top-[0.833vw] lg:left-[0.833vw]">
          <CategoryTag>{blog.category}</CategoryTag>
        </div>
      </div>
      <div className="flex flex-col gap-[12px] lg:gap-[0.625vw] px-[22px] lg:px-[1.302vw] py-[22px] lg:py-[1.302vw]">
        <MetaRow blog={blog} className="text-[11px] lg:text-[0.625vw]" />
        <h3
          className="text-[#333] leading-[1.25]
                     text-[18px] lg:text-[1.146vw] line-clamp-2"
          style={{ ...HEADING_FONT, fontWeight: 300 }}
        >
          {blog.title}
        </h3>
        <p
          className="font-montserrat font-light text-[#555] text-[13px] lg:text-[0.729vw] leading-[1.6] line-clamp-2"
          style={BODY_FONT}
        >
          {blog.excerpt}
        </p>
        <span
          className="mt-[2px] inline-flex items-center gap-[6px] text-[#ef493d] font-montserrat font-medium text-[13px] lg:text-[0.729vw]"
          style={BODY_FONT}
        >
          Read More
          <ArrowUpRight className="w-[15px] h-[15px] transition-transform duration-300 group-hover:translate-x-[3px] group-hover:-translate-y-[2px]" />
        </span>
      </div>
    </Link>
  );
}

export default function BlogListing({
  blogs = [],
  heading,
  sectionLabel,
  otherArticlesHeading,
}) {
  const BLOGS = blogs.map(normaliseCmsBlog).filter((b) => b.title);

  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const gridRef = useRef(null);

  // Active filter mode: "all" | "featured" | "recent" | "month"
  const [filter, setFilter] = useState("all");
  // Selected month for the Month filter, stored as "YYYY-MM" (e.g. "2026-06").
  const [selectedMonth, setSelectedMonth] = useState("");
  const [monthOpen, setMonthOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const monthMenuRef = useRef(null);

  // Distinct months that actually have published blogs, newest first.
  // Each option: { value: "YYYY-MM", label: "June 2026" }.
  const monthOptions = useMemo(() => {
    const map = new Map();
    BLOGS.forEach((b) => {
      if (!b.publishedDate) return;
      const d = new Date(b.publishedDate);
      if (Number.isNaN(d.getTime())) return;
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map.has(value)) {
        map.set(value, {
          value,
          label: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.value.localeCompare(a.value));
  }, [BLOGS]);

  // Close the month dropdown when clicking outside it.
  useEffect(() => {
    if (!monthOpen) return;
    const onClick = (e) => {
      if (monthMenuRef.current && !monthMenuRef.current.contains(e.target)) {
        setMonthOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [monthOpen]);

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

  const monthKeyOf = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const filtered = useMemo(() => {
    let list = [...BLOGS];

    if (filter === "featured") {
      // Only blogs explicitly marked as featured.
      list = list.filter((b) => b.featured);
    } else if (filter === "recent") {
      // Newest published first.
      list = list.sort(
        (a, b) => new Date(b.publishedDate) - new Date(a.publishedDate)
      );
    } else if (filter === "month") {
      // Only blogs published in the chosen month (no month chosen → nothing).
      list = selectedMonth
        ? list.filter((b) => monthKeyOf(b.publishedDate) === selectedMonth)
        : [];
    }

    return list;
  }, [BLOGS, filter, selectedMonth]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, selectedMonth]);

  const featured = filtered[0] || null;
  const sideArticles = filtered.slice(1, 4);
  const rest = filtered.slice(4);
  const visibleRest = rest.slice(0, visibleCount);
  const hasMore = visibleCount < rest.length;

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

  const onFilterChange = (key) => {
    if (key === "month") {
      // Toggle the month dropdown; the actual filtering happens on selection.
      setMonthOpen((open) => !open);
      return;
    }
    setMonthOpen(false);
    if (key === filter) return;
    animateGrid(() => setFilter(key));
  };

  const onSelectMonth = (value) => {
    setMonthOpen(false);
    animateGrid(() => {
      setFilter("month");
      setSelectedMonth(value);
    });
  };

  return (
    <section
      ref={rootRef}
      className="relative w-full bg-white overflow-hidden
                 pt-[60px] md:pt-[80px] lg:pt-[4.687vw]
                 pb-[60px] md:pb-[80px] lg:pb-[5.208vw]"
      data-section="blog-listing"
    >
      <div className="absolute left-[20px] top-[40px] lg:left-[4.16vw] lg:top-[4.687vw] z-10">
        <SectionLabel>{sectionLabel || "Our Blogs & Articles"}</SectionLabel>
      </div>

      <div className="px-5 md:px-10 lg:px-[8.333vw]">
        <SectionHeading
          ref={headingRef}
          className="text-[#333] capitalize text-center will-change-transform leading-[1.05] tracking-[0.02em]
                     text-[36px] xs:text-[44px] sm:text-[56px] md:text-[72px] lg:text-[4vw]
                     max-w-[1100px] mx-auto"
        >
          {heading || "Market Insights & Lifestyle Stories"}
        </SectionHeading>

        {/* Filter tabs */}
        <div className="mt-[36px] md:mt-[48px] lg:mt-[3.125vw] flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-[10px] lg:gap-[0.625vw]">
            {FILTERS.map(({ key, label, Icon }) => {
              const isActive = filter === key;
              const isMonth = key === "month";
              const monthLabel =
                isMonth && selectedMonth
                  ? monthOptions.find((m) => m.value === selectedMonth)?.label ||
                    label
                  : label;
              return (
                <div
                  key={key}
                  className="relative"
                  ref={isMonth ? monthMenuRef : null}
                >
                  <button
                    type="button"
                    onClick={() => onFilterChange(key)}
                    className={`inline-flex items-center gap-[7px] lg:gap-[0.417vw]
                                font-montserrat font-normal capitalize transition-all duration-300
                                rounded-full border
                                px-[18px] py-[9px] md:px-[22px] md:py-[11px]
                                lg:px-[1.302vw] lg:py-[0.625vw]
                                text-[13px] sm:text-[15px] lg:text-[0.938vw]
                                ${
                                  isActive
                                    ? "bg-[#ef493d] text-white border-[#ef493d]"
                                    : "bg-transparent text-[#454545] border-[#e7e7e7] hover:border-[#ef493d] hover:text-[#ef493d]"
                                }`}
                    style={BODY_FONT}
                    aria-pressed={isActive}
                    aria-expanded={isMonth ? monthOpen : undefined}
                  >
                    {key === "all" && isActive ? (
                      <Check
                        className="w-[15px] h-[15px] lg:w-[0.938vw] lg:h-[0.938vw]"
                        strokeWidth={2.5}
                      />
                    ) : (
                      Icon && (
                        <Icon className="w-[15px] h-[15px] lg:w-[0.938vw] lg:h-[0.938vw]" />
                      )
                    )}
                    {monthLabel}
                    {isMonth && (
                      <ChevronDown
                        className={`w-[15px] h-[15px] lg:w-[0.938vw] lg:h-[0.938vw] transition-transform duration-300 ${
                          monthOpen ? "rotate-180" : ""
                        }`}
                        strokeWidth={1.8}
                      />
                    )}
                  </button>

                  {isMonth && monthOpen && (
                    <div
                      className="absolute left-0 top-[calc(100%+8px)] z-20 min-w-[180px] lg:min-w-[11vw]
                                 max-h-[280px] overflow-y-auto rounded-[12px] border border-[#ededed]
                                 bg-white py-[6px] shadow-[0_20px_45px_-20px_rgba(0,0,0,0.35)]"
                    >
                      {monthOptions.length === 0 ? (
                        <p
                          className="px-[16px] py-[10px] font-montserrat text-[#9a9a9a] text-[13px] lg:text-[0.781vw]"
                          style={BODY_FONT}
                        >
                          No dated articles.
                        </p>
                      ) : (
                        monthOptions.map((m) => {
                          const active = selectedMonth === m.value;
                          return (
                            <button
                              key={m.value}
                              type="button"
                              onClick={() => onSelectMonth(m.value)}
                              className={`flex w-full items-center justify-between gap-[10px]
                                          px-[16px] py-[10px] text-left font-montserrat
                                          text-[13px] lg:text-[0.833vw] transition-colors
                                          ${
                                            active
                                              ? "text-[#ef493d] bg-[#fdecea]"
                                              : "text-[#454545] hover:bg-[#f7f7f7]"
                                          }`}
                              style={BODY_FONT}
                            >
                              {m.label}
                              {active && (
                                <Check className="w-[14px] h-[14px]" strokeWidth={2.5} />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Featured + Other Articles */}
        <div ref={gridRef} className="mt-[32px] md:mt-[40px] lg:mt-[2.604vw]">
          {filtered.length === 0 ? (
            <p
              className="text-center font-montserrat text-[#6d6d6d] py-[60px] text-[14px] lg:text-[1.042vw]"
              style={BODY_FONT}
            >
              {filter === "month" && !selectedMonth
                ? "Pick a month to see articles published then."
                : "No articles match — try a different filter or keyword."}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_24vw] gap-x-[2.083vw] gap-y-[36px]">
                {featured && <FeaturedCard blog={featured} />}

                <aside className="flex flex-col">
                  <h3
                    className="text-[#333] mb-[20px] lg:mb-[1.302vw] leading-[1.2]
                               text-[22px] lg:text-[1.354vw]"
                    style={{ ...HEADING_FONT, fontWeight: 300 }}
                  >
                    {otherArticlesHeading || "Other Articles"}
                  </h3>
                  <div className="flex flex-col gap-[18px] lg:gap-[1.042vw]">
                    {sideArticles.length > 0 ? (
                      sideArticles.map((b) => (
                        <SideCard key={b.href + b.title} blog={b} />
                      ))
                    ) : (
                      <p
                        className="font-montserrat text-[#9a9a9a] text-[13px] lg:text-[0.781vw]"
                        style={BODY_FONT}
                      >
                        More stories coming soon.
                      </p>
                    )}
                  </div>
                </aside>
              </div>

              {/* Remaining articles grid */}
              {rest.length > 0 && (
                <div className="mt-[44px] md:mt-[56px] lg:mt-[3.125vw]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[20px] gap-y-[24px] md:gap-x-[28px] md:gap-y-[32px] lg:gap-x-[1.562vw] lg:gap-y-[1.562vw]">
                    {visibleRest.map((b) => (
                      <GridCard key={b.href + b.title} blog={b} />
                    ))}
                  </div>

                  {rest.length > PAGE_SIZE && (
                    <div className="mt-[36px] md:mt-[48px] lg:mt-[3.125vw] flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          hasMore
                            ? setVisibleCount((c) =>
                                Math.min(c + PAGE_SIZE, rest.length)
                              )
                            : setVisibleCount(PAGE_SIZE)
                        }
                        className="relative inline-flex items-center justify-center
                                   border border-[#ef493d]
                                   w-[200px] h-[52px] md:w-[224px] md:h-[58px] lg:w-[11.666vw] lg:h-[3.020vw]
                                   text-[#ef493d] hover:bg-[#ef493d] hover:text-white
                                   font-montserrat font-medium capitalize
                                   text-[15px] md:text-[16px] lg:text-[0.938vw]
                                   transition-colors duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        style={BODY_FONT}
                      >
                        {hasMore ? "View More" : "Show Less"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
