import Head from "next/head";
import { useEffect, useMemo, useRef } from "react";

const DESCRIPTION =
  "Discover premium 2, 2.5, 3 & 4 BHK apartments in Tellapur by My Home Group. Spacious homes, modern amenities, and excellent connectivity in Hyderabad.";

const PAGE_STYLE = `
  body {
    display: block !important;
    background: #fff !important;
  }
  html:has(.udyan-lp),
  body:has(.udyan-lp) {
    background: #fff !important;
    margin: 0;
    color: #212529;
    overflow-x: hidden;
    overflow-y: auto !important;
    height: auto !important;
    display: block !important;
  }
  .udyan-lp {
    background: #fff;
    color: #212529;
    overflow-x: hidden;
  }
  /* Stop global Next/Tailwind + poorly-scoped LP CSS from wiping brand type/colors.
     app.css had rules like ".footer-new p, a { color:#fff !important }" that
     painted every link white across the page. */
  .udyan-lp,
  .udyan-lp p,
  .udyan-lp span,
  .udyan-lp li,
  .udyan-lp label,
  .udyan-lp td,
  .udyan-lp th {
    font-family: "Futura PT", Arsenal, Avenir, sans-serif;
  }
  .udyan-lp h1,
  .udyan-lp h2,
  .udyan-lp h3,
  .udyan-lp h4,
  .udyan-lp h5,
  .udyan-lp h6,
  .udyan-lp .cald {
    font-family: "Futura PT", Arsenal, Georgia, serif !important;
    color: #376259 !important;
  }
  .udyan-lp p,
  .udyan-lp li,
  .udyan-lp .te,
  .udyan-lp .lp-project-status-card p,
  .udyan-lp .project-status .lp-project-status-asof,
  .udyan-lp .accordion-body,
  .udyan-lp .accordion-body p,
  .udyan-lp .accordion-body b,
  .udyan-lp .accordion-body span,
  .udyan-lp .accordion-body li,
  .udyan-lp .accordion-panel li,
  .udyan-lp .accordion-content,
  .udyan-lp .accordion-content li {
    color: #333 !important;
  }
  /* Tailwind .collapse { visibility:collapse } blanks Bootstrap accordion panels */
  .udyan-lp .collapse,
  .udyan-lp .collapsing,
  .udyan-lp .accordion-collapse,
  .udyan-lp .accordion-body {
    visibility: visible !important;
  }
  .udyan-lp a {
    color: inherit;
  }
  .udyan-lp .nav-link,
  .udyan-lp #main-menu a {
    color: #000 !important;
  }
  .udyan-lp .nav-link.active,
  .udyan-lp #main-menu a.active {
    color: #fff !important;
  }
  /* Dark / photo panels keep light text */
  .udyan-lp .slide-text,
  .udyan-lp .slide-text span,
  .udyan-lp .specs h3,
  .udyan-lp .price-top,
  .udyan-lp .call-button,
  .udyan-lp .call-buttonn,
  .udyan-lp .float-btm-text2 {
    color: #fff !important;
  }
  /* Footer on teal */
  .udyan-lp .footer-new,
  .udyan-lp .footer-new p,
  .udyan-lp .footer-new h5,
  .udyan-lp .footer-new a,
  .udyan-lp .footer-new li,
  .udyan-lp .footer-new .fa,
  .udyan-lp .footer-new .social-links a {
    color: #fff !important;
  }
  .udyan-lp .footer-new {
    background: #4d897c !important;
  }
  .udyan-lp .footer-new .fformm {
    background: #fff !important;
    padding: 22px 18px !important;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  .udyan-lp .footer-new .fformm,
  .udyan-lp .footer-new .fformm p,
  .udyan-lp .footer-new .fformm label,
  .udyan-lp .footer-new .fformm span,
  .udyan-lp .footer-new .fformm .udyan-lead-consent,
  .udyan-lp .footer-new .fformm .udyan-lead-dial,
  .udyan-lp .footer-new .fformm .udyan-lead-status {
    color: #333 !important;
  }
  .udyan-lp .footer-new .fformm .udyan-lead-status.is-error {
    color: #b00020 !important;
  }
  .udyan-lp .hero-wrapper {
    position: relative;
  }
  /* White header ABOVE the banner (not overlaid). Logos + menu like original. */
  .udyan-lp .udyan-desktop-header,
  .udyan-lp .udyan-mobile-header {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    width: 100%;
    background: #fff !important;
    z-index: 1000;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
  }
  .udyan-lp .udyan-desktop-header .navbar,
  .udyan-lp .navbar {
    background: #fff !important;
  }
  /* Tailwind .collapse { visibility:collapse } hides Bootstrap navbar menu */
  .udyan-lp .udyan-desktop-header .navbar-collapse,
  .udyan-lp .udyan-desktop-header .navbar-nav,
  .udyan-lp .udyan-desktop-header .nav-item {
    visibility: visible !important;
  }
  @media (min-width: 992px) {
    .udyan-lp .udyan-desktop-header .navbar-expand-lg .navbar-collapse {
      display: flex !important;
      visibility: visible !important;
      flex-basis: auto !important;
    }
  }
  .udyan-lp .udyan-mobile-header {
    padding: 6px 0 0;
  }
  .udyan-lp .udyan-mobile-logos {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 4px 0 8px;
    background: #fff !important;
  }
  .udyan-lp .udyan-mobile-logos .navbar-brand {
    margin: 0;
    padding: 0;
    line-height: 0;
  }
  .udyan-lp .udyan-mobile-brand {
    flex: 1 1 auto;
    min-width: 0;
  }
  .udyan-lp .udyan-mobile-brand img {
    display: block;
    width: auto;
    max-width: min(180px, 55vw);
    height: 46px;
    max-height: 46px;
    object-fit: contain;
    object-position: left center;
  }
  .udyan-lp .udyan-mobile-group img {
    display: block;
    width: auto;
    height: 32px;
    max-height: 32px;
    object-fit: contain;
  }
  .udyan-lp .udyan-mobile-header #main-menu {
    margin-bottom: 0;
    background: #fff !important;
  }
  .udyan-lp .hero-slider,
  .udyan-lp .hero-wrapper {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }
  .udyan-lp .hero-wrapper img {
    margin-top: 0 !important;
  }
  .udyan-lp .udyan-banner-form-overlay {
    position: absolute;
    inset: 0;
    align-items: center;
    justify-content: flex-end;
    padding: 24px 4vw;
    pointer-events: none;
    z-index: 5;
  }
  .udyan-lp .hero-wrapper picture,
  .udyan-lp .hero-wrapper img {
    width: 100%;
    height: auto;
    display: block;
  }
  @media (min-width: 768px) {
    .udyan-lp .hero-wrapper img {
      aspect-ratio: auto;
    }
  }
  .udyan-lp .udyan-banner-form-card {
    pointer-events: auto;
    width: min(380px, 100%);
  }
  .udyan-lp .udyan-banner-form.fform,
  .udyan-lp .udyan-mobile-banner-form-wrap .udyan-banner-form.fform {
    background: rgba(77, 137, 124, 0.94);
    padding: 22px 18px;
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.22);
  }
  .udyan-lp .udyan-banner-form .form_heading,
  .udyan-lp .udyan-banner-form h2 {
    color: #fff !important;
    font-size: 1.35rem;
    margin-bottom: 12px;
  }
  .udyan-lp .udyan-banner-form .udyan-lead-form {
    display: grid;
    gap: 10px;
  }
  .udyan-lp .fform .udyan-lead-field input,
  .udyan-lp .fform .udyan-lead-field textarea,
  .udyan-lp .fform .udyan-lead-phone input,
  .udyan-lp .fform .udyan-lead-country,
  .udyan-lp .fform .udyan-lead-country option,
  .udyan-lp .fformm .udyan-lead-field input,
  .udyan-lp .fformm .udyan-lead-field textarea,
  .udyan-lp .fformm .udyan-lead-phone input,
  .udyan-lp .fformm .udyan-lead-country,
  .udyan-lp .fformm .udyan-lead-country option,
  .udyan-lp .modal .udyan-lead-field input,
  .udyan-lp .modal .udyan-lead-field textarea,
  .udyan-lp .modal .udyan-lead-phone input,
  .udyan-lp .modal .udyan-lead-country,
  .udyan-lp .modal .udyan-lead-country option {
    color: #222 !important;
    background: #fff !important;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    width: 100%;
    padding: 10px 12px;
  }
  .udyan-lp .fform .udyan-lead-country,
  .udyan-lp .fformm .udyan-lead-country,
  .udyan-lp .modal .udyan-lead-country {
    max-width: 130px;
    flex-shrink: 0;
  }
  .udyan-lp .fform .udyan-lead-field input::placeholder,
  .udyan-lp .fform .udyan-lead-field textarea::placeholder,
  .udyan-lp .fform .udyan-lead-phone input::placeholder,
  .udyan-lp .fformm .udyan-lead-field input::placeholder,
  .udyan-lp .fformm .udyan-lead-field textarea::placeholder,
  .udyan-lp .fformm .udyan-lead-phone input::placeholder,
  .udyan-lp .modal .udyan-lead-field input::placeholder,
  .udyan-lp .modal .udyan-lead-field textarea::placeholder,
  .udyan-lp .modal .udyan-lead-phone input::placeholder {
    color: #777 !important;
  }
  .udyan-lp .udyan-lead-phone {
    display: flex;
    gap: 8px;
  }
  .udyan-lp .udyan-lead-submit {
    background: #65071b !important;
    color: #fff !important;
    border: 0;
    border-radius: 6px;
    padding: 12px 16px;
    font-weight: 600;
    width: 100%;
    cursor: pointer;
  }
  .udyan-lp .udyan-lead-status.is-error {
    color: #ffd7d7 !important;
  }
  .udyan-lp .fform .udyan-lead-consent,
  .udyan-lp .fform .udyan-lead-dial,
  .udyan-lp .fform .udyan-lead-consent span,
  .udyan-lp .fform .form_heading {
    color: #fff !important;
  }
  .udyan-lp .modal .udyan-lead-consent,
  .udyan-lp .modal .udyan-lead-dial,
  .udyan-lp .modal .udyan-lead-consent span,
  .udyan-lp .modal .udyan-lead-status {
    color: #333 !important;
  }
  .udyan-lp .modal .udyan-lead-status.is-error {
    color: #b00020 !important;
  }
  .udyan-lp .udyan-mobile-banner-form-wrap {
    padding: 20px 16px 8px;
  }
  .udyan-lp .udyan-mobile-banner-form-wrap .fform {
    background: rgba(77, 137, 124, 0.94) !important;
  }
  .udyan-lp .project-status .lp-project-status-card {
    margin-bottom: 24px;
  }
  .udyan-lp .project-status .lp-project-status-card img {
    border-radius: 8px;
  }
  .udyan-lp .project-status .lp-project-status-card p {
    margin-top: 10px;
    font-size: 14px;
    line-height: 1.35;
  }
  @media (min-width: 768px) {
    .udyan-lp .udyan-banner-form-overlay {
      display: flex !important;
    }
  }
`;

export default function UdyanShell({ title, canonical, styles, html, onReady }) {
  const rootRef = useRef(null);
  const markup = useMemo(() => (html || "").trim(), [html]);

  useEffect(() => {
    if (!markup || !onReady) return undefined;
    let cleanup;
    try {
      cleanup = onReady();
    } catch (err) {
      console.error("udyan-lp onReady failed", err);
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
          content="/my-home-udyan-lp/assets/img/udyan-logo.png"
        />
        <link
          rel="icon"
          type="image/png"
          href="/my-home-udyan-lp/assets/img/udyan-logo.png"
        />
        {styles.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        <style>{PAGE_STYLE}</style>
      </Head>
      <div
        ref={rootRef}
        className="udyan-lp"
        style={{ minHeight: "100vh", background: "#fff" }}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </>
  );
}
