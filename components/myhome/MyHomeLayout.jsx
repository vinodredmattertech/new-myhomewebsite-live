import Head from "next/head";
import MyHomeHeader from "@/components/myhome/Header";
import MyHomeFooter from "@/components/myhome/Footer";
import SmoothScroll from "@/components/common/SmoothScroll";

export default function MyHomeLayout({
  children,
  title = "My Home Group | Welcome Home — Where life finds its rhythm",
  description = "Since 1981, My Home Group has shaped Hyderabad's skyline through 25+ landmark addresses, 37M+ sq.ft. delivered, and an unwavering commitment to design, integrity, and sustainability.",
}) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>

      <SmoothScroll>
        <MyHomeHeader />
        <main className="mh-page relative w-full overflow-x-clip">
          {children}
        </main>
        <MyHomeFooter />
      </SmoothScroll>
    </>
  );
}
