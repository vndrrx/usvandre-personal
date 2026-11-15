(() => {
  const PAGE_SIZE = 24;
  const PASSCODE_STORAGE_KEY = "usvandre_memories_passcode";

  const state = {
    items: [],
    albums: ["Keseharian", "Kampus & Studi", "Batubara", "Studio & Kerja", "Perjalanan"],
    activeAlbum: "Semua",
    query: "",
    sort: "newest",
    offset: 0,
    total: 0,
    hasMore: false,
    dbConnected: false,
    passcodeConfigured: false,
    unlocked: false,
    passcode: sessionStorage.getItem(PASSCODE_STORAGE_KEY) || "",
    lightboxIdx: -1,
    queuedFiles: []
  };

  const els = {
    totalStat: document.getElementById("totalPhotosStat"),
    dbStat: document.getElementById("memoriesDbStat"),
    ownerStat: document.getElementById("ownerBadgeStat"),
    ownerModeBtn: document.getElementById("ownerModeBtn"),
    albumTabs: document.getElementById("albumTabs"),
    searchInput: document.getElementById("memorySearchInput"),
    sortSelect: document.getElementById("memorySortSelect"),
    grid: document.getElementById("memoriesGrid"),
    emptyBox: document.getElementById("emptyMemoriesBox"),
    emptyText: document.getElementById("emptyMemoriesText"),
    loadMoreWrap: document.getElementById("loadMoreWrap"),
    loadMoreBtn: document.getElementById("loadMoreBtn"),

    lightboxModal: document.getElementById("lightboxModal"),
    lbCloseBtn: document.getElementById("lbCloseBtn"),
    lbImage: document.getElementById("lbImage"),
    lbAlbum: document.getElementById("lbAlbum"),
    lbTitle: document.getElementById("lbTitle"),
    lbMeta: document.getElementById("lbMeta"),
    lbCaption: document.getElementById("lbCaption"),
    lbPrevBtn: document.getElementById("lbPrevBtn"),
    lbNextBtn: document.getElementById("lbNextBtn"),

    uploadModal: document.getElementById("uploadModal"),
    uploadBackdrop: document.getElementById("uploadBackdrop"),
    closeUploadBtn: document.getElementById("closeUploadBtn"),
    passcodeBox: document.getElementById("passcodeBox"),
    passcodeHint: document.getElementById("passcodeHint"),
    ownerPasscodeInput: document.getElementById("ownerPasscodeInput"),
    verifyPasscodeBtn: document.getElementById("verifyPasscodeBtn"),
    passcodeFeedback: document.getElementById("passcodeFeedback"),
    uploadForm: document.getElementById("uploadForm"),
    dropzoneBox: document.getElementById("dropzoneBox"),
    photoFilesInput: document.getElementById("photoFilesInput"),
    uploadQueue: document.getElementById("uploadQueue"),
    memTitleInput: document.getElementById("memTitleInput"),
    memAlbumInput: document.getElementById("memAlbumInput"),
    memDateInput: document.getElementById("memDateInput"),
    memLocationInput: document.getElementById("memLocationInput"),
    memCaptionInput: document.getElementById("memCaptionInput"),
    memPrivateCheck: document.getElementById("memPrivateCheck"),
    submitUploadBtn: document.getElementById("submitUploadBtn"),
    uploadStatusNote: document.getElementById("uploadStatusNote"),

    menuToggle: document.getElementById("menuToggle"),
    mobileMenu: document.getElementById("mobileMenu"),
    yearNow: document.getElementById("yearNow")
  };

  if (els.yearNow) els.yearNow.textContent = String(new Date().getFullYear());

  function apiHeaders(extra = {}) {
    const h = { ...extra };
    if (state.passcode) h["x-owner-passcode"] = state.passcode;
    return h;
  }

  function renderAlbumTabs() {
    const list = ["Semua", ...state.albums];
    els.albumTabs.innerHTML = "";
    list.forEach((album) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `filter-chip ${state.activeAlbum === album ? "active" : ""}`;
      btn.textContent = album;
      btn.addEventListener("click", () => {
        state.activeAlbum = album;
        state.offset = 0;
        renderAlbumTabs();
        fetchMemories(false);
      });
      els.albumTabs.appendChild(btn);
    });
  }

  function updateHeaderStats() {
    els.totalStat.textContent = String(state.total);
    els.dbStat.textContent = state.dbConnected ? "Supabase SQL Aktif" : "Menunggu Koneksi DB";
    els.ownerStat.textContent = state.unlocked ? "Mode: Pemilik Terbuka" : "Mode: Pengunjung";
    els.ownerModeBtn.textContent = state.unlocked ? "Mode Pemilik Aktif" : "Kunci Pemilik";
    syncUploadModalState();
  }

  function syncUploadModalState() {
    if (!state.passcodeConfigured) {
      els.passcodeBox.hidden = false;
      els.uploadForm.hidden = true;
      els.passcodeHint.innerHTML =
        "Agar hanya Anda yang bisa mengunggah atau menghapus foto, tambahkan variabel <code>MEMORIES_PASSCODE</code> di Vercel <strong>Environment Variables</strong> terlebih dahulu.";
      return;
    }

    if (state.unlocked) {
      els.passcodeBox.hidden = true;
      els.uploadForm.hidden = false;
    } else {
      els.passcodeBox.hidden = false;
      els.uploadForm.hidden = true;
      els.passcodeHint.innerHTML =
        "Masukkan sandi pemilik (<code>MEMORIES_PASSCODE</code>) untuk membuka unggah banyak foto, foto privat, dan hapus foto.";
    }
  }

  function renderGallery() {
    els.grid.innerHTML = "";
    if (state.items.length === 0) {
      els.emptyBox.hidden = false;
      els.loadMoreWrap.hidden = true;
      return;
    }

    els.emptyBox.hidden = true;
    els.loadMoreWrap.hidden = !state.hasMore;

    state.items.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "memory-card";
      card.innerHTML = `
        <button type="button" class="memory-img-btn" aria-label="Perbesar foto">
          <img loading="lazy" decoding="async" alt="" />
        </button>
        <div class="memory-meta">
          <div class="memory-meta-top">
            <div>
              <span class="memory-album-pill album-label"></span>
              ${item.is_private ? '<span class="memory-album-pill private-pill">Privat</span>' : ""}
            </div>
            <span class="memory-date"></span>
          </div>
          <h3></h3>
          <p class="memory-caption"></p>
          ${state.unlocked ? '<button type="button" class="memory-delete-btn">Hapus</button>' : ""}
        </div>
      `;

      const img = card.querySelector("img");
      img.src = item.image_data;
      img.alt = item.title || "Foto kenangan";
      card.querySelector(".album-label").textContent = item.album || "Keseharian";
      card.querySelector(".memory-date").textContent = [item.taken_date, item.location].filter(Boolean).join(" · ");
      card.querySelector("h3").textContent = item.title;
      const capEl = card.querySelector(".memory-caption");
      if (item.caption) {
        capEl.textContent = item.caption;
      } else {
        capEl.hidden = true;
      }

      card.querySelector(".memory-img-btn").addEventListener("click", () => openLightbox(index));
      const delBtn = card.querySelector(".memory-delete-btn");
      if (delBtn) {
        delBtn.addEventListener("click", () => deleteMemory(item.id));
      }

      els.grid.appendChild(card);
    });
  }

  async function fetchMemories(append = false) {
    const params = new URLSearchParams({
      offset: String(append ? state.items.length : 0),
      limit: String(PAGE_SIZE),
      sort: state.sort
    });
    if (state.activeAlbum && state.activeAlbum !== "Semua") {
      params.set("album", state.activeAlbum);
    }
    if (state.query) {
      params.set("q", state.query);
    }

    try {
      const res = await fetch(`/api/memories?${params.toString()}`, {
        headers: apiHeaders()
      });
      const data = await res.json();
      state.dbConnected = Boolean(data.dbConnected);
      state.passcodeConfigured = Boolean(data.passcodeConfigured);
      state.unlocked = Boolean(data.unlocked);
      state.total = Number(data.total || 0);
      state.hasMore = Boolean(data.hasMore);
      if (Array.isArray(data.albums) && data.albums.length > 0) {
        state.albums = data.albums;
      }
      state.items = append ? [...state.items, ...(data.items || [])] : (data.items || []);

      renderAlbumTabs();
      updateHeaderStats();
      renderGallery();
    } catch {
      els.dbStat.textContent = "Gagal terhubung ke API";
    }
  }

  async function deleteMemory(id) {
    if (!window.confirm("Hapus foto ini dari arsip kenangan?")) return;
    const res = await fetch(`/api/memories?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: apiHeaders()
    });
    if (res.ok) {
      state.items = state.items.filter((x) => x.id !== id);
      state.total = Math.max(0, state.total - 1);
      updateHeaderStats();
      renderGallery();
    }
  }

  function openLightbox(idx) {
    if (idx < 0 || idx >= state.items.length) return;
    state.lightboxIdx = idx;
    const item = state.items[idx];
    els.lbImage.src = item.image_data;
    els.lbImage.alt = item.title;
    els.lbAlbum.textContent = item.album || "Keseharian";
    els.lbTitle.textContent = item.title;
    els.lbMeta.textContent = [item.taken_date, item.location].filter(Boolean).join(" · ") || "Arsip Kenangan";
    els.lbCaption.textContent = item.caption || "";
    els.lightboxModal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeLightbox() {
    els.lightboxModal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function stepLightbox(delta) {
    if (state.items.length === 0) return;
    const next = (state.lightboxIdx + delta + state.items.length) % state.items.length;
    openLightbox(next);
  }

  function openUploadModal() {
    syncUploadModalState();
    els.uploadModal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeUploadModal() {
    els.uploadModal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function compressImageToWebp(file, maxDim = 1600, quality = 0.84) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Gagal membaca berkas gambar."));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Format gambar tidak didukung."));
        img.onload = () => {
          let w = img.naturalWidth;
          let h = img.naturalHeight;
          const aspect = w > h * 1.15 ? "landscape" : h > w * 1.15 ? "portrait" : "square";
          if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          let dataUrl = canvas.toDataURL("image/webp", quality);
          if (!dataUrl.startsWith("data:image/webp")) {
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }
          resolve({
            name: file.name.replace(/\.[^.]+$/, ""),
            origSizeKb: Math.round(file.size / 1024),
            compressedKb: Math.round((dataUrl.length * 0.75) / 1024),
            aspect,
            dataUrl
          });
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  async function queueSelectedFiles(fileList) {
    const files = [...fileList].filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    els.uploadStatusNote.textContent = `Mengompres ${files.length} foto...`;
    const processed = [];
    for (const f of files) {
      try {
        processed.push(await compressImageToWebp(f));
      } catch {
        // Lewati file yang rusak
      }
    }
    state.queuedFiles = [...state.queuedFiles, ...processed];
    els.uploadStatusNote.textContent = `${state.queuedFiles.length} foto siap diunggah.`;
    renderQueue();
  }

  function renderQueue() {
    if (state.queuedFiles.length === 0) {
      els.uploadQueue.hidden = true;
      els.uploadQueue.innerHTML = "";
      return;
    }
    els.uploadQueue.hidden = false;
    els.uploadQueue.innerHTML = state.queuedFiles
      .map(
        (item) => `
          <div class="queue-thumb">
            <img src="${item.dataUrl}" alt="${item.name}" />
            <div>${item.compressedKb} KB</div>
          </div>
        `
      )
      .join("");
  }

  els.verifyPasscodeBtn?.addEventListener("click", async () => {
    const code = els.ownerPasscodeInput.value.trim();
    if (!code) return;
    els.passcodeFeedback.textContent = "Memeriksa...";
    try {
      const res = await fetch("/api/memories?action=verify", {
        method: "POST",
        headers: { "x-owner-passcode": code }
      });
      const data = await res.json();
      if (res.ok && data.unlocked) {
        state.passcode = code;
        state.unlocked = true;
        sessionStorage.setItem(PASSCODE_STORAGE_KEY, code);
        els.passcodeFeedback.textContent = "";
        updateHeaderStats();
        fetchMemories(false);
      } else {
        els.passcodeFeedback.textContent = data.error || "Sandi salah.";
      }
    } catch {
      els.passcodeFeedback.textContent = "Gagal memeriksa sandi.";
    }
  });

  els.dropzoneBox?.addEventListener("click", () => els.photoFilesInput.click());
  els.dropzoneBox?.addEventListener("dragover", (e) => {
    e.preventDefault();
    els.dropzoneBox.classList.add("dragover");
  });
  els.dropzoneBox?.addEventListener("dragleave", () => els.dropzoneBox.classList.remove("dragover"));
  els.dropzoneBox?.addEventListener("drop", (e) => {
    e.preventDefault();
    els.dropzoneBox.classList.remove("dragover");
    queueSelectedFiles(e.dataTransfer.files);
  });
  els.photoFilesInput?.addEventListener("change", (e) => queueSelectedFiles(e.target.files));

  els.uploadForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (state.queuedFiles.length === 0) {
      els.uploadStatusNote.textContent = "Pilih minimal satu foto terlebih dahulu.";
      return;
    }

    els.submitUploadBtn.disabled = true;
    const baseTitle = els.memTitleInput.value.trim();
    const album = els.memAlbumInput.value.trim() || "Keseharian";
    const takenDate = els.memDateInput.value.trim();
    const location = els.memLocationInput.value.trim();
    const caption = els.memCaptionInput.value.trim();
    const isPrivate = els.memPrivateCheck.checked;

    let successCount = 0;
    for (let i = 0; i < state.queuedFiles.length; i++) {
      const f = state.queuedFiles[i];
      els.uploadStatusNote.textContent = `Mengunggah foto ${i + 1} dari ${state.queuedFiles.length}...`;
      const title =
        baseTitle && state.queuedFiles.length > 1
          ? `${baseTitle} (${i + 1})`
          : baseTitle || f.name;

      const res = await fetch("/api/memories", {
        method: "POST",
        headers: apiHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          title,
          caption,
          album,
          taken_date: takenDate,
          location,
          aspect_hint: f.aspect,
          is_private: isPrivate,
          image_data: f.dataUrl
        })
      });
      if (res.ok) successCount++;
    }

    els.submitUploadBtn.disabled = false;
    els.uploadStatusNote.textContent = `${successCount} dari ${state.queuedFiles.length} foto berhasil disimpan.`;
    state.queuedFiles = [];
    renderQueue();
    els.photoFilesInput.value = "";
    els.memTitleInput.value = "";
    els.memCaptionInput.value = "";
    await fetchMemories(false);
  });

  ["openUploadModalBtn", "mobileUploadBtn", "heroUploadBtn", "emptyUploadBtn", "ownerModeBtn"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", openUploadModal);
  });

  els.closeUploadBtn?.addEventListener("click", closeUploadModal);
  els.uploadBackdrop?.addEventListener("click", closeUploadModal);

  let searchTimer = null;
  els.searchInput?.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = els.searchInput.value.trim();
      fetchMemories(false);
    }, 250);
  });

  els.sortSelect?.addEventListener("change", () => {
    state.sort = els.sortSelect.value;
    fetchMemories(false);
  });

  els.loadMoreBtn?.addEventListener("click", () => fetchMemories(true));
  els.lbCloseBtn?.addEventListener("click", closeLightbox);
  els.lbPrevBtn?.addEventListener("click", () => stepLightbox(-1));
  els.lbNextBtn?.addEventListener("click", () => stepLightbox(1));

  document.addEventListener("keydown", (e) => {
    if (!els.lightboxModal.hidden) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    } else if (!els.uploadModal.hidden && e.key === "Escape") {
      closeUploadModal();
    }
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

  renderAlbumTabs();
  fetchMemories(false);
})();
