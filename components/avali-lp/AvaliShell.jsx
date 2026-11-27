import Head from "next/head";
import { useEffect, useMemo, useRef } from "react";

const DESCRIPTION =
  "Explore luxury 3 and 4 BHK apartments at Gopanpally, Hyderabad with My Home Avali. Upscale amenities and modern design tailored for a refined lifestyle.";

const PAGE_STYLE = `
  body {
    display: block !important;
    background: #fff !important;
  }
  html:has(.avali-lp),
  body:has(.avali-lp) {
    background: #fff !important;
    margin: 0;
    color: #1a1a18;
    overflow-x: clip;
    overflow-y: scroll !important;
    height: auto !important;
    min-height: 100%;
    display: block !important;
  }
  .avali-lp {
    background: #fff;
    color: #1a1a18;
    overflow-x: clip;
    overflow-y: visible;
    width: 100%;
    max-width: 100vw;
  }
  .avali-lp,
  .avali-lp p,
  .avali-lp span,
  .avali-lp li,
  .avali-lp label,
  .avali-lp td,
  .avali-lp th,
  .avali-lp a,
  .avali-lp button {
    font-family: Georgia, "Times New Roman", serif;
  }
  .avali-lp h1,
  .avali-lp h2,
  .avali-lp h3,
  .avali-lp h4,
  .avali-lp h5,
  .avali-lp h6,
  .avali-lp .cald,
  .avali-lp .prem,
  .avali-lp .ftp-end {
    font-family: Georgia, "Times New Roman", serif !important;
    color: #1a1a18 !important;
  }
  .avali-lp p,
  .avali-lp li,
  .avali-lp .tct p,
  .avali-lp .lp-project-status-card p,
  .avali-lp .project-status .lp-project-status-asof,
  .avali-lp .accordion-body,
  .avali-lp .accordion-body p,
  .avali-lp .accordion-body li,
  .avali-lp .rp-div-p p,
  .avali-lp .homee p,
  .avali-lp td,
  .avali-lp th {
    color: #333 !important;
  }
  .avali-lp .header-one .header-menu > ul > li > a {
    color: #01022e !important;
  }
  .avali-lp .accordion-button {
    color: #1a1a18 !important;
    background: #fff !important;
  }
  .avali-lp .accordion-button:not(.collapsed) {
    color: #1a1a18 !important;
    background: #f7f1e8 !important;
  }
  /* Specs title sits on dark facade image — keep it white/readable */
  .avali-lp .specs {
    background-size: cover !important;
    background-position: center !important;
    background-attachment: scroll !important;
    min-height: 320px;
  }
  .avali-lp .specs .specs-title,
  .avali-lp .specs h3 {
    color: #fff !important;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
    margin-bottom: 1.25rem;
    font-weight: 700;
  }
  .avali-lp .specs .accordion-item {
    background: rgba(255, 255, 255, 0.94);
    border-radius: 8px;
    overflow: hidden;
  }
  .avali-lp .specs .accordion-body,
  .avali-lp .specs .accordion-body p,
  .avali-lp .specs .accordion-body li,
  .avali-lp .specs .accordion-body b {
    color: #333 !important;
  }
  /* Tailwind .collapse { visibility:collapse } blanks Bootstrap accordion panels */
  .avali-lp .collapse.show,
  .avali-lp .collapsing,
  .avali-lp .accordion-collapse.show,
  .avali-lp .accordion-body {
    visibility: visible !important;
  }
  .avali-lp .accordion-collapse:not(.show) {
    display: none !important;
  }
  /* Keep horizontal sliders scrollable (Tailwind / global overflow resets) */
  .avali-lp .css-scroll {
    display: flex !important;
    gap: 12px;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .avali-lp .css-scroll-wrap {
    position: relative;
    width: 100%;
  }
  .avali-lp .css-scroll-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 6;
    width: 42px;
    height: 42px;
    border: 0;
    border-radius: 50%;
    background: #1a1a18 !important;
    color: #fff !important;
    font-size: 32px;
    line-height: 1;
    cursor: pointer;
    display: flex !important;
    align-items: center;
    justify-content: center;
  }
  .avali-lp .css-scroll-prev { left: -8px; }
  .avali-lp .css-scroll-next { right: -8px; }
  @media (min-width: 768px) {
    .avali-lp .css-scroll-prev { left: -18px; }
    .avali-lp .css-scroll-next { right: -18px; }
  }
  /* Content uses ~80% of the viewport; hero/footer stay full-bleed */
  .avali-lp .container,
  .avali-lp .container-fluid {
    width: 80% !important;
    max-width: 80% !important;
    margin-left: auto !important;
    margin-right: auto !important;
    padding-left: 16px;
    padding-right: 16px;
  }
  .avali-lp .carousel-wrap,
  .avali-lp .doc-carousel-wrap {
    width: 80% !important;
    max-width: 80% !important;
    margin-left: auto !important;
    margin-right: auto !important;
    padding-left: 0;
    padding-right: 0;
  }
  .avali-lp .avali-hero-banner,
  .avali-lp .header-one,
  .avali-lp .float-bottom {
    width: 100% !important;
    max-width: 100% !important;
  }
  /* Right-edge sticky CTAs (same pattern as Raka) */
  .avali-lp .sticky-brochure-right,
  .avali-lp .sticky-enquire-right {
    position: fixed !important;
    right: 0 !important;
    left: auto !important;
    z-index: 120;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    writing-mode: vertical-rl;
    transform: translateY(-50%) rotate(180deg);
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
  .avali-lp .sticky-brochure-right {
    top: 42%;
    background: #cf8e48 !important;
  }
  .avali-lp .sticky-enquire-right {
    top: 62%;
    background: #1a1a18 !important;
  }
  .avali-lp .sticky-brochure-right:hover,
  .avali-lp .sticky-brochure-right:focus {
    background: #b87f3d !important;
    color: #fff !important;
  }
  .avali-lp .sticky-enquire-right:hover,
  .avali-lp .sticky-enquire-right:focus {
    background: #333 !important;
    color: #fff !important;
  }
  .avali-lp .floating-btn {
    display: none !important;
  }
  @media (max-width: 767.98px) {
    .avali-lp .sticky-brochure-right,
    .avali-lp .sticky-enquire-right {
      writing-mode: horizontal-tb;
      transform: none;
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 11px;
      letter-spacing: 0.03em;
      right: 10px !important;
      max-width: 46vw;
      box-sizing: border-box;
    }
    .avali-lp .sticky-brochure-right {
      top: auto;
      bottom: 132px;
    }
    .avali-lp .sticky-enquire-right {
      top: auto;
      bottom: 78px;
    }
  }
  .avali-lp .footer-new .container,
  .avali-lp .footer-new .container-fluid {
    width: 90% !important;
    max-width: 90% !important;
  }
  @media (max-width: 767.98px) {
    .avali-lp .container,
    .avali-lp .container-fluid,
    .avali-lp .carousel-wrap,
    .avali-lp .doc-carousel-wrap {
      width: 94% !important;
      max-width: 94% !important;
    }
  }
  .avali-lp section {
    width: 100%;
  }
  /* Project Highlights */
  .avali-lp .part,
  .avali-lp .part span {
    color: #1a1a18 !important;
    text-align: center;
  }
  .avali-lp .round-sec .hmep {
    text-align: center;
    margin-bottom: 1.25rem;
  }
  .avali-lp .round-sec .feature-icon,
  .avali-lp .round-sec .icon-shape {
    display: flex !important;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px;
  }
  .avali-lp .round-sec .icon-shape {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    border: 2px solid #cf8e48;
    background: #1a1a18;
    overflow: hidden;
  }
  .avali-lp .round-sec .hmep img {
    width: 64px !important;
    height: 64px !important;
    max-width: 64px !important;
    object-fit: contain;
    display: block !important;
    margin: 0 auto;
  }
  .avali-lp .round-sec .feature-content p,
  .avali-lp .round-sec .hmep p {
    color: #1a1a18 !important;
  }
  /* Amenities / ongoing logos slider */
  .avali-lp .tct p,
  .avali-lp .ameni-icon p {
    color: #1a1a18 !important;
  }
  .avali-lp .doc-carousel-wrap {
    width: 100%;
    overflow: visible;
  }
  .avali-lp .ongoing-project .am-item {
    display: flex !important;
    align-items: center;
    justify-content: center;
    min-height: 96px;
    padding: 12px 16px;
    background: #fff;
    border: 1px solid #e8e2d8;
    border-radius: 8px;
    box-sizing: border-box;
  }
  .avali-lp .ongoing-project .am-item a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
  .avali-lp .ongoing-project .am-item img {
    width: auto !important;
    max-width: 100% !important;
    height: 56px !important;
    object-fit: contain !important;
    display: block !important;
    margin: 0 auto;
  }
  /* Footer social icons */
  .avali-lp .social-ft-links {
    display: flex !important;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin: 8px 0 16px;
    padding: 0;
    list-style: none;
  }
  .avali-lp .social-ft-links li {
    display: inline-block;
    margin: 0;
  }
  .avali-lp .social-ft-links img {
    width: 32px !important;
    height: 32px !important;
    display: block !important;
    object-fit: contain;
  }
  .avali-lp .footer-new h5 {
    color: #1a1a18 !important;
    margin-top: 16px;
  }
  .avali-lp .footer-new p,
  .avali-lp .footer-new a {
    color: #333 !important;
  }
  .avali-lp .fform,
  .avali-lp .fform p,
  .avali-lp .fform h2,
  .avali-lp .fform label,
  .avali-lp .fform span,
  .avali-lp .fform .avali-lead-consent,
  .avali-lp .fform .avali-lead-dial,
  .avali-lp .modal-body .avali-lead-consent,
  .avali-lp .modal-body .avali-lead-dial {
    color: #fff !important;
  }
  .avali-lp .fform .avali-lead-field input,
  .avali-lp .fform .avali-lead-field textarea,
  .avali-lp .fform .avali-lead-phone input,
  .avali-lp .fform .avali-lead-country,
  .avali-lp .fform .avali-lead-country option,
  .avali-lp .modal .avali-lead-field input,
  .avali-lp .modal .avali-lead-field textarea,
  .avali-lp .modal .avali-lead-phone input,
  .avali-lp .modal .avali-lead-country,
  .avali-lp .modal .avali-lead-country option {
    color: #222 !important;
    -webkit-text-fill-color: #222 !important;
    background-color: #fff !important;
    caret-color: #222 !important;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    width: 100%;
    padding: 10px 12px;
  }
  .avali-lp .fform .avali-lead-country,
  .avali-lp .modal .avali-lead-country {
    max-width: 130px;
    flex-shrink: 0;
    background-color: #f3f6f9 !important;
  }
  .avali-lp .fform .avali-lead-field input::placeholder,
  .avali-lp .fform .avali-lead-field textarea::placeholder,
  .avali-lp .fform .avali-lead-phone input::placeholder,
  .avali-lp .modal .avali-lead-field input::placeholder,
  .avali-lp .modal .avali-lead-field textarea::placeholder,
  .avali-lp .modal .avali-lead-phone input::placeholder {
    color: #6b7280 !important;
    -webkit-text-fill-color: #6b7280 !important;
    opacity: 1 !important;
  }
  .avali-lp .avali-lead-phone {
    display: flex;
    gap: 8px;
  }
  .avali-lp .avali-lead-submit {
    background: #1a1a18 !important;
    color: #fff !important;
    border: 0;
    border-radius: 6px;
    padding: 12px 16px;
    font-weight: 600;
    width: 100%;
    cursor: pointer;
  }
  .avali-lp .avali-lead-status.is-error {
    color: #ffe0e0 !important;
  }
  .avali-lp .modal .modal-title {
    color: #1a1a18 !important;
  }
  .avali-lp .modal .fform .avali-lead-consent,
  .avali-lp .modal .fform .avali-lead-dial,
  .avali-lp .modal .fform .avali-lead-consent span,
  .avali-lp .modal .fform .avali-lead-status {
    color: #fff !important;
  }
  .avali-lp .modal .fform .avali-lead-status.is-error {
    color: #ffe0e0 !important;
  }
  .avali-lp .button-primary,
  .avali-lp .button-primary-float,
  .avali-lp .btn.button-primary,
  .avali-lp .btn.button-primary-float,
  .avali-lp .float-bottom a,
  .avali-lp .float-btm-text2,
  .avali-lp .float-btm-text2 a {
    color: #fff !important;
  }
  .avali-lp .footer-new,
  .avali-lp .footer-new p,
  .avali-lp .footer-new a,
  .avali-lp .footer-new h5,
  .avali-lp .footer-new li {
    color: #1a1a18 !important;
  }
  .avali-lp .footer-new .fform,
  .avali-lp .footer-new .fform p,
  .avali-lp .footer-new .fform h2,
  .avali-lp .footer-new .fform span,
  .avali-lp .footer-new .fform label,
  .avali-lp .footer-new .avali-lead-consent,
  .avali-lp .footer-new .avali-lead-dial {
    color: #fff !important;
  }
  .avali-lp .project-status .lp-project-status-card {
    margin-bottom: 24px;
  }
  .avali-lp .project-status .lp-project-status-card img {
    border-radius: 8px;
  }
  /* Backdrop is appended to <body>, so do not scope it under .avali-lp */
  .mh-backdrop {
    position: fixed !important;
    inset: 0 !important;
    background: rgba(0, 0, 0, 0.4) !important;
    z-index: 1040 !important;
    pointer-events: auto;
  }
  .modal-backdrop {
    z-index: 1035 !important;
    background-color: rgba(0, 0, 0, 0.4) !important;
  }
  .avali-lp .modal,
  .avali-lp .modal.show {
    z-index: 1060 !important;
    pointer-events: none;
  }
  .avali-lp .modal.show .modal-dialog {
    pointer-events: auto;
    position: relative;
    z-index: 1061;
  }
  .avali-lp section,
  .avali-lp h2 {
    scroll-margin-top: 100px;
  }
  /* Header overlays banner; keep above image but under form card */
  .avali-lp .header-one,
  .avali-lp .header-one.sticky {
    position: absolute !important;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 40;
  }
  /* Full-bleed hero tall enough for enquire form */
  .avali-lp .avali-hero-banner {
    position: relative;
    width: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #2a241c;
  }
  .avali-lp .avali-hero-banner picture {
    display: block;
    width: 100%;
    height: 100%;
  }
  .avali-lp .avali-hero-banner .hero-lcp {
    width: 100%;
    height: auto;
    display: block;
    margin: 0 !important;
    object-fit: cover;
    object-position: center top;
  }
  .avali-lp .avali-banner-form-overlay {
    position: absolute;
    inset: 0;
    z-index: 50;
    display: none !important;
    align-items: center;
    justify-content: flex-end;
    padding: 96px 48px 28px;
    pointer-events: none;
    box-sizing: border-box;
  }
  .avali-lp .avali-banner-form-card {
    pointer-events: auto;
    width: min(360px, 34vw);
    max-width: 100%;
  }
  .avali-lp .avali-banner-form.fform,
  .avali-lp .avali-mobile-banner-form-wrap .avali-banner-form.fform {
    background: #cf8e48 !important;
    color: #fff !important;
    border-radius: 10px;
    padding: 16px 18px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
  }
  .avali-lp .avali-banner-form .form_heading,
  .avali-lp .avali-banner-form h2 {
    color: #fff !important;
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0 0 10px;
    letter-spacing: 0.04em;
  }
  .avali-lp .avali-banner-form-overlay .avali-lead-field input,
  .avali-lp .avali-banner-form-overlay .avali-lead-field textarea,
  .avali-lp .avali-banner-form-overlay .avali-lead-phone input,
  .avali-lp .avali-banner-form-overlay .avali-lead-country {
    padding: 9px 11px !important;
    font-size: 0.95rem;
  }
  .avali-lp .avali-banner-form-overlay .avali-lead-field textarea {
    min-height: 64px;
  }
  .avali-lp .avali-banner-form .avali-lead-field,
  .avali-lp .avali-banner-form .avali-lead-phone,
  .avali-lp .avali-banner-form .avali-lead-consent {
    margin-bottom: 8px;
  }
  .avali-lp .avali-banner-form-overlay .avali-lead-consent {
    font-size: 0.75rem;
    line-height: 1.35;
    color: #fff !important;
  }
  .avali-lp .avali-banner-form-overlay .avali-lead-consent span {
    color: #fff !important;
  }
  .avali-lp .avali-banner-form-overlay .avali-lead-submit {
    padding: 11px 14px !important;
  }
  .avali-lp .avali-banner-form .avali-lead-submit {
    background: #1a1a18 !important;
    color: #fff !important;
  }
  .avali-lp .avali-mobile-banner-form-wrap {
    padding: 0;
    margin: 0;
  }
  .avali-lp .avali-mobile-banner-form-wrap .avali-banner-form.fform {
    border-radius: 0;
    box-shadow: none;
    padding: 22px 16px 26px;
  }
  @media (min-width: 768px) {
    .avali-lp .avali-hero-banner {
      min-height: 640px;
      height: clamp(640px, 88vh, 860px);
    }
    .avali-lp .avali-hero-banner picture,
    .avali-lp .avali-hero-banner .hero-lcp {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .avali-lp .avali-banner-form-overlay,
    .avali-lp .avali-banner-form-overlay.d-none,
    .avali-lp .avali-banner-form-overlay.d-md-flex {
      display: flex !important;
    }
  }
  @media (max-width: 767.98px) {
    .avali-lp .avali-banner-form-overlay {
      display: none !important;
    }
    .avali-lp .avali-hero-banner {
      min-height: 0;
      height: auto;
      margin-top: 0 !important;
    }
    .avali-lp .avali-hero-banner .hero-lcp,
    .avali-lp .hero-lcp {
      position: relative !important;
      min-height: 360px;
      height: auto !important;
      margin-top: 0 !important;
      object-fit: cover;
      width: 100%;
    }
    .avali-lp .avali-mobile-banner-form-wrap {
      padding: 16px 12px 8px;
      background: #f7f1e8;
    }
    .avali-lp .avali-mobile-banner-form-wrap .avali-banner-form {
      max-width: 100%;
      margin: 0 auto;
    }
    .avali-lp .avali-mobile-banner-form-wrap h2 {
      font-size: 1.25rem !important;
      margin-bottom: 12px;
    }
    .avali-lp .container,
    .avali-lp .container-fluid {
      max-width: 100%;
      padding-left: 12px;
      padding-right: 12px;
    }
    .avali-lp .round-sec .container,
    .avali-lp .rp-sec .container,
    .avali-lp .project .container {
      width: 100% !important;
      max-width: 100% !important;
    }
    .avali-lp h2 {
      font-size: 1.5rem !important;
      line-height: 1.3;
    }
    .avali-lp .rp-div,
    .avali-lp .tct {
      padding-left: 0;
      padding-right: 0;
    }
    /* Mobile header: solid bar + scrollable menu */
    .avali-lp .header-one,
    .avali-lp .header-one.sticky {
      position: relative !important;
      top: auto !important;
      background: #fff !important;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      z-index: 100;
      padding-top: env(safe-area-inset-top, 0);
    }
    .avali-lp .header-one .header-nav {
      background: #fff !important;
      background-image: none !important;
      padding: 10px 0 0;
    }
    .avali-lp .header-one .container {
      width: 100% !important;
      max-width: 100% !important;
      padding-left: 12px;
      padding-right: 12px;
    }
    .avali-lp .header-one .row {
      flex-wrap: wrap;
      margin: 0;
    }
    .avali-lp .header-one .header-logo {
      width: auto;
      max-width: 55%;
    }
    .avali-lp .header-one .header-logo img {
      width: auto !important;
      max-width: 140px;
      height: 48px !important;
      object-fit: contain;
    }
    .avali-lp .header-one .mob-plt {
      float: none !important;
      width: auto !important;
      margin: 0 !important;
    }
    .avali-lp .header-one .mob-plt img {
      max-width: 100px;
      height: 40px;
      object-fit: contain;
    }
    .avali-lp .header-one .col-md-3 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 100%;
      padding: 0 4px;
    }
    .avali-lp .header-one .col-md-7 {
      width: 100%;
      max-width: 100%;
      padding: 0;
    }
    .avali-lp .header-one .header-menu {
      width: 100% !important;
      overflow: visible !important;
    }
    .avali-lp .header-one .header-menu > ul.menu-desk {
      display: none !important;
    }
    .avali-lp .header-one .header-menu > ul.menu-mob {
      display: flex !important;
      flex-wrap: nowrap;
      gap: 4px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding: 8px 4px 10px;
      margin: 0;
      white-space: nowrap;
      list-style: none;
    }
    .avali-lp .header-one .header-menu > ul::-webkit-scrollbar {
      display: none;
    }
    .avali-lp .header-one .header-menu > ul > li {
      flex: 0 0 auto;
      float: none !important;
      margin: 0;
      list-style: none;
    }
    .avali-lp .header-one .header-menu > ul > li > a {
      display: block;
      padding: 6px 10px !important;
      font-size: 13px !important;
      color: #01022e !important;
      white-space: nowrap;
      text-decoration: none;
    }
    .avali-lp .round-sec .hmep .icon-shape {
      width: 72px;
      height: 72px;
    }
    .avali-lp .round-sec .hmep img {
      width: 52px !important;
      height: 52px !important;
    }
    .avali-lp .specs {
      padding: 28px 12px !important;
      background-attachment: scroll !important;
    }
    .avali-lp .specs .specs-title,
    .avali-lp .specs h3 {
      font-size: 1.6rem !important;
      color: #fff !important;
    }
    .avali-lp .specs .accordion-item {
      margin: 10px 0 !important;
    }
    .avali-lp .accordion-button {
      padding: 12px 14px !important;
      font-size: 0.92rem !important;
    }
    .avali-lp .footer-new .container {
      width: 94% !important;
      max-width: 94% !important;
    }
    .avali-lp .footer-new .col-md-4 {
      margin-bottom: 24px;
    }
    .avali-lp section,
    .avali-lp h2 {
      scroll-margin-top: 16px;
    }
  }
  @media (max-width: 1199px) and (min-width: 768px) {
    .avali-lp .avali-banner-form-overlay {
      padding: 88px 24px 20px;
    }
    .avali-lp .avali-banner-form-card {
      width: min(320px, 40vw);
    }
  }
  /* Modal card above dimmed backdrop */
  .avali-lp .modal .modal-content {
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
    position: relative;
    z-index: 1;
  }
  .avali-lp .modal .fform {
    background: #cf8e48 !important;
    padding: 18px 16px !important;
  }
`;

export default function AvaliShell({ title, canonical, styles, html, onReady }) {
  const rootRef = useRef(null);
  const markup = useMemo(() => (html || "").trim(), [html]);

  useEffect(() => {
    if (!markup || !onReady) return undefined;
    let cleanup;
    try {
      cleanup = onReady();
    } catch (err) {
      console.error("avali-lp onReady failed", err);
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
          content="/my-home-avali-lp/assests/img/my-home-avali-logo.webp"
        />
        <link
          rel="icon"
          type="image/webp"
          href="/my-home-avali-lp/assests/img/myhomesayuk-fav.webp"
        />
        {styles.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        <style>{PAGE_STYLE}</style>
      </Head>
      <div
        ref={rootRef}
        className="avali-lp"
        style={{ minHeight: "100vh", background: "#fff" }}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </>
  );
}
