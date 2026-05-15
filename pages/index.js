import HeroBanner from "@/components/myhome/HeroBanner";
import WhoWeAre from "@/components/myhome/WhoWeAre";
import WhyMyHome from "@/components/myhome/WhyMyHome";
import Statistics from "@/components/myhome/Statistics";
import WorldsWeShape from "@/components/myhome/WorldsWeShape";
import WhereStoriesBegin from "@/components/myhome/WhereStoriesBegin";
import Testimonials from "@/components/myhome/Testimonials";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";

export default function Home() {
  return (
    <>
      <HeroBanner />
      <WhoWeAre />
      <WhyMyHome />
      <Statistics />
      <WorldsWeShape />
      <WhereStoriesBegin />
      <Testimonials />
    </>
  );
}

Home.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;
