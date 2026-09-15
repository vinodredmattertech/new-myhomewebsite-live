import Script from "next/script";

/**
 * LiveServ chat widget (account lid/did 1488).
 *
 * Mounted once at the App root so the widget is present on every route,
 * including pages that supply their own `getLayout`.
 *
 * `next/script` rather than raw <script> tags in _document: it keys its load
 * cache on `id || src`, so client-side navigations re-render this component
 * without re-injecting — a plain tag would be fine on first paint but the
 * widget would have no owner across route changes.
 *
 * `lazyOnload` defers both files until after window load, so a support widget
 * never competes with the hero image for bandwidth on a landing page.
 *
 * The `id` matters: chat.js is injected dynamically here, which leaves
 * `document.currentScript` null, so the vendor bootstraps by looking its own
 * tag up by this id. next/script forwards unknown props as attributes and
 * appends the element afterwards, so the id is in place before it executes.
 * Do not rename it.
 */
export default function LiveServChat() {
  return (
    <>
      <Script
        id="lp_cwc_xqzyihjdskw"
        src="https://cwc.livserv.in/chat.js?lid=1488"
        strategy="lazyOnload"
      />
      <Script
        src="https://cw1.livserv.in?did=1488&id=1"
        strategy="lazyOnload"
      />
    </>
  );
}
