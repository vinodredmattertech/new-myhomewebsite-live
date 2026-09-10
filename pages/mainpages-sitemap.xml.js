import { serveSection } from "@/lib/sitemap";

/** /sitemap_index.xml — every page on the site. Linked from /sitemap.xml. */
export async function getServerSideProps({ req, res }) {
  return serveSection(req, res, "main");
}

export default function Sitemap() {
  return null;
}
