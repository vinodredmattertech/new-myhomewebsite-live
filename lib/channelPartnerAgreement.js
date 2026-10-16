/**
 * Channel Partner Agreement — the text of the printed "My Home Channel Partner
 * Agreement Form", transcribed for the /channel-partner-agreement page.
 *
 * This is legal copy, so it is kept word-for-word with the PDF. Blanks the
 * printed form leaves for hand-filling are written as `{{Label}}` and rendered
 * as a marked placeholder by AgreementText — the values themselves are
 * captured by the registration form, not typed into the agreement.
 */

/** Cover letter that opens the printed agreement. */
export const COVER_LETTER = {
  greeting: "Greetings from My Home Group!!",
  paragraphs: [
    "To strengthen our relationship further with the Channel Partners, we are now entering into formal agreements with all our Channel Partners for which purpose we have enclosed the Channel Partner Agreement. We request you to kindly sign on each page along with your company stamp and get the agreement franked or E-Stamped for INR 200/- on the 1st page of the agreement. We also request you to have the agreement signed by one witness from your end (and also fill their address below their respective signatures) at the space provided in the Agreement for witness. Kindly enclose copy of PAN card, Aadhaar Card, GST, RERA Registration details and board resolution or authorisation letter along with your company profile for our records. We shall send you the copy of the Agreement after getting it duly signed by our Authorised Signatory and witnessed from our end.",
    "This Agreement will supersede all previous Agreements or arrangements between you and the Company. In case of any queries and clarifications, please feel free to contact the undersigned.",
  ],
};

/** "Please Read" notes printed above the registration form. */
export const PLEASE_READ = [
  "Please be sure you understand all the terms & conditions printed on the reverse page.",
  "Incomplete forms will lead to delay in processing your request.",
  "All details requested for in this registration form is mandatory.",
];

export const NATURE_OF_BUSINESS = [
  "Land Sourcing for Developers",
  "Residential Sales",
  "Commercial Sales",
  "Agricultural Land Sales",
  "Industrial Sales",
  "Project Consultancy",
  "Property Management",
  "Rentals (Res./Comm.)",
];

/** Must match the `organisationType` enum on the Strapi schema. */
export const ORGANISATION_TYPES = [
  "Sole Proprietorship",
  "Partnership Limited",
  "Private Limited",
  "Public Limited",
  "Others",
];

export const CONTACT_TITLES = ["Mr.", "Dr.", "Ms", "Mrs", "M/s."];

export const DECLARATION =
  "I hereby declare that all the information provided by me above is true to the best of my knowledge and belief and I am submitting this registration form to register with My Home Group as a Channel Partner and I agree and shall abide by the terms and conditions specified on the reverse of the page.";

/** Terms & Conditions of the registration form. */
export const REGISTRATION_TERMS = [
  "Selection of application is at the absolute discretion of My Home Group and My Home Group may accept or reject the application without assigning any reasons.",
  "The application shall be complete in all respects and shall be accompanied by requisite documents.",
  "Constitution Documents and Registration Certificates issued by CT Department/ST Authorities shall accompany the application, without which the application shall not be processed.",
  "All discussions between My Home Group and applicant and the information contained in the documents shall be confidential and shall not be disclosed to anyone except to the subsidiaries.",
  "Applicant may be entitled to take back the documents submitted within 45 days of submission, thereafter which they will be destroyed.",
  "The applicant confirms that he/she/it is not involved in any economic offences, tax default or moral turpitude.",
];

