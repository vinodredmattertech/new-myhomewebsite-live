import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import PageBanner from "@/components/myhome/PageBanner";
import InvestorDocuments from "@/components/myhome/investor/InvestorDocuments";
import { getInvestorData, mediaUrl } from "@/lib/strapi";

export default function InvestorsPage({ page }) {
  const banner = page?.banner;
  const bannerHeading = String(banner?.heading || "").trim();
  const sectionHeading = String(
    (Array.isArray(page?.sections) ? page.sections : []).find((section) =>
      String(section?.heading || "").trim()
    )?.heading || ""
  ).trim();
  // The heading typed in the admin section is the page H1. The banner keeps
  // the same words on the image without adding a second H1.
  const sectionIsTitle = Boolean(sectionHeading);
  return (
    <>
      <Seo seo={page?.seo} />
      {/* Both sections self-hide when the backend has nothing for them: the
          banner needs an image or a heading, the document blocks need at least
          one row with an attached PDF. */}
      <PageBanner
        sectionId="investors-banner"
        desktopSrc={mediaUrl(banner?.desktopImage)}
        mobileSrc={mediaUrl(banner?.mobileImage) || mediaUrl(banner?.desktopImage)}
        imageAlt={banner?.imageAlt}
        heading={bannerHeading}
        headingAs={sectionIsTitle ? "p" : "h1"}
        breadcrumbLabel={banner?.breadcrumbLabel}
        gradientClass="bg-gradient-to-b from-black/10 via-black/10 to-black/80"
      />
      <InvestorDocuments
        sections={page?.sections}
        titleAs={sectionIsTitle ? "h1" : "h2"}
      />
    </>
  );
}

InvestorsPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const { page } = await getInvestorData();
  return { props: { page: page ?? null } };
}
