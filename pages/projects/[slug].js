import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import ProjectDetailBanner from "@/components/myhome/projects/ProjectDetailBanner";
import ProjectOverview from "@/components/myhome/projects/ProjectOverview";
import ProjectAmenities from "@/components/myhome/projects/ProjectAmenities";
import ProjectFloorPlans from "@/components/myhome/projects/ProjectFloorPlans";
import ProjectGallery from "@/components/myhome/projects/ProjectGallery";
import ProjectSpecifications from "@/components/myhome/projects/ProjectSpecifications";
import ProjectProgress from "@/components/myhome/projects/ProjectProgress";
import ProjectBrochure from "@/components/myhome/projects/ProjectBrochure";
import ProjectTestimonials from "@/components/myhome/projects/ProjectTestimonials";
import ProjectInquiry from "@/components/myhome/projects/ProjectInquiry";
import ProjectConnectivity from "@/components/myhome/projects/ProjectConnectivity";

export default function ProjectDetailPage() {
  return (
    <>
      <ProjectDetailBanner />
      <ProjectOverview />
      <ProjectAmenities />
      <ProjectFloorPlans />
      <ProjectGallery />
      <ProjectSpecifications />
      <ProjectProgress />
      <ProjectConnectivity />
      <ProjectBrochure />
      <ProjectTestimonials />
      <ProjectInquiry />
    </>
  );
}

ProjectDetailPage.getLayout = (page) => (
  <MyHomeLayout
    title="My Home Akrida | My Home Group"
    description="My Home Akrida — a landmark residential development at Gopanpally, Hyderabad."
  >
    {page}
  </MyHomeLayout>
);
