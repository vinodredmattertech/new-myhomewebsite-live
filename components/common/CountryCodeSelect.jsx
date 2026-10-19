import React from "react";
import { ChevronDown } from "lucide-react";
import { COUNTRY_CODES, DEFAULT_COUNTRY } from "@/lib/phone";

/**
 * Shared country-code <select> for phone/mobile fields across every enquiry
 * form. The full country list (name + dial code + flag) is sourced from the
 * `country-codes-list` package so every country is selectable without hand-
 * maintaining a subset. Spread a react-hook-form `register("countryCode")`
 * onto it and default the field to DEFAULT_COUNTRY_CODE. Register the phone
 * input with `registerPhone()` from "@/lib/phone" (digits-only, country-wise
 * length and mobile validation).
 *
 * The trigger is a fixed-width, clipped control (shows "flag + code", the
 * country name truncates) so it never overflows into the phone input beside
 * it; the native dropdown popup still shows the full "flag + code + name".
 * The caller's className (text colour/size) is applied to the wrapper so both
 * the value text and the chevron inherit the form's theme colour.
 */

// The field holds the country's ISO code (unique, unlike "+1"); convert it
// with `dialCodeFor()` from "@/lib/phone" when building API payloads.
export { COUNTRY_CODES };
export const DEFAULT_COUNTRY_CODE = DEFAULT_COUNTRY;

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
          <option key={c.iso} value={c.iso} className="text-black">
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
