/**
 * Pengendali antarmuka blog Usvandre Nur.
 * Terhubung ke API backend Vercel (/api/posts, /api/portfolio, /api/feeds, /api/contact)
 * dengan fallback aman ke window.BLOG_DATA saat dibuka tanpa server.
 */
(() => {
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

  const state = {
    activeCategory: "Semua",
    searchQuery: "",
    activePost: null,
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
    els.header.classList.toggle("scrolled", window.scrollY > 18);
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

  function renderPosts() {
    const filtered = getFilteredPosts();
    els.postsGrid.innerHTML = "";
    els.emptyState.hidden = filtered.length > 0;

    filtered.forEach((post) => {
      const card = document.createElement("article");
      card.className = "post-card";
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
      card.querySelector(".post-time").textContent = post.read_time || post.readTime || "5 menit baca";
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
      els.highlightsPreview.appendChild(box);
    });
  }

  function renderLogos() {
    if (!els.logosGrid) return;
    els.logosGrid.innerHTML = "";
    state.logos.forEach((logo) => {
      const card = document.createElement("article");
      card.className = "logo-card";
      const isDark = logo.image.includes("aky-crest");
      card.innerHTML = `
        <div class="logo-thumb ${isDark ? "dark-thumb" : ""}">
          <img loading="lazy" alt="" />
        </div>
        <div class="logo-meta">
          <span class="logo-cat"></span>
          <h3></h3>
          <p></p>
        </div>
      `;
      const img = card.querySelector("img");
      img.src = logo.image;
      img.alt = `Logo ${logo.name}`;
      card.querySelector(".logo-cat").textContent = `${logo.category} · ${logo.source}`;
      card.querySelector("h3").textContent = logo.name;
      card.querySelector("p").textContent = logo.note;
      els.logosGrid.appendChild(card);
    });
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
      els.feedsStatusPill.textContent = `Tersinkronisasi · ${items.length} cuplikan dari Substack & Threads`;
      els.feedsGrid.innerHTML = "";
      items.forEach((item) => {
        const isThreads = item.platform === "threads";
        const card = document.createElement("article");
        card.className = "feed-card";
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
        card.querySelector("h3").textContent = item.title;
        card.querySelector(".feed-excerpt").textContent = item.excerpt;
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
    els.readerTime.textContent = post.read_time || post.readTime || "5 menit baca";
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

    if (updateHash) {
      history.replaceState(null, "", `#post/${post.slug}`);
    }
  }

  function closeReader() {
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
