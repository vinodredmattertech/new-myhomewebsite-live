import Seo from "@/components/Seo/Seo";
import MyHomeLayout from "@/components/myhome/MyHomeLayout";
import ProjectDetailBanner from "@/components/myhome/projects/ProjectDetailBanner";
import ProjectOverview from "@/components/myhome/projects/ProjectOverview";
import ProjectAmenities from "@/components/myhome/projects/ProjectAmenities";
import ProjectAmenitiesIcons from "@/components/myhome/projects/ProjectAmenitiesIcons";
import ProjectClubhouse from "@/components/myhome/projects/ProjectClubhouse";
import ProjectFloorPlans from "@/components/myhome/projects/ProjectFloorPlans";
import ProjectGallery from "@/components/myhome/projects/ProjectGallery";
import ProjectSpecifications from "@/components/myhome/projects/ProjectSpecifications";
import ProjectProgress from "@/components/myhome/projects/ProjectProgress";
import ProjectBrochure from "@/components/myhome/projects/ProjectBrochure";
import ProjectTestimonials from "@/components/myhome/projects/ProjectTestimonials";
import ProjectBeforeAfter from "@/components/myhome/projects/ProjectBeforeAfter";
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

/**
 * Coerce a CMS value to "" so it is never `undefined`.
 *
 * The section components each carry hardcoded sample copy as default parameter
 * values (written against the Akrida demo project). A JS default only fires on
 * `undefined`, so passing `undefined` for an empty CMS field would silently
 * render that sample copy on a live project. Passing "" keeps the default
 * inert, and the components render nothing for empty values.
 */
function txt(value) {
  return hasText(value) ? value : "";
}

