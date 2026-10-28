import {
  NAME_TITLES,
  RESIDENT_STATUS,
  EMPLOYMENT_STATUS,
  INDUSTRIES,
  ORGANIZATION_TYPES,
  FUNCTIONAL_DOMAINS,
  PURPOSE_OF_PURCHASE,
  PIN_RE,
} from "@/lib/forms/options";

/**
 * Customer Market Survey — the printed "Customer Market Survey Form" (one per
 * city), as a DynamicForm config. The Bengaluru and Chennai forms are
 * identical except for the preferred-location list, so both come from
 * `marketSurveyForm(city)`; submissions share the market-survey-response
 * collection and are told apart by `city`.
 */

export const SURVEY_CITIES = {
  bengaluru: {
    city: "Bengaluru",
    locations: [
      "Hebbal",
      "Sarjapur Road",
      "Devanahalli",
      "Whitefield",
      "Yelahanka",
      "Old Madras Road",
      "Thanisandra",
      "Hoskote",
      "Hennur Road",
      "Budigere Cross",
      "Sathanur",
      "Bellandur / ORR",
    ],
  },
  chennai: {
    city: "Chennai",
    locations: [
      "Sholinganallur",
      "Navalur",
      "Siruseri",
      "Perumbakkam",
      "Kelambakkam",
      "Padur",
      "OMR",
      "Egattur",
      "Pudupakkam",
      "Thaiyur",
      "Thiruporur",
      "Kovalam / ECR",
    ],
  },
};

const SURVEY_INCOME_SELF = [
  "Less than 10",
  "10 – 20",
  "20 – 30",
  "30 – 40",
  "40 – 50",
  "50 and above",
];
const SURVEY_INCOME_HOUSEHOLD = [
  "Less than 10",
  "10 – 20",
  "20 – 30",
  "30 – 40",
  "40 – 50",
  "Above 50",
];

export const SURVEY_DISCLAIMER =
  "Participation in this survey is voluntary. This survey is conducted solely to understand home-buying preferences and is not an advertisement, prospectus, offer, invitation to offer or solicitation for the sale of any plot, apartment, building or real estate project. Nothing in this form amounts to a booking, allotment, reservation or commitment of any kind by either party. The locations, configurations, area ranges, budget ranges and floor bands mentioned are indicative and for research purposes only; they do not represent the price, specification or availability of any project. The information you provide will be kept confidential and used only for market research and internal analysis. It will not be sold, and will be shared only with service providers assisting with this survey or where required by law. You may ask for your information to be corrected or deleted at any time.";

const notSame = (flag) => (v) => !v[flag];

