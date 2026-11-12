
import Head from "next/head";
import React from "react";
import { cleanImage } from "../common/ImageClear";

/** The site serves pages without a trailing slash. CMS canonicals often
 *  include one (`/csr/` or `https://www.myhomeconstructions.com/`); the tag
 *  should match the address without that slash. */
function canonicalHref(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    parsed.search = "";
    parsed.hash = "";
    if (parsed.pathname === "/") {
      // WHATWG URL always serializes origin as `https://host/`. Drop the
      // homepage slash so canonical matches the rest of the site.
      return parsed.origin;
    }
    if (parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    }
    return parsed.toString();
  } catch {
    return trimmed.length > 1 ? trimmed.replace(/\/+$/, "") : trimmed;
  }
}

function withoutHomepageSlash(value) {
  if (typeof value !== "string") return value;
  return value.replace(
    /^(https?:\/\/[^/?#]+)\/(?=$|[?#])/i,
    "$1"
  );
}

function normalizeSchemaUrls(schema) {
  if (!schema) return schema;
  const walk = (node) => {
    if (Array.isArray(node)) return node.map(walk);
    if (!node || typeof node !== "object") return node;
    const next = {};
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === "string" && (key === "url" || key === "@id")) {
        next[key] = withoutHomepageSlash(value);
      } else {
        next[key] = walk(value);
      }
    }
    return next;
  };
  return Array.isArray(schema) ? schema.map(walk) : walk(schema);
}

const Seo = (props) => {
  const imgUrl = cleanImage(props?.seo?.metaImage?.data?.attributes?.url);
  const schema = normalizeSchemaUrls(props?.seo?.schema);
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