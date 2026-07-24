import React from "react";

/**
 * Side label used on every section of the new home design.
 *
 * Desktop (lg+) — vertical: a thin tick (currentColor) above the rotated text.
 * Mobile / tablet (<lg) — horizontal: the tick sits inline to the left of the
 * text and the whole group centres itself above the section heading.
 */
export default function SectionLabel({ children, color = "#ef493d", className = "" }) {
  return (
    <div
      className={`flex flex-row lg:flex-col items-center justify-center gap-[8px] lg:gap-[21px] shrink-0 select-none ${className}`}

      style={{ color }}
      aria-hidden="true"
    >
      <span
        className="block w-px h-[31px] lg:h-[3.125vw] max-lg:!w-[28px] max-lg:!h-px"
        style={{ background: "currentColor" }}
      />
      <span
        className="font-montserrat font-medium capitalize whitespace-nowrap text-[12px] lg:text-[1.25vw] max-lg:[writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] lg:rotate-180"
        style={{
          color: "currentColor",
        }}
      >
        {children}
      </span>
    </div>
  );
}
