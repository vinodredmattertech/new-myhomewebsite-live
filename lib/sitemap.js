import qs from "qs";

import { STRAPI_URL } from "@/lib/strapi";
import { PILLAR_SLUGS } from "@/lib/sustainabilityPillars";

/**
 * XML sitemaps for the site, split into the three the brief asks for:
 *
 *   /sitemap_index.xml      the index, and what robots.txt points crawlers at
 *   /mainpages-sitemap.xml  every page on the site
 *   /blogs-sitemap.xml      the blog articles
 *   /pdf-sitemap.xml        the downloadable documents
 *
 * Everything is generated per request from Strapi rather than written to
 * /public — the project's routes are all SSR (`getServerSideProps`), so a
 * static file would go stale the moment an editor publishes a project.
 * Responses are cached at the CDN/proxy layer instead (see CACHE_CONTROL).
 */

/** Canonical production origin, used when nothing better is configured. */
const FALLBACK_SITE_URL = "https://www.myhomeconstructions.com";

/** Explicit override. Set this per environment to pin the advertised origin. */
const CONFIGURED_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? String(process.env.NEXT_PUBLIC_SITE_URL).replace(/\/+$/, "")
  : null;

/** Origin of the incoming request, honouring a reverse proxy's forwarded headers. */
function requestOrigin(req) {
  const first = (value) => String(value || "").split(",")[0].trim();
  const host = first(req?.headers?.["x-forwarded-host"] || req?.headers?.host);
  if (!host) return null;
  const proto =
    first(req?.headers?.["x-forwarded-proto"]) ||
    (req?.socket?.encrypted ? "https" : "http");
  return `${proto}://${host}`;
}

/**
 * Origin every site `<loc>` is built against. This is *not* the Strapi URL — it
 * has to be the canonical front-end address, which is what robots.txt points
 * crawlers at.
 *
 * Outside production the request's own origin wins, so a sitemap opened on
 * localhost lists localhost URLs you can actually click through.
 *
 * Production never looks at the request at all: the host header is
 * attacker-controllable and depends on how the proxy is configured, and a
 * canonical URL is not something to infer from it. So it is the configured
 * origin or the hardcoded production domain — which also means a deploy that
 * forgets to ship .env still advertises the right URLs. A staging box is the
 * one case that must set NEXT_PUBLIC_SITE_URL, or it will point at live.
 */
export function siteOrigin(req) {
  if (process.env.NODE_ENV !== "production") {
    return requestOrigin(req) || CONFIGURED_SITE_URL || FALLBACK_SITE_URL;
  }
  return CONFIGURED_SITE_URL || FALLBACK_SITE_URL;
}

/**
 * Sitemaps are cheap to regenerate but hit Strapi several times, and crawlers
 * fetch them far more often than editors publish. An hour of shared cache with
 * a day of stale-while-revalidate keeps the origin quiet without ever serving
 * content a crawler would notice as out of date.
 */
const CACHE_CONTROL = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";

/** Browser-facing stylesheet, so opening a sitemap renders a table not raw XML. */
const STYLESHEET = "/sitemap.xsl";

/**
 * Routes that exist as real files under /pages and should be indexed.
 *
 * Deliberately excluded: /404 (error page), /thank-you (post-submission
 * confirmation — indexing it puts a "thanks for enquiring" page in search
 * results), and everything under /api.
 */
const STATIC_PAGES = [
  "/",
  "/about-us",
  "/projects",
  "/awards",
  "/blogs",
  "/news",
  "/events",
  "/testimonials",
  "/csr",
  "/sustainability",
  "/investors",
  "/careers",
  "/channel-partners",
  "/loyalty-programme",
  "/buyers-guide",
  "/nri",
  "/contact-us",
  "/sitemap",
  "/privacy-policy",
  "/terms-conditions",
];

/* -------------------------------------------------------------------------- */
/* XML helpers                                                                */
/* -------------------------------------------------------------------------- */

/** Escape the five characters that are not legal as XML text. */
function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Resolve one entry to the escaped absolute URL its `<loc>` needs.
 *
 * Entries carry either a site-relative `path` (pages) or an already-absolute
 * `url` (PDFs, which are served by Strapi on its own host).
 */
