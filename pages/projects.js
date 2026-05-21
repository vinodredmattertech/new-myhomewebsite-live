import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import ProjectsBanner from "@/components/myhome/projects/ProjectsBanner";
import ProjectsListing from "@/components/myhome/projects/ProjectsListing";
import { getProjectsListing } from "@/lib/strapi";

export default function ProjectsPage({ page, projects }) {
  return (
    <>
      <Seo seo={page?.seo} />
      <ProjectsBanner banner={page?.banner} />
      <ProjectsListing
        heading={page?.listingHeading}
        projects={projects || []}
      />
    </>
  );
}

ProjectsPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const { page, projects } = await getProjectsListing();
  return {
    props: {
      page: page ?? null,
      projects: projects ?? [],
    },
  };
}
