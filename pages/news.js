import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import NewsBanner from "@/components/myhome/news/NewsBanner";
import MediaGallery from "@/components/myhome/news/MediaGallery";
import { getMediaGalleryListing } from "@/lib/strapi";

export default function NewsPage({ page, items }) {
  return (
    <>
      <Seo seo={page?.seo} />
      <NewsBanner banner={page?.banner} />
      <MediaGallery
        items={items || []}
        heading={page?.listingHeading}
        sectionLabel={page?.sectionLabel}
        backgroundImage={page?.backgroundImage}
      />
    </>
  );
}

NewsPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const { page, items } = await getMediaGalleryListing();
  return {
    props: {
      page: page ?? null,
      items: items ?? [],
    },
  };
}
