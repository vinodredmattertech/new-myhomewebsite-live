import { VANA_BOOKING_TERMS } from "@/lib/forms/vanaDocuments";
import {
  NAME_TITLES,
  RESIDENT_STATUS,
  EMPLOYMENT_STATUS,
  INDUSTRIES,
  ORGANIZATION_TYPES,
  FUNCTIONAL_DOMAINS,
  PURPOSE_OF_PURCHASE,
  PIN_RE,
  PAN_RE,
  AADHAAR_RE,
  IFSC_RE,
} from "@/lib/forms/options";

/**
 * My Home Vana — the printed "Booking Application Form" (Whitefield
 * Extension), as a DynamicForm config. Field names are the Strapi attribute
 * names on the vana-booking-application collection.
 *
 * The second applicant and the POA/GPA block are switched on by the applicant;
 * while switched off their fields are not rendered, not validated and not
 * sent.
 */

const BOOKING_INCOME = [
  "Less than 10 Lakhs",
  "10 - 20 Lakhs",
  "20 - 30 Lakhs",
  "30 - 40 Lakhs",
  "40 - 50 Lakhs",
  "Above 50 Lakhs",
];

export const HOW_DID_YOU_KNOW = [
  "Digital Ads",
  "Hoardings",
  "Radio",
  "Website",
  "Real Estate Portals",
  "Channel Partner",
  "Direct Walk-In/Site Branding",
  "TV",
  "Referral",
  "Exhibition/Event",
  "SMS",
  "My Home Employee",
  "Print Media",
  "Emailers",
];

const isNri = (p) => (v) => v[`${p}ResidentStatus`] === "NRI/PIO/OCI";
const isIndian = (p) => (v) => v[`${p}ResidentStatus`] !== "NRI/PIO/OCI";
const has2 = (v) => !!v.hasSecondApplicant;
const and = (...fns) => (v) => fns.every((f) => f(v));

/**
 * One applicant's personal details, professional details and KYC uploads.
 * `p` prefixes every field name ("applicant1", "applicant2"); `gate` is the
 * condition the whole block depends on (the second applicant toggle).
 */
