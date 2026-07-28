/**
 * Built-in copy for the three ESG pillar detail pages
 * (/sustainability/environment | social | governance).
 *
 * Every field here is a *fallback*. Once the matching `Sustainability Pillar`
 * entry is published in Strapi the CMS wins, field by field — so an editor can
 * override just the heading, or just one initiative, without having to re-enter
 * the whole page. This mirrors how CsrInitiatives and the rest of the site
 * behave: the section always renders, even before content is authored.
 *
 * The copy tracks My Home Group's published environment / social / governance
 * commitments; the photography points at existing site assets until real
 * imagery is uploaded into the media library.
 */

import { mediaUrl } from "@/lib/strapi";

/**
 * Resolve an image that may come from either source: a Strapi media object
 * (CMS-authored) or a plain string path into /public (the built-in fallbacks
 * below). `mediaUrl` only understands the former, so string paths would
 * otherwise silently drop out.
 */
export function pillarImage(cmsMedia, fallback) {
  const fromCms = mediaUrl(cmsMedia);
  if (fromCms) return fromCms;
  if (typeof cmsMedia === "string" && cmsMedia) return cmsMedia;
  return fallback || null;
}

/** Canonical pillar slugs, in the order they appear on the Sustainability page. */
export const PILLAR_SLUGS = ["environment", "social", "governance"];

/**
 * Resolve an ESG pillar row from the Sustainability page to its detail-page
 * href. Editors type titles like "Environment · Build, Don't Burden", so an
 * exact match is too brittle — we look for the pillar keyword anywhere in the
 * title. An explicit `ctaUrl` in Strapi always wins; when nothing matches we
 * return null and the button is simply not rendered.
 */
export function pillarHrefFromTitle(title, ctaUrl) {
  if (ctaUrl) return ctaUrl;
  const haystack = String(title || "").toLowerCase();
  const slug = PILLAR_SLUGS.find((s) => haystack.includes(s));
  return slug ? `/sustainability/${slug}` : null;
}

