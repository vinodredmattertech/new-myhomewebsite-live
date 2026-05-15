"use client";

import React from "react";
import Image from "next/image";
import CustomDropdown from "./CustomDropdown";

const cx = (...c) => c.filter(Boolean).join(" ");

const Divider = () => (
  <div className="hidden lg:block h-[2vw] w-px bg-[#EFE8DE] mx-[0.4vw]" />
);

/**
 * items config supports:
 * 1) { type:'pill', key, label, active, onClick, icon?, variant? }
 * 2) { type:'divider', key? }   // shows only on lg+
 * 3) { type:'dropdown', key, label, icon?, value, options, onChange, placeholder? }
 *
 * variant for pill:
 * - 'primary'   (gold filled)
 * - 'ghost'     (white)
 * - 'soft'      (soft bg)
 */
export default function ConfigFilterBar({
  items = [],
  className = "",
  containerClassName = "",
}) {
  return (
    <div className={cx("w-full flex justify-center", containerClassName)}>
      <div
        className={cx(
          "w-full max-w-[980px] lg:max-w-[72.917vw]",
          "rounded-[28px] lg:rounded-[2vw]",
          "bg-white border border-[#EFE8DE]",
          "px-4 py-3 lg:px-[1.5vw] lg:py-[1vw]",
          className
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-[1vw]">
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 lg:gap-[0.8vw] w-full">
            {items.map((it, idx) => {
              if (it.type === "divider") {
                return <Divider key={it.key ?? `div-${idx}`} />;
              }

              if (it.type === "pill") {
                const variant = it.variant ?? "ghost";

                const base =
                  "flex items-center gap-2 transition border rounded-full";
                const size =
                  "h-11 px-5 text-[14px] lg:h-[3vw] lg:px-[1.6vw] lg:text-[1vw]";
                const styles =
                  variant === "primary"
                    ? "bg-[#B8934E] border-[#B8934E] text-white"
                    : variant === "soft"
                    ? "bg-[#F3ECE1] border-[#E9E3DA] text-[#5F5F5F]"
                    : "bg-white border-[#E9E3DA] text-[#5F5F5F] hover:border-[#D8D0C4]";

                const activeStyles =
                  it.active && variant !== "primary"
                    ? "bg-[#F3ECE1] border-[#E9E3DA] text-[#5F5F5F]"
                    : "";

                return (
                  <button
                    key={it.key}
                    type="button"
                    onClick={it.onClick}
                    className={cx(base, size, styles, activeStyles)}
                  >
                    {it.icon ? (
                      <Image
                        src={it.icon}
                        alt={it.label}
                        width={18}
                        height={18}
                        className="opacity-70 lg:w-[1.1vw] lg:h-[1.1vw]"
                      />
                    ) : null}

                    {/* optional check bubble like "All" */}
                    {it.showCheck ? (
                      <span
                        className={cx(
                          "flex items-center justify-center rounded-full",
                          "h-5 w-5 lg:h-[1.3vw] lg:w-[1.3vw]",
                          it.active ? "bg-white/15" : "bg-[#F3ECE1]"
                        )}
                      >
                        {it.active ? <span className="text-[12px]">✓</span> : null}
                      </span>
                    ) : null}

                    <span>{it.label}</span>
                  </button>
                );
              }

              if (it.type === "dropdown") {
                return (
                  <div key={it.key} className="flex items-center gap-2 lg:gap-[0.8vw]">
                    {/* label pill */}
                    <button
                      type="button"
                      className={cx(
                        "flex items-center gap-2 text-white bg-[#B8934E] rounded-full",
                        "h-11 px-5 text-[14px]",
                        "lg:h-[3vw] lg:px-[1.6vw] lg:text-[1vw]"
                      )}
                    >
                      {it.icon ? (
                        <Image
                          src={it.icon}
                          alt={it.label}
                          width={18}
                          height={18}
                          className="opacity-90 lg:w-[1.1vw] lg:h-[1.1vw]"
                        />
                      ) : null}
                      <span>{it.label}</span>
                    </button>

                    <CustomDropdown
                      label=""
                      options={it.options}
                      value={it.value}
                      onChange={it.onChange}
                      placeholder={it.placeholder ?? "All"}
                      className={cx("min-w-[160px] lg:min-w-[10vw]", it.className)}
                    />
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}