function applicantSections(p, title, { second = false, gate } = {}) {
  const when = (fn) => (gate ? (fn ? and(gate, fn) : gate) : fn);
  const label = second ? "Second Applicant" : "Sole/First Applicant";
  return [
    {
      title,
      showIf: gate,
      fields: [
        {
          type: "group",
          cols: 4,
          fields: [
            { name: `${p}Title`, type: "select", label: "Title", options: NAME_TITLES },
            { name: `${p}FirstName`, label: "First Name", required: true },
            { name: `${p}MiddleName`, label: "Middle Name" },
            { name: `${p}LastName`, label: "Last Name", required: true },
          ],
        },
        { name: `${p}AuthorisedSignatory`, label: "In case of Firm/Company, Name of Authorised Signatory", span: 2 },
        { name: `${p}RelationName`, label: "W/o, S/o, D/o", required: true },
        ...(second ? [{ name: `${p}RelationshipWithFirst`, label: "Relationship with the First Applicant", required: true }] : []),
        { name: `${p}Gender`, type: "radio", label: "Gender", options: ["Male", "Female"], columns: 2, required: true },
        { name: `${p}DateOfBirth`, type: "date", label: "Date of Birth", required: true },
        { name: `${p}EducationalQualification`, label: "Educational Qualification" },
        { name: `${p}SpouseName`, label: "Spouse Name" },
        { name: `${p}SpouseDateOfBirth`, type: "date", label: "Spouse Date of Birth" },
        { name: `${p}AnniversaryDate`, type: "date", label: "Anniversary Date" },
        { name: `${p}ResidentStatus`, type: "radio", label: "Resident Status", options: RESIDENT_STATUS, columns: 2, required: true },
        { name: `${p}CountryOfResidence`, label: "Country of Residence", required: true, showIf: when(isNri(p)) },
        { name: `${p}PassportNo`, label: "Passport/OCI No.", required: true, showIf: when(isNri(p)) },
        { name: `${p}Pan`, label: "PAN", required: true, upper: true, maxLength: 10, pattern: PAN_RE, patternMessage: "Enter a valid PAN, e.g. ABCDE1234F" },
        { name: `${p}AadhaarNo`, label: "Aadhaar No.", required: true, inputMode: "numeric", maxLength: 12, pattern: AADHAAR_RE, patternMessage: "Enter a valid 12-digit Aadhaar number", showIf: when(isIndian(p)) },
        { name: `${p}PermanentAddress`, type: "textarea", label: "Permanent Address (For agreement purpose)", required: true },
        { name: `${p}PermanentPincode`, label: "Pin Code", required: true, maxLength: 10, validate: (val, v) => v[`${p}ResidentStatus`] === "NRI/PIO/OCI" || PIN_RE.test(val) || "Enter a valid 6-digit pin code" },
        { name: `${p}CommunicationSameAsPermanent`, type: "checkbox", label: "Communication address same as permanent address", span: 2 },
        { name: `${p}CommunicationAddress`, type: "textarea", label: "Communication Address", required: true, showIf: when((v) => !v[`${p}CommunicationSameAsPermanent`]) },
        { name: `${p}CommunicationPincode`, label: "Pin Code", required: true, maxLength: 10, showIf: when((v) => !v[`${p}CommunicationSameAsPermanent`]) },
        { name: `${p}PrimaryContact`, type: "phone", label: "Primary Contact No.", required: true },
        { name: `${p}AlternateContact`, type: "phone", label: "Alternate Contact No." },
        { name: `${p}Email`, type: "email", label: "Email ID", required: true },
      ],
    },
    {
      title: `Professional Details — ${label}`,
      showIf: gate,
      fields: [
        { name: `${p}EmploymentStatus`, type: "radio", label: "Employment Status", options: EMPLOYMENT_STATUS, columns: 5 },
        { name: `${p}Industry`, type: "radio", label: "Industry", options: INDUSTRIES, columns: 3, other: { value: "Others", name: `${p}IndustryOther`, label: "Please specify" } },
        { name: `${p}OrganizationType`, type: "radio", label: "Organizational Type", options: ORGANIZATION_TYPES, columns: 5, other: { value: "Others", name: `${p}OrganizationTypeOther`, label: "Please specify" } },
        { name: `${p}FunctionalDomain`, type: "radio", label: "Functional Domain", options: FUNCTIONAL_DOMAINS, columns: 3, other: { value: "Others", name: `${p}FunctionalDomainOther`, label: "Please specify" } },
        { name: `${p}CompanyName`, label: "Company/Firm Name" },
        { name: `${p}Location`, label: "Location" },
        { name: `${p}Designation`, label: "Designation" },
        { name: `${p}WorkExperience`, label: "No. of years of Work Experience/Establishment" },
        { name: `${p}OfficialEmail`, type: "email", label: "Official Email ID" },
        { name: `${p}OfficePincode`, label: "Office Pin Code", maxLength: 10 },
        { name: `${p}OfficeAddress`, type: "textarea", label: "Address of Organization/Business", span: 2 },
        { name: `${p}SelfAnnualIncome`, type: "radio", label: "Self Annual Income (₹)", options: BOOKING_INCOME, columns: 3 },
        { name: `${p}AnnualHouseholdIncome`, type: "radio", label: "Annual Household Income (₹)", options: BOOKING_INCOME, columns: 3 },
      ],
    },
    {
      title: `KYC Documents — ${label}`,
      showIf: gate,
      fields: [
        { type: "note", text: "Self-attested copies. PDF, JPG or PNG, up to 5MB each." },
        { name: `${p}PhotoFile`, type: "file", label: "Passport Size Photograph", required: true, accept: "images" },
        { name: `${p}PanFile`, type: "file", label: "PAN Card", required: true },
        { name: `${p}AadhaarFile`, type: "file", label: "Aadhaar Card", required: true, showIf: when(isIndian(p)) },
        { name: `${p}PassportFile`, type: "file", label: "Passport / PIO Card", required: true, showIf: when(isNri(p)) },
        { name: `${p}AddressProofFile`, type: "file", label: "Address Proof (Electricity Bill / Ration Card / Telephone Bill / Voter ID)" },
      ],
    },
  ];
}

