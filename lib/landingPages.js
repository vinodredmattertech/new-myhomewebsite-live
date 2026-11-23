/**
 * Registry of landing pages that feed the shared leads admin
 * (`/landing-page-admin`).
 *
 * Add a new entry when a new LP goes live. Leads are matched by
 * `formSource` prefix (preferred) and optionally by project name.
 */
export const LANDING_PAGES = [
  {
    id: "my-home-apas",
    label: "My Home Apas",
    path: "/my-home-apas-lp",
    formSourcePrefix: "My Home Apas LP",
    project: "My Home Apas",
  },
  {
    id: "my-home-raka",
    label: "My Home Raka",
    path: "/my-home-raka-lp",
    formSourcePrefix: "My Home Raka LP",
    project: "My Home Raka",
  },
];

export function getLandingPage(id) {
  return LANDING_PAGES.find((p) => p.id === id) || null;
}

export function matchLandingPage(lead = {}) {
  const source = String(lead.formSource || "");
  // Match by LP formSource prefix only — not project name — so main-site
  // project forms (Inquiry, Brochure, etc.) stay out of this admin.
  return LANDING_PAGES.find((p) => source.startsWith(p.formSourcePrefix)) || null;
}

export function isLandingPageLead(lead = {}) {
  return !!matchLandingPage(lead);
}
