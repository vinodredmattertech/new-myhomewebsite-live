import Head from "next/head";
import { useEffect, useMemo, useRef } from "react";

const DESCRIPTION =
  "Discover 4 BHK luxury flats and apartments at Neopolis, Kokapet with My Home Grava. Enjoy sophisticated living with premium amenities in a prime location.";

const PAGE_STYLE = `
  body {
    display: block !important;
    background: #fff !important;
  }
  html:has(.grava-lp),
  body:has(.grava-lp) {
    background: #fff !important;
    margin: 0;
    color: #212529;
    overflow-x: hidden;
    overflow-y: auto !important;
    height: auto !important;
    display: block !important;
  }
  .grava-lp {
    background: #fff;
    color: #212529;
    overflow-x: hidden;
  }
  /* Stop global Next/Tailwind fonts from wiping LP brand type */
  .grava-lp,
  .grava-lp p,
  .grava-lp span,
  .grava-lp li,
  .grava-lp a,
  .grava-lp label,
  .grava-lp input,
  .grava-lp select,
  .grava-lp button,
  .grava-lp td,
  .grava-lp th {
    font-family: PTSerif, "PT Serif", Georgia, serif;
  }
  .grava-lp h1,
  .grava-lp h2,
  .grava-lp h3,
  .grava-lp h4,
  .grava-lp h5,
  .grava-lp h6,
  .grava-lp .myhome-headings h2,
  .grava-lp .cald {
    font-family: CabinetGrotesk-Bold, "Cabinet Grotesk", PTSerif, serif !important;
  }
  /* Default readable body/heading colors on light sections.
     Do NOT force inherit — that erased brand colors from style.css. */
  .grava-lp .myhome-headings h2,
  .grava-lp .myhome-caption p,
  .grava-lp #about h2,
  .grava-lp #amenities h2,
  .grava-lp #floor-plans h2,
  .grava-lp #price h2,
  .grava-lp #location h2,
  .grava-lp #gallery h2,
  .grava-lp .project-status h2,
  .grava-lp .project-status .cald {
    color: #01022e !important;
  }
  .grava-lp .myhome-caption p,
  .grava-lp #about p,
  .grava-lp #location p,
  .grava-lp .am-content p,
  .grava-lp .lp-project-status-card p,
  .grava-lp .project-status .lp-project-status-asof,
  .grava-lp .accordion-body,
  .grava-lp .accordion-body li,
  .grava-lp .accordion-button {
    color: #333 !important;
  }
  /* Dark clubhouse panel — keep white text */
  .grava-lp .doso,
  .grava-lp .doso-div,
  .grava-lp .dos-txt,
  .grava-lp .dos-txt p,
  .grava-lp .dos-txt h2,
  .grava-lp .doso h2,
  .grava-lp .doso p,
  .grava-lp .cont-txt {
    color: #fff !important;
  }
  /* Specs heading sits on photo bg — keep white + shadow so it stays readable */
  .grava-lp .specs {
    background-color: #1a1a18;
    background-size: cover !important;
  }
  .grava-lp .specs > .myhome-headings h2,
  .grava-lp .specs h2[style*="color"] {
    color: #fff !important;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.55);
  }
  .grava-lp .specs .accordion-button {
    color: #1a1a18 !important;
  }
  .grava-lp .specs .accordion-body,
  .grava-lp .specs .accordion-body li {
    color: #333 !important;
  }
  /* Blue enquire / footer form strip */
  .grava-lp .fform,
  .grava-lp .fform p,
  .grava-lp .fform label,
  .grava-lp .fform span,
  .grava-lp .fform .grava-lead-consent,
  .grava-lp .fform .grava-lead-dial,
  .grava-lp .modal-body .grava-lead-consent,
  .grava-lp .modal-body .grava-lead-dial {
    color: #fff !important;
  }
  .grava-lp .fform .grava-lead-field input,
  .grava-lp .fform .grava-lead-field textarea,
  .grava-lp .fform .grava-lead-phone input,
  .grava-lp .fform .grava-lead-country,
  .grava-lp .fform .grava-lead-country option,
  .grava-lp .modal .grava-lead-field input,
  .grava-lp .modal .grava-lead-field textarea,
  .grava-lp .modal .grava-lead-phone input,
  .grava-lp .modal .grava-lead-country,
  .grava-lp .modal .grava-lead-country option {
    color: #222 !important;
    -webkit-text-fill-color: #222 !important;
    background-color: #fff !important;
    caret-color: #222 !important;
  }
  .grava-lp .fform .grava-lead-country,
  .grava-lp .modal .grava-lead-country {
    background-color: #f3f6f9 !important;
  }
  .grava-lp .fform .grava-lead-field input::placeholder,
  .grava-lp .fform .grava-lead-field textarea::placeholder,
  .grava-lp .fform .grava-lead-phone input::placeholder,
  .grava-lp .modal .grava-lead-field input::placeholder,
  .grava-lp .modal .grava-lead-field textarea::placeholder,
  .grava-lp .modal .grava-lead-phone input::placeholder {
    color: #6b7280 !important;
    -webkit-text-fill-color: #6b7280 !important;
    opacity: 1 !important;
  }
  .grava-lp .unlock,
  .grava-lp .unlock-price tr:nth-child(1),
  .grava-lp .unlock-price tr:nth-child(2),
  .grava-lp .unlock-price tr:nth-child(1) td,
  .grava-lp .unlock-price tr:nth-child(2) td,
  .grava-lp .unlock-price tr:nth-child(1) th,
  .grava-lp .unlock-price tr:nth-child(2) th {
    color: #fff !important;
  }
  .grava-lp a,
  .grava-lp a:visited {
    text-decoration: none;
  }
  .grava-lp .button-primary,
  .grava-lp .button-primary-float,
  .grava-lp .btn.button-primary,
  .grava-lp .btn.button-primary-float,
  .grava-lp .float-bottom a,
  .grava-lp .float-btm-text2,
  .grava-lp .float-btm-text2 a {
    color: #fff !important;
  }
  .grava-lp .footer-new,
  .grava-lp .footer-new p,
  .grava-lp .footer-new a,
  .grava-lp .footer-new h5,
  .grava-lp .footer-new li {
    color: #1a1a18 !important;
  }
  .grava-lp section,
  .grava-lp h2 {
    scroll-margin-top: 120px;
  }

  /* Banner enquire form — right overlay (desktop) / stacked (mobile), aligned with Raka */
  .grava-lp #main-banner.banner_section {
    position: relative;
    overflow: hidden;
  }
  .grava-lp #main-banner .grava-banner-form-overlay {
    position: absolute;
    inset: 0;
    z-index: 20;
    align-items: center;
    justify-content: flex-end;
    padding: 100px 48px 30px;
    pointer-events: none;
  }
  .grava-lp #main-banner .grava-banner-form-card {
    pointer-events: auto;
    width: 360px;
    max-width: 100%;
  }
  .grava-lp #main-banner .grava-banner-form.fform,
  .grava-lp .grava-mobile-banner-form-wrap .grava-banner-form.fform {
    background: #2a51a3 !important;
    color: #fff !important;
    border-radius: 10px;
    padding: 22px 24px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
  }
  .grava-lp #main-banner .grava-banner-form .form_heading,
  .grava-lp .grava-mobile-banner-form-wrap .grava-banner-form .form_heading {
    color: #fff !important;
    font-size: 1.35rem;
    font-weight: 700;
    margin: 0 0 14px;
    letter-spacing: 0.04em;
  }
  .grava-lp #main-banner .grava-banner-form .grava-lead-form,
  .grava-lp .grava-mobile-banner-form-wrap .grava-banner-form .grava-lead-form {
    gap: 10px;
  }
  .grava-lp #main-banner .grava-banner-form .grava-lead-field input,
  .grava-lp #main-banner .grava-banner-form .grava-lead-field textarea,
  .grava-lp #main-banner .grava-banner-form .grava-lead-phone,
  .grava-lp .grava-mobile-banner-form-wrap .grava-banner-form .grava-lead-field input,
  .grava-lp .grava-mobile-banner-form-wrap .grava-banner-form .grava-lead-field textarea,
  .grava-lp .grava-mobile-banner-form-wrap .grava-banner-form .grava-lead-phone {
    border-radius: 8px;
  }
  .grava-lp #main-banner .grava-banner-form .grava-lead-country,
  .grava-lp .grava-mobile-banner-form-wrap .grava-banner-form .grava-lead-country {
    border-radius: 8px 0 0 8px;
  }
  .grava-lp #main-banner .grava-banner-form .grava-lead-submit,
  .grava-lp .grava-mobile-banner-form-wrap .grava-banner-form .grava-lead-submit {
    width: 100%;
    background: #e57213;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 1.05rem;
  }
  .grava-lp #main-banner .grava-banner-form .grava-lead-status.is-error,
  .grava-lp .grava-mobile-banner-form-wrap .grava-banner-form .grava-lead-status.is-error {
    color: #ffe0e0;
  }
  .grava-lp .grava-mobile-banner-form-wrap {
    padding: 0;
    margin: 0;
  }
  .grava-lp .grava-mobile-banner-form-wrap .grava-banner-form.fform {
    border-radius: 0;
    box-shadow: none;
    padding: 22px 16px 26px;
  }
  @media (max-width: 1199px) and (min-width: 768px) {
    .grava-lp #main-banner .grava-banner-form-overlay {
      padding-right: 24px;
    }
    .grava-lp #main-banner .grava-banner-form-card {
      width: 320px;
    }
  }

  /* Header: logos + menu on one aligned row */
  .grava-lp .header-one {
    min-height: 88px;
    background: #fff !important;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
  }
  .grava-lp .header-one.sticky,
  .grava-lp .header-one.sticky.active {
    background: #fff !important;
  }
  .grava-lp .header-one .header-nav {
    padding: 8px 0;
    background: transparent !important;
    background-image: none !important;
  }
  .grava-lp .header-one .header-nav > .container {
    max-width: 1320px;
  }
  .grava-lp .header-one .header-nav .row {
    align-items: center !important;
    flex-wrap: nowrap !important;
  }
  .grava-lp .header-one .header-nav > .container > .row > .col-md-3 {
    flex: 0 0 160px;
    max-width: 160px;
    width: 160px;
  }
  .grava-lp .header-one .header-nav > .container > .row > .col-md-7 {
    flex: 1 1 auto;
    max-width: none;
    width: auto;
  }
  .grava-lp .header-one .header-nav > .container > .row > .col-md-2 {
    flex: 0 0 120px;
    max-width: 120px;
    width: 120px;
  }
  .grava-lp .header-one .header-logo,
  .grava-lp .header-one .rlogo {
    display: flex;
    align-items: center;
    margin: 0;
  }
  .grava-lp .header-one .header-logo img {
    width: auto !important;
    max-width: 140px;
    max-height: 58px;
    height: auto;
  }
  .grava-lp .header-one .rlogo {
    list-style: none;
    margin: 0;
    padding: 0;
    justify-content: flex-end;
  }
  .grava-lp .header-one .rlogo img {
    width: auto !important;
    max-width: 100px;
    max-height: 48px;
    height: auto;
  }
  .grava-lp .header-one .header-menu {
    float: none !important;
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 58px;
    overflow: visible !important;
    margin: 0;
  }
  /* Desktop menu only — keep Bootstrap d-none / d-md-block behavior */
  @media (min-width: 768px) {
    .grava-lp .header-one .header-menu > ul.d-none.d-md-block {
      display: flex !important;
      flex-wrap: nowrap !important;
      align-items: center;
      justify-content: center;
      gap: 0;
      width: 100%;
      margin: 0 !important;
      padding: 0 !important;
      white-space: nowrap !important;
      list-style: none;
    }
    .grava-lp .header-one .header-menu > ul.d-block.d-md-none {
      display: none !important;
    }
  }
  .grava-lp .header-one .header-menu > ul > li {
    display: inline-flex !important;
    float: none !important;
    margin: 0;
    padding: 0;
  }
  .grava-lp .header-one .header-menu > ul > li > a,
  .grava-lp .header-one.sticky .header-menu > ul > li > a,
  .grava-lp .header-one.sticky.active .header-menu > ul > li > a {
    color: #01022e !important;
    font-family: "PT Serif", "Segoe UI", serif !important;
    font-size: 13px !important;
    font-weight: 400;
    line-height: 1.2;
    padding: 6px 7px !important;
    margin: 0 !important;
    white-space: nowrap;
    background: transparent !important;
  }
  .grava-lp .header-one .header-menu > ul > li > a:hover {
    color: #004589 !important;
    background: transparent !important;
  }

  @media (max-width: 1199.98px) and (min-width: 768px) {
    .grava-lp .header-one .header-menu > ul > li > a {
      font-size: 12px !important;
      padding: 5px 5px !important;
    }
    .grava-lp .header-one .header-nav > .container > .row > .col-md-3 {
      flex-basis: 130px;
      max-width: 130px;
      width: 130px;
    }
    .grava-lp .header-one .header-nav > .container > .row > .col-md-2 {
      flex-basis: 96px;
      max-width: 96px;
      width: 96px;
    }
  }

  @media (max-width: 991.98px) and (min-width: 768px) {
    .grava-lp .header-one .header-menu > ul > li > a {
      font-size: 11px !important;
      padding: 4px 4px !important;
    }
  }

  @media (max-width: 767.98px) {
    .grava-lp { padding-bottom: 72px; }
    .grava-lp .floating-btn { display: none !important; }
    .grava-lp .header-one {
      min-height: 0;
    }
    .grava-lp .header-one .header-nav .row {
      flex-wrap: wrap !important;
    }
    .grava-lp .header-one .header-nav > .container > .row > [class*="col-"] {
      flex: 0 0 100%;
      max-width: 100%;
      width: 100%;
    }
    .grava-lp .header-one .header-nav > .container > .row > .col-md-3 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 0 0 100%;
      max-width: 100%;
      width: 100%;
    }
    .grava-lp .header-one .header-logo img {
      max-height: 40px;
      max-width: 120px;
    }
    .grava-lp .header-one .mob-plt img {
      max-height: 36px;
      width: auto;
    }
    .grava-lp .header-one .cf,
    .grava-lp .header-one .rlogo {
      display: none !important;
    }
    .grava-lp .header-one .header-menu {
      overflow-x: auto !important;
      justify-content: flex-start;
      min-height: 0;
      margin-top: 4px;
    }
    .grava-lp .header-one .header-menu > ul.d-block.d-md-none {
      display: flex !important;
      flex-wrap: nowrap !important;
      justify-content: flex-start;
      width: max-content;
      margin: 0 !important;
      padding: 0 !important;
      white-space: nowrap !important;
    }
    .grava-lp .header-one .header-menu > ul.d-none.d-md-block {
      display: none !important;
    }
    .grava-lp .header-one .header-menu > ul > li > a {
      color: #01022e !important;
      font-size: 12px !important;
      padding: 4px 6px !important;
    }
  }

  .grava-lp .grava-lead-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
  .grava-lp .grava-lead-field input,
  .grava-lp .grava-lead-field textarea {
    width: 100%;
    border: 1px solid #cfd6dd;
    border-radius: 4px;
    padding: 12px 14px;
    font-size: 15px;
    background: #fff !important;
    color: #222 !important;
    -webkit-text-fill-color: #222 !important;
    box-sizing: border-box;
  }
  .grava-lp .grava-lead-field textarea {
    resize: vertical;
    min-height: 72px;
  }
  .grava-lp .grava-lead-phone {
    display: flex;
    align-items: center;
    gap: 0;
    border: 1px solid #cfd6dd;
    border-radius: 4px;
    padding: 0;
    background: #fff !important;
    overflow: hidden;
  }
  .grava-lp .grava-lead-country {
    flex: 0 0 6.5rem;
    max-width: 6.5rem;
    border: 0;
    border-right: 1px solid #d5dee4;
    border-radius: 4px 0 0 4px;
    padding: 12px 8px 12px 10px;
    background: #f3f6f9 !important;
    color: #222 !important;
    -webkit-text-fill-color: #222 !important;
    font-size: 13px;
    line-height: 1.2;
    outline: none;
    cursor: pointer;
    appearance: auto;
  }
  .grava-lp .grava-lead-country option {
    color: #222 !important;
    background: #fff !important;
  }
  .grava-lp .grava-lead-phone input {
    flex: 1 1 auto;
    min-width: 0;
    border: 0;
    padding: 12px 12px 12px 10px;
    outline: none;
    background: #fff !important;
    color: #222 !important;
    -webkit-text-fill-color: #222 !important;
  }
  .grava-lp .grava-lead-dial {
    color: #555;
    font-size: 14px;
    white-space: nowrap;
  }
  .grava-lp .grava-lead-consent {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    font-size: 12px;
    line-height: 1.45;
    color: #444;
  }
  /* Consent/dial on blue strips must stay white (overrides default gray above) */
  .grava-lp .fform .grava-lead-dial,
  .grava-lp .fform .grava-lead-consent,
  .grava-lp .fform .grava-lead-consent span,
  .grava-lp .modal-content .grava-lead-dial,
  .grava-lp .modal-content .grava-lead-consent,
  .grava-lp .modal-content .grava-lead-consent span {
    color: #fff !important;
  }
  .grava-lp .grava-lead-consent input {
    margin-top: 2px;
  }
  .grava-lp .grava-lead-status {
    min-height: 18px;
    font-size: 13px;
  }
  .grava-lp .grava-lead-status.is-error { color: #b00020; }
  .grava-lp .grava-lead-status.is-success { color: #0a7a32; }
  .grava-lp .grava-lead-submit {
    border: 0;
    border-radius: 4px;
    padding: 12px 18px;
    background: #004589;
    color: #fff !important;
    font-weight: 600;
    cursor: pointer;
  }
  .grava-lp .grava-lead-submit:disabled {
    opacity: 0.7;
    cursor: wait;
  }
  .grava-lp .modal .grava-lead-submit {
    width: 100%;
  }

  /* Floor plans — 3-up owl slider */
  .grava-lp .grava-floor-plans {
    position: relative;
    padding: 0 36px;
  }
  .grava-lp .grava-floor-plans .fp {
    background: #fff;
    border: 1px solid #e6e6e6;
    padding: 10px;
    text-align: center;
  }
  .grava-lp .grava-floor-plans .fp img,
  .grava-lp .grava-floor-plans .picon {
    width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
  }
  .grava-lp .grava-floor-plans-owl .owl-nav button {
    position: absolute;
    top: 45%;
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #004589 !important;
    color: #fff !important;
    border: 0;
    z-index: 2;
  }
  .grava-lp .grava-floor-plans-owl .owl-nav .owl-prev { left: -8px; }
  .grava-lp .grava-floor-plans-owl .owl-nav .owl-next { right: -8px; }
  .grava-lp .grava-floor-plans-owl .owl-dots {
    margin-top: 14px;
    text-align: center;
  }
  .grava-lp .grava-floor-plans-owl .owl-dot span {
    width: 8px;
    height: 8px;
    margin: 0 4px;
    background: #c9c9c9;
    display: inline-block;
    border-radius: 50%;
  }
  .grava-lp .grava-floor-plans-owl .owl-dot.active span {
    background: #004589;
  }

  /* Project status cards (CMS-driven) */
  .grava-lp .project-status {
    padding: 40px 0;
  }
  .grava-lp .project-status .cald,
  .grava-lp .project-status h2 {
    color: #004589 !important;
    text-align: center;
  }
  .grava-lp .project-status p,
  .grava-lp .lp-project-status-asof,
  .grava-lp .project-status .lp-project-status-card p {
    color: #333 !important;
  }
  .grava-lp .project-status .lp-project-status-card {
    margin-bottom: 22px;
  }
  .grava-lp .project-status .lp-project-status-card a {
    color: #01022e;
    display: block;
  }
  .grava-lp .project-status .lp-project-status-card img {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 4px;
  }
  .grava-lp .project-status .lp-project-status-card p {
    margin-top: 10px;
    font-size: 14px;
    line-height: 1.35;
  }
`;

export default function GravaShell({ title, canonical, styles, html, onReady }) {
  const rootRef = useRef(null);
  const markup = useMemo(() => (html || "").trim(), [html]);

  useEffect(() => {
    if (!markup || !onReady) return undefined;
    let cleanup;
    try {
      cleanup = onReady();
    } catch (err) {
      console.error("grava-lp onReady failed", err);
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
        <meta
          property="og:image"
          content="/my-home-grava-lp/assets/img/grava_new/grava_logo.webp"
        />
        <link
          rel="icon"
          type="image/webp"
          href="/my-home-grava-lp/assets/img/grava_new/favicon.webp"
        />
        {styles.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        <style>{PAGE_STYLE}</style>
      </Head>
      <div
        ref={rootRef}
        className="grava-lp"
        style={{ minHeight: "100vh", background: "#fff" }}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </>
  );
}
