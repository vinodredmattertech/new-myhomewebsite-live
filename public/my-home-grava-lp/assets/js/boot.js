(function () {
  "use strict";

  if (window.__gravaBooted) return;
  window.__gravaBooted = true;

  var $ = window.jQuery || window.$;
  if ($) {
    try {
      var $floor = $(".grava-floor-plans-owl, .patient-owl");
      if ($floor.length) {
        $floor.each(function () {
          var el = $(this);
          if (el.hasClass("owl-loaded")) {
            try {
              el.trigger("destroy.owl.carousel");
              el.removeClass("owl-loaded owl-drag");
              el.find(".owl-stage-outer").children().unwrap();
            } catch (err) {
              /* ignore */
            }
          }
          el.owlCarousel({
            loop: false,
            margin: 16,
            nav: true,
            dots: true,
            navText: [
              "<i class='fa fa-arrow-left' aria-hidden='true'></i>",
              "<i class='fa fa-arrow-right' aria-hidden='true'></i>",
            ],
            autoplay: false,
            responsive: {
              0: { items: 1 },
              576: { items: 2 },
              992: { items: 3 },
            },
          });
        });
      }
    } catch (err) {
      /* ignore */
    }

    try {
      $(".ongoing-project").owlCarousel({
        loop: true,
        margin: 10,
        nav: false,
        autoplay: true,
        autoplayTimeout: 3000,
        autoplayHoverPause: true,
        responsive: { 0: { items: 1 }, 600: { items: 2 }, 1000: { items: 6 } },
      });
    } catch (err) {
      /* ignore */
    }

    try {
      $(".owl-carousel")
        .not(".ongoing-project")
        .not(".grava-floor-plans-owl")
        .not(".patient-owl")
        .each(function () {
          var el = $(this);
          if (el.hasClass("owl-loaded")) return;
          if (!el.children().length) return;
          el.owlCarousel({
            loop: true,
            margin: 10,
            nav: true,
            navText: [
              "<i class='fa fa-arrow-left'></i>",
              "<i class='fa fa-arrow-right'></i>",
            ],
            autoplay: true,
            autoplayHoverPause: true,
            responsive: { 0: { items: 1 }, 600: { items: 2 }, 1000: { items: 5 } },
          });
        });
    } catch (err) {
      /* ignore */
    }

    try {
      if ($.fn.slick) {
        $(".slider").slick({
          dots: false,
          arrows: false,
          autoplay: false,
          infinite: true,
          speed: 500,
          slidesToShow: 1,
          slidesToScroll: 1,
        });
      }
    } catch (err) {
      /* ignore */
    }
  }

  var acc = document.getElementsByClassName("accordion");
  for (var i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
      if (!panel) return;
      if (panel.style.maxHeight) panel.style.maxHeight = null;
      else panel.style.maxHeight = panel.scrollHeight + "px";
    });
  }

  try {
    if (typeof window.refreshFsLightbox === "function") {
      window.refreshFsLightbox();
    }
  } catch (err) {
    /* ignore */
  }
})();
