import qs from "qs";
import { cachedFetch } from "./cache";

/**
 * Strapi client used by the home page (SSR).
 *
 * Strapi v4 returns relations as { data: [{ id, attributes: { ... } }] }
 * and media as { data: { attributes: { url } } }. Helpers below normalise
 * both shapes for consumers.
 */

export const STRAPI_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3132";

/**
 * Resolve a Strapi media field to an absolute URL, or `null` if absent.
 *
 * A `?v=<updatedAt>` stamp is appended so that "Replace media" in Strapi —
 * which keeps the filename, and therefore the URL, identical — still busts
 * the browser cache. Without it an edited image keeps showing the old file.
 */
export function mediaUrl(media) {
  if (!media) return null;
  const node =
    media.data?.attributes ||
    media.attributes ||
    (typeof media.url === "string" ? media : null);
  if (!node?.url) return null;
  return absolute(node.url, node.updatedAt);
}

/**
 * Resolve a Strapi media field to its download metadata, or `null` if absent.
 *
 * `mediaUrl` gives back only the URL, which is all an <img> needs. Document
 * downloads also want to show what they are before you click — so this returns
 * the extension and a human-readable size alongside the URL. Strapi reports
 * `size` in KB as a float.
 */
export function fileMeta(media) {
  if (!media) return null;
  const node =
    media.data?.attributes ||
    media.attributes ||
    (typeof media.url === "string" ? media : null);
  if (!node?.url) return null;

  const ext = String(node.ext || "").replace(/^\./, "").toUpperCase();
  const kb = typeof node.size === "number" ? node.size : null;
  const sizeLabel =
    kb == null ? null : kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;

  return {
    url: absolute(node.url, node.updatedAt),
    name: node.name || "",
    ext: ext || null,
    sizeLabel,
  };
}

/** Flatten a v4 oneToMany relation into [{ id, ...attributes }, ...]. */
export function relationList(rel) {
  if (!rel) return [];
  if (Array.isArray(rel)) return rel; // already-flat (componentized)
  const arr = Array.isArray(rel.data) ? rel.data : [];
  return arr.map((row) => ({ id: row.id, ...(row.attributes || {}) }));
}

function absolute(url, updatedAt) {
  if (!url) return null;
  const base = /^https?:\/\//i.test(url)
    ? url
    : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  const stamp = updatedAt ? Date.parse(updatedAt) : NaN;
  if (Number.isNaN(stamp)) return base;
  return `${base}${base.includes("?") ? "&" : "?"}v=${stamp}`;
}

/**
 * Fetch every published entry of the `verticals` collection, image included
 * and sorted by the `number` field. Returns the raw v4 `{ data: [...] }`
 * envelope (what `relationList` expects) or `null` on failure.
 */
