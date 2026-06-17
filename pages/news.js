import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import NewsBanner from "@/components/myhome/news/NewsBanner";
import NewsListing from "@/components/myhome/news/NewsListing";
import { getNewsListing } from "@/lib/strapi";

export default function NewsPage({ page, news }) {
  return (
    <>
      <Seo seo={page?.seo} />
      <NewsBanner banner={page?.banner} />
      <NewsListing
        news={news || []}
        heading={page?.listingHeading}
        sectionLabel={page?.sectionLabel}
        backgroundImage={page?.backgroundImage}
      />
    </>
  );
}

NewsPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const { page, news } = await getNewsListing();
  return {
    props: {
      page: page ?? null,
      news: news ?? [],
    },
  };
}
