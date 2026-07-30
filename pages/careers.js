import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import CareerBanner from "@/components/myhome/career/CareerBanner";
import CareerWhy from "@/components/myhome/career/CareerWhy";
import CareerWorkplace from "@/components/myhome/career/CareerWorkplace";
import CareerPositions from "@/components/myhome/career/CareerPositions";
import CareerLinkedin from "@/components/myhome/career/CareerLinkedin";
import { getCareerData } from "@/lib/strapi";

export default function CareerPage({ page }) {
  return (
    <>
      <Seo seo={page?.seo} />
      <CareerBanner banner={page?.banner} />
      <CareerWhy section={page?.why} />
      <CareerWorkplace section={page?.workplace} />
      <CareerPositions section={page?.positions} />
      <CareerLinkedin section={page?.linkedin} />
    </>
  );
}

CareerPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const { page } = await getCareerData();
  return {
    props: {
      page: page ?? null,
    },
  };
}
