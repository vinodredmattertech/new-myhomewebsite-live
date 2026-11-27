(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        resolve();
        return;
      }
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  function clearBackdrops() {
    document.querySelectorAll(".mh-backdrop, .modal-backdrop").forEach(function (el) {
      el.remove();
    });
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("show");
    modal.style.display = "none";
    modal.style.zIndex = "";
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    clearBackdrops();
  }

  function openModal(modal) {
    if (!modal) return;
    // Avoid double-dimming: Bootstrap JS may also inject .modal-backdrop.
    clearBackdrops();
    document.querySelectorAll(".avali-lp .modal.show").forEach(function (open) {
      if (open !== modal) closeModal(open);
    });
    modal.classList.add("show");
    modal.style.display = "block";
    modal.style.opacity = "1";
    modal.style.zIndex = "1060";
    modal.removeAttribute("aria-hidden");
    document.body.classList.add("modal-open");
    var back = document.createElement("div");
    back.className = "mh-backdrop";
    back.addEventListener("click", function () {
      closeModal(modal);
    });
    document.body.appendChild(back);
  }

  function setupScrollArrows(scroller) {
    if (!scroller || !scroller.parentNode) return;
    if (scroller.parentElement && scroller.parentElement.classList.contains("css-scroll-wrap")) {
      return;
    }
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
      return item
        ? item.getBoundingClientRect().width + 12
        : Math.max(200, scroller.clientWidth * 0.8);
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

  function setupScrollers(root) {
    root.querySelectorAll(".css-scroll").forEach(setupScrollArrows);
  }

  function bindListeners(root) {
    if (window.__avaliListenersBound) return;
    window.__avaliListenersBound = true;

    root.addEventListener(
      "click",
      function (e) {
        var trigger = e.target.closest("[data-bs-toggle='modal']");
        if (!trigger) {
          var wrap = e.target.closest("button");
          if (wrap) trigger = wrap.querySelector("[data-bs-toggle='modal']");
        }
        if (!trigger || !root.contains(trigger)) return;
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
        var sel = trigger.getAttribute("data-bs-target");
        openModal(sel ? document.querySelector(sel) : null);
      },
      true
    );

    root.querySelectorAll(".modal .btn-close, [data-bs-dismiss='modal']").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        closeModal(btn.closest(".modal"));
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        root.querySelectorAll(".modal.show").forEach(closeModal);
      }
    });

    root.querySelectorAll(".accordion-button").forEach(function (btn) {
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

    var videoWrap = root.querySelector(".video-lazy");
    if (videoWrap) {
      videoWrap.addEventListener("click", function () {
        if (videoWrap.querySelector("video")) return;
        videoWrap.innerHTML =
          '<video controls autoplay playsinline width="100%" preload="metadata"><source src="' +
          videoWrap.getAttribute("data-src") +
          '" type="video/mp4"></video>';
      });
    }

    var mapWrap = root.querySelector(".map-lazy");
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
    root.addEventListener(
      "click",
      function (e) {
        var a = e.target.closest("a[data-fslightbox]");
        if (!a || !root.contains(a)) return;
        if (fsReady) return;
        e.preventDefault();
        e.stopPropagation();
        loadScript("/my-home-avali-lp/assests/js/fslightbox.js")
          .catch(function () {
            return loadScript("https://www.myhomeconstructions.com/uploads/fslightbox.js");
          })
          .then(function () {
            fsReady = true;
            if (typeof refreshFsLightbox === "function") refreshFsLightbox();
            a.click();
          });
      },
      true
    );

    root.querySelectorAll("a[href^='#']").forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (a.getAttribute("data-bs-toggle") === "modal") return;
        var id = a.getAttribute("href");
        if (!id || id.length < 2) return;
        var el = document.querySelector(id);
        if (!el || el.classList.contains("modal")) return;
        e.preventDefault();
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - 90,
          behavior: "smooth",
        });
      });
    });
  }

  function boot() {
    var root = document.querySelector(".avali-lp");
    if (!root) return;
    setupScrollers(root);
    bindListeners(root);
  }

  // Re-runnable after React resets dangerouslySetInnerHTML
  window.__avaliRunBoot = boot;
  window.__avaliBooted = true;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
