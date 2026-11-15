/**
 * Pengendali antarmuka blog Usvandre Nur.
 * Terhubung ke API backend Vercel (/api/posts, /api/portfolio, /api/feeds, /api/contact)
 * dengan fallback aman ke window.BLOG_DATA saat dibuka tanpa server.
 */
(() => {
  if (window.location.hash && window.location.hash.includes("access_token=")) {
    window.location.replace(`/kenangan.html${window.location.hash}`);
    return;
  }

  const fallback = window.BLOG_DATA || {
    profile: {
      email: "usvanndrenur@gmail.com",
      substackUrl: "https://substack.com/@vandroidd",
      threadsUrl: "https://www.threads.com/@usvandrnr"
    },
    categories: ["Semua"],
    logos: [],
    posts: [],
    projects: [],
    experiences: []
  };

  const READ_TIME_STORAGE_KEY = "usvandre_read_seconds_v1";

  function loadReadSeconds() {
    try {
      const raw = localStorage.getItem(READ_TIME_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveReadSeconds(map) {
    try {
      localStorage.setItem(READ_TIME_STORAGE_KEY, JSON.stringify(map));
    } catch {
      // Abaikan jika penyimpanan browser penuh/terbatas
    }
  }

  const state = {
    activeCategory: "Semua",
    searchQuery: "",
    activePost: null,
    readTimerId: null,
    readSecondsBySlug: loadReadSeconds(),
    activePlatform: "all",
    categories: fallback.categories,
    logos: fallback.logos || [],
    posts: fallback.posts || [],
    projects: fallback.projects || [],
    experiences: fallback.experiences || [],
    profile: fallback.profile,
    feedsPayload: null,
    dbConnected: false
  };

  const els = {
    header: document.getElementById("siteHeader"),
    menuToggle: document.getElementById("menuToggle"),
    mobileMenu: document.getElementById("mobileMenu"),
    filterBar: document.getElementById("filterBar"),
    searchInput: document.getElementById("searchInput"),
    postsGrid: document.getElementById("postsGrid"),
    emptyState: document.getElementById("emptyState"),
    resetFilterBtn: document.getElementById("resetFilterBtn"),
    highlightsPreview: document.getElementById("highlightsPreview"),
    logosGrid: document.getElementById("logosGrid"),
    projectsList: document.getElementById("projectsList"),
    experienceList: document.getElementById("experienceList"),
    feedsFilter: document.getElementById("feedsFilter"),
    feedsGrid: document.getElementById("feedsGrid"),
    feedsStatusPill: document.getElementById("feedsStatusPill"),
    refreshFeedsBtn: document.getElementById("refreshFeedsBtn"),
    dbStatusNote: document.getElementById("dbStatusNote"),
    yearNow: document.getElementById("yearNow"),

    readerModal: document.getElementById("readerModal"),
    readerScroll: document.getElementById("readerScroll"),
    readerProgress: document.getElementById("readerProgress"),
    readerCategory: document.getElementById("readerCategory"),
    readerDate: document.getElementById("readerDate"),
    readerTime: document.getElementById("readerTime"),
    readerTitle: document.getElementById("readerTitle"),
    readerExcerpt: document.getElementById("readerExcerpt"),
    readerSource: document.getElementById("readerSource"),
    readerBody: document.getElementById("readerBody"),
    readerTags: document.getElementById("readerTags"),
    closeReaderBtn: document.getElementById("closeReaderBtn"),
    sharePostBtn: document.getElementById("sharePostBtn"),

    contactModal: document.getElementById("contactModal"),
    openContactBtn: document.getElementById("openContactBtn"),
    mobileContactBtn: document.getElementById("mobileContactBtn"),
    closeContactBtn: document.getElementById("closeContactBtn"),
    copyEmailBtn: document.getElementById("copyEmailBtn"),
    modalCopyEmailBtn: document.getElementById("modalCopyEmailBtn"),
    copyFeedback: document.getElementById("copyFeedback"),
    contactForm: document.getElementById("contactForm"),
    contactSubmitBtn: document.getElementById("contactSubmitBtn"),
    contactStatus: document.getElementById("contactStatus")
  };

  function copyText(text, onSuccess) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopy(text, onSuccess));
      return;
    }
    fallbackCopy(text, onSuccess);
  }

  function fallbackCopy(text, onSuccess) {
    const temp = document.createElement("textarea");
    temp.value = text;
    temp.setAttribute("readonly", "");
    temp.style.position = "absolute";
    temp.style.left = "-9999px";
    document.body.appendChild(temp);
    temp.select();
    try {
      document.execCommand("copy");
      onSuccess();
    } finally {
      document.body.removeChild(temp);
    }
  }

  function syncModalBodyLock() {
    const anyOpen = !els.readerModal.hidden || !els.contactModal.hidden;
    document.body.classList.toggle("modal-open", anyOpen);
  }

  function setHeaderState() {
    if (!els.header) return;
    const y = window.scrollY || window.pageYOffset || 0;
    const progress = Math.min(1, Math.max(0, y / 96));
    els.header.style.setProperty("--nav-bg-alpha", (progress * 0.94).toFixed(3));
    els.header.style.setProperty("--nav-blur", `${(progress * 18).toFixed(1)}px`);
    els.header.style.setProperty("--nav-border-alpha", (progress * 0.08).toFixed(3));
    els.header.style.setProperty("--nav-shadow-alpha", (progress * 0.05).toFixed(3));
    els.header.classList.toggle("scrolled", y > 18);
  }

  function toggleMobileMenu(forceClose = false) {
    const isOpen = !els.mobileMenu.hidden;
    const nextOpen = forceClose ? false : !isOpen;
    els.mobileMenu.hidden = !nextOpen;
    els.menuToggle.setAttribute("aria-expanded", String(nextOpen));
  }

  function formatDateId(iso) {
    if (!iso) return "Terbaru";
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return "Terbaru";
    return dt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  function renderFilters() {
    els.filterBar.innerHTML = "";
    state.categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-pill" + (cat === state.activeCategory ? " active" : "");
      btn.textContent = cat;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", String(cat === state.activeCategory));
      btn.addEventListener("click", () => {
        state.activeCategory = cat;
        renderFilters();
        renderPosts();
      });
      els.filterBar.appendChild(btn);
    });
  }

  function getFilteredPosts() {
    const q = state.searchQuery.trim().toLowerCase();
    return state.posts.filter((post) => {
      const matchesCat = state.activeCategory === "Semua" || post.category === state.activeCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      const haystack = [post.title, post.excerpt, post.category, ...(post.tags || [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  function getReadSeconds(slug) {
    return Math.max(0, Number(state.readSecondsBySlug[slug] || 0));
  }

  function formatReadClock(totalSeconds) {
    const sec = Math.max(0, Math.floor(totalSeconds));
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
  }

  function formatCardReadTime(totalSeconds) {
    const sec = Math.max(0, Math.floor(totalSeconds));
    if (sec <= 0) return "Belum dibaca";
    if (sec < 60) return `Dibaca ${sec} dtk`;
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return rem > 0 ? `Dibaca ${mins} mnt ${rem} dtk` : `Dibaca ${mins} mnt`;
  }

  function syncCardReadTime(slug) {
    const card = els.postsGrid?.querySelector(`.post-card[data-slug="${CSS.escape(slug)}"]`);
    if (!card) return;
    const timeEl = card.querySelector(".post-time");
    if (timeEl) {
      timeEl.textContent = formatCardReadTime(getReadSeconds(slug));
    }
  }

  function stopReadTimer() {
    if (state.readTimerId) {
      clearInterval(state.readTimerId);
      state.readTimerId = null;
    }
  }

  function startReadTimer(slug) {
    stopReadTimer();
    const renderCurrent = () => {
      const secs = getReadSeconds(slug);
      els.readerTime.textContent = `Waktu baca · ${formatReadClock(secs)}`;
      syncCardReadTime(slug);
    };
    renderCurrent();

    state.readTimerId = setInterval(() => {
      if (els.readerModal.hidden || !state.activePost || state.activePost.slug !== slug || document.hidden) {
        return;
      }
      state.readSecondsBySlug[slug] = getReadSeconds(slug) + 1;
      saveReadSeconds(state.readSecondsBySlug);
      renderCurrent();
    }, 1000);
  }

  function renderPosts() {
    const filtered = getFilteredPosts();
    els.postsGrid.innerHTML = "";
    els.emptyState.hidden = filtered.length > 0;

    filtered.forEach((post) => {
      const card = document.createElement("article");
      card.className = "post-card";
      card.dataset.slug = post.slug;
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Baca tulisan: ${post.title}`);

      card.innerHTML = `
        <div>
          <div class="post-card-meta">
            <span class="post-cat"></span>
            <span class="post-time"></span>
          </div>
          <h3 class="post-title"></h3>
          <p class="post-excerpt"></p>
        </div>
        <div class="post-card-footer">
          <span class="post-date"></span>
          <span class="post-read-arrow">Baca selengkapnya &rarr;</span>
        </div>
      `;

      card.querySelector(".post-cat").textContent = post.category;
      card.querySelector(".post-time").textContent = formatCardReadTime(getReadSeconds(post.slug));
      card.querySelector(".post-title").textContent = post.title;
      card.querySelector(".post-excerpt").textContent = post.excerpt;
      card.querySelector(".post-date").textContent = post.published_year || post.date || "2026";

      const openHandler = () => openReader(post.slug);
      card.addEventListener("click", openHandler);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openHandler();
        }
      });

      els.postsGrid.appendChild(card);
    });
  }

  const PROJECT_DOC_LINKS = {
    "dprd-batubara-web": {
      demoUrl: "portofolio-web.html#dprd-batubara",
      reportUrl: "docs/Laporan-PKL-DPRD-Batubara.pdf",
      reportLabel: "Laporan PKL DPRD Batubara (PDF)",
      postSlug: "laporan-pkl-website-berita-dprd-batubara-2023"
    }
  };

  const POST_DOC_LINKS = {
    "laporan-pkl-website-berita-dprd-batubara-2023": {
      reportUrl: "docs/Laporan-PKL-DPRD-Batubara.pdf",
      reportLabel: "Laporan PKL DPRD Batubara (PDF) ↗",
      demoUrl: "portofolio-web.html#dprd-batubara",
      demoLabel: "Buka Live Demo Portal DPRD ↗"
    }
  };

  function renderHighlights() {
    els.highlightsPreview.innerHTML = "";
    const topItems = state.projects.filter((p) => p.featured).slice(0, 3);
    const list = topItems.length > 0 ? topItems : state.projects.slice(0, 3);

    list.forEach((item) => {
      const box = document.createElement("div");
      box.className = "highlight-mini";
      box.innerHTML = `
        <div class="highlight-mini-head">
          <h4></h4>
          <span></span>
        </div>
        <p></p>
      `;
      box.querySelector("h4").textContent = item.name;
      box.querySelector("span").textContent = item.source_label || "Arsip";
      box.querySelector("p").textContent = item.description;
      const docMeta = PROJECT_DOC_LINKS[item.slug];
      if (docMeta) {
        const links = document.createElement("div");
        links.className = "highlight-mini-links";
        links.innerHTML = `
          <a href="${docMeta.reportUrl}" target="_blank" rel="noopener noreferrer">${docMeta.reportLabel} &nearr;</a>
        `;
        box.appendChild(links);
      }
      els.highlightsPreview.appendChild(box);
    });
  }

  function renderLogos() {
    if (!els.logosGrid) return;
    els.logosGrid.innerHTML = "";
    const logo = state.logos[0];
    if (!logo) return;

    const philosophy =
      Array.isArray(logo.philosophy) && logo.philosophy.length
        ? logo.philosophy
        : [
            {
              label: "Biru – Ungu · Galaksi",
              tone: "galaxy",
              detail: "Mewakili kedalaman semesta, imajinasi luas, dan visi tanpa batas."
            },
            {
              label: "Biru – Hijau · Bumi",
              tone: "earth",
              detail: "Mewakili keseimbangan alam, pertumbuhan, dan pijakan yang membumi."
            }
          ];

    const spotlight = document.createElement("article");
    spotlight.className = "logo-spotlight";
    spotlight.innerHTML = `
      <div class="logo-spotlight-stage" oncontextmenu="return false;">
        <div class="logo-spotlight-frame">
          <img loading="lazy" draggable="false" alt="" />
        </div>
      </div>
      <div class="logo-spotlight-info">
        <span class="card-kicker"></span>
        <h3></h3>
        <p class="logo-spotlight-desc"></p>
        <div class="philosophy-grid"></div>
        <div class="logo-spotlight-actions">
          <a href="portofolio-design.html" class="btn-secondary">Lihat Portofolio Design &rarr;</a>
        </div>
      </div>
    `;

    const img = spotlight.querySelector("img");
    img.src = logo.image;
    img.alt = `Logo ${logo.name}`;
    spotlight.querySelector(".card-kicker").textContent = `${logo.category} · ${logo.source}`;
    spotlight.querySelector("h3").textContent = logo.name;
    spotlight.querySelector(".logo-spotlight-desc").textContent = logo.note;

    const philGrid = spotlight.querySelector(".philosophy-grid");
    philosophy.forEach((item) => {
      const card = document.createElement("div");
      card.className = "philosophy-card";
      const dotClass = item.tone === "galaxy" ? "swatch-galaxy" : "swatch-earth";
      card.innerHTML = `
        <div class="philosophy-head">
          <span class="swatch-dot ${dotClass}" aria-hidden="true"></span>
          <span class="philosophy-title"></span>
        </div>
        <p></p>
      `;
      card.querySelector(".philosophy-title").textContent = item.label;
      card.querySelector("p").textContent = item.detail;
      philGrid.appendChild(card);
    });

    els.logosGrid.appendChild(spotlight);
  }

  function renderProjects() {
    els.projectsList.innerHTML = "";
    state.projects.forEach((proj) => {
      const item = document.createElement("article");
      item.className = "project-item";
      item.innerHTML = `
        <div>
          <div class="project-top">
            <h3></h3>
            <span class="project-cat"></span>
          </div>
          <p></p>
        </div>
        <div class="project-tags"></div>
      `;
      item.querySelector("h3").textContent = proj.name;
      item.querySelector(".project-cat").textContent = proj.category;
      item.querySelector("p").textContent = proj.description;
      const tagsEl = item.querySelector(".project-tags");
      (proj.tags || []).forEach((tag) => {
        const span = document.createElement("span");
        span.textContent = tag;
        tagsEl.appendChild(span);
      });
      const docMeta = PROJECT_DOC_LINKS[proj.slug];
      if (docMeta) {
        const actions = document.createElement("div");
        actions.className = "project-actions";
        actions.innerHTML = `
          <a class="project-action-btn is-primary" href="${docMeta.reportUrl}" target="_blank" rel="noopener noreferrer">${docMeta.reportLabel} &nearr;</a>
        `;
        const summaryBtn = document.createElement("button");
        summaryBtn.type = "button";
        summaryBtn.className = "project-action-btn";
        summaryBtn.textContent = "Ringkasan Laporan";
        summaryBtn.addEventListener("click", () => openReader(docMeta.postSlug));
        actions.appendChild(summaryBtn);
        item.appendChild(actions);
      }
      els.projectsList.appendChild(item);
    });
  }

  function renderExperience() {
    els.experienceList.innerHTML = "";
    state.experiences.forEach((exp) => {
      const item = document.createElement("article");
      item.className = "timeline-item";
      item.innerHTML = `
        <div class="timeline-top">
          <h3></h3>
          <span class="timeline-period"></span>
        </div>
        <p class="timeline-org"></p>
        <p class="timeline-detail"></p>
      `;
      item.querySelector("h3").textContent = exp.role;
      item.querySelector(".timeline-period").textContent = exp.period;
      item.querySelector(".timeline-org").textContent = exp.org;
      item.querySelector(".timeline-detail").textContent = exp.detail;
      els.experienceList.appendChild(item);
    });
  }

  function renderFeeds(payload) {
    const substackUrl = payload?.substackUrl || state.profile.substackUrl;
    const threadsUrl = payload?.threadsUrl || state.profile.threadsUrl;
    const allItems = payload?.items || [];
    const items =
      state.activePlatform === "all"
        ? allItems
        : allItems.filter((it) => it.platform === state.activePlatform);

    if (items.length > 0) {
      const threadsCount = items.filter((i) => i.platform === "threads").length;
      const substackCount = items.filter((i) => i.platform === "substack").length;
      const parts = [];
      if (substackCount > 0) parts.push(`${substackCount} Substack`);
      if (threadsCount > 0) parts.push(`${threadsCount} Threads`);
      const suffix = substackCount === 0 ? " · Substack menunggu terbitan pertama" : "";
      els.feedsStatusPill.textContent = `Tersinkronisasi · ${parts.join(" & ")}${suffix}`;
      els.feedsGrid.innerHTML = "";
      items.forEach((item) => {
        const isThreads = item.platform === "threads";
        const rawTitle = String(item.title || "").trim();
        const rawExcerpt = String(item.excerpt || "").trim();
        const normTitle = rawTitle.replace(/[….]+$/g, "").replace(/\s+/g, " ").trim().toLowerCase();
        const normExcerpt = rawExcerpt.replace(/\s+/g, " ").trim().toLowerCase();
        const isGenericOrRedundantTitle =
          !rawTitle ||
          (isThreads && normTitle.startsWith("catatan @")) ||
          (normTitle.length >= 12 && normExcerpt.startsWith(normTitle));

        const card = document.createElement("article");
        card.className = `feed-card${isThreads && isGenericOrRedundantTitle ? " is-threads-note" : ""}`;
        card.innerHTML = `
          <div>
            <div class="feed-card-top">
              <span class="platform-badge"></span>
              <span class="feed-date"></span>
            </div>
            <h3></h3>
            <p class="feed-excerpt"></p>
          </div>
          <a class="feed-cta-link" target="_blank" rel="noopener noreferrer"></a>
        `;
        card.querySelector(".platform-badge").textContent = isThreads ? "Threads · Cuplikan" : "Substack · Cuplikan";
        card.querySelector(".feed-date").textContent = formatDateId(item.published_at);
        const h3El = card.querySelector("h3");
        if (isGenericOrRedundantTitle) {
          h3El.hidden = true;
        } else {
          h3El.textContent = rawTitle;
        }
        card.querySelector(".feed-excerpt").textContent = rawExcerpt;
        const linkEl = card.querySelector(".feed-cta-link");
        linkEl.href = item.link;
        linkEl.textContent = isThreads ? "Lanjutkan membaca di Threads \u2197" : "Lanjutkan membaca di Substack \u2197";
        els.feedsGrid.appendChild(card);
      });
      return;
    }

    els.feedsStatusPill.textContent = "Terhubung ke @vandroidd & @usvandrnr · Menunggu terbitan pertama";
    const cards = [];
    if (state.activePlatform === "all" || state.activePlatform === "substack") {
      cards.push(`
        <article class="channel-placeholder">
          <div>
            <span class="platform-badge">Substack (@vandroidd)</span>
            <h3>Belum ada artikel terbit di Substack</h3>
            <p>
              Umpan RSS Substack siap menarik tulisan baru Anda secara otomatis, memangkasnya menjadi cuplikan sebagian,
              dan menyimpannya ke tabel SQL Supabase.
            </p>
          </div>
          <a href="${substackUrl}" target="_blank" rel="noopener noreferrer" class="feed-cta-link">
            Buka profil Substack @vandroidd &nearr;
          </a>
        </article>
      `);
    }
    if (state.activePlatform === "all" || state.activePlatform === "threads") {
      cards.push(`
        <article class="channel-placeholder">
          <div>
            <span class="platform-badge">Threads (@usvandrnr)</span>
            <h3>Terhubung dengan catatan Threads</h3>
            <p>
              Utas dan catatan singkat dari @usvandrnr akan bergabung langsung di linimasa ini bersama Substack
              (mendukung sinkronisasi SQL maupun Threads API).
            </p>
          </div>
          <a href="${threadsUrl}" target="_blank" rel="noopener noreferrer" class="feed-cta-link">
            Kunjungi Threads @usvandrnr &nearr;
          </a>
        </article>
      `);
    }
    els.feedsGrid.innerHTML = cards.join("");
  }

  function updateDbStatusNote() {
    if (!els.dbStatusNote) return;
    els.dbStatusNote.textContent = state.dbConnected
      ? "Basis data: Supabase PostgreSQL aktif"
      : "Mode data bawaan · Siap disambungkan ke Supabase SQL";
  }

  async function hydrateFromApi() {
    try {
      const [postsRes, portRes] = await Promise.all([
        fetch("/api/posts"),
        fetch("/api/portfolio")
      ]);

      if (postsRes.ok) {
        const pData = await postsRes.json();
        if (Array.isArray(pData.posts) && pData.posts.length > 0) {
          state.posts = pData.posts;
          state.categories = pData.categories || state.categories;
          if (pData.dbConnected) state.dbConnected = true;
        }
      }

      if (portRes.ok) {
        const pfData = await portRes.json();
        if (Array.isArray(pfData.logos) && pfData.logos.length > 0) {
          state.logos = pfData.logos;
        }
        if (Array.isArray(pfData.projects) && pfData.projects.length > 0) {
          state.projects = pfData.projects;
        }
        if (Array.isArray(pfData.experiences) && pfData.experiences.length > 0) {
          state.experiences = pfData.experiences;
        }
        if (pfData.dbConnected) state.dbConnected = true;
      }

      renderFilters();
      renderPosts();
      renderHighlights();
      renderLogos();
      renderProjects();
      renderExperience();
      updateDbStatusNote();
      handleHashNavigation();
    } catch {
      updateDbStatusNote();
    }
  }

  async function loadFeeds() {
    els.feedsStatusPill.textContent = "Menyelaraskan Substack & Threads...";
    try {
      const res = await fetch("/api/feeds");
      if (!res.ok) throw new Error("Feed fetch skipped");
      const payload = await res.json();
      state.feedsPayload = payload;
      if (payload.dbConnected) {
        state.dbConnected = true;
        updateDbStatusNote();
      }
      renderFeeds(payload);
    } catch {
      state.feedsPayload = {
        substackUrl: state.profile.substackUrl,
        threadsUrl: state.profile.threadsUrl,
        items: []
      };
      renderFeeds(state.feedsPayload);
    }
  }

  function openReader(slug, updateHash = true) {
    const post = state.posts.find((p) => p.slug === slug);
    if (!post) return;

    state.activePost = post;
    els.readerCategory.textContent = post.category;
    els.readerDate.textContent = post.published_year || post.date || "2026";
    els.readerTitle.textContent = post.title;
    els.readerExcerpt.textContent = post.excerpt;
    els.readerSource.textContent = post.source_note || post.sourceNote || "";
    els.sharePostBtn.textContent = "Salin Tautan";

    els.readerBody.innerHTML = "";
    const paragraphs = Array.isArray(post.body) ? post.body : [];
    paragraphs.forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      els.readerBody.appendChild(p);
    });

    const docMeta = POST_DOC_LINKS[post.slug];
    if (docMeta) {
      const actionBox = document.createElement("div");
      actionBox.className = "reader-doc-actions";
      actionBox.innerHTML = `
        <a class="reader-doc-btn is-primary" href="${docMeta.reportUrl}" target="_blank" rel="noopener noreferrer">${docMeta.reportLabel}</a>
        <a class="reader-doc-btn" href="${docMeta.demoUrl}">${docMeta.demoLabel}</a>
      `;
      els.readerBody.appendChild(actionBox);
    }

    els.readerTags.innerHTML = "";
    (post.tags || []).forEach((tag) => {
      const span = document.createElement("span");
      span.textContent = `#${tag}`;
      els.readerTags.appendChild(span);
    });

    els.readerModal.hidden = false;
    els.readerScroll.scrollTop = 0;
    els.readerProgress.style.width = "0%";
    syncModalBodyLock();
    startReadTimer(post.slug);

    if (updateHash) {
      history.replaceState(null, "", `#post/${post.slug}`);
    }
  }

  function closeReader() {
    stopReadTimer();
    els.readerModal.hidden = true;
    state.activePost = null;
    syncModalBodyLock();
    if (window.location.hash.startsWith("#post/")) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  function updateReadingProgress() {
    const el = els.readerScroll;
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 0) {
      els.readerProgress.style.width = "100%";
      return;
    }
    const pct = Math.min(100, Math.max(0, (el.scrollTop / max) * 100));
    els.readerProgress.style.width = `${pct.toFixed(1)}%`;
  }

  function openContactModal() {
    els.contactModal.hidden = false;
    els.contactStatus.textContent = "";
    toggleMobileMenu(true);
    syncModalBodyLock();
  }

  function closeContactModal() {
    els.contactModal.hidden = true;
    syncModalBodyLock();
  }

  function handleHashNavigation() {
    const hash = window.location.hash;
    if (hash.startsWith("#post/")) {
      const slug = hash.replace("#post/", "").trim();
      openReader(slug, false);
    }
  }

  function bindEvents() {
    window.addEventListener("scroll", setHeaderState, { passive: true });
    window.addEventListener("hashchange", handleHashNavigation);

    els.menuToggle.addEventListener("click", () => toggleMobileMenu());
    document.querySelectorAll(".mobile-link").forEach((link) => {
      link.addEventListener("click", () => toggleMobileMenu(true));
    });

    els.searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      renderPosts();
    });

    els.resetFilterBtn.addEventListener("click", () => {
      state.activeCategory = "Semua";
      state.searchQuery = "";
      els.searchInput.value = "";
      renderFilters();
      renderPosts();
    });

    els.feedsFilter.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activePlatform = btn.dataset.platform || "all";
        els.feedsFilter.querySelectorAll("button").forEach((b) => {
          b.classList.toggle("active", b === btn);
        });
        if (state.feedsPayload) renderFeeds(state.feedsPayload);
      });
    });

    els.refreshFeedsBtn.addEventListener("click", loadFeeds);

    els.closeReaderBtn.addEventListener("click", closeReader);
    els.readerModal.addEventListener("click", (e) => {
      if (e.target === els.readerModal) closeReader();
    });
    els.readerScroll.addEventListener("scroll", updateReadingProgress, { passive: true });

    els.sharePostBtn.addEventListener("click", () => {
      if (!state.activePost) return;
      const url = `${window.location.origin}${window.location.pathname}#post/${state.activePost.slug}`;
      copyText(url, () => {
        els.sharePostBtn.textContent = "Tautan Tersalin";
        setTimeout(() => {
          els.sharePostBtn.textContent = "Salin Tautan";
        }, 2000);
      });
    });

    els.openContactBtn.addEventListener("click", openContactModal);
    els.mobileContactBtn.addEventListener("click", openContactModal);
    els.closeContactBtn.addEventListener("click", closeContactModal);
    els.contactModal.addEventListener("click", (e) => {
      if (e.target === els.contactModal) closeContactModal();
    });

    els.copyEmailBtn.addEventListener("click", () => {
      copyText(state.profile.email, () => {
        els.copyFeedback.textContent = "Alamat surel disalin.";
        setTimeout(() => {
          els.copyFeedback.textContent = "";
        }, 2400);
      });
    });

    els.modalCopyEmailBtn.addEventListener("click", () => {
      copyText(state.profile.email, () => {
        els.modalCopyEmailBtn.textContent = "Tersalin";
        setTimeout(() => {
          els.modalCopyEmailBtn.textContent = "Salin";
        }, 2000);
      });
    });

    els.contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("senderName").value.trim();
      const email = document.getElementById("senderEmail").value.trim();
      const subject = document.getElementById("senderSubject").value.trim();
      const message = document.getElementById("senderMessage").value.trim();
      if (!name || !subject || !message) return;

      els.contactSubmitBtn.disabled = true;
      els.contactStatus.textContent = "Mengirim pesan...";

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, subject, message })
        });
        const result = await res.json();
        if (result.savedToDatabase) {
          els.contactStatus.textContent = "Tersimpan ke basis data Supabase. Terima kasih atas pesan Anda.";
          els.contactForm.reset();
          return;
        }
      } catch {
        // Lanjut ke mailto bila API / DB tidak tersedia
      } finally {
        els.contactSubmitBtn.disabled = false;
      }

      const mailto = `mailto:${state.profile.email}?subject=${encodeURIComponent(
        `[Blog] ${subject} — ${name}`
      )}&body=${encodeURIComponent(`Halo Vandre,\n\n${message}\n\nSalam,\n${name}${email ? ` (${email})` : ""}`)}`;
      els.contactStatus.textContent = "Membuka aplikasi surel Anda...";
      window.location.href = mailto;
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!els.readerModal.hidden) closeReader();
        if (!els.contactModal.hidden) closeContactModal();
      }
    });

    // Proteksi klik kanan & drag pada seluruh foto/logo/ilustrasi
    document.addEventListener("contextmenu", (e) => {
      if (e.target.closest("img, .portrait-frame, .logo-thumb, .card-atmospheric, .hero")) {
        e.preventDefault();
      }
    });
    document.addEventListener("dragstart", (e) => {
      if (e.target.tagName === "IMG" || e.target.closest(".portrait-frame, .logo-thumb, .card-atmospheric")) {
        e.preventDefault();
      }
    });
  }

  function init() {
    if (els.yearNow) {
      els.yearNow.textContent = String(new Date().getFullYear());
    }
    setHeaderState();
    renderFilters();
    renderPosts();
    renderHighlights();
    renderLogos();
    renderProjects();
    renderExperience();
    updateDbStatusNote();
    bindEvents();
    handleHashNavigation();
    hydrateFromApi();
    loadFeeds();
  }

  init();
})();
