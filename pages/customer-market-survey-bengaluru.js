import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import ChannelPartnerSurvey from "@/components/myhome/forms/ChannelPartnerSurvey";
import { marketSurveyForm } from "@/lib/forms/marketSurvey";

/**
 * Customer Market Survey — Bengaluru (the printed survey form, online),
 * shared through channel partners' own links (?uid=<CP Unique ID>).
 */
// Bengaluru: every question is required (bar alternate contact, middle name
// and the tick-boxes).
const FORM = marketSurveyForm("bengaluru", { allRequired: true });
const SEO = {
  metaTitle: "Customer Market Survey - Bengaluru | My Home Group",
  metaDescription: "A short survey to understand your preferences for the purchase of your home in Bengaluru.",
};

export default function CustomerMarketSurveyBengaluruPage() {
  return (
    <>
      <Seo seo={SEO} />
      <ChannelPartnerSurvey config={FORM} />
    </>
  );
}

CustomerMarketSurveyBengaluruPage.getLayout = (page) => <MyHomeLayout minimal noHeader>{page}</MyHomeLayout>;
CustomerMarketSurveyBengaluruPage.formPage = true;
