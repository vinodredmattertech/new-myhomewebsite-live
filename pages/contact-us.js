import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import PageBanner from "@/components/myhome/PageBanner";
import ContactExperts from "@/components/myhome/contact/ContactExperts";
import ContactForm from "@/components/myhome/contact/ContactForm";
import { getContactData, mediaUrl } from "@/lib/strapi";

export default function ContactUs({ contact }) {
  const banner = contact?.banner;
  return (
    <>
      <Seo seo={contact?.seo} />
      <PageBanner
        sectionId="contact-banner"
        desktopSrc={mediaUrl(banner?.desktopImage)}
        mobileSrc={mediaUrl(banner?.mobileImage)}
        imageAlt={banner?.imageAlt}
        heading={banner?.heading}
        breadcrumbLabel={banner?.breadcrumbLabel}
        gradientClass="bg-gradient-to-b from-black/35 via-black/15 to-black/75"
      />
      <ContactExperts data={contact?.experts} />
      <ContactForm data={contact?.form} />
    </>
  );
}

ContactUs.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const contact = await getContactData();
  return { props: { contact: contact ?? null } };
}
