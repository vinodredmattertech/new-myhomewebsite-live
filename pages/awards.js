import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import PageBanner from "@/components/myhome/PageBanner";
import FeaturedRecognition from "@/components/myhome/awards/FeaturedRecognition";
import { mediaUrl, getAwardsListing } from "@/lib/strapi";

export default function AwardsPage({ page }) {
  const banner = page?.banner;
  return (
    <>
      <Seo seo={page?.seo} />
      <PageBanner
        sectionId="awards-banner"
        heading={banner?.heading || "A Legacy Recognised"}
        breadcrumbLabel={banner?.breadcrumbLabel || "Awards & Recognition"}
        imageAlt={
          banner?.imageAlt ||
          "A My Home Group trophy spotlit on a pedestal at an industry awards ceremony"
        }
        desktopSrc={
          mediaUrl(banner?.desktopImage) ||
          "/assets/myhome/about/banner-cityscape.jpg"
        }
        mobileSrc={
          mediaUrl(banner?.mobileImage) ||
          mediaUrl(banner?.desktopImage) ||
          "/assets/myhome/about/banner-cityscape.jpg"
        }
      />
      <FeaturedRecognition section={page?.featuredRecognition} />
    </>
  );
}

AwardsPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const { page } = await getAwardsListing();
  return {
    props: {
      page: page ?? null,
    },
  };
}
