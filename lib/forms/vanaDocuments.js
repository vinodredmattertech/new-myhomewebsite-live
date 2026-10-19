/**
 * Legal copy shown in the terms modals of the My Home Vana forms, transcribed
 * word-for-word from the printed PDFs. Rendered by LegalDocument as a list of
 * blocks:
 *
 *   { h }                      clause heading
 *   { p }                      paragraph; `{{Label}}` marks a blank on the form
 *   { caps }                   emphasised all-caps notice
 *   { list, style, items }     style: "alpha" | "roman"
 *   { table: { columns, rows } }
 */

const CANCELLATION_TABLE = (unit) => ({
  columns: ["Sl. No.", "If the Letter requesting to cancel the booking is received", "Amount to be deducted"],
  rows: [
    ["1", "Within 15 days from issuance of the Allotment letter", "Nil"],
    ["2", "Within 16 to 30 days from issuance of the Allotment letter", `1% of the cost of the said ${unit}`],
    ["3", "Within 31 to 60 days from issuance of the allotment letter", `1.5% of the cost of the said ${unit}`],
    ["4", "After 61 days from issuance of the allotment letter.", `2% of the cost of the said ${unit}`],
  ],
});

/** Booking Application Form — Terms & Conditions (pages 6–7). */
export const VANA_BOOKING_TERMS = [
  { h: "1. Payment Term" },
  { p: "The following payment term shall be applicable for the successful allotment of the Unit/s requested through this application:" },
  {
    table: {
      columns: ["Day/Event", "Payment Obligation", "Conditions"],
      rows: [
        ["Initial advance amount", "₹5,00,000 (Rupees Five Lakh, inclusive of applicable GST)", "Refundable as per Sl No. 7"],
        ["Within 10 days from the date of booking", "9.9% of the sale consideration as applicable (less booking amount)", "Refundable as per Sl No. 7"],
        ["On Execution of Agreement for sale", "In accordance with payment schedule set out in the Agreement of sale", "As per terms of agreement"],
      ],
    },
  },
  { caps: "IF PROVISIONAL ALLOTMENT IS CANCELLED IN ACCORDANCE WITH THE TERMS CONTAINED HEREIN, PROMOTER IS ENTITLED TO ALLOT THE CANCELLED UNIT/S TO ANY THIRD PARTY AT ITS SOLE DISCRETION. THE APPLICANT(S) WILL THEREAFTER HAVE NO FURTHER RIGHTS OR CLAIMS AGAINST THE COMPANY FOR ALLOTMENT/POSSESSION OF THE CANCELLED UNIT/S." },
  { caps: "EXCEPT FOR GST ON BOOKING AMOUNT, APPLICABLE GOODS AND SERVICES TAX, INFRASTRUCTURE CHARGES, STATUTORY DUTIES, FEES AND LEVIES & OTHER POSSESSION RELATED CHARGES ARE NOT INCLUDED AND IS PAYABLE AS PER COST SHEET PROVIDED OR PAYMENT SCHEDULE ATTACHED TO THE SALE AGREEMENT." },
  { p: "*My Home/EOI voucher can be redeemed against the initial advance amount and amounts payable on the day of booking" },

  { h: "2. Application Not a Confirmation of Allotment" },
  { p: "It is expressly clarified that this application for allotment (the “Application”) is neither a confirmation of allotment nor implies any undertaking by My Home Group and/or its subsidiaries/ affiliates/ associated concerns (the “Promoter”) to allot and/or reserve and/or block the Unit/s that the applicant(s) have requested for, in this Application. If the Application is confirmed, the Unit/s preferred and chosen by the applicant(s) (the “Unit/s”) will be temporarily blocked and an allotment letter will be issued, subject to the explicit conditions set out in paragraph 4 below, failing which the company shall be entitled to cancel the allotment and deal with the Unit/s in any manner of its choosing." },

  { h: "3. Basis of Processing Application" },
  { p: "This ‘Application’ shall be processed basis the fulfillment of the below requirements, failing which the ‘Promoter’ shall be entitled to reject/cancel the ‘Application’" },
  {
    list: true,
    style: "alpha",
    items: [
      "All columns in the ‘Application’ are filled completely and all pages are duly signed by Applicant(s)",
      "Applicant(s) shall submit necessary self-attested KYC along with this ‘Application.’",
      "Promoter shall process the ‘Application’ in accordance with its policies and procedures, including but not limited to carrying out the necessary verification of KYC, checks to establish the financial credentials and credit score of the Applicant(s).",
      "Availability of the “Unit/s” at the time of submission of the ‘Application’",
      "Realization of Earnest Money / Booking advance issued towards the ‘Unit/s’",
    ],
  },

  { h: "4. Conditions of Allotment" },
  { p: "The allotment, if confirmed pursuant to this Application, is subject to the following conditions failing which the Unit/s temporarily reserved for the Applicant(s) shall be released and the allotment in favour of Applicant(s) shall stand cancelled with immediate effect without the need for any further notice to Applicant(s)" },
  {
    list: true,
    style: "roman",
    items: [
      "The Applicant(s) shall execute and register the agreement to sell within 60 (sixty) days from the date of issue of the Allotment Letter; and",
      "On execution of the Agreement to Sell, the terms and conditions as contained in the Agreement to Sell shall become applicable.",
    ],
  },

  { h: "5. Powers of Attorney" },
  { p: "In case Applicant(s) appoints a power of attorney, a self-attested copy of the power of attorney must be submitted along with this Application, failing which the Promoter may reject the Application. If the Applicant(s) is desirous of appointing a power of attorney for execution and registration of the agreement to sell, Promoter may, upon a request from Applicant, assist the Applicant in such process, the costs, expenses and charges of which shall be borne by the Applicant(s)." },

  { h: "6. Deposits, Charges, Fees and Other Expenses" },
  { p: "All deposits, fees, expenses, charges or levies including those demanded, or incurred, or required to be paid to the relevant authorities, bodies, agencies, and/or departments on account of developing infrastructure, management of such infrastructure & other services shall be borne and paid by the applicant(s) in accordance with the terms of the Agreement to Sell." },

  { h: "7. Default & Cancellation" },
  { p: "Any default in payments by Applicant(s) to Promoter after issue of the allotment letter will be handled in accordance with the terms and conditions of the allotment letter or executed agreement to sell as applicable. In case of the applicant cancelling or seeking cancellation of the booking prior to allotment letter, booking amount paid shall be refunded. In case of cancellation of the booking after issuance of allotment letter, the cancellation charges shall be as per the table provided below:" },
  { table: CANCELLATION_TABLE("Unit/s") },
  { p: "The applicant/s will be solely responsible for timely payment of all amounts due, irrespective of whether the payments are made from their own funds or by way of housing loan if any availed from a bank." },

  { h: "8. GST" },
  { p: "In the event of cancellation of an allotment for any reasons whatsoever, all amounts paid on account of GST cannot be refunded. The company shall provide certificate to applicant stating the amounts paid on account of GST, which certificate the applicant may use to directly apply for the refund of the GST paid, if permitted by law." },

  { h: "9. Change Management" },
  { p: "In case the applicant/s is desirous of changing/substituting the names of purchasers/applicants after the execution and registration of the agreement to sell, all charges, costs and expenses associated therewith, including but not limited to procuring, embossing, franking of relevant document and purchase of stamp papers shall be borne exclusively by the applicant(s)." },

  { h: "10. Minor Applicant" },
  { p: "Wherever a minor is a second applicant, all documents shall be signed by the natural guardian on behalf of the minor. The natural guardian shall be solely responsible for informing the Company once the minor attains the age of majority, and at all times prior to the execution of the conveyance deed." },

  { h: "11. Time is the Essence" },
  { p: "The Applicant(s) undertakes to make payment of any and all amounts due to promoter strictly in accordance with the payment schedule stated herein, without delay, and in full. The Applicant(s) agrees and acknowledges that, subject to confirmation of allotment, time is the essence of agreement between Applicant(s) and Promoter, and consequently the Applicant(s) obligation to make payments on time and in full is of the essence." },

  { h: "12. Governing Law" },
  { p: "All disputes relating to/arising out of or in relation to this application for allotment will be subject to the exclusive jurisdiction of the courts located in the city where the project is situated." },

  { h: "13. NRI/PIO Applicant(s)" },
  { p: "Non-resident Indians/ Person of Indian Origin shall comply with all statutory compliances applicable by laws, rules and regulations prevalent in India for purchase of Unit/s sold by the Company. The Company shall not be liable for any non-compliance on part of the NRI/PIO Applicant(s)." },

  { h: "14. Grievance Redressal" },
  { p: "For any queries or concerns regarding this Application, the booking or allotment of the Unit/s, payments or related documentation, the Applicant(s) may write to the Customer Grievance Redressal Desk at grievance@myhomeconstructions.com. The Customer Grievance Redressal Desk shall respond within 48 (forty-eight) working hours of receiving the query. If no response is received within this period, the Business Head shall reach out to the Applicant(s) within the following 48 (forty-eight) hours to resolve the query." },
];

