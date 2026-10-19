import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import AgreementForm from "@/components/myhome/channel-partner-agreement/AgreementForm";

/**
 * Channel Partner Agreement — the "Channel Partner Registration Form" from the
 * printed agreement, online. Submissions are stored in Strapi's Channel Partner
 * Application collection with the KYC documents attached.
 */
const SEO = {
  metaTitle: "Channel Partner Agreement | My Home Group",
  metaDescription:
    "Register as a My Home Group channel partner. Submit your registration with your PAN, Aadhaar, GST and RERA details.",
};

export default function ChannelPartnerAgreementPage() {
  return (
    <>
      <Seo seo={SEO} />
      <AgreementForm />
    </>
  );
}

ChannelPartnerAgreementPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;
