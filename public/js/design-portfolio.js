(() => {
  const DESIGNS = [
    {
      id: "infinite-esport",
      shortLabel: "01 Infinite Esport",
      title: "Infinite Esport — Identitas Visual & Wordmark",
      category: "Identitas & Logo",
      source: "Proyek Sekolah",
      image: "assets/logos/infinite-esport.jpg",
      isLogoMat: true,
      summary:
        "Logo simbol infinity yang menghadirkan kesan tanpa batas, dipadukan gradasi biru–ungu Galaksi dan biru–hijau Bumi."
    },
    {
      id: "foxsa-hiring",
      shortLabel: "02 FoxSA News Hiring",
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
      shortLabel: "03 oh.. Brownies",
      title: "oh.. Brownies — Lezat dan Bergizi",
      category: "Media Sosial & Iklan",
      source: "Poster Promosi · Kuliner",
      image: "assets/designs/brownies-promo.jpg",
      isLogoMat: false,
      summary:
        "Materi promosi produk kuliner bernuansa cokelat pekat, menggabungkan tipografi script kasual, visual tumpukan brownies panggang, dan tata letak informasi pemesanan."
    },
    {
      id: "pai-muda-berakhlak",
      shortLabel: "04 Muda, Cerdas, BERAKHLAK",
      title: "Muda, Cerdas, BERAKHLAK",
      category: "Poster & Kampanye",
      source: "Tugas Kreatif PAI · Usvandre Nur",
      image: "assets/designs/pai-muda-berakhlak.jpg",
      isLogoMat: false,
      summary:
        "Poster ilustrasi bertema literasi dan etos kerja ('Kerja Keras adalah Ibadah, Berkarya Bawa Berkah') yang memadukan komposisi buku terbuka di atas hamparan hijau dengan pencahayaan senja hangat."
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
    toggleFanBtn: document.getElementById("toggleFanBtn"),
    designModal: document.getElementById("designModal"),
    closeDesignModalBtn: document.getElementById("closeDesignModalBtn"),
    modalPrevDesignBtn: document.getElementById("modalPrevDesignBtn"),
    modalNextDesignBtn: document.getElementById("modalNextDesignBtn"),
    designModalCat: document.getElementById("designModalCat"),
    designModalMediaWrap: document.getElementById("designModalMediaWrap"),
    designModalImg: document.getElementById("designModalImg"),
    designModalTitle: document.getElementById("designModalTitle"),
    designModalDesc: document.getElementById("designModalDesc"),
    menuToggle: document.getElementById("menuToggle"),
    mobileMenu: document.getElementById("mobileMenu"),
    yearNow: document.getElementById("yearNow")
  };

  if (els.yearNow) els.yearNow.textContent = String(new Date().getFullYear());

  const state = {
    category: "Semua",
    viewMode: "deck",
    activeIndex: 0,
    explicitSelect: false,
    hoveredIndex: null,
    isFanned: false,
    modalIndex: 0
  };

  let touchStartX = null;
  let modalTouchStartX = null;
  let modalTouchStartY = null;
  let lastFocusedEl = null;

  const supportsHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function getFiltered() {
    if (state.category === "Semua") return DESIGNS;
    return DESIGNS.filter((d) => d.category === state.category);
  }

  function updateCaption(items) {
    const targetIdx = state.hoveredIndex !== null && state.hoveredIndex < items.length
      ? state.hoveredIndex
      : state.activeIndex;
    const item = items[targetIdx];
    if (!item) return;
    els.activeDesignCat.textContent = item.category;
    els.activeDesignSource.textContent = item.source;
    els.activeDesignTitle.textContent = item.title;
    els.activeDesignSummary.textContent = item.summary;
    if (els.deckCounter) {
      els.deckCounter.textContent = `${state.activeIndex + 1} / ${items.length}`;
    }
    if (els.toggleFanBtn) {
      els.toggleFanBtn.textContent = state.isFanned ? "Susun Rapi" : "Bentangkan Kipas 3D";
    }
  }

  function layoutDeck(items) {
    const cards = Array.from(els.deckTrack.querySelectorAll(".deck-card"));
    const mobile = window.innerWidth <= 760;
    const tablet = window.innerWidth <= 960;
    const total = items.length;

    const fanSpreadX = tablet ? 72 : 94;
    const fanStartX = -((total - 1) * fanSpreadX) / 2;

    cards.forEach((card, idx) => {
      const offset = (idx - state.activeIndex + total) % total;
      const isHovered = state.hoveredIndex === idx;
      const isSelected = state.activeIndex === idx;
      card.dataset.offset = String(offset);
      card.dataset.hovered = isHovered ? "true" : "false";
      card.dataset.selected = isSelected ? "true" : "false";

      if (mobile) {
        // Default Android: 3D Centered Coverflow (kartu utama di tengah, kartu kiri & kanan miring simetris ke dalam)
        let rel = offset;
        if (total > 2 && rel > total / 2) rel -= total;
        const wingX = window.innerWidth <= 420 ? 124 : 152;

        if (rel === 0) {
          card.style.zIndex = "40";
          card.style.opacity = "1";
          card.style.filter = "brightness(1)";
          card.style.pointerEvents = "auto";
          card.style.transform = "translate3d(0px, 0px, 32px) rotateY(0deg) scale(1)";
        } else if (Math.abs(rel) === 1) {
          const dir = rel > 0 ? 1 : -1;
          card.style.zIndex = "28";
          card.style.opacity = "0.96";
          card.style.filter = "brightness(0.88)";
          card.style.pointerEvents = "auto";
          card.style.transform = `translate3d(${dir * wingX}px, 6px, -42px) rotateY(${-dir * 34}deg) scale(0.84)`;
        } else {
          card.style.zIndex = "12";
          card.style.opacity = "0";
          card.style.filter = "brightness(0.75)";
          card.style.pointerEvents = "none";
          card.style.transform = "translate3d(0px, 10px, -110px) rotateY(0deg) scale(0.74)";
        }
      } else if (!state.isFanned) {
        // State Idle Desktop: kartu terpilih duduk lurus paling depan, yang lain mengintip rapi di atasnya (translateZ >= 0)
        const stepUpY = -19;
        const y = offset * stepUpY + (isHovered ? -12 : 0);
        const z = (total - 1 - offset) * 24;
        const scale = Math.max(0.78, 1 - offset * 0.07);
        card.style.zIndex = String(40 - offset);
        card.style.opacity = offset > 3 ? "0" : String(Math.max(0.76, 1 - offset * 0.06));
        card.style.filter = isHovered ? "brightness(1)" : `brightness(${Math.max(0.86, 1 - offset * 0.05)})`;
        card.style.pointerEvents = "auto";
        card.style.transform = `translateX(0px) translateY(${y}px) translateZ(${z}px) rotateY(0deg) scale(${scale})`;
      } else {
        // State Mekar Kipas 3D Desktop/Tablet
        const x = fanStartX + idx * fanSpreadX;
        const y = 10 - idx * 6 + (isHovered ? -30 : isSelected ? -10 : 0);
        const z = (total - 1 - idx) * 38 + (isHovered ? 12 : 0);
        const scale = Math.max(0.88, 0.98 - idx * 0.025) * (isHovered ? 1.03 : 1);

        card.style.zIndex = String(40 - idx);
        card.style.opacity = "1";
        card.style.filter = isHovered || isSelected ? "brightness(1.02)" : `brightness(${Math.max(0.86, 0.96 - idx * 0.03)})`;
        card.style.pointerEvents = "auto";
        card.style.transform = `translateX(${x}px) translateY(${y}px) translateZ(${z}px) rotateY(-20deg) scale(${scale})`;
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
      card.className = "deck-card";
      card.setAttribute("tabindex", "0");
      card.setAttribute("oncontextmenu", "return false;");
      card.setAttribute("aria-label", `${item.title} (${item.category})`);

      card.innerHTML = `
        <span class="deck-card-pill">${item.shortLabel}</span>
        <div class="deck-card-inner${item.isLogoMat ? " is-logo-mat" : ""}">
          <img src="${item.image}" alt="${item.title}" draggable="false" />
          <div class="img-shield" aria-hidden="true"></div>
        </div>
      `;

      card.addEventListener("mouseenter", () => {
        if (!supportsHover()) return;
        state.isFanned = true;
        state.hoveredIndex = idx;
        layoutDeck(items);
      });

      card.addEventListener("mouseleave", () => {
        if (!supportsHover()) return;
        if (state.hoveredIndex === idx) {
          state.hoveredIndex = null;
          layoutDeck(items);
        }
      });

      card.addEventListener("click", () => {
        if (!supportsHover()) {
          if (state.activeIndex === idx) {
            openModal(items, idx);
          } else {
            state.activeIndex = idx;
            state.explicitSelect = true;
            state.hoveredIndex = null;
            layoutDeck(items);
          }
          return;
        }
        if (state.activeIndex === idx && state.explicitSelect) {
          openModal(items, idx);
        } else {
          state.activeIndex = idx;
          state.explicitSelect = true;
          state.hoveredIndex = idx;
          layoutDeck(items);
        }
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (state.activeIndex === idx && state.explicitSelect) {
            openModal(items, idx);
          } else {
            state.activeIndex = idx;
            state.explicitSelect = true;
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
    items.forEach((item, idx) => {
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
      card.addEventListener("click", () => openModal(items, idx));
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

  function openModal(items, index) {
    const list = Array.isArray(items) && items.length ? items : getFiltered();
    const safeIdx = ((index ?? 0) + list.length) % list.length;
    const item = list[safeIdx];
    if (!item) return;

    if (els.designModal.hasAttribute("hidden")) {
      lastFocusedEl = document.activeElement;
    }

    state.modalIndex = safeIdx;
    els.designModalCat.textContent = item.category;
    els.designModalImg.src = item.image;
    els.designModalImg.alt = item.title;
    els.designModalMediaWrap.classList.toggle("is-logo-lightbox", Boolean(item.isLogoMat));
    els.designModalTitle.textContent = item.title;
    els.designModalDesc.textContent = item.summary;

    els.designModal.removeAttribute("hidden");
    els.designModal.scrollTop = 0;
    const modalInner = els.designModal.querySelector(".lightbox-inner");
    if (modalInner) modalInner.scrollTop = 0;
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    els.designModal.setAttribute("hidden", "");
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
    if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
      lastFocusedEl.focus();
    }
    lastFocusedEl = null;
  }

  function stepDeck(delta) {
    const items = getFiltered();
    if (!items.length) return;
    state.activeIndex = (state.activeIndex + delta + items.length) % items.length;
    state.explicitSelect = true;
    state.hoveredIndex = state.isFanned ? state.activeIndex : null;
    layoutDeck(items);
  }

  els.deckViewport?.addEventListener("mouseenter", () => {
    if (!supportsHover()) return;
    state.isFanned = true;
    layoutDeck(getFiltered());
  });

  els.deckViewport?.addEventListener("mouseleave", () => {
    if (!supportsHover()) return;
    state.isFanned = false;
    state.hoveredIndex = null;
    layoutDeck(getFiltered());
  });

  els.toggleFanBtn?.addEventListener("click", () => {
    state.isFanned = !state.isFanned;
    state.hoveredIndex = null;
    layoutDeck(getFiltered());
  });

  els.filterRow?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    state.category = btn.dataset.cat || "Semua";
    state.activeIndex = 0;
    state.explicitSelect = false;
    state.hoveredIndex = null;
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
    const targetIdx = state.hoveredIndex !== null && state.hoveredIndex < items.length
      ? state.hoveredIndex
      : state.activeIndex;
    openModal(items, targetIdx);
  });

  els.modalPrevDesignBtn?.addEventListener("click", () => {
    openModal(getFiltered(), state.modalIndex - 1);
  });

  els.modalNextDesignBtn?.addEventListener("click", () => {
    openModal(getFiltered(), state.modalIndex + 1);
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
    if (e.target === els.designModal) {
      closeModal();
    }
  });

  els.designModalMediaWrap?.addEventListener("touchstart", (e) => {
    modalTouchStartX = e.changedTouches[0]?.clientX ?? null;
    modalTouchStartY = e.changedTouches[0]?.clientY ?? null;
  }, { passive: true });

  els.designModalMediaWrap?.addEventListener("touchend", (e) => {
    if (modalTouchStartX === null || modalTouchStartY === null) return;
    const endX = e.changedTouches[0]?.clientX ?? modalTouchStartX;
    const endY = e.changedTouches[0]?.clientY ?? modalTouchStartY;
    const dx = endX - modalTouchStartX;
    const dy = endY - modalTouchStartY;
    modalTouchStartX = null;
    modalTouchStartY = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      openModal(getFiltered(), state.modalIndex + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  document.addEventListener("keydown", (e) => {
    const liveDemoModal = document.getElementById("liveDemoModal");
    if (liveDemoModal && !liveDemoModal.hasAttribute("hidden")) return;

    if (els.designModal && !els.designModal.hasAttribute("hidden")) {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") openModal(getFiltered(), state.modalIndex - 1);
      if (e.key === "ArrowRight") openModal(getFiltered(), state.modalIndex + 1);
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

  document.querySelectorAll(".mobile-link").forEach((link) => {
    if (link.dataset.boundMobileClose) return;
    link.dataset.boundMobileClose = "1";
    link.addEventListener("click", () => {
      els.mobileMenu?.setAttribute("hidden", "");
      els.menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  renderAll();
})();
