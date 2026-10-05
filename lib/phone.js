import { all as getAllCountries } from "country-codes-list";
import {
  parsePhoneNumberFromString,
  isSupportedCountry,
  getCountryCallingCode,
} from "libphonenumber-js/max";

/**
 * Country-wise phone validation shared by every enquiry form.
 *
 * Forms keep the selected country's ISO code (e.g. "IN", "US", "CA") in their
 * `countryCode` field. ISO codes are unique, whereas dial codes are not: +1
 * alone covers the US, Canada and most of the Caribbean. On submit, forms
 * convert it back with `dialCodeFor()`, so API payloads keep the same
 * "+91 98765 43210" shape they always had.
 *
 * Validation (`validatePhone`) is client-side only and uses libphonenumber-js
 * "max" metadata, which checks each country's real number ranges rather than
 * only its lengths. The selected dial code and the typed digits are combined into one
 * international number, so dial codes that include an area code (e.g.
 * Antigua's "+1268") validate correctly too.
 */

// Countries surfaced at the top of the list before the alphabetical rest.
const PRIORITY = ["IN", "US", "GB", "AE"];

export const DEFAULT_COUNTRY = "IN";

// Derive a flag emoji from a 2-letter ISO code as a fallback.
const isoToFlag = (iso) =>
  typeof iso === "string" && iso.length === 2
    ? iso.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    : "";

// A few entries in `country-codes-list` drop the leading "1" of their NANP
// code (Jamaica "876", Dominica "767", Trinidad "868"). Prefix the real
// calling code whenever the listed one does not already start with it.
const callingCodeFor = (iso, listed) => {
  if (!isSupportedCountry(iso)) return listed;
  const real = getCountryCallingCode(iso);
  return listed.replace(/\D/g, "").startsWith(real) ? listed : `${real}${listed}`;
};

export const COUNTRY_CODES = getAllCountries()
  // Some ISO codes are listed twice (e.g. "IO"); keep the first entry only.
  .filter(
    (c, i, list) =>
      c.countryCallingCode && list.findIndex((o) => o.countryCode === c.countryCode) === i
  )
  .map((c) => ({
    iso: c.countryCode,
    code: `+${callingCodeFor(c.countryCode, c.countryCallingCode)}`,
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

const BY_ISO = Object.fromEntries(COUNTRY_CODES.map((c) => [c.iso, c]));

const countryFor = (iso) => BY_ISO[iso] || BY_ISO[DEFAULT_COUNTRY];

/** Dial code ("+91") for a country ISO code; falls back to the default country. */
export const dialCodeFor = (iso) => {
  // Tolerate a raw dial code, in case one ever reaches here.
  if (typeof iso === "string" && iso.startsWith("+")) return iso;
  return countryFor(iso).code;
};

const isValidInternational = (dialDigits, nationalDigits, iso) => {
  const number = `+${dialDigits}${nationalDigits}`;
  if (!isSupportedCountry(iso)) {
    // No numbering metadata (e.g. Antarctica): fall back to the E.164 limits.
    return nationalDigits.length >= 4 && dialDigits.length + nationalDigits.length <= 15;
  }
  const parsed = parsePhoneNumberFromString(number);
  // Parsing silently drops prefixes such as a trunk "0"; only accept the
  // number when it reads back digit for digit as typed.
  return (
    !!parsed &&
    parsed.isValid() &&
    `${parsed.countryCallingCode}${parsed.nationalNumber}` === `${dialDigits}${nationalDigits}`
  );
};

/**
 * react-hook-form `validate` rule for the phone input. Returns true when the
 * number is valid for the selected country, otherwise an error message.
 * Empty values pass so each field's own `required` rule reports them.
 */
export const validatePhone = (value, iso) => {
  const raw = String(value ?? "").trim();
  if (!raw) return true;

  const country = countryFor(iso);
  const invalid = `Enter a valid phone number for ${country.name}`;

  if (raw.startsWith("+")) return "Enter the number without the country code";
  if (/[^\d\s().-]/.test(raw)) return invalid;

  const digits = raw.replace(/\D/g, "");
  const dialDigits = country.code.replace(/\D/g, "");

  if (isValidInternational(dialDigits, digits, country.iso)) return true;

  // Point out the two most common slips: a national trunk "0" prefix, or the
  // country code typed again in front of the number.
  const withoutZeros = digits.replace(/^0+/, "");
  if (withoutZeros !== digits && isValidInternational(dialDigits, withoutZeros, country.iso)) {
    return "Enter the number without the leading 0";
  }
  if (
    digits.startsWith(dialDigits) &&
    isValidInternational(dialDigits, digits.slice(dialDigits.length), country.iso)
  ) {
    return "Enter the number without the country code";
  }
  return invalid;
};
