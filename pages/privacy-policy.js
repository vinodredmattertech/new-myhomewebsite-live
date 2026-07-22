import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import LegalBanner from "@/components/myhome/legal/LegalBanner";
import LegalContent from "@/components/myhome/legal/LegalContent";
import { getPrivacyPolicyPage } from "@/lib/strapi";

export default function PrivacyPolicyPage({ page }) {
  return (
    <>
      <Seo seo={page?.seo} />
      <LegalBanner
        banner={page?.banner}
        fallbackHeading="Privacy Policy"
        fallbackCrumb="Privacy Policy"
      />
      <LegalContent
        label={page?.sectionLabel || "Legal"}
        heading={page?.heading || "Privacy Policy"}
        lastUpdated={page?.lastUpdated}
        content={page?.content}
      />
    </>
  );
}

PrivacyPolicyPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const { page } = await getPrivacyPolicyPage();
  return {
    props: {
      page: page ?? null,
    },
  };
}
