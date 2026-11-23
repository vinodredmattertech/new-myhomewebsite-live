(function () {
  "use strict";

  if (window.__apasBooted) return;
  window.__apasBooted = true;

  function initCustomSliders(rootSelector, trackSelector, slideSelector, dotsSelector) {
    document.querySelectorAll(rootSelector).forEach(function (slider) {
      var track = slider.querySelector(trackSelector);
      var slides = slider.querySelectorAll(slideSelector);
      var dotsContainer = slider.querySelector(dotsSelector);
      if (!track || !slides.length || !dotsContainer) return;
      if (slider.getAttribute("data-slider-inited") === "1") return;
      slider.setAttribute("data-slider-inited", "1");

      var index = 0;
      dotsContainer.innerHTML = "";
      slides.forEach(function (_, i) {
        var dot = document.createElement("span");
        if (i === 0) dot.className = "active";
        dot.addEventListener("click", function () {
          moveTo(i);
        });
        dotsContainer.appendChild(dot);
      });
      var dots = dotsContainer.querySelectorAll("span");

      function loadSlideImage(slide) {
        var img = slide.querySelector("img[data-src]");
        if (!img) return;
        img.src = img.getAttribute("data-src");
        img.removeAttribute("data-src");
      }

      function moveTo(i) {
        index = (i + slides.length) % slides.length;
        loadSlideImage(slides[index]);
        loadSlideImage(slides[(index + 1) % slides.length]);
        track.style.transform = "translateX(-" + index * 100 + "%)";
        dots.forEach(function (dot) {
          dot.classList.remove("active");
        });
        if (dots[index]) dots[index].classList.add("active");
      }

      moveTo(0);
      var timer = setInterval(function () {
        moveTo(index + 1);
      }, 4000);

      slider.addEventListener("mouseenter", function () {
        clearInterval(timer);
      });
      slider.addEventListener("mouseleave", function () {
        timer = setInterval(function () {
          moveTo(index + 1);
        }, 4000);
      });

      var startX = 0;
      track.addEventListener(
        "touchstart",
        function (e) {
          startX = e.changedTouches[0].screenX;
        },
        { passive: true }
      );
      track.addEventListener(
        "touchend",
        function (e) {
          var delta = e.changedTouches[0].screenX - startX;
          if (delta < -40) moveTo(index + 1);
          if (delta > 40) moveTo(index - 1);
        },
        { passive: true }
      );

      var prev = slider.querySelector(".slider-prev, .prev");
      var next = slider.querySelector(".slider-next, .next");
      if (prev)
        prev.addEventListener("click", function () {
          moveTo(index - 1);
        });
      if (next)
        next.addEventListener("click", function () {
          moveTo(index + 1);
        });
    });
  }

  initCustomSliders(".custom-slider", ".slider-track", ".slide", ".dotss");
  initCustomSliders(".custom-slider1", ".slider-track1", ".slide1", ".dots1");
  initCustomSliders(".floor-slider", ".slider-track1", ".slide1, .item", ".dots1");

  // Top hero-style slider with .slider-track / .slide / .dots (not nested in .custom-slider)
  (function () {
    var track = document.querySelector(".apas-lp .slider-track");
    var slides = document.querySelectorAll(".apas-lp .slide");
    var prev = document.querySelector(".apas-lp .prev");
    var next = document.querySelector(".apas-lp .next");
    var dotsContainer = document.querySelector(".apas-lp .dots");
    if (!track || !slides.length || !dotsContainer) return;
    if (track.getAttribute("data-slider-inited") === "1") return;
    if (track.closest(".custom-slider, .custom-slider1, .floor-slider")) return;
    track.setAttribute("data-slider-inited", "1");

    var index = 0;
    dotsContainer.innerHTML = "";
    slides.forEach(function (_, i) {
      var dot = document.createElement("span");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", function () {
        goToSlide(i);
      });
      dotsContainer.appendChild(dot);
    });
    var dots = dotsContainer.querySelectorAll("span");

    function goToSlide(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      dots.forEach(function (dot) {
        dot.classList.remove("active");
      });
      if (dots[index]) dots[index].classList.add("active");
    }

    if (prev)
      prev.addEventListener("click", function () {
        goToSlide(index - 1);
      });
    if (next)
      next.addEventListener("click", function () {
        goToSlide(index + 1);
      });
    setInterval(function () {
      goToSlide(index + 1);
    }, 4000);
  })();

  document.querySelectorAll(".apas-lp .accordion-header").forEach(function (header) {
    header.addEventListener("click", function () {
      var content = this.nextElementSibling;
      if (!content || !content.classList.contains("accordion-content")) return;
      document.querySelectorAll(".apas-lp .accordion-content").forEach(function (item) {
        if (item !== content) item.style.maxHeight = null;
      });
      document.querySelectorAll(".apas-lp .accordion-header").forEach(function (h) {
        if (h !== header) h.classList.remove("active");
      });
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
        header.classList.remove("active");
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
        header.classList.add("active");
      }
    });
  });

  // Lazy images
  (function () {
    var lazyImages = document.querySelectorAll(".apas-lp .lazy-load");
    if (!("IntersectionObserver" in window)) {
      lazyImages.forEach(function (img) {
        if (img.dataset.src) img.src = img.dataset.src;
      });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
          }
          img.classList.remove("lazy-load");
          obs.unobserve(img);
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.25 }
    );
    lazyImages.forEach(function (img) {
      observer.observe(img);
    });
  })();

  function whenJquery(cb) {
    if (window.jQuery) {
      cb(window.jQuery);
      return;
    }
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      if (window.jQuery) {
        clearInterval(timer);
        cb(window.jQuery);
      } else if (tries > 40) {
        clearInterval(timer);
      }
    }, 100);
  }

  whenJquery(function ($) {
    try {
      if ($(".apas-lp .ongoing-project").length && $.fn.owlCarousel) {
        $(".apas-lp .ongoing-project").owlCarousel({
          loop: true,
          margin: 10,
          nav: false,
          autoplay: true,
          autoplayTimeout: 3000,
          autoplayHoverPause: true,
          responsive: { 0: { items: 1 }, 600: { items: 2 }, 1000: { items: 6 } },
        });
      }
    } catch (err) {
      /* ignore */
    }

    try {
      if ($(".apas-lp #owl-carousel2").length && $.fn.owlCarousel) {
        $(".apas-lp #owl-carousel2").owlCarousel({
          loop: true,
          margin: 10,
          nav: true,
          navText: [
            "<i class='fa fa-caret-left'></i>",
            "<i class='fa fa-caret-right'></i>",
          ],
          autoplay: true,
          autoplayHoverPause: true,
          responsive: { 0: { items: 1 }, 600: { items: 3 }, 1000: { items: 3 } },
        });
      }
    } catch (err) {
      /* ignore */
    }

    try {
      if ($(".apas-lp .slick-carousel").length && $.fn.slick) {
        $(".apas-lp .slick-carousel").slick({
          infinite: false,
          slidesToShow: 5,
          slidesToScroll: 1,
          arrows: true,
          dots: false,
          responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1 } },
          ],
        });
      }
    } catch (err) {
      /* ignore */
    }

    $(window).on("scroll.apasBackTop", function () {
      if ($(window).scrollTop() > 600) {
        $("#back-to-top").addClass("show");
      } else {
        $("#back-to-top").removeClass("show");
      }
    });
    $("#back-to-top").on("click.apasBackTop", function () {
      $("html,body").animate({ scrollTop: "0" });
    });

    $(".apas-lp section a[href^='#']").on("click.apasScroll", function (e) {
      var target = $(this).attr("href");
      if (!target || target === "#") return;
      var $el = $(target);
      if (!$el.length) return;
      e.preventDefault();
      $("html, body").animate({
        scrollTop: $el.offset().top - 100,
      });
    });
  });

  // Lead forms are native HTML (mounted by bindApasCrmForm). Sell.do
  // form scripts are no longer injected on this LP.
})();