/** Opening of the Domestic Channel Partner Agreement — parties and recitals. */
export const AGREEMENT_PREAMBLE = {
  title: "Domestic Channel Partner Agreement",
  paragraphs: [
    'This Domestic Channel Partner agreement (the "Agreement") is made and executed on {{Date}} at {{Place}}',
    "BETWEEN",
    "MY HOME GROUP, hereinafter referred to as the “Company”, which term wherever it appears shall mean and include its successors-in-interest, subsidiaries, group entities / group companies and permitted assigns, unless the context requires otherwise, represented here by its Authorized Signatory, {{Authorised Signatory}}",
    "AND",
    "{{Channel Partner Name}}, an Individual / a registered partnership firm (Regn. No.: {{Regn. No.}}) / a company (CIN: {{CIN}}) incorporated under the Companies Act, 1956 or 2013 / Limited Liability Partnership (LLPIN: {{LLPIN}}) registered under the provisions of the Limited Liability Partnership Act, aged about {{Age}} years ordinarily residing at {{Residence}} with its principal place of business at {{Place of Business}} having its registered office at {{Registered Office}} represented by its authorised signator/managing partner/designated partner Mr./Ms. {{Signatory}}, hereinafter referred to as the “Channel Partner”, (which term wherever it appears shall mean and includes his/her legal heirs, executors, administrators, authorized representatives/ its successors in interest and permitted assigns, as the context requires).",
    "My Home Group and the Channel Partner collectively shall be referred as “Parties”.",
  ],
  recitals: [
    "Company is engaged in the business of developing residential and commercial real estate projects.",
    "The Channel Partner has represented that Channel Partner has experience in marketing, promoting and facilitating the sale of units/apartment/spaces in residential and commercial real estate projects and has offered his/her/its services to market, promote and facilitate the sale of residential & commercial properties developed by the Company (hereinafter referred to as the “Products”) and the Company, based on such representations, is willing to engage and appoint the Channel Partner to provide Business Services to the Company on a principal-to-principal basis.",
    "Channel Partner has further represented that he/she/it has the requisite skill, knowledge, experience, expertise, infrastructure and capability to market the Products and further that he/she/it has the requisite trained and experienced persons to perform the functions in terms of this Agreement.",
    "Relying upon the representations made and warranties given by the Channel Partner, the Company has agreed to engage and appoint the Channel Partner to provide Business Services to the Company on a non-exclusive basis, subject to the terms and conditions of this Agreement.",
  ],
};

/**
 * The numbered clauses. A clause has either `body` (paragraphs) or `items`
 * (numbered sub-clauses, `n` being the printed number).
 */