export async function getVerticals() {
  const query = qs.stringify(
    {
      populate: ["image"],
      sort: ["number:asc"],
      pagination: { pageSize: 100 },
    },
    { encodeValuesOnly: true }
  );

  try {
    const res = await cachedFetch("verticals", `${STRAPI_URL}/api/verticals?${query}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[strapi] verticals fetch failed: ${res.status}`);
      return null;
    }
    const json = await res.json();
    return Array.isArray(json?.data) && json.data.length ? json : null;
  } catch (err) {
    console.warn("[strapi] verticals fetch error:", err.message);
    return null;
  }
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
      "lifestyle.visionImageMobile",

      "communityLiving",
      "communityLiving.image",
      "communityLiving.secondaryImage",
      "communityLiving.highlights",
      "communityLiving.highlights.image",

      "testimonials",
      "testimonials.items",
      "testimonials.items.image",
      "testimonials.items.videoFile",
      "testimonials.blockbusterItems",
      "testimonials.blockbusterItems.image",
      "testimonials.blockbusterItems.videoFile",

      // Copy only — the posts themselves come from the Instagram Graph API
      // client-side via /api/instagram, so there is no media to populate.
      "socialStories",
    ],
  };

  const queryString = qs.stringify(query, { encodeValuesOnly: true });

  try {
    const [res, verticals] = await Promise.all([
      cachedFetch("home-page", `${STRAPI_URL}/api/home-page?${queryString}`, { cache: "no-store" }),
      getVerticals(),
    ]);
    if (!res.ok) {
      console.warn(`[strapi] home-page fetch failed: ${res.status}`);
      return null;
    }
    const json = await res.json();
    const attrs = json?.data?.attributes ?? null;
    // Prefer the full collection over `worldsWeShape.verticals`. That relation
    // has to be re-linked by hand on the Home Page entry for every new
    // vertical, so a freshly created one silently never reaches the section.
    // Falls back to the populated relation if the collection call fails.
    if (attrs?.worldsWeShape && verticals) {
      attrs.worldsWeShape.verticals = verticals;
    }
    return attrs;
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

      "videoSection",
      "videoSection.videoFile",
      "videoSection.poster",

      "values",
      "values.items",
      "values.items.image",
    ],
  };

  const queryString = qs.stringify(query, { encodeValuesOnly: true });

  try {
    const res = await cachedFetch(
      "about-page",
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
    const res = await cachedFetch("header", `${STRAPI_URL}/api/header?${query}`, {
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
    const res = await cachedFetch("footer", `${STRAPI_URL}/api/footer?${query}`, {
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

/**
 * POST a Career page application to Strapi's Job Application collection.
 *
 * The resume is sent on the same request as `multipart/form-data`
 * (`data` = JSON string, `files.resume` = the file) — the shape Strapi's core
 * create understands — so no separate media upload call, and no public upload
 * permission, is needed. `designation` carries the position the candidate
 * applied for ("General Application" from the open form above the footer).
 *
 * Returns true on success, false on failure. Never throws.
 */
export async function submitJobApplication(payload = {}, file = null) {
  const data = {
    name: payload.name || "",
    email: payload.email || "",
    phone: payload.phone || "",
    countryCode: payload.countryCode || "",
    designation: payload.designation || "",
    message: payload.message || "",
    formSource: payload.formSource || "Career Page",
    pageUrl:
      payload.pageUrl ||
      (typeof window !== "undefined" ? window.location.href : ""),
  };

  try {
    const form = new FormData();
    form.append("data", JSON.stringify(data));
    if (file) form.append("files.resume", file, file.name);

    // No Content-Type header — the browser sets the multipart boundary.
    const res = await fetch(`${STRAPI_URL}/api/job-applications`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      console.warn(`[strapi] job application submit failed: ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[strapi] job application submit error:", err.message);
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
    const res = await cachedFetch(
      "nri-page",
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
      cachedFetch("projects-page", `${STRAPI_URL}/api/projects-page?${pageQuery}`, { cache: "no-store" }),
      cachedFetch("projects", `${STRAPI_URL}/api/projects?${listQuery}`, { cache: "no-store" }),
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
 * Fetch a single Project entry by slug — used by the root /[slug] route.
 * Returns the flattened attributes object or `null` if the project
 * doesn't exist (so the page can fall through to a 404).
 */
/**
 * Fetch one project by slug.
 *
 * With `preview` on, it asks Strapi for the draft as well as the published
 * version and authenticates with the preview API token. Both parts are needed:
 * the server refuses `publicationState=preview` to anonymous callers, which is
 * what keeps unpublished work off the public API.
 *
 * STRAPI_PREVIEW_TOKEN is deliberately not a NEXT_PUBLIC_ variable. It is read
 * here on the server during getServerSideProps and never reaches the browser.
 */
export async function getProjectBySlug(slug, { preview = false } = {}) {
  if (!slug) return null;

  const token = process.env.STRAPI_PREVIEW_TOKEN;
  if (preview && !token) {
    console.warn("[strapi] preview requested but STRAPI_PREVIEW_TOKEN is unset — serving published only");
  }
  const usePreview = Boolean(preview && token);

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

        "clubhouse",
        "clubhouse.image",

        "amenitiesIcons",
        "amenitiesIcons.items",
        "amenitiesIcons.items.icon",

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
        "progress.images.image",
        "progress.entries",
        "progress.entries.images",

        "connectivity",
        "connectivity.mapImage",
        "connectivity.categories",

        "brochure",
        "brochure.image",
        "brochure.brochureFile",
        "brochure.secondaryFile",

        "testimonials",
        "testimonials.items",

        "beforeAfter",
        "beforeAfter.beforeImage",
        "beforeAfter.afterImage",

        "inquiry",
        "inquiry.qrImage",
      ],
      pagination: { pageSize: 1, page: 1 },
        ...(usePreview ? { publicationState: "preview" } : {}),
    },
    { encodeValuesOnly: true }
  );

  try {
    // Drafts must never land in the shared cache, so preview goes straight to
    // Strapi.
    const res = usePreview
      ? await fetch(`${STRAPI_URL}/api/projects?${query}`, {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        })
      : await cachedFetch(`project:${slug}`, `${STRAPI_URL}/api/projects?${query}`, {
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
    const res = await cachedFetch("awards-page", `${STRAPI_URL}/api/awards-page?${query}`, {
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
    const res = await cachedFetch("loyalty-page", `${STRAPI_URL}/api/loyalty-page?${query}`, {
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
    const res = await cachedFetch("buyers-guide-page", `${STRAPI_URL}/api/buyers-guide-page?${query}`, {
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
    const res = await cachedFetch("channel-partner-page", `${STRAPI_URL}/api/channel-partner-page?${query}`, {
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

/**
 * Submit one of the public website forms to its Strapi collection, documents
 * included.
 *
 * `endpoint` is the collection's plural API id (e.g. "vana-booking-applications"),
 * `data` the flat record (field names match the collection schema) and `files`
 * maps a media field to a File. Everything goes in one multipart POST — `data`
 * as a JSON string and each document as `files.<field>` — which Strapi's core
 * create understands, so the upload plugin stays closed to the public role.
 *
 * Returns true on success, false on failure. Never throws.
 */
export async function submitPublicForm(endpoint, data = {}, files = {}) {
  const payload = {
    ...data,
    pageUrl:
      data.pageUrl ||
      (typeof window !== "undefined" ? window.location.href : ""),
  };

  try {
    const form = new FormData();
    form.append("data", JSON.stringify(payload));
    for (const [field, file] of Object.entries(files)) {
      if (file) form.append(`files.${field}`, file, file.name);
    }

    // No Content-Type header — the browser sets the multipart boundary.
    const res = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      console.warn(`[strapi] ${endpoint} submit failed: ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[strapi] ${endpoint} submit error:`, err.message);
    return false;
  }
}

/** Persist a Channel Partner Agreement registration, KYC documents included. */
export function submitChannelPartnerApplication(data = {}, files = {}) {
  return submitPublicForm(
    "channel-partner-applications",
    { ...data, formSource: data.formSource || "Channel Partner Agreement Page" },
    files
  );
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
    const res = await cachedFetch(
      "contact-page",
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
      cachedFetch("blog-page", `${STRAPI_URL}/api/blog-page?${pageQuery}`, { cache: "no-store" }),
      cachedFetch("blogs", `${STRAPI_URL}/api/blogs?${listQuery}`, { cache: "no-store" }),
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
      cachedFetch(`blog:${slug}`, `${STRAPI_URL}/api/blogs?${detailQuery}`, { cache: "no-store" }),
      cachedFetch(`blog:${slug}:related`, `${STRAPI_URL}/api/blogs?${relatedQuery}`, { cache: "no-store" }),
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
      cachedFetch("news-page", `${STRAPI_URL}/api/news-page?${pageQuery}`, { cache: "no-store" }),
      cachedFetch("news-articles", `${STRAPI_URL}/api/news-articles?${listQuery}`, { cache: "no-store" }),
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
      cachedFetch(`news:${slug}`, `${STRAPI_URL}/api/news-articles?${detailQuery}`, { cache: "no-store" }),
      cachedFetch(`news:${slug}:related`, `${STRAPI_URL}/api/news-articles?${relatedQuery}`, { cache: "no-store" }),
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
    const res = await cachedFetch(
      "testimonials-page",
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
    const res = await cachedFetch(
      "events-page",
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
    const res = await cachedFetch("csr-page", `${STRAPI_URL}/api/csr-page?${query}`, {
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

        "strategy",
        "strategy.pillars",
        "strategy.pillars.icon",
        "strategy.pillars.points",

        "policies",
        "policies.items",
        // The policy PDFs themselves — without this the cards render with no
        // download link.
        "policies.items.file",

        "reports",
        "reports.items",
        "reports.items.coverImage",
        // The report PDFs themselves — without this the cards render with no
        // download link.
        "reports.items.file",

        "awards",
        "awards.tabs",
        "awards.tabs.items",
        "awards.tabs.items.image",
      ],
    },
    { encodeValuesOnly: true }
  );

  try {
    const res = await cachedFetch("sustainability-page", `${STRAPI_URL}/api/sustainability-page?${query}`, {
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
 * Fetch one ESG pillar detail page (/sustainability/environment | social |
 * governance) by slug, together with the Ongoing projects that close the page.
 *
 * The pillar body — commitment statement, focus areas, key initiatives and the
 * impact figures — lives on the `sustainability-pillar` collection. The project
 * cards are *not* duplicated there: they come live from the Projects collection
 * so the band never drifts from the Projects listing. Returns
 * `{ pillar: null }` when the slug isn't published; the page falls back to its
 * built-in copy rather than 404-ing, matching the rest of the site.
 */
export async function getSustainabilityPillar(slug) {
  if (!slug) return { pillar: null, projects: [] };

  const pillarQuery = qs.stringify(
    {
      filters: { slug: { $eq: slug } },
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

        "commitment",
        "commitment.image",

        "focus",
        "focus.items",
        "focus.items.icon",

        "initiatives",
        "initiatives.items",
        "initiatives.items.image",

        "highlights",
        "highlights.backgroundImage",
        "highlights.stats",

        "ongoingProjects",
      ],
      pagination: { pageSize: 1, page: 1 },
    },
    { encodeValuesOnly: true }
  );

  const projectsQuery = qs.stringify(
    {
      populate: ["image"],
      pagination: { pageSize: 100, page: 1 },
      sort: ["order:asc", "title:asc"],
    },
    { encodeValuesOnly: true }
  );

  try {
    const [pillarRes, projectsRes] = await Promise.all([
      cachedFetch(`sustainability-pillar:${slug}`, `${STRAPI_URL}/api/sustainability-pillars?${pillarQuery}`, {
        cache: "no-store",
      }),
      cachedFetch("projects", `${STRAPI_URL}/api/projects?${projectsQuery}`, {
        cache: "no-store",
      }),
    ]);

    const pillarJson = pillarRes.ok ? await pillarRes.json() : null;
    const projectsJson = projectsRes.ok ? await projectsRes.json() : null;

    return {
      pillar: pillarJson?.data?.[0]?.attributes ?? null,
      projects: relationList({ data: projectsJson?.data ?? [] }),
    };
  } catch (err) {
    console.warn("[strapi] sustainability-pillar fetch error:", err.message);
    return { pillar: null, projects: [] };
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

        "applicationForm",
        "applicationForm.image",
      ],
    },
    { encodeValuesOnly: true }
  );

  try {
    const res = await cachedFetch("career-page", `${STRAPI_URL}/api/career-page?${query}`, {
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
      cachedFetch("news-page", `${STRAPI_URL}/api/news-page?${pageQuery}`, { cache: "no-store" }),
      cachedFetch("media-galleries", `${STRAPI_URL}/api/media-galleries?${listQuery}`, {
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
 * Fetch the singleType investor-page with full populate — SEO, hero banner and
 * the repeatable document blocks (Annual Return, financial statements, …) with
 * each row's attached PDF.
 *
 * `sections.documents.file` matters: without it every row comes back with no
 * document, and since the page only renders rows that actually have one, the
 * whole page would silently disappear.
 */
export async function getInvestorData() {
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

        "sections",
        "sections.documents",
        "sections.documents.file",
      ],
    },
    { encodeValuesOnly: true }
  );

  try {
    const res = await cachedFetch("investor-page", `${STRAPI_URL}/api/investor-page?${query}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[strapi] investor-page fetch failed: ${res.status}`);
      return { page: null };
    }
    const json = await res.json();
    return { page: json?.data?.attributes ?? null };
  } catch (err) {
    console.warn("[strapi] investor-page fetch error:", err.message);
    return { page: null };
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
    const res = await cachedFetch(endpoint, `${STRAPI_URL}/api/${endpoint}?${query}`, {
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

/* ── Channel partner survey links ─────────────────────────────────────── */

/**
 * Channel partners whose Company / Firm Name matches `name`, as
 * `[{ uniqueId, companyName }]`. Returns null when the lookup itself fails.
 */
export async function lookupChannelPartner(name) {
  try {
    const res = await fetch(`${STRAPI_URL}/api/cp-lookup?${qs.stringify({ name })}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || [];
  } catch (err) {
    return null;
  }
}

/**
 * The partner behind a survey link's `uid`, as `{ uniqueId, companyName }`;
 * `false` when no partner has that ID, null when the check itself fails.
 */
export async function verifyChannelPartner(uid) {
  try {
    const res = await fetch(`${STRAPI_URL}/api/cp-lookup/${encodeURIComponent(uid)}`);
    if (res.status === 404) return false;
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || false;
  } catch (err) {
    return null;
  }
}

/**
 * Whether a market survey has already been submitted with this mobile number:
 * `{ exists, response? }`, where `response` is a masked summary of the saved
 * survey. Null when the check itself fails.
 */
export async function checkSurveyPhone(phone) {
  try {
    const res = await fetch(`${STRAPI_URL}/api/survey-phone-check?${qs.stringify({ phone })}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}
