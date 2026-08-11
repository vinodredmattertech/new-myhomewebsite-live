import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import PageBanner from "@/components/myhome/PageBanner";
import InvestorDocuments from "@/components/myhome/investor/InvestorDocuments";
import { getInvestorData, mediaUrl } from "@/lib/strapi";

export default function InvestorsPage({ page }) {
  const banner = page?.banner;
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
        heading={banner?.heading}
        breadcrumbLabel={banner?.breadcrumbLabel}
        gradientClass="bg-gradient-to-b from-black/10 via-black/10 to-black/80"
      />
      <InvestorDocuments sections={page?.sections} />
    </>
  );
}

InvestorsPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const { page } = await getInvestorData();
  return { props: { page: page ?? null } };
}
