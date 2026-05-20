import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import PageBanner from "@/components/myhome/PageBanner";
import AboutLegacy from "@/components/myhome/about/AboutLegacy";
import AboutVisionMission from "@/components/myhome/about/AboutVisionMission";
import AboutLeadership from "@/components/myhome/about/AboutLeadership";
import AboutJourney from "@/components/myhome/about/AboutJourney";
import AboutValues from "@/components/myhome/about/AboutValues";

export default function AboutUs() {
  return (
    <>
      <PageBanner
        sectionId="about-banner"
        imageSrc="/assets/myhome/about/banner-cityscape.jpg"
        imageAlt="My Home Group developments shape Hyderabad's skyline"
        heading="Building Dreams That Last"
        breadcrumbLabel="About Us"
      />
      <AboutLegacy />
      <AboutVisionMission />
      <AboutLeadership />
      <AboutJourney />
      <AboutValues />
    </>
  );
}

AboutUs.getLayout = (page) => (
  <MyHomeLayout
    title="About Us | My Home Group"
    description="Since 1981, My Home Group has shaped Hyderabad's skyline with 25+ landmark developments. Discover our legacy, vision, leadership, journey, and the principles that define us."
  >
    {page}
  </MyHomeLayout>
);
