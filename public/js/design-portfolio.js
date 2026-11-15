(() => {
  const DESIGNS = [
    {
      id: "pai-muda-berakhlak",
      title: "Muda, Cerdas, BERAKHLAK",
      category: "Poster & Kampanye",
      source: "Tugas Kreatif PAI · Usvandre Nur",
      image: "assets/designs/pai-muda-berakhlak.jpg",
      spineColor: "#f59e0b",
      isLogoMat: false,
      summary:
        "Poster ilustrasi bertema literasi dan etos kerja ('Kerja Keras adalah Ibadah, Berkarya Bawa Berkah') yang memadukan komposisi buku terbuka di atas hamparan hijau dengan pencahayaan senja hangat."
    },
    {
      id: "infinite-esport",
      title: "Infinite Esport — Identitas Visual & Wordmark",
      category: "Identitas & Logo",
      source: "Logo Utama · vandroidd Studio",
      image: "assets/logos/infinite-esport.jpg",
      spineColor: "#38bdf8",
      isLogoMat: true,
      summary:
        "Simbol pita tak hingga (infinity) dengan tipografi tegas. Gradasi hijau–biru terinspirasi dari elemen Bumi yang hidup dan seimbang, sementara biru–ungu terinspirasi dari keluasan Galaksi.",
      philosophy: [
        {
          label: "Hijau – Biru · Inspirasi Bumi",
          tone: "earth",
          detail: "Melambangkan keseimbangan, pertumbuhan, ketenangan, dan pijakan yang membumi."
        },
        {
          label: "Biru – Ungu · Inspirasi Galaksi",
          tone: "galaxy",
          detail: "Melambangkan kedalaman semesta, energi kreatif, ambisi, dan visi masa depan."
        }
      ]
    },
    {
      id: "foxsa-hiring",
      title: "FoxSA News Agency — We're Hiring!",
      category: "Media Sosial & Iklan",
      source: "Poster Rekrutmen · FoxSA Network",
      image: "assets/designs/foxsa-hiring.jpg",
      spineColor: "#3b82f6",
      isLogoMat: false,
      summary:
        "Poster rekrutmen vertikal dengan kolase enam cuplikan antarmuka portal berita FoxSA sebagai latar bergrid serta hierarki tipografi tegas di bagian tengah."
    },
    {
      id: "brownies-promo",
      title: "oh.. Brownies — Lezat dan Bergizi",
      category: "Media Sosial & Iklan",
      source: "Poster Promosi · Kuliner",
      image: "assets/designs/brownies-promo.jpg",
      spineColor: "#d97706",
      isLogoMat: false,
      summary:
        "Materi promosi produk kuliner bernuansa cokelat pekat, menggabungkan tipografi script kasual, visual tumpukan brownies panggang, dan tata letak informasi pemesanan."
    }
  ];

  const els = {
    filterRow: document.getElementById("designFilterRow"),
    viewRackBtn: document.getElementById("viewRackBtn"),
    viewGridBtn: document.getElementById("viewGridBtn"),
    coverflowShell: document.getElementById("coverflowShell"),
    coverflowTrack: document.getElementById("coverflowTrack"),
    designGridView: document.getElementById("designGridView"),
    activeDesignCat: document.getElementById("activeDesignCat"),
    activeDesignSource: document.getElementById("activeDesignSource"),
    activeDesignTitle: document.getElementById("activeDesignTitle"),
    activeDesignSummary: document.getElementById("activeDesignSummary"),
    prevDesignBtn: document.getElementById("prevDesignBtn"),
    nextDesignBtn: document.getElementById("nextDesignBtn"),
    inspectActiveDesignBtn: document.getElementById("inspectActiveDesignBtn"),
    designModal: document.getElementById("designModal"),
    closeDesignModalBtn: document.getElementById("closeDesignModalBtn"),
    designModalCat: document.getElementById("designModalCat"),
    designModalMediaWrap: document.getElementById("designModalMediaWrap"),
    designModalImg: document.getElementById("designModalImg"),
    designModalTitle: document.getElementById("designModalTitle"),
    designModalMeta: document.getElementById("designModalMeta"),
    designModalDesc: document.getElementById("designModalDesc"),
    designModalPhilosophy: document.getElementById("designModalPhilosophy"),
    menuToggle: document.getElementById("menuToggle"),
    mobileMenu: document.getElementById("mobileMenu")
  };

  const state = {
    category: "Semua",
    viewMode: "rack",
    activeIndex: 1
  };

  function getFiltered() {
    if (state.category === "Semua") return DESIGNS;
    return DESIGNS.filter((d) => d.category === state.category);
  }

  function updateCaption(item) {
    if (!item) return;
    els.activeDesignCat.textContent = item.category;
    els.activeDesignSource.textContent = item.source;
    els.activeDesignTitle.textContent = item.title;
    els.activeDesignSummary.textContent = item.summary;
  }

  function layoutCoverflow(items) {
    const cards = Array.from(els.coverflowTrack.querySelectorAll(".sleeve-card"));
    const compact = window.innerWidth < 760;
    const stepX = compact ? 112 : 168;
    const extraSpread = compact ? 52 : 76;

    cards.forEach((card, idx) => {
      const offset = idx - state.activeIndex;
      const absOffset = Math.abs(offset);

      if (offset === 0) {
        card.dataset.active = "true";
        card.dataset.side = "center";
        card.style.zIndex = "30";
        card.style.opacity = "1";
        card.style.filter = "brightness(1)";
        card.style.transform = "translateX(0px) translateZ(90px) rotateY(0deg) scale(1.04)";
      } else {
        const dir = offset < 0 ? -1 : 1;
        card.dataset.active = "false";
        card.dataset.side = dir < 0 ? "left" : "right";
        const x = dir * (extraSpread + absOffset * stepX);
        const z = -95 - (absOffset - 1) * 58;
        const rotY = dir * -50;
        const scale = Math.max(0.82, 0.94 - (absOffset - 1) * 0.05);
        card.style.zIndex = String(24 - absOffset);
        card.style.opacity = String(Math.max(0.42, 1 - absOffset * 0.14));
        card.style.filter = `brightness(${Math.max(0.68, 0.92 - (absOffset - 1) * 0.1)})`;
        card.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rotY}deg) scale(${scale})`;
      }
    });

    updateCaption(items[state.activeIndex]);
  }

  function renderCoverflow() {
    const items = getFiltered();
    if (!items.length) return;
    if (state.activeIndex >= items.length) state.activeIndex = 0;

    els.coverflowTrack.innerHTML = "";
    items.forEach((item, idx) => {
      const card = document.createElement("article");
      card.className = "sleeve-card";
      card.style.setProperty("--spine-color", item.spineColor);
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `${item.title} (${item.category})`);

      card.innerHTML = `
        <div class="sleeve-surface ${item.isLogoMat ? "is-logo-mat" : ""}" oncontextmenu="return false;">
          <span class="sleeve-spine-accent" aria-hidden="true"></span>
          <img src="${item.image}" alt="${item.title}" draggable="false" />
          <div class="img-shield" aria-hidden="true"></div>
        </div>
      `;

      card.addEventListener("click", () => {
        if (state.activeIndex === idx) {
          openModal(item);
        } else {
          state.activeIndex = idx;
          layoutCoverflow(items);
        }
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (state.activeIndex === idx) {
            openModal(item);
          } else {
            state.activeIndex = idx;
            layoutCoverflow(items);
          }
        }
      });

      els.coverflowTrack.appendChild(card);
    });

    layoutCoverflow(items);
  }

  function renderGrid() {
    const items = getFiltered();
    els.designGridView.innerHTML = "";
    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "design-grid-card";
      card.innerHTML = `
        <div class="design-grid-thumb ${item.isLogoMat ? "is-logo-mat" : ""}" oncontextmenu="return false;">
          <img src="${item.image}" alt="${item.title}" loading="lazy" draggable="false" />
          <div class="img-shield" aria-hidden="true"></div>
        </div>
        <div class="design-grid-info">
          <div class="coverflow-meta-row">
            <span class="design-tag-dark">${item.category}</span>
          </div>
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
        </div>
      `;
      card.addEventListener("click", () => openModal(item));
      els.designGridView.appendChild(card);
    });
  }

  function renderAll() {
    const isRack = state.viewMode === "rack";
    els.coverflowShell.hidden = !isRack;
    els.designGridView.hidden = isRack;
    els.viewRackBtn.classList.toggle("active", isRack);
    els.viewGridBtn.classList.toggle("active", !isRack);

    if (isRack) {
      renderCoverflow();
    } else {
      renderGrid();
    }
  }

  function openModal(item) {
    if (!item) return;
    els.designModalCat.textContent = item.category;
    els.designModalImg.src = item.image;
    els.designModalImg.alt = item.title;
    els.designModalMediaWrap.style.background = item.isLogoMat ? "#ffffff" : "#11131a";
    els.designModalTitle.textContent = item.title;
    els.designModalMeta.textContent = item.source;
    els.designModalDesc.textContent = item.summary;

    els.designModalPhilosophy.innerHTML = "";
    if (Array.isArray(item.philosophy) && item.philosophy.length) {
      els.designModalPhilosophy.hidden = false;
      item.philosophy.forEach((p) => {
        const box = document.createElement("div");
        box.className = "design-phil-item";
        const dotClass = p.tone === "galaxy" ? "swatch-galaxy" : "swatch-earth";
        box.innerHTML = `
          <div class="philosophy-head">
            <span class="swatch-dot ${dotClass}" aria-hidden="true"></span>
            <span></span>
          </div>
          <p style="margin:0;font-size:12.5px;line-height:1.55;color:var(--ink-muted);"></p>
        `;
        box.querySelector(".philosophy-head span:last-child").textContent = p.label;
        box.querySelector("p").textContent = p.detail;
        els.designModalPhilosophy.appendChild(box);
      });
    } else {
      els.designModalPhilosophy.hidden = true;
    }

    els.designModal.removeAttribute("hidden");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    els.designModal.setAttribute("hidden", "");
    document.body.classList.remove("modal-open");
  }

  function stepRack(delta) {
    const items = getFiltered();
    if (!items.length) return;
    state.activeIndex = (state.activeIndex + delta + items.length) % items.length;
    layoutCoverflow(items);
  }

  els.filterRow?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    state.category = btn.dataset.cat || "Semua";
    state.activeIndex = state.category === "Semua" ? 1 : 0;
    els.filterRow.querySelectorAll("[data-cat]").forEach((b) => {
      b.classList.toggle("active", b === btn);
    });
    renderAll();
  });

  els.viewRackBtn?.addEventListener("click", () => {
    state.viewMode = "rack";
    renderAll();
  });

  els.viewGridBtn?.addEventListener("click", () => {
    state.viewMode = "grid";
    renderAll();
  });

  els.prevDesignBtn?.addEventListener("click", () => stepRack(-1));
  els.nextDesignBtn?.addEventListener("click", () => stepRack(1));
  els.inspectActiveDesignBtn?.addEventListener("click", () => {
    const items = getFiltered();
    openModal(items[state.activeIndex]);
  });

  els.closeDesignModalBtn?.addEventListener("click", closeModal);
  els.designModal?.addEventListener("click", (e) => {
    if (e.target === els.designModal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (!els.designModal.hasAttribute("hidden")) {
      if (e.key === "Escape") closeModal();
      return;
    }
    if (state.viewMode === "rack") {
      if (e.key === "ArrowLeft") stepRack(-1);
      if (e.key === "ArrowRight") stepRack(1);
    }
  });

  window.addEventListener("resize", () => {
    if (state.viewMode === "rack") layoutCoverflow(getFiltered());
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

  document.querySelectorAll(".mobile-link").forEach((link) => {
    link.addEventListener("click", () => {
      els.mobileMenu?.setAttribute("hidden", "");
      els.menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  renderAll();
})();
