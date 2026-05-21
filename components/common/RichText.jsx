import React from "react";

/**
 * Renderer for Strapi `richtext` fields.
 *
 * Strapi stores richtext as a string. With the default Markdown editor it's
 * Markdown; with the CKEditor5 plugin (this project) it's HTML. This
 * component handles both, designed to drop INSIDE an existing styled
 * element so the caller's `<p>`/`<div>` styling stays intact:
 *
 *   <p className="font-montserrat ...">
 *     <RichText>{data.body}</RichText>
 *   </p>
 *
 * For HTML input we strip block wrappers that would break the parent (`p`,
 * `div`, `h1`–`h6`) and convert paragraph boundaries to `<br/><br/>`, then
 * inject the rest as HTML. For Markdown/plain input we apply minimal inline
 * formatting (**bold**, *italic*, [text](url)) and convert newlines to
 * `<br/>`.
 */

const HTML_TAG_RE = /<[a-z][^>]*>/i;
const BLOCK_WRAPPER_RE = /<\/?(?:p|div|h[1-6]|section|article)[^>]*>/gi;

function looksLikeHtml(s) {
  return HTML_TAG_RE.test(s);
}

/** Convert CKEditor-style HTML into safe inline HTML for use inside <p>. */
function normalizeHtml(html) {
  // Treat </p><p> (and div/h variants) as a paragraph break.
  let out = html.replace(/<\/(?:p|div|h[1-6])>\s*<(?:p|div|h[1-6])[^>]*>/gi, "<br/><br/>");
  // Strip remaining block wrappers — keep their inner text + inline tags.
  out = out.replace(BLOCK_WRAPPER_RE, "");
  // Collapse leading/trailing whitespace + brs.
  out = out.replace(/^(\s|<br\s*\/?\s*>)+/i, "").replace(/(\s|<br\s*\/?\s*>)+$/i, "");
  return out;
}

/** Escape HTML-special characters from plain/Markdown source. */
function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Convert Markdown-ish plain text into safe inline HTML. */
function markdownToInlineHtml(src) {
  let s = escapeHtml(src);

  // [text](url) — must run before italic so brackets don't get eaten.
  s = s.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, label, href) => {
      const isExternal = /^https?:\/\//i.test(href);
      const attrs = isExternal
        ? ` target="_blank" rel="noopener noreferrer"`
        : "";
      return `<a href="${href}"${attrs}>${label}</a>`;
    }
  );

  // **bold** / __bold__
  s = s.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__([^_\n]+)__/g, "<strong>$1</strong>");

  // *italic* / _italic_  (don't catch ** that's already consumed)
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
  s = s.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, "$1<em>$2</em>");

  // Blank lines → paragraph break, single newlines → soft break.
  s = s.replace(/\r\n/g, "\n").replace(/\n{2,}/g, "<br/><br/>").replace(/\n/g, "<br/>");

  return s;
}

export default function RichText({ children }) {
  if (typeof children !== "string" || !children.trim()) return null;

  const html = looksLikeHtml(children)
    ? normalizeHtml(children)
    : markdownToInlineHtml(children);

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
