import { serveSection } from "@/lib/sitemap";

/** /mainpages-sitemap.xml — every page on the site. Linked from /sitemap_index.xml. */
export async function getServerSideProps({ req, res }) {
  return serveSection(req, res, "main");
}

export default function MainPagesSitemap() {
  return null;
}
