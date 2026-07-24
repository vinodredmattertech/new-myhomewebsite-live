import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { registerGsap, splitToWords } from "@/lib/gsapSetup";
import {
  ChevronRight,
  CalendarDays,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import SectionLabel from "@/components/myhome/SectionLabel";
import { mediaUrl } from "@/lib/strapi";
import SectionHeading from "@/components/common/SectionHeading";

const HEADING_FONT = {
  fontFamily:
    '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
};
const BODY_FONT = { fontFamily: "Montserrat, sans-serif" };

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

function splitTags(tags) {
  return (tags || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function RelatedCard({ news }) {
  const href = news.slug ? `/news/${news.slug}` : "#";
  const image = mediaUrl(news.coverImage);
  const logo = mediaUrl(news.publicationLogo);
  return (
    <Link
      href={href}
      className="group flex items-stretch gap-[16px] lg:gap-[0.937vw]
                 border-b border-[#ededed] pb-[18px] lg:pb-[1.042vw] last:border-b-0 last:pb-0"
    >
      <div className="relative shrink-0 w-[96px] h-[78px] lg:w-[7.29vw] lg:h-[5.2vw] rounded-[8px] overflow-hidden bg-[#f5f1eb]">
        {image && (
          <Image
            src={image}
            alt={news.title}
            fill
            unoptimized
            sizes="120px"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.06]"
          />
        )}
      </div>
      <div className="flex flex-col justify-center gap-[6px] min-w-0">
        {logo ? (
          <span className="relative block w-[88px] h-[18px] lg:w-[5.2vw] lg:h-[1.15vw]">
            <Image
              src={logo}
              alt={news.publication || "Publication"}
              fill
              unoptimized
              sizes="120px"
              className="object-contain object-left"
            />
          </span>
        ) : (
          news.publication && (
            <span
              className="font-montserrat font-semibold uppercase tracking-[0.06em] text-[#ef493d] text-[10px] lg:text-[0.573vw]"
              style={BODY_FONT}
            >
              {news.publication}
            </span>
          )
        )}
        <h4
          className="font-montserrat font-medium text-[#333] leading-[1.35] text-[14px] lg:text-[0.833vw] line-clamp-2 transition-colors duration-300 group-hover:text-[#ef493d]"
          style={BODY_FONT}
        >
          {news.title}
        </h4>
        {news.publishedDate && (
          <span
            className="inline-flex items-center gap-[6px] font-montserrat text-[#6d6d6d] text-[11px] lg:text-[0.625vw]"
            style={BODY_FONT}
          >
            <CalendarDays className="w-[12px] h-[12px]" strokeWidth={1.5} />
            {formatDate(news.publishedDate)}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function NewsDetail({ news, related = [] }) {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const imgRef = useRef(null);

  const coverImage =
    mediaUrl(news?.coverImage) || "/assets/myhome/nri/hyderabad-1.jpg";
  const authorImage = mediaUrl(news?.authorImage);
  const publicationLogo = mediaUrl(news?.publicationLogo);
  const tags = splitTags(news?.tags);

  useGSAP(
    () => {
      registerGsap();
      gsap.set(imgRef.current, { scale: 1.12, autoAlpha: 0.7 });
      gsap.to(imgRef.current, {
        scale: 1,
        autoAlpha: 1,
        duration: 1.6,
        ease: "expo.out",
        delay: 0.1,
      });
      const words = splitToWords(headingRef.current);
      gsap.from(words, {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.05,
        ease: "expo.out",
        delay: 0.3,
      });
    },
    { scope: rootRef }
  );

  return (
    <article ref={rootRef} className="relative w-full bg-white">
      {/* Hero banner */}
      <section className="relative w-full overflow-hidden bg-[#2a2828] h-[70svh] min-h-[460px] lg:h-[42vw] lg:min-h-0">
        <div ref={imgRef} className="absolute inset-0 will-change-transform">
          <Image
            src={coverImage}
            alt={news?.title || "News cover"}
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/85" />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-[5] px-5 md:px-12 lg:px-[9.323vw] pb-[40px] sm:pb-[56px] lg:pb-[2.812vw]">
          <div className="flex flex-col items-start gap-[16px] lg:gap-[1.302vw] max-w-[62vw]">
            <div className="flex flex-wrap items-center gap-[12px]">
              {news?.mediaType && (
                <span
                  className="inline-flex items-center bg-[#ef493d] text-white rounded-full
                             px-[16px] py-[7px] lg:px-[1.042vw] lg:py-[0.417vw]
                             font-montserrat font-medium uppercase tracking-[0.06em]
                             text-[11px] lg:text-[0.625vw]"
                  style={BODY_FONT}
                >
                  {news.mediaType}
                </span>
              )}
              {news?.publication && (
                <span
                  className="font-montserrat font-medium text-white/90 text-[12px] lg:text-[0.781vw]"
                  style={BODY_FONT}
                >
                  {news.publication}
                </span>
              )}
            </div>
            <SectionHeading as="h1"
              ref={headingRef}
              className="text-white will-change-transform leading-[1.12] tracking-[0.015em]
                         text-[28px] xs:text-[32px] sm:text-[40px] md:text-[48px] lg:text-[2.917vw]"
            >
              {news?.title}
            </SectionHeading>
            <div
              className="flex flex-wrap items-center gap-x-[20px] gap-y-[8px] text-white/85 font-montserrat text-[13px] lg:text-[0.833vw]"
              style={BODY_FONT}
            >
              {news?.author && <span>By {news.author}</span>}
              {news?.publishedDate && (
                <span className="inline-flex items-center gap-[6px]">
                  <CalendarDays className="w-[15px] h-[15px]" strokeWidth={1.5} />
                  {formatDate(news.publishedDate)}
                </span>
              )}
              {news?.readTime && (
                <span className="inline-flex items-center gap-[6px]">
                  <Clock className="w-[15px] h-[15px]" strokeWidth={1.5} />
                  {news.readTime}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="px-5 md:px-12 lg:px-[9.323vw] pt-[24px] lg:pt-[1.562vw]">
        <nav
          className="flex items-center gap-[10px] lg:gap-[0.625vw] text-[#6d6d6d] font-montserrat text-[12px] lg:text-[0.781vw]"
          aria-label="Breadcrumb"
          style={BODY_FONT}
        >
          <Link href="/" className="hover:text-[#ef493d] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-[12px] h-[12px] opacity-70" />
          <Link href="/news" className="hover:text-[#ef493d] transition-colors">
            News &amp; Media
          </Link>
          <ChevronRight className="w-[12px] h-[12px] opacity-70" />
          <span className="text-[#333] line-clamp-1">{news?.title}</span>
        </nav>
      </div>

      {/* Body + sidebar */}
      <div className="relative px-5 md:px-12 lg:px-[9.323vw] pt-[36px] lg:pt-[2.604vw] pb-[60px] lg:pb-[5.208vw]">
        <div className="lg:absolute left-[4.16vw] top-[2.604vw] lg:block max-lg:static max-lg:w-full max-lg:flex max-lg:justify-center max-lg:mt-[15px] max-lg:mb-[18px]">
          <SectionLabel>News</SectionLabel>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_24vw] gap-x-[3.125vw] gap-y-[48px]">
          {/* Article body */}
          <div>
            {/* Publication / verified-by ribbon */}
            {/* {(publicationLogo || news?.publication || news?.author) && (
              <div className="mb-[28px] lg:mb-[1.667vw] flex flex-wrap items-center justify-between gap-[16px] rounded-[12px] border-[0.7px] border-[rgba(43,43,43,0.14)] bg-[rgba(221,221,221,0.10)] px-[20px] py-[16px] lg:px-[1.302vw] lg:py-[1.042vw]">
                <div className="flex items-center gap-[14px] lg:gap-[0.833vw]">
                  {publicationLogo ? (
                    <span className="relative block w-[130px] h-[28px] lg:w-[8.5vw] lg:h-[1.9vw]">
                      <Image
                        src={publicationLogo}
                        alt={news?.publication || "Publication"}
                        fill
                        unoptimized
                        sizes="200px"
                        className="object-contain object-left"
                      />
                    </span>
                  ) : (
                    news?.publication && (
                      <span
                        className="font-montserrat font-semibold text-[#1f2937] text-[16px] lg:text-[1.04vw]"
                        style={BODY_FONT}
                      >
                        {news.publication}
                      </span>
                    )
                  )}
                </div>
                {news?.author && (
                  <div className="flex flex-col">
                    <span
                      className="font-montserrat font-semibold uppercase tracking-[0.12em] text-[#9a9a9a] text-[10px] lg:text-[0.573vw]"
                      style={BODY_FONT}
                    >
                      Written and Verified By
                    </span>
                    <span
                      className="font-montserrat font-semibold text-[#1f2937] text-[14px] lg:text-[0.833vw]"
                      style={BODY_FONT}
                    >
                      {news.author}
                      {news?.authorRole ? (
                        <span className="font-normal text-[#6d6d6d]">
                          {" "}
                          · {news.authorRole}
                        </span>
                      ) : null}
                    </span>
                  </div>
                )}
              </div>
            )} */}

            {news?.excerpt && (
              <p
                className="font-montserrat font-light text-[#333] leading-[1.7]
                           text-[17px] lg:text-[1.04vw] mb-[28px] lg:mb-[1.667vw]
                           border-l-[3px] border-[#ef493d] pl-[18px] lg:pl-[1.042vw]"
                style={BODY_FONT}
              >
                {news.excerpt}
              </p>
            )}

            {news?.content ? (
              <div
                className="blog-content font-montserrat text-[#444] leading-[1.85]
                           text-[15px] lg:text-[0.938vw]"
                style={BODY_FONT}
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            ) : (
              <p
                className="font-montserrat text-[#6d6d6d] text-[15px] lg:text-[0.938vw]"
                style={BODY_FONT}
              >
                This coverage is being written — check back shortly.
              </p>
            )}

            {news?.externalUrl && (
              <a
                href={news.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-[32px] lg:mt-[1.875vw] inline-flex items-center gap-[10px]
                           border border-[#ef493d] text-[#ef493d] hover:bg-[#ef493d] hover:text-white
                           rounded-full px-[22px] py-[12px] lg:px-[1.302vw] lg:py-[0.729vw]
                           font-montserrat font-medium text-[14px] lg:text-[0.833vw]
                           transition-colors duration-300"
                style={BODY_FONT}
              >
                Read on {news.publication || "the publication"}
                <ExternalLink className="w-[16px] h-[16px]" strokeWidth={1.8} />
              </a>
            )}

            {tags.length > 0 && (
              <div className="mt-[36px] lg:mt-[2.083vw] flex flex-wrap items-center gap-[10px] lg:gap-[0.521vw]">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center bg-[rgba(221,221,221,0.18)] border-[0.5px] border-[#e7e7e7]
                               rounded-full px-[16px] py-[8px] lg:px-[1.042vw] lg:py-[0.417vw]
                               font-montserrat text-[#333] text-[12px] lg:text-[0.729vw]"
                    style={BODY_FONT}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* {(news?.author || authorImage) && (
              <div className="mt-[40px] lg:mt-[2.083vw] flex items-center gap-[16px] lg:gap-[0.937vw] border-t border-[#ededed] pt-[28px] lg:pt-[1.667vw]">
                {authorImage && (
                  <div className="relative w-[56px] h-[56px] lg:w-[3.125vw] lg:h-[3.125vw] rounded-full overflow-hidden bg-[#f5f1eb] shrink-0">
                    <Image
                      src={authorImage}
                      alt={news.author || "Author"}
                      fill
                      unoptimized
                      sizes="64px"
                      className="object-cover object-center"
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <span
                    className="font-montserrat font-semibold uppercase tracking-[0.12em] text-[#9a9a9a] text-[10px] lg:text-[0.573vw]"
                    style={BODY_FONT}
                  >
                    Written and Verified By
                  </span>
                  <span
                    className="font-montserrat font-semibold text-[#333] text-[15px] lg:text-[0.938vw]"
                    style={BODY_FONT}
                  >
                    {news?.author}
                  </span>
                  {news?.authorRole && (
                    <span
                      className="font-montserrat text-[#6d6d6d] text-[13px] lg:text-[0.781vw]"
                      style={BODY_FONT}
                    >
                      {news.authorRole}
                    </span>
                  )}
                </div>
              </div>
            )} */}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-[2.604vw] self-start">
            <h3
              className="text-[#333] mb-[20px] lg:mb-[1.302vw] leading-[1.2] text-[22px] lg:text-[1.354vw]"
              style={{ ...HEADING_FONT, fontWeight: 300 }}
            >
              More Coverage
            </h3>
            <div className="flex flex-col gap-[18px] lg:gap-[1.042vw]">
              {related.length > 0 ? (
                related.map((n) => <RelatedCard key={n.id} news={n} />)
              ) : (
                <p
                  className="font-montserrat text-[#9a9a9a] text-[13px] lg:text-[0.781vw]"
                  style={BODY_FONT}
                >
                  More stories coming soon.
                </p>
              )}
            </div>

            <Link
              href="/news"
              className="mt-[28px] lg:mt-[1.667vw] inline-flex items-center gap-[8px] text-[#ef493d]
                         font-montserrat font-medium text-[14px] lg:text-[0.833vw]"
              style={BODY_FONT}
            >
              View all coverage
              <ArrowRight className="w-[16px] h-[16px]" />
            </Link>
          </aside>
        </div>
      </div>
    </article>
  );
}