export const AGREEMENT_CLAUSES = [
  {
    title: "Condition Precedent to Engagement",
    body: [
      "Channel Partner agrees and acknowledges that he/she/it is a registered real estate agent in the state of {{State}} State), as required under the Real Estate (Regulation and Development) Act, 2016 and Real Estate Regulation and Development Rules framed thereunder by the state. In the event of not being a registered agent under RERA, Channel Partner explicitly undertakes to register himself/herself/itself as a real estate agent as a condition precedent to confirmation of his/her/its appointment as Channel Partner under this Agreement and to communicate his/her/its registration number to the Company forthwith. Channel Partner agrees and acknowledges that this Agreement shall not become valid and binding on the parties. unless and until the Channel Partner has communicated the registration number to the Company.",
    ],
  },
  {
    title: "Engagement & Territory",
    body: [
      "The Company agrees to appoint and engage the Channel Partner and the Channel Partner hereby accepts the engagement to provide Business Services on a non-exclusive, principal to principal basis, which appointment shall be effective from {{Start Date}} to {{End Date}}, subject to the terms and conditions of this Agreement. Channel Partner agrees and acknowledges that such appointment to provide Business Services shall be restricted exclusively to the geographical territory of India., unless the Company agrees, in writing, to expand its scope.",
    ],
  },
  {
    title: "Term",
    body: [
      "This Agreement is valid during the period of 1 (one) financial year, i.e., the 1st day of April to the 31st day of March in the following year (the “Initial Term”), irrespective of the date of execution of this Agreement. Upon expiry of the Initial Term, this Agreement shall renew automatically for a further period of 1 (one) financial year, and shall be deemed to have been renewed on the same terms as set out herein, unless otherwise terminated/amended/modified by either party during such term. Either party shall be entitled to terminate this Agreement without cause by giving the other party written notice of not less than 1 (one) month. Upon expiry of the notice period of 1 (one) month, this Agreement shall cease to be valid and both parties shall be discharged of their obligations, save and except such liabilities that pre-date the effective date of termination.",
    ],
  },
  {
    title: "Business Activity",
    items: [
      {
        n: "4.1",
        text: "Channel Partner shall be entitled to book/sell and to solicit customers for any of the Products specified by the Company. The Channel Partner may also solicit prospective tenants of any of the Products so specified by the Company. Furthermore, the Channel Partner shall confirm with the Company of the availability of Products before booking or committing to the prospective buyers / tenants. The Channel Partner shall obtain all such confirmations one week in advance which confirmation will be valid for a period of one week thereafter. Notwithstanding the above, any booking or sale of the confirmed Products by the Company during this period shall prevail over the booking/sale made by the Channel Partner. It is hereby clarified that the Channel Partner shall not have the right to sign any document with the customer binding the Company and the Channel Partner shall only bring the customer to the Company who alone shall have the right to sign any binding agreement.",
      },
      {
        n: "4.2",
        text: "The Company shall disseminate information about the said Products, about unsold units including the area, the minimum price, the payment terms, the documentations and the status of the receipt of the bookings to the Channel Partner. The Channel Partner shall strictly adhere to the guidelines laid down by the Company and shall not deviate from the same in any manner whatsoever. The Channel Partner shall not make any false representations, and/or publish any posts, comments, videos and/or complaints and/or makes allegations, representations on any social media platforms or any other media, in relation to the Company, its Promoters, Directors, key managerial personnel, employees, projects, business practices, which shall be defamatory or derogatory or tarnish the image and reputation of the Company or engage in any negative publicity to that effect.",
      },
      {
        n: "4.3",
        text: "The Channel Partner shall not engage in any negotiation with any customer and in the event it is found or has reasons to believe that the Company, through its own Sales Personnel and without the effort of the Channel Partner has ‘first approached’ or ‘engaged’ any Customer for the sale of any Product of the Company, the Channel Partner shall not be entitled for brokerage for any booking/sale made in favour of such customer/s. The decision of the Company shall be final and binding in this regard.",
      },
      {
        n: "4.4",
        text: "That the Company will not provide any marketing support to the Channel Partner, except supply of brochures. The Channel Partner shall bear all the incidental expenses including expense for site visits. All marketing co-ordinates produced by the Channel Partner shall have been pre-approved by the Company in writing.",
      },
      {
        n: "4.5",
        text: "If more than one Channel Partner has committed a booking/sale of the same Product to different Customers, the sale shall be confirmed by the Company in favour of the first of the confirmations received, irrespective of the price at which the Product is sold/booked. No brokerage shall be payable to the Channel Partner booking the rejected sale. If a sale is confirmed by the Channel Partner without prior confirmation from the Company of the availability of the Product in the manner set out above, then the Channel Partner shall not be entitled to brokerage and the sale will not be completed.",
      },
      {
        n: "4.6",
        text: "The Channel Partner shall not disseminate or any information in any of the Company’s ongoing and forthcoming Projects or solicit any Customer for any Projects of the Company without obtaining written permission from the Company.",
      },
    ],
  },
  {
    title: "Pricing and Payment",
    body: [
      "All booking made by the Channel Partner shall be subject to currently valid “Pricing Schedule” issued by the Company from time to time in respect of each of the Products and also subject to the standard terms and conditions, and payment schedules as applicable to the said products, unless otherwise agreed by the Company in writing duly signed only by its Chief Financial Officer. All amounts payable towards the sale consideration/construction cost towards the Product shall be remitted in the name of the Company through proper banking channels as per the rules, regulations, directions of the Reserve Bank of India (RBI) or other appropriate authorities from time to time and all sales made to NRI / PIO / Foreign National will be accepted by the Company subject to the condition that such person is not disentitled to own property in India. No sales shall be made to citizens of Pakistan, Bangladesh and other countries who are prohibited from acquiring properties in India under the provisions of any law, including the Foreign Exchange Management Act.",
    ],
  },
  {
    title: "Professional Charges",
    items: [
      {
        n: "6.1",
        text: "The Company agrees to pay to the Channel Partner a commission (hereinafter referred to as “Professional Charges”) in the manner specified in Annexure ‘A’, subject to completion of the transaction in the manner indicated therein. All payments are subject to deduction of all applicable taxes. For the purpose of Professional Charges payable in respect of sale of the Company products, the expression, “Basic Sale Price” shall mean the Price at which the Super Built up Area of the Product (including Preferred location charges, Floor Rise charges, Car Park charges and , TDS remittance by the Customer) is sold to the Customer, excluding all statutory charges, infrastructure charges, stamp duty, registration fee, deposits, club charges, taxes, Substation charges, Power connection charges, Water supply infrastructure charges upon the customer signing a valid agreement with the applicable advance payments and maintenance deposits payable by the Customer and shall become payable subject to fulfilment of all conditions set out herein duly confirmed by the Marketing Department of the Company.",
      },
      {
        n: "6.2",
        text: "The Channel Partner shall not claim any Professional Charges out of the leads that may be diverted from any employee / marketing department of the Company and shall be independent of any such referral / reference / recommendation by any employee of the Company. In the event of the Company acquiring knowledge at a later date that the Professional Charges claimed is against a sale referred by the Company’s sales personnel, then, in such an event, the Channel Partner shall immediately upon demand made by the Company refund the Professional Charge amounts received and My Home Group shall also reserve the right to terminate this Agreement forthwith and without any further notice or reference to the Channel Partner.",
      },
    ],
  },
  {
    title: "Cancellation of Bookings",
    body: [
      "If the cancellation is made after signing the agreement and making the payment, then the Professional Charges, if already paid for that sale shall be immediately refunded by the Channel Partner upon a request made by the Company.",
    ],
  },
  {
    title: "Mode of Payment",
    body: [
      "All payments shall be made in Indian Currency only and will be remitted by authorized banking channels subject to deduction of tax at source in compliance with the applicable laws that are in force.",
    ],
  },
  {
    title: "Use of Company’s Trade Marks and Logos",
    body: [
      "The Company from time to time shall authorize and permit the Channel Partner to use all or any of the Company’s trademarks, names, designs logos etc., (hereinafter referred to as IP) and for such permitted use the Channel Partner shall obtain a written approval from the Company, and such use shall be solely for and limited to the purpose of marketing the Company’s products subject to the specifications provided by the Company from time to time. Company may require any of its IP whether registered or otherwise, to be rectified by the Channel Partner if they are not in accordance with the Company’s specifications.",
      "If the Channel Partner fails to remove or rectify such defective representations even after the Company notifying the Channel Partner of the same, the Company reserves its right to terminate this Agreement forthwith and without notice, and in such event any further use of the Company’s IP shall be construed as an infringement of the Company’s Intellectual Property Rights and the Company reserves the right to take appropriate action against the Channel Partner in accordance with law. Any unauthorized registration and/or use of a domain name bearing a prefix, suffix or variations, similar or deceptively similar to any of the Company’s IP registered or otherwise and/or proposed project/project names by the Channel Partner would tantamount to an infringement of the Company’s IP and in such event the Company reserves its right to take appropriate action against the Channel Partner in accordance with law. A Channel Partner seeking to register a domain name bearing an IP of the Company may seek prior authorization of the Company and the latter shall at its sole discretion permit such registration /use of domain names bearing IP of the Company /Project Name of the Company.",
    ],
  },
  {
    title: "Representations and Warranties",
    items: [
      {
        n: "10.1",
        text: "The Channel Partner represents that he/she/it is competent to enter into contract and is incompliance with all the applicable laws.",
      },
      {
        n: "10.2",
        text: "The Channel Partner shall at all times mention the RERA Registration Number of the project(s) being marketed by them in all the relevant marketing collaterals of whatsoever form and nature.",
      },
      {
        n: "10.3",
        text: "The Channel Partner represents that he/she/it shall at all times be compliant with the compliance requirements required of a real estate agent under the Real Estate (Regulation & Development) Act, 2016. The Channel Partner further acknowledges that he/she/it is aware of the duties and obligations envisaged by the Act and liabilities and consequences that shall follow in case of any non-compliance thereof.",
      },
      {
        n: "10.4",
        text: "The Channel Partner shall always display that all sales are subject to acceptance by the Company based on price and availability in their websites, collaterals and communications.",
      },
      {
        n: "10.5",
        text: "The Channel Partner represents that it shall not collect any amount in excess of the Sale Price, Construction Cost, taxes, deposits, duties and charges cost sheet provided by the Company from the Customer and shall promptly remit all such sums to the designated account of the Company in the manner directed by the Company in writing from time to time.",
      },
      {
        n: "10.6",
        text: "The Channel Partner further represents that it shall not pass or give any discounts or any part of its Professional Charges in any form, be it either cash or kind to the customers. It is expressly agreed between the Parties that this clause is strictly non-negotiable and any breach may result in immediate termination of this Agreement.",
      },
      {
        n: "10.7",
        text: "The Channel Partner agrees that the Developer shall review the Services provided, on a monthly basis, at their sole discretion.",
      },
    ],
  },
  {
    title: "Confidentiality",
    body: [
      "The Channel Partner understands that in the course of its/his/her Services, it may be privy to confidential information (whether or not the information is marked as such) in oral or written form including but not limited to personnel details, legal and business activities, client information, financial statements and technical documents. The Channel Partner is obliged to not to disclose such confidential information to any third party including any employee except on a need-to-know basis. This obligation of the Channel Partner shall continue to apply for a period of 1 (one) year from the date of termination of this Agreement. This clause shall not apply to information that is in the public domain, any order/decree/judgement passed by a court/tribunal, and any information contained thereof.",
    ],
  },
  {
    title: "Indemnity and Liability",
    body: [
      "The Channel Partner agrees to indemnify and hold the Company, its officers, employees, and nominees safe and unharmed against any and all liabilities, losses, damages claims, demand, suit or any action of whatever kind and howsoever; which may be commenced or threatened against the Company or any of them in relation to services rendered through the Channel Partner, provided such actions arise in respect of the facts/details provided by the Channel Partner or if the same is in respect of the responsibilities attributable to the Channel Partner. These obligations shall survive the termination of this Agreement.",
    ],
  },
  {
    title: "Assignment",
    body: [
      "This Agreement shall be binding on, and shall inure to the benefit of, each of Channel Partner and Company and their respective successors, and permitted assigns provided always that neither Company nor the Channel Partner shall assign or transfer any or all of its rights or obligations under this Agreement without the prior written consent of the other party.",
    ],
  },
  {
    title: "Severability",
    body: [
      "The Parties agree that the covenants, obligations and restrictions in this Agreement are reasonable in all circumstances. If any provision of this Agreement is held to be illegal, invalid, or unenforceable under any present or future law, (i) such provision shall be fully severable; (ii) this Agreement shall be construed and enforced as if such illegal, invalid, or unenforceable provision had never comprised a part hereof; and (iii) the remaining provisions of this Agreement shall remain in full force and effect and shall not be affected by the illegal, invalid, or unenforceable provision or by its severance here from.",
    ],
  },
  {
    title: "Amendments",
    body: [
      "No modification or amendment to this Agreement and no waiver of any of the terms or conditions hereto shall be valid or binding unless made in writing and duly executed by the Parties.",
    ],
  },
  {
    title: "Dispute Resolution",
    body: [
      "In the event of a dispute or difference regarding the meaning or interpretation of the terms and conditions of this Agreement, the same shall be amicably settled between the Parties and in the event of the dispute and differences not being resolved or settled, the same shall be referred to Arbitration by a sole Arbitrator to be appointed by the Company. The Arbitration proceedings shall be conducted in accordance with the provisions of The Arbitration and Conciliation Act, 1996. Any award so passed by the Arbitrator shall be binding on both the Parties. The Venue of Arbitration shall be at Bangalore and the proceeding shall be in English language.",
    ],
  },
  {
    title: "Jurisdiction",
    body: [
      "This Agreement shall be governed by the laws of India and shall be subject to the exclusive jurisdiction of courts at Bangalore.",
      "IN WITNESS WHEREOF the parties have put their respective hands the day and year first hereinabove written.",
    ],
  },
];

