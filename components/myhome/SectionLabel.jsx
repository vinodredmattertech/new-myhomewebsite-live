import React from "react";

/**
 * Vertical side label used on every section of the new home design.
 * Renders a thin 60px tick (currentColor) above the rotated text.
 */
export default function SectionLabel({ children, color = "#ef493d", className = "" }) {
  return (
    <div
      className={`flex flex-col items-center gap-[21px] shrink-0 select-none ${className}`}

      style={{ color }}
      aria-hidden="true"
    >
      <span
        className="block w-px h-[31px] lg:h-[3.125vw]"
        style={{ background: "currentColor" }}
      />
      <span
        className="font-montserrat font-medium capitalize whitespace-nowrap text-[12px] lg:text-[1.25vw]"
        style={{
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          color: "currentColor",
        }}
      >
        {children}
      </span>
    </div>
  );
}