function loc(origin, entry) {
  if (entry.url) return escapeXml(entry.url);
  const clean = `/${String(entry.path || "").replace(/^\/+/, "")}`;
  return escapeXml(clean === "/" ? `${origin}/` : `${origin}${clean}`);
}

/**
 * W3C datetime, which is what the sitemap spec asks for in `<lastmod>`.
 * Returns null for anything unparseable so the tag is simply left out —
 * an absent lastmod is fine, a malformed one invalidates the sitemap.
 */
function lastmodDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Most recent `lastmod` across a set of entries, or null when none carry one. */
function newestLastmod(entries) {
  const stamps = entries.map((e) => e.lastmod).filter(Boolean).sort();
  return stamps.length ? stamps[stamps.length - 1] : null;
}

/* -------------------------------------------------------------------------- */
/* Strapi                                                                     */
/* -------------------------------------------------------------------------- */

/** GET a Strapi endpoint, returning the parsed body or null on any failure. */
async function strapiGet(path) {
  try {
    const res = await fetch(`${STRAPI_URL}/api/${path}`, { cache: "no-store" });
    if (!res.ok) {
      console.warn(`[sitemap] ${path.split("?")[0]} fetch failed: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[sitemap] ${path.split("?")[0]} fetch error:`, err.message);
    return null;
  }
}

/**
 * Read every published entry of a collection as `{ slug, lastmod }`.
 *
 * Strapi caps `pageSize` at 100, so this walks the pages rather than asking
 * for one huge response — 34 projects fit today, but a sitemap that silently
 * truncates at entry 101 is exactly the kind of bug nobody notices for months.
 * `MAX_PAGES` guards against a runaway loop if `pageCount` ever misreports.
 */
async function fetchListing(endpoint, fields, sort) {
  const MAX_PAGES = 50;
  const rows = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const query = qs.stringify(
      { fields, pagination: { page, pageSize: 100 }, sort },
      { encodeValuesOnly: true }
    );

    const json = await strapiGet(`${endpoint}?${query}`);
    if (!json) break;

    for (const item of json?.data ?? []) {
      const attrs = item?.attributes ?? item;
      if (attrs?.slug) rows.push(attrs);
    }

    const pageCount = json?.meta?.pagination?.pageCount ?? 1;
    if (page >= pageCount) break;
  }

  return rows;
}

/** Collection entries as `{ slug, lastmod }`, newest first — what the XML wants. */
async function fetchSlugs(endpoint) {
  const rows = await fetchListing(endpoint, ["slug", "updatedAt"], ["updatedAt:desc"]);
  return rows.map((attrs) => ({
    slug: attrs.slug,
    lastmod: lastmodDate(attrs.updatedAt),
  }));
}

/** Collection entries as `{ label, href }`, A-Z — what the HTML page wants. */
async function fetchLinks(endpoint, hrefFor) {
  const rows = await fetchListing(endpoint, ["slug", "title"], ["title:asc"]);
  return rows.map((attrs) => ({
    label: attrs.title || attrs.slug,
    href: hrefFor(attrs.slug),
  }));
}

/* -------------------------------------------------------------------------- */
/* PDFs                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Where the site's documents are attached. Strapi's `/api/upload/files` — the
 * one endpoint that could list every upload directly — is closed to anonymous
 * requests, so the files are gathered from the content that references them.
 * Add a line here when a new content type starts carrying documents.
 */
const PDF_SOURCES = [
  { endpoint: "projects", populate: ["brochure.brochureFile", "brochure.secondaryFile"] },
  { endpoint: "sustainability-page", populate: ["policies.items.file", "reports.items.file"] },
  { endpoint: "investor-page", populate: ["sections.documents.file"] },
  { endpoint: "media-galleries", populate: ["pdfFile"] },
];

/**
 * Walk an arbitrary Strapi response and collect every PDF upload in it.
 *
 * The four sources above nest their files at four different depths, and those
 * shapes change whenever a component is restructured in the CMS. Recursing for
 * anything that looks like an uploaded PDF is resilient to that in a way that
 * four hand-written path readers would not be.
 */