const PILLARS = {
  /* ------------------------------------------------------------------ */
  environment: {
    slug: "environment",
    title: "Environment",
    banner: {
      heading: "Build, don't burden",
      breadcrumbLabel: "Environment",
      imageAlt: "Native landscaping across a My Home Group development",
      desktopImage: "/assets/myhome/whymyhome-slide-1.jpg",
      mobileImage: "/assets/myhome/whymyhome-slide-1.jpg",
    },
    commitment: {
      label: "Environment Commitment",
      heading: "Care for the People. Care for the Planet.",
      description:
        "<p>We pledge to improve the lives of the people around us, and to protect and preserve the ecosystem we build in. Minimising our carbon footprint is not a campaign — it is how the work is planned, procured and delivered.</p><p>A <strong>Reduce, Reuse and Recycle</strong> principle runs from design through to handover, and we expect the suppliers and contractors who build alongside us to meet comparable environmental standards.</p>",
      quote:
        "Minimise the footprint at the source, rather than offset it after the fact.",
      image: "/assets/myhome/verticals-1.jpg",
      imageAlt: "Landscaped greens within a My Home Group community",
    },
    focus: {
      label: "Focus Areas",
      heading: "Four Areas We Measure",
      description:
        "Our environmental programme is organised around four measurable areas, each with its own targets, audits and reporting line.",
      items: [
        {
          title: "Waste",
          description:
            "Onsite treatment and segregation, with construction debris diverted from landfill and organic waste processed within the community.",
        },
        {
          title: "Water",
          description:
            "Wastewater treated and reused for landscaping and flushing, backed by rainwater harvesting and recharge across every site.",
        },
        {
          title: "Energy",
          description:
            "Efficient envelopes and equipment, renewable generation, and building energy management systems that keep performance honest after handover.",
        },
        {
          title: "Biodiversity",
          description:
            "Native planting, preserved habitat and a dedicated biodiversity park that protects species the city would otherwise lose.",
        },
      ],
    },
    initiatives: {
      label: "Key Initiatives",
      heading: "What This Looks Like On Site",
      description:
        "The commitments above translate into a defined set of practices applied across the portfolio.",
      items: [
        {
          title: "Green Buildings",
          description:
            "Every new development is designed to a minimum IGBC Gold or Platinum rating, with LEED, WELL and TRUE certifications pursued where they raise the standard further.",
          image: "/assets/myhome/whymyhome-1.jpg",
        },
        {
          title: "Design Optimisation",
          description:
            "Orientation, shading, glazing and envelope performance are settled at design stage — the cheapest energy is the energy the building never needs.",
          image: "/assets/myhome/verticals-2.jpg",
        },
        {
          title: "Operational Optimisation",
          description:
            "Building energy management systems monitor equipment continuously, supported by regular energy audits and occupant education programmes.",
          image: "/assets/myhome/nri/hyderabad-3.jpg",
        },
        {
          title: "Renewable Energy",
          description:
            "Solar PV projects across the portfolio, with 120 MW of renewable capacity operating across our commercial buildings.",
          image: "/assets/myhome/nri/hyderabad-1.jpg",
        },
        {
          title: "Water Conservation",
          description:
            "Wastewater treatment and reuse at every site, cutting freshwater draw for landscaping and non-potable demand.",
          image: "/assets/myhome/verticals-3.jpg",
        },
        {
          title: "Carbon Reduction",
          description:
            "Advanced concrete technologies and lower-clinker mixes reduce embodied carbon in the structure itself, not just in operations.",
          image: "/assets/myhome/whymyhome-slide-2.jpg",
        },
      ],
    },
    highlights: {
      label: "Impact In Numbers",
      heading: "Biodiversity Preserved",
      description:
        "Our 20-acre biodiversity park conserves species that are disappearing from the region — a living archive rather than a display garden.",
      backgroundImage: "/assets/myhome/whymyhome-slide-3.jpg",
      stats: [
        { value: "950", label: "Species preserved overall" },
        { value: "200+", label: "Native rice varieties" },
        { value: "400+", label: "Medicinal trees, shrubs and herbs" },
        { value: "120 MW", label: "Renewable capacity in operation" },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  social: {
    slug: "social",
    title: "Social",
    banner: {
      heading: "People first, always",
      breadcrumbLabel: "Social",
      imageAlt: "My Home Group team and site workforce together",
      desktopImage: "/assets/myhome/csr/featured.jpg",
      mobileImage: "/assets/myhome/csr/featured.jpg",
    },
    commitment: {
      label: "Social Commitment",
      heading: "A Workplace, And A Neighbourhood, Worth Belonging To",
      description:
        "<p>We are committed to nurturing a diverse and inclusive environment where every employee feels valued — through training, fair compensation and genuine room to grow.</p><p>That commitment does not stop at the site boundary. Community development, charitable work and employee volunteering extend the same care to the neighbourhoods our projects sit in, and to the workforce that builds them.</p>",
      quote:
        "Every employee valued, supported and empowered to grow — on site and off it.",
      image: "/assets/myhome/csr/card-1.jpg",
      imageAlt: "Community programme run by My Home Group",
    },
    focus: {
      label: "Focus Areas",
      heading: "Where We Direct Our Effort",
      description:
        "Our social programme concentrates on three areas where a construction business can make a real, measurable difference.",
      items: [
        {
          title: "Employee Well-being",
          description:
            "Safe sites, fair pay and full compliance with Building and Other Construction Workers (BOCW) guidelines — the floor, not the ceiling.",
        },
        {
          title: "Quality Of Life",
          description:
            "Housing, healthcare, childcare and recreation for the site workforce and their families, provided as standard rather than on request.",
        },
        {
          title: "Community Development",
          description:
            "Education, healthcare and civic infrastructure programmes delivered alongside local bodies in Telangana and Andhra Pradesh.",
        },
      ],
    },
    initiatives: {
      label: "Key Initiatives",
      heading: "Programmes Running Today",
      description:
        "A selection of the initiatives our teams and partners currently operate.",
      items: [
        {
          title: "AVEKSHA Child Daycare",
          description:
            "Our 8th AVEKSHA centre — the first aimed specifically at benefiting the children of construction workers — run in collaboration with COWE and SIDBI.",
          image: "/assets/myhome/csr/card-1.jpg",
        },
        {
          title: "Worker Health & Vaccination",
          description:
            "Vaccination drives and health screening across worker accommodations, backed by free medical camps and executive health check-ups.",
          image: "/assets/myhome/csr/card-3.jpg",
        },
        {
          title: "Knowledge Centre",
          description:
            "A 4,000 sq ft knowledge centre for workforce development — skills, safety and certification training available on site.",
          image: "/assets/myhome/csr/clone.webp",
        },
        {
          title: "Sports & Recreation",
          description:
            "Organised sports events for construction site workers, giving the workforce something to look forward to beyond the shift.",
          image: "/assets/myhome/csr/clon2.webp",
        },
        {
          title: "Netralaya Partnership",
          description:
            "Ongoing support for visually challenged students at the Netralaya institution, covering education and living costs.",
          image: "/assets/myhome/csr/card-2.jpg",
        },
        {
          title: "Palmakul Lake Restoration",
          description:
            "Restoration of Palmakul Lake as part of a 26-pond programme under GHMC — water bodies returned to the communities that depend on them.",
          image: "/assets/myhome/verticals-3.jpg",
        },
      ],
    },
    highlights: {
      label: "Impact In Numbers",
      heading: "Care That Reaches Beyond The Site",
      description:
        "Programmes run for our workforce, their families and the communities around every development.",
      backgroundImage: "/assets/myhome/csr/featured.jpg",
      stats: [
        { value: "8", label: "AVEKSHA daycare centres supported" },
        { value: "26", label: "Ponds restored under the GHMC programme" },
        { value: "4,000", label: "Sq ft workforce knowledge centre" },
        { value: "40+", label: "Years of community partnership" },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  governance: {
    slug: "governance",
    title: "Governance",
    banner: {
      heading: "Accountable by design",
      breadcrumbLabel: "Governance",
      imageAlt: "My Home Group leadership reviewing project governance",
      desktopImage: "/assets/myhome/nri/trusted-name.jpg",
      mobileImage: "/assets/myhome/nri/trusted-name.jpg",
    },
    commitment: {
      label: "Governance Commitment",
      heading: "Trust Is Earned In The Detail",
      description:
        "<p>We commit to reinforcing stakeholder trust through strong governance — ethics, efficient management and transparent reporting held to consistently across the group.</p><p>A diverse board, clear accountability lines and independent review keep those commitments measurable rather than aspirational. What we promise is what gets reported.</p>",
      quote:
        "Every commitment measured, reported and reviewed — by people empowered to challenge it.",
      image: "/assets/myhome/nri/hyderabad-4.jpg",
      imageAlt: "My Home Hub, the group's Hitech City headquarters",
    },
    focus: {
      label: "Focus Areas",
      heading: "How We Hold Ourselves To It",
      description:
        "Governance at My Home Group rests on two pillars — the conduct we expect of every individual, and the structures that oversee sustainability itself.",
      items: [
        {
          title: "Ethics & Integrity",
          description:
            "A published code of conduct, clear escalation routes and zero tolerance for compromise — applied to employees, contractors and suppliers alike.",
        },
        {
          title: "Sustainability Governance",
          description:
            "ESG targets owned at board level, with progress reviewed on a fixed cycle rather than reported only when convenient.",
        },
      ],
    },
    initiatives: {
      label: "Key Initiatives",
      heading: "The Structures Behind The Commitment",
      description:
        "Governance is only as good as the mechanisms enforcing it. These are ours.",
      items: [
        {
          title: "Safety Oversight",
          description:
            "An independent internal audit committee reviews construction practices on site, with the authority to halt work that falls short.",
          image: "/assets/myhome/whymyhome-2.jpg",
        },
        {
          title: "Board Review",
          description:
            "Regular performance evaluations with executives, covering delivery, safety and sustainability targets against what was committed.",
          image: "/assets/myhome/nri/trusted-name.jpg",
        },
        {
          title: "Vigilance",
          description:
            "Maintaining the highest standards of integrity, transparency and ethical conduct, with a confidential route for raising concerns.",
          image: "/assets/myhome/nri/hyderabad-2.jpg",
        },
        {
          title: "Transparent Reporting",
          description:
            "Policies, targets and outcomes published and kept current, so stakeholders can judge progress on the record rather than on assurance.",
          image: "/assets/myhome/verticals-2.jpg",
        },
      ],
    },
    highlights: {
      label: "Impact In Numbers",
      heading: "Four Decades On The Record",
      description:
        "Governance built over a long enough period to be tested — and audited — repeatedly.",
      backgroundImage: "/assets/myhome/nri/hyderabad-5.jpg",
      stats: [
        { value: "1981", label: "Building responsibly since" },
        { value: "37M+", label: "Sq ft delivered and accounted for" },
        { value: "100%", label: "Projects under independent safety audit" },
        { value: "2070", label: "Our stated sustainability horizon" },
      ],
    },
  },
};

/** Fallback copy for the closing 'Ongoing Projects' band — shared by all three
 *  pillars, since the cards themselves come from the Projects collection. */
export const DEFAULT_ONGOING_PROJECTS = {
  label: "Our Portfolio",
  heading: "Ongoing Projects",
  description:
    "The commitments on this page are being built into every development currently under construction.",
  ctaLabel: "View All Projects",
  ctaUrl: "/projects",
};

/** Look up the built-in copy for a pillar slug, or `null` if it isn't one of
 *  the three canonical pillars. */
export function getPillarFallback(slug) {
  return PILLARS[slug] || null;
}

export default PILLARS;
