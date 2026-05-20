import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import PageBanner from "@/components/myhome/PageBanner";
import NriWhyHyderabad from "@/components/myhome/nri/NriWhyHyderabad";
import NriMindset from "@/components/myhome/nri/NriMindset";
import NriTrustedName from "@/components/myhome/nri/NriTrustedName";
import NriFeaturedProjects from "@/components/myhome/nri/NriFeaturedProjects";
import NriFaqs from "@/components/myhome/nri/NriFaqs";

export default function NriPage() {
  return (
    <>
      <PageBanner
        sectionId="nri-banner"
        imageSrc="/assets/myhome/nri/banner-overlay.jpg"
        imageAlt="Your home in India — within reach from anywhere"
        heading="Your Home in India, Within Reach From Anywhere."
        breadcrumbLabel="NRI - Non-Resident Indian"
        gradientClass="bg-gradient-to-b from-black/10 via-black/10 to-black/80"
      />
      <NriWhyHyderabad />
      <NriMindset />
      <NriTrustedName />
      <NriFeaturedProjects />
      <NriFaqs />
    </>
  );
}

NriPage.getLayout = (page) => (
  <MyHomeLayout
    title="NRI – Non-Resident Indian | My Home Group"
    description="Your home in India, within reach from anywhere. Personalised guidance, documentation support, and transparent project details for NRIs investing in Hyderabad with My Home Group."
  >
    {page}
  </MyHomeLayout>
);
