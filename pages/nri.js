import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import PageBanner from "@/components/myhome/PageBanner";
import NriWhyHyderabad from "@/components/myhome/nri/NriWhyHyderabad";
import NriMindset from "@/components/myhome/nri/NriMindset";
import NriTrustedName from "@/components/myhome/nri/NriTrustedName";
import NriFeaturedProjects from "@/components/myhome/nri/NriFeaturedProjects";
import NriFaqs from "@/components/myhome/nri/NriFaqs";
import { getNriData, mediaUrl } from "@/lib/strapi";

export default function NriPage({ nri }) {
  const banner = nri?.banner;
  return (
    <>
      <Seo seo={nri?.seo} />
      <PageBanner
        sectionId="nri-banner"
        desktopSrc={mediaUrl(banner?.desktopImage)}
        mobileSrc={mediaUrl(banner?.mobileImage)}
        imageAlt={banner?.imageAlt}
        heading={banner?.heading}
        breadcrumbLabel={banner?.breadcrumbLabel}
        gradientClass="bg-gradient-to-b from-black/10 via-black/10 to-black/80"
      />
      <NriWhyHyderabad data={nri?.whyHyderabad} />
      <NriMindset data={nri?.mindset} />
      <NriTrustedName data={nri?.trustedName} />
      <NriFeaturedProjects data={nri?.featuredProjects} />
      <NriFaqs data={nri?.faqs} />
    </>
  );
}

NriPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const nri = await getNriData();
  return { props: { nri: nri ?? null } };
}
