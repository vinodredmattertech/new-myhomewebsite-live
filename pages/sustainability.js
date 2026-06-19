import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import SustainabilityBanner from "@/components/myhome/sustainability/SustainabilityBanner";
import SustainabilityOverview from "@/components/myhome/sustainability/SustainabilityOverview";
import SustainabilityVision from "@/components/myhome/sustainability/SustainabilityVision";
import SustainabilityEsg from "@/components/myhome/sustainability/SustainabilityEsg";
import SustainabilityJourney from "@/components/myhome/sustainability/SustainabilityJourney";
import SustainabilityMetrics from "@/components/myhome/sustainability/SustainabilityMetrics";
import { getSustainabilityData } from "@/lib/strapi";

export default function SustainabilityPage({ page }) {
  return (
    <>
      <Seo seo={page?.seo} />
      <SustainabilityBanner banner={page?.banner} />
      <SustainabilityOverview
        label={page?.overviewLabel}
        heading={page?.overviewHeading}
        description={page?.overviewDescription}
        image={page?.overviewImage}
        imageAlt={page?.overviewImageAlt}
      />
      <SustainabilityVision vision={page?.vision} />
      <SustainabilityEsg esg={page?.esg} />
      <SustainabilityJourney journey={page?.journey} />
      <SustainabilityMetrics metrics={page?.metrics} />
    </>
  );
}

SustainabilityPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const { page } = await getSustainabilityData();
  return {
    props: {
      page: page ?? null,
    },
  };
}
