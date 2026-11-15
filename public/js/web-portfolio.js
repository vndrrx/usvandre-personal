(() => {
  const WEBSITES = [
    {
      slug: "foxsanews",
      idx: "01",
      name: "FoxSA News Portal",
      shortOrigin: "Vercel + GitHub",
      sourceGroup: "live",
      color: "#0f172a",
      originLabel: "GitHub (vndrrx/foxsanews) · Vercel Live",
      demoUrl: "https://foxsanews.vercel.app",
      githubUrl: "https://github.com/vndrrx/foxsanews",
      localhostUrl: "",
      quote: "“Portal berita digital dengan tata letak redaksi yang bersih dan cepat dibaca.”",
      desc: "Portal berita independen lengkap dengan pemisahan kanal rubrik, halaman artikel berfokus keterbacaan, dan integrasi deployment otomatis ke Vercel.",
      tags: ["JavaScript", "Vercel", "Editorial UI"]
    },
    {
      slug: "kumpulan-pai-games",
      idx: "02",
      name: "Kumpulan Game Edukasi PAI",
      shortOrigin: "Vercel + XAMPP",
      sourceGroup: "live",
      color: "#b45309",
      originLabel: "GitHub (vndrrx/kumpulan-PAI-games) · Vercel Live",
      demoUrl: "https://kumpulan-pai-games.vercel.app",
      githubUrl: "https://github.com/vndrrx/kumpulan-PAI-games",
      localhostUrl: "http://localhost/kumpulan-game-pai/",
      quote: "“Belajar materi PAI terasa ringan lewat kuis kotak, benar-salah, dan tarik tambang.”",
      desc: "Kumpulan mini-game edukasi interaktif untuk pembelajaran Pendidikan Agama Islam dilengkapi efek audio dan beragam mode permainan kelas.",
      tags: ["JavaScript", "Game Edukasi", "Audio Interaktif"]
    },
    {
      slug: "bulog-warehouse",
      idx: "03",
      name: "PERUM BULOG Inventaris",
      shortOrigin: "XAMPP PHP/MySQL",
      sourceGroup: "xampp",
      color: "#1e3a8a",
      originLabel: "Localhost XAMPP (htdocs/bulog-web · PHP + MySQLi)",
      demoUrl: "demos/bulog/index.html",
      githubUrl: "",
      localhostUrl: "http://localhost/bulog-web/",
      quote: "“Pemantauan stok minimum, barang masuk, dan keluar gudang tersaji dalam satu dashboard.”",
      desc: "Aplikasi Warehouse Inventory Information System PERUM BULOG dari folder localhost XAMPP (htdocs/bulog-web) berbasis PHP dan MySQLi dengan peringatan stok rendah dan laporan transaksi.",
      tags: ["PHP", "MySQLi", "XAMPP"]
    },
    {
      slug: "mlbb-moba-manager",
      idx: "04",
      name: "Esport MOBA Manager",
      shortOrigin: "XAMPP · Live",
      sourceGroup: "xampp",
      color: "#1d4ed8",
      originLabel: "Localhost XAMPP (htdocs/MLBB) · Live Demo Aktif",
      demoUrl: "demos/mlbb-manager/index.html",
      githubUrl: "",
      localhostUrl: "http://localhost/MLBB/",
      quote: "“Simulasi manajemen tim esports dengan sistem draft, meta AI engine, dan tema ganda.”",
      desc: "Aplikasi simulasi manajer klub MOBA dari folder localhost XAMPP yang berjalan utuh di browser dengan tema Dark Slate & Soft Sage serta logika pertandingan.",
      tags: ["HTML5", "Tailwind CSS", "AI Match Engine"]
    },
    {
      slug: "brimen",
      idx: "05",
      name: "Sistem Arsip BRIMEN",
      shortOrigin: "XAMPP PHP/MySQL",
      sourceGroup: "xampp",
      color: "#1e40af",
      originLabel: "Localhost XAMPP (htdocs/brimen · PHP + MySQL)",
      demoUrl: "demos/brimen/index.html",
      githubUrl: "",
      localhostUrl: "http://localhost/brimen/",
      quote: "“Rekap berkas nasabah terverifikasi dan pemantauan status persetujuan.”",
      desc: "Sistem manajemen arsip berkas nasabah berbasis PHP dan MySQL lengkap dengan statistik verifikasi dan alur persetujuan berkas di dashboard operator.",
      tags: ["PHP", "MySQL", "Dashboard Admin"]
    },
    {
      slug: "dukcakpil",
      idx: "06",
      name: "Disdukcapil Batu Bara",
      shortOrigin: "XAMPP PHP/MySQL",
      sourceGroup: "xampp",
      color: "#334155",
      originLabel: "Localhost XAMPP (htdocs/dukcakpil-web · PHP + MySQL)",
      demoUrl: "demos/dukcakpil/index.html",
      githubUrl: "",
      localhostUrl: "http://localhost/dukcakpil-web/",
      quote: "“Portal layanan pengaduan KTP-el dan validasi NIK untuk masyarakat.”",
      desc: "Web layanan publik untuk mengajukan pengaduan sinkronisasi KTP dan NIK ganda lengkap dengan dasbor operator serta panduan prosedur pengaduan.",
      tags: ["PHP", "MySQL", "Layanan Publik"]
    },
    {
      slug: "bpn-simalungun",
      idx: "07",
      name: "BPN Simalungun Berkas",
      shortOrigin: "XAMPP PHP/MySQL",
      sourceGroup: "xampp",
      color: "#14532d",
      originLabel: "Localhost XAMPP (htdocs/BPNSIMALUNGUN2 · PHP + MySQL)",
      demoUrl: "demos/bpn-simalungun/index.html",
      githubUrl: "",
      localhostUrl: "http://localhost/BPNSIMALUNGUN2/",
      quote: "“Pelacakan berkas pertanahan yang terstruktur dari loket hingga selesai.”",
      desc: "Sistem informasi administrasi dan pelacakan berkas pertanahan berbasis PHP dan MySQL dengan fitur login petugas, rekap modul, dan pencarian berkas.",
      tags: ["PHP", "MySQL", "Sistem Informasi"]
    },
    {
      slug: "dprd-batubara",
      idx: "08",
      name: "DPRD Batubara",
      shortOrigin: "XAMPP PHP/MySQL",
      sourceGroup: "xampp",
      color: "#31404B",
      originLabel: "Localhost XAMPP (htdocs/DPRD Batubara · PHP + MySQL)",
      demoUrl: "demos/dprd-batubara/index.html",
      githubUrl: "",
      localhostUrl: "http://localhost/DPRD%20Batubara/",
      reportUrl: "docs/Laporan-PKL-DPRD-Batubara.pdf",
      articleUrl: "index.html#post/laporan-pkl-website-berita-dprd-batubara-2023",
      quote: "“Portal berita dan informasi resmi Sekretariat DPRD Kabupaten Batu Bara.”",
      desc: "Portal berita daerah berbasis PHP & MySQL (6 tabel: users, berita, kategori_berita, berita_kategori, comment, views) dengan 161 berita resmi DPRD & Kabupaten Batu Bara, data lengkap AKD/Komisi I-IV, Fraksi 2024-2029 & 2019-2024, galeri video, dokumen publik, serta CMS admin terintegrasi di beranda.",
      tags: ["PHP", "MySQL", "Portal CMS"]
    }
  ];

  const els = {
    ribbon: document.getElementById("folderRibbon"),
    quote: document.getElementById("activeLaurelQuote"),
    filterRow: document.getElementById("sourceFilterRow"),
    folderPrevBtn: document.getElementById("folderPrevBtn"),
    folderNextBtn: document.getElementById("folderNextBtn"),
    folderDeckCounter: document.getElementById("folderDeckCounter"),
    liveDemoModal: document.getElementById("liveDemoModal"),
    demoModalBackdrop: document.getElementById("demoModalBackdrop"),
    closeDemoModalBtn: document.getElementById("closeDemoModalBtn"),
    demoPrevBtn: document.getElementById("demoPrevBtn"),
    demoNextBtn: document.getElementById("demoNextBtn"),
    urlPill: document.getElementById("chromeUrlPill"),
    originBadge: document.getElementById("demoOriginBadge"),
    title: document.getElementById("demoTitle"),
    desc: document.getElementById("demoDesc"),
    tags: document.getElementById("demoTags"),
    actions: document.getElementById("demoActions"),
    iframe: document.getElementById("demoIframe"),
    menuToggle: document.getElementById("menuToggle"),
    mobileMenu: document.getElementById("mobileMenu"),
    yearNow: document.getElementById("yearNow")
  };

  if (els.yearNow) els.yearNow.textContent = String(new Date().getFullYear());

  let activeFilter = "all";
  let activeSlug = null;
  let mobileOpenSlug = null;
  let mobileFocusIndex = 0;
  let mobileTouchStartX = null;
  let mobileTouchStartY = null;
  const isMobileStack = () => window.matchMedia("(max-width: 760px)").matches;

  function filteredList() {
    if (activeFilter === "all") return WEBSITES;
    return WEBSITES.filter((w) => w.sourceGroup === activeFilter);
  }

  function layoutMobileDeck(list) {
    const mobile = isMobileStack();
    const cards = Array.from(els.ribbon.querySelectorAll(".folder-tab-card"));
    const total = cards.length;
    if (!total) return;

    if (mobileFocusIndex >= total || mobileFocusIndex < 0) {
      mobileFocusIndex = 0;
    }

    if (els.folderDeckCounter) {
      els.folderDeckCounter.textContent = `${mobileFocusIndex + 1} / ${total}`;
    }

    cards.forEach((card, idx) => {
      const slug = card.dataset.slug;
      const isOpen = mobile && slug === mobileOpenSlug;
      card.classList.toggle("is-mobile-open", isOpen);
      card.setAttribute("aria-expanded", mobile ? (isOpen ? "true" : "false") : "false");

      if (!mobile) {
        delete card.dataset.offset;
        card.style.transform = "";
        card.style.opacity = "";
        card.style.filter = "";
        card.style.zIndex = "";
        card.style.pointerEvents = "";
        return;
      }

      const offset = (idx - mobileFocusIndex + total) % total;
      const maxVisible = Math.min(total - 1, 4);
      card.dataset.offset = String(offset);

      if (offset === 0) {
        const y = isOpen ? -6 : 0;
        const z = isOpen ? 150 : 120;
        const rotY = isOpen ? 0 : -3;
        card.style.zIndex = isOpen ? "65" : "50";
        card.style.opacity = "1";
        card.style.filter = "brightness(1)";
        card.style.pointerEvents = "auto";
        card.style.transform = `translate3d(0px, ${y}px, ${z}px) rotateY(${rotY}deg) scale(1)`;
      } else if (offset <= maxVisible) {
        const stepX = window.innerWidth <= 420 ? 48 : 54;
        const x = (isOpen ? 10 : 0) + offset * stepX;
        const y = -offset * 3;
        const z = Math.max(0, 96 - offset * 22);
        const scale = Math.max(0.78, 1 - offset * 0.055);
        const brightness = Math.max(0.84, 1 - offset * 0.04);
        card.style.zIndex = String(50 - offset);
        card.style.opacity = "1";
        card.style.filter = `brightness(${brightness})`;
        card.style.pointerEvents = "auto";
        card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(-15deg) scale(${scale})`;
      } else {
        const backX = (maxVisible + 1) * 48;
        card.style.zIndex = "1";
        card.style.opacity = "0";
        card.style.filter = "brightness(0.8)";
        card.style.pointerEvents = "none";
        card.style.transform = `translate3d(${backX}px, -12px, -20px) rotateY(-18deg) scale(0.74)`;
      }
    });
  }

  function syncMobileOpenState() {
    layoutMobileDeck(filteredList());
  }

  function stepMobileDeck(delta) {
    const list = filteredList();
    if (!list.length) return;
    mobileFocusIndex = (mobileFocusIndex + delta + list.length) % list.length;
    mobileOpenSlug = null;
    const focused = list[mobileFocusIndex];
    if (focused && els.quote) els.quote.textContent = focused.quote;
    layoutMobileDeck(list);
  }

  function renderFolderRibbon() {
    const list = filteredList();
    els.ribbon.innerHTML = "";

    const mid = (list.length - 1) / 2;
    list.forEach((site, i) => {
      const isActive = site.slug === activeSlug;
      const isMobileOpen = isMobileStack() && site.slug === mobileOpenSlug;

      const folder = document.createElement("div");
      folder.className = `folder-tab-card${isActive ? " is-active" : ""}${isMobileOpen ? " is-mobile-open" : ""}`;
      folder.dataset.slug = site.slug;
      folder.style.setProperty("--folder-bg", site.color);
      folder.style.setProperty("--diag-step", String(i - mid));
      folder.style.setProperty("--z-idx", String(i + 1));
      folder.setAttribute("role", "button");
      folder.setAttribute("tabindex", "0");
      folder.setAttribute("aria-label", `Berkas ${site.name}`);
      folder.setAttribute("aria-expanded", isMobileOpen ? "true" : "false");
      const tagsHtml = site.tags.slice(0, 3).map((tag) => `<span>${tag}</span>`).join("");
      folder.innerHTML = `
        <div class="folder-tab-ear">${site.idx}</div>
        <span class="folder-peek-num" aria-hidden="true">${site.idx}</span>
        <div class="folder-card-caption">
          <div class="folder-title-row">
            <span class="folder-idx-inline">${site.idx}</span>
            <div class="folder-name">${site.name}</div>
          </div>
          <div class="folder-caption-meta">
            <span class="folder-origin">${site.shortOrigin}</span>
            <button type="button" class="folder-mobile-close" aria-label="Tutup berkas ${site.name}">&times;</button>
          </div>
        </div>
        <div class="folder-cover-meta">
          <p class="folder-cover-quote">${site.quote}</p>
          <div class="folder-cover-tags">${tagsHtml}</div>
          <div class="folder-cover-cue">Ketuk untuk buka pratinjau &rarr;</div>
        </div>
        <div class="folder-live-preview">
          <iframe
            src="${site.demoUrl}"
            title="Pratinjau ${site.name}"
            loading="lazy"
            tabindex="-1"
            aria-hidden="true"
          ></iframe>
          <div class="folder-preview-tint"></div>
        </div>
        <div class="folder-mobile-drawer">
          <p class="folder-mobile-quote">${site.quote}</p>
          <button type="button" class="folder-mobile-open-demo">
            Buka Live Demo Interaktif &rarr;
          </button>
        </div>
      `;

      const closeBtn = folder.querySelector(".folder-mobile-close");
      closeBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        mobileOpenSlug = null;
        layoutMobileDeck(list);
      });

      const demoBtn = folder.querySelector(".folder-mobile-open-demo");
      demoBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        openDemoModal(site.slug);
      });

      const previewEl = folder.querySelector(".folder-live-preview");
      previewEl?.addEventListener("click", (e) => {
        if (!isMobileStack()) return;
        e.stopPropagation();
        if (mobileOpenSlug === site.slug) {
          openDemoModal(site.slug);
        }
      });

      folder.addEventListener("mouseenter", () => {
        els.quote.textContent = site.quote;
      });

      const handleTrigger = () => {
        if (isMobileStack()) {
          if (mobileFocusIndex !== i) {
            mobileFocusIndex = i;
            mobileOpenSlug = site.slug;
          } else {
            mobileOpenSlug = mobileOpenSlug === site.slug ? null : site.slug;
          }
          els.quote.textContent = site.quote;
          layoutMobileDeck(list);
        } else {
          openDemoModal(site.slug);
        }
      };

      folder.addEventListener("click", handleTrigger);
      folder.addEventListener("keydown", (e) => {
        if (e.target !== folder) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleTrigger();
        }
      });

      els.ribbon.appendChild(folder);
    });

    layoutMobileDeck(list);
  }

  function populateDemoModal(site) {
    activeSlug = site.slug;
    els.quote.textContent = site.quote;
    els.urlPill.textContent = site.demoUrl.startsWith("http")
      ? site.demoUrl
      : `${window.location.origin}/${site.demoUrl}`;
    els.originBadge.textContent = site.originLabel;
    els.title.textContent = site.name;
    els.desc.textContent = site.desc;

    els.tags.innerHTML = "";
    site.tags.forEach((t) => {
      const span = document.createElement("span");
      span.textContent = t;
      els.tags.appendChild(span);
    });

    els.actions.innerHTML = "";
    const openLive = document.createElement("a");
    openLive.href = site.demoUrl;
    openLive.target = "_blank";
    openLive.rel = "noopener noreferrer";
    openLive.className = "btn-pill btn-pill-dark";
    openLive.textContent = "Buka Tab Baru ↗";
    els.actions.appendChild(openLive);

    if (site.githubUrl) {
      const gh = document.createElement("a");
      gh.href = site.githubUrl;
      gh.target = "_blank";
      gh.rel = "noopener noreferrer";
      gh.className = "btn-pill btn-pill-ghost";
      gh.textContent = "GitHub ↗";
      els.actions.appendChild(gh);
    }

    if (site.localhostUrl) {
      const lx = document.createElement("a");
      lx.href = site.localhostUrl;
      lx.target = "_blank";
      lx.rel = "noopener noreferrer";
      lx.className = "btn-pill btn-pill-ghost";
      lx.textContent = "Localhost XAMPP ↗";
      lx.title = "Berfungsi saat Apache/MySQL XAMPP aktif di komputer Anda";
      els.actions.appendChild(lx);
    }

    if (site.reportUrl) {
      const docLink = document.createElement("a");
      docLink.href = site.reportUrl;
      docLink.target = "_blank";
      docLink.rel = "noopener noreferrer";
      docLink.className = "btn-pill btn-pill-ghost";
      docLink.textContent = "Laporan PKL DPRD Batubara (PDF) ↗";
      els.actions.appendChild(docLink);
    }

    if (site.articleUrl) {
      const postLink = document.createElement("a");
      postLink.href = site.articleUrl;
      postLink.className = "btn-pill btn-pill-ghost";
      postLink.textContent = "Ringkasan Laporan ↗";
      els.actions.appendChild(postLink);
    }

    els.iframe.src = site.demoUrl;
    renderFolderRibbon();
  }

  function openDemoModal(slug) {
    const site = WEBSITES.find((w) => w.slug === slug) || WEBSITES[0];
    populateDemoModal(site);
    els.liveDemoModal.hidden = false;
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
  }

  function closeDemoModal() {
    els.liveDemoModal.hidden = true;
    els.iframe.src = "about:blank";
    activeSlug = null;
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
    renderFolderRibbon();
  }

  function stepDemo(delta) {
    const list = filteredList();
    if (list.length === 0) return;
    const idx = list.findIndex((w) => w.slug === activeSlug);
    const next = list[(idx + delta + list.length) % list.length];
    populateDemoModal(next);
  }

  els.filterRow?.addEventListener("click", (e) => {
    const btn = e.target.closest(".source-chip");
    if (!btn) return;
    activeFilter = btn.dataset.source || "all";
    mobileOpenSlug = null;
    mobileFocusIndex = 0;
    els.filterRow.querySelectorAll(".source-chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    renderFolderRibbon();
  });

  els.folderPrevBtn?.addEventListener("click", () => stepMobileDeck(-1));
  els.folderNextBtn?.addEventListener("click", () => stepMobileDeck(1));

  els.ribbon?.addEventListener(
    "touchstart",
    (e) => {
      if (!isMobileStack() || !e.changedTouches.length) return;
      mobileTouchStartX = e.changedTouches[0].clientX;
      mobileTouchStartY = e.changedTouches[0].clientY;
    },
    { passive: true }
  );

  els.ribbon?.addEventListener(
    "touchend",
    (e) => {
      if (!isMobileStack() || mobileTouchStartX === null || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - mobileTouchStartX;
      const dy = e.changedTouches[0].clientY - (mobileTouchStartY ?? 0);
      mobileTouchStartX = null;
      mobileTouchStartY = null;
      if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.15) {
        stepMobileDeck(dx < 0 ? 1 : -1);
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    syncMobileOpenState();
  });

  document.querySelectorAll(".vp-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".vp-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      els.iframe.classList.remove("vp-tablet", "vp-mobile");
      if (btn.dataset.vp === "tablet") els.iframe.classList.add("vp-tablet");
      if (btn.dataset.vp === "mobile") els.iframe.classList.add("vp-mobile");
    });
  });

  els.closeDemoModalBtn?.addEventListener("click", closeDemoModal);
  els.demoModalBackdrop?.addEventListener("click", closeDemoModal);
  els.demoPrevBtn?.addEventListener("click", () => stepDemo(-1));
  els.demoNextBtn?.addEventListener("click", () => stepDemo(1));

  document.addEventListener("keydown", (e) => {
    if (els.liveDemoModal.hidden) return;
    if (e.key === "Escape") closeDemoModal();
    if (e.key === "ArrowLeft") stepDemo(-1);
    if (e.key === "ArrowRight") stepDemo(1);
  });

  if (els.menuToggle && !els.menuToggle.dataset.boundMenu) {
    els.menuToggle.dataset.boundMenu = "1";
    els.menuToggle.addEventListener("click", () => {
      const open = els.mobileMenu.hasAttribute("hidden");
      if (open) {
        els.mobileMenu.removeAttribute("hidden");
        els.menuToggle.setAttribute("aria-expanded", "true");
      } else {
        els.mobileMenu.setAttribute("hidden", "");
        els.menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function openInitialDemoFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const paramSlug = (params.get("project") || "").trim();
    const hashSlug = window.location.hash.replace(/^#/, "").trim();
    const targetSlug = paramSlug || hashSlug;
    if (!targetSlug) return;
    const matched = WEBSITES.find((w) => w.slug === targetSlug);
    if (matched) openDemoModal(matched.slug);
  }

  renderFolderRibbon();
  openInitialDemoFromUrl();
})();