export default function ProjectDetailPage({ project }) {
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
  // Fall back to the desktop image when no dedicated mobile crop is set.
  const bannerImgMobile = mediaUrl(db.mobileImage) || bannerImg;
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

  const ch = project.clubhouse || {};
  const clubhouseImage = mediaUrl(ch.image) || "";
  const hasClubhouse = Boolean(
    hasText(ch.heading) ||
    hasText(ch.headingAccent) ||
    hasText(ch.description) ||
    clubhouseImage
  );

  // Icon-grid amenities section. Each tile is a line icon + label, so entries
  // whose icon was never uploaded are dropped (an iconless tile would render
  // an empty cell — and crash next/image on a null src).
  const ai = project.amenitiesIcons || {};
  const amenityIcons = (ai.items || [])
    .map((it) => ({
      title: it.title,
      icon: mediaUrl(it.icon),
      iconAlt: it.icon?.data?.attributes?.alternativeText || it.title,
    }))
    .filter((it) => it.icon);

  // A floor plan is only meaningful with its drawing, so plans whose image was
  // left empty in the CMS are dropped (an imageless plan would otherwise render
  // an empty card — and crash next/image on a null src).
  const fp = project.floorPlans || {};
  const floorPlanTabs = (fp.tabs || [])
    .map((t) => ({
      key: t.key,
      label: t.label,
      plans: (t.plans || [])
        .map((p) => ({
          bhk: p.bhk,
          label: p.label,
          image: mediaUrl(p.image),
        }))
        .filter((p) => p.image),
    }))
    .filter((t) => t.plans.length > 0);

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
  const specs = (sp.items || [])
    .map((it, i) => ({
      key: `spec-${i}`,
      title: it.title,
      body: it.body || "",
      image: mediaUrl(it.image),
    }))
    .filter((it) => it.image);

  const pr = project.progress || {};
  const progressMetrics = (pr.metrics || []).map((m) => ({
    key: m.label,
    label: m.label,
    sublabel: m.sublabel,
    value: typeof m.value === "number" ? m.value : Number(m.value) || 0,
  }));
  // Each progress image carries the photo and its printed caption as separate
  // fields on the same repeatable entry. `progress.images` used to be a plain
  // media list, so tolerate both shapes: a Strapi instance running the old
  // schema still answers with `{ data: [...] }`, which is not an array.
  const progressImages = (Array.isArray(pr.images)
    ? pr.images
    : Array.isArray(pr.images?.data)
      ? pr.images.data
      : []
  )
    .map((it) => {
      const media = it.image || it.attributes || it; // component vs. bare media
      return {
        src: mediaUrl(it.image ? it.image : { data: it }),
        caption: it.caption || media.caption || "",
        alt:
          it.altText ||
          it.caption ||
          media.alternativeText ||
          project.title,
        date: it.date || media.date || "",
      };
    })
    .filter((it) => it.src);

  // Extract repeatable progress entries (each with date & multiple images)
  const progressEntries = (Array.isArray(pr.entries) ? pr.entries : []).flatMap((entry) => {
    const date = entry.date || "";
    const entryTitle = entry.title || "";
    const rawImgs = Array.isArray(entry.images)
      ? entry.images
      : Array.isArray(entry.images?.data)
        ? entry.images.data
        : [];
    if (rawImgs.length === 0 && (date || entryTitle)) {
      return [{
        src: "",
        caption: entryTitle,
        alt: entryTitle,
        date,
      }];
    }
    return rawImgs.map((imgItem) => {
      const src = mediaUrl(imgItem.attributes ? { data: imgItem } : imgItem);
      const caption = imgItem.caption || imgItem.attributes?.caption || entryTitle || "";
      const alt = imgItem.altText || imgItem.attributes?.alternativeText || caption || project.title;
      return {
        src,
        caption,
        alt,
        date,
      };
    });
  });

  const combinedProgressImages = progressEntries.length > 0 ? [...progressEntries, ...progressImages] : progressImages;

  const co = project.connectivity || {};
  const connectivityCategories = (co.categories || []).map((c) => ({
    title: c.title,
    items: lines(c.items),
  }));

  const br = project.brochure || {};
  const brochureFileUrl = br.brochureFile?.data?.attributes?.url
    ? `${STRAPI_URL}${br.brochureFile.data.attributes.url}`
    : "#";
  // Optional second download (e.g. the IGBC certificate). The button only
  // renders when a file has actually been uploaded in the CMS.
  const secondaryFileUrl = br.secondaryFile?.data?.attributes?.url
    ? `${STRAPI_URL}${br.secondaryFile.data.attributes.url}`
    : "";

  const tm = project.testimonials || {};
  const testimonials = (tm.items || []).map((t) => ({
    quote: t.quote,
    author: t.author,
  }));

  const ba = project.beforeAfter || {};
  const beforeSrc = mediaUrl(ba?.beforeImage) || "";
  const afterSrc = mediaUrl(ba?.afterImage) || "";
  // Let the before/after frame follow the uploaded artwork's own shape, so a
  // portrait site photo isn't centre-cropped into a wide frame.
  const mediaRatio = (m) => {
    const a = m?.data?.attributes || m?.attributes || m || {};
    const w = Number(a.width);
    const h = Number(a.height);
    return w > 0 && h > 0 ? w / h : 0;
  };
  const beforeAfterRatio =
    mediaRatio(ba?.beforeImage) || mediaRatio(ba?.afterImage) || 0;

  const iq = project.inquiry || {};
  // Dropdown options for "Interested Configuration", entered one per line in
  // the CMS. Left empty, the whole field is dropped from the form.
  const inquiryConfigOptions = lines(iq.configOptions);

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
  const hasAmenityIcons = amenityIcons.length > 0;
  const hasFloorPlans = floorPlanTabs.some((t) => t.plans.length > 0);
  const hasGallery = galleryTabs.some((t) => t.items.length > 0);
  const hasSpecifications = specs.length > 0;
  // TEMP: forced on so the redesigned construction-update cards are visible
  // with the component's dummy content while Progress > Images is still empty
  // in Strapi. Restore the commented-out gate once the CMS has real cards.
  const hasProgress = true;
  // const hasProgress = progressMetrics.length > 0 || progressImages.length > 0;
  const hasBrochure = Boolean(
    hasText(br.heading) ||
    lines(br.highlights).length ||
    mediaUrl(br?.image) ||
    brochureFileUrl !== "#" ||
    secondaryFileUrl
  );
  const hasTestimonials = testimonials.some((t) => hasText(t.quote));
  // Inquiry is a functional lead-capture form (works with a default heading),
  // so it shows whenever the CMS component is present — not gated on text.
  const hasInquiry = Boolean(project.inquiry);
  // Before/After needs at least one of the two stages uploaded.
  const hasBeforeAfter = Boolean(beforeSrc || afterSrc);

  // Sticky section-nav tabs. Each entry is gated on the same `has*` flag that
  // gates its section, so a tab only ever exists when its section rendered.
  // Order matches the DOM order of the sections below.
  const navSections = [
    { id: "overview", label: "Overview", show: hasOverview },
    { id: "location", label: "Location", show: hasConnectivity },
    { id: "clubhouse", label: "Clubhouse", show: hasClubhouse },
    // The image-slider amenities section is currently commented out below, so
    // the tab follows the icon-grid section that actually owns the anchor.
    { id: "amenities", label: "Amenities", show: hasAmenityIcons },
    { id: "plans", label: "Plans", show: hasFloorPlans },
    { id: "gallery", label: "Gallery", show: hasGallery },
    { id: "specification", label: "Specifications", show: hasSpecifications },
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
          mobileImageSrc={bannerImgMobile}
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
            imageSrc={mediaUrl(ov?.image) || ""}
            imageAlt={`${project.title} overview`}
            sidebarLabel={txt(ov.sidebarLabel)}
            heading={txt(ov.heading)}
            description={txt(ov.description)}
            stats={overviewStats}
          />
        </div>
      )}

      {hasConnectivity && (
        <div id="location">
          <ProjectConnectivity
            sidebarLabel={txt(co.sidebarLabel)}
            heading={txt(co.heading)}
            categories={connectivityCategories}
            mapEmbedUrl={txt(co.mapEmbedUrl)}
            mapSrc={mediaUrl(co?.mapImage) || ""}
            mapAlt={txt(co.mapAlt)}
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
      {/* {hasAmenities && (
        <div id="amenities">
          <ProjectAmenities data={project?.amenities} />
        </div>
      )} */}
      {hasClubhouse && (
        <div id="clubhouse">
          <ProjectClubhouse
            sidebarLabel={txt(ch.sidebarLabel) || undefined}
            heading={txt(ch.heading)}
            headingAccent={txt(ch.headingAccent)}
            description={txt(ch.description)}
            imageSrc={clubhouseImage}
            imageAlt={txt(ch.imageAlt) || `${project.title} clubhouse`}
          />
        </div>
      )}

      {/* aminities new section */}
      {hasAmenityIcons && (
        <div id="amenities">
          <ProjectAmenitiesIcons
            sidebarLabel={txt(ai.sidebarLabel) || undefined}
            heading={txt(ai.heading)}
            description={txt(ai.description)}
            items={amenityIcons}
          />
        </div>
      )}

      {hasFloorPlans && (
        <div id="plans">
          <ProjectFloorPlans
            sidebarLabel={txt(fp.sidebarLabel)}
            heading={txt(fp.heading)}
            description={txt(fp.description)}
            tabs={floorPlanTabs}
            projectName={project.title}
            projectSlug={project.slug}
          />
        </div>
      )}

      {hasGallery && (
        <div id="gallery">
          <ProjectGallery
            sidebarLabel={txt(ga.sidebarLabel)}
            heading={txt(ga.heading)}
            description={txt(ga.description)}
            tabs={galleryTabs}
          />
        </div>
      )}

      {hasSpecifications && (
        <div id="specification">
          <ProjectSpecifications
            sidebarLabel={txt(sp.sidebarLabel)}
            heading={txt(sp.heading)}
            description={txt(sp.description)}
            specs={specs}
          />
        </div>
      )}

      {hasProgress && (
        <div id="construction-updates">
          {/* `|| undefined` so an empty CMS field falls through to the
              component's dummy copy instead of rendering a blank heading. */}
          <ProjectProgress
            sidebarLabel={txt(pr.sidebarLabel) || undefined}
            heading={txt(pr.heading) || undefined}
            description={txt(pr.description) || undefined}
            metrics={progressMetrics}
            images={combinedProgressImages}
            entries={pr.entries}
          />
        </div>
      )}
      {hasBeforeAfter && (
        <div id="transformation">
          <ProjectBeforeAfter
            sidebarLabel={txt(ba.sidebarLabel)}
            heading={txt(ba.heading)}
            description={txt(ba.description)}
            beforeLabel={txt(ba.beforeLabel)}
            afterLabel={txt(ba.afterLabel)}
            beforeSrc={beforeSrc}
            afterSrc={afterSrc}
            beforeCaption={txt(ba.beforeCaption)}
            afterCaption={txt(ba.afterCaption)}
            aspect={beforeAfterRatio}
            projectName={project.title}
          />
        </div>
      )}
      {hasBrochure && (
        <ProjectBrochure
          sidebarLabel={txt(br.sidebarLabel)}
          heading={txt(br.heading)}
          highlights={lines(br.highlights)}
          imageSrc={mediaUrl(br?.image) || ""}
          imageAlt={txt(br.imageAlt)}
          brochureHref={brochureFileUrl}
          buttonLabel={txt(br.buttonLabel) || "Download Brochure"}
          secondaryHref={secondaryFileUrl}
          secondaryButtonLabel={txt(br.secondaryButtonLabel) || "IGBC PDF"}
          projectName={project.title}
          projectSlug={project.slug}
        />
      )}

      {hasTestimonials && (
        <div id="testimonials">
          <ProjectTestimonials
            sidebarLabel={txt(tm.sidebarLabel)}
            heading={txt(tm.heading)}
            description={txt(tm.description)}
            testimonials={testimonials}
          />
        </div>
      )}



      {hasInquiry && (
        <ProjectInquiry
          sidebarLabel={txt(iq.sidebarLabel)}
          heading={txt(iq.heading) || `Secure Your Future At ${project.title}`}
          description={txt(iq.description)}
          address={txt(iq.address)}
          disclaimer={txt(iq.disclaimer)}
          reraNumber={txt(iq.reraNumber)}
          buildingPermissionNo={txt(iq.buildingPermissionNo)}
          reraUrl={txt(iq.reraUrl)}
          configOptions={inquiryConfigOptions}
          qrSrc={mediaUrl(iq?.qrImage) || ""}
          projectName={project.title}
          projectSlug={project.slug}
        />
      )}

      <ProjectFloatingActions
        phone={project.phone || "+917996006262"}
        projectName={project.title}
        projectSlug={project.slug}
      />
    </>
  );
}

ProjectDetailPage.getLayout = (page) => <MyHomeLayout>{page}</MyHomeLayout>;

export async function getServerSideProps({ params }) {
  const project = await getProjectBySlug(params?.slug);

  // This route now sits at the site root, so it catches every path that no
  // static page claimed — not just project URLs. A mistyped `/about-uss` has
  // to land on the site's own 404 page, so hand the miss back to Next rather
  // than rendering the project-shaped "not found" panel for it.
  if (!project) return { notFound: true };

  return { props: { project } };
}
