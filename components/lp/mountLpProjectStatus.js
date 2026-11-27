/**
 * Replace a landing-page `.project-status` block with CMS progress cards
 * from the matching main project (Admin → Project → Progress).
 * Clicks always open a lightbox (fslightbox when available, otherwise a local overlay).
 */
const LIGHTBOX_GROUP = "lp-project-status";

export function mountLpProjectStatus(root, progress) {
  if (typeof document === "undefined") return;
  const scope = root || document;
  const section = scope.querySelector?.(".project-status") || document.querySelector(".project-status");
  if (!section) return;

  const images = Array.isArray(progress?.images) ? progress.images : [];
  if (!images.length || progress?.isCompleted) {
    section.style.display = "none";
    return;
  }

  section.style.display = "";

  const heading =
    section.querySelector("h2") ||
    section.querySelector(".cald");
  if (heading && progress.heading) heading.textContent = progress.heading;

  let asOf = null;
  const centers = section.querySelectorAll("center, .text-center, p");
  centers.forEach((node) => {
    if (asOf) return;
    const text = String(node.textContent || "").trim().toLowerCase();
    if (text.startsWith("as on") || text.startsWith("as of")) asOf = node;
  });
  if (!asOf) {
    const container = section.querySelector(".container") || section;
    asOf = document.createElement("p");
    asOf.className = "lp-project-status-asof text-center";
    const h2 = section.querySelector("h2");
    if (h2 && h2.parentElement) {
      h2.parentElement.insertAdjacentElement("afterend", asOf);
    } else {
      container.insertBefore(asOf, container.firstChild);
    }
  }
  if (progress.asOfLabel) {
    asOf.textContent = progress.asOfLabel;
    asOf.style.display = "";
  } else {
    asOf.textContent = "";
    asOf.style.display = "none";
  }

  // One status grid only — drop leftover static rows (e.g. duplicate Club Avali).
  const container = section.querySelector(".container") || section;
  const rows = [...section.querySelectorAll(".row")];
  let row = rows[0];
  rows.slice(1).forEach((extra) => extra.remove());
  if (!row) {
    row = document.createElement("div");
    row.className = "row";
    container.appendChild(row);
  }

  const items = images.map((item, index) => ({
    src: item.src,
    caption: item.caption || item.alt || `Status ${index + 1}`,
    alt: item.alt || item.caption || `Status ${index + 1}`,
  }));

  row.innerHTML = items
    .map((item, index) => {
      const src = escapeAttr(item.src);
      const caption = escapeHtml(item.caption);
      const alt = escapeAttr(item.alt);
      return `
        <div class="col-md-3 col-sm-6 col-xs-12 text-center fs lp-project-status-card">
          <a
            class="lp-project-status-link"
            data-fslightbox="${LIGHTBOX_GROUP}"
            data-caption="${escapeAttr(item.caption)}"
            data-lp-status-index="${index}"
            href="${src}"
          >
            <img class="img" src="${src}" width="100%" alt="${alt}" loading="lazy" decoding="async" />
            <p>${caption}</p>
          </a>
        </div>`;
    })
    .join("");

  refreshFsLightboxSafe();
  bindStatusLightboxClicks(section, items);
}

function bindStatusLightboxClicks(section, items) {
  const links = section.querySelectorAll("a.lp-project-status-link");
  links.forEach((link) => {
    if (link.dataset.lpLightboxBound === "1") return;
    link.dataset.lpLightboxBound = "1";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const index = Number(link.getAttribute("data-lp-status-index") || 0);
      openStatusLightbox(items, index);
    });
  });
}

function openStatusLightbox(items, index) {
  refreshFsLightboxSafe();
  const inst = window.fsLightboxInstances?.[LIGHTBOX_GROUP];
  if (inst && typeof inst.open === "function") {
    try {
      inst.open(index);
      return;
    } catch (err) {
      /* fall through to local overlay */
    }
  }
  openFallbackLightbox(items, index);
}

function refreshFsLightboxSafe() {
  try {
    if (typeof window.refreshFsLightbox === "function") {
      window.refreshFsLightbox();
    }
  } catch (err) {
    /* ignore */
  }
}

