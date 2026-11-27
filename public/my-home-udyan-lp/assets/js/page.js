(function () {
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function loadScript(src, attrs) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      if (attrs) Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
      s.onload = resolve;
      s.onerror = resolve;
      document.body.appendChild(s);
    });
  }

  onReady(function () {
    var header = document.querySelector('.main-header');
    if (header) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
      }, { passive: true });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      });
    });

    document.querySelectorAll('.yt-facade').forEach(function (el) {
      el.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        var height = window.innerWidth < 768 ? 233 : 550;
        var iframe = document.createElement('iframe');
        iframe.width = '100%';
        iframe.height = String(height);
        iframe.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1';
        iframe.title = 'YouTube video player';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        iframe.style.width = '100%';
        iframe.style.height = height + 'px';
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        this.replaceWith(iframe);
      });
    });

    if (window.Fancybox) {
      Fancybox.bind('[data-fancybox]', {});
    }

    if (window.jQuery) {
      window.jQuery('.owl-carousel').owlCarousel({
        loop: true,
        margin: 20,
        nav: true,
        autoplay: true,
        lazyLoad: true,
        lazyLoadEager: 1,
        responsive: {
          0: { items: 1 },
          600: { items: 2 },
          1000: { items: 3 }
        }
      });
    }

    if (window.bootstrap) {
      document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
        new bootstrap.Tooltip(el);
      });

      document.addEventListener('click', function (e) {
        var button = e.target.closest('.accordion-button[data-bs-target]');
        if (!button) return;
        var specsSection = document.getElementById('specs');
        if (!specsSection || !specsSection.contains(button)) return;
        e.preventDefault();
        e.stopPropagation();
        var target = document.querySelector(button.getAttribute('data-bs-target'));
        if (!target) return;
        var accordion = target.closest('.accordion');
        if (!accordion) return;
        var isOpen = target.classList.contains('show');
        if (isOpen) {
          button.classList.add('collapsed');
          button.setAttribute('aria-expanded', 'false');
          (bootstrap.Collapse.getInstance(target) || new bootstrap.Collapse(target, { toggle: false })).hide();
        } else {
          accordion.querySelectorAll('.accordion-collapse').forEach(function (panel) {
            if (panel !== target && panel.classList.contains('show')) {
              (bootstrap.Collapse.getInstance(panel) || new bootstrap.Collapse(panel, { toggle: false })).hide();
            }
          });
          accordion.querySelectorAll('.accordion-button[data-bs-target]').forEach(function (btn) {
            if (btn !== button) {
              btn.classList.add('collapsed');
              btn.setAttribute('aria-expanded', 'false');
            }
          });
          button.classList.remove('collapsed');
          button.setAttribute('aria-expanded', 'true');
          (bootstrap.Collapse.getInstance(target) || new bootstrap.Collapse(target, { toggle: false })).show();
        }
      }, true);
    }

    // Clubhouse slider is handled by inline-boot.js (uses .slide-item).
    // Do not bind a second handler here — it fights the boot slider.
  });

  function injectSellDo(container) {
    /* Native CRM forms are mounted by bindUdyanCrmForm — skip Sell.do. */
    if (container) container.setAttribute('data-loaded', '1');
  }

  onReady(function () {
    var footerSlot = document.querySelector('.selldo-slot-footer');
    if (footerSlot && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            injectSellDo(footerSlot);
            io.disconnect();
          }
        });
      }, { rootMargin: '200px' });
      io.observe(footerSlot);
    } else if (footerSlot) {
      injectSellDo(footerSlot);
    }

    document.querySelectorAll('#DownloadBrochure, #EnquireNow').forEach(function (modal) {
      modal.addEventListener('show.bs.modal', function () {
        injectSellDo(modal.querySelector('.selldo-slot'));
      });
    });
  });

  window.sell_do_form_rendered = function () {
    if (window.jQuery) {
      window.jQuery('.sell_do_form_actual_container').append('<input type="hidden" value="69b11cfea3d85572bbfd351c" name="sell_do[campaign][srd]">');
    }
  };
  document.addEventListener('sell_do_form_successfully_submitted', function () {
    setTimeout(function () { window.location.href = '/thank-you'; }, 300);
  });
  document.addEventListener('sell_do_form_successfully_verified', function () {
    setTimeout(function () { window.location.href = '/thank-you'; }, 300);
  });

  var delayed = false;
  function loadDelayedThirdParty() {
    if (delayed) return;
    delayed = true;
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-M9VNDWC');

    // Livserv chat auto-launches over the banner enquire form and blocks clicks.
    // Keep it off this Next LP; sticky Enquire / Download Brochure cover CTA needs.
  }

  ['scroll', 'click', 'touchstart', 'keydown'].forEach(function (evt) {
    window.addEventListener(evt, loadDelayedThirdParty, { once: true, passive: true });
  });
  setTimeout(loadDelayedThirdParty, 12000);
})();
