import { mediaUrl } from "@/lib/strapi";

/**
 * Normalise Strapi project `progress` into LP/main-page image cards.
 * Same source the main project page (`pages/[slug].js`) uses.
 */
export function extractProgressImages(project = {}) {
  const pr = project.progress || {};
  const title = project.title || "Project";

  const progressImages = (
    Array.isArray(pr.images)
      ? pr.images
      : Array.isArray(pr.images?.data)
        ? pr.images.data
        : []
  )
    .map((it) => {
      const media = it.image || it.attributes || it;
      return {
        src: mediaUrl(it.image ? it.image : { data: it }),
        caption: it.caption || media.caption || "",
        alt:
          it.altText ||
          it.caption ||
          media.alternativeText ||
          title,
        date: it.date || media.date || "",
      };
    })
    .filter((it) => it.src);

  const progressEntries = (Array.isArray(pr.entries) ? pr.entries : []).flatMap(
    (entry) => {
      const date = entry.date || "";
      const entryTitle = entry.title || "";
      const rawImgs = Array.isArray(entry.images)
        ? entry.images
        : Array.isArray(entry.images?.data)
          ? entry.images.data
          : [];
      if (rawImgs.length === 0 && (date || entryTitle)) {
        return [
          {
            src: "",
            caption: entryTitle,
            alt: entryTitle,
            date,
          },
        ];
      }
      return rawImgs.map((imgItem) => {
        const src = mediaUrl(
          imgItem.attributes ? { data: imgItem } : imgItem
        );
        const caption =
          imgItem.caption ||
          imgItem.attributes?.caption ||
          entryTitle ||
          "";
        const alt =
          imgItem.altText ||
          imgItem.attributes?.alternativeText ||
          caption ||
          title;
        return { src, caption, alt, date };
      });
    }
  );

  const images =
    progressEntries.length > 0
      ? [...progressEntries, ...progressImages]
      : progressImages;

  const withSrc = images.filter((it) => it.src);
  const latestDate = withSrc
    .map((it) => it.date)
    .filter(Boolean)
    .sort()
    .slice(-1)[0];

  return {
    heading: pr.heading || "Project Status",
    description: pr.description || "",
    asOfLabel: formatAsOf(latestDate),
    images: withSrc,
    isCompleted:
      project.status === "Completed" || project.badge === "Completed",
  };
}

function formatAsOf(dateStr) {
  if (!dateStr) return "";
  const parts = String(dateStr).trim().split("-");
  if (parts.length < 2) return String(dateStr);
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = parts.length >= 3 ? Number(parts[2]) : 1;
  if (!Number.isFinite(year) || month < 0 || month > 11) return String(dateStr);
  const d = new Date(year, month, Number.isFinite(day) ? day : 1);
  const label = d.toLocaleString("en-GB", {
    day: parts.length >= 3 ? "numeric" : undefined,
    month: "long",
    year: "numeric",
  });
  return `As on ${label}`;
}
