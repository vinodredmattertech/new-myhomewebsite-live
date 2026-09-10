import { serveSection } from "@/lib/sitemap";

/** /blogs-sitemap.xml — the blog articles. Linked from /sitemap_index.xml. */
export async function getServerSideProps({ req, res }) {
  return serveSection(req, res, "blogs");
}

export default function BlogsSitemap() {
  return null;
}
