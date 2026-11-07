import Head from "next/head";
import { useEffect, useMemo, useRef } from "react";

const DESCRIPTION =
  "Discover 3 BHK flats for sale in Madinaguda, Miyapur featuring premium luxury apartments in gated communities. Explore spacious homes, modern amenities, and ready-to-move options in Hyderabad.";

const PAGE_STYLE = `
  body {
    display: block !important;
    background: #fff !important;
  }
  html:has(.raka-lp),
  body:has(.raka-lp) {
    background: #fff !important;
    margin: 0;
    color: #212529;
    overflow-x: hidden;
    overflow-y: auto !important;
    height: auto !important;
    display: block !important;
  }
  .raka-lp {
    background: #fff;
    color: #212529;
    overflow-x: hidden;
  }
  .raka-lp,
  .raka-lp h1, .raka-lp h2, .raka-lp h3, .raka-lp h4, .raka-lp h5, .raka-lp h6,
  .raka-lp p, .raka-lp span, .raka-lp li, .raka-lp a, .raka-lp button,
  .raka-lp input, .raka-lp select, .raka-lp label, .raka-lp ul, .raka-lp td, .raka-lp th {
    font-family: "PT Serif", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
  }
  .raka-lp a,
  .raka-lp a:visited {
    color: #01022e;
    text-decoration: none;
  }
  .raka-lp a:hover,
  .raka-lp a:focus {
    color: #004589;
    text-decoration: none;
  }
  .raka-lp .button-primary,
  .raka-lp .button-primary-blck,
  .raka-lp .button-primary-blck1,
  .raka-lp .button-primary-float,
  .raka-lp .btn.button-primary,
  .raka-lp .btn.button-primary-float,
  .raka-lp .float-btm-text2 a,
  .raka-lp .float-bottom a {
    color: #fff !important;
  }
  .raka-lp .header-one {
    min-height: 90px;
    background: #fff;
  }
  .raka-lp .header-one.sticky {
    background: #fff;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
  }
  .raka-lp .header-one .header-nav .row {
    align-items: center;
  }
  .raka-lp .header-one .header-menu {
    display: flex;
    align-items: center;
    min-height: 70px;
  }
  .raka-lp .header-one .header-menu > ul > li > a {
    color: #01022e !important;
  }
  .raka-lp .header-logo img,
  .raka-lp .mob-plt img,
  .raka-lp .rlogo img {
    max-width: 100%;
    height: auto;
  }
  .raka-lp .hero-banner {
    width: 100%;
    height: auto;
    display: block;
    margin-top: 100px;
  }
  .raka-lp .doso-div {
    background-color: #577486;
    background-image: url(/my-home-raka-lp/assets-avali/line-bg.webp);
    background-size: cover;
    background-repeat: repeat-x;
    background-position: center;
  }
  .raka-lp .dos-txt { height: 100%; color: #fff; }
  .raka-lp .dos-txt a { color: #fff !important; }
  .raka-lp section,
  .raka-lp h2 { scroll-margin-top: 130px; }
  .raka-lp .part,
  .raka-lp .prem,
  .raka-lp .ftp-end,
  .raka-lp .cald {
    color: #004589 !important;
    text-align: center;
  }
  .raka-lp .hmep {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 180px;
    padding: 8px 10px;
  }
  .raka-lp .hmep .feature-icon,
  .raka-lp .hmep .icon-shape {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  .raka-lp .hmep .icon-shape img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    display: block;
    margin: 0 auto 10px;
  }
  .raka-lp .hmep .feature-content {
    width: 100%;
    min-height: 3.2em;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .raka-lp .hmep p {
    color: #212529 !important;
    margin: 0 !important;
    line-height: 1.35;
    text-align: center;
  }
  .raka-lp .highlights-row {
    justify-content: center;
  }
  .raka-lp .round-sec .button-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .raka-lp #pricingtable td,
  .raka-lp #pricingtable th {
    vertical-align: middle !important;
  }
  .raka-lp .unlock,
  .raka-lp .unlock:visited,
  .raka-lp .unlock:hover,
  .raka-lp .unlock:focus {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    gap: 8px;
    white-space: nowrap;
    line-height: 1.2;
    min-height: 0 !important;
    height: auto !important;
    padding: 8px 14px !important;
    color: #fff !important;
  }
  .raka-lp .unlock .icon-svg {
    width: 18px !important;
    height: 18px !important;
    flex: 0 0 18px;
    display: inline-block !important;
    fill: #fff !important;
    color: #fff !important;
  }
  .raka-lp .sticky-brochure-right {
    position: fixed;
    top: 50%;
    right: 0;
    z-index: 110;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    writing-mode: vertical-rl;
    transform: translateY(-50%) rotate(180deg);
    background: #004589;
    color: #fff !important;
    text-decoration: none !important;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: 1.2;
    white-space: nowrap;
    padding: 18px 12px;
    border: none;
    border-radius: 4px 0 0 4px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
    cursor: pointer;
  }
  .raka-lp .sticky-brochure-right:hover,
  .raka-lp .sticky-brochure-right:focus {
    background: #003366;
    color: #fff !important;
    text-decoration: none !important;
  }
  @media (max-width: 767.98px) {
    .raka-lp .sticky-brochure-right {
      top: auto;
      bottom: 72px;
      right: 10px;
      writing-mode: horizontal-tb;
      transform: none;
      border-radius: 4px;
      padding: 12px 14px;
      font-size: 12px;
      letter-spacing: 0.04em;
    }
  }
  .raka-lp .footer-new {
    width: 80% !important;
    max-width: 80% !important;
    margin: 0 auto !important;
    padding: 48px 0 56px !important;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    box-sizing: border-box;
  }
  .raka-lp .footer-new .footer-inner,
  .raka-lp .footer-new .container-fluid {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding-left: 24px !important;
    padding-right: 24px !important;
    box-sizing: border-box;
  }
  .raka-lp .footer-new .footer-brand-row {
    margin-bottom: 18px;
  }
  .raka-lp .footer-new img.footer-logo {
    padding: 0 !important;
    margin: 0;
    width: 140px !important;
    max-width: 140px;
    height: auto !important;
    display: block;
  }
  .raka-lp .footer-new .footer-main-row {
    align-items: flex-start !important;
    margin-left: -12px;
    margin-right: -12px;
  }
  .raka-lp .footer-new .footer-col {
    text-align: left;
    padding-left: 12px;
    padding-right: 12px;
    margin-bottom: 24px;
  }
  .raka-lp .footer-new h5 {
    margin: 0 0 10px;
    font-size: 20px;
    font-weight: 700;
    color: #01022e;
  }
  .raka-lp .footer-new p {
    margin: 0 0 18px;
    line-height: 1.55;
    color: #212529;
  }
  .raka-lp .footer-new .icon-svg,
  .raka-lp .footer-new p .icon-svg {
    display: inline-block !important;
    width: 16px !important;
    height: 16px !important;
    vertical-align: -3px;
    margin-right: 6px;
    flex-shrink: 0;
  }
  .raka-lp .footer-new p.text-left {
    text-align: left;
  }
  .raka-lp .footer-new p.text-left a {
    display: inline;
    vertical-align: baseline;
  }
  .raka-lp .hmep .icon-shape,
  .raka-lp .hmep .feature-icon {
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  .raka-lp .hmep .icon-shape img {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
  .raka-lp .footer-new .social-ft-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .raka-lp .footer-new .social-ft-links > li {
    display: inline-flex;
    margin: 0;
    padding: 0;
  }
  .raka-lp .footer-new .social-ft-links img {
    display: block;
    width: 32px;
    height: 32px;
  }
  .raka-lp .footer-new .fformm {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    padding: 16px;
    margin: 0;
  }
  .raka-lp .floor-slider .slider-prev,
  .raka-lp .floor-slider .slider-next {
    position: absolute;
    top: 45%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    padding: 0;
    z-index: 2;
    cursor: pointer;
    line-height: 0;
  }
  .raka-lp .floor-slider .slider-prev { left: 0; }
  .raka-lp .floor-slider .slider-next { right: 0; }
  .raka-lp .highlights-shell {
    position: relative;
  }
  .raka-lp .highlights-viewport {
    overflow: hidden;
    width: 100%;
  }
  .raka-lp .highlights-row {
    align-items: stretch;
  }
  .raka-lp .highlights-nav {
    display: none;
  }
  .raka-lp .highlights-dots {
    display: none;
  }
  .raka-lp .custom-slider,
  .raka-lp .custom-slider1,
  .raka-lp .floor-slider {
    position: relative;
  }
  .raka-lp .custom-slider .slider-prev,
  .raka-lp .custom-slider .slider-next,
  .raka-lp .custom-slider1 .slider-prev,
  .raka-lp .custom-slider1 .slider-next {
    position: absolute;
    top: 45%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    padding: 0;
    z-index: 2;
    cursor: pointer;
    line-height: 0;
  }
  .raka-lp .custom-slider .slider-prev,
  .raka-lp .custom-slider1 .slider-prev { left: 0; }
  .raka-lp .custom-slider .slider-next,
  .raka-lp .custom-slider1 .slider-next { right: 0; }
  .raka-lp .custom-slider .slider-prev img,
  .raka-lp .custom-slider .slider-next img,
  .raka-lp .custom-slider1 .slider-prev img,
  .raka-lp .custom-slider1 .slider-next img,
  .raka-lp .floor-slider .slider-prev img,
  .raka-lp .floor-slider .slider-next img {
    height: 40px;
    width: auto;
    display: block;
  }
  .raka-lp .slider-prev,
  .raka-lp .slider-next,
  .raka-lp .highlights-nav button {
    color: inherit !important;
  }
  @media (max-width: 767.98px) {
    .raka-lp { padding-bottom: 72px; }
    .raka-lp .floating-btn { display: none !important; }
    .raka-lp .header-one .header-menu {
      overflow: visible;
      width: 100%;
    }
    .raka-lp .header-one #main-menu {
      white-space: normal;
    }
    .raka-lp .header-one .header-menu > ul > li > a {
      color: #01022e !important;
      text-decoration: none;
      padding: 2px 6px;
    }
    .raka-lp .highlights-shell {
      padding: 0 42px;
    }
    .raka-lp .highlights-row {
      flex-wrap: nowrap !important;
      width: 100%;
      margin-left: 0 !important;
      margin-right: 0 !important;
      transition: transform 0.45s ease;
    }
    .raka-lp .highlights-row > [class*="col-"] {
      flex: 0 0 100% !important;
      width: 100% !important;
      max-width: 100% !important;
      padding-left: 8px;
      padding-right: 8px;
    }
    .raka-lp .highlights-nav {
      display: block;
    }
    .raka-lp .highlights-nav button {
      position: absolute;
      top: 42%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      padding: 0;
      z-index: 3;
      cursor: pointer;
      line-height: 0;
    }
    .raka-lp .highlights-nav .slider-prev { left: 0; }
    .raka-lp .highlights-nav .slider-next { right: 0; }
    .raka-lp .highlights-nav img {
      height: 36px;
      width: auto;
      display: block;
    }
    .raka-lp .highlights-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin: 8px 0 18px;
    }
    .raka-lp .highlights-dots span {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #ccc;
      cursor: pointer;
    }
    .raka-lp .highlights-dots .active { background: #004589; }
    .raka-lp .hmep { min-height: 160px; }
    .raka-lp .hmep p { font-size: 18px !important; }
  }
  @media (min-width: 768px) {
    .raka-lp .highlights-row > [class*="col-"] {
      flex: 0 0 25%;
      max-width: 25%;
    }
  }
`;

export default function RakaShell({ title, canonical, styles, html, onReady }) {
  const rootRef = useRef(null);
  const markup = useMemo(() => (html || "").trim(), [html]);

  useEffect(() => {
    if (!markup || !onReady) return undefined;
    let cleanup;
    try {
      cleanup = onReady();
    } catch (err) {
      console.error("raka-lp onReady failed", err);
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
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content="/my-home-raka-lp/assets-avali/logo.webp" />
        <link rel="shortcut icon" href="https://www.myhomeconstructions.com/images/favicon.ico" />
        {styles.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        <style>{PAGE_STYLE}</style>
      </Head>
      <div
        ref={rootRef}
        className="raka-lp"
        style={{ minHeight: "100vh", background: "#fff" }}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </>
  );
}
