import fs from "fs";
import path from "path";
import { useCallback } from "react";
import RakaShell from "../../components/raka-lp/RakaShell";
import { bindRakaCrmForm } from "../../components/raka-lp/bindCrmForm";

const TITLE = "Luxury Apartments & 3 BHK Flats for Sale in Madinaguda, Miyapur";
const STYLES = [
  "https://fonts.googleapis.com/css2?family=PT+Serif&display=swap",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
  "/my-home-raka-lp/assests/style.min.css",
  "/my-home-raka-lp/critical.css",
];

function utmValue(params, key) {
  const value = params.get(key);
  return value ? value : "Website";
}

function loadScript(src, force) {
  return new Promise((resolve) => {
    const existing = document.querySelectorAll('script[src="' + src + '"]');
    if (existing.length && !force) {
      resolve();
      return;
    }
    existing.forEach(function (node) {
      node.remove();
    });
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}

function ensureArrow(parent, className, label, src) {
  let button = parent.querySelector("." + className);
  if (button) return button;
  button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.setAttribute("aria-label", label);
  button.innerHTML =
    '<img src="' +
    src +
    '" alt="" width="40" height="40" loading="lazy" decoding="async">';
  parent.appendChild(button);
  return button;
}

function initHighlightsSlider() {
  const row = document.querySelector(".raka-lp .highlights-row");
  if (!row) return function () {};
  const slides = Array.prototype.slice.call(row.children).filter(function (node) {
    return node.nodeType === 1;
  });
  if (slides.length < 2) return function () {};

  let shell = row.closest(".highlights-shell");
  if (!shell) {
    shell = document.createElement("div");
    shell.className = "highlights-shell";
    row.parentNode.insertBefore(shell, row);
    shell.appendChild(row);
  }

  let viewport = shell.querySelector(".highlights-viewport");
  if (!viewport) {
    viewport = document.createElement("div");
    viewport.className = "highlights-viewport";
    shell.insertBefore(viewport, row);
    viewport.appendChild(row);
  } else if (row.parentElement !== viewport) {
    viewport.appendChild(row);
  }

  let nav = shell.querySelector(".highlights-nav");
  if (!nav) {
    nav = document.createElement("div");
    nav.className = "highlights-nav";
    shell.appendChild(nav);
  }
  const prev = ensureArrow(
    nav,
    "slider-prev",
    "Previous highlight",
    "/my-home-raka-lp/assets-avali/amsenities-priv.webp"
  );
  const next = ensureArrow(
    nav,
    "slider-next",
    "Next highlight",
    "/my-home-raka-lp/assets-avali/amsenities-next.webp"
  );

  let dots = shell.querySelector(".highlights-dots");
  if (!dots) {
    dots = document.createElement("div");
    dots.className = "highlights-dots";
    shell.appendChild(dots);
  }
  dots.innerHTML = "";

  const mq = window.matchMedia("(max-width: 767.98px)");
  let index = 0;
  let timer = 0;

  function paint(i) {
    Array.prototype.forEach.call(dots.children, function (dot, n) {
      dot.classList.toggle("active", n === i);
    });
  }

  function go(i) {
    if (!mq.matches) {
      row.style.transform = "";
      paint(0);
      return;
    }
    index = (i + slides.length) % slides.length;
    row.style.transform = "translateX(-" + index * 100 + "%)";
    paint(index);
  }

  slides.forEach(function (_, i) {
    const dot = document.createElement("span");
    dot.addEventListener("click", function () {
      go(i);
      start();
    });
    dots.appendChild(dot);
  });

  function start() {
    window.clearInterval(timer);
    if (!mq.matches) {
      row.style.transform = "";
      return;
    }
    timer = window.setInterval(function () {
      go(index + 1);
    }, 4000);
  }

  function onPrev() {
    go(index - 1);
    start();
  }
  function onNext() {
    go(index + 1);
    start();
  }

  let startX = 0;
  function onStart(event) {
    startX = event.changedTouches[0].screenX;
  }
  function onEnd(event) {
    if (!mq.matches) return;
    const delta = event.changedTouches[0].screenX - startX;
    if (delta < -40) go(index + 1);
    if (delta > 40) go(index - 1);
    start();
  }
  function onChange() {
    go(0);
    start();
  }

  prev.addEventListener("click", onPrev);
  next.addEventListener("click", onNext);
  viewport.addEventListener("touchstart", onStart, { passive: true });
  viewport.addEventListener("touchend", onEnd, { passive: true });
  if (mq.addEventListener) mq.addEventListener("change", onChange);
  go(0);
  start();

  return function () {
    window.clearInterval(timer);
    prev.removeEventListener("click", onPrev);
    next.removeEventListener("click", onNext);
    viewport.removeEventListener("touchstart", onStart);
    viewport.removeEventListener("touchend", onEnd);
    if (mq.removeEventListener) mq.removeEventListener("change", onChange);
  };
}

export default function MyHomeRakaLanding({ html }) {
  const onReady = useCallback(() => {
    bindRakaCrmForm();

    const hero = document.getElementById("hero-desktop");
    if (hero && !hero.getAttribute("src")) {
      hero.src = "/my-home-raka-lp/assets-avali/hero-img.webp";
    }

    const stopHighlights = window.__rakaBooted ? function () {} : initHighlightsSlider();

    const params = new URLSearchParams(window.location.search);
    const source = utmValue(params, "utm_source");
    const subSource = utmValue(params, "utm_medium") + " - " + utmValue(params, "utm_campaign");

    window.sell_do_form_successfully_submitted = function () {
      try {
        const openBrochure = document.querySelector("#downloadModal.show");
        if (openBrochure) {
          window.sessionStorage.setItem(
            "raka-lp-brochure",
            JSON.stringify({
              href: "/my-home-raka-lp/assets-avali/Brochure.pdf",
              name: "My Home Raka Brochure.pdf",
            })
          );
        }
      } catch (err) {
        /* ignore */
      }
      window.location = "/my-home-raka-lp/thank-you";
    };
    window.sell_do_form_rendered = function () {
      document.querySelectorAll(".sell_do_form_actual_container").forEach(function (el) {
        if (el.getAttribute("data-utm") === "1") return;
        el.setAttribute("data-utm", "1");
        el.insertAdjacentHTML(
          "beforeend",
          '<input type="hidden" value="667946055d8def4578450de4" name="sell_do[campaign][srd]">'
        );
        el.insertAdjacentHTML(
          "beforeend",
          '<input type="hidden" value="' + source.replace(/"/g, "") + '" name="sell_do[form][lead][source]">'
        );
        el.insertAdjacentHTML(
          "beforeend",
          '<input type="hidden" value="' + subSource.replace(/"/g, "") + '" name="sell_do[form][lead][sub_source]">'
        );
      });
    };

    let cancelled = false;
    (async () => {
      await loadScript("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js");
      if (cancelled) return;
      await loadScript("https://cdn.jsdelivr.net/npm/fslightbox@3.4.1/index.min.js");
      if (cancelled) return;
      try {
        if (typeof window.refreshFsLightbox === "function") window.refreshFsLightbox();
      } catch (err) {
        console.error("raka-lp lightbox refresh failed", err);
      }
      await loadScript("/my-home-raka-lp/assests/app.js", !window.__rakaBooted);
    })();

    return () => {
      cancelled = true;
      if (typeof stopHighlights === "function") stopHighlights();
      delete window.sell_do_form_successfully_submitted;
      delete window.sell_do_form_rendered;
    };
  }, []);

  return <RakaShell title={TITLE} canonical="/my-home-raka-lp" styles={STYLES} html={html} onReady={onReady} />;
}

MyHomeRakaLanding.getLayout = (page) => page;
MyHomeRakaLanding.formPage = true;
MyHomeRakaLanding.ownFloatingActions = true;

export async function getStaticProps() {
  const html = fs.readFileSync(path.join(process.cwd(), "content/raka-lp/index.html"), "utf8");
  return { props: { html } };
}