function openFallbackLightbox(items, startIndex) {
  ensureFallbackStyles();
  let current = Math.max(0, Math.min(startIndex || 0, items.length - 1));

  let overlay = document.getElementById("lp-status-lightbox");
  if (overlay) overlay.remove();

  overlay = document.createElement("div");
  overlay.id = "lp-status-lightbox";
  overlay.className = "lp-status-lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `
    <button type="button" class="lp-status-lightbox__close" aria-label="Close">&times;</button>
    <button type="button" class="lp-status-lightbox__nav lp-status-lightbox__prev" aria-label="Previous">&#10094;</button>
    <button type="button" class="lp-status-lightbox__nav lp-status-lightbox__next" aria-label="Next">&#10095;</button>
    <div class="lp-status-lightbox__stage">
      <img class="lp-status-lightbox__img" alt="" />
      <p class="lp-status-lightbox__caption"></p>
      <p class="lp-status-lightbox__count"></p>
    </div>
  `;
  document.body.appendChild(overlay);
  document.documentElement.classList.add("lp-status-lightbox-open");

  const img = overlay.querySelector(".lp-status-lightbox__img");
  const caption = overlay.querySelector(".lp-status-lightbox__caption");
  const count = overlay.querySelector(".lp-status-lightbox__count");
  const closeBtn = overlay.querySelector(".lp-status-lightbox__close");
  const prevBtn = overlay.querySelector(".lp-status-lightbox__prev");
  const nextBtn = overlay.querySelector(".lp-status-lightbox__next");

  const render = () => {
    const item = items[current];
    img.src = item.src;
    img.alt = item.alt || item.caption || "";
    caption.textContent = item.caption || "";
    count.textContent = `${current + 1} / ${items.length}`;
    prevBtn.style.visibility = items.length > 1 ? "visible" : "hidden";
    nextBtn.style.visibility = items.length > 1 ? "visible" : "hidden";
  };

  const close = () => {
    document.removeEventListener("keydown", onKey);
    document.documentElement.classList.remove("lp-status-lightbox-open");
    overlay.remove();
  };

  const onKey = (event) => {
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") {
      current = (current - 1 + items.length) % items.length;
      render();
    }
    if (event.key === "ArrowRight") {
      current = (current + 1) % items.length;
      render();
    }
  };

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  prevBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    current = (current - 1 + items.length) % items.length;
    render();
  });
  nextBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    current = (current + 1) % items.length;
    render();
  });
  document.addEventListener("keydown", onKey);

  render();
}

function ensureFallbackStyles() {
  if (document.getElementById("lp-status-lightbox-styles")) return;
  const style = document.createElement("style");
  style.id = "lp-status-lightbox-styles";
  style.textContent = `
    html.lp-status-lightbox-open, html.lp-status-lightbox-open body { overflow: hidden; }
    .lp-status-lightbox {
      position: fixed; inset: 0; z-index: 2147483000;
      background: rgba(0,0,0,.92);
      display: flex; align-items: center; justify-content: center;
      padding: 56px 48px 40px;
      box-sizing: border-box;
    }
    .lp-status-lightbox__stage {
      max-width: min(920px, 100%);
      max-height: 100%;
      text-align: center;
    }
    .lp-status-lightbox__img {
      max-width: 100%;
      max-height: calc(100vh - 160px);
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 4px;
      box-shadow: 0 12px 40px rgba(0,0,0,.45);
    }
    .lp-status-lightbox__caption {
      color: #fff;
      margin: 14px 0 4px;
      font-size: 15px;
      line-height: 1.4;
    }
    .lp-status-lightbox__count {
      color: rgba(255,255,255,.7);
      margin: 0;
      font-size: 13px;
    }
    .lp-status-lightbox__close {
      position: absolute; top: 14px; right: 14px;
      width: 44px; height: 44px; border: 0; border-radius: 999px;
      background: rgba(255,255,255,.14); color: #fff;
      font-size: 28px; line-height: 1; cursor: pointer;
    }
    .lp-status-lightbox__nav {
      position: absolute; top: 50%; transform: translateY(-50%);
      width: 44px; height: 44px; border: 0; border-radius: 999px;
      background: rgba(255,255,255,.14); color: #fff;
      font-size: 22px; cursor: pointer;
    }
    .lp-status-lightbox__prev { left: 12px; }
    .lp-status-lightbox__next { right: 12px; }
    @media (max-width: 640px) {
      .lp-status-lightbox { padding: 64px 16px 24px; }
      .lp-status-lightbox__nav { width: 38px; height: 38px; font-size: 18px; }
    }
  `;
  document.head.appendChild(style);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
