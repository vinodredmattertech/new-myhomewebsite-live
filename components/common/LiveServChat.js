import { useEffect } from "react";
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
 *
 * The visible widget is a LivHousing bot iframe in #liv-prop-chat-root. The
 * effect below flags the collapsed launcher with `data-lp-collapsed` so
 * globals.css can shrink it on phones without also shrinking the open chat.
 *
 * The flag follows the iframe's own postMessages rather than the box size:
 * on close the bot posts `moveIFrameForLauncher` (~0.3s) and draws the
 * launcher inside the still-full-size box, and only ~1.5s later shrinks the
 * box. Keying off the size made the launcher appear full size and then snap
 * smaller. Scaling the whole box at `moveIFrameForLauncher` keeps the launcher
 * the same size from the moment it appears. The box size is still used, once,
 * for the state on load (the root is created at launcher size).
 */
const CHAT_ROOT_ID = "liv-prop-chat-root";
// Anything shorter than this is the launcher; the open window is ~505px.
const OPEN_MIN_HEIGHT = 300;

function useChatCollapsedFlag() {
  useEffect(() => {
    const getRoot = () => document.getElementById(CHAT_ROOT_ID);
    const setCollapsed = (root, collapsed) => {
      if (collapsed) root.setAttribute("data-lp-collapsed", "");
      else root.removeAttribute("data-lp-collapsed");
    };

    const onMessage = (e) => {
      if (e.data?.source !== "lp-webchat") return;
      const root = getRoot();
      // Only trust messages from the bot's own iframe.
      if (!root || e.source !== root.querySelector("iframe")?.contentWindow) return;
      const { action, state } = e.data;
      if (action === "moveIFrameForLauncher") setCollapsed(root, true);
      else if (action === "windowToggle") setCollapsed(root, !state);
    };
    window.addEventListener("message", onMessage);

    // Initial state: the vendor appends the root to <body> some time after
    // window load, sized as the launcher.
    const init = () => {
      const root = getRoot();
      if (!root) return false;
      setCollapsed(root, parseFloat(root.style.height) < OPEN_MIN_HEIGHT);
      return true;
    };
    let bodyObserver;
    if (!init()) {
      bodyObserver = new MutationObserver(() => {
        if (init()) bodyObserver.disconnect();
      });
      bodyObserver.observe(document.body, { childList: true });
    }

    return () => {
      window.removeEventListener("message", onMessage);
      bodyObserver?.disconnect();
    };
  }, []);
}

export default function LiveServChat() {
  useChatCollapsedFlag();

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
