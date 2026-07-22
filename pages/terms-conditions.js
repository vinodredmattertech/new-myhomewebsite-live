import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import LegalBanner from "@/components/myhome/legal/LegalBanner";
import LegalContent from "@/components/myhome/legal/LegalContent";
import { getTermsConditionsPage } from "@/lib/strapi";

export default function TermsConditionsPage({ page }) {
  return (
    <>
      <Seo seo={page?.seo} />
      <LegalBanner
        banner={page?.banner}
        fallbackHeading="Terms & Conditions"
        fallbackCrumb="Terms & Conditions"
      />
      <LegalContent
        label={page?.sectionLabel || "Legal"}
        heading={page?.heading || "Terms & Conditions"}
        lastUpdated={page?.lastUpdated}
        content={page?.content}
      />
    </>
  );
}

TermsConditionsPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const { page } = await getTermsConditionsPage();
  return {
    props: {
      page: page ?? null,
    },
  };
}
