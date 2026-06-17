import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import NewsDetail from "@/components/myhome/news/NewsDetail";
import { getNewsBySlug } from "@/lib/strapi";

export default function NewsDetailPage({ news, related }) {
  if (!news) {
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
            Coverage not found
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
      <Seo seo={news.seo} />
      <NewsDetail news={news} related={related || []} />
    </>
  );
}

NewsDetailPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps({ params, res }) {
  const { news, related } = await getNewsBySlug(params?.slug);
  if (!news) {
    if (res) res.statusCode = 404;
    return { props: { news: null, related: [] } };
  }
  return { props: { news, related: related ?? [] } };
}
