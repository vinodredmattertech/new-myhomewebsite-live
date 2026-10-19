/**
 * Option lists shared by the printed My Home forms (Customer Market Survey,
 * My Home Vana Booking Application). Labels are copied from the PDFs exactly,
 * since they are what lands in Strapi.
 */

export const NAME_TITLES = ["Mr.", "Dr.", "Ms.", "Mrs.", "M/s."];

export const RESIDENT_STATUS = ["Indian", "NRI/PIO/OCI"];

export const EMPLOYMENT_STATUS = ["Salaried", "Self Employed", "Business", "Retired", "Homemaker"];

export const INDUSTRIES = [
  "Agri Based",
  "Auto & Ancillary",
  "Consumer Durables",
  "Defence Service",
  "Education",
  "FMCG",
  "Financial Services/Banking",
  "Govt. Organization",
  "Healthcare/Pharma",
  "IT/ITES",
  "Media Entertainment",
  "Metal & Mining",
  "Oil, Gas and Power",
  "Retail & E Commerce",
  "Service Sector",
  "Telecom",
  "Textiles",
  "Travel",
  "Others",
];

export const ORGANIZATION_TYPES = ["Pvt. Ltd.", "Public Ltd.", "Own Business", "Govt. Organization", "Others"];

export const FUNCTIONAL_DOMAINS = [
  "Software Development",
  "Production & Engineering",
  "Finance & Accounts",
  "Sales & Marketing",
  "General Management",
  "HR/Admin",
  "Operations",
  "Others",
];

export const PURPOSE_OF_PURCHASE = [
  "Moving to a better place",
  "Wanting to own a Self Designed Home",
  "Purchasing for Parents/Spouse/Children",
  "Investment Purpose",
  "Weekend Home/Farm House",
  "Others",
];

/** Indian PIN code. */
export const PIN_RE = /^[1-9][0-9]{5}$/;
export const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const AADHAAR_RE = /^[2-9][0-9]{11}$/;
export const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
