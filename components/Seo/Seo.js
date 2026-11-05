
import Head from "next/head";
import React from "react";
import { cleanImage } from "../common/ImageClear";

/** The site serves pages without a trailing slash. CMS canonicals often
 *  include one (`/csr/`); the tag should match the address in the browser. */
function canonicalHref(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    }
    // URL serialization adds a slash to a bare origin. Keep the stored
    // homepage form when it was saved without one.
    if (parsed.pathname === "/" && !trimmed.endsWith("/")) {
      return trimmed.split(/[?#]/)[0];
    }
    return parsed.toString();
  } catch {
    return trimmed.length > 1 ? trimmed.replace(/\/+$/, "") : trimmed;
  }
}

const Seo = (props) => {
  const imgUrl = cleanImage(props?.seo?.metaImage?.data?.attributes?.url);
  const schema = props?.seo?.schema;
  const canonical = canonicalHref(props?.seo?.canonicalURL);
  // console.log("seo", props);
  return (
    <Head>
      <title>
        {props?.seo?.metaTitle == null ? "" : props?.seo?.metaTitle}
      </title>
      <meta
        name="keywords"
        content={props?.seo?.keywords == null ? "" : props?.seo?.keywords}
      />
      <meta
        name="description"
        content={
          props?.seo?.metaDescription == null ? "" : props?.seo?.metaDescription
        }
      />
      <link
        rel="canonical"
        href={canonical}
      />
      <meta
        name="robots"
        content={props?.seo?.metaRobots == null ? "index, follow" : props?.seo?.metaRobots}
      />
      <meta
        name="googlebot"
        content={props?.seo?.metaRobots == null ? "index, follow" : props?.seo?.metaRobots}
      />
      <meta
        property="og:title"
        content={props?.seo?.metaTitle == null ? "" : props?.seo?.metaTitle}
      />
      <meta
        property="og:description"
        content={
          props?.seo?.metaDescription == null ? "" : props?.seo?.metaDescription
        }
      />
      <meta
        property="og:url"
        content={canonical}
      />
      <meta property="og:image" content={imgUrl == null ? "" : imgUrl} />
      {/*twitter card*/}

      <meta name="twitter:title" content={props?.seo?.metaTitle == null ? "" : props?.seo?.metaTitle} />

      <meta name="twitter:description" content={
        props?.seo?.metaDescription == null ? "" : props?.seo?.metaDescription
      } />

      {/*twitter card*/}
      {/* <script type="application/ld+json">{JSON.stringify(props?.seo?.structuredData) == null ? "" : JSON.stringify(props?.seo?.structuredData)}</script> */}
      {schema &&
        schema.map((item, index) => {
          // console.log("item", item);
          return (
            <script key={"websiteJSON" + index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: (JSON.stringify(item?.jsonSchema, null, 2) ? JSON.stringify(item?.jsonSchema, null, 2) : "") }}></script>
          );
        })}
    </Head>
  );
};
export default Seo;