const sourceIs = (s) => (v) => v.howDidYouKnow === s;

export const vanaBookingForm = {
  endpoint: "vana-booking-applications",
  formSource: "My Home Vana Booking Application Form",
  label: "My Home Vana",
  heading: "Booking Application Form",
  intro: ["My Home Vana — Whitefield Extension"],
  submitText: "Submit Application",
  success: {
    title: "Thank you — your booking application has been received.",
    text: "Our team will verify your details and KYC documents and get in touch with you. The application is not a confirmation of allotment.",
  },
  terms: {
    name: "termsAccepted",
    before: "I/We have read and agree to the ",
    linkText: "Terms & Conditions",
    after: " of this booking application.",
    modalTitle: "Terms & Conditions",
    document: VANA_BOOKING_TERMS,
  },
  sections: [
    {
      title: "Unit Details",
      fields: [
        { name: "unitNumber", label: "Unit Number", required: true },
        { name: "unitType", label: "Unit Type", required: true },
        { name: "unitArea", type: "number", label: "Unit Area (in Sq. Ft.)" },
        { name: "baseRatePerSqFt", type: "number", label: "Base Rate per Sq. Ft. (in ₹)" },
      ],
    },
    ...applicantSections("applicant1", "Sole/First Applicant Details"),
    {
      title: "Second Applicant",
      fields: [{ name: "hasSecondApplicant", type: "checkbox", label: "Add a second applicant", span: 2 }],
    },
    ...applicantSections("applicant2", "Second Applicant Details", { second: true, gate: has2 }),
    {
      title: "POA/GPA Details (If Applicable)",
      fields: [
        { name: "hasPoa", type: "checkbox", label: "A Power of Attorney / GPA holder is acting for the applicant(s)", span: 2 },
        { name: "poaName", label: "POA/GPA Name", required: true, showIf: (v) => v.hasPoa },
        { name: "poaRelationName", label: "W/o, S/o, D/o", showIf: (v) => v.hasPoa },
        { name: "poaPrimaryContact", type: "phone", label: "Primary Contact No.", required: true, showIf: (v) => v.hasPoa },
        { name: "poaEmail", type: "email", label: "Email ID", showIf: (v) => v.hasPoa },
        { name: "poaPan", label: "PAN", upper: true, maxLength: 10, pattern: PAN_RE, patternMessage: "Enter a valid PAN, e.g. ABCDE1234F", showIf: (v) => v.hasPoa },
        { name: "poaAadhaarNo", label: "Aadhaar No.", inputMode: "numeric", maxLength: 12, pattern: AADHAAR_RE, patternMessage: "Enter a valid 12-digit Aadhaar number", showIf: (v) => v.hasPoa },
        { name: "poaDocumentFile", type: "file", label: "Self-attested copy of the Power of Attorney", required: true, showIf: (v) => v.hasPoa },
      ],
    },
    {
      title: "How did you get to know of our project?",
      fields: [
        { name: "howDidYouKnow", type: "radio", label: "Source", options: HOW_DID_YOU_KNOW, columns: 3, required: true },
        { name: "channelPartnerName", label: "Channel Partner Name", required: true, showIf: sourceIs("Channel Partner") },
        { name: "channelPartnerCompany", label: "Company Name", showIf: sourceIs("Channel Partner") },
        { name: "channelPartnerRera", label: "RERA Registration No.", required: true, showIf: sourceIs("Channel Partner") },
        { name: "channelPartnerContact", type: "phone", label: "Primary Contact No.", showIf: sourceIs("Channel Partner") },
        { name: "referralName", label: "Referrer Name", required: true, showIf: sourceIs("Referral") },
        { name: "referralContact", type: "phone", label: "Primary Contact No.", showIf: sourceIs("Referral") },
        { name: "referralProject", label: "Project Name", showIf: sourceIs("Referral") },
        { name: "referralUnitNo", label: "Unit No.", showIf: sourceIs("Referral") },
        { name: "referralEmail", type: "email", label: "Email ID", showIf: sourceIs("Referral") },
        { name: "employeeName", label: "Employee Name", required: true, showIf: sourceIs("My Home Employee") },
        { name: "employeeId", label: "Employee ID", showIf: sourceIs("My Home Employee") },
        { name: "employeeContact", type: "phone", label: "Primary Contact No.", showIf: sourceIs("My Home Employee") },
        { name: "employeeEmail", type: "email", label: "Email ID", showIf: sourceIs("My Home Employee") },
      ],
    },
    {
      title: "Payment Details",
      fields: [
        { type: "note", text: "I/We, the Applicant(s), request you to allot the unit/s mentioned above based on this application and the earnest amount paid as below." },
        { name: "payment1Amount", type: "number", label: "(I) Amount (Rs.)", required: true },
        { name: "payment1AmountInWords", label: "Amount in words", required: true },
        { name: "payment1Reference", label: "Cheque/DD No./Transaction ID", required: true },
        { name: "payment1Date", type: "date", label: "Dated", required: true },
        { name: "payment1Bank", label: "Drawn On (Bank)", required: true },
        { name: "payment1ProofFile", type: "file", label: "Payment proof (optional)" },
        { name: "payment2Amount", type: "number", label: "(II) Amount (Rs.)" },
        { name: "payment2Reference", label: "Cheque/DD No./Transaction ID" },
        { name: "payment2Date", type: "date", label: "Dated" },
        { name: "payment2Bank", label: "Drawn On (Bank)" },
        { name: "propertyType", type: "radio", label: "Type", options: ["Residential", "Commercial"], columns: 2, required: true },
        { name: "totalAgreementValue", type: "number", label: "Total Agreement Value (₹)" },
        { type: "note", text: "Total Agreement Value is the sum of the cost of Unit/s & Development Cost. Please refer cost sheet for details. The above value does not include Legal/Clubhouse/Deposits/Maintenance/Taxes & Statutory Charges." },
      ],
    },
    {
      title: "Refund Bank Details",
      fields: [
        { type: "note", text: "In case of cancellation/refund, please fill the below details." },
        { name: "refundPayeeName", label: "Payee Name", required: true },
        { name: "refundAccountNumber", label: "Bank Account Number", required: true, inputMode: "numeric", pattern: /^[0-9]{6,18}$/, patternMessage: "Enter a valid account number" },
        { name: "refundIfsc", label: "IFSC Code", required: true, upper: true, maxLength: 11, pattern: IFSC_RE, patternMessage: "Enter a valid 11-character IFSC" },
        { name: "refundBankName", label: "Bank Name", required: true },
        { name: "refundAccountType", label: "Account Type", required: true },
      ],
    },
    {
      title: "Additional Details",
      fields: [
        { name: "sourceOfFunding", type: "radio", label: "Source of funding for purchase of unit/s", options: ["Self Funding", "Home Loan"], columns: 2, required: true },
        { name: "homeLoanPreferredBank", label: "Home Loan Preferred Bank/FI", showIf: (v) => v.sourceOfFunding === "Home Loan" },
        { name: "purposeOfPurchase", type: "radio", label: "Purpose of purchase", options: PURPOSE_OF_PURCHASE, columns: 2, required: true, other: { value: "Others", name: "purposeOfPurchaseOther", label: "Please specify" } },
      ],
    },
  ],
  sameAs: ["applicant1", "applicant2"].map((p) => ({
    flag: `${p}CommunicationSameAsPermanent`,
    copy: {
      [`${p}CommunicationAddress`]: `${p}PermanentAddress`,
      [`${p}CommunicationPincode`]: `${p}PermanentPincode`,
    },
  })),
  /** "For office use only" on the printed form — admin-only on the record. */
  office: [
    { name: "serialNumber", type: "string", description: "Assigned on submission, e.g. MHG-VANA-001" },
    { name: "customerUin", type: "string", description: "For office use — Customer Unique Identification Number (UIN)" },
    { name: "scheme", type: "string", description: "For office use — Scheme (if any)" },
    { name: "applicationStatus", type: "enumeration", enum: ["Received", "Verified", "Allotted", "Rejected", "Cancelled"], default: "Received", description: "For office use" },
    { name: "salesSource", type: "text", description: "For office use — STM / BL / Business Head / CTM / CRM Head / President and CSO (names and employee IDs)" },
  ],
};
