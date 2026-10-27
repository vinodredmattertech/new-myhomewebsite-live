import { VANA_ALLOTMENT_LETTER } from "@/lib/forms/vanaDocuments";
import { NAME_TITLES, PIN_RE, PAN_RE, AADHAAR_RE } from "@/lib/forms/options";

/**
 * My Home Vana — the "Allotment Letter" (Welcome Letter), as a DynamicForm
 * config. The letter itself is issued by the Company; what the allottee fills
 * in online is their own details ("To, …") and the Confirmation &
 * Acknowledgement at the end. The letter text opens in a modal from the
 * acknowledgement checkbox.
 */
export const vanaAllotmentForm = {
  endpoint: "vana-allotment-acknowledgements",
  formSource: "My Home Vana Allotment Letter",
  label: "My Home Vana",
  heading: "Customer Survey Form",
  intro: [
    "My Home Vana — Whitefield Extension. Please confirm your details and acknowledge your allotment letter.",
  ],
  submitText: "Submit Acknowledgement",
  success: {
    title: "Thank you — your acknowledgement has been received.",
    text: "Welcome home. Should you need any assistance, please write to us at info@myhomeconstructions.com.",
  },
  terms: {
    name: "acknowledgementAccepted",
    before: "I/We have read and understood the contents of the ",
    linkText: "Allotment Letter and the Annexure",
    after: ". I/We hereby agree and accept the terms and conditions as stipulated in this allotment letter.",
    modalTitle: "Allotment Letter",
    document: VANA_ALLOTMENT_LETTER,
  },
  sections: [
    {
      title: "Allottee Details",
      fields: [
        {
          type: "group",
          cols: 4,
          fields: [
            { name: "title", type: "select", label: "Title", options: NAME_TITLES },
            { name: "firstName", label: "First Name", required: true },
            { name: "middleName", label: "Middle Name" },
            { name: "lastName", label: "Last Name", required: true },
          ],
        },
        { name: "presentAddress", type: "textarea", label: "Present Address", required: true },
        { name: "presentPincode", label: "Pin Code", required: true, inputMode: "numeric", maxLength: 6, pattern: PIN_RE, patternMessage: "Enter a valid 6-digit pin code" },
        { name: "communicationSameAsPresent", type: "checkbox", label: "Communication address same as above", span: 2 },
        { name: "communicationAddress", type: "textarea", label: "Communication Address", required: true, showIf: (v) => !v.communicationSameAsPresent },
        { name: "communicationPincode", label: "Pin Code", required: true, inputMode: "numeric", maxLength: 6, pattern: PIN_RE, patternMessage: "Enter a valid 6-digit pin code", showIf: (v) => !v.communicationSameAsPresent },
        { name: "primaryContact", type: "phone", label: "Primary Contact Number", required: true },
        { name: "email", type: "email", label: "Email ID", required: true },
        { name: "pan", label: "PAN No.", required: true, upper: true, maxLength: 10, pattern: PAN_RE, patternMessage: "Enter a valid PAN, e.g. ABCDE1234F" },
        { name: "aadhaarNo", label: "Aadhaar No.", required: true, inputMode: "numeric", maxLength: 12, pattern: AADHAAR_RE, patternMessage: "Enter a valid 12-digit Aadhaar number" },
      ],
    },
    {
      title: "Allotted Unit",
      fields: [
        { type: "note", text: "As stated in Clause 1 of your allotment letter." },
        { name: "unitNumber", label: "Unit/Apartment No.", required: true },
        { name: "bedrooms", label: "Bedrooms (e.g. 3 Bedroom)" },
        { name: "floor", label: "Floor" },
        { name: "block", label: "Block" },
        { name: "tower", label: "Tower" },
        { name: "carParkingSpaces", type: "number", label: "No. of Car Parking Spaces" },
      ],
    },
    {
      title: "Confirmation & Acknowledgement",
      fields: [{ name: "place", label: "Place", required: true }],
    },
  ],
  sameAs: [
    {
      flag: "communicationSameAsPresent",
      copy: { communicationAddress: "presentAddress", communicationPincode: "presentPincode" },
    },
  ],
  office: [
    { name: "allotmentLetterDate", type: "date", description: "For office use — date the allotment letter was issued" },
    { name: "verified", type: "boolean", default: false, description: "For office use — details checked against the issued allotment letter" },
  ],
};