/** Annexure A — Payment Matrix. */
export const ANNEXURE_A = {
  title: "Annexure A",
  subtitle: "(Payment Matrix)",
  columns: [
    "Nature of Activity",
    "Professional Charges",
    "Payable after confirmation by the Marketing Department subject to",
  ],
  rows: [
    [
      ["Sale of the Company’s Products."],
      [
        "2% of the Basic Sale Price of the Product as per Clause (6). Basic Sale Price shall include (i) Base Price; (ii) Premium Charges; (iii) Floor rise; (iv) Car Park & (v) TDS remittance to the Government.",
      ],
      [
        "Paid against execution of Agreement and receipt of 15% of the price and after confirmation by the CRM Department.",
        "In case of ready to move in projects, the professional charges shall be paid on receipt of 95% of the sale price and after confirmation by the marketing department.",
      ],
    ],
    [
      ["Renting / Leasing of any of Company’s Products."],
      [
        "15 days/30 days rent – on case to case basis as may be decided by Company at its sole discretion.",
      ],
      [
        "Professional Charges shall be paid only after execution of the Agreement to Lease between Company and the Tenant/Lessee and receipt of entire refundable deposit and upon physical occupation of the premises by the Tenant/Lessee.",
      ],
    ],
  ],
};

/** Company details from the back cover. */
export const COMPANY = {
  name: "My Home Property Developers Private Limited",
  formerly: "(Formerly Divija Property Developers Private Limited)",
  address:
    "H No 1-123, 8th Floor, 3rd Block, My Home Hub, Hitech City, Madhapur, Hyderabad - 500 081.",
  phone: "+91 99895 55777",
};
