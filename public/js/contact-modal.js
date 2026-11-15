(() => {
  const modal = document.getElementById("contactModal");
  const openBtn = document.getElementById("openContactBtn");
  const mobileBtn = document.getElementById("mobileContactBtn");
  const closeBtn = document.getElementById("closeContactBtn");
  const copyBtn = document.getElementById("modalCopyEmailBtn");
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("contactStatus");
  const submitBtn = document.getElementById("contactSubmitBtn");

  if (!modal) return;

  function openContactModal() {
    modal.removeAttribute("hidden");
    document.body.classList.add("modal-open");
    const mobileMenu = document.getElementById("mobileMenu");
    const menuToggle = document.getElementById("menuToggle");
    if (mobileMenu) mobileMenu.setAttribute("hidden", "");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }

  function closeContactModal() {
    modal.setAttribute("hidden", "");
    document.body.classList.remove("modal-open");
  }

  openBtn?.addEventListener("click", openContactModal);
  mobileBtn?.addEventListener("click", openContactModal);
  closeBtn?.addEventListener("click", closeContactModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeContactModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hasAttribute("hidden")) {
      closeContactModal();
    }
  });

  copyBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("usvanndrenur@gmail.com");
      copyBtn.textContent = "Tersalin";
      setTimeout(() => {
        copyBtn.textContent = "Salin";
      }, 2000);
    } catch {
      copyBtn.textContent = "usvanndrenur@gmail.com";
    }
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitBtn) submitBtn.disabled = true;
    if (statusEl) statusEl.textContent = "Mengirim pesan...";

    const payload = {
      senderName: document.getElementById("senderName")?.value.trim() || "",
      senderEmail: document.getElementById("senderEmail")?.value.trim() || "",
      subject: document.getElementById("senderSubject")?.value.trim() || "",
      message: document.getElementById("senderMessage")?.value.trim() || ""
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim pesan");
      if (statusEl) statusEl.textContent = "Pesan terkirim dan tersimpan. Terima kasih.";
      form.reset();
    } catch (err) {
      if (statusEl) {
        statusEl.textContent =
          err.message || "Belum dapat mengirim lewat server. Silakan kirim ke usvanndrenur@gmail.com.";
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
