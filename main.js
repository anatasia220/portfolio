/* main.js */
document.addEventListener("DOMContentLoaded", function () {
  /* Header scroll */
  const header = document.querySelector("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  });

  /* Hero arrow */
  const arrow = document.querySelector(".arrow");
  if (arrow) arrow.addEventListener("click", () => document.querySelector("#about").scrollIntoView({ behavior: "smooth" }));

  /* Fade-up */
  const fadeUps = document.querySelectorAll(".fade-up");
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
  }, { threshold: 0.18 });
  fadeUps.forEach(el => fadeObserver.observe(el));

  /* Portfolio slider */
  const slider = document.querySelector(".portfolio-slider");
  const items = Array.from(document.querySelectorAll(".portfolio-item"));
  let idx = 0, autoSlide;
  function updateSlider() {
    if (!items.length || !slider) return;
    const w = Math.round(items[0].getBoundingClientRect().width);
    slider.style.transform = `translateX(${-idx * w}px)`;
  }
  function startAuto() { stopAuto(); autoSlide = setInterval(() => { idx = (idx + 1) % items.length; updateSlider(); }, 4000); }
  function stopAuto() { if (autoSlide) clearInterval(autoSlide); }
  window.addEventListener("resize", updateSlider);
  const prevBtn = document.querySelector(".portfolio-btn.prev");
  const nextBtn = document.querySelector(".portfolio-btn.next");
  if (prevBtn) prevBtn.addEventListener("click", () => { idx = idx === 0 ? items.length - 1 : idx - 1; updateSlider(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { idx = (idx + 1) % items.length; updateSlider(); startAuto(); });
  if (slider) { slider.addEventListener("mouseenter", stopAuto); slider.addEventListener("mouseleave", startAuto); }
  updateSlider(); startAuto();

  /* Lightbox */
  const lightbox = document.getElementById("lightbox");
  const lbImg = lightbox.querySelector("img");
  items.forEach(item => {
    const imgEl = item.querySelector("img");
    if (!imgEl) return;
    imgEl.addEventListener("click", (e) => {
      e.stopPropagation();
      lbImg.src = imgEl.src;
      lightbox.classList.add("active");
      lightbox.setAttribute("aria-hidden", "false");
    });
  });
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target === lbImg) {
      lightbox.classList.remove("active");
      lightbox.setAttribute("aria-hidden", "true");
      lbImg.src = "";
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { lightbox.classList.remove("active"); lbImg.src=""; } });

  /* Contact form */
  const form = document.getElementById("contact-form");
  const successMsg = document.getElementById("success-message");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      successMsg.classList.add("show");
      setTimeout(() => successMsg.classList.remove("show"), 3000);
      form.reset();
    });
  }

  /* PDF -> canvas -> turn.js */
  
  const pdfItems = document.querySelectorAll(".pdf-item");
  const flipViewer = document.getElementById("pdf-flipbook-viewer");
  let flipbookContainer = document.getElementById("pdf-flipbook");
  const closeBtn = document.querySelector(".close-flipbook");

  // destroy and recreate flipbook container
  function destroyFlipbook() {
    try {
      if ($(flipbookContainer).data && $(flipbookContainer).data("turn")) {
        $(flipbookContainer).turn("destroy");
      }
    } catch (e) {}
    const parent = flipbookContainer.parentElement;
    if (parent) {
      parent.removeChild(flipbookContainer);
      const newDiv = document.createElement("div");
      newDiv.id = "pdf-flipbook";
      newDiv.className = "flipbook";
      parent.appendChild(newDiv);
      flipbookContainer = newDiv;
    }
  }

  // render pdf pages to canvas and init turn.js
  async function renderPdfToCanvasAndInitTurn(pdfUrl) {
    if (!window['pdfjsLib']) {
      fpdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.min.js';
      return;
    }
    flipbookContainer.innerHTML = '<div class="loading">載入中…</div>';
    try {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      flipbookContainer.innerHTML = '';
      for (let p = 1; p <= numPages; p++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page';
        const canvas = document.createElement('canvas');
        canvas.setAttribute('data-page', p);
        pageDiv.appendChild(canvas);
        flipbookContainer.appendChild(pageDiv);
      }

      // render sequentially (keeping UI responsive)
      for (let p = 1; p <= numPages; p++) {
        const page = await pdf.getPage(p);
        const viewportBase = page.getViewport({ scale: 2 });
        const maxWidth = Math.min(window.innerWidth * 0.9, 1000);
        const scale = Math.min(2, maxWidth / viewportBase.width);
        const scaledViewport = page.getViewport({ scale });
        const canvas = flipbookContainer.querySelector('canvas[data-page="' + p + '"]');
        const ctx = canvas.getContext('2d');
        canvas.width = Math.floor(scaledViewport.width);
        canvas.height = Math.floor(scaledViewport.height);
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
        await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
      }

      // ensure even pages for turn.js: if odd, append blank page
      const pagesNow = flipbookContainer.querySelectorAll('.page').length;
      if (pagesNow % 2 !== 0) {
        const blank = document.createElement('div');
        blank.className = 'page';
        blank.innerHTML = '<div style="width:100%;height:100%;"></div>';
        flipbookContainer.appendChild(blank);
      }

      // init turn.js
      setTimeout(() => {
        try {
          const $fb = $(flipbookContainer);
          $fb.turn({
            width: Math.min(window.innerWidth * 0.9, 1000),
            height: Math.min(window.innerHeight * 0.75, 640),
            autoCenter: true,
            gradients: true,
            acceleration: true,
            duration: 600
          });
          // remove loading overlays
          flipbookContainer.querySelectorAll('.loading').forEach(el => el.remove());
        } catch (err) {
          flipbookContainer.innerHTML = '<div class="loading">翻頁初始化失敗，請使用桌機瀏覽器或重新整理。</div>';
          console.error('turn init error', err);
        }
      }, 80);

    } catch (err) {
      console.error('PDF load error', err);
      flipbookContainer.innerHTML = '<div class="loading">無法載入 PDF，請確認檔案已上傳至 /PDF/ 並且伺服器允許存取。</div>';
    }
  }

  // helper: try two paths (without ext and with .pdf)
  async function tryLoadPdf(baseName) {
    const tryPaths = [
      `/PDF/${baseName}`,
      `/PDF/${baseName}.pdf`,
      `PDF/${baseName}`,
      `PDF/${baseName}.pdf`,
      `./PDF/${baseName}`,
      `./PDF/${baseName}.pdf`
    ];
    for (const p of tryPaths) {
      try {
        // attempt to load via pdf.js; if it errors will be caught
        await renderPdfToCanvasAndInitTurn(p);
        return;
      } catch (e) {
        // swallow and try next
        console.warn('tryLoadPdf failed for', p, e);
      }
    }
    // final fallback message
    flipbookContainer.innerHTML = '<div class="loading">嘗試過多個路徑仍無法載入 PDF，請確認 /PDF/ 裡有檔案並能被瀏覽器讀取。</div>';
  }

  // click handlers for pdf items
  pdfItems.forEach(item => {
    const open = async () => {
      const book = item.dataset.book;
      if (!book) return alert('找不到作品識別名稱');
      destroyFlipbook();
      flipViewer.classList.add('active');
      flipViewer.setAttribute('aria-hidden', 'false');
      // Wait a tick to allow container to appear
      await new Promise(r => setTimeout(r, 30));
      await tryLoadPdf(book);
    };
    item.addEventListener('click', open);
    item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') open(); });
  });

  // close viewer
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      try { if ($(flipbookContainer).data && $(flipbookContainer).data('turn')) $(flipbookContainer).turn('destroy'); } catch(e) {}
      flipViewer.classList.remove('active');
      flipViewer.setAttribute('aria-hidden', 'true');
      flipbookContainer.innerHTML = '';
    });
  }

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (flipViewer.classList.contains('active')) {
        if (closeBtn) closeBtn.click();
      }
    }
  });

  // resize: update turn.js size
  window.addEventListener('resize', () => {
    try {
      if ($(flipbookContainer).data && $(flipbookContainer).data('turn')) {
        $(flipbookContainer).turn('size', Math.min(window.innerWidth * 0.9, 1000), Math.min(window.innerHeight * 0.75, 640));
      }
    } catch (e) {}
    updateSlider();
  });
});
