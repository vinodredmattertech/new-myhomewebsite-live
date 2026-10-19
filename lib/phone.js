import { all as getAllCountries } from "country-codes-list";
import {
  parsePhoneNumberFromString,
  isSupportedCountry,
  getCountryCallingCode,
} from "libphonenumber-js/max";
import { Metadata } from "libphonenumber-js/core";
import maxMetadata from "libphonenumber-js/metadata.max.json";

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
 * Antigua's "+1268") validate correctly too. Only mobile numbers are accepted
 * (India: 10 digits starting 6-9, UAE: 9 digits starting 5, ...).
 *
 * Spread `registerPhone()` onto the phone <input> in place of a plain
 * `register("phone", ...)`: it adds the validation rule and strips anything
 * but digits as the user types, capped at the selected country's length.
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
    `${parsed.countryCallingCode}${parsed.nationalNumber}` === `${dialDigits}${nationalDigits}` &&
    (MOBILE_TYPES.includes(parsed.getType()) || !rulesFor(iso).hasMobilePlan)
  );
};

// US/Canada numbers can't be told apart from landlines, so they report
// FIXED_LINE_OR_MOBILE.
const MOBILE_TYPES = ["MOBILE", "FIXED_LINE_OR_MOBILE"];

const metadata = new Metadata(maxMetadata);
const rulesCache = {};

/**
 * Digits the user types after the selected dial code for a mobile number:
 * the country's mobile lengths, less any area-code digits baked into the dial
 * code itself (e.g. Antigua's "+1268" leaves 7 of its 10 digits).
 */
const rulesFor = (iso) => {
  const country = countryFor(iso);
  if (rulesCache[country.iso]) return rulesCache[country.iso];

  const dialDigits = country.code.replace(/\D/g, "");
  let rules;
  if (isSupportedCountry(country.iso)) {
    metadata.selectNumberingPlan(country.iso);
    const plan = metadata.numberingPlan;
    const mobile = plan.type("MOBILE");
    const extra = dialDigits.length - plan.callingCode().length;
    const lengths = [...new Set((mobile?.possibleLengths() || plan.possibleLengths()) ?? [])]
      .map((l) => l - extra)
      .filter((l) => l > 0)
      .sort((a, b) => a - b);
    rules = {
      lengths,
      trunkPrefix: plan.nationalPrefix() || "",
      hasMobilePlan: !!mobile,
    };
  } else {
    rules = { lengths: [], trunkPrefix: "", hasMobilePlan: false };
  }
  // Without metadata, fall back to the E.164 limits.
  if (!rules.lengths.length) {
    rules.lengths = Array.from({ length: Math.max(1, 12 - dialDigits.length) }, (_, i) => i + 4);
  }
  rules.dialDigits = dialDigits;
  rules.min = rules.lengths[0];
  rules.max = rules.lengths[rules.lengths.length - 1];
  return (rulesCache[country.iso] = rules);
};

/** "10", "9 or 10", "7 to 13" */
const describeLengths = (lengths) => {
  if (lengths.length === 1) return `${lengths[0]}`;
  const contiguous = lengths[lengths.length - 1] - lengths[0] === lengths.length - 1;
  if (contiguous && lengths.length > 2) return `${lengths[0]} to ${lengths[lengths.length - 1]}`;
  return `${lengths.slice(0, -1).join(", ")} or ${lengths[lengths.length - 1]}`;
};

/** Mobile number lengths (digits after the dial code) for a country ISO code. */
export const phoneLengthsFor = (iso) => rulesFor(iso).lengths;

/**
 * Reduce whatever was typed, pasted or autofilled to the national digits for
 * the selected country: drops every non-digit, a leading copy of the dial
 * code ("+91 98765 43210", "0091…"), and a surplus trunk "0" ("050 123 4567"
 * for the UAE), then caps the length at the country's longest mobile number.
 */
export const sanitizePhoneInput = (value, iso) => {
  const raw = String(value ?? "");
  const { dialDigits, max, trunkPrefix } = rulesFor(iso);
  let digits = raw.replace(/\D/g, "");

  const international = /^\s*(\+|00)/.test(raw);
  if (international && raw.trim().startsWith("00")) digits = digits.slice(2);
  if (
    (international || digits.length > max) &&
    digits.startsWith(dialDigits) &&
    digits.length - dialDigits.length <= max
  ) {
    digits = digits.slice(dialDigits.length);
  }
  if (trunkPrefix && digits.length > max && digits.startsWith(trunkPrefix)) {
    digits = digits.slice(trunkPrefix.length);
  }
  return digits.slice(0, max);
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
  const { lengths } = rulesFor(country.iso);
  const invalid = `Enter a valid ${country.name} mobile number`;

  if (raw.startsWith("+")) return "Enter the number without the country code";
  if (/[^\d\s().-]/.test(raw)) return "Phone number can contain digits only";

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
  if (!lengths.includes(digits.length)) {
    return `${country.name} mobile numbers must be ${describeLengths(lengths)} digits (${country.code})`;
  }
  return invalid;
};

/**
 * Props for a phone <input>, in place of `register(name, rules)`:
 *
 *   <input {...registerPhone(register, "phone", () => getValues("countryCode"), {
 *     required: "Please enter your phone number",
 *   })} />
 *
 * Adds the country-wise `validatePhone` rule (kept alongside any rules passed
 * in), a numeric keypad on mobile, and filters the value as it is typed so
 * letters and symbols never reach the field.
 */
export const registerPhone = (register, name, getCountry, rules = {}) => {
  const extra = typeof rules.validate === "function" ? { custom: rules.validate } : rules.validate;
  const field = register(name, {
    ...rules,
    validate: { ...extra, phone: (v) => validatePhone(v, getCountry()) },
  });
  return {
    ...field,
    type: "tel",
    inputMode: "numeric",
    autoComplete: "tel-national",
    onChange: (e) => {
      const el = e.target;
      const raw = el.value;
      const clean = sanitizePhoneInput(raw, getCountry());
      if (clean !== raw) {
        // Keep the caret next to the same digit rather than jumping to the end.
        const caret = el.selectionStart ?? raw.length;
        const digitsAfter = raw.slice(caret).replace(/\D/g, "").length;
        const pos = Math.max(0, Math.min(clean.length, clean.length - digitsAfter));
        el.value = clean;
        try {
          el.setSelectionRange(pos, pos);
        } catch {}
      }
      return field.onChange(e);
    },
  };
};