function collectPdfs(node, found) {
  if (Array.isArray(node)) {
    for (const item of node) collectPdfs(item, found);
    return found;
  }
  if (!node || typeof node !== "object") return found;

  const isPdf =
    typeof node.url === "string" &&
    (node.mime === "application/pdf" || /\.pdf(\?|$)/i.test(node.url));

  if (isPdf) {
    // Strapi returns upload paths relative to its own host, and that host is
    // where the files are actually served from — so PDF <loc>s point at Strapi,
    // not at the front-end origin.
    const url = /^https?:\/\//i.test(node.url)
      ? node.url
      : `${STRAPI_URL}${node.url.startsWith("/") ? "" : "/"}${node.url}`;
    // Deduped by URL: the same document is often attached in several places.
    if (!found.has(url)) found.set(url, { url, lastmod: lastmodDate(node.updatedAt) });
  }

  for (const value of Object.values(node)) collectPdfs(value, found);
  return found;
}

/** Every PDF referenced anywhere in the CMS, newest first. */
async function fetchPdfs() {
  const found = new Map();

  const responses = await Promise.all(
    PDF_SOURCES.map(({ endpoint, populate }) => {
      const query = qs.stringify(
        { populate, pagination: { pageSize: 100 } },
        { encodeValuesOnly: true }
      );
      return strapiGet(`${endpoint}?${query}`);
    })
  );

  for (const json of responses) collectPdfs(json?.data, found);

  return [...found.values()].sort((a, b) =>
    String(b.lastmod || "").localeCompare(String(a.lastmod || ""))
  );
}

/* -------------------------------------------------------------------------- */
/* Sections                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The three sitemaps, in the order they appear in the index. `load` returns
 * `[{ path | url, lastmod }]`; a section that resolves to nothing is dropped
 * from the index rather than published empty, so a crawler is never pointed at
 * a sitemap with zero URLs.
 */
export const SECTIONS = {
  /** Every page on the site: static routes, project details, news, ESG pillars. */
  main: {
    path: "/mainpages-sitemap.xml",
    load: async () => {
      const [projects, news, pillars] = await Promise.all([
        fetchSlugs("projects"),
        fetchSlugs("news-articles"),
        fetchSlugs("sustainability-pillars"),
      ]);

      // The three ESG pillar pages render from built-in copy and are overridden
      // field-by-field once a `Sustainability Pillar` entry is published, so the
      // routes exist whether or not the CMS has rows. The built-in slugs are the
      // floor; anything extra published in Strapi is added on top.
      const pillarBySlug = new Map(PILLAR_SLUGS.map((slug) => [slug, null]));
      for (const { slug, lastmod } of pillars) pillarBySlug.set(slug, lastmod);

      return [
        // Static routes have no CMS timestamp to report, and inventing one (say,
        // "now") would tell crawlers the whole site changes on every fetch.
        ...STATIC_PAGES.map((path) => ({ path, lastmod: null })),
        ...projects.map(({ slug, lastmod }) => ({ path: `/${slug}`, lastmod })),
        ...news.map(({ slug, lastmod }) => ({ path: `/news/${slug}`, lastmod })),
        ...[...pillarBySlug].map(([slug, lastmod]) => ({
          path: `/sustainability/${slug}`,
          lastmod,
        })),
      ];
    },
  },

  blogs: {
    path: "/blogs-sitemap.xml",
    load: async () => {
      const rows = await fetchSlugs("blogs");
      return rows.map(({ slug, lastmod }) => ({ path: `/blogs/${slug}`, lastmod }));
    },
  },

  pdf: {
    path: "/pdf-sitemap.xml",
    load: fetchPdfs,
  },
};

/* -------------------------------------------------------------------------- */
/* Rendering                                                                  */
/* -------------------------------------------------------------------------- */

