import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import PageBanner from "@/components/myhome/PageBanner";
import AboutLegacy from "@/components/myhome/about/AboutLegacy";
import AboutVisionMission from "@/components/myhome/about/AboutVisionMission";
import AboutLeadership from "@/components/myhome/about/AboutLeadership";
import AboutJourney from "@/components/myhome/about/AboutJourney";
import AboutValues from "@/components/myhome/about/AboutValues";
import { getAboutData, mediaUrl } from "@/lib/strapi";

export default function AboutUs({ about }) {
  const banner = about?.banner;
  return (
    <>
      <Seo seo={about?.seo} />
      <PageBanner
        sectionId="about-banner"
        desktopSrc={mediaUrl(banner?.desktopImage)}
        mobileSrc={mediaUrl(banner?.mobileImage)}
        imageAlt={banner?.imageAlt}
        heading={banner?.heading}
        breadcrumbLabel={banner?.breadcrumbLabel}
      />
      <AboutLegacy data={about?.legacy} />
      <AboutVisionMission data={about?.visionMission} />
      <AboutLeadership data={about?.leadership} />
      <AboutJourney data={about?.journey} />
      <AboutValues data={about?.values} />
    </>
  );
}

AboutUs.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const about = await getAboutData();
  return { props: { about: about ?? null } };
}
