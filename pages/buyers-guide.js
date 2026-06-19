import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import PageBanner from "@/components/myhome/PageBanner";
import BuyersDiscover from "@/components/myhome/buyers-guide/BuyersDiscover";
import BuyersEvaluate from "@/components/myhome/buyers-guide/BuyersEvaluate";
import NriFaqs from "@/components/myhome/nri/NriFaqs";
import { getBuyersGuideData, mediaUrl } from "@/lib/strapi";

export default function BuyersGuidePage({ page }) {
  const banner = page?.banner;
  return (
    <>
      <Seo seo={page?.seo} />
      <PageBanner
        sectionId="buyers-guide-banner"
        desktopSrc={mediaUrl(banner?.desktopImage)}
        mobileSrc={mediaUrl(banner?.mobileImage) || mediaUrl(banner?.desktopImage)}
        imageAlt={banner?.imageAlt}
        heading={banner?.heading}
        breadcrumbLabel={banner?.breadcrumbLabel}
        gradientClass="bg-gradient-to-b from-black/10 via-black/10 to-black/80"
      />
      <BuyersDiscover data={page?.discover} />
      <BuyersEvaluate data={page?.evaluate} />
      {/* FAQ accordion is identical in shape to the NRI FAQs section, so we
          reuse that component (label + heading + question/answer items). */}
      <NriFaqs data={page?.faqs} />
    </>
  );
}

BuyersGuidePage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const { page } = await getBuyersGuideData();
  return { props: { page: page ?? null } };
}