function renderUrlSet(origin, entries) {
  const urls = entries
    .map((entry) => {
      const modified = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : "";
      return `  <url>\n    <loc>${loc(origin, entry)}</loc>${modified}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${STYLESHEET}"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function renderIndex(origin, children) {
  const items = children
    .map((child) => {
      const modified = child.lastmod ? `\n    <lastmod>${child.lastmod}</lastmod>` : "";
      return `  <sitemap>\n    <loc>${loc(origin, child)}</loc>${modified}\n  </sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${STYLESHEET}"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>
`;
}

/** Write an XML body and end the response. Returns the `getServerSideProps` shape. */
function sendXml(res, xml) {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", CACHE_CONTROL);
  res.write(xml);
  res.end();
  return { props: {} };
}

/**
 * Serve one sitemap. Used by the route files under /pages, which exist as
 * separate files because the Pages Router can only make a whole path segment
 * dynamic — `/[section]-sitemap.xml` is not a routable pattern.
 */
export async function serveSection(req, res, key) {
  const section = SECTIONS[key];
  if (!section) return { notFound: true };

  const entries = await section.load();
  // Nothing published yet: still valid XML, just an empty <urlset>. A 404 here
  // would make the index — which links this — look broken to a crawler.
  return sendXml(res, renderUrlSet(siteOrigin(req), entries));
}

/** Serve the index that links every non-empty sitemap. */
export async function serveIndex(req, res) {
  const sections = await Promise.all(
    Object.entries(SECTIONS).map(async ([key, section]) => ({
      path: section.path,
      entries: await section.load(),
    }))
  );

  const children = sections
    .filter(({ entries }) => entries.length > 0)
    .map(({ path, entries }) => ({ path, lastmod: newestLastmod(entries) }));

  return sendXml(res, renderIndex(siteOrigin(req), children));
}

/* -------------------------------------------------------------------------- */
/* HTML sitemap                                                               */
/* -------------------------------------------------------------------------- */

/** Human-readable labels for the built-in ESG pillar routes. */
const PILLAR_LABELS = {
  environment: "Environment",
  social: "Social",
  governance: "Governance",
};

/**
 * The grouped link directory behind /sitemap — the page a visitor reads, as
 * opposed to the XML a crawler parses.
 *
 * It is built from the same Strapi listings as the XML sitemaps above so the
 * two can never drift: publish a project and it appears in both, or in neither.
 * The grouping is editorial rather than structural — it follows how the site
 * talks about itself in the header and footer, not how /pages is laid out.
 * Link labels are copied from the Header/Footer nav for the same reason: a
 * visitor should meet the same page name here that they saw in the menu.
 */
export async function getHtmlSitemapGroups() {
  const [projects, blogs, news] = await Promise.all([
    fetchLinks("projects", (slug) => `/${slug}`),
    fetchLinks("blogs", (slug) => `/blogs/${slug}`),
    fetchLinks("news-articles", (slug) => `/news/${slug}`),
  ]);

  const pillars = PILLAR_SLUGS.map((slug) => ({
    label: PILLAR_LABELS[slug] || slug,
    href: `/sustainability/${slug}`,
  }));

  // A group renders only if it has links, so an empty collection simply drops
  // its subsection instead of leaving a heading with nothing under it.
  const groups = [
    {
      title: "Who We Are",
      links: [
        { label: "Home", href: "/" },
        { label: "About Us", href: "/about-us" },
        { label: "Awards", href: "/awards" },
        { label: "Investors", href: "/investors" },
      ],
      subgroups: [
        {
          title: "Sustainability",
          links: [{ label: "Sustainability", href: "/sustainability" }, ...pillars],
        },
        {
          title: "Social Responsibility",
          links: [{ label: "CSR", href: "/csr" }],
        },
      ],
    },
    {
      title: "What We Build",
      links: [{ label: "Our Projects", href: "/projects" }],
      subgroups: [{ title: "Our Projects", links: projects }],
    },
    {
      title: "Media & Insights",
      links: [
        { label: "Events", href: "/events" },
        { label: "Testimonials", href: "/testimonials" },
      ],
      subgroups: [
        { title: "Blogs", links: [{ label: "Blogs", href: "/blogs" }, ...blogs] },
        { title: "News", links: [{ label: "News & Media", href: "/news" }, ...news] },
      ],
    },
    {
      title: "Connect With Us",
      links: [
        { label: "Contact Us", href: "/contact-us" },
        { label: "Careers", href: "/careers" },
        { label: "Channel Partner", href: "/channel-partners" },
        { label: "Loyalty Programme", href: "/loyalty-programme" },
        { label: "Buyers Guide", href: "/buyers-guide" },
        { label: "NRI", href: "/nri" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms & Conditions", href: "/terms-conditions" },
      ],
    },
  ];

  return groups
    .map((group) => ({
      ...group,
      links: group.links ?? [],
      subgroups: (group.subgroups ?? []).filter((sub) => sub.links.length > 0),
    }))
    .filter((group) => group.links.length > 0 || group.subgroups.length > 0);
}
