import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import BlogDetail from "@/components/myhome/blog/BlogDetail";
import { getBlogBySlug } from "@/lib/strapi";

export default function BlogDetailPage({ blog, related }) {
  if (!blog) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-5 text-center">
        <div>
          <h1
            className="text-[#333] text-[36px] md:text-[48px] mb-[16px]"
            style={{
              fontFamily:
                '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
              fontWeight: 300,
            }}
          >
            Article not found
          </h1>
          <p
            className="font-montserrat text-[#6d6d6d]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            The article you&apos;re looking for may have moved or been renamed.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <Seo seo={blog.seo} />
      <BlogDetail blog={blog} related={related || []} />
    </>
  );
}

BlogDetailPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps({ params, res }) {
  const { blog, related } = await getBlogBySlug(params?.slug);
  if (!blog) {
    if (res) res.statusCode = 404;
    return { props: { blog: null, related: [] } };
  }
  return { props: { blog, related: related ?? [] } };
}
