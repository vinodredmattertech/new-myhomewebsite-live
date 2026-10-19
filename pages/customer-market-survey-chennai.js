import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import DynamicForm from "@/components/myhome/forms/DynamicForm";
import { marketSurveyForm } from "@/lib/forms/marketSurvey";

/** Customer Market Survey — Chennai (the printed survey form, online). */
const FORM = marketSurveyForm("chennai");
const SEO = {
  metaTitle: "Customer Market Survey - Chennai | My Home Group",
  metaDescription: "A short survey to understand your preferences for the purchase of your home in Chennai.",
};

export default function CustomerMarketSurveyChennaiPage() {
  return (
    <>
      <Seo seo={SEO} />
      <DynamicForm config={FORM} />
    </>
  );
}

CustomerMarketSurveyChennaiPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;
