import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import DynamicForm from "@/components/myhome/forms/DynamicForm";
import { vanaAllotmentForm } from "@/lib/forms/vanaAllotment";

/**
 * My Home Vana — Allotment Letter. The allottee confirms their details and
 * acknowledges the letter, which opens in a modal from the checkbox.
 */
const SEO = {
  metaTitle: "My Home Vana Allotment Letter | My Home Group",
  metaDescription: "Confirm your details and acknowledge your My Home Vana allotment letter.",
  metaRobots: "noindex, nofollow",
};

export default function VanaAllotmentLetterPage() {
  return (
    <>
      <Seo seo={SEO} />
      <DynamicForm config={vanaAllotmentForm} />
    </>
  );
}

VanaAllotmentLetterPage.getLayout = (page) => <MyHomeLayout minimal noHeader>{page}</MyHomeLayout>;
VanaAllotmentLetterPage.formPage = true;
