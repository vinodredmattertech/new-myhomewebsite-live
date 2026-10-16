import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import PageBanner from "@/components/myhome/PageBanner";
import AgreementTerms from "@/components/myhome/channel-partner-agreement/AgreementTerms";
import AgreementForm from "@/components/myhome/channel-partner-agreement/AgreementForm";
import { getChannelPartnerData, mediaUrl } from "@/lib/strapi";

/**
 * Channel Partner Agreement — the printed "My Home Channel Partner Agreement
 * Form" online: the agreement itself (cover letter, terms, clauses and the
 * Annexure A payment matrix) followed by the registration form, whose
 * submissions are stored in Strapi's Channel Partner Application collection
 * with the KYC documents attached.
 *
 * The agreement text is legal copy kept in lib/channelPartnerAgreement.js. The
 * banner image is shared with the Channel Partner page.
 */
const SEO = {
  metaTitle: "Channel Partner Agreement | My Home Group",
  metaDescription:
    "Register as a My Home Group channel partner. Read the Channel Partner Agreement and submit your registration with your PAN, Aadhaar, GST and RERA details.",
};

export default function ChannelPartnerAgreementPage({ banner }) {
  return (
    <>
      <Seo seo={SEO} />
      <PageBanner
        sectionId="channel-partner-agreement-banner"
        desktopSrc={mediaUrl(banner?.desktopImage)}
        mobileSrc={mediaUrl(banner?.mobileImage) || mediaUrl(banner?.desktopImage)}
        imageAlt={banner?.imageAlt}
        heading="Channel Partner Agreement"
        breadcrumbLabel="Channel Partner Agreement"
        gradientClass="bg-gradient-to-b from-black/10 via-black/10 to-black/80"
      />
      <AgreementTerms />
      <AgreementForm />
    </>
  );
}

ChannelPartnerAgreementPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const { page } = await getChannelPartnerData();
  return { props: { banner: page?.banner ?? null } };
}
