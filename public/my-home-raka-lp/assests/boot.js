(function () {
  if (window.__rakaBooted) return;
  window.__rakaBooted = true;

  function loadScript(src, force) {
    return new Promise(function (resolve) {
      var existing = document.querySelectorAll('script[src="' + src + '"]');
      if (existing.length && !force) {
        resolve();
        return;
      }
      existing.forEach(function (node) {
        node.remove();
      });
      var script = document.createElement("script");
      script.src = src;
      script.onload = function () {
        resolve();
      };
      script.onerror = function () {
        resolve();
      };
      document.body.appendChild(script);
    });
  }

  function ensureArrow(parent, className, label, src) {
    var button = parent.querySelector("." + className);
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
    var row = document.querySelector(".raka-lp .highlights-row");
    if (!row) return;
    var slides = Array.prototype.slice.call(row.children).filter(function (node) {
      return node.nodeType === 1;
    });
    if (slides.length < 2) return;

    var shell = row.closest(".highlights-shell");
    if (!shell) {
      shell = document.createElement("div");
      shell.className = "highlights-shell";
      row.parentNode.insertBefore(shell, row);
      shell.appendChild(row);
    }

    var viewport = shell.querySelector(".highlights-viewport");
    if (!viewport) {
      viewport = document.createElement("div");
      viewport.className = "highlights-viewport";
      shell.insertBefore(viewport, row);
      viewport.appendChild(row);
    } else if (row.parentElement !== viewport) {
      viewport.appendChild(row);
    }

    var nav = shell.querySelector(".highlights-nav");
    if (!nav) {
      nav = document.createElement("div");
      nav.className = "highlights-nav";
      shell.appendChild(nav);
    }
    var prev = ensureArrow(
      nav,
      "slider-prev",
      "Previous highlight",
      "/my-home-raka-lp/assets-avali/amsenities-priv.webp"
    );
    var next = ensureArrow(
      nav,
      "slider-next",
      "Next highlight",
      "/my-home-raka-lp/assets-avali/amsenities-next.webp"
    );

    var dots = shell.querySelector(".highlights-dots");
    if (!dots) {
      dots = document.createElement("div");
      dots.className = "highlights-dots";
      shell.appendChild(dots);
    }
    dots.innerHTML = "";

    var mq = window.matchMedia("(max-width: 767.98px)");
    var index = 0;
    var timer = 0;

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
      var dot = document.createElement("span");
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

    prev.addEventListener("click", function () {
      go(index - 1);
      start();
    });
    next.addEventListener("click", function () {
      go(index + 1);
      start();
    });

    var startX = 0;
    viewport.addEventListener(
      "touchstart",
      function (event) {
        startX = event.changedTouches[0].screenX;
      },
      { passive: true }
    );
    viewport.addEventListener(
      "touchend",
      function (event) {
        if (!mq.matches) return;
        var delta = event.changedTouches[0].screenX - startX;
        if (delta < -40) go(index + 1);
        if (delta > 40) go(index - 1);
        start();
      },
      { passive: true }
    );

    if (mq.addEventListener) {
      mq.addEventListener("change", function () {
        go(0);
        start();
      });
    }

    go(0);
    start();
  }

  function boot() {
    var hero = document.getElementById("hero-desktop");
    if (hero && !hero.getAttribute("src")) {
      hero.src = "/my-home-raka-lp/assets-avali/hero-img.webp";
    }

    initHighlightsSlider();

    var params = new URLSearchParams(window.location.search);
    function utmValue(key) {
      var value = params.get(key);
      return value ? value : "Website";
    }
    var source = utmValue("utm_source");
    var subSource = utmValue("utm_medium") + " - " + utmValue("utm_campaign");

    window.sell_do_form_successfully_submitted = function () {
      try {
        if (document.querySelector("#downloadModal.show")) {
          window.sessionStorage.setItem(
            "raka-lp-brochure",
            JSON.stringify({
              href: "/my-home-raka-lp/assets-avali/Brochure.pdf",
              name: "My Home Raka Brochure.pdf",
            })
          );
        }
      } catch (err) {}
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

    loadScript("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js")
      .then(function () {
        return loadScript("https://cdn.jsdelivr.net/npm/fslightbox@3.4.1/index.min.js");
      })
      .then(function () {
        try {
          if (typeof window.refreshFsLightbox === "function") window.refreshFsLightbox();
        } catch (err) {}
        return loadScript("/my-home-raka-lp/assests/app.js", true);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
