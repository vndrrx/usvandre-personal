(() => {
  const PAGE_SIZE = 24;
  const TOKEN_STORAGE_KEY = "usvandre_supabase_access_token";

  const urlParams = new URLSearchParams(window.location.search);
  const rawHash = window.location.hash || "";
  const hashParams = new URLSearchParams(rawHash.startsWith("#") ? rawHash.slice(1) : "");
  const cameFromMagicLink = Boolean(hashParams.get("access_token"));
  const hasOwnerQuery =
    urlParams.has("admin") ||
    urlParams.has("kelola") ||
    urlParams.get("owner") === "1" ||
    rawHash === "#kelola" ||
    rawHash === "#admin";

  const state = {
    items: [],
    albums: [],
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
    verifiedEmail: "",
    unlocked: false,
    ownerUiRevealed: hasOwnerQuery || cameFromMagicLink,
    pendingAutoOpenUpload: hasOwnerQuery || cameFromMagicLink,
    accessToken: sessionStorage.getItem(TOKEN_STORAGE_KEY) || "",
    lightboxIdx: -1,
    queuedFiles: []
  };

  // Tangkap access_token jika pengguna datang dari Magic Link Supabase di Gmail
  (function captureMagicLinkHash() {
    if (!cameFromMagicLink) return;
    const token = hashParams.get("access_token");
    if (token) {
      state.accessToken = token;
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
    ownerPasswordInput: document.getElementById("ownerPasswordInput"),
    passwordLoginBtn: document.getElementById("passwordLoginBtn"),
    passcodeFeedback: document.getElementById("passcodeFeedback"),
    uploadForm: document.getElementById("uploadForm"),
    dropzoneBox: document.getElementById("dropzoneBox"),
    photoFilesInput: document.getElementById("photoFilesInput"),
    uploadQueue: document.getElementById("uploadQueue"),
    imageUrlInput: document.getElementById("memImageUrlInput"),
    memTitleInput: document.getElementById("memTitleInput"),
    memAlbumInput: document.getElementById("memAlbumInput"),
    albumSuggestions: document.getElementById("albumSuggestions"),
    memDateInput: document.getElementById("memDateInput"),
    memLocationInput: document.getElementById("memLocationInput"),
    memCaptionInput: document.getElementById("memCaptionInput"),
    memPrivateCheck: document.getElementById("memPrivateCheck"),
    submitUploadBtn: document.getElementById("submitUploadBtn"),
    syncInstagramBtn: document.getElementById("syncInstagramBtn"),
    syncThreadsBtn: document.getElementById("syncThreadsBtn"),
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
    if (els.albumSuggestions) {
      els.albumSuggestions.innerHTML = state.albums
        .map((a) => `<option value="${a.replace(/"/g, "&quot;")}"></option>`)
        .join("");
    }
    if (state.albums.length === 0) {
      els.albumTabs.hidden = true;
      els.albumTabs.innerHTML = "";
      return;
    }

    els.albumTabs.hidden = false;
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
      els.ownerStat.textContent = state.verifiedEmail
        ? `Mode Pemilik Aktif (${state.verifiedEmail})`
        : "Mode Pemilik Aktif";
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
      els.ownerModeBtn.textContent = state.unlocked ? "Keluar Mode Pemilik" : "Masuk Pemilik";
    }
    syncUploadModalState();
  }

  function syncUploadModalState() {
    if (!state.authConfigured) {
      els.passcodeBox.hidden = false;
      els.uploadForm.hidden = true;
      els.sendOtpBtn.disabled = true;
      if (els.passwordLoginBtn) els.passwordLoginBtn.disabled = true;
      if (els.verifyOtpBtn) els.verifyOtpBtn.disabled = true;
      els.passcodeHint.innerHTML =
        'Unggah foto dikunci oleh Supabase Auth dan tombol masuk masih nonaktif karena <code>SUPABASE_ANON_KEY</code> belum ditambahkan di Vercel. ' +
        '<a href="https://supabase.com/dashboard/project/picbctcfkyoajiivlwvv/settings/api" target="_blank" rel="noopener noreferrer" class="inline-link">Salin kunci API Supabase</a> ' +
        'lalu pasang di <a href="https://vercel.com/van22/usvandrenur/settings/environment-variables" target="_blank" rel="noopener noreferrer" class="inline-link">Vercel Environment Variables</a> dan klik Redeploy.';
      return;
    }

    els.sendOtpBtn.disabled = false;
    if (els.passwordLoginBtn) els.passwordLoginBtn.disabled = false;
    if (els.verifyOtpBtn) els.verifyOtpBtn.disabled = false;
    if (state.unlocked) {
      els.passcodeBox.hidden = true;
      els.uploadForm.hidden = false;
    } else {
      els.passcodeBox.hidden = false;
      els.uploadForm.hidden = true;
      els.passcodeHint.textContent =
        "Masukkan email pengelola terdaftar untuk menerima tautan masuk atau kode OTP verifikasi.";
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
          <img loading="lazy" decoding="async" draggable="false" alt="" />
          <span class="img-shield" aria-hidden="true"></span>
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
      const albumEl = card.querySelector(".album-label");
      if (item.album) {
        albumEl.textContent = item.album;
      } else {
        albumEl.hidden = true;
      }
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
      state.verifiedEmail = data.verifiedEmail || "";
      state.unlocked = Boolean(data.unlocked);
      if (data.authErrorReason === "EMAIL_FORBIDDEN" || data.authErrorReason === "INVALID_TOKEN") {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        state.accessToken = "";
        els.passcodeFeedback.textContent =
          data.authErrorReason === "EMAIL_FORBIDDEN"
            ? "Akses ditolak. Email tersebut bukan pengelola arsip."
            : "Sesi masuk berakhir. Silakan verifikasi ulang.";
      }
      state.total = Number(data.total || 0);
      state.hasMore = Boolean(data.hasMore);
      state.albums = Array.isArray(data.albums) ? data.albums : [];
      if (state.activeAlbum !== "Semua" && !state.albums.includes(state.activeAlbum)) {
        state.activeAlbum = "Semua";
      }
      state.items = append ? [...state.items, ...(data.items || [])] : (data.items || []);

      renderAlbumTabs();
      updateHeaderStats();
      renderGallery();
      if (state.pendingAutoOpenUpload) {
        state.pendingAutoOpenUpload = false;
        openUploadModal();
      }
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
    if (item.album) {
      els.lbAlbum.hidden = false;
      els.lbAlbum.textContent = item.album;
    } else {
      els.lbAlbum.hidden = true;
      els.lbAlbum.textContent = "";
    }
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
    if (!email || !email.includes("@")) {
      els.passcodeFeedback.textContent = "Masukkan alamat email yang valid.";
      return;
    }
    if (!state.authConfigured) {
      els.passcodeFeedback.textContent = "SUPABASE_ANON_KEY belum diset di Vercel Environment Variables.";
      return;
    }

    els.sendOtpBtn.disabled = true;
    els.passcodeFeedback.textContent = "Mengirim tautan & kode masuk ke email Anda...";
    try {
      const res = await fetch("/api/memories?action=send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/kenangan.html`
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        els.passcodeFeedback.textContent = data.error || "Gagal mengirim email verifikasi.";
        return;
      }
      els.otpVerifyRow.style.display = "flex";
      els.passcodeFeedback.textContent =
        "Terkirim! Periksa kotak masuk email tersebut — klik tautan masuk atau masukkan kode verifikasi.";
    } catch {
      els.passcodeFeedback.textContent = "Gagal menghubungi server verifikasi.";
    } finally {
      els.sendOtpBtn.disabled = !state.authConfigured;
    }
  });

  els.verifyOtpBtn?.addEventListener("click", async () => {
    const rawValue = els.ownerOtpInput.value.trim();
    if (!rawValue) {
      els.passcodeFeedback.textContent = "Masukkan kode OTP dari email atau tempel tautan #access_token=...";
      return;
    }

    // Jika pengguna menempelkan tautan redirect (mis. http://localhost:3000/#access_token=...)
    const tokenMatch = rawValue.match(/access_token=([^&\s]+)/);
    if (tokenMatch) {
      const extractedToken = decodeURIComponent(tokenMatch[1]);
      els.verifyOtpBtn.disabled = true;
      els.passcodeFeedback.textContent = "Memverifikasi sesi token...";
      try {
        state.accessToken = extractedToken;
        sessionStorage.setItem(TOKEN_STORAGE_KEY, extractedToken);
        await fetchMemories(false);
        if (state.unlocked) {
          els.ownerOtpInput.value = "";
          els.passcodeFeedback.textContent = "";
        }
      } finally {
        els.verifyOtpBtn.disabled = !state.authConfigured;
      }
      return;
    }

    const email = els.ownerEmailInput.value.trim().toLowerCase();
    const token = rawValue;
    if (!email || !email.includes("@")) {
      els.passcodeFeedback.textContent = "Masukkan alamat email pengelola terlebih dahulu.";
      return;
    }
    els.verifyOtpBtn.disabled = true;
    els.passcodeFeedback.textContent = "Memverifikasi kode...";
    try {
      const res = await fetch("/api/memories?action=verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.access_token) {
        state.accessToken = data.access_token;
        sessionStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
        els.ownerOtpInput.value = "";
        els.passcodeFeedback.textContent = "";
        await fetchMemories(false);
      } else {
        els.passcodeFeedback.textContent = data.error || "Kode OTP tidak valid.";
      }
    } catch {
      els.passcodeFeedback.textContent = "Gagal memverifikasi kode.";
    } finally {
      els.verifyOtpBtn.disabled = !state.authConfigured;
    }
  });

  els.passwordLoginBtn?.addEventListener("click", async () => {
    const email = els.ownerEmailInput.value.trim().toLowerCase();
    const password = els.ownerPasswordInput?.value || "";
    if (!email || !email.includes("@")) {
      els.passcodeFeedback.textContent = "Masukkan alamat email pengelola yang valid.";
      return;
    }
    if (!password) {
      els.passcodeFeedback.textContent = "Masukkan kata sandi akun Supabase terlebih dahulu.";
      return;
    }
    if (!state.authConfigured) {
      els.passcodeFeedback.textContent = "SUPABASE_ANON_KEY belum diset di Vercel Environment Variables.";
      return;
    }

    els.passwordLoginBtn.disabled = true;
    els.passcodeFeedback.textContent = "Memeriksa kredensial akun...";
    try {
      const res = await fetch("/api/memories?action=password-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.access_token) {
        state.accessToken = data.access_token;
        sessionStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
        els.ownerPasswordInput.value = "";
        els.passcodeFeedback.textContent = "";
        await fetchMemories(false);
      } else {
        els.passcodeFeedback.textContent = data.error || "Email atau kata sandi tidak sesuai.";
      }
    } catch {
      els.passcodeFeedback.textContent = "Gagal menghubungi server verifikasi.";
    } finally {
      els.passwordLoginBtn.disabled = !state.authConfigured;
    }
  });

  els.ownerModeBtn?.addEventListener("click", () => {
    if (state.unlocked) {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      state.accessToken = "";
      state.unlocked = false;
      state.verifiedEmail = "";
      state.ownerUiRevealed = hasOwnerQuery;
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
    if (!state.unlocked) {
      els.uploadStatusNote.textContent = "Sesi pengelola belum aktif. Silakan masuk terlebih dahulu.";
      syncUploadModalState();
      return;
    }
    const imageUrl = els.imageUrlInput?.value.trim() || "";
    if (state.queuedFiles.length === 0 && !/^https:\/\//i.test(imageUrl)) {
      els.uploadStatusNote.textContent = "Pilih foto atau masukkan URL foto HTTPS yang valid terlebih dahulu.";
      return;
    }

    els.submitUploadBtn.disabled = true;
    const baseTitle = els.memTitleInput.value.trim();
    const album = els.memAlbumInput.value.trim();
    const takenDate = els.memDateInput.value.trim();
    const location = els.memLocationInput.value.trim();
    const caption = els.memCaptionInput.value.trim();
    const isPrivate = els.memPrivateCheck.checked;

    if (state.queuedFiles.length === 0 && /^https:\/\//i.test(imageUrl)) {
      try {
        els.uploadStatusNote.textContent = "Menyimpan tautan foto ke Supabase...";
        const res = await fetch("/api/memories", {
          method: "POST",
          headers: apiHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            title: baseTitle || "Foto Kenangan",
            caption,
            album,
            taken_date: takenDate,
            location,
            aspect_hint: "auto",
            is_private: isPrivate,
            image_data: imageUrl
          })
        });
        const resData = await res.json().catch(() => ({}));
        if (res.ok) {
          els.uploadStatusNote.textContent = "Tautan foto berhasil disimpan ke Supabase.";
          if (els.imageUrlInput) els.imageUrlInput.value = "";
          els.memTitleInput.value = "";
          els.memCaptionInput.value = "";
          await fetchMemories(false);
        } else {
          els.uploadStatusNote.textContent = resData.error || `Gagal menyimpan (${res.status})`;
        }
      } catch (err) {
        els.uploadStatusNote.textContent = err?.message || "Koneksi terputus saat menyimpan foto.";
      } finally {
        els.submitUploadBtn.disabled = false;
      }
      return;
    }

    const totalQueued = state.queuedFiles.length;
    const failedFiles = [];
    let successCount = 0;
    let lastError = "";

    try {
      for (let i = 0; i < totalQueued; i++) {
        const f = state.queuedFiles[i];
        els.uploadStatusNote.textContent = `Mengunggah foto ${i + 1} dari ${totalQueued}...`;
        const title =
          baseTitle && totalQueued > 1
            ? `${baseTitle} (${i + 1})`
            : baseTitle || f.name;

        try {
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
          if (res.ok) {
            successCount++;
          } else {
            const errData = await res.json().catch(() => ({}));
            lastError = errData.error || `HTTP ${res.status}`;
            failedFiles.push(f);
          }
        } catch (err) {
          lastError = err?.message || "Koneksi terputus saat mengunggah.";
          failedFiles.push(f);
        }
      }

      state.queuedFiles = failedFiles;
      renderQueue();
      if (failedFiles.length === 0) {
        els.uploadStatusNote.textContent = `${successCount} dari ${totalQueued} foto berhasil disimpan ke Supabase.`;
        els.photoFilesInput.value = "";
        els.memTitleInput.value = "";
        els.memCaptionInput.value = "";
      } else {
        els.uploadStatusNote.textContent = `${successCount} berhasil, ${failedFiles.length} gagal: ${lastError}`;
      }
      if (successCount > 0) {
        await fetchMemories(false);
      }
    } finally {
      els.submitUploadBtn.disabled = false;
    }
  });

  function bindSocialSyncButton(btn, { action, label }) {
    btn?.addEventListener("click", async () => {
      if (!state.unlocked) {
        els.uploadStatusNote.textContent = "Sesi pengelola belum aktif.";
        syncUploadModalState();
        return;
      }
      btn.disabled = true;
      els.uploadStatusNote.textContent = `Menghubungi ${label} (@usvandrnr)...`;
      try {
        const res = await fetch(`/api/memories?action=${encodeURIComponent(action)}`, {
          method: "POST",
          headers: apiHeaders({ "Content-Type": "application/json" })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          const sourceHint = data.source === "public_ssr" ? " (mode profil publik)" : "";
          const added = Number(data.added || 0);
          const removed = Number(data.removed || 0);
          if (added > 0 || removed > 0) {
            const parts = [];
            if (added > 0) parts.push(`${added} foto baru ditambahkan`);
            if (removed > 0) parts.push(`${removed} foto terhapus dari sumber dibersihkan`);
            els.uploadStatusNote.textContent = `Sinkronisasi ${label}${sourceHint}: ${parts.join(", ")}.`;
            await fetchMemories(false);
          } else {
            els.uploadStatusNote.textContent = `Album ${label}${sourceHint} sudah sinkron dengan akun @usvandrnr.`;
          }
        } else {
          els.uploadStatusNote.textContent = data.error || `Gagal sinkronisasi ${label} (${res.status}).`;
        }
      } catch {
        els.uploadStatusNote.textContent = `Gagal menghubungi endpoint sinkronisasi ${label}.`;
      } finally {
        btn.disabled = false;
      }
    });
  }

  bindSocialSyncButton(els.syncInstagramBtn, { action: "sync-instagram", label: "Instagram" });
  bindSocialSyncButton(els.syncThreadsBtn, { action: "sync-threads", label: "Threads" });

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

  [els.grid, els.lightboxModal].forEach((container) => {
    container?.addEventListener("contextmenu", (e) => e.preventDefault());
    container?.addEventListener("dragstart", (e) => e.preventDefault());
  });

  renderAlbumTabs();
  fetchMemories(false);
})();
