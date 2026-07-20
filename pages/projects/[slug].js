import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import ProjectDetailBanner from "@/components/myhome/projects/ProjectDetailBanner";
import ProjectOverview from "@/components/myhome/projects/ProjectOverview";
import ProjectAmenities from "@/components/myhome/projects/ProjectAmenities";
import ProjectFloorPlans from "@/components/myhome/projects/ProjectFloorPlans";
import ProjectGallery from "@/components/myhome/projects/ProjectGallery";
import ProjectSpecifications from "@/components/myhome/projects/ProjectSpecifications";
import ProjectProgress from "@/components/myhome/projects/ProjectProgress";
import ProjectBrochure from "@/components/myhome/projects/ProjectBrochure";
import ProjectTestimonials from "@/components/myhome/projects/ProjectTestimonials";
import ProjectInquiry from "@/components/myhome/projects/ProjectInquiry";
import ProjectConnectivity from "@/components/myhome/projects/ProjectConnectivity";
import ProjectFloatingActions from "@/components/myhome/projects/ProjectFloatingActions";
import ProjectSectionNav from "@/components/myhome/projects/ProjectSectionNav";
import { getProjectBySlug, mediaUrl, STRAPI_URL } from "@/lib/strapi";

/** Split a newline-separated text field into a trimmed string array. */
function lines(text) {
  return (text || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** True when a value is a non-empty (non-whitespace) string. */
function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export default function ProjectDetailPage({ project }) {
  console.log(project, "jjj");

  if (!project) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-5 text-center">
        <div>
          <h1
            className="text-[#333] text-[36px] md:text-[48px] mb-[16px]"
            style={{
              fontFamily:
                '"Tartuffo_Trial_Regular","Tartuffo Trial","Cormorant Garamond","Playfair Display",serif',
              fontWeight: 300,
            }}
          >
            Project not found
          </h1>
          <p
            className="font-montserrat text-[#6d6d6d]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            The project you&apos;re looking for may have moved or been renamed.
          </p>
        </div>
      </section>
    );
  }

  const db = project.detailBanner || {};
  const bannerImg = mediaUrl(db.desktopImage) || mediaUrl(project.image);
  const bannerLogo = mediaUrl(db.logo);

  const ov = project.overview || {};
  const overviewStats = (ov.stats || []).map((s) => ({
    value: s.value,
    label: s.label,
  }));

  const am = project.amenities || {};
  const amenities = (am.items || []).map((it) => ({
    title: it.title,
    image: mediaUrl(it.image),
  }));

  const fp = project.floorPlans || {};
  const floorPlanTabs = (fp.tabs || []).map((t) => ({
    key: t.key,
    label: t.label,
    plans: (t.plans || []).map((p) => ({
      bhk: p.bhk,
      label: p.label,
      image: mediaUrl(p.image),
    })),
  }));

  // Gallery tabs can be either images (multi-media `items`) or walkthrough
  // videos (`videos` repeatable). We normalise both into the same array of
  // items, tagged with a `kind` so the section component knows how to render.
  const ga = project.gallery || {};
  const galleryTabs = (ga.tabs || []).map((t) => {
    const tabKind = t.tabKind === "videos" ? "videos" : "images";
    if (tabKind === "videos") {
      const videos = (t.videos || []).map((v) => {
        const fileUrl = mediaUrl(v.videoFile);
        // Prefer uploaded file; fall back to videoUrl. Direct video sources
        // open as an inline <video>; anything else opens as an iframe.
        const videoSrc = fileUrl || v.videoUrl || "";
        const isDirectVideo =
          !!fileUrl || /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(videoSrc);
        return {
          title: v.title || "",
          image: mediaUrl(v.thumbnail),
          alt: v.title || "",
          videoSrc,
          videoType: isDirectVideo ? "video" : "iframe",
        };
      });
      return { key: t.key, label: t.label, kind: "videos", items: videos };
    }
    const items = (t.items?.data || []).map((m) => ({
      image: mediaUrl({ data: m }),
      alt: m.attributes?.alternativeText || "",
    }));
    return { key: t.key, label: t.label, kind: "images", items };
  });

  const sp = project.specifications || {};
  const specs = (sp.items || []).map((it, i) => ({
    key: `spec-${i}`,
    title: it.title,
    image: mediaUrl(it.image),
  }));

  const pr = project.progress || {};
  const progressMetrics = (pr.metrics || []).map((m) => ({
    key: m.label,
    label: m.label,
    sublabel: m.sublabel,
    value: typeof m.value === "number" ? m.value : Number(m.value) || 0,
  }));
  const progressImages = (pr.images?.data || []).map((m) => ({
    src: mediaUrl({ data: m }),
    alt: m.attributes?.alternativeText || project.title,
  }));

  const co = project.connectivity || {};
  const connectivityCategories = (co.categories || []).map((c) => ({
    title: c.title,
    items: lines(c.items),
  }));

  const br = project.brochure || {};
  const brochureFileUrl = br.brochureFile?.data?.attributes?.url
    ? `${STRAPI_URL}${br.brochureFile.data.attributes.url}`
    : "#";

  const tm = project.testimonials || {};
  const testimonials = (tm.items || []).map((t) => ({
    quote: t.quote,
    author: t.author,
  }));

  const iq = project.inquiry || {};

  // Each section renders only when it actually has content. A CMS component
  // that exists but was left empty must NOT produce an empty section, so we
  // check the real fields/media/collections rather than mere object presence.
  const hasBanner = Boolean(bannerImg);
  const hasOverview = Boolean(
    hasText(ov.heading) ||
      hasText(ov.description) ||
      overviewStats.length ||
      mediaUrl(ov?.image)
  );
  const hasConnectivity = Boolean(
    connectivityCategories.length ||
      hasText(co.mapEmbedUrl) ||
      mediaUrl(co?.mapImage)
  );
  const hasAmenities = Boolean(
    hasText(am.heading) || hasText(am.description) || amenities.length
  );
  const hasFloorPlans = floorPlanTabs.some((t) => t.plans.length > 0);
  const hasGallery = galleryTabs.some((t) => t.items.length > 0);
  const hasSpecifications = specs.length > 0;
  const hasProgress = progressMetrics.length > 0 || progressImages.length > 0;
  const hasBrochure = Boolean(
    hasText(br.heading) ||
      lines(br.highlights).length ||
      mediaUrl(br?.image) ||
      brochureFileUrl !== "#"
  );
  const hasTestimonials = testimonials.some((t) => hasText(t.quote));
  // Inquiry is a functional lead-capture form (works with a default heading),
  // so it shows whenever the CMS component is present — not gated on text.
  const hasInquiry = Boolean(project.inquiry);

  // Sticky section-nav tabs. Each entry is gated on the same `has*` flag that
  // gates its section, so a tab only ever exists when its section rendered.
  // Order matches the DOM order of the sections below.
  const navSections = [
    { id: "overview", label: "Overview", show: hasOverview },
    { id: "location", label: "Location", show: hasConnectivity },
    { id: "amenities", label: "Amenities", show: hasAmenities },
    { id: "plans", label: "Plans", show: hasFloorPlans },
    { id: "gallery", label: "Gallery", show: hasGallery },
    { id: "specification", label: "Specification", show: hasSpecifications },
    {
      id: "construction-updates",
      label: "Construction Updates",
      show: hasProgress,
    },
    { id: "testimonials", label: "Testimonials", show: hasTestimonials },
  ].filter((s) => s.show);

  return (
    <>
      <Seo seo={project.seo} />

      {hasBanner && (
        <ProjectDetailBanner
          imageSrc={bannerImg}
          imageAlt={db.imageAlt || project.title}
          title={project.title}
          location={project.location || project.subTitle}
          logoSrc={bannerLogo}
        />
      )}

      <ProjectSectionNav sections={navSections} />

      {hasOverview && (
        <div id="overview">
          <ProjectOverview
            imageSrc={mediaUrl(ov?.image)}
            imageAlt={`${project.title} overview`}
            sidebarLabel={ov.sidebarLabel}
            heading={ov.heading}
            description={ov.description}
            stats={overviewStats.length ? overviewStats : undefined}
          />
        </div>
      )}

      {hasConnectivity && (
        <div id="location">
          <ProjectConnectivity
            sidebarLabel={co.sidebarLabel}
            heading={co.heading}
            categories={
              connectivityCategories.length ? connectivityCategories : undefined
            }
            mapEmbedUrl={co.mapEmbedUrl}
            mapSrc={mediaUrl(co?.mapImage)}
            mapAlt={co.mapAlt}
          />
        </div>
      )}

      {/* {project.amenities && (
        <ProjectAmenities
          sidebarLabel={am.sidebarLabel}
          heading={am.heading}
          description={am.description}
          amenities={amenities.length ? amenities : undefined}
        />
      )} */}
      {hasAmenities && (
        <div id="amenities">
          <ProjectAmenities data={project?.amenities} />
        </div>
      )}

      {hasFloorPlans && (
        <div id="plans">
          <ProjectFloorPlans
            sidebarLabel={fp.sidebarLabel}
            heading={fp.heading}
            description={fp.description}
            tabs={floorPlanTabs.length ? floorPlanTabs : undefined}
            projectName={project.title}
          />
        </div>
      )}

      {hasGallery && (
        <div id="gallery">
          <ProjectGallery
            sidebarLabel={ga.sidebarLabel}
            heading={ga.heading}
            description={ga.description}
            tabs={galleryTabs.length ? galleryTabs : undefined}
          />
        </div>
      )}

      {hasSpecifications && (
        <div id="specification">
          <ProjectSpecifications
            sidebarLabel={sp.sidebarLabel}
            heading={sp.heading}
            description={sp.description}
            specs={specs.length ? specs : undefined}
          />
        </div>
      )}

      {hasProgress && (
        <div id="construction-updates">
          <ProjectProgress
            sidebarLabel={pr.sidebarLabel}
            heading={pr.heading}
            description={pr.description}
            metrics={progressMetrics.length ? progressMetrics : undefined}
            images={progressImages.length ? progressImages : undefined}
          />
        </div>
      )}

      {hasBrochure && (
        <ProjectBrochure
          sidebarLabel={br.sidebarLabel}
          heading={br.heading}
          highlights={
            lines(br.highlights).length ? lines(br.highlights) : undefined
          }
          imageSrc={mediaUrl(br?.image)}
          imageAlt={br.imageAlt}
          brochureHref={brochureFileUrl}
          buttonLabel={br.buttonLabel}
          projectName={project.title}
        />
      )}

      {hasTestimonials && (
        <div id="testimonials">
          <ProjectTestimonials
            sidebarLabel={tm.sidebarLabel}
            heading={tm.heading}
            description={tm.description}
            testimonials={testimonials.length ? testimonials : undefined}
          />
        </div>
      )}

      {hasInquiry && (
        <ProjectInquiry
          sidebarLabel={iq.sidebarLabel}
          heading={iq.heading || `Secure Your Future At ${project.title}`}
          description={iq.description}
          address={iq.address}
          disclaimer={iq.disclaimer}
          reraNumber={iq.reraNumber}
          reraUrl={iq.reraUrl}
          qrSrc={mediaUrl(iq?.qrImage)}
          projectName={project.title}
        />
      )}

      <ProjectFloatingActions
        phone={project.phone || "+917996006262"}
        projectName={project.title}
      />
    </>
  );
}

ProjectDetailPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps({ params, res }) {
  const project = await getProjectBySlug(params?.slug);
  if (!project) {
    if (res) res.statusCode = 404;
    return { props: { project: null } };
  }

  console.log(project, "leo");
  return { props: { project } };
}
