import Seo from "@/components/Seo/Seo";
import HeroBanner from "@/components/myhome/HeroBanner";
import WhoWeAre from "@/components/myhome/WhoWeAre";
import WhyMyHome from "@/components/myhome/WhyMyHome";
import Statistics from "@/components/myhome/Statistics";
import WorldsWeShape from "@/components/myhome/WorldsWeShape";
import WhereStoriesBegin from "@/components/myhome/WhereStoriesBegin";
import Lifestyle from "@/components/myhome/Lifestyle";
import CommunityLiving from "@/components/myhome/CommunityLiving";
import Testimonials from "@/components/myhome/Testimonials";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import { getHomeData } from "@/lib/strapi";

export default function Home({ home }) {
  return (
    <>
      <Seo seo={home?.seo} />
      <HeroBanner data={home?.hero} />
      <WhoWeAre data={home?.whoWeAre} />
      <WhyMyHome data={home?.whyMyHome} />
      <Statistics data={home?.statistics} />
      <WorldsWeShape data={home?.worldsWeShape} />
      <WhereStoriesBegin data={home?.featuredProjects} />
      <Lifestyle data={home?.lifestyle} />
      <CommunityLiving data={home?.communityLiving} />
      <Testimonials data={home?.testimonials} />
    </>
  );
}

Home.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const home = await getHomeData();
  return { props: { home: home ?? null } };
}
