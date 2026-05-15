"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

const safeDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const pick = (item, keys) => {
  for (const k of keys) {
    const v = item?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return "";
};

export default function RecentList({
  title = "Recent",
  items = [],
  basePath = "", // e.g. "/blogs" | "/news" | "/events"
  limit = 4,
  sortBy = "date", // "date" | "none"
  showDate = true,
  className = "",
}) {


  const list = useMemo(() => {
    const normalized = (items || [])
      .filter((x) => x && typeof pick(x, ["slug", "id"]) === "string" ? true : true)
      .map((x) => ({
        raw: x,
        slug: pick(x, ["slug"]),
        title: pick(x, ["title", "Title", "name", "heading"]),
        date: pick(x, ["date", "Date"]),
        image: pick(x, ["thumbnail", "thumbnailImage", "thumb", "image", "cover"]),
        excerpt: pick(x, ["excerpt", "summary", "shortDesc"]),
      }))
     .filter((x) => x.title && x.slug);

    if (sortBy === "date") {
      normalized.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return normalized.slice(0, limit);
  }, [items, limit, sortBy]);

  return (
    <aside
      className={[
        "w-full rounded-2xl  overflow-hidden",
        className,
      ].join(" ")}
    >
      {/* Header */}
      <div className="px-5 sm:px-6 py-2 border-b border-[#EFE7DC]">
        <p className="text-[#7C7262] content ">
          {title}
        </p>
      </div>

      {/* List */}
      <div className="p-4 sm:p-5 space-y-4">
        {list.length === 0 ? (
          <p className="text-[#7B766C] text-[13px] sm:text-[14px]">
            No items available.
          </p>
        ) : (
          list.map((it) => (
            <a
              key={it.slug}
              href={`${basePath}/${it.slug}`}
              className="group flex items-start gap-3 rounded-xl p-2 hover:bg-[#FAF6F0] transition"
            >
              <div className="relative h-[64px] w-[72px] flex-none overflow-hidden rounded-xl bg-[#F7F3EE]">
                <Image
                  src={it.image}
                  alt={it.title}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  sizes="80px"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[#B8934A] text-[13px] sm:text-[16px] leading-snug font-medium line-clamp-2">
                  {it.title}
                </p>

                {showDate && (
                  <p className="mt-1 text-[#7B766C] text-[12px] leading-none">
                    {safeDate(it.date)}
                  </p>
                )}
              </div>
            </a>
          ))
        )}
      </div>
    </aside>
  );
}