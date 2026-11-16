(() => {
  const DATA = window.RPL3_MEMORIES_DATA;
  if (!DATA) return;

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
    livePhotos: [],
    quoteOverrides: new Map(),
    studentQuery: "",
    activeFilter: "all",
    expandedChapters: new Set(),
    activeChapterId: "verse-1",
    dbConnected: false,
    authConfigured: false,
    verifiedEmail: "",
    unlocked: false,
    ownerUiRevealed: hasOwnerQuery || cameFromMagicLink,
    pendingAutoOpenUpload: hasOwnerQuery || cameFromMagicLink,
    accessToken: sessionStorage.getItem(TOKEN_STORAGE_KEY) || "",
    queuedFiles: [],
    lightboxList: [],
    lightboxMode: "photos",
    lightboxIdx: -1,
    spotifyLoaded: false,
    silentMode: false,
    montagePlaying: false,
    montageTime: 0,
    lastCueIdx: -1,
  };

  if (cameFromMagicLink) {
    const token = hashParams.get("access_token");
    if (token) {
      state.accessToken = token;
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  const els = {
    memorialGate: document.getElementById("memorialGate"),
    enterWithAudioBtn: document.getElementById("enterWithAudioBtn"),
    enterSilentBtn: document.getElementById("enterSilentBtn"),
    fullMp3AudioEl: document.getElementById("fullMp3AudioEl"),
    memorialAudioEl: document.getElementById("memorialAudioEl"),

    montageStage: document.getElementById("montageStage"),
    montageImg: document.getElementById("montageImg"),
    montageHudPhase: document.getElementById("montageHudPhase"),
    montageHudTime: document.getElementById("montageHudTime"),
    montageCenterLyric: document.getElementById("montageCenterLyric"),
    montageSubLyric: document.getElementById("montageSubLyric"),
    montagePhotoLabel: document.getElementById("montagePhotoLabel"),
    montagePlayPauseBtn: document.getElementById("montagePlayPauseBtn"),
    montageReplayBtn: document.getElementById("montageReplayBtn"),
    montageMuteBtn: document.getElementById("montageMuteBtn"),
    openSpotifyDockBtn: document.getElementById("openSpotifyDockBtn"),
    phaseSegs: [...document.querySelectorAll(".phase-seg")],

    yearNow: document.getElementById("yearNow"),
    scrapFilterPills: document.getElementById("scrapFilterPills"),
    scrapActiveCountNote: document.getElementById("scrapActiveCountNote"),
    chaptersContainer: document.getElementById("chaptersContainer"),
    statPhotosCount: document.getElementById("statPhotosCount"),
    statStudentsCount: document.getElementById("statStudentsCount"),
    statOwnerBadge: document.getElementById("statOwnerBadge"),
    finaleUploadBtn: document.getElementById("finaleUploadBtn"),
    finaleDesc: document.getElementById("finaleDesc"),
    finaleSubheadline: document.getElementById("finaleSubheadline"),
    studentSearchInput: document.getElementById("studentSearchInput"),
    visibleStudentsCount: document.getElementById("visibleStudentsCount"),
    studentsRosterGrid: document.getElementById("studentsRosterGrid"),
    ownerTriggerEyebrow: document.getElementById("ownerTriggerEyebrow"),
    ownerTriggerFooter: document.getElementById("ownerTriggerFooter"),

    audioDockBody: document.getElementById("audioDockBody"),
    toggleDockBtn: document.getElementById("toggleDockBtn"),
    dockActiveChapter: document.getElementById("dockActiveChapter"),
    tabEditBtn: document.getElementById("tabEditBtn"),
    tabSpotifyBtn: document.getElementById("tabSpotifyBtn"),
    editAudioPanel: document.getElementById("editAudioPanel"),
    spotifyPanel: document.getElementById("spotifyPanel"),
    spotifyEmbedMount: document.getElementById("spotifyEmbedMount"),
    pickLocalMp3Btn: document.getElementById("pickLocalMp3Btn"),
    customAudioFileInput: document.getElementById("customAudioFileInput"),
    useEditAudioBtn: document.getElementById("useEditAudioBtn"),
    dockReplayEditBtn: document.getElementById("dockReplayEditBtn"),
    dockPauseEditBtn: document.getElementById("dockPauseEditBtn"),

    lightboxModal: document.getElementById("lightboxModal"),
    lbTopLabel: document.getElementById("lbTopLabel"),
    lbMediaWrap: document.getElementById("lbMediaWrap"),
    lbCloseBtn: document.getElementById("lbCloseBtn"),
    lbImage: document.getElementById("lbImage"),
    lbTag: document.getElementById("lbTag"),
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
    ownerOtpInput: document.getElementById("ownerOtpInput"),
    verifyOtpBtn: document.getElementById("verifyOtpBtn"),
    ownerPasswordInput: document.getElementById("ownerPasswordInput"),
    passwordLoginBtn: document.getElementById("passwordLoginBtn"),
    passcodeFeedback: document.getElementById("passcodeFeedback"),
    ownerToolsPanel: document.getElementById("ownerToolsPanel"),
    adminTabUploadBtn: document.getElementById("adminTabUploadBtn"),
    adminTabQuoteBtn: document.getElementById("adminTabQuoteBtn"),
    uploadForm: document.getElementById("uploadForm"),
    quoteForm: document.getElementById("quoteForm"),
    dropzoneBox: document.getElementById("dropzoneBox"),
    photoFilesInput: document.getElementById("photoFilesInput"),
    uploadQueue: document.getElementById("uploadQueue"),
    memImageUrlInput: document.getElementById("memImageUrlInput"),
    memTitleInput: document.getElementById("memTitleInput"),
    memAlbumSelect: document.getElementById("memAlbumSelect"),
    memDateInput: document.getElementById("memDateInput"),
    memLocationInput: document.getElementById("memLocationInput"),
    memCaptionInput: document.getElementById("memCaptionInput"),
    submitUploadBtn: document.getElementById("submitUploadBtn"),
    logoutOwnerBtn: document.getElementById("logoutOwnerBtn"),
    uploadStatusNote: document.getElementById("uploadStatusNote"),
    quoteStudentSelect: document.getElementById("quoteStudentSelect"),
    quoteTextInput: document.getElementById("quoteTextInput"),
    saveQuoteBtn: document.getElementById("saveQuoteBtn"),
    quoteStatusNote: document.getElementById("quoteStatusNote"),
  };

  if (els.yearNow) els.yearNow.textContent = String(new Date().getFullYear());
  if (els.finaleDesc) els.finaleDesc.textContent = DATA.finaleChapter.description;
  if (els.finaleSubheadline) els.finaleSubheadline.textContent = DATA.finaleChapter.subheadline;

  function apiHeaders(extra = {}) {
    const h = { ...extra };
    if (state.accessToken) h.Authorization = `Bearer ${state.accessToken}`;
    return h;
  }

  /* =========================================================
     Full-Song Audio & Sync Engine
     Urutan Prioritas:
       1. html5-full  : File MP3 lokal (bila ada / dipilih user -> 03:47 sinkron 1:1)
       2. spotify     : Spotify IFrame API (Full 03:47 bila login / 30s preview Chorus)
       3. html5-edit  : Edit 19s Lokal (so-are-we-edit.mp4 -> jaminan bunyi offline)
       4. timer       : Mode sunyi tetap memutar foto & lirik
     ========================================================= */
  const fullCues = DATA.montageCues || [];
  const editCues = DATA.editMontageCues || fullCues;
  const FULL_DURATION = (fullCues.length > 0 ? fullCues[fullCues.length - 1].end : DATA.audio?.fullDurationSec) || 227;
  const EDIT_DURATION = (editCues.length > 0 ? editCues[editCues.length - 1].end : 19.74) || 19.74;

  let audioBackend = "timer"; // "html5-full" | "spotify" | "html5-edit" | "timer"
  let spotifyCtrl = null;
  let spotifyReady = false;
  let spotifyPosSec = 0;
  let spotifyDurSec = 0;
  let spotifyLastTickMs = 0;
  let spotifyPaused = true;
  let spotifyHeardProgress = false;
  let spotifyFallbackTimer = null;
  let wantsSpotifyAutoplay = false;
  let isMuted = false;
  let localMp3Checked = false;
  let hasLocalMp3 = false;
  let syncRafId = null;
  let lastWallClock = 0;

  function activeCues() {
    return audioBackend === "html5-edit" ? editCues : fullCues;
  }

  function activeTotalDur() {
    if (audioBackend === "html5-edit") {
      return (els.memorialAudioEl?.duration && Number.isFinite(els.memorialAudioEl.duration))
        ? els.memorialAudioEl.duration
        : EDIT_DURATION;
    }
    if (audioBackend === "html5-full" && els.fullMp3AudioEl?.duration && Number.isFinite(els.fullMp3AudioEl.duration)) {
      return Math.max(els.fullMp3AudioEl.duration, FULL_DURATION);
    }
    return FULL_DURATION;
  }

  function formatSec(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
  }

  function renderMontageAt(t) {
    const cues = activeCues();
    if (cues.length === 0) return;
    const totalDur = activeTotalDur();
    const wrappedT = ((t % totalDur) + totalDur) % totalDur;
    let cueIdx = cues.findIndex((c) => wrappedT >= c.start && wrappedT < c.end);
    if (cueIdx === -1) cueIdx = cues.length - 1;
    const cue = cues[cueIdx];

    if (els.montageHudTime) {
      els.montageHudTime.textContent = `${formatSec(wrappedT)} / ${formatSec(totalDur)}`;
    }

    // Highlight active section in phase bar
    els.phaseSegs.forEach((seg) => {
      const list = (seg.dataset.phases || "").split(",").map((s) => s.trim());
      seg.classList.toggle("active", list.includes(cue.phase));
    });

    if (els.dockActiveChapter) {
      let statusTxt = "Timer Sinkron";
      if (audioBackend === "html5-full") {
        statusTxt = "Full Track (03:47) · MP3 Lokal Aktif";
      } else if (audioBackend === "spotify") {
        statusTxt = spotifyDurSec >= 180
          ? "Spotify Full (03:47) · Sinkron Penuh"
          : "Spotify Preview 30s · Login / Pilih MP3 untuk Full 03:47";
      } else if (audioBackend === "html5-edit") {
        statusTxt = "Edit Kenangan 19s (Suara Lokal)";
      } else if (state.silentMode) {
        statusTxt = "Mode Tanpa Suara";
      }
      els.dockActiveChapter.textContent = statusTxt;
    }

    if (cueIdx === state.lastCueIdx) return;
    state.lastCueIdx = cueIdx;

    if (els.montageImg) {
      els.montageImg.src = cue.src;
      els.montageImg.alt = cue.label || "XII RPL-3";
      els.montageImg.style.objectPosition = cue.focus || "center 50%";
      els.montageImg.classList.remove("is-zooming");
      void els.montageImg.offsetWidth;
      els.montageImg.classList.add("is-zooming");
    }
    if (els.montagePhotoLabel) {
      els.montagePhotoLabel.textContent = cue.label || "";
    }
    if (els.montageHudPhase) {
      const phaseNames = {
        intro: "REC · THE NIGHT IS STILL YOUNG",
        "verse-1": "REC · VERSE 1",
        "pre-chorus": "REC · PRE-CHORUS",
        "pre-chorus-2": "REC · PRE-CHORUS",
        chorus: "REC · THE NIGHT IS STILL YOUNG",
        "verse-2": "REC · VERSE 2 · HIGHLIGHTS",
        bridge: "REC · BRIDGE",
        "outro-so": "REC · AND SO ARE WE"
      };
      els.montageHudPhase.textContent = phaseNames[cue.phase] || "REC · THE NIGHT IS STILL YOUNG";
    }

    if (els.montageStage) {
      els.montageStage.classList.remove("mood-somber", "mood-flash", "mood-bright", "mood-finale");
      if (cue.mood === "flash") void els.montageStage.offsetWidth;
      els.montageStage.classList.add(`mood-${cue.mood}`);
    }

    if (els.montageCenterLyric) {
      els.montageCenterLyric.innerHTML = "";
      (cue.stackedWords || []).forEach((w) => {
        const span = document.createElement("span");
        span.className = "montage-stacked-word";
        span.textContent = w;
        els.montageCenterLyric.appendChild(span);
      });
    }

    if (els.montageSubLyric) {
      els.montageSubLyric.textContent = cue.bottomLyric || "";
    }
  }

  function syncAudioButtons() {
    if (els.montagePlayPauseBtn) {
      els.montagePlayPauseBtn.textContent = state.montagePlaying ? "⏸ Jeda" : "▶ Putar";
    }
    if (els.montageMuteBtn) {
      els.montageMuteBtn.textContent =
        state.silentMode || isMuted ? "🔇 Tanpa Suara" : "🔊 Suara Aktif";
    }
  }

  function startSyncLoop() {
    cancelAnimationFrame(syncRafId);
    lastWallClock = performance.now();

    const tick = (now) => {
      if (!state.montagePlaying) return;
      const dt = Math.min(0.25, (now - lastWallClock) / 1000);
      lastWallClock = now;

      if (audioBackend === "html5-full" && els.fullMp3AudioEl && !els.fullMp3AudioEl.paused) {
        state.montageTime = els.fullMp3AudioEl.currentTime || 0;
      } else if (audioBackend === "html5-edit" && els.memorialAudioEl && !els.memorialAudioEl.paused) {
        state.montageTime = els.memorialAudioEl.currentTime || 0;
      } else if (audioBackend === "spotify" && spotifyHeardProgress && !spotifyPaused) {
        const elapsedSinceUpdate = Math.min(0.6, (performance.now() - spotifyLastTickMs) / 1000);
        const pos = spotifyPosSec + elapsedSinceUpdate;
        if (spotifyDurSec >= 180) {
          state.montageTime = pos;
        } else {
          // Guest Spotify embed memutar 30 detik chorus ("The night is still young...") mulai 52.92s
          state.montageTime = 52.92 + (pos % 29.7);
        }
      } else {
        state.montageTime = (state.montageTime + dt) % activeTotalDur();
      }

      renderMontageAt(state.montageTime);
      syncRafId = requestAnimationFrame(tick);
    };

    syncRafId = requestAnimationFrame(tick);
  }

  async function detectLocalMp3() {
    if (localMp3Checked) return hasLocalMp3;
    localMp3Checked = true;
    const url = DATA.audio?.customMp3Url;
    if (!url) return false;
    try {
      const res = await fetch(url, { method: "HEAD" });
      const ct = res.headers.get("content-type") || "";
      if (res.ok && !ct.includes("text/html")) {
        hasLocalMp3 = true;
      }
    } catch {
      hasLocalMp3 = false;
    }
    return hasLocalMp3;
  }

  function stopAllAudioEngines() {
    clearTimeout(spotifyFallbackTimer);
    if (els.fullMp3AudioEl && !els.fullMp3AudioEl.paused) els.fullMp3AudioEl.pause();
    if (els.memorialAudioEl && !els.memorialAudioEl.paused) els.memorialAudioEl.pause();
    if (spotifyCtrl && typeof spotifyCtrl.pause === "function" && !spotifyPaused) {
      try { spotifyCtrl.pause(); } catch {}
    }
  }

  function activateLocalEditAudio(startAt = 0) {
    stopAllAudioEngines();
    audioBackend = "html5-edit";
    state.silentMode = false;
    isMuted = false;
    state.lastCueIdx = -1;
    state.montageTime = startAt;
    state.montagePlaying = true;
    renderMontageAt(startAt);
    startSyncLoop();
    if (els.memorialAudioEl) {
      els.memorialAudioEl.muted = false;
      els.memorialAudioEl.currentTime = startAt % EDIT_DURATION;
      els.memorialAudioEl.play().catch(() => {
        audioBackend = "timer";
      });
    }
    syncAudioButtons();
  }

  function ensureSpotifyController(autoPlayOnReady = false) {
    if (autoPlayOnReady) wantsSpotifyAutoplay = true;
    if (!els.spotifyEmbedMount || state.spotifyLoaded) {
      if (spotifyCtrl && wantsSpotifyAutoplay && !state.silentMode) {
        try { spotifyCtrl.play(); } catch {}
      }
      return;
    }
    state.spotifyLoaded = true;

    const mountController = (IFrameAPI) => {
      IFrameAPI.createController(
        els.spotifyEmbedMount,
        {
          uri: DATA.audio?.spotifyUri || "spotify:track:3idU3rXoFCEFhAAbPGbwht",
          width: "100%",
          height: "152"
        },
        (ctrl) => {
          spotifyCtrl = ctrl;
          ctrl.addListener("ready", () => {
            spotifyReady = true;
            if (wantsSpotifyAutoplay && !state.silentMode) {
              try { ctrl.play(); } catch {}
            }
          });
          ctrl.addListener("playback_update", (e) => {
            const d = e?.data;
            if (!d) return;
            spotifyPaused = Boolean(d.isPaused);
            spotifyDurSec = (d.duration || 0) / 1000;
            spotifyPosSec = (d.position || 0) / 1000;
            spotifyLastTickMs = performance.now();
            if (!spotifyPaused && spotifyPosSec > 0) {
              spotifyHeardProgress = true;
              clearTimeout(spotifyFallbackTimer);
            }
          });
        }
      );
    };

    if (window.SpotifyIframeApi) {
      mountController(window.SpotifyIframeApi);
      return;
    }

    const prevReady = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      window.SpotifyIframeApi = IFrameAPI;
      if (typeof prevReady === "function") prevReady(IFrameAPI);
      mountController(IFrameAPI);
    };

    if (!document.querySelector('script[src*="open.spotify.com/embed/iframe-api"]')) {
      const s = document.createElement("script");
      s.src = "https://open.spotify.com/embed/iframe-api/v1";
      s.async = true;
      document.head.appendChild(s);
    }
  }

  // Preload Spotify Embed API lebih awal agar langsung siap saat tombol Mulai ditekan
  ensureSpotifyController(false);

  async function dismissGateAndStart(withAudio) {
    els.memorialGate?.classList.add("is-dismissed");
    state.silentMode = !withAudio;
    isMuted = !withAudio;
    state.montagePlaying = true;
    state.lastCueIdx = -1;
    state.montageTime = 0;

    if (withAudio) {
      const mp3Ok = await detectLocalMp3();
      if (mp3Ok && els.fullMp3AudioEl) {
        audioBackend = "html5-full";
        if (!els.fullMp3AudioEl.src) els.fullMp3AudioEl.src = DATA.audio.customMp3Url;
        els.fullMp3AudioEl.muted = false;
        els.fullMp3AudioEl.currentTime = 0;
        els.fullMp3AudioEl.play().catch(() => activateLocalEditAudio(0));
      } else {
        audioBackend = "spotify";
        wantsSpotifyAutoplay = true;
        openAudioDock("spotify", false);
        ensureSpotifyController(true);
        spotifyFallbackTimer = setTimeout(() => {
          if (!state.silentMode && state.montagePlaying && audioBackend === "spotify" && !spotifyHeardProgress) {
            activateLocalEditAudio(0);
          }
        }, 5000);
      }
    } else {
      audioBackend = "timer";
    }

    renderMontageAt(0);
    startSyncLoop();
    syncAudioButtons();
  }

  els.enterWithAudioBtn?.addEventListener("click", () => dismissGateAndStart(true));
  els.enterSilentBtn?.addEventListener("click", () => dismissGateAndStart(false));

  function togglePlayback() {
    state.montagePlaying = !state.montagePlaying;
    if (state.montagePlaying) {
      if (audioBackend === "html5-full" && els.fullMp3AudioEl) {
        els.fullMp3AudioEl.play().catch(() => {});
      } else if (audioBackend === "html5-edit" && els.memorialAudioEl) {
        els.memorialAudioEl.play().catch(() => {});
      } else if (audioBackend === "spotify" && spotifyCtrl && !state.silentMode) {
        try { spotifyCtrl.play(); } catch {}
      }
      startSyncLoop();
    } else {
      cancelAnimationFrame(syncRafId);
      if (audioBackend === "html5-full" && els.fullMp3AudioEl) {
        els.fullMp3AudioEl.pause();
      } else if (audioBackend === "html5-edit" && els.memorialAudioEl) {
        els.memorialAudioEl.pause();
      } else if (audioBackend === "spotify" && spotifyCtrl) {
        try { spotifyCtrl.pause(); } catch {}
      }
    }
    syncAudioButtons();
  }

  function seekMontage(sec) {
    const cues = activeCues();
    const totalDur = activeTotalDur();
    const targetSec = Math.max(0, Math.min(totalDur - 0.1, sec));
    state.lastCueIdx = -1;
    state.montageTime = targetSec;
    state.montagePlaying = true;
    renderMontageAt(targetSec);
    if (audioBackend === "html5-full" && els.fullMp3AudioEl) {
      els.fullMp3AudioEl.currentTime = targetSec;
      els.fullMp3AudioEl.play().catch(() => {});
    } else if (audioBackend === "html5-edit" && els.memorialAudioEl) {
      els.memorialAudioEl.currentTime = targetSec % EDIT_DURATION;
      els.memorialAudioEl.play().catch(() => {});
    } else if (audioBackend === "spotify" && spotifyCtrl && !state.silentMode) {
      try {
        if (spotifyDurSec >= 180) spotifyCtrl.seek(targetSec);
        spotifyCtrl.play();
      } catch {}
    }
    startSyncLoop();
    syncAudioButtons();
  }

  els.montagePlayPauseBtn?.addEventListener("click", togglePlayback);
  els.montageReplayBtn?.addEventListener("click", () => seekMontage(0));
  els.montageMuteBtn?.addEventListener("click", () => {
    if (state.silentMode || isMuted) {
      state.silentMode = false;
      isMuted = false;
      if (audioBackend === "timer") {
        activateLocalEditAudio(0);
        return;
      }
      if (audioBackend === "html5-full" && els.fullMp3AudioEl) {
        els.fullMp3AudioEl.muted = false;
        els.fullMp3AudioEl.play().catch(() => {});
      } else if (audioBackend === "html5-edit" && els.memorialAudioEl) {
        els.memorialAudioEl.muted = false;
        els.memorialAudioEl.play().catch(() => {});
      } else if (audioBackend === "spotify" && spotifyCtrl) {
        try { spotifyCtrl.play(); } catch {}
      }
    } else {
      isMuted = true;
      if (audioBackend === "html5-full" && els.fullMp3AudioEl) els.fullMp3AudioEl.muted = true;
      if (audioBackend === "html5-edit" && els.memorialAudioEl) els.memorialAudioEl.muted = true;
      if (audioBackend === "spotify" && spotifyCtrl) {
        try { spotifyCtrl.pause(); } catch {}
      }
    }
    syncAudioButtons();
  });

  els.pickLocalMp3Btn?.addEventListener("click", () => els.customAudioFileInput?.click());
  els.customAudioFileInput?.addEventListener("change", (ev) => {
    const file = ev.target?.files?.[0];
    if (!file || !els.fullMp3AudioEl) return;
    stopAllAudioEngines();
    const objUrl = URL.createObjectURL(file);
    els.fullMp3AudioEl.src = objUrl;
    els.fullMp3AudioEl.muted = false;
    els.fullMp3AudioEl.currentTime = 0;
    audioBackend = "html5-full";
    state.silentMode = false;
    isMuted = false;
    state.montagePlaying = true;
    state.lastCueIdx = -1;
    state.montageTime = 0;
    els.fullMp3AudioEl.play().catch(() => {});
    renderMontageAt(0);
    startSyncLoop();
    syncAudioButtons();
  });
  els.useEditAudioBtn?.addEventListener("click", () => activateLocalEditAudio(0));

  els.phaseSegs.forEach((seg) => {
    seg.addEventListener("click", () => {
      if (audioBackend === "html5-edit") {
        // Beralih ke tampilan penuh 03:47 bila mengklik bagian Verse/Bridge/Outro
        audioBackend = spotifyHeardProgress ? "spotify" : "timer";
        state.lastCueIdx = -1;
      }
      const sec = Number.parseFloat(seg.dataset.seek || "0") || 0;
      seekMontage(sec);
    });
  });

  /* =========================================================
     Filter Sticky Scrapbook
     ========================================================= */

  function renderFilterPills() {
    if (!els.scrapFilterPills) return;
    const filters = [
      { id: "all", label: "Semua Bab" },
      { id: "verse-1", label: "Gerbang & Kelas" },
      { id: "pre-chorus", label: "Bangku & Batik" },
      { id: "chorus-1", label: "Bu Tika" },
      { id: "special-rpl", label: "Pramuka & Lapangan" },
      { id: "verse-2", label: "Praktek Nikah" },
      { id: "cant-move-on", label: "Highlight @_engineerd3" },
      { id: "bridge", label: "Perpisahan & Angkatan XV" },
    ];

    els.scrapFilterPills.innerHTML = "";
    filters.forEach((f) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `scrap-filter-btn ${state.activeFilter === f.id ? "active" : ""}`;
      btn.textContent = f.label;
      btn.addEventListener("click", () => {
        state.activeFilter = f.id;
        if (f.id !== "all") state.expandedChapters.add(f.id);
        renderFilterPills();
        renderChapters();
        if (els.scrapActiveCountNote) {
          els.scrapActiveCountNote.textContent =
            f.id === "all" ? "Menampilkan seluruh lembaran scrapbook (2021–2024)" : `Menampilkan bagian: ${f.label}`;
        }
      });
      els.scrapFilterPills.appendChild(btn);
    });
  }

  /* =========================================================
     Render Polaroid Scrapbook Cards (Konsep 3)
     ========================================================= */
  function createPolaroidCard(photo, onOpen, onDelete) {
    const card = document.createElement("article");
    card.className = `polaroid-card ${photo.aspect === "portrait" ? "is-portrait-media" : ""}`;
    card.innerHTML = `
      <button type="button" class="polaroid-img-btn" aria-label="Perbesar foto">
        <img loading="lazy" decoding="async" draggable="false" alt="" />
        <span class="img-shield" aria-hidden="true"></span>
      </button>
      <div class="polaroid-apron">
        <div class="polaroid-top">
          <h3 class="polaroid-hand-title"></h3>
          <span class="polaroid-date"></span>
        </div>
        <p class="polaroid-cap"></p>
      </div>
    `;
    const img = card.querySelector("img");
    img.src = photo.src;
    img.alt = photo.title || "Kenangan XII RPL-3";
    card.querySelector(".polaroid-hand-title").textContent = photo.title || "Kenangan XII RPL-3";
    card.querySelector(".polaroid-date").textContent = photo.date || "";
    const capEl = card.querySelector(".polaroid-cap");
    if (photo.caption) {
      capEl.textContent = photo.caption;
    } else {
      capEl.hidden = true;
    }

    card.querySelector(".polaroid-img-btn").addEventListener("click", onOpen);

    if (photo.isLive && state.unlocked && typeof onDelete === "function") {
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "memory-delete-btn";
      delBtn.textContent = "Hapus";
      delBtn.addEventListener("click", () => onDelete(photo.id));
      card.querySelector(".polaroid-apron").appendChild(delBtn);
    }

    return card;
  }

  function renderChapters() {
    if (!els.chaptersContainer) return;
    els.chaptersContainer.innerHTML = "";

    const totalStatic = DATA.chapters.reduce((acc, ch) => acc + ch.photos.length, 0);
    if (els.statPhotosCount) {
      els.statPhotosCount.textContent = String(totalStatic + state.livePhotos.length + DATA.students.length);
    }

    const visibleChapters =
      state.activeFilter === "all"
        ? DATA.chapters
        : DATA.chapters.filter((ch) => ch.id === state.activeFilter);

    visibleChapters.forEach((ch, idx) => {
      const sec = document.createElement("section");
      sec.className = `chapter-section ${idx % 2 === 0 ? "theme-desk-a" : "theme-desk-b"}`;
      sec.id = `chapter-${ch.id}`;
      sec.dataset.chapterId = ch.id;

      const isExpanded = state.expandedChapters.has(ch.id);
      const limitCount = !isExpanded && ch.collapsibleCount ? ch.collapsibleCount : ch.photos.length;
      const shownPhotos = ch.photos.slice(0, limitCount);
      const useFourCols = ch.id === "cant-move-on" || ch.photos.length >= 12;

      sec.innerHTML = `
        <div class="container">
          <div class="chapter-head">
            <div>
              <div class="chapter-badge-row">
                <span class="chapter-num"></span>
                <span class="chapter-lyric-cue"></span>
              </div>
              <h2 class="chapter-title"></h2>
              <p class="chapter-summary"></p>
            </div>
          </div>
          <div class="polaroid-grid ${useFourCols ? "cols-4" : ""}"></div>
        </div>
      `;

      sec.querySelector(".chapter-num").textContent = `${ch.order} · ${ch.songPart}`;
      sec.querySelector(".chapter-lyric-cue").textContent = ch.lyricCue;
      sec.querySelector(".chapter-title").textContent = ch.heading;
      sec.querySelector(".chapter-summary").textContent = ch.summary;

      const grid = sec.querySelector(".polaroid-grid");
      const chapterLightboxList = ch.photos.map((p) => ({
        ...p,
        tag: `${ch.order} · ${ch.songPart}`,
      }));

      shownPhotos.forEach((p, photoIdx) => {
        grid.appendChild(
          createPolaroidCard(
            { ...p, tag: ch.songPart, isLive: false },
            () => openLightbox("photos", chapterLightboxList, photoIdx)
          )
        );
      });

      if (ch.photos.length > limitCount) {
        const remaining = ch.photos.length - limitCount;
        const expandWrap = document.createElement("div");
        expandWrap.className = "expand-chapter-wrap";
        const expandBtn = document.createElement("button");
        expandBtn.type = "button";
        expandBtn.className = "rpl-mini-btn is-gold";
        expandBtn.textContent = `Lihat Seluruh ${ch.photos.length} Dokumentasi @_engineerd3 (+${remaining} lainnya)`;
        expandBtn.addEventListener("click", () => {
          state.expandedChapters.add(ch.id);
          renderChapters();
        });
        expandWrap.appendChild(expandBtn);
        sec.querySelector(".container").appendChild(expandWrap);
      }

      if (ch.includesLiveUploads && (state.livePhotos.length > 0 || state.unlocked)) {
        const liveWrap = document.createElement("div");
        liveWrap.className = "live-uploads-block";
        liveWrap.innerHTML = `
          <div class="live-uploads-bar">
            <div>
              <h3 class="live-uploads-title">Arsip Tambahan &amp; Instagram @_engineerd3</h3>
              <p class="live-uploads-sub">
                Foto postingan IG atau unggahan tambahan kelas yang tersimpan di Supabase.
              </p>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
              <a href="${DATA.igUrl}" target="_blank" rel="noopener noreferrer" class="rpl-mini-btn">
                Buka IG @_engineerd3 &nearr;
              </a>
              <button type="button" class="rpl-mini-btn is-gold" id="chapterUploadBtn" ${state.unlocked ? "" : "hidden"}>
                + Unggah Foto
              </button>
            </div>
          </div>
          <div class="polaroid-grid" id="liveUploadsGrid"></div>
        `;

        const liveGrid = liveWrap.querySelector("#liveUploadsGrid");
        if (state.livePhotos.length === 0) {
          const note = document.createElement("div");
          note.style.cssText =
            "grid-column:1/-1;padding:22px;border:1px dashed rgba(255,255,255,0.16);border-radius:14px;font-size:13px;color:rgba(244,244,245,0.65);";
          note.textContent = state.unlocked
            ? "Belum ada foto tambahan di Supabase. Klik '+ Unggah Foto' untuk menambahkan."
            : "Belum ada unggahan foto tambahan dari arsip eksternal saat ini.";
          liveGrid.appendChild(note);
        } else {
          const liveLightboxList = state.livePhotos.map((lp) => ({
            id: lp.id,
            src: lp.image_data,
            title: lp.title || "Kenangan Tambahan",
            caption: lp.caption || "",
            date: lp.taken_date || lp.location || "",
            aspect: lp.aspect_hint || "auto",
            tag: String(lp.album || "RPL3:Kenangan").replace(/^RPL3:/, ""),
            isLive: true,
          }));
          liveLightboxList.forEach((lp, lpIdx) => {
            liveGrid.appendChild(
              createPolaroidCard(
                lp,
                () => openLightbox("photos", liveLightboxList, lpIdx),
                deleteLiveMemory
              )
            );
          });
        }

        liveWrap.querySelector("#chapterUploadBtn")?.addEventListener("click", () => openAdminModal("upload"));
        sec.querySelector(".container").appendChild(liveWrap);
      }

      els.chaptersContainer.appendChild(sec);
    });

    setupChapterObserver();
  }

  /* =========================================================
     Finale Buku Tahunan B&W (34 Siswa + 1 Kata-Kata)
     ========================================================= */
  function getMergedStudents() {
    return DATA.students.map((st, idx) => {
      const override = state.quoteOverrides.get(st.slug);
      return {
        index: idx + 1,
        slug: st.slug,
        name: st.name,
        photo: st.photo,
        quote: override !== undefined ? override : st.quote || "",
      };
    });
  }

  function renderStudents() {
    if (!els.studentsRosterGrid) return;
    const allStudents = getMergedStudents();
    const q = state.studentQuery.toLowerCase();
    const filtered = q
      ? allStudents.filter(
          (s) => s.name.toLowerCase().includes(q) || String(s.quote || "").toLowerCase().includes(q)
        )
      : allStudents;

    if (els.visibleStudentsCount) els.visibleStudentsCount.textContent = String(filtered.length);
    if (els.statStudentsCount) els.statStudentsCount.textContent = String(allStudents.length);

    els.studentsRosterGrid.innerHTML = "";
    if (filtered.length === 0) {
      const empty = document.createElement("p");
      empty.style.cssText = "grid-column:1/-1;text-align:center;color:rgba(244,244,245,0.6);padding:32px 0;";
      empty.textContent = "Tidak ada nama teman atau kata-kata yang cocok dengan pencarian.";
      els.studentsRosterGrid.appendChild(empty);
      return;
    }

    const lightboxItems = filtered.map((s) => ({
      src: s.photo,
      title: s.name,
      caption: s.quote ? `“${s.quote}”` : "Belum ada kata-kata yang ditambahkan.",
      date: `Siswa #${String(s.index).padStart(2, "0")} · XII RPL-3`,
      tag: "And So Are We · Potret B&W",
    }));

    filtered.forEach((s, idx) => {
      const card = document.createElement("article");
      card.className = "student-card";
      card.innerHTML = `
        <button type="button" class="student-photo-btn" aria-label="Lihat potret ${s.name}">
          <span class="student-num-badge">${String(s.index).padStart(2, "0")}</span>
          <img loading="lazy" decoding="async" draggable="false" alt="" />
          <span class="img-shield" aria-hidden="true"></span>
        </button>
        <div class="student-body">
          <h3 class="student-name"></h3>
          <p class="student-quote"></p>
        </div>
      `;

      const img = card.querySelector("img");
      img.src = s.photo;
      img.alt = `Potret hitam putih ${s.name}`;

      card.querySelector(".student-name").textContent = s.name;
      const quoteEl = card.querySelector(".student-quote");
      if (s.quote) {
        quoteEl.textContent = `“${s.quote}”`;
        quoteEl.classList.remove("is-empty");
      } else {
        quoteEl.textContent = "— Belum mengisi kata-kata —";
        quoteEl.classList.add("is-empty");
      }

      card.querySelector(".student-photo-btn").addEventListener("click", () => {
        openLightbox("students", lightboxItems, idx);
      });

      if (state.unlocked) {
        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "student-edit-btn";
        editBtn.textContent = s.quote ? "Edit Kata-Kata" : "+ Isi Kata-Kata";
        editBtn.addEventListener("click", () => openAdminModal("quote", s.slug));
        card.querySelector(".student-body").appendChild(editBtn);
      }

      els.studentsRosterGrid.appendChild(card);
    });
  }

  function populateQuoteSelect(selectedSlug) {
    if (!els.quoteStudentSelect) return;
    const students = getMergedStudents();
    const prev = selectedSlug || els.quoteStudentSelect.value || students[0]?.slug || "";
    els.quoteStudentSelect.innerHTML = "";
    students.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.slug;
      opt.textContent = `${String(s.index).padStart(2, "0")}. ${s.name}${s.quote ? " ✓" : ""}`;
      els.quoteStudentSelect.appendChild(opt);
    });
    if (prev) els.quoteStudentSelect.value = prev;
    syncQuoteTextareaFromSelection();
  }

  function syncQuoteTextareaFromSelection() {
    if (!els.quoteStudentSelect || !els.quoteTextInput) return;
    const slug = els.quoteStudentSelect.value;
    const found = getMergedStudents().find((s) => s.slug === slug);
    els.quoteTextInput.value = found?.quote || "";
  }

  /* =========================================================
     Lightbox Penampil Foto
     ========================================================= */
  function openLightbox(mode, list, idx) {
    if (!Array.isArray(list) || idx < 0 || idx >= list.length) return;
    state.lightboxMode = mode;
    state.lightboxList = list;
    state.lightboxIdx = idx;

    const item = list[idx];
    els.lbTopLabel.textContent = mode === "students" ? "And So Are We · Potret B&W" : "XII RPL-3 · Arsip Kenangan";
    els.lbMediaWrap?.classList.toggle("is-bw-portrait-wrap", mode === "students");
    els.lbImage.src = item.src;
    els.lbImage.alt = item.title || "Foto XII RPL-3";
    els.lbTag.textContent = item.tag || "XII RPL-3";
    els.lbTitle.textContent = item.title || "";
    els.lbTitle.hidden = !item.title;
    els.lbMeta.textContent = item.date || "";
    els.lbMeta.hidden = !item.date;
    els.lbCaption.textContent = item.caption || "";
    els.lbCaption.hidden = !item.caption;

    els.lightboxModal.hidden = false;
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
  }

  function closeLightbox() {
    els.lightboxModal.hidden = true;
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
  }

  function stepLightbox(delta) {
    const list = state.lightboxList;
    if (!list || list.length === 0) return;
    const next = (state.lightboxIdx + delta + list.length) % list.length;
    openLightbox(state.lightboxMode, list, next);
  }

  /* =========================================================
     Floating Audio Dock (Edit 19s vs Full Spotify)
     ========================================================= */
  function openAudioDock(mode, stopStageAudio = true) {
    if (!els.audioDockBody) return;
    els.audioDockBody.hidden = false;
    els.toggleDockBtn.textContent = "Tutup";
    els.toggleDockBtn.setAttribute("aria-expanded", "true");
    if (mode) switchAudioMode(mode, stopStageAudio);
  }

  function switchAudioMode(mode, stopStageAudio = true) {
    const isSpotify = mode === "spotify";
    els.tabEditBtn?.classList.toggle("active", !isSpotify);
    els.tabSpotifyBtn?.classList.toggle("active", isSpotify);
    if (els.editAudioPanel) els.editAudioPanel.hidden = isSpotify;
    if (els.spotifyPanel) els.spotifyPanel.hidden = !isSpotify;
    if (isSpotify) {
      if (stopStageAudio && state.montagePlaying && audioBackend !== "spotify") {
        stopAllAudioEngines();
        state.montagePlaying = false;
        cancelAnimationFrame(syncRafId);
        syncAudioButtons();
      }
      ensureSpotifyController(false);
    }
  }

  els.toggleDockBtn?.addEventListener("click", () => {
    if (els.audioDockBody.hidden) {
      openAudioDock();
    } else {
      els.audioDockBody.hidden = true;
      els.toggleDockBtn.textContent = "Opsi Lagu";
      els.toggleDockBtn.setAttribute("aria-expanded", "false");
    }
  });
  els.openSpotifyDockBtn?.addEventListener("click", () => openAudioDock("spotify", false));
  els.tabEditBtn?.addEventListener("click", () => switchAudioMode("edit"));
  els.tabSpotifyBtn?.addEventListener("click", () => switchAudioMode("spotify", false));
  els.dockReplayEditBtn?.addEventListener("click", () => {
    state.silentMode = false;
    isMuted = false;
    seekMontage(0);
  });
  els.dockPauseEditBtn?.addEventListener("click", () => {
    if (state.montagePlaying) togglePlayback();
  });

  /* =========================================================
     Observer Bab Aktif Saat Scroll
     ========================================================= */
  let chapterObserver = null;
  function setupChapterObserver() {
    if (chapterObserver) chapterObserver.disconnect();
    const sections = document.querySelectorAll("[data-chapter-id]");
    if (!("IntersectionObserver" in window) || sections.length === 0) return;

    chapterObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.dataset?.chapterId) {
          state.activeChapterId = visible.target.dataset.chapterId;
        }
      },
      { rootMargin: "-25% 0px -45% 0px", threshold: [0.1, 0.35, 0.6] }
    );
    sections.forEach((sec) => chapterObserver.observe(sec));
  }

  /* =========================================================
     Sinkronisasi Supabase & Mode Pemilik (?kelola)
     ========================================================= */
  function syncOwnerUi() {
    if (els.finaleUploadBtn) els.finaleUploadBtn.hidden = !state.unlocked;
    if (els.statOwnerBadge) els.statOwnerBadge.hidden = !state.unlocked;

    if (!state.authConfigured) {
      if (els.passcodeBox) els.passcodeBox.hidden = false;
      if (els.ownerToolsPanel) els.ownerToolsPanel.hidden = true;
      if (els.sendOtpBtn) els.sendOtpBtn.disabled = true;
      if (els.passwordLoginBtn) els.passwordLoginBtn.disabled = true;
      if (els.verifyOtpBtn) els.verifyOtpBtn.disabled = true;
      if (els.passcodeHint) {
        els.passcodeHint.textContent =
          "SUPABASE_ANON_KEY belum terkonfigurasi di environment server. Saat database terhubung di Vercel, verifikasi pemilik aktif otomatis.";
      }
      return;
    }

    if (els.sendOtpBtn) els.sendOtpBtn.disabled = false;
    if (els.passwordLoginBtn) els.passwordLoginBtn.disabled = false;
    if (els.verifyOtpBtn) els.verifyOtpBtn.disabled = false;

    if (state.unlocked) {
      if (els.passcodeBox) els.passcodeBox.hidden = true;
      if (els.ownerToolsPanel) els.ownerToolsPanel.hidden = false;
    } else {
      if (els.passcodeBox) els.passcodeBox.hidden = false;
      if (els.ownerToolsPanel) els.ownerToolsPanel.hidden = true;
      if (els.passcodeHint) {
        els.passcodeHint.textContent =
          "Masukkan email pengelola terdaftar untuk membuka fitur unggah kenangan dan pengisian 1 kata-kata siswa.";
      }
    }
  }

  async function fetchRpl3Archive() {
    try {
      const res = await fetch("/api/memories?scope=rpl3&sort=newest&limit=120", {
        headers: apiHeaders(),
      });
      const data = await res.json();
      state.dbConnected = Boolean(data.dbConnected);
      state.authConfigured = Boolean(data.authConfigured);
      state.verifiedEmail = data.verifiedEmail || "";
      state.unlocked = Boolean(data.unlocked);

      if (data.authErrorReason === "EMAIL_FORBIDDEN" || data.authErrorReason === "INVALID_TOKEN") {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        state.accessToken = "";
        if (els.passcodeFeedback) {
          els.passcodeFeedback.textContent =
            data.authErrorReason === "EMAIL_FORBIDDEN"
              ? "Akses ditolak. Email tersebut bukan pengelola arsip."
              : "Sesi masuk berakhir. Silakan verifikasi ulang.";
        }
      }

      const items = Array.isArray(data.items) ? data.items : [];
      state.quoteOverrides = new Map();
      const photos = [];
      items.forEach((row) => {
        if (row.album === "RPL3:Quote" && row.location) {
          state.quoteOverrides.set(row.location, String(row.caption || "").trim());
        } else {
          photos.push(row);
        }
      });
      state.livePhotos = photos;
    } catch {
      // Tetap tampilkan foto statis saat offline
    } finally {
      syncOwnerUi();
      renderChapters();
      renderStudents();
      populateQuoteSelect();
      if (state.pendingAutoOpenUpload) {
        state.pendingAutoOpenUpload = false;
        openAdminModal("upload");
      }
    }
  }

  async function deleteLiveMemory(id) {
    if (!window.confirm("Hapus foto tambahan ini dari arsip XII RPL-3?")) return;
    const res = await fetch(`/api/memories?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: apiHeaders(),
    });
    if (res.ok) await fetchRpl3Archive();
  }

  function openAdminModal(tab = "upload", studentSlug = "") {
    syncOwnerUi();
    switchAdminTab(tab);
    if (studentSlug) populateQuoteSelect(studentSlug);
    els.uploadModal.hidden = false;
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
  }

  function closeAdminModal() {
    els.uploadModal.hidden = true;
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
  }

  function switchAdminTab(tab) {
    const isQuote = tab === "quote";
    els.adminTabUploadBtn?.classList.toggle("active", !isQuote);
    els.adminTabQuoteBtn?.classList.toggle("active", isQuote);
    if (els.uploadForm) els.uploadForm.hidden = isQuote;
    if (els.quoteForm) els.quoteForm.hidden = !isQuote;
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
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          let dataUrl = canvas.toDataURL("image/webp", quality);
          if (!dataUrl.startsWith("data:image/webp")) {
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }
          resolve({
            name: file.name.replace(/\.[^.]+$/, ""),
            compressedKb: Math.round((dataUrl.length * 0.75) / 1024),
            aspect,
            dataUrl,
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
        // Lewati berkas rusak
      }
    }
    state.queuedFiles = [...state.queuedFiles, ...processed];
    els.uploadStatusNote.textContent = `${state.queuedFiles.length} foto siap disimpan.`;
    renderUploadQueue();
  }

  function renderUploadQueue() {
    if (!els.uploadQueue) return;
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
            <img src="${item.dataUrl}" alt="${item.name.replace(/"/g, "&quot;")}" />
            <div>${item.compressedKb} KB</div>
          </div>
        `
      )
      .join("");
  }

  /* =========================================================
     Event Listeners Umum & Pengelola
     ========================================================= */
  els.studentSearchInput?.addEventListener("input", () => {
    state.studentQuery = els.studentSearchInput.value.trim();
    renderStudents();
  });

  els.lbCloseBtn?.addEventListener("click", closeLightbox);
  els.lightboxModal?.addEventListener("click", (e) => {
    if (e.target === els.lightboxModal) closeLightbox();
  });
  els.lbPrevBtn?.addEventListener("click", () => stepLightbox(-1));
  els.lbNextBtn?.addEventListener("click", () => stepLightbox(1));

  els.statOwnerBadge?.addEventListener("click", () => {
    if (state.unlocked) openAdminModal("upload");
  });
  els.finaleUploadBtn?.addEventListener("click", () => openAdminModal("upload"));
  els.closeUploadBtn?.addEventListener("click", closeAdminModal);
  els.uploadBackdrop?.addEventListener("click", closeAdminModal);
  els.adminTabUploadBtn?.addEventListener("click", () => switchAdminTab("upload"));
  els.adminTabQuoteBtn?.addEventListener("click", () => switchAdminTab("quote"));
  els.quoteStudentSelect?.addEventListener("change", syncQuoteTextareaFromSelection);

  [els.ownerTriggerEyebrow, els.ownerTriggerFooter].forEach((trigger) => {
    if (!trigger) return;
    let taps = 0;
    let timer = null;
    trigger.addEventListener("click", () => {
      taps++;
      clearTimeout(timer);
      if (taps >= 3) {
        taps = 0;
        state.ownerUiRevealed = true;
        syncOwnerUi();
        openAdminModal("upload");
        return;
      }
      timer = setTimeout(() => {
        taps = 0;
      }, 900);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (
      (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "u") ||
      (e.altKey && e.shiftKey && e.key.toLowerCase() === "m")
    ) {
      e.preventDefault();
      state.ownerUiRevealed = true;
      syncOwnerUi();
      openAdminModal("upload");
      return;
    }
    if (!els.lightboxModal.hidden) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    } else if (!els.uploadModal.hidden && e.key === "Escape") {
      closeAdminModal();
    }
  });

  els.sendOtpBtn?.addEventListener("click", async () => {
    const email = els.ownerEmailInput.value.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      els.passcodeFeedback.textContent = "Masukkan alamat email yang valid.";
      return;
    }
    els.sendOtpBtn.disabled = true;
    els.passcodeFeedback.textContent = "Mengirim kode & tautan masuk...";
    try {
      const res = await fetch("/api/memories?action=send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/so-are-we.html`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      els.passcodeFeedback.textContent = res.ok
        ? "Terkirim! Periksa kotak masuk email Anda."
        : data.error || "Gagal mengirim email verifikasi.";
    } catch {
      els.passcodeFeedback.textContent = "Gagal menghubungi server verifikasi.";
    } finally {
      els.sendOtpBtn.disabled = !state.authConfigured;
    }
  });

  els.verifyOtpBtn?.addEventListener("click", async () => {
    const rawValue = els.ownerOtpInput.value.trim();
    if (!rawValue) {
      els.passcodeFeedback.textContent = "Masukkan kode OTP atau tempel URL #access_token=...";
      return;
    }
    const tokenMatch = rawValue.match(/access_token=([^&\s]+)/);
    if (tokenMatch) {
      state.accessToken = decodeURIComponent(tokenMatch[1]);
      sessionStorage.setItem(TOKEN_STORAGE_KEY, state.accessToken);
      await fetchRpl3Archive();
      return;
    }
    const email = els.ownerEmailInput.value.trim().toLowerCase();
    els.verifyOtpBtn.disabled = true;
    els.passcodeFeedback.textContent = "Memverifikasi kode...";
    try {
      const res = await fetch("/api/memories?action=verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: rawValue }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.access_token) {
        state.accessToken = data.access_token;
        sessionStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
        els.ownerOtpInput.value = "";
        els.passcodeFeedback.textContent = "";
        await fetchRpl3Archive();
      } else {
        els.passcodeFeedback.textContent = data.error || "Kode OTP tidak valid.";
      }
    } finally {
      els.verifyOtpBtn.disabled = !state.authConfigured;
    }
  });

  els.passwordLoginBtn?.addEventListener("click", async () => {
    const email = els.ownerEmailInput.value.trim().toLowerCase();
    const password = els.ownerPasswordInput?.value || "";
    if (!email || !password) {
      els.passcodeFeedback.textContent = "Lengkapi email dan kata sandi terlebih dahulu.";
      return;
    }
    els.passwordLoginBtn.disabled = true;
    els.passcodeFeedback.textContent = "Memeriksa kredensial...";
    try {
      const res = await fetch("/api/memories?action=password-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.access_token) {
        state.accessToken = data.access_token;
        sessionStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
        els.ownerPasswordInput.value = "";
        els.passcodeFeedback.textContent = "";
        await fetchRpl3Archive();
      } else {
        els.passcodeFeedback.textContent = data.error || "Email atau kata sandi salah.";
      }
    } finally {
      els.passwordLoginBtn.disabled = !state.authConfigured;
    }
  });

  els.logoutOwnerBtn?.addEventListener("click", () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    state.accessToken = "";
    state.unlocked = false;
    state.verifiedEmail = "";
    closeAdminModal();
    syncOwnerUi();
    renderChapters();
    renderStudents();
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
    if (!state.unlocked) return;
    const imageUrl = els.memImageUrlInput?.value.trim() || "";
    if (state.queuedFiles.length === 0 && !/^https:\/\//i.test(imageUrl)) {
      els.uploadStatusNote.textContent = "Pilih foto atau tempel tautan HTTPS yang valid.";
      return;
    }

    els.submitUploadBtn.disabled = true;
    const baseTitle = els.memTitleInput.value.trim();
    const album = els.memAlbumSelect.value || "RPL3:Kenangan";
    const takenDate = els.memDateInput.value.trim();
    const location = els.memLocationInput.value.trim();
    const caption = els.memCaptionInput.value.trim();

    try {
      if (state.queuedFiles.length === 0) {
        const res = await fetch("/api/memories", {
          method: "POST",
          headers: apiHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            title: baseTitle || "Kenangan XII RPL-3",
            caption,
            album,
            taken_date: takenDate,
            location,
            aspect_hint: "auto",
            is_private: false,
            image_data: imageUrl,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          els.memImageUrlInput.value = "";
          els.memTitleInput.value = "";
          els.memCaptionInput.value = "";
          els.uploadStatusNote.textContent = "Tautan foto disimpan ke arsip XII RPL-3.";
          await fetchRpl3Archive();
        } else {
          els.uploadStatusNote.textContent = data.error || `Gagal menyimpan (${res.status})`;
        }
        return;
      }

      let okCount = 0;
      const failed = [];
      for (let i = 0; i < state.queuedFiles.length; i++) {
        const f = state.queuedFiles[i];
        els.uploadStatusNote.textContent = `Mengunggah ${i + 1} dari ${state.queuedFiles.length}...`;
        const title =
          baseTitle && state.queuedFiles.length > 1 ? `${baseTitle} (${i + 1})` : baseTitle || f.name;
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
            is_private: false,
            image_data: f.dataUrl,
          }),
        });
        if (res.ok) okCount++;
        else failed.push(f);
      }

      state.queuedFiles = failed;
      renderUploadQueue();
      els.uploadStatusNote.textContent =
        failed.length === 0
          ? `${okCount} foto berhasil disimpan ke arsip XII RPL-3.`
          : `${okCount} berhasil, ${failed.length} gagal.`;
      if (okCount > 0) await fetchRpl3Archive();
    } finally {
      els.submitUploadBtn.disabled = false;
    }
  });

  els.quoteForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!state.unlocked) return;
    const slug = els.quoteStudentSelect.value;
    const student = DATA.students.find((s) => s.slug === slug);
    if (!student) return;
    const quote = els.quoteTextInput.value.trim();

    els.saveQuoteBtn.disabled = true;
    els.quoteStatusNote.textContent = "Menyimpan kata-kata ke Supabase...";
    try {
      const res = await fetch("/api/memories?action=upsert-rpl3-quote", {
        method: "POST",
        headers: apiHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          slug: student.slug,
          studentName: student.name,
          quote,
          imagePath: student.photo,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        els.quoteStatusNote.textContent = `Kata-kata ${student.name} berhasil disimpan.`;
        await fetchRpl3Archive();
      } else {
        els.quoteStatusNote.textContent = data.error || "Gagal menyimpan kata-kata.";
      }
    } catch {
      els.quoteStatusNote.textContent = "Koneksi terputus saat menyimpan.";
    } finally {
      els.saveQuoteBtn.disabled = false;
    }
  });

  [els.chaptersContainer, els.studentsRosterGrid, els.lightboxModal, els.montageStage].forEach((container) => {
    container?.addEventListener("contextmenu", (e) => e.preventDefault());
    container?.addEventListener("dragstart", (e) => e.preventDefault());
  });

  renderFilterPills();
  renderMontageAt(0);
  renderChapters();
  renderStudents();
  populateQuoteSelect();
  fetchRpl3Archive();
})();
