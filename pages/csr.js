import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import CsrBanner from "@/components/myhome/csr/CsrBanner";
import CsrOverview from "@/components/myhome/csr/CsrOverview";
import CsrInitiatives from "@/components/myhome/csr/CsrInitiatives";
import { getCsrListing } from "@/lib/strapi";

export default function CsrPage({ page }) {
  return (
    <>
      <Seo seo={page?.seo} />
      <CsrBanner banner={page?.banner} />
      <CsrOverview
        label={page?.overviewLabel}
        heading={page?.overviewHeading}
        description={page?.overviewDescription}
        image={page?.overviewImage}
      />
      <CsrInitiatives section={page?.initiatives} />
    </>
  );
}

CsrPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const { page } = await getCsrListing();
  return {
    props: {
      page: page ?? null,
    },
  };
}
