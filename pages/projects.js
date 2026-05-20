import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import ProjectsBanner from "@/components/myhome/projects/ProjectsBanner";
import ProjectsListing from "@/components/myhome/projects/ProjectsListing";

export default function ProjectsPage() {
  return (
    <>
      <ProjectsBanner />
      <ProjectsListing />
    </>
  );
}

ProjectsPage.getLayout = (page) => (
  <MyHomeLayout
    title="Our Projects | My Home Group"
    description="Explore My Home Group's portfolio of landmark residential, commercial, and completed developments across Hyderabad — filter by location, configuration, and price to find your next address."
  >
    {page}
  </MyHomeLayout>
);
