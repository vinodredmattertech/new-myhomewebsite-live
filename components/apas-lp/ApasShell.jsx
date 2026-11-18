import Head from "next/head";
import { useEffect, useMemo, useRef } from "react";

const DESCRIPTION =
  "Find luxurious 3 BHK flats for sale at My Home Apas in Kokapet, Hyderabad. Enjoy upscale amenities and a prime location tailored for comfortable living.";

const PAGE_STYLE = `
  body {
    display: block !important;
    background: #fff !important;
  }
  html:has(.apas-lp),
  body:has(.apas-lp) {
    background: #fff !important;
    margin: 0;
    color: #212529;
    overflow-x: hidden;
    overflow-y: auto !important;
    height: auto !important;
    display: block !important;
  }
  .apas-lp {
    background: #fff;
    color: #212529;
    overflow-x: hidden;
    min-height: 100vh;
  }
  .apas-lp,
  .apas-lp h1, .apas-lp h2, .apas-lp h3, .apas-lp h4, .apas-lp h5, .apas-lp h6,
  .apas-lp p, .apas-lp span, .apas-lp li, .apas-lp a, .apas-lp button,
  .apas-lp input, .apas-lp select, .apas-lp label, .apas-lp ul, .apas-lp td, .apas-lp th {
    font-family: "PT Serif", "sayukfont", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
  }
  .apas-lp a,
  .apas-lp a:visited {
    text-decoration: none;
  }
  .apas-lp .button-primary,
  .apas-lp .button-primary-blck,
  .apas-lp .button-primary-blck1,
  .apas-lp .button-primary-float,
  .apas-lp .btn.button-primary,
  .apas-lp .btn.button-primary-float,
  .apas-lp .float-btm-text2 a,
  .apas-lp .float-bottom a {
    color: #fff !important;
  }
  .apas-lp .header-one {
    min-height: 90px;
    background: #fff;
  }
  .apas-lp .header-one.sticky {
    background: #fff;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
  }
  .apas-lp .apas-mobile-hero {
    margin-top: 0;
  }
  @media (max-width: 767.98px) {
    .apas-lp .header-one {
      min-height: 0;
      padding: 0;
    }
    .apas-lp .header-one .header-nav {
      padding: 8px 0 6px;
    }
    .apas-lp .header-one .header-nav .row {
      align-items: center;
    }
    .apas-lp .header-one .header-nav > .container > .row > [class*="col-"] {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 100%;
      flex: 0 0 100%;
    }
    .apas-lp .header-one .header-logo {
      flex: 0 0 auto;
      margin: 0;
    }
    .apas-lp .header-one .header-logo img {
      width: auto;
      max-height: 36px;
    }
    .apas-lp .header-one .mob-plt {
      flex: 0 0 auto;
      margin: 0;
    }
    .apas-lp .header-one .mob-plt img {
      width: auto;
      max-height: 36px;
    }
    .apas-lp .header-one .header-menu {
      overflow: visible;
      width: 100%;
      margin-top: 6px;
      flex: 0 0 100%;
    }
    .apas-lp .header-one #main-menu {
      white-space: normal;
      margin: 0;
      padding: 0;
      line-height: 1.25;
    }
    .apas-lp .header-one .header-menu > ul > li {
      margin: 0;
      padding: 0;
    }
    .apas-lp .header-one .header-menu > ul > li > a {
      color: #01022e !important;
      text-decoration: none;
      padding: 1px 5px;
      font-size: 13px;
      line-height: 1.3;
    }
    .apas-lp .apas-mobile-hero {
      margin-top: 0 !important;
    }
    .apas-lp section,
    .apas-lp h2 {
      scroll-margin-top: 110px;
    }
  }
  .apas-lp .header-logo img,
  .apas-lp .mob-plt img,
  .apas-lp .rlogo img {
    max-width: 100%;
    height: auto;
  }
  .apas-lp section,
  .apas-lp h2 {
    scroll-margin-top: 130px;
  }
  .apas-lp .modal {
    z-index: 1055;
  }
  .apas-lp .modal-backdrop {
    z-index: 1050;
  }
  .apas-lp img {
    max-width: 100%;
    height: auto;
  }
  .apas-lp .hmep .icon-shape img,
  .apas-lp .icon-shape img {
    width: 54px;
    height: 54px;
    object-fit: contain;
    display: inline-block;
  }
  .apas-lp #hero-section-one .hero-slider-item {
    min-height: 420px;
  }
  .apas-lp .footer-new .footer-contact {
    margin: 0 0 18px;
    line-height: 1.55;
  }
  .apas-lp .footer-new .footer-contact-line {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 8px;
  }
  .apas-lp .footer-new .footer-address-line {
    align-items: flex-start;
  }
  .apas-lp .footer-new .footer-contact-line .fa {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 18px;
    width: 18px;
    height: 18px;
    margin: 0;
    line-height: 1;
    font-size: 16px;
    position: relative;
    top: 0;
  }
  .apas-lp .footer-new .footer-address-line .fa {
    margin-top: 4px;
  }
  .apas-lp .footer-new .footer-contact-line a {
    display: inline;
    line-height: 1.4;
  }
  .apas-lp .footer-new .social-ft-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .apas-lp .footer-new .social-ft-links > li {
    display: inline-flex;
    margin: 0;
    padding: 0;
  }
  .apas-lp .footer-new .social-ft-links img {
    display: block;
    width: 32px;
    height: 32px;
  }
  .apas-lp .fa {
    display: inline-block;
    width: 1.2em;
    text-align: center;
  }
  .apas-lp .custom-slider,
  .apas-lp .custom-slider1,
  .apas-lp .floor-slider {
    overflow: hidden;
  }
  .apas-lp .slider-track,
  .apas-lp .slider-track1 {
    display: flex;
    transition: transform 0.4s ease;
  }
  .apas-lp .slide,
  .apas-lp .slide1 {
    min-width: 100%;
    box-sizing: border-box;
  }
  /* Project Status: equal image frames so mixed aspect ratios stay aligned. */
  .apas-lp .project-status .row {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
  }
  .apas-lp .project-status .col-md-3 {
    display: flex;
    margin-bottom: 24px;
  }
  .apas-lp .project-status .col-md-3 > a {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    color: inherit;
    text-decoration: none;
  }
  .apas-lp .project-status .col-md-3 > a > img,
  .apas-lp .project-status .col-md-3 > a > .img {
    width: 100%;
    height: 320px;
    object-fit: cover;
    object-position: center top;
    display: block;
  }
  .apas-lp .project-status .col-md-3 > a > p {
    margin: 0;
    padding: 12px 8px 0;
    text-align: center;
    line-height: 1.35;
    min-height: 3.2em;
  }
  @media (max-width: 767.98px) {
    .apas-lp .project-status .col-md-3 > a > img,
    .apas-lp .project-status .col-md-3 > a > .img {
      height: 260px;
    }
  }

  /* Floor Plans: Owl 2 emits <button> arrows; old CSS only styled <div>. */
  .apas-lp #floorplans .carousel-wrap,
  .apas-lp #floorplans .owl-carousel {
    position: relative;
  }
  .apas-lp #floorplans .owl-nav {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    /* Stop above owl-dots so 50% centers on the floor-plan images */
    bottom: 24px;
    margin: 0;
    height: auto;
    pointer-events: none;
  }
  .apas-lp #floorplans .owl-nav .owl-prev,
  .apas-lp #floorplans .owl-nav .owl-next {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    margin: 0;
    z-index: 5;
    width: 48px;
    height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 0;
    color: #577486;
    cursor: pointer;
    pointer-events: auto;
  }
  .apas-lp #floorplans .owl-nav .owl-prev {
    left: -8px;
  }
  .apas-lp #floorplans .owl-nav .owl-next {
    right: -8px;
  }
  .apas-lp #floorplans .owl-nav i {
    font-size: 48px;
    line-height: 1;
  }
`;

export default function ApasShell({ title, canonical, styles, html, onReady }) {
  const rootRef = useRef(null);
  const markup = useMemo(() => (html || "").trim(), [html]);

  useEffect(() => {
    if (!markup || !onReady) return undefined;
    let cleanup;
    try {
      cleanup = onReady();
    } catch (err) {
      console.error("apas-lp onReady failed", err);
    }
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, [markup, onReady]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content="/my-home-apas-lp/assets-avali/logo.webp" />
        <link rel="icon" type="image/webp" href="/my-home-apas-lp/assets-avali/apas-fav-icon.webp" />
        {styles.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        <style>{PAGE_STYLE}</style>
      </Head>
      <div
        ref={rootRef}
        className="apas-lp"
        style={{ minHeight: "100vh", background: "#fff" }}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </>
  );
}