const SURVEY_NUMBERS = "Sy.No.12 (P), 16(P), 17(P), 18(P), 19(P), 20(P), 21(P), 22(P) and 23(P)";

/** Allotment (Welcome) Letter — pages 1–5. */
export const VANA_ALLOTMENT_LETTER = [
  { h: "Welcome to the My Home family" },
  { p: "Choosing a home is among the most meaningful decisions a family makes, and we are honoured that you have chosen to make yours with us. It gives us great pleasure to welcome you to the My Home family and to confirm the allotment of your new home." },
  { p: "Every My Home address rests on a simple promise: quality you can see, commitments we keep, and a relationship that continues long after you receive your keys. We look forward to earning your trust at every stage of this journey." },
  { p: "The pages that follow set out the details of your allotment, the payments and timelines, and the steps towards your Agreement for Sale. We request you to read them carefully and to sign the confirmation and acknowledgement at the end." },
  { p: "Should you need any assistance, please write to us at info@myhomeconstructions.com and our team will be glad to help." },
  { p: "Once again, welcome home. Let’s make living better." },
  { p: "With warm regards, My Home Group" },

  { p: `Subject: Your request for allotment of unit in the project “{{Project}} Phase-1” at ${SURVEY_NUMBERS}, EPID No. {{EPID No.}}, situated at Konadasapura Village, Bidarahalli Hobli, Bengaluru East Taluk, Bengaluru District, having K- RERA Registration No. PRM/KA/RERA/{{RERA No.}}.` },
  { p: "Sir/Madam," },

  { h: "1. Allotment of the Unit" },
  { p: `With reference to the above subject, it is our pleasure to inform that you have been allotted a {{No.}} Bedroom Unit/Apartment bearing No. {{Unit No.}} in {{Floor}} floor of {{Block}} Block, {{Tower}} Tower, having a carpet area of {{Area}} Sq. Meters equivalent to {{Area}} Sq. Feet, {{No.}} number of car parking space (herein after referred to as “the Said Unit”), in the project known as “{{Project}} Phase-1” having K-RERA Registration No. PRM/KA/RERA/{{RERA No.}} being developed by M/s.Sreni Nirman Pvt Ltd (the “Company”) at ${SURVEY_NUMBERS} EPID No. {{EPID No.}}, situated at Konadasapura Village, Bidarahalli Hobli, Bengaluru East Taluk, Bengaluru District, for a total sale consideration of INR {{Amount}}/- ( Rupees {{Amount in words}} only) exclusive of GST, stamp duty, registration charges and other charges as defined in the Agreement to Sell to be executed.` },

  { h: "2. Receipt of part consideration" },
  { p: "I/We confirm to have received from you an amount of Rs. {{Amount}}/- (Rupees {{Amount in words}} only), being {{%}} % of the total consideration value of the said unit as booking amount / advance payment on {{Date}} through {{Mode}} mode of payment." },
  { p: "If you fail to make the balance {{%}} % of the booking amount/ advance payment within the time stipulated above further action as stated in Clause 11 hereunder written shall be taken by us as against you." },

  { h: "3. Disclosures of information" },
  { p: "I/We have made available to you the following information namely:" },
  {
    list: true,
    style: "roman",
    items: [
      "The sanctioned plans along with specifications, approved by the competent Authority are displayed at the project site and have also been uploaded on K-RERA website.",
      "The stage wise time schedule of completion of the project, including the provisions for civic infrastructure like water, sanitation and electricity is as stated in Annexure - A attached herewith and",
      "The website address of K-RERA is https://rera.karnataka.gov.in/",
    ],
  },

  { h: "4. Encumbrances" },
  { p: "I/We, hereby confirm that the said unit is free from all encumbrances and I/We hereby further confirm that no encumbrances shall be created on the said unit." },

  { h: "5. Further payments" },
  { p: "Further payments towards the consideration of the said unit as well as of the covered car parking space(s) shall be made by you, in the manner and at the times as well as on the terms and conditions as more specifically enumerated/stated in the Agreement for Sale to be entered into between ourselves and yourselves." },

  { h: "6. Possession" },
  { p: "The said unit along with the covered car parking spaces(s) shall be handed over to you on or before {{Date}}, subject to the payment of the consideration amount of the said unit as well as of the garage(s) / covered car parking space(s)in the manner and at the times as well as per the terms and conditions as more specifically enumerated/stated in the Agreement for Sale to be entered into between ourselves and yourselves." },

  { h: "7. Interest payment" },
  { p: "In case of delay in making any payments, you shall be liable to pay interest at the rate which shall be the State Bank of India highest Marginal Cost of Lending Rate plus two percent." },

  { h: "8. Cancellation of Allotment" },
  { p: "In case you desire to cancel the booking an amount mentioned in the Table hereunder written would be deducted and the balance amount due and payable shall be refunded to you without interest within 45 days from the date of receipt of your letter requesting to cancel the said booking." },
  { table: CANCELLATION_TABLE("Unit") },
  { p: "The amount deducted shall not exceed the amount as mentioned in the table above. In the event the amount due and payable referred in Clause 8 above is not refunded within 45 days from the date of receipt of your letter requesting to cancel the said booking, you shall be entitled to receive the balance amount with interest calculated at the rate which shall be the State Bank of India highest Marginal Cost of Lending Rate plus two percent." },

  { h: "9. Other payments" },
  { p: "You shall make the payment of GST, stamp duty and registration charges, as applicable and such other payments as more specifically mentioned in the Agreement for sale, the proforma whereof is enclosed herewith in terms of Clause 10 hereunder written." },

  { h: "10. Proforma of the Agreement for Sale and binding effect" },
  { p: "The proforma of the Agreement for sale to be entered into between us and yourselves is enclosed herewith for your ready reference. Forwarding the proforma of the agreement for sale does not create a binding obligation on the part of ourselves and yourselves until compliance by yourselves of the mandate as stated in Clause 11." },

  { h: "11. Execution of the Agreement for Sale" },
  { p: "a) You shall execute the agreement for sale within a period of {{No.}} months from the date of issuance of this letter or within such period as may be communicated to you. The said period of {{No.}} months can be further extended on our mutual understanding." },
  { p: "In the event the booking amount is collected in stages and if the Allottee fails to pay the subsequent stage installment, the prompter shall serve upon the Allottee notice calling upon the allottee to pay the subsequent stage installment within 15 (fifteen) days which if not complied, the promoter shall be entitled to cancel this allotment letter. On cancellation of the allotment letter the promoter shall be entitled to forfeit the amount paid by the allottee or such amount as mentioned in the Table enumerated in Clause 8 whichever is less. In no event the amount to be forfeited shall exceed the amount mentioned in the above referred Table. Except for the above all the terms and conditions as enumerated in this allotment letter shall be applicable even for cases where booking amount is collected in stages." },
  { p: "b) If you fail to execute the agreement for sale within the stipulated period {{No.}} months from the date of issuance of this letter or within such period as may be communicated to you, I/We shall be entitled to serve upon you a notice calling upon you to execute the agreement for sale within 15 (Fifteen) days, which if not complied, I/We shall be entitled to cancel this allotment letter and further I/We shall be entitled to forfeit an amount not exceeding 2% of the cost of the said unit and the balance amount if any due and payable shall be refunded without interest within 45 days from the date of expiry of the notice period." },
  { p: "c) In the event the balance amount due and payable referred in Clause(ii) above is not refunded within 45 days from the date of expiry of the notice period, you shall be entitled to receive the balance amount with interest calculated at the rate which shall be the State Bank of India highest Marginal Cost of Lending Rate plus two percent." },

  { h: "12. Validity of Allotment Letter" },
  { p: "This allotment letter shall not be construed to limit your rights and interest upon execution of the agreement for sale between ourselves and yourselves. Cancellation of allotment of the said unit thereafter, shall be covered by the terms and conditions of the said registered document." },

  { h: "13. Headings" },
  { p: "Headings are inserted for convenience only and shall not affect the construction of the various Clauses of this allotment letter." },

  { h: "Annexure – 1: Stage wise time schedule of completion of the project" },
  {
    table: {
      columns: ["Sl.No", "Stages", "Date of Completion"],
      rows: [
        "Excavation",
        "Basements (if any)",
        "Podiums (if any)",
        "Plinth",
        "Stilt (if any)",
        "Slabs of super structure",
        "Internal walls, internal plaster, completion of floorings, doors and windows",
        "Sanitary electrical and water supply fittings within the said units",
        "Staircase, lifts wells and lobbies at each floor level overhead and underground water tanks",
        "External plumbing and external plaster, elevation, completion of terraces with waterproofing.",
        "Installation of lifts, water pumps, fire fighting fittings and equipment, electrical, fittings, mechanical equipment, finishing to entrance lobby/s, plinth protection, paving of areas appurtenant to building / wing, compound wall and all other requirements as may be required to complete project as per specifications in agreement of sale, any other activities.",
        "Internal roads &footpaths, lighting",
        "Water supply",
        "Sewerage (chamber, lines, septic tank, STP)",
        "Storm water drains",
        "Treatment and disposal of sewage and sullage water",
        "Solid waste management & disposal",
        "Water conservation / rain water harvesting",
        "Electrical meter room, sub-station, receiving station.",
        "Others",
      ].map((stage, i) => [String(i + 1), stage, "{{Date}}"]),
    },
  },
];
