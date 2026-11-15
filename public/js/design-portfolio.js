(() => {
  const DESIGNS = [
    {
      id: "pai-muda-berakhlak",
      title: "Muda, Cerdas, BERAKHLAK",
      category: "Poster & Kampanye",
      source: "Tugas Kreatif PAI · Usvandre Nur",
      image: "assets/designs/pai-muda-berakhlak.jpg",
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
      isLogoMat: true,
      summary:
        "Logo dengan simbol pita infinity dipilih untuk menghadirkan kesan tanpa batas. Perpaduan warnanya mendukung makna tersebut: gradasi biru–ungu di atas terinspirasi dari Galaksi, sedangkan biru–hijau di bawah terinspirasi dari Bumi.",
      philosophy: [
        {
          label: "Biru – Ungu · Galaksi (Atas)",
          tone: "galaxy",
          detail: "Mewakili kedalaman semesta, imajinasi luas, dan visi yang bergerak tanpa batas."
        },
        {
          label: "Biru – Hijau · Bumi (Bawah)",
          tone: "earth",
          detail: "Mewakili keseimbangan alam, ketenangan, pertumbuhan, dan pijakan yang tetap membumi."
        }
      ]
    },
    {
      id: "foxsa-hiring",
      title: "FoxSA News Agency — We're Hiring!",
      category: "Media Sosial & Iklan",
      source: "Poster Rekrutmen · FoxSA Network",
      image: "assets/designs/foxsa-hiring.jpg",
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
      isLogoMat: false,
      summary:
        "Materi promosi produk kuliner bernuansa cokelat pekat, menggabungkan tipografi script kasual, visual tumpukan brownies panggang, dan tata letak informasi pemesanan."
    }
  ];

  const els = {
    filterRow: document.getElementById("designFilterRow"),
    viewDeckBtn: document.getElementById("viewDeckBtn"),
    viewGridBtn: document.getElementById("viewGridBtn"),
    designDeckShell: document.getElementById("designDeckShell"),
    deckViewport: document.getElementById("deckViewport"),
    deckTrack: document.getElementById("deckTrack"),
    designGridView: document.getElementById("designGridView"),
    activeDesignCat: document.getElementById("activeDesignCat"),
    activeDesignSource: document.getElementById("activeDesignSource"),
    activeDesignTitle: document.getElementById("activeDesignTitle"),
    activeDesignSummary: document.getElementById("activeDesignSummary"),
    deckCounter: document.getElementById("deckCounter"),
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
    viewMode: "deck",
    activeIndex: 0
  };

  let touchStartX = null;

  function getFiltered() {
    if (state.category === "Semua") return DESIGNS;
    return DESIGNS.filter((d) => d.category === state.category);
  }

  function updateCaption(items) {
    const item = items[state.activeIndex];
    if (!item) return;
    els.activeDesignCat.textContent = item.category;
    els.activeDesignSource.textContent = item.source;
    els.activeDesignTitle.textContent = item.title;
    els.activeDesignSummary.textContent = item.summary;
    if (els.deckCounter) {
      els.deckCounter.textContent = `${state.activeIndex + 1} / ${items.length}`;
    }
  }

  function layoutDeck(items) {
    const cards = Array.from(els.deckTrack.querySelectorAll(".deck-card"));
    const compact = window.innerWidth <= 600;
    const tablet = window.innerWidth <= 960;
    const stepX = compact ? 44 : tablet ? 58 : 74;
    const stepZ = compact ? 48 : 66;
    const total = items.length;

    cards.forEach((card, idx) => {
      const offset = (idx - state.activeIndex + total) % total;
      card.dataset.offset = String(offset);

      if (offset === 0) {
        card.style.zIndex = "40";
        card.style.opacity = "1";
        card.style.filter = "brightness(1)";
        card.style.transform = "translateX(0px) translateZ(36px) rotateY(-10deg) scale(1)";
      } else {
        const capped = Math.min(offset, 3);
        const x = capped * stepX;
        const z = -42 - (capped - 1) * stepZ;
        const rotY = -12 - capped * 1.5;
        const scale = Math.max(0.75, 1 - capped * 0.08);
        card.style.zIndex = String(40 - offset);
        card.style.opacity = offset > 3 ? "0" : String(Math.max(0.72, 1 - capped * 0.09));
        card.style.filter = `brightness(${Math.max(0.78, 1 - capped * 0.07)})`;
        card.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rotY}deg) scale(${scale})`;
      }
    });

    updateCaption(items);
  }

  function renderDeck() {
    const items = getFiltered();
    if (!items.length) return;
    if (state.activeIndex >= items.length) state.activeIndex = 0;

    els.deckTrack.innerHTML = "";
    items.forEach((item, idx) => {
      const card = document.createElement("article");
      card.className = `deck-card${item.isLogoMat ? " is-logo-mat" : ""}`;
      card.setAttribute("tabindex", "0");
      card.setAttribute("oncontextmenu", "return false;");
      card.setAttribute("aria-label", `${item.title} (${item.category})`);

      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" draggable="false" />
        <span class="deck-card-pill">Klik untuk perbesar</span>
        <div class="img-shield" aria-hidden="true"></div>
      `;

      card.addEventListener("click", () => {
        if (state.activeIndex === idx) {
          openModal(item);
        } else {
          state.activeIndex = idx;
          layoutDeck(items);
        }
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (state.activeIndex === idx) {
            openModal(item);
          } else {
            state.activeIndex = idx;
            layoutDeck(items);
          }
        }
      });

      els.deckTrack.appendChild(card);
    });

    layoutDeck(items);
  }

  function renderGrid() {
    const items = getFiltered();
    els.designGridView.innerHTML = "";
    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "design-grid-card";
      card.innerHTML = `
        <div class="design-grid-thumb${item.isLogoMat ? " is-logo-mat" : ""}" oncontextmenu="return false;">
          <img src="${item.image}" alt="${item.title}" loading="lazy" draggable="false" />
          <div class="img-shield" aria-hidden="true"></div>
        </div>
        <div class="design-grid-info">
          <div>
            <span class="card-badge">${item.category}</span>
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
    const isDeck = state.viewMode === "deck";
    els.designDeckShell.hidden = !isDeck;
    els.designGridView.hidden = isDeck;
    els.viewDeckBtn.classList.toggle("active", isDeck);
    els.viewGridBtn.classList.toggle("active", !isDeck);

    if (isDeck) {
      renderDeck();
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

  function stepDeck(delta) {
    const items = getFiltered();
    if (!items.length) return;
    state.activeIndex = (state.activeIndex + delta + items.length) % items.length;
    layoutDeck(items);
  }

  els.filterRow?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    state.category = btn.dataset.cat || "Semua";
    state.activeIndex = 0;
    els.filterRow.querySelectorAll("[data-cat]").forEach((b) => {
      b.classList.toggle("active", b === btn);
    });
    renderAll();
  });

  els.viewDeckBtn?.addEventListener("click", () => {
    state.viewMode = "deck";
    renderAll();
  });

  els.viewGridBtn?.addEventListener("click", () => {
    state.viewMode = "grid";
    renderAll();
  });

  els.prevDesignBtn?.addEventListener("click", () => stepDeck(-1));
  els.nextDesignBtn?.addEventListener("click", () => stepDeck(1));
  els.inspectActiveDesignBtn?.addEventListener("click", () => {
    const items = getFiltered();
    openModal(items[state.activeIndex]);
  });

  els.deckViewport?.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0]?.clientX ?? null;
  }, { passive: true });

  els.deckViewport?.addEventListener("touchend", (e) => {
    if (touchStartX === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX;
    const diff = endX - touchStartX;
    touchStartX = null;
    if (Math.abs(diff) > 36) {
      stepDeck(diff < 0 ? 1 : -1);
    }
  }, { passive: true });

  els.closeDesignModalBtn?.addEventListener("click", closeModal);
  els.designModal?.addEventListener("click", (e) => {
    if (e.target === els.designModal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (!els.designModal.hasAttribute("hidden")) {
      if (e.key === "Escape") closeModal();
      return;
    }
    if (state.viewMode === "deck") {
      if (e.key === "ArrowLeft") stepDeck(-1);
      if (e.key === "ArrowRight") stepDeck(1);
    }
  });

  window.addEventListener("resize", () => {
    if (state.viewMode === "deck") layoutDeck(getFiltered());
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
