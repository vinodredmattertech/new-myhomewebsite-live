import React, { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { registerGsap } from "@/lib/gsapSetup";
import SectionLabel from "@/components/myhome/SectionLabel";
import SectionHeading from "@/components/common/SectionHeading";

const BODY_FONT = { fontFamily: "Montserrat, sans-serif" };

/**
 * Above this label length a list is article headlines, not navigation labels.
 * Project and menu labels top out around 22 characters; a blog title runs 75
 * and a news headline 113, which is far too long to sit in a narrow track.
 */
const HEADLINE_LABEL_LENGTH = 40;

/** Past this many links a block is an archive, not a short menu. */
const ARCHIVE_LINK_COUNT = 8;

/**
 * SitemapDirectory — the readable index of every page on the site.
 *
 * This is the HTML counterpart to /sitemap_index.xml: the XML exists for
 * this exists for people who want to see the whole site at once. Both are fed
 * by `getHtmlSitemapGroups`/`SECTIONS` in lib/sitemap.js, so a page can never
 * appear in one and be missing from the other.
 *
 * Layout works in blocks. A group's own links are one block and each subgroup
 * is another, and the blocks sit side by side across three columns — so "Who We
 * Are" reads as its own links, then Sustainability, then Social Responsibility,
 * each a column. A block widens to the full row when it would not survive a
 * third of the width: an archive of 30-plus links, a list of article headlines,
 * or a group that has no subgroups to sit beside.
 */
function isWideBlock(block, blockCount) {
  if (blockCount === 1) return true;
  if (block.links.length > ARCHIVE_LINK_COUNT) return true;
  return block.links.some(
    (link) => String(link.label).length > HEADLINE_LABEL_LENGTH
  );
}

function LinkList({ links, wide }) {
  // Headlines keep one per row even across the full width; squeezed into thirds
  // they wrap to three ragged lines and the section stops looking like a list.
  const headlines = links.some(
    (link) => String(link.label).length > HEADLINE_LABEL_LENGTH
  );
  const columns = wide && !headlines ? "sm:grid-cols-2 lg:grid-cols-3" : "";

  return (
    <ul
      className={`m-0 p-0 list-none grid grid-cols-1 gap-x-[32px] lg:gap-x-[2.5vw]
                  gap-y-[10px] lg:gap-y-[0.6vw] ${columns}`}
    >
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="group inline-flex items-baseline gap-[8px] font-montserrat text-[#4a4a4a]
                       hover:text-[#ef493d] transition-colors
                       text-[14px] sm:text-[15px] lg:text-[0.885vw] leading-[1.6]"
            style={BODY_FONT}
          >
            <span
              className="inline-block w-[6px] h-px bg-[#c9c9c9] group-hover:bg-[#ef493d]
                         transition-colors translate-y-[-4px] shrink-0"
              aria-hidden="true"
            />
            <span>{link.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function SitemapDirectory({ label = "Sitemap", groups = [] }) {
  const rootRef = useRef(null);

  useGSAP(
    () => {
      registerGsap();
      gsap.registerPlugin(ScrollTrigger);

      const targets = rootRef.current?.querySelectorAll("[data-reveal]");
      if (!targets?.length) return;

      gsap.from(targets, {
        y: 30,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 85%" },
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      data-section="sitemap-directory"
      className="relative w-full bg-white text-[#1b1a1a]
                 pt-[44px] pb-[56px] lg:pt-[4.166vw] lg:pb-[5.208vw]"
    >
      {/* Vertical side label — desktop only, same rail as the other sections */}
      {label && (
        <div className="lg:absolute left-[4.166vw] top-[4.4vw] z-[5] lg:block max-lg:static max-lg:w-full max-lg:flex max-lg:justify-center max-lg:mt-[15px] max-lg:mb-[18px]">
          <SectionLabel>{label}</SectionLabel>
        </div>
      )}

      <div className="px-5 md:px-12 lg:px-[9.323vw]">
        {/* <p
          className="font-montserrat text-[#6d6d6d] max-w-[720px] lg:max-w-[46vw]
                     text-[14px] sm:text-[15px] lg:text-[0.885vw] leading-[1.8]"
          style={BODY_FONT}
          data-reveal
        >
          Every page on myhomeconstructions.com, in one place. Browse by section
          below, or jump straight to a project.
        </p> */}

        <div className="mt-[34px] lg:mt-[2.6vw] flex flex-col gap-[38px] lg:gap-[2.8vw]">
          {groups.map((group) => {
            // The group's own links lead, then one block per subgroup.
            const blocks = [
              ...(group.links.length ? [{ title: null, links: group.links }] : []),
              ...group.subgroups,
            ];
            // Only reserve a heading row when a sibling actually has one, so a
            // group without subgroups doesn't grow a blank line above its links.
            const anyTitled = blocks.some((block) => block.title);

            return (
              <div key={group.title} data-reveal>
                <SectionHeading
                  as="h2"
                  className="capitalize text-[#1b1a1a] leading-[1.15]
                             text-[22px] sm:text-[26px] lg:text-[1.75vw]"
                >
                  {group.title}
                </SectionHeading>

                <div
                  className="h-px w-full bg-[#e7e7e7] mt-[14px] lg:mt-[0.9vw]"
                  aria-hidden="true"
                />

                <div
                  className="mt-[18px] lg:mt-[1.15vw] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                             gap-x-[32px] lg:gap-x-[2.5vw] gap-y-[24px] lg:gap-y-[1.6vw] items-start"
                >
                  {blocks.map((block, index) => {
                    const wide = isWideBlock(block, blocks.length);
                    return (
                      <div
                        key={block.title || `links-${index}`}
                        className={wide ? "sm:col-span-2 lg:col-span-3" : ""}
                      >
                        {block.title ? (
                          <h3
                            className="font-montserrat font-medium uppercase text-[#9a9a9a]
                                       tracking-[0.14em] text-[11px] sm:text-[12px] lg:text-[0.68vw]
                                       mb-[12px] lg:mb-[0.75vw]"
                            style={BODY_FONT}
                          >
                            {block.title}
                          </h3>
                        ) : (
                          anyTitled && (
                            <div
                              className="hidden lg:block h-[0.68vw] mb-[12px] lg:mb-[0.75vw]"
                              aria-hidden="true"
                            />
                          )
                        )}
                        <LinkList links={block.links} wide={wide} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
