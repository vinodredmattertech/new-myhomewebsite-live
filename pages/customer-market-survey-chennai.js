import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import ChannelPartnerSurvey from "@/components/myhome/forms/ChannelPartnerSurvey";
import { marketSurveyForm } from "@/lib/forms/marketSurvey";

/**
 * Customer Market Survey — Chennai (the printed survey form, online),
 * shared through channel partners' own links (?uid=<CP Unique ID>).
 */
// Chennai: every question is required (bar alternate contact, middle name
// and the tick-boxes).
const FORM = marketSurveyForm("chennai", { allRequired: true });
const SEO = {
  metaTitle: "Customer Market Survey - Chennai | My Home Group",
  metaDescription: "A short survey to understand your preferences for the purchase of your home in Chennai.",
};

export default function CustomerMarketSurveyChennaiPage() {
  return (
    <>
      <Seo seo={SEO} />
      <ChannelPartnerSurvey config={FORM} />
    </>
  );
}

CustomerMarketSurveyChennaiPage.getLayout = (page) => <MyHomeLayout minimal noHeader>{page}</MyHomeLayout>;
CustomerMarketSurveyChennaiPage.formPage = true;
