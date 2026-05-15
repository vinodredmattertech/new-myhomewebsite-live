"use client";

import React from "react";
import Image from "next/image";
import CustomDropdown from "./CustomDropdown";

const cx = (...c) => c.filter(Boolean).join(" ");

export default function FilterBar({
  allLabel = "All",
  allActive = true,
  onToggleAll,
  quickItems = [],
  dropdownLabel = "Types",
  dropdownIcon,
  dropdownValue,
  dropdownOptions = [],
  onDropdownChange,
  onReset,
}) {
  return (
    <div className="w-full flex justify-center">
      <div
        className={cx(
          // layout
          "flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-[1vw]",
          // container
          "w-full max-w-[980px] lg:max-w-[72.917vw]",
          "rounded-[28px] lg:rounded-[2vw]",
          "bg-white border border-[#EFE8DE]",
          // padding
          "px-4 py-3",
          "lg:px-[1.5vw] lg:py-[1vw]"
        )}
      >
        {/* All */}
        <button
          type="button"
          onClick={onToggleAll}
          className={cx(
            "flex items-center gap-2 transition",
            "rounded-full border",
            // size
            "h-11 px-5 text-[14px]",
            "lg:h-[3vw] lg:px-[1.6vw] lg:text-[1vw]",
            allActive
              ? "bg-[#B8934E] border-[#B8934E] text-white"
              : "bg-white border-[#E9E3DA] text-[#5F5F5F] hover:border-[#D8D0C4]"
          )}
        >
          <span
            className={cx(
              "flex items-center justify-center rounded-full",
              "h-5 w-5",
              "lg:h-[1.3vw] lg:w-[1.3vw]",
              allActive ? "bg-white/15" : "bg-[#F3ECE1]"
            )}
          >
            {allActive && <span className="text-[12px]">✓</span>}
          </span>
          <span>{allLabel}</span>
        </button>

        {/* Quick pills */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-[0.8vw]">
          {quickItems.map((it, idx) => (
            <React.Fragment key={it.key}>
              <button
                type="button"
                onClick={it.onClick}
                className={cx(
                  "flex items-center gap-2 transition border rounded-full",
                  "h-11 px-5 text-[14px]",
                  "lg:h-[3vw] lg:px-[1.6vw] lg:text-[1vw]",
                  it.active
                    ? "bg-[#F3ECE1] border-[#E9E3DA] text-[#5F5F5F]"
                    : "bg-white  text-[#5F5F5F] hover:border-[#D8D0C4]"
                )}
              >
                {it.icon && (
                  <Image
                    src={it.icon}
                    alt={it.label}
                    width={18}
                    height={18}
                    className="opacity-70 lg:w-[1.1vw] lg:h-[1.1vw]"
                  />
                )}
                <span>{it.label}</span>
              </button>

              {/* divider after second pill */}
              {idx === 1 && (
                <div className="hidden lg:block h-[2vw] w-px bg-[#EFE8DE]" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Types dropdown */}
        <div className="flex items-center gap-3 lg:gap-[1vw] lg:ml-auto">
          <div className="hidden lg:block h-[2vw] w-px bg-[#EFE8DE]" />

          <button
            type="button"
            className={cx(
              "flex items-center gap-2 text-white bg-[#B8934E] rounded-full",
              "h-11 px-5 text-[14px]",
              "lg:h-[3vw] lg:px-[1.6vw] lg:text-[1vw]"
            )}
          >
            {dropdownIcon && (
              <Image
                src={dropdownIcon}
                alt={dropdownLabel}
                width={18}
                height={18}
                className="opacity-90 lg:w-[1.1vw] lg:h-[1.1vw]"
              />
            )}
            <span>{dropdownLabel}</span>
          </button>

          <CustomDropdown
            label=""
            options={dropdownOptions}
            value={dropdownValue}
            onChange={onDropdownChange}
            placeholder="All"
            className="min-w-[160px] lg:min-w-[10vw]"
          />
        </div>

        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          className={cx(
            "transition rounded-full whitespace-nowrap",
            "h-11 px-5 text-[14px] text-[#7B766C]",
            "lg:h-[3vw] lg:px-[1.6vw] lg:text-[1vw]",
            "border border-transparent hover:border-[#E9E3DA] hover:bg-[#FAF6F0]"
          )}
        >
          ✕ Reset
        </button>
      </div>
    </div>
  );
}