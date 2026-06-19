import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import PageBanner from "@/components/myhome/PageBanner";
import LoyaltyPrivileges from "@/components/myhome/loyalty/LoyaltyPrivileges";
import LoyaltyForm from "@/components/myhome/loyalty/LoyaltyForm";
import { getLoyaltyData, mediaUrl } from "@/lib/strapi";

export default function LoyaltyProgrammePage({ page }) {
  const banner = page?.banner;
  return (
    <>
      <Seo seo={page?.seo} />
      <PageBanner
        sectionId="loyalty-banner"
        desktopSrc={mediaUrl(banner?.desktopImage)}
        mobileSrc={mediaUrl(banner?.mobileImage) || mediaUrl(banner?.desktopImage)}
        imageAlt={banner?.imageAlt}
        heading={banner?.heading}
        breadcrumbLabel={banner?.breadcrumbLabel}
        gradientClass="bg-gradient-to-b from-black/10 via-black/10 to-black/80"
      />
      <LoyaltyPrivileges data={page?.privileges} />
      {/* Form UI is fixed in the frontend; submissions are stored in Strapi. */}
      <LoyaltyForm />
    </>
  );
}

LoyaltyProgrammePage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const { page } = await getLoyaltyData();
  return { props: { page: page ?? null } };
}
