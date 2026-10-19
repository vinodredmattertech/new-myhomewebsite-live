import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import DynamicForm from "@/components/myhome/forms/DynamicForm";
import { marketSurveyForm } from "@/lib/forms/marketSurvey";

/** Customer Market Survey — Bengaluru (the printed survey form, online). */
const FORM = marketSurveyForm("bengaluru");
const SEO = {
  metaTitle: "Customer Market Survey - Bengaluru | My Home Group",
  metaDescription: "A short survey to understand your preferences for the purchase of your home in Bengaluru.",
};

export default function CustomerMarketSurveyBengaluruPage() {
  return (
    <>
      <Seo seo={SEO} />
      <DynamicForm config={FORM} />
    </>
  );
}

CustomerMarketSurveyBengaluruPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;
