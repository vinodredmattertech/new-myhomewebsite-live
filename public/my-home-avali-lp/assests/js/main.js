(function () {
  var SELLDO_TRACKER = "https://forms.cdn.sell.do/t/60d5d009ed23e9203e3db96c.js";
  var SELLDO_FORM = "https://forms.cdn.sell.do/t/forms/60d5d009ed23e9203e3db96c/647f09a70ad1ff0ea1201de0.js";
  var FORM_ID = "647f09a70ad1ff0ea1201de0";
  var trackerReady = null;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  function ensureTracker() {
    if (!trackerReady) trackerReady = loadScript(SELLDO_TRACKER).catch(function () {});
    return trackerReady;
  }

  function loadSellDoForm(slot) {
    if (!slot || slot.getAttribute("data-loaded") === "1") return;
    slot.setAttribute("data-loaded", "1");
    ensureTracker().then(function () {
      var wrap = document.createElement("dl");
      var s = document.createElement("script");
      s.src = SELLDO_FORM;
      s.setAttribute("data-form-id", FORM_ID);
      wrap.appendChild(s);
      slot.innerHTML = "";
      slot.appendChild(wrap);
    });
  }

  function loadMarketing() {
    if (window.__mktLoaded) return;
    window.__mktLoaded = true;
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l !== "dataLayer" ? "&l=" + l : "";
      j.async = true;
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, "script", "dataLayer", "GTM-M9VNDWC");
    loadScript("https://cwc.livserv.in/chat.js?lid=1488");
    loadScript("https://cw1.livserv.in?did=1488&ampid=1");
  }

  window.sell_do_form_successfully_submitted = function () {
    window.location = "./thank-you.html";
  };

  window.sell_do_form_rendered = function () {
    var utm = window.MH_UTM || { source: "Website", sub: "Website - Website" };
    document.querySelectorAll(".sell_do_form_actual_container").forEach(function (el) {
      if (el.querySelector('input[name="sell_do[campaign][srd]"]')) return;
      el.insertAdjacentHTML("beforeend", '<input type="hidden" value="66794646e11487f367c1113d" name="sell_do[campaign][srd]">');
      el.insertAdjacentHTML("beforeend", '<input type="hidden" value="' + utm.source + '" name="sell_do[form][lead][source]">');
      el.insertAdjacentHTML("beforeend", '<input type="hidden" value="' + utm.sub + '" name="sell_do[form][lead][sub_source]">');
    });
  };

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("show");
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    var back = document.querySelector(".mh-backdrop");
    if (back) back.remove();
  }

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add("show");
    modal.style.display = "block";
    modal.style.opacity = "1";
    modal.removeAttribute("aria-hidden");
    document.body.classList.add("modal-open");
    if (!document.querySelector(".mh-backdrop")) {
      var back = document.createElement("div");
      back.className = "mh-backdrop";
      back.addEventListener("click", function () { closeModal(modal); });
      document.body.appendChild(back);
    }
    loadSellDoForm(modal.querySelector(".selldo-slot"));
    loadMarketing();
  }

  function setupScrollArrows(scroller) {
    if (scroller.parentElement && scroller.parentElement.classList.contains("css-scroll-wrap")) return;
    var wrap = document.createElement("div");
    wrap.className = "css-scroll-wrap";
    scroller.parentNode.insertBefore(wrap, scroller);
    var prev = document.createElement("button");
    prev.type = "button";
    prev.className = "css-scroll-btn css-scroll-prev";
    prev.setAttribute("aria-label", "Previous");
    prev.innerHTML = "&#8249;";
    var next = document.createElement("button");
    next.type = "button";
    next.className = "css-scroll-btn css-scroll-next";
    next.setAttribute("aria-label", "Next");
    next.innerHTML = "&#8250;";
    wrap.appendChild(prev);
    wrap.appendChild(scroller);
    wrap.appendChild(next);

    function step() {
      var item = scroller.firstElementChild;
      return item ? item.getBoundingClientRect().width + 12 : Math.max(200, scroller.clientWidth * 0.8);
    }
    prev.addEventListener("click", function (e) {
      e.preventDefault();
      scroller.scrollBy({ left: -step(), behavior: "smooth" });
    });
    next.addEventListener("click", function (e) {
      e.preventDefault();
      scroller.scrollBy({ left: step(), behavior: "smooth" });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".css-scroll").forEach(setupScrollArrows);

    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-bs-toggle='modal']");
      if (!trigger) {
        var wrap = e.target.closest("button");
        if (wrap) trigger = wrap.querySelector("[data-bs-toggle='modal']");
      }
      if (!trigger) return;
      e.preventDefault();
      var sel = trigger.getAttribute("data-bs-target");
      openModal(sel ? document.querySelector(sel) : null);
    });

    document.querySelectorAll(".modal .btn-close, [data-bs-dismiss='modal']").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        closeModal(btn.closest(".modal"));
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal.show").forEach(closeModal);
      }
    });

    document.querySelectorAll(".accordion-button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = document.querySelector(btn.getAttribute("data-bs-target"));
        if (!target) return;
        var open = target.classList.contains("show");
        var parent = btn.closest(".accordion");
        if (parent) {
          parent.querySelectorAll(".accordion-collapse.show").forEach(function (el) {
            el.classList.remove("show");
          });
          parent.querySelectorAll(".accordion-button").forEach(function (b) {
            b.classList.add("collapsed");
            b.setAttribute("aria-expanded", "false");
          });
        }
        if (!open) {
          target.classList.add("show");
          btn.classList.remove("collapsed");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    var videoWrap = document.querySelector(".video-lazy");
    if (videoWrap) {
      videoWrap.addEventListener("click", function () {
        if (videoWrap.querySelector("video")) return;
        videoWrap.innerHTML =
          '<video controls autoplay playsinline width="100%" preload="metadata"><source src="' +
          videoWrap.getAttribute("data-src") +
          '" type="video/mp4"></video>';
      });
    }

    var mapWrap = document.querySelector(".map-lazy");
    if (mapWrap) {
      mapWrap.addEventListener("click", function () {
        if (mapWrap.querySelector("iframe")) return;
        mapWrap.innerHTML =
          '<iframe src="' +
          mapWrap.getAttribute("data-src") +
          '" width="600" height="450" style="border:0;width:100%" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="My Home Avali marketing office location"></iframe>';
      });
    }

    var fsReady = false;
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-fslightbox]");
      if (!a) return;
      if (fsReady) return;
      e.preventDefault();
      e.stopPropagation();
      loadScript("https://www.myhomeconstructions.com/uploads/fslightbox.js").then(function () {
        fsReady = true;
        if (typeof refreshFsLightbox === "function") refreshFsLightbox();
        a.click();
      });
    }, true);

    document.querySelectorAll("a[href^='#']").forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (a.getAttribute("data-bs-toggle") === "modal") return;
        var id = a.getAttribute("href");
        if (!id || id.length < 2) return;
        var el = document.querySelector(id);
        if (!el || el.classList.contains("modal")) return;
        e.preventDefault();
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
      });
    });

    ["click", "touchstart", "keydown"].forEach(function (ev) {
      window.addEventListener(ev, loadMarketing, { once: true, passive: true });
    });

    document.querySelectorAll(".selldo-slot[data-init]").forEach(loadSellDoForm);
  });
})();
