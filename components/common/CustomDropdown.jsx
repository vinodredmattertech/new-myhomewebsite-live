"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

export default function CustomDropdown({
  label,
  icon,
  options = [],
  value,
  onChange,
  placeholder = "Select",
  className = "",
  menuClassName = "",
  disabled = false,
}) {
  const id = useId();
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  useEffect(() => {
    const onDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handlePick = (val) => {
    onChange?.(val);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={cx("relative", className)}>
      {/* label */}
      <div className="flex items-center gap-[.5vw]">
      {label ? (
  <div className="flex items-center gap-2 text-[13px] text-[#7B766C] mb-2">
    {icon ? <span className="flex items-center">{icon}</span> : null}
    <span className="tracking-wide mt-1">{label}</span>
  </div>
) : null}

      {/* trigger */}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        onClick={() => setOpen((s) => !s)}
        className={cx(
          "h-11 w-fit lg:w-[8.92vw] rounded-full",
          "bg-white border border-[#E9E3DA]",
          "px-4 flex items-center justify-between gap-3",
          "text-[14px] text-[#5F5F5F]",
          "shadow-[0_1px_0_rgba(0,0,0,0.02)]",
          "hover:border-[#D8D0C4] transition",
          "focus:outline-none focus:ring-2 focus:ring-[#E7D6C3]/60",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        <span className={cx(!selected && "text-[#9A948A]")}>
          {selected?.label ?? placeholder}
        </span>

        <svg
          className={cx(
            "h-4 w-4 shrink-0 transition",
            open ? "rotate-180" : "rotate-0",
            "text-[#7B766C]"
          )}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      </div>

      {/* menu */}
      {open ? (
        <div
          id={`${id}-menu`}
          role="listbox"
          className={cx(
            "absolute left-10 z-[80] mt-2 w-auto",
            "rounded-2xl border border-[#EFE8DE] bg-white",
            "shadow-[0_18px_45px_rgba(0,0,0,0.10)]",
            "overflow-hidden",
            menuClassName
          )}
        >
          <div className="max-h-[260px] overflow-auto py-1">
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => handlePick(opt.value)}
                  className={cx(
                    "w-full text-left px-4 py-2.5",
                    "text-[14px] transition",
                    active
                      ? "bg-[#F3ECE1] text-[#5F5F5F]"
                      : "hover:bg-[#FAF6F0] text-[#5F5F5F]"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}