export function marketSurveyForm(cityKey) {
  const { city, locations } = SURVEY_CITIES[cityKey];
  return {
    endpoint: "market-survey-responses",
    formSource: `Customer Market Survey - ${city}`,
    label: "Market Survey",
    heading: "Market Survey Form",
    intro: ["A short survey to understand your preferences for the purchase of your home."],
    // Set by the page, not by the visitor.
    fixed: { city },
    submitText: "Submit Survey",
    success: {
      title: "Thank you for your time.",
      text: "Your responses have been recorded.",
    },
    sections: [
      {
        title: "About You",
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
          { name: "dateOfBirth", type: "date", label: "Date of Birth" },
          { name: "residentStatus", type: "radio", label: "Resident Status", options: RESIDENT_STATUS, columns: 2 },
          { name: "permanentAddress", type: "textarea", label: "Permanent Address" },
          { name: "permanentPincode", label: "Pin Code", inputMode: "numeric", maxLength: 6, pattern: PIN_RE, patternMessage: "Enter a valid 6-digit pin code" },
          { name: "communicationSameAsPermanent", type: "checkbox", label: "Communication address same as above", span: 2 },
          { name: "communicationAddress", type: "textarea", label: "Communication Address", showIf: notSame("communicationSameAsPermanent") },
          { name: "communicationPincode", label: "Pin Code", inputMode: "numeric", maxLength: 6, pattern: PIN_RE, patternMessage: "Enter a valid 6-digit pin code", showIf: notSame("communicationSameAsPermanent") },
          { name: "primaryContact", type: "phone", label: "Primary Contact No.", required: true },
          { name: "alternateContact", type: "phone", label: "Alternate Contact No." },
          { name: "email", type: "email", label: "Email ID", required: true },
        ],
      },
      {
        title: "Professional Details",
        fields: [
          { name: "employmentStatus", type: "radio", label: "Employment Status", options: EMPLOYMENT_STATUS, columns: 5 },
          { name: "industry", type: "radio", label: "Industry", options: INDUSTRIES, columns: 3, other: { value: "Others", name: "industryOther", label: "Please specify" } },
          { name: "organizationType", type: "radio", label: "Organizational Type", options: ORGANIZATION_TYPES, columns: 5, other: { value: "Others", name: "organizationTypeOther", label: "Please specify" } },
          { name: "functionalDomain", type: "radio", label: "Functional Domain", options: FUNCTIONAL_DOMAINS, columns: 3, other: { value: "Others", name: "functionalDomainOther", label: "Please specify" } },
          { name: "companyName", label: "Company/Firm Name" },
          { name: "location", label: "Location" },
          { name: "designation", label: "Designation" },
          { name: "workExperience", label: "Work Experience (No. of years/Establishment)" },
          { name: "officialEmail", type: "email", label: "Official Email ID" },
          { name: "officePincode", label: "Office Pin Code", inputMode: "numeric", maxLength: 6, pattern: PIN_RE, patternMessage: "Enter a valid 6-digit pin code" },
          { name: "officeAddress", type: "textarea", label: "Office Address (Organization/Business)", span: 2 },
          { name: "selfAnnualIncome", type: "radio", label: "Self Annual Income (in ₹ Lakhs)", options: SURVEY_INCOME_SELF, columns: 3 },
          { name: "annualHouseholdIncome", type: "radio", label: "Annual Household Income (in ₹ Lakhs)", options: SURVEY_INCOME_HOUSEHOLD, columns: 3 },
        ],
      },
      {
        title: "Purpose of Purchase",
        fields: [
          { name: "purposeOfPurchase", type: "radio", label: "What would be your purpose of purchase?", options: PURPOSE_OF_PURCHASE, columns: 2, other: { value: "Others", name: "purposeOfPurchaseOther", label: "Please specify" } },
        ],
      },
      {
        title: "Your Home and Locality Today",
        fields: [
          { name: "currentHomeImprovements", type: "textarea", label: "What are some of the things that could be better in your current home?", span: 2 },
          {
            name: "localityChallenges",
            type: "checkboxes",
            label: "What are the challenges that you face in your current locality? (Tick all that apply)",
            options: [
              "Limited metro connectivity",
              "Poor road infrastructure",
              "Lack of open and green spaces",
              "Unreliable power supply",
              "Distance from educational institutions",
              "Distance from healthcare facilities",
              "Any other",
            ],
            columns: 2,
            other: { value: "Any other", name: "localityChallengesOther", label: "Please specify" },
          },
        ],
      },
      {
        title: "Preferred Locations",
        fields: [
          { name: "preferredLocations", type: "checkboxes", label: "Which of these locations would you consider for a home or investment? (Tick all that apply)", options: locations, columns: 3 },
          { name: "preferredLocationsOther", label: "Any Other Location", span: 2 },
          {
            name: "locationNonNegotiables",
            type: "checkboxes",
            label: "Which of these are non-negotiable in your home's location? (Choose up to three)",
            options: [
              "Metro connectivity",
              "Office hubs / IT-ITES parks",
              "International airport",
              "Educational institutions",
              "Healthcare facilities",
              "Leisure and entertainment",
            ],
            columns: 3,
            max: 3,
          },
        ],
      },
      {
        title: "Your Lifestyle Priorities",
        fields: [
          {
            name: "lifestylePriorities",
            type: "checkboxes",
            label: "What matters most to you when choosing a home? (Tick your top three)",
            options: [
              "Location and connectivity",
              "Developer reputation and track record",
              "Pricing and capital appreciation",
              "Construction quality and specifications",
              "Lifestyle amenities and clubhouse",
              "Open and green spaces",
              "Security and gated-community living",
              "Educational and healthcare facilities nearby",
              "Timely possession",
              "Vastu compliance",
            ],
            columns: 2,
            max: 3,
          },
          {
            name: "mustHaveAmenities",
            type: "checkboxes",
            label: "Which amenities are a must-have for you? (Tick all that apply)",
            options: [
              "Clubhouse",
              "Swimming pool",
              "Fitness centre",
              "Sports facilities",
              "Children's play area",
              "Jogging and cycling track",
              "Landscaped central greens",
              "Co-working space",
              "Senior citizens' zone",
              "Pet park",
              "EV charging points",
              "Convenience retail",
            ],
            columns: 3,
          },
          { name: "mustHaveAmenitiesOther", label: "Any Other", span: 2 },
          {
            name: "homeFeatures",
            type: "checkboxes",
            label: "Which features would you want inside your home? (Choose up to two)",
            options: [
              "Vastu-compliant layout",
              "Large balcony or deck",
              "Home office or study",
              "Utility and staff room",
              "Two covered car parks",
              "Smart home features",
            ],
            columns: 3,
            max: 2,
          },
          { name: "communityRetail", type: "radio", label: "Would you like retail, leisure and entertainment within your community?", options: ["Yes", "No", "No preference"], columns: 3 },
        ],
      },
      {
        title: "Home Configuration and Budget",
        fields: [
          { name: "configuration", type: "radio", label: "Which home configuration are you looking for?", options: ["Studio", "1 BHK", "2 BHK", "3 BHK", "4 BHK"], columns: 5 },
          {
            name: "areaRange",
            type: "radio",
            label: "What area range are you looking for? (in Sq. Ft.)",
            options: [
              "Studio: 300 – 500",
              "1 BHK: 600 – 800",
              "2 BHK: 1,000 – 1,400",
              "3 BHK C: 1,500 – 1,700",
              "3 BHK L: 1,800 – 2,000",
              "4 BHK C: 2,100 – 2,300",
              "4 BHK L: 2,400 – 2,600",
            ],
            columns: 2,
          },
          { name: "budgetRange", type: "radio", label: "What is your budget range for this home? (in ₹ Crores)", options: ["Under 1", "1 – 1.5", "1.5 – 2", "2 – 2.5", "2.5 – 3", "3 – 3.5", "Above 3.5"], columns: 4 },
          { name: "floorBand", type: "radio", label: "Which floor band would you prefer?", options: ["1 – 10", "11 – 20", "21 – 30", "31 – 40", "Above 40", "No preference"], columns: 6 },
          { name: "constructionStage", type: "radio", label: "What stage of construction would you prefer?", options: ["New launch", "Under construction", "Nearing possession", "Ready to move in"], columns: 4 },
          { name: "purchaseTimeline", type: "radio", label: "When are you planning to buy? (in months)", options: ["Within 3", "3 – 6", "6 – 12", "After 12", "Just exploring"], columns: 3 },
        ],
      },
      {
        title: "Media Preferences",
        fields: [
          {
            name: "mediaConsumption",
            type: "checkboxes",
            label: "Which media do you spend the most time on in a typical week? (Tick all that apply)",
            options: [
              "Newspapers",
              "Television",
              "Radio / FM",
              "Outdoor hoardings",
              "News websites and apps",
              "OTT streaming",
              "YouTube",
              "Instagram",
              "Facebook",
              "LinkedIn",
              "X (Twitter)",
              "WhatsApp",
            ],
            columns: 3,
          },
          {
            name: "homeInfoSources",
            type: "checkboxes",
            label: "Where would you look first for information on a new home? (Tick up to three)",
            options: [
              "Real estate portals",
              "Online search",
              "Developer websites",
              "Social media",
              "Newspaper advertisements",
              "Outdoor hoardings",
              "Property exhibitions",
              "Friends and family",
              "Emailers and SMS",
            ],
            columns: 3,
            max: 3,
          },
        ],
      },
      {
        title: "Remarks",
        fields: [{ name: "remarks", type: "textarea", label: "Remarks", span: 2 }],
      },
      {
        title: "Disclaimer",
        fields: [
          { type: "note", text: SURVEY_DISCLAIMER },
          {
            name: "contactConsent",
            type: "checkbox",
            label: "I agree to be contacted by phone, email, SMS or WhatsApp about upcoming homes and offers. (Optional)",
            span: 2,
          },
        ],
      },
    ],
    /** "Same as above" is a UI convenience; store the copied address. */
    sameAs: [
      {
        flag: "communicationSameAsPermanent",
        copy: { communicationAddress: "permanentAddress", communicationPincode: "permanentPincode" },
      },
    ],
    /** Admin-only fields on the Strapi record. */
    office: [{ name: "feedbackTakenBy", type: "string", description: "For office use — the staff member who took the survey" }],
  };
}
