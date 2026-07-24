import qs from "qs";

/**
 * Strapi client used by the home page (SSR).
 *
 * Strapi v4 returns relations as { data: [{ id, attributes: { ... } }] }
 * and media as { data: { attributes: { url } } }. Helpers below normalise
 * both shapes for consumers.
 */

export const STRAPI_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:1337";

/** Resolve a Strapi media field to an absolute URL, or `null` if absent. */
export function mediaUrl(media) {
  if (!media) return null;
  if (media.data?.attributes?.url) return absolute(media.data.attributes.url);
  if (media.attributes?.url) return absolute(media.attributes.url);
  if (typeof media.url === "string") return absolute(media.url);
  return null;
}

/** Flatten a v4 oneToMany relation into [{ id, ...attributes }, ...]. */
export function relationList(rel) {
  if (!rel) return [];
  if (Array.isArray(rel)) return rel; // already-flat (componentized)
  const arr = Array.isArray(rel.data) ? rel.data : [];
  return arr.map((row) => ({ id: row.id, ...(row.attributes || {}) }));
}

function absolute(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Fetch the singleType home-page with explicit populate (every section,
 * nested media, SEO, and the project + vertical relations).
 *
 * Returns `null` on any failure so callers can render-skip sections
 * without breaking the page.
 */
export async function getHomeData() {
  const query = {
    populate: [
      "seo",
      "seo.metaImage",
      "seo.metaSocial",
      "seo.metaSocial.image",
      "seo.schema",
      "seo.BodySchema",

      "hero",
      "hero.desktopImage",
      "hero.mobileImage",
      "hero.desktopVideo",
      "hero.mobileVideo",

      "whoWeAre",
      "whoWeAre.sketchImage",
      "whoWeAre.colorImage",

      "whyMyHome",
      "whyMyHome.slides",
      "whyMyHome.slides.image",

      "statistics",
      "statistics.cityImage",
      "statistics.stats",

      "worldsWeShape",
      "worldsWeShape.verticals",
      "worldsWeShape.verticals.image",

      "featuredProjects",
      "featuredProjects.sideSketchImage",
      "featuredProjects.projects",
      "featuredProjects.projects.image",
      "featuredProjects.projects.sketchImage",

      "lifestyle",
      "lifestyle.pillars",
      "lifestyle.pillars.image",
      "lifestyle.visionImage",

      "communityLiving",
      "communityLiving.image",
      "communityLiving.secondaryImage",
      "communityLiving.highlights",
      "communityLiving.highlights.icon",

      "testimonials",
      "testimonials.items",
      "testimonials.items.image",
      "testimonials.items.videoFile",
      "testimonials.blockbusterItems",
      "testimonials.blockbusterItems.image",
      "testimonials.blockbusterItems.videoFile",
    ],
  };

  const queryString = qs.stringify(query, { encodeValuesOnly: true });

  try {
    const res = await fetch(
      `${STRAPI_URL}/api/home-page?${queryString}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      console.warn(`[strapi] home-page fetch failed: ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json?.data?.attributes ?? null;
  } catch (err) {
    console.warn("[strapi] home-page fetch error:", err.message);
    return null;
  }
}

/**
 * Fetch the singleType about-page with explicit populate (every section +
 * nested media + repeatable journey/value items + SEO).
 */
export async function getAboutData() {
  const query = {
    populate: [
      "seo",
      "seo.metaImage",
      "seo.metaSocial",
      "seo.metaSocial.image",
      "seo.schema",
      "seo.BodySchema",

      "banner",
      "banner.desktopImage",
      "banner.mobileImage",

      "legacy",
      "legacy.image",

      "visionMission",
      "visionMission.backgroundImage",

      "leadership",
      "leadership.portraitImage",
      "leadership.LeaderImg",

      "journey",
      "journey.items",
      "journey.items.image",

      "values",
      "values.items",
      "values.items.image",
    ],
  };

  const queryString = qs.stringify(query, { encodeValuesOnly: true });

  try {
    const res = await fetch(
      `${STRAPI_URL}/api/about-page?${queryString}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      console.warn(`[strapi] about-page fetch failed: ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json?.data?.attributes ?? null;
  } catch (err) {
    console.warn("[strapi] about-page fetch error:", err.message);
    return null;
  }
}

/**
 * Fetch the sitewide header singleType. Returns its attributes object or
 * `null` on failure so the Header component can fall back to defaults.
 */
export async function getHeaderData() {
  const query = qs.stringify(
    { populate: ["logo", "navItems"] },
    { encodeValuesOnly: true }
  );
  try {
    const res = await fetch(`${STRAPI_URL}/api/header?${query}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.attributes ?? null;
  } catch (err) {
    console.warn("[strapi] header fetch error:", err.message);
    return null;
  }
}

/** Fetch the sitewide footer singleType (logo, address rows, links, etc.). */
export async function getFooterData() {
  const query = qs.stringify(
    { populate: ["logo", "contactRows", "quickLinks", "socials"] },
    { encodeValuesOnly: true }
  );
  try {
    const res = await fetch(`${STRAPI_URL}/api/footer?${query}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.attributes ?? null;
  } catch (err) {
    console.warn("[strapi] footer fetch error:", err.message);
    return null;
  }
}

/**
 * POST a website form submission to Strapi's Lead collection.
 *
 * Accepts the same payload shape every form already builds — `formSource`,
 * `name`, `phone`, `email`, `project`, `message`, etc. Anything extra is
 * passed through. Server stamps `submittedAt` + `status` itself.
 *
 * Returns true on success, false on failure. Never throws — callers can
 * fire-and-forget alongside their existing CRM POST.
 */
export async function submitLead(payload = {}) {
  // Normalise field names. Forms historically used `FormSource` (Pascal),
  // `project_name`, etc. — map them onto the Strapi schema.
  const data = {
    name: payload.name || "",
    email: payload.email || "",
    phone: payload.phone || "",
    countryCode: payload.countryCode || "",
    project: payload.project || payload.project_name || "",
    message: payload.message || "",
    formSource: payload.formSource || payload.FormSource || "Website",
    consent: !!payload.consent,
    pageUrl:
      payload.pageUrl ||
      (typeof window !== "undefined" ? window.location.href : ""),
  };

  try {
    const res = await fetch(`${STRAPI_URL}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    if (!res.ok) {
      console.warn(`[strapi] lead submit failed: ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[strapi] lead submit error:", err.message);
    return false;
  }
}

/** Fetch the singleType nri-page with full populate. */
export async function getNriData() {
  const query = {
    populate: [
      "seo",
      "seo.metaImage",
      "seo.metaSocial",
      "seo.metaSocial.image",
      "seo.schema",
      "seo.BodySchema",

      "banner",
      "banner.desktopImage",
      "banner.mobileImage",

      "whyHyderabad",
      "whyHyderabad.cards",
      "whyHyderabad.cards.image",

      "mindset",
      "mindset.image",

      "trustedName",
      "trustedName.image",
      "trustedName.features",

      "featuredProjects",
      "featuredProjects.projects",
      "featuredProjects.projects.image",

      "faqs",
      "faqs.items",
    ],
  };
  const queryString = qs.stringify(query, { encodeValuesOnly: true });
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/nri-page?${queryString}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      console.warn(`[strapi] nri-page fetch failed: ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json?.data?.attributes ?? null;
  } catch (err) {
    console.warn("[strapi] nri-page fetch error:", err.message);
    return null;
  }
}

/**
 * Fetch the projects-page singleType (banner + SEO + heading) along with
 * the full list of Projects for the listing grid.
 *
 * Returns `{ page, projects }`. Either can be `null`/`[]` on failure.
 */
export async function getProjectsListing() {
  const pageQuery = qs.stringify(
    {
      populate: [
        "seo",
        "seo.metaImage",
        "seo.metaSocial",
        "seo.metaSocial.image",
        "banner",
        "banner.desktopImage",
        "banner.mobileImage",
        // Projects-listing-only banner slider. Optional: when no slides are
        // published the component falls back to the single `banner` above.
        "bannerSlides",
        "bannerSlides.desktopImage",
        "bannerSlides.mobileImage",
      ],
    },
    { encodeValuesOnly: true }
  );

  const listQuery = qs.stringify(
    {
      populate: ["image"],
      pagination: { pageSize: 100, page: 1 },
      sort: ["order:asc", "title:asc"],
    },
    { encodeValuesOnly: true }
  );

  try {
    const [pageRes, listRes] = await Promise.all([
      fetch(`${STRAPI_URL}/api/projects-page?${pageQuery}`, { cache: "no-store" }),
      fetch(`${STRAPI_URL}/api/projects?${listQuery}`, { cache: "no-store" }),
    ]);
    const pageJson = pageRes.ok ? await pageRes.json() : null;
    const listJson = listRes.ok ? await listRes.json() : null;
    return {
      page: pageJson?.data?.attributes ?? null,
      projects: relationList({ data: listJson?.data ?? [] }),
    };
  } catch (err) {
    console.warn("[strapi] projects listing fetch error:", err.message);
    return { page: null, projects: [] };
  }
}

/**
 * Fetch a single Project entry by slug — used by /projects/[slug].
 * Returns the flattened attributes object or `null` if the project
 * doesn't exist (so the page can fall through to a 404).
 */
export async function getProjectBySlug(slug) {
  if (!slug) return null;
  const query = qs.stringify(
    {
      filters: { slug: { $eq: slug } },
      populate: [
        "image",
        "seo",
        "seo.metaImage",
        "seo.metaSocial",
        "seo.metaSocial.image",

        "detailBanner",
        "detailBanner.desktopImage",
        "detailBanner.mobileImage",
        "detailBanner.logo",

        "overview",
        "overview.image",
        "overview.stats",

        "amenities",
        "amenities.items",
        "amenities.items.image",

        "floorPlans",
        "floorPlans.tabs",
        "floorPlans.tabs.plans",
        "floorPlans.tabs.plans.image",

        "gallery",
        "gallery.tabs",
        "gallery.tabs.items",
        "gallery.tabs.videos",
        "gallery.tabs.videos.thumbnail",
        "gallery.tabs.videos.videoFile",

        "specifications",
        "specifications.items",
        "specifications.items.image",

        "progress",
        "progress.metrics",
        "progress.images",

        "connectivity",
        "connectivity.mapImage",
        "connectivity.categories",

        "brochure",
        "brochure.image",
        "brochure.brochureFile",

        "testimonials",
        "testimonials.items",

        "inquiry",
        "inquiry.qrImage",
      ],
      pagination: { pageSize: 1, page: 1 },
    },
    { encodeValuesOnly: true }
  );

  try {
    const res = await fetch(`${STRAPI_URL}/api/projects?${query}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[strapi] project fetch failed: ${res.status}`);
      return null;
    }
    const json = await res.json();
    const row = (json?.data || [])[0];
    if (!row) return null;
    return { id: row.id, ...(row.attributes || {}) };
  } catch (err) {
    console.warn("[strapi] project fetch error:", err.message);
    return null;
  }
}

/**
 * Fetch the singleType awards-page with full populate.
 *
 * Everything lives inline on the page: SEO, the hero banner and the
 * "Featured Recognition" section (label + heading + the repeatable award
 * cards). The page picks the featured card for the large main card and renders
 * the rest in the slider. Returns `{ page }`; `page` falls back to `null` on
 * failure so the page render-skips gracefully.
 */
export async function getAwardsListing() {
  const query = qs.stringify(
    {
      populate: [
        "seo",
        "seo.metaImage",
        "seo.metaSocial",
        "seo.metaSocial.image",
        "seo.schema",
        "seo.BodySchema",

        "banner",
        "banner.desktopImage",
        "banner.mobileImage",

        "featuredRecognition",
        "featuredRecognition.backgroundImage",
        "featuredRecognition.cards",
        "featuredRecognition.cards.image",
      ],
    },
    { encodeValuesOnly: true }
  );

  try {
    const res = await fetch(`${STRAPI_URL}/api/awards-page?${query}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[strapi] awards-page fetch failed: ${res.status}`);
      return { page: null };
    }
    const json = await res.json();
    return { page: json?.data?.attributes ?? null };
  } catch (err) {
    console.warn("[strapi] awards-page fetch error:", err.message);
    return { page: null };
  }
}

/**
 * Fetch the singleType loyalty-page with full populate — banner, the
 * privileges section (intro image + filterable gallery), and the enrolment
 * form (backdrop + managed fields). Returns the page attributes or `null`.
 */
export async function getLoyaltyData() {
  const query = qs.stringify(
    {
      populate: [
        "seo",
        "seo.metaImage",
        "seo.metaSocial",
        "seo.metaSocial.image",
        "seo.schema",
        "seo.BodySchema",

        "banner",
        "banner.desktopImage",
        "banner.mobileImage",

        "privileges",
        "privileges.image",
        "privileges.filters",
        "privileges.filters.icon",
        "privileges.items",
        "privileges.items.image",
      ],
    },
    { encodeValuesOnly: true }
  );

  try {
    const res = await fetch(`${STRAPI_URL}/api/loyalty-page?${query}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[strapi] loyalty-page fetch failed: ${res.status}`);
      return { page: null };
    }
    const json = await res.json();
    return { page: json?.data?.attributes ?? null };
  } catch (err) {
    console.warn("[strapi] loyalty-page fetch error:", err.message);
    return { page: null };
  }
}

/**
 * Fetch the singleType buyers-guide-page ("The Path to Ownership") with full
 * populate — banner, the 'Discover' intro split, the 'Evaluate' review cards
 * (each with a watermark icon) and the 'Need More Clarity?' FAQ accordion.
 * Returns the page attributes or `null`.
 */
export async function getBuyersGuideData() {
  const query = qs.stringify(
    {
      populate: [
        "seo",
        "seo.metaImage",
        "seo.metaSocial",
        "seo.metaSocial.image",
        "seo.schema",
        "seo.BodySchema",

        "banner",
        "banner.desktopImage",
        "banner.mobileImage",

        "discover",
        "discover.image",
        "discover.sketchImage",

        "evaluate",
        "evaluate.cards",
        "evaluate.cards.icon",

        "faqs",
        "faqs.items",
      ],
    },
    { encodeValuesOnly: true }
  );

  try {
    const res = await fetch(`${STRAPI_URL}/api/buyers-guide-page?${query}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[strapi] buyers-guide-page fetch failed: ${res.status}`);
      return { page: null };
    }
    const json = await res.json();
    return { page: json?.data?.attributes ?? null };
  } catch (err) {
    console.warn("[strapi] buyers-guide-page fetch error:", err.message);
    return { page: null };
  }
}

/**
 * Fetch the singleType channel-partner-page with full populate — banner, the
 * 'Why Partner With Us' intro ('A Partnership Built for Growth'), the
 * 'Partner Advantages' carousel ('Everything You Need to Move Forward') and
 * the labels for the reused enrolment form. Returns the page attributes or
 * `null` so the page can render-skip sections without breaking.
 */
export async function getChannelPartnerData() {
  const query = qs.stringify(
    {
      populate: [
        "seo",
        "seo.metaImage",
        "seo.metaSocial",
        "seo.metaSocial.image",
        "seo.schema",
        "seo.BodySchema",

        "banner",
        "banner.desktopImage",
        "banner.mobileImage",

        "whyPartner",
        "whyPartner.image",

        "advantages",
        "advantages.slides",
        "advantages.slides.image",

        "form",
      ],
    },
    { encodeValuesOnly: true }
  );

  try {
    const res = await fetch(`${STRAPI_URL}/api/channel-partner-page?${query}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[strapi] channel-partner-page fetch failed: ${res.status}`);
      return { page: null };
    }
    const json = await res.json();
    return { page: json?.data?.attributes ?? null };
  } catch (err) {
    console.warn("[strapi] channel-partner-page fetch error:", err.message);
    return { page: null };
  }
}

/**
 * Persist a Loyalty Programme enrolment submission. Every form field is sent
 * as its own column so the full application is captured in Strapi. Never
 * throws — returns true on success, false otherwise.
 */
export async function submitLoyaltyApplication(payload = {}) {
  const data = {
    name: payload.name || "",
    email: payload.email || "",
    mobile: payload.mobile || payload.phone || "",
    city: payload.city || "",
    project: payload.project || "",
    apartmentUnit: payload.apartmentUnit || payload.apartment || "",
    customerBookingId: payload.customerBookingId || payload.customerId || "",
    message: payload.message || "",
    formSource: payload.formSource || "Loyalty Programme Page",
    pageUrl:
      payload.pageUrl ||
      (typeof window !== "undefined" ? window.location.href : ""),
  };

  try {
    const res = await fetch(`${STRAPI_URL}/api/loyalty-applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    if (!res.ok) {
      console.warn(`[strapi] loyalty application submit failed: ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[strapi] loyalty application submit error:", err.message);
    return false;
  }
}

/** Fetch the singleType contact-page with full populate. */
export async function getContactData() {
  const query = {
    populate: [
      "seo",
      "seo.metaImage",
      "seo.metaSocial",
      "seo.metaSocial.image",
      "seo.schema",
      "seo.BodySchema",

      "banner",
      "banner.desktopImage",
      "banner.mobileImage",

      "experts",
      "experts.channels",

      "form",
      "form.image",
      "form.backgroundImage",
    ],
  };
  const queryString = qs.stringify(query, { encodeValuesOnly: true });
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/contact-page?${queryString}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      console.warn(`[strapi] contact-page fetch failed: ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json?.data?.attributes ?? null;
  } catch (err) {
    console.warn("[strapi] contact-page fetch error:", err.message);
    return null;
  }
}

/**
 * Fetch the blog-page singleType (banner + SEO + headings) along with the
 * full list of published Blogs for the listing/filters.
 *
 * Returns `{ page, blogs }`. Either can be `null`/`[]` on failure.
 */
export async function getBlogListing() {
  const pageQuery = qs.stringify(
    {
      populate: [
        "seo",
        "seo.metaImage",
        "seo.metaSocial",
        "seo.metaSocial.image",
        "banner",
        "banner.desktopImage",
        "banner.mobileImage",
      ],
    },
    { encodeValuesOnly: true }
  );

  const listQuery = qs.stringify(
    {
      populate: ["coverImage"],
      pagination: { pageSize: 100, page: 1 },
      // Featured first, then newest, then explicit order.
      sort: ["featured:desc", "publishedDate:desc", "order:asc", "title:asc"],
    },
    { encodeValuesOnly: true }
  );

  try {
    const [pageRes, listRes] = await Promise.all([
      fetch(`${STRAPI_URL}/api/blog-page?${pageQuery}`, { cache: "no-store" }),
      fetch(`${STRAPI_URL}/api/blogs?${listQuery}`, { cache: "no-store" }),
    ]);
    const pageJson = pageRes.ok ? await pageRes.json() : null;
    const listJson = listRes.ok ? await listRes.json() : null;
    return {
      page: pageJson?.data?.attributes ?? null,
      blogs: relationList({ data: listJson?.data ?? [] }),
    };
  } catch (err) {
    console.warn("[strapi] blog listing fetch error:", err.message);
    return { page: null, blogs: [] };
  }
}

/**
 * Fetch a single Blog entry by slug — used by /blogs/[slug].
 *
 * Returns `{ blog, related }` where `related` is a short list of other
 * published blogs (for the "Other Articles" rail). `blog` is `null` when the
 * slug doesn't exist so the page can fall through to a 404.
 */
export async function getBlogBySlug(slug) {
  if (!slug) return { blog: null, related: [] };

  const detailQuery = qs.stringify(
    {
      filters: { slug: { $eq: slug } },
      populate: [
        "coverImage",
        "authorImage",
        "seo",
        "seo.metaImage",
        "seo.metaSocial",
        "seo.metaSocial.image",
      ],
      pagination: { pageSize: 1, page: 1 },
    },
    { encodeValuesOnly: true }
  );

  const relatedQuery = qs.stringify(
    {
      filters: { slug: { $ne: slug } },
      populate: ["coverImage"],
      pagination: { pageSize: 4, page: 1 },
      sort: ["publishedDate:desc", "order:asc"],
    },
    { encodeValuesOnly: true }
  );

  try {
    const [detailRes, relatedRes] = await Promise.all([
      fetch(`${STRAPI_URL}/api/blogs?${detailQuery}`, { cache: "no-store" }),
      fetch(`${STRAPI_URL}/api/blogs?${relatedQuery}`, { cache: "no-store" }),
    ]);
    const detailJson = detailRes.ok ? await detailRes.json() : null;
    const relatedJson = relatedRes.ok ? await relatedRes.json() : null;

    const row = (detailJson?.data || [])[0];
    const blog = row ? { id: row.id, ...(row.attributes || {}) } : null;

    return {
      blog,
      related: relationList({ data: relatedJson?.data ?? [] }),
    };
  } catch (err) {
    console.warn("[strapi] blog fetch error:", err.message);
    return { blog: null, related: [] };
  }
}

/**
 * Fetch the news-page singleType (banner + SEO + headings) along with the
 * full list of published News Articles for the listing/filter tabs.
 *
 * Returns `{ page, news }`. Either can be `null`/`[]` on failure.
 */
export async function getNewsListing() {
  const pageQuery = qs.stringify(
    {
      populate: [
        "seo",
        "seo.metaImage",
        "seo.metaSocial",
        "seo.metaSocial.image",
        "banner",
        "banner.desktopImage",
        "banner.mobileImage",
        "backgroundImage",
      ],
    },
    { encodeValuesOnly: true }
  );

  const listQuery = qs.stringify(
    {
      populate: ["coverImage", "publicationLogo", "authorImage"],
      pagination: { pageSize: 100, page: 1 },
      // Featured first, then newest, then explicit order.
      sort: ["featured:desc", "publishedDate:desc", "order:asc", "title:asc"],
    },
    { encodeValuesOnly: true }
  );

  try {
    const [pageRes, listRes] = await Promise.all([
      fetch(`${STRAPI_URL}/api/news-page?${pageQuery}`, { cache: "no-store" }),
      fetch(`${STRAPI_URL}/api/news-articles?${listQuery}`, { cache: "no-store" }),
    ]);
    const pageJson = pageRes.ok ? await pageRes.json() : null;
    const listJson = listRes.ok ? await listRes.json() : null;
    return {
      page: pageJson?.data?.attributes ?? null,
      news: relationList({ data: listJson?.data ?? [] }),
    };
  } catch (err) {
    console.warn("[strapi] news listing fetch error:", err.message);
    return { page: null, news: [] };
  }
}

/**
 * Fetch a single News Article by slug — used by /news/[slug].
 *
 * Returns `{ news, related }` where `related` is a short list of other
 * published articles (for the "More Coverage" rail). `news` is `null` when the
 * slug doesn't exist so the page can fall through to a 404.
 */
export async function getNewsBySlug(slug) {
  if (!slug) return { news: null, related: [] };

  const detailQuery = qs.stringify(
    {
      filters: { slug: { $eq: slug } },
      populate: [
        "coverImage",
        "publicationLogo",
        "authorImage",
        "seo",
        "seo.metaImage",
        "seo.metaSocial",
        "seo.metaSocial.image",
      ],
      pagination: { pageSize: 1, page: 1 },
    },
    { encodeValuesOnly: true }
  );

  const relatedQuery = qs.stringify(
    {
      filters: { slug: { $ne: slug } },
      populate: ["coverImage", "publicationLogo"],
      pagination: { pageSize: 4, page: 1 },
      sort: ["publishedDate:desc", "order:asc"],
    },
    { encodeValuesOnly: true }
  );

  try {
    const [detailRes, relatedRes] = await Promise.all([
      fetch(`${STRAPI_URL}/api/news-articles?${detailQuery}`, { cache: "no-store" }),
      fetch(`${STRAPI_URL}/api/news-articles?${relatedQuery}`, { cache: "no-store" }),
    ]);
    const detailJson = detailRes.ok ? await detailRes.json() : null;
    const relatedJson = relatedRes.ok ? await relatedRes.json() : null;

    const row = (detailJson?.data || [])[0];
    const news = row ? { id: row.id, ...(row.attributes || {}) } : null;

    return {
      news,
      related: relationList({ data: relatedJson?.data ?? [] }),
    };
  } catch (err) {
    console.warn("[strapi] news fetch error:", err.message);
    return { news: null, related: [] };
  }
}

/** Fetch the singleType testimonials-page with full populate. */
export async function getTestimonialsData() {
  const query = {
    populate: [
      "seo",
      "seo.metaImage",
      "seo.metaSocial",
      "seo.metaSocial.image",
      "seo.schema",
      "seo.BodySchema",

      "banner",
      "banner.desktopImage",
      "banner.mobileImage",

      "items",
      "items.image",
      "items.videoFile",
    ],
  };
  const queryString = qs.stringify(query, { encodeValuesOnly: true });
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/testimonials-page?${queryString}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      console.warn(`[strapi] testimonials-page fetch failed: ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json?.data?.attributes ?? null;
  } catch (err) {
    console.warn("[strapi] testimonials-page fetch error:", err.message);
    return null;
  }
}

/**
 * Fetch the singleType events-page with full populate (hero banner + the
 * "Experiences That Bring People Together" slider with per-event photos).
 *
 * Returns its attributes object or `null` on failure so the page can
 * render-skip sections without breaking.
 */
export async function getEventsData() {
  const query = {
    populate: [
      "seo",
      "seo.metaImage",
      "seo.metaSocial",
      "seo.metaSocial.image",
      "seo.schema",
      "seo.BodySchema",

      "banner",
      "banner.desktopImage",
      "banner.mobileImage",

      "experiences",
      "experiences.backgroundImage",
      "experiences.items",
      "experiences.items.image",

      "imageSection",
      "imageSection.filters",
      "imageSection.featured",
      "imageSection.featured.image",
      "imageSection.featured.tags",
      "imageSection.cards",
      "imageSection.cards.image",
    ],
  };
  const queryString = qs.stringify(query, { encodeValuesOnly: true });
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/events-page?${queryString}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      console.warn(`[strapi] events-page fetch failed: ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json?.data?.attributes ?? null;
  } catch (err) {
    console.warn("[strapi] events-page fetch error:", err.message);
    return null;
  }
}

/**
 * Fetch the csr-page singleType with full populate. All three sections —
 * banner, the "Building Beyond Homes" overview and the "Impact That Reaches
 * Beyond Homes" initiatives section (filter tabs + cards) — live inline on the
 * page as components, so a single fetch returns everything.
 *
 * Returns the page attributes object or `null` on failure so the page can
 * render-skip sections without breaking.
 */
export async function getCsrListing() {
  const query = qs.stringify(
    {
      populate: [
        "seo",
        "seo.metaImage",
        "seo.metaSocial",
        "seo.metaSocial.image",
        "seo.schema",
        "seo.BodySchema",

        "banner",
        "banner.desktopImage",
        "banner.mobileImage",

        "overviewImage",

        "initiatives",
        "initiatives.filters",
        "initiatives.filters.icon",
        "initiatives.cards",
        "initiatives.cards.image",
        "initiatives.cards.impactStats",
      ],
    },
    { encodeValuesOnly: true }
  );

  try {
    const res = await fetch(`${STRAPI_URL}/api/csr-page?${query}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[strapi] csr-page fetch failed: ${res.status}`);
      return { page: null };
    }
    const json = await res.json();
    return { page: json?.data?.attributes ?? null };
  } catch (err) {
    console.warn("[strapi] csr-page fetch error:", err.message);
    return { page: null };
  }
}

/**
 * Fetch the singleType sustainability-page with full populate — banner, the
 * "Green Building Pioneers" overview, the dark vision band (+ stats), the ESG
 * objective section (+ pillar icons), the green-excellence roadmap and the
 * "Precision Green Metrics" CTA (+ metric icons). Every image/icon is managed
 * in Strapi; the page renders whatever the backend serves.
 */
export async function getSustainabilityData() {
  const query = qs.stringify(
    {
      populate: [
        "seo",
        "seo.metaImage",
        "seo.metaSocial",
        "seo.metaSocial.image",
        "seo.schema",
        "seo.BodySchema",

        "banner",
        "banner.desktopImage",
        "banner.mobileImage",

        "overviewImage",

        "vision",
        "vision.image",
        "vision.stats",

        "esg",
        "esg.image",
        "esg.items",
        "esg.items.icon",

        "journey",
        "journey.image",
        "journey.items",

        "metrics",
        "metrics.backgroundImage",
        "metrics.metrics",
        "metrics.metrics.icon",
      ],
    },
    { encodeValuesOnly: true }
  );

  try {
    const res = await fetch(`${STRAPI_URL}/api/sustainability-page?${query}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[strapi] sustainability-page fetch failed: ${res.status}`);
      return { page: null };
    }
    const json = await res.json();
    return { page: json?.data?.attributes ?? null };
  } catch (err) {
    console.warn("[strapi] sustainability-page fetch error:", err.message);
    return { page: null };
  }
}

/**
 * Fetch the singleType career-page with full populate — SEO, hero banner, the
 * "Why My Home" band, the "More Than a Workplace" gallery (filter tabs + photo
 * cards), the "Vacant Positions" list and the "Stay Connected on LinkedIn"
 * update. Every image is managed in Strapi; the page renders whatever the
 * backend serves (with built-in fallbacks).
 */
export async function getCareerData() {
  const query = qs.stringify(
    {
      populate: [
        "seo",
        "seo.metaImage",
        "seo.metaSocial",
        "seo.metaSocial.image",
        "seo.schema",
        "seo.BodySchema",

        "banner",
        "banner.desktopImage",
        "banner.mobileImage",

        "why",
        "why.image",

        "workplace",
        "workplace.featuredImage",
        "workplace.filters",
        "workplace.cards",
        "workplace.cards.image",

        "positions",
        "positions.jobs",

        "linkedin",
        "linkedin.images",
        "linkedin.posts",
        "linkedin.posts.images",
      ],
    },
    { encodeValuesOnly: true }
  );

  try {
    const res = await fetch(`${STRAPI_URL}/api/career-page?${query}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[strapi] career-page fetch failed: ${res.status}`);
      return { page: null };
    }
    const json = await res.json();
    return { page: json?.data?.attributes ?? null };
  } catch (err) {
    console.warn("[strapi] career-page fetch error:", err.message);
    return { page: null };
  }
}

/**
 * Fetch the News page wrapper plus the Media Gallery tiles — used by /news.
 *
 * Mirrors `getNewsListing` (same singleType, same populate) but pulls the
 * `media-galleries` collection instead of `news-articles`. Every media field a
 * tile might use is populated up-front; which ones are actually filled depends
 * on the tile's category.
 *
 * Returns `{ page, items }`, both safely empty on failure so the page renders
 * without the section rather than erroring.
 */
export async function getMediaGalleryListing() {
  const pageQuery = qs.stringify(
    {
      populate: [
        "seo",
        "seo.metaImage",
        "seo.metaSocial",
        "seo.metaSocial.image",
        "banner",
        "banner.desktopImage",
        "banner.mobileImage",
        "backgroundImage",
      ],
    },
    { encodeValuesOnly: true }
  );

  const listQuery = qs.stringify(
    {
      populate: ["image", "publicationLogo", "pdfFile", "mp4Video"],
      pagination: { pageSize: 200, page: 1 },
      // Newest coverage first, with `order` as the manual tie-breaker.
      sort: ["publishedDate:desc", "order:asc", "title:asc"],
    },
    { encodeValuesOnly: true }
  );

  try {
    const [pageRes, listRes] = await Promise.all([
      fetch(`${STRAPI_URL}/api/news-page?${pageQuery}`, { cache: "no-store" }),
      fetch(`${STRAPI_URL}/api/media-galleries?${listQuery}`, {
        cache: "no-store",
      }),
    ]);
    const pageJson = pageRes.ok ? await pageRes.json() : null;
    const listJson = listRes.ok ? await listRes.json() : null;
    return {
      page: pageJson?.data?.attributes ?? null,
      items: relationList({ data: listJson?.data ?? [] }),
    };
  } catch (err) {
    console.warn("[strapi] media gallery fetch error:", err.message);
    return { page: null, items: [] };
  }
}

/**
 * Legal single types (Privacy Policy, Terms & Conditions).
 *
 * Both share the same shape — SEO, hero banner and one rich-text `content`
 * field that the page renders as HTML — so one fetcher serves both, keyed by
 * the Strapi endpoint slug.
 */
async function getLegalPage(endpoint) {
  const query = qs.stringify(
    {
      populate: [
        "seo",
        "seo.metaImage",
        "seo.metaSocial",
        "seo.metaSocial.image",
        "seo.schema",
        "seo.BodySchema",

        "banner",
        "banner.desktopImage",
        "banner.mobileImage",
      ],
    },
    { encodeValuesOnly: true }
  );

  try {
    const res = await fetch(`${STRAPI_URL}/api/${endpoint}?${query}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[strapi] ${endpoint} fetch failed: ${res.status}`);
      return { page: null };
    }
    const json = await res.json();
    return { page: json?.data?.attributes ?? null };
  } catch (err) {
    console.warn(`[strapi] ${endpoint} fetch error:`, err.message);
    return { page: null };
  }
}

export function getPrivacyPolicyPage() {
  return getLegalPage("privacy-policy-page");
}

export function getTermsConditionsPage() {
  return getLegalPage("terms-conditions-page");
}
