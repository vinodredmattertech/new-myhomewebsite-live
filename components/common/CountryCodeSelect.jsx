import React from "react";
import { ChevronDown } from "lucide-react";
import { all as getAllCountries } from "country-codes-list";

/**
 * Shared country-code <select> for phone/mobile fields across every enquiry
 * form. The full country list (name + dial code + flag) is sourced from the
 * `country-codes-list` package so every country is selectable without hand-
 * maintaining a subset. Spread a react-hook-form `register("countryCode")`
 * onto it and default the field to DEFAULT_COUNTRY_CODE.
 *
 * The trigger is a fixed-width, clipped control (shows "flag + code", the
 * country name truncates) so it never overflows into the phone input beside
 * it; the native dropdown popup still shows the full "flag + code + name".
 * The caller's className (text colour/size) is applied to the wrapper so both
 * the value text and the chevron inherit the form's theme colour.
 */

// Countries surfaced at the top of the list before the alphabetical rest.
const PRIORITY = ["IN", "US", "GB", "AE"];

// Derive a flag emoji from a 2-letter ISO code as a fallback.
const isoToFlag = (iso) =>
  typeof iso === "string" && iso.length === 2
    ? iso.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    : "";

export const COUNTRY_CODES = getAllCountries()
  .filter((c) => c.countryCallingCode)
  .map((c) => ({
    iso: c.countryCode,
    code: `+${c.countryCallingCode}`,
    flag: c.flag || isoToFlag(c.countryCode),
    name: c.countryNameEn,
  }))
  .sort((a, b) => {
    const pa = PRIORITY.indexOf(a.iso);
    const pb = PRIORITY.indexOf(b.iso);
    if (pa !== -1 || pb !== -1) {
      return (pa === -1 ? Infinity : pa) - (pb === -1 ? Infinity : pb);
    }
    return a.name.localeCompare(b.name);
  });

export const DEFAULT_COUNTRY_CODE = "+91";

const CountryCodeSelect = React.forwardRef(function CountryCodeSelect(
  { className = "", ...props },
  ref
) {
  return (
    <div
      className={`relative inline-flex items-center shrink-0 w-[4.75rem] lg:w-[5vw] ${className}`}
    >
      <select
        ref={ref}
        aria-label="Country code"
        className="w-full appearance-none bg-transparent outline-none border-none cursor-pointer
                   pr-[14px] overflow-hidden text-ellipsis whitespace-nowrap"
        {...props}
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c.iso} value={c.code} className="text-black">
            {c.flag} {c.code} {c.name}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-0 w-[12px] h-[12px] opacity-60"
        strokeWidth={2}
      />
    </div>
  );
});

export default CountryCodeSelect;
