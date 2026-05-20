import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import PageBanner from "@/components/myhome/PageBanner";
import ContactExperts from "@/components/myhome/contact/ContactExperts";
import ContactForm from "@/components/myhome/contact/ContactForm";

export default function ContactUs() {
  return (
    <>
      <PageBanner
        sectionId="contact-banner"
        imageSrc="/assets/myhome/contact/banner-lobby.jpg"
        imageAlt="My Home Group lobby"
        heading="Your Gateway to Exceptional Living"
        breadcrumbLabel="Contact Us"
        gradientClass="bg-gradient-to-b from-black/35 via-black/15 to-black/75"
      />
      <ContactExperts />
      <ContactForm />
    </>
  );
}

ContactUs.getLayout = (page) => (
  <MyHomeLayout
    title="Contact Us | My Home Group"
    description="Connect with our experts at My Home Group. Get in touch for sales enquiries, NRI services, and corporate communication — Hyderabad's most trusted real estate developer."
  >
    {page}
  </MyHomeLayout>
);
