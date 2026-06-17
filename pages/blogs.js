import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import BlogsBanner from "@/components/myhome/blog/BlogsBanner";
import BlogListing from "@/components/myhome/blog/BlogListing";
import { getBlogListing } from "@/lib/strapi";

export default function BlogsPage({ page, blogs }) {
  return (
    <>
      <Seo seo={page?.seo} />
      <BlogsBanner banner={page?.banner} />
      <BlogListing
        blogs={blogs || []}
        heading={page?.listingHeading}
        sectionLabel={page?.sectionLabel}
        otherArticlesHeading={page?.otherArticlesHeading}
      />
    </>
  );
}

BlogsPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const { page, blogs } = await getBlogListing();
  return {
    props: {
      page: page ?? null,
      blogs: blogs ?? [],
    },
  };
}
