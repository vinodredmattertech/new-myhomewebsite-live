import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import LegalBanner from "@/components/myhome/legal/LegalBanner";
import SitemapDirectory from "@/components/myhome/sitemap/SitemapDirectory";
import { getHtmlSitemapGroups, siteOrigin } from "@/lib/sitemap";

/**
 * /sitemap — the HTML sitemap.
 *
 * The readable companion to /sitemap.xml: same inventory of pages, laid out
 * for a visitor rather than a crawler. Both are built from lib/sitemap.js, so
 * publishing a project adds it here and to the XML in the same request.
 */
export default function SitemapPage({ groups, canonicalURL }) {
  return (
    <>
      <Seo
        seo={{
          metaTitle: "Sitemap | My Home Group",
          metaDescription:
            "Browse every page on the My Home Group website — projects, sustainability, careers, news, blogs and more.",
          canonicalURL,
        }}
      />
      <LegalBanner fallbackHeading="Sitemap" fallbackCrumb="Sitemap" />
      <SitemapDirectory groups={groups} />
    </>
  );
}

SitemapPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps({ req }) {
  return {
    props: {
      groups: await getHtmlSitemapGroups(),
      canonicalURL: `${siteOrigin(req)}/sitemap`,
    },
  };
}
