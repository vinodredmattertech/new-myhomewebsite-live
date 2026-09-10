import { serveIndex } from "@/lib/sitemap";

/**
 * /sitemap.xml — the sitemap index, and the URL robots.txt advertises.
 *
 * It links the three sitemaps rather than listing every URL inline, so a
 * crawler that has already seen the pages can re-fetch only the one whose
 * <lastmod> moved.
 */
export async function getServerSideProps({ req, res }) {
  return serveIndex(req, res);
}

// The response is written directly in getServerSideProps, so nothing renders.
export default function SitemapIndex() {
  return null;
}
