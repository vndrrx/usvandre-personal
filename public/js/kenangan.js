(() => {
  const PAGE_SIZE = 24;
  const TOKEN_STORAGE_KEY = "usvandre_supabase_access_token";

  const urlParams = new URLSearchParams(window.location.search);
  const hasOwnerQuery =
    urlParams.get("admin") === "1" ||
    urlParams.get("kelola") === "vandre" ||
    urlParams.get("owner") === "1";

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
    authConfigured: false,
    supabaseUrl: "",
    supabaseAnonKey: "",
    allowedEmail: "usvanndrenur@gmail.com",
    unlocked: false,
    ownerUiRevealed: hasOwnerQuery,
    accessToken: sessionStorage.getItem(TOKEN_STORAGE_KEY) || "",
    lightboxIdx: -1,
    queuedFiles: []
  };

  // Tangkap access_token jika pengguna datang dari Magic Link Supabase di Gmail
  (function captureMagicLinkHash() {
    if (!window.location.hash) return;
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const token = hashParams.get("access_token");
    if (token) {
      state.accessToken = token;
      state.ownerUiRevealed = true;
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  })();

  const els = {
    totalStat: document.getElementById("totalPhotosStat"),
    dbStat: document.getElementById("memoriesDbStat"),
    ownerStat: document.getElementById("ownerBadgeStat"),
    ownerActionsWrap: document.getElementById("ownerActionsWrap"),
    ownerModeBtn: document.getElementById("ownerModeBtn"),
    heroUploadBtn: document.getElementById("heroUploadBtn"),
    emptyUploadBtn: document.getElementById("emptyUploadBtn"),
    ownerTriggerEyebrow: document.getElementById("ownerTriggerEyebrow"),
    ownerTriggerFooter: document.getElementById("ownerTriggerFooter"),
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
    ownerEmailInput: document.getElementById("ownerEmailInput"),
    sendOtpBtn: document.getElementById("sendOtpBtn"),
    otpVerifyRow: document.getElementById("otpVerifyRow"),
    ownerOtpInput: document.getElementById("ownerOtpInput"),
    verifyOtpBtn: document.getElementById("verifyOtpBtn"),
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
    if (state.accessToken) h.Authorization = `Bearer ${state.accessToken}`;
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

    const showOwnerTools = state.unlocked || state.ownerUiRevealed;
    if (els.ownerActionsWrap) {
      els.ownerActionsWrap.hidden = !showOwnerTools;
      els.ownerActionsWrap.style.display = showOwnerTools ? "flex" : "none";
    }
    if (els.ownerStat) {
      els.ownerStat.hidden = !state.unlocked;
      els.ownerStat.textContent = `Pemilik: ${state.allowedEmail}`;
    }
    if (els.heroUploadBtn) {
      els.heroUploadBtn.hidden = !state.unlocked;
    }
    if (els.emptyUploadBtn) {
      els.emptyUploadBtn.hidden = !state.unlocked;
    }
    if (els.emptyText) {
      els.emptyText.textContent = state.unlocked
        ? "Klik + Tambah Kenangan di atas untuk mengunggah banyak foto sekaligus ke Supabase."
        : "Belum ada foto yang dipublikasikan pada album ini.";
    }
    if (els.ownerModeBtn) {
      els.ownerModeBtn.textContent = state.unlocked ? "Keluar Pemilik" : "Masuk Pemilik";
    }
    syncUploadModalState();
  }

  function syncUploadModalState() {
    if (!state.authConfigured) {
      els.passcodeBox.hidden = false;
      els.uploadForm.hidden = true;
      els.sendOtpBtn.disabled = true;
      els.passcodeHint.innerHTML =
        `Unggah foto hanya dibuka untuk email <code>${state.allowedEmail}</code> melalui verifikasi Supabase Auth. Tambahkan variabel <code>SUPABASE_ANON_KEY</code> (dari Supabase → Project Settings → API) di Vercel Environment Variables terlebih dahulu.`;
      return;
    }

    els.sendOtpBtn.disabled = false;
    if (state.unlocked) {
      els.passcodeBox.hidden = true;
      els.uploadForm.hidden = false;
    } else {
      els.passcodeBox.hidden = false;
      els.uploadForm.hidden = true;
      els.passcodeHint.innerHTML =
        `Hanya akun email <code>${state.allowedEmail}</code> yang bisa mengirim atau menghapus foto. Masukkan email Anda lalu cek Gmail untuk tautan masuk atau kode verifikasi.`;
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
      state.authConfigured = Boolean(data.authConfigured);
      state.supabaseUrl = data.supabaseUrl || "";
      state.supabaseAnonKey = data.supabaseAnonKey || "";
      state.allowedEmail = data.allowedEmail || "usvanndrenur@gmail.com";
      state.unlocked = Boolean(data.unlocked);
      if (data.authErrorReason === "EMAIL_FORBIDDEN") {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        state.accessToken = "";
        els.passcodeFeedback.textContent = `Akun ditolak. Hanya ${state.allowedEmail} yang diizinkan.`;
      }
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
        // Lewati file rusak
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

  els.sendOtpBtn?.addEventListener("click", async () => {
    const email = els.ownerEmailInput.value.trim().toLowerCase();
    if (email !== state.allowedEmail) {
      els.passcodeFeedback.textContent = `Ditolak: hanya email ${state.allowedEmail} yang diizinkan.`;
      return;
    }
    if (!state.authConfigured || !state.supabaseUrl || !state.supabaseAnonKey) {
      els.passcodeFeedback.textContent = "SUPABASE_ANON_KEY belum diset di Vercel Environment Variables.";
      return;
    }

    els.passcodeFeedback.textContent = "Mengirim tautan & kode masuk ke Gmail Anda...";
    try {
      const res = await fetch(`${state.supabaseUrl}/auth/v1/otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: state.supabaseAnonKey
        },
        body: JSON.stringify({
          email,
          create_user: true,
          email_redirect_to: `${window.location.origin}/kenangan.html`
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        els.passcodeFeedback.textContent = err.msg || err.error_description || "Gagal mengirim email verifikasi.";
        return;
      }
      els.otpVerifyRow.style.display = "flex";
      els.passcodeFeedback.textContent =
        "Terkirim! Cek kotak masuk usvanndrenur@gmail.com — klik tautan masuk di email atau tempel kode 6 digit di bawah.";
    } catch {
      els.passcodeFeedback.textContent = "Gagal menghubungi server Supabase Auth.";
    }
  });

  els.verifyOtpBtn?.addEventListener("click", async () => {
    const email = els.ownerEmailInput.value.trim().toLowerCase();
    const token = els.ownerOtpInput.value.trim();
    if (email !== state.allowedEmail || !token) return;
    els.passcodeFeedback.textContent = "Memverifikasi kode...";
    try {
      const res = await fetch(`${state.supabaseUrl}/auth/v1/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: state.supabaseAnonKey
        },
        body: JSON.stringify({
          type: "email",
          email,
          token
        })
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        state.accessToken = data.access_token;
        sessionStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
        els.passcodeFeedback.textContent = "";
        await fetchMemories(false);
      } else {
        els.passcodeFeedback.textContent = data.msg || data.error_description || "Kode OTP tidak valid.";
      }
    } catch {
      els.passcodeFeedback.textContent = "Gagal memverifikasi kode.";
    }
  });

  els.ownerModeBtn?.addEventListener("click", () => {
    if (state.unlocked) {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      state.accessToken = "";
      state.unlocked = false;
      updateHeaderStats();
      fetchMemories(false);
    } else {
      openUploadModal();
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

  function revealAndOpenOwnerModal() {
    state.ownerUiRevealed = true;
    updateHeaderStats();
    openUploadModal();
  }

  ["heroUploadBtn", "emptyUploadBtn"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", openUploadModal);
  });

  // Pintasan khusus pemilik: 3x klik pada eyebrow/footer atau Ctrl+Shift+U / Alt+Shift+M
  [els.ownerTriggerEyebrow, els.ownerTriggerFooter].forEach((triggerEl) => {
    if (!triggerEl) return;
    let tapCount = 0;
    let tapTimer = null;
    triggerEl.addEventListener("click", () => {
      tapCount++;
      clearTimeout(tapTimer);
      if (tapCount >= 3) {
        tapCount = 0;
        revealAndOpenOwnerModal();
        return;
      }
      tapTimer = setTimeout(() => {
        tapCount = 0;
      }, 900);
    });
  });

  if (hasOwnerQuery) {
    setTimeout(() => openUploadModal(), 150);
  }

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
    if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "u") || (e.altKey && e.shiftKey && e.key.toLowerCase() === "m")) {
      e.preventDefault();
      revealAndOpenOwnerModal();
      return;
    }
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
