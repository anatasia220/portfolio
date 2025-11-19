// PDF.js + Turn.js —— GitHub Releases 版 + 畫面自適應
(function () {
  function showError(msg) {
    console.error(msg);
    $('#pdf-flipbook').html(
      `<div class="loading" style="color:#d33;">❌ ${msg}</div>`
    );
  }

  function safeDestroyTurn() {
    try { $('#pdf-flipbook').turn('destroy'); } catch (e) {}
  }

  function resetFlipbook() {
    safeDestroyTurn();
    $('#pdf-flipbook').empty().append('<div class="loading">載入中…</div>');
  }

  async function loadPDF(pdfPath) {
    try {
      return await pdfjsLib.getDocument(pdfPath).promise;
    } catch (err) {
      showError(`PDF 無法載入：${pdfPath}`);
      return null;
    }
  }

  async function renderPages(pdf) {
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const viewportBase = page.getViewport({ scale: 1 });
        const scale = Math.min(1.5, $(window).width() * 0.4 / viewportBase.width);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport }).promise;
        pages.push(canvas);
      } catch (err) {
        console.error(`第 ${i} 頁載入錯誤：`, err);
      }
    }
    return pages;
  }

  async function openPDF(bookName) {
    const pdfPath = `https://github.com/anatasia220/my-portfolio/releases/download/v1.0/${bookName}.pdf`;

    resetFlipbook();
    $('#pdf-flipbook-viewer').addClass('active').attr('aria-hidden', 'false');

    const pdf = await loadPDF(pdfPath);
    if (!pdf) return;

    const pages = await renderPages(pdf);
    $('#pdf-flipbook').empty();

    if (!pages.length) { showError("PDF 頁面載入失敗"); return; }

    pages.forEach(cv => {
      const $page = $('<div class="page"></div>').append(cv);
      $('#pdf-flipbook').append($page);
    });

    try {
      const maxWidth = $(window).width() * 0.85;
      const maxHeight = $(window).height() * 0.85;

      $('#pdf-flipbook').turn({
        width: maxWidth,
        height: maxHeight,
        autoCenter: true,
        display: 'double',
        duration: 800,
        gradients: true,
      });
    } catch (err) {
      showError("Turn.js 初始化失敗");
    }
  }

  $('.pdf-item').on('click', function () {
    const name = $(this).data('book');
    if (!name) return;
    openPDF(name);
    $('html,body').animate({ scrollTop: $('#pdf-flipbook-section').offset().top }, 500);
  });

  $('.close-flipbook').on('click', function () {
    resetFlipbook();
    $('#pdf-flipbook-viewer').removeClass('active');
  });
})();
