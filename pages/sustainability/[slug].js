import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import PillarBanner from "@/components/myhome/sustainability/pillar/PillarBanner";
import PillarCommitment from "@/components/myhome/sustainability/pillar/PillarCommitment";
import PillarFocus from "@/components/myhome/sustainability/pillar/PillarFocus";
import PillarInitiatives from "@/components/myhome/sustainability/pillar/PillarInitiatives";
import PillarHighlights from "@/components/myhome/sustainability/pillar/PillarHighlights";
import PillarOngoingProjects from "@/components/myhome/sustainability/pillar/PillarOngoingProjects";
import { getSustainabilityPillar } from "@/lib/strapi";
import { getPillarFallback } from "@/lib/sustainabilityPillars";

const DEFAULT_ACCENT = "#ef493d";

/**
 * ESG pillar detail page — /sustainability/environment | social | governance.
 *
 * Reached from the "Know More" buttons on the Sustainability page's ESG band.
 * Content comes from the `sustainability-pillar` collection in Strapi, falling
 * back field-by-field to the built-in copy in lib/sustainabilityPillars so the
 * page renders fully before an editor has authored it. The closing Ongoing
 * Projects band reads live from the Projects collection.
 */
export default function SustainabilityPillarPage({ pillar, fallback, projects }) {
  const accent = pillar?.accentColor || DEFAULT_ACCENT;
  const title = pillar?.title || fallback?.title || "";

  // Seo renders an empty <title> when nothing is authored, which would leave
  // three real pages untitled. Fall back to the pillar's own copy.
  const seo = pillar?.seo?.metaTitle
    ? pillar.seo
    : {
        ...(pillar?.seo || {}),
        metaTitle: `${title} · Sustainability | My Home Group`,
        metaDescription:
          pillar?.seo?.metaDescription ||
          fallback?.commitment?.quote ||
          fallback?.focus?.description ||
          "",
      };

  return (
    <>
      <Seo seo={seo} />
      <PillarBanner
        banner={pillar?.banner}
        fallback={fallback?.banner}
        pillarTitle={title}
      />
      <PillarCommitment
        commitment={pillar?.commitment}
        fallback={fallback?.commitment}
        accent={accent}
      />
      <PillarFocus
        focus={pillar?.focus}
        fallback={fallback?.focus}
        accent={accent}
      />
      <PillarInitiatives
        initiatives={pillar?.initiatives}
        fallback={fallback?.initiatives}
        accent={accent}
      />
      <PillarHighlights
        highlights={pillar?.highlights}
        fallback={fallback?.highlights}
      />
      <PillarOngoingProjects
        section={pillar?.ongoingProjects}
        projects={projects}
        accent={accent}
      />
    </>
  );
}

SustainabilityPillarPage.getLayout = (page) => (
  <MyHomeLayout>{page}</MyHomeLayout>
);

export async function getServerSideProps({ params }) {
  const slug = String(params?.slug || "").toLowerCase();
  const fallback = getPillarFallback(slug);
  const { pillar, projects } = await getSustainabilityPillar(slug);

  // A slug with neither a published entry nor built-in copy isn't a pillar —
  // 404 rather than rendering an empty shell under a real-looking URL.
  if (!pillar && !fallback) {
    return { notFound: true };
  }

  return {
    props: {
      pillar: pillar ?? null,
      fallback: fallback ?? null,
      projects: projects ?? [],
    },
  };
}
