import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import PageBanner from "@/components/myhome/PageBanner";
import EventsExperiences from "@/components/myhome/events/EventsExperiences";
import EventsImageSection from "@/components/myhome/events/EventsImageSection";
import { getEventsData, mediaUrl } from "@/lib/strapi";

export default function EventsPage({ events }) {
  const banner = events?.banner;
  return (
    <>
      <Seo seo={events?.seo} />
      <PageBanner
        sectionId="events-banner"
        desktopSrc={mediaUrl(banner?.desktopImage)}
        mobileSrc={mediaUrl(banner?.mobileImage)}
        imageAlt={banner?.imageAlt}
        heading={banner?.heading || "Moments You'll Want To Be Part Of"}
        breadcrumbLabel={banner?.breadcrumbLabel || "Explore Our Events & Highlights"}
        gradientClass="bg-gradient-to-b from-black/20 via-black/10 to-black/80"
      />
      <EventsExperiences data={events?.experiences} />
      <EventsImageSection data={events?.imageSection} />
    </>
  );
}

EventsPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps() {
  const events = await getEventsData();
  return { props: { events: events ?? null } };
}
