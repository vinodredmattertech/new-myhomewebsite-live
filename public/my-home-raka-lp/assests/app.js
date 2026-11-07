(function () {
  'use strict';

  function initSlider(slider, trackSelector, slideSelector, dotsSelector) {
    var track = slider.querySelector(trackSelector);
    var slides = slider.querySelectorAll(slideSelector);
    var dotsContainer = slider.querySelector(dotsSelector);
    if (!track || !slides.length || !dotsContainer) return;
    if (slider.getAttribute('data-slider-inited') === '1') return;
    slider.setAttribute('data-slider-inited', '1');

    var index = 0;
    var startX = 0;
    var deltaX = 0;

    dotsContainer.innerHTML = '';
    slides.forEach(function (_, i) {
      var dot = document.createElement('span');
      if (i === 0) dot.className = 'active';
      dot.addEventListener('click', function () { moveTo(i); });
      dotsContainer.appendChild(dot);
    });

    var dots = dotsContainer.querySelectorAll('span');

    function loadSlideImage(slide) {
      var img = slide.querySelector('img[data-src]');
      if (!img) return;
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    }

    function moveTo(i) {
      index = (i + slides.length) % slides.length;
      loadSlideImage(slides[index]);
      loadSlideImage(slides[(index + 1) % slides.length]);
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      dots.forEach(function (dot) { dot.classList.remove('active'); });
      if (dots[index]) dots[index].classList.add('active');
    }

    moveTo(0);

    var timer = setInterval(function () {
      moveTo(index + 1);
    }, 4000);

    slider.addEventListener('mouseenter', function () { clearInterval(timer); });
    slider.addEventListener('mouseleave', function () {
      timer = setInterval(function () { moveTo(index + 1); }, 4000);
    });

    track.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].screenX;
      deltaX = 0;
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
      deltaX = e.changedTouches[0].screenX - startX;
      if (deltaX < -40) moveTo(index + 1);
      if (deltaX > 40) moveTo(index - 1);
    }, { passive: true });

    var prev = slider.querySelector('.slider-prev');
    var next = slider.querySelector('.slider-next');
    if (prev) prev.addEventListener('click', function () { moveTo(index - 1); });
    if (next) next.addEventListener('click', function () { moveTo(index + 1); });
  }

  function watchSliders(selector, trackSelector, slideSelector, dotsSelector) {
    document.querySelectorAll(selector).forEach(function (slider) {
      initSlider(slider, trackSelector, slideSelector, dotsSelector);
    });
  }

  watchSliders('.custom-slider', '.slider-track', '.slide', '.dotss');
  watchSliders('.custom-slider1', '.slider-track1', '.slide1', '.dots1');
  watchSliders('.floor-slider', '.slider-track1', '.slide1, .item', '.dots1');

  document.querySelectorAll('.accordion-header').forEach(function (header) {
    header.addEventListener('click', function () {
      var content = this.nextElementSibling;
      if (!content || !content.classList.contains('accordion-content')) return;
      document.querySelectorAll('.distance-section .accordion-content').forEach(function (item) {
        if (item !== content) item.style.maxHeight = null;
      });
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  document.querySelectorAll('.video-facade').forEach(function (facade) {
    facade.addEventListener('click', function () {
      if (facade.getAttribute('data-playing') === '1') return;
      var src = facade.getAttribute('data-src');
      if (!src) return;
      var video = document.createElement('video');
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('width', '100%');
      var source = document.createElement('source');
      source.src = src;
      source.type = 'video/mp4';
      video.appendChild(source);
      facade.innerHTML = '';
      facade.appendChild(video);
      facade.setAttribute('data-playing', '1');
      video.play().catch(function () {});
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var header = document.querySelector('.header-one');
      var offset = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  var sellDoFormSrc = '//forms.cdn.sell.do/t/forms/60d5d009ed23e9203e3db96c/6375f564ed23e96f680c36d2.js';
  var sellDoFormId = '6375f564ed23e96f680c36d2';
  var thirdPartyLoaded = false;

  function injectSellDo(slot) {
    if (!slot || slot.getAttribute('data-loaded') === '1') return;
    slot.setAttribute('data-loaded', '1');
    var s = document.createElement('script');
    s.src = sellDoFormSrc;
    s.setAttribute('data-form-id', sellDoFormId);
    slot.appendChild(s);
  }

  function loadThirdParty() {
    if (thirdPartyLoaded) return;
    thirdPartyLoaded = true;

    document.querySelectorAll('.selldo-eager').forEach(injectSellDo);

    var gtm = document.createElement('script');
    gtm.async = true;
    gtm.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-M9VNDWC';
    document.head.appendChild(gtm);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

    var track = document.createElement('script');
    track.src = '//forms.cdn.sell.do/t/60d5d009ed23e9203e3db96c.js';
    track.async = true;
    document.body.appendChild(track);

    var chat1 = document.createElement('script');
    chat1.src = 'https://cwc.livserv.in/chat.js?lid=1488';
    chat1.id = 'lp_cwc_xqzyihjdskw';
    chat1.async = true;
    document.body.appendChild(chat1);

    var chat2 = document.createElement('script');
    chat2.src = 'https://cw1.livserv.in?did=1488&ampid=1';
    chat2.async = true;
    document.body.appendChild(chat2);
  }

  ['scroll', 'click', 'touchstart', 'keydown', 'mousemove'].forEach(function (evt) {
    window.addEventListener(evt, loadThirdParty, { once: true, passive: true });
  });
  setTimeout(loadThirdParty, 12000);

  document.querySelectorAll('.modal').forEach(function (modal) {
    modal.addEventListener('show.bs.modal', function () {
      loadThirdParty();
      injectSellDo(modal.querySelector('.selldo-slot'));
    });
  });
})();
