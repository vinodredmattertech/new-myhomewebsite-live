import { serveSection } from "@/lib/sitemap";

/**
 * /pdf-sitemap.xml — the downloadable documents (brochures, ESG policies and
 * reports, investor filings, press archives). Linked from /sitemap_index.xml.
 *
 * These <loc>s point at the Strapi host, which is where the files are actually
 * served from. Google only trusts a sitemap for URLs outside its own host once
 * both hosts are verified in Search Console.
 */
export async function getServerSideProps({ req, res }) {
  return serveSection(req, res, "pdf");
}

export default function PdfSitemap() {
  return null;
}
