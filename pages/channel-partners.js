import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import PageBanner from "@/components/myhome/PageBanner";
import WhyPartner from "@/components/myhome/channel-partner/WhyPartner";
import PartnerAdvantages from "@/components/myhome/channel-partner/PartnerAdvantages";
import LoyaltyForm from "@/components/myhome/loyalty/LoyaltyForm";
import { getChannelPartnerData, mediaUrl } from "@/lib/strapi";

export default function ChannelPartnerPage({ page }) {
  const banner = page?.banner;
  const form = page?.form;
  return (
    <>
      <Seo seo={page?.seo} />
      <PageBanner
        sectionId="channel-partner-banner"
        desktopSrc={mediaUrl(banner?.desktopImage)}
        mobileSrc={mediaUrl(banner?.mobileImage) || mediaUrl(banner?.desktopImage)}
        imageAlt={banner?.imageAlt}
        heading={banner?.heading}
        breadcrumbLabel={banner?.breadcrumbLabel}
        gradientClass="bg-gradient-to-b from-black/10 via-black/10 to-black/80"
      />
      <WhyPartner data={page?.whyPartner} />
      <PartnerAdvantages data={page?.advantages} />
      {/* Reuse the Loyalty enrolment form; only the heading/labels are driven
          from the CMS to match this page's design. Submissions are stored in
          Strapi (loyalty-application) just like the Loyalty page. */}
      <LoyaltyForm
        label={form?.label || "Become A Partner"}
        heading={form?.heading || "Partner With My Home"}
        submitText={form?.submitText || "Submit"}
      />
    </>
  );
}

ChannelPartnerPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const { page } = await getChannelPartnerData();
  return { props: { page: page ?? null } };
}
