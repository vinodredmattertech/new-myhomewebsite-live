import { forwardRef } from "react";

// Shared heading used across the site. The visible text is rendered as the
// children, and the element is animated by the parent via a forwarded ref
// (gsap word-split reveal). Only the Tartuffo Light typography is baked in
// here — per-section sizing, colour and alignment stay on `className`.
export const HEADING_FONT_FAMILY =
  '"Tartuffo_Trial_Light","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif';

const SectionHeading = forwardRef(function SectionHeading(
  { as: Tag = "h2", className = "leading-[3vw]", style, children, ...rest },
  ref
) {
  return (
    <Tag
      ref={ref}
      className={className}
      style={{ fontFamily: HEADING_FONT_FAMILY, fontWeight: 300, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
});

export default SectionHeading;
