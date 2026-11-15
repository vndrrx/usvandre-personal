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
      slug: "simlog-bulog",
      idx: "02",
      name: "SIMLOG PERUM BULOG",
      shortOrigin: "Vercel Live",
      sourceGroup: "live",
      color: "#0f766e",
      originLabel: "TypeScript · Vercel Live Deployment",
      demoUrl: "https://bulog-inventory-dashboard.vercel.app",
      githubUrl: "",
      localhostUrl: "",
      quote: "“Pemantauan inventaris dan stok gudang disajikan dalam satu layar ringkas.”",
      desc: "Dashboard manajemen inventaris SIMLOG PERUM BULOG untuk memantau metrik stok, pergerakan gudang, serta status logistik secara real-time.",
      tags: ["TypeScript", "Next.js", "Inventory UI"]
    },
    {
      slug: "kumpulan-pai-games",
      idx: "03",
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
      slug: "bookdaily",
      idx: "05",
      name: "BookDaily Reading Log",
      shortOrigin: "XAMPP PHP/MySQL",
      sourceGroup: "xampp",
      color: "#7c2d12",
      originLabel: "Localhost XAMPP (htdocs/BookDaily · PHP + PDO MySQL)",
      demoUrl: "demos/bookdaily/index.html",
      githubUrl: "",
      localhostUrl: "http://localhost/BookDaily/",
      quote: "“Mencatat buku selesai dibaca, ulasan kutipan, dan daftar Wishlist.”",
      desc: "Aplikasi PHP & MySQL pribadi untuk mendokumentasikan riwayat bacaan buku beserta tanggal selesai dan catatan refleksi.",
      tags: ["PHP", "PDO MySQL", "XAMPP"]
    },
    {
      slug: "brimen",
      idx: "06",
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
      idx: "07",
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
      idx: "08",
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
    }
  ];

  const els = {
    ribbon: document.getElementById("folderRibbon"),
    quote: document.getElementById("activeLaurelQuote"),
    filterRow: document.getElementById("sourceFilterRow"),
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

  function filteredList() {
    if (activeFilter === "all") return WEBSITES;
    return WEBSITES.filter((w) => w.sourceGroup === activeFilter);
  }

  function renderFolderRibbon() {
    const list = filteredList();
    els.ribbon.innerHTML = "";

    const mid = (list.length - 1) / 2;
    list.forEach((site, i) => {
      const isActive = site.slug === activeSlug;

      const folder = document.createElement("button");
      folder.type = "button";
      folder.className = `folder-tab-card ${isActive ? "is-active" : ""}`;
      folder.style.setProperty("--folder-bg", site.color);
      folder.style.setProperty("--diag-step", String(i - mid));
      folder.style.setProperty("--z-idx", String(i + 1));
      folder.setAttribute("aria-label", `Buka Live Demo ${site.name}`);
      folder.innerHTML = `
        <div class="folder-tab-ear">${site.idx}</div>
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
        <div class="folder-card-caption">
          <div class="folder-name">${site.name}</div>
          <span class="folder-origin">${site.shortOrigin}</span>
        </div>
      `;

      folder.addEventListener("mouseenter", () => {
        els.quote.textContent = site.quote;
      });
      folder.addEventListener("click", () => openDemoModal(site.slug));
      els.ribbon.appendChild(folder);
    });
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

    els.iframe.src = site.demoUrl;
    renderFolderRibbon();
  }

  function openDemoModal(slug) {
    const site = WEBSITES.find((w) => w.slug === slug) || WEBSITES[0];
    populateDemoModal(site);
    els.liveDemoModal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeDemoModal() {
    els.liveDemoModal.hidden = true;
    els.iframe.src = "about:blank";
    activeSlug = null;
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
    els.filterRow.querySelectorAll(".source-chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    renderFolderRibbon();
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

  els.menuToggle?.addEventListener("click", () => {
    const open = els.mobileMenu.hasAttribute("hidden");
    if (open) {
      els.mobileMenu.removeAttribute("hidden");
      els.menuToggle.setAttribute("aria-expanded", "true");
    } else {
      els.mobileMenu.setAttribute("hidden", "");
      els.menuToggle.setAttribute("aria-expanded", "false");
    }
  });

  renderFolderRibbon();
})();
