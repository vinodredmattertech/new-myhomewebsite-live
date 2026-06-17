import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import PageBanner from "@/components/myhome/PageBanner";
import TestimonialsListing from "@/components/myhome/testimonials/TestimonialsListing";
import { getTestimonialsData, mediaUrl } from "@/lib/strapi";

export default function TestimonialsPage({ testimonials }) {
  const banner = testimonials?.banner;
  return (
    <>
      <Seo seo={testimonials?.seo} />
      <PageBanner
        sectionId="testimonials-banner"
        desktopSrc={mediaUrl(banner?.desktopImage)}
        mobileSrc={mediaUrl(banner?.mobileImage)}
        imageAlt={banner?.imageAlt}
        heading={banner?.heading || "Homes Designed With Purpose."}
        breadcrumbLabel={banner?.breadcrumbLabel || "Testimonials"}
        gradientClass="bg-gradient-to-b from-black/10 via-black/10 to-black/80"
      />
      <TestimonialsListing
        heading={testimonials?.heading}
        sectionLabel={testimonials?.sectionLabel}
        items={testimonials?.items}
      />
    </>
  );
}

TestimonialsPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const testimonials = await getTestimonialsData();
  return { props: { testimonials: testimonials ?? null } };
}
