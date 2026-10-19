import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import DynamicForm from "@/components/myhome/forms/DynamicForm";
import { vanaBookingForm } from "@/lib/forms/vanaBooking";

/** My Home Vana — Booking Application Form (the printed form, online). */
const SEO = {
  metaTitle: "My Home Vana Booking Application Form | My Home Group",
  metaDescription: "Apply for a unit at My Home Vana, Whitefield Extension. Submit your applicant, payment and KYC details online.",
  metaRobots: "noindex, nofollow",
};

export default function VanaBookingApplicationPage() {
  return (
    <>
      <Seo seo={SEO} />
      <DynamicForm config={vanaBookingForm} />
    </>
  );
}

VanaBookingApplicationPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;
