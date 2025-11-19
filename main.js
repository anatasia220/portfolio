// =============================
// main.js (強化版 + PDF/Turn.js 健壯處理)
// =============================

// ----------------- Header scroll & fade-in -----------------
(function () {
  const $header = $('header');
  function onScroll() {
    if (window.scrollY > 60) $header.addClass('scrolled');
    else $header.removeClass('scrolled');

    document.querySelectorAll('.fade-up').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight - 120) el.classList.add('visible');
    });
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  $('.arrow').on('click', () =>
    $('html,body').animate({ scrollTop: $('#about').offset().top }, 600)
  );
})();


// ----------------- Portfolio slider + Lightbox -----------------
(function () {
  const $slider = $('.portfolio-slider');
  const $items = $slider.children('.portfolio-item');
  const $next = $('.portfolio-btn.next');
  const $prev = $('.portfolio-btn.prev');
  let index = 0;
  let auto = null;

  function updateSlide() {
    const w = $items.eq(0).outerWidth(true);
    $slider.css('transform', `translateX(-${index * w}px)`);
  }

  function next() {
    index = (index + 1) % $items.length;
    updateSlide();
  }

  function prev() {
    index = (index - 1 + $items.length) % $items.length;
    updateSlide();
  }

  $next.on('click', () => { next(); resetAuto(); });
  $prev.on('click', () => { prev(); resetAuto(); });

  function startAuto() { auto = setInterval(next, 3500); }
  function stopAuto() { clearInterval(auto); }
  function resetAuto() { stopAuto(); startAuto(); }

  $slider.on('mouseenter', stopAuto).on('mouseleave', startAuto);
  $(window).on('resize', updateSlide);

  updateSlide();
  startAuto();

  // Lightbox
  $('.portfolio-item img').on('click', function () {
    $('#lightbox img').attr('src', $(this).attr('src'));
    $('#lightbox').addClass('active').attr('aria-hidden', 'false');
  });

  $('#lightbox').on('click', function (e) {
    if (e.target !== this && e.target.tagName === 'IMG') return;
    $(this).removeClass('active').attr('aria-hidden', 'true');
    $('#lightbox img').attr('src', '');
  });
})();


// ----------------- Contact Form -----------------
(function () {
  const $form = $('#contact-form');
  const $msg = $('#success-message');
  $form.on('submit', function (e) {
    e.preventDefault();
    $msg.addClass('show');
    setTimeout(() => $msg.removeClass('show'), 3000);
    this.reset();
  });
})();


// =====================================================
// PDF.js + Turn.js —— 超強健版（含錯誤處理提示）
// =====================================================
(function () {

  // Debug 訊息（在畫面上顯示錯誤）
  function showError(msg) {
    console.error(msg);
    $('#pdf-flipbook').html(
      `<div class="loading" style="color:#d33;">❌ ${msg}</div>`
    );
  }

  // turn.js 防呆
  function safeDestroyTurn() {
    try { $('#pdf-flipbook').turn('destroy'); } catch (e) {}
  }

  // Reset flipbook UI
  function resetFlipbook() {
    safeDestroyTurn();
    $('#pdf-flipbook')
      .empty()
      .append('<div class="loading">載入中…</div>');
  }

  // PDF loader
  async function loadPDF(pdfPath) {
    try {
      return await pdfjsLib.getDocument(pdfPath).promise;
    } catch (err) {
      showError(`PDF 無法載入（可能找不到檔案或 CORS 限制）：${pdfPath}`);
      return null;
    }
  }

  // Render 每一頁
  async function renderPages(pdf) {
    const pages = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.3 });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;
        pages.push(canvas);

      } catch (err) {
        console.error(`第 ${i} 頁載入錯誤：`, err);
      }
    }

    return pages;
  }

  // 開啟 PDF 書本
  async function openPDF(bookName) {
    const pdfPath = `./PDF/${bookName}.pdf`;  // ⭐路徑確定指向 /PDF

    resetFlipbook();
    $('#pdf-flipbook-viewer').addClass('active').attr('aria-hidden', 'false');

    const pdf = await loadPDF(pdfPath);
    if (!pdf) return;

    const pages = await renderPages(pdf);
    $('#pdf-flipbook').empty();

    if (!pages.length) {
      showError("PDF 頁面載入失敗（可能是檔案損毀或空白）");
      return;
    }

    pages.forEach(cv => {
      const $page = $('<div class="page"></div>');
      $page.append(cv);
      $('#pdf-flipbook').append($page);
    });

    // turn.js 初始化
    try {
      $('#pdf-flipbook').turn({
        width: Math.min(1000, $(window).width() * 0.8),
        height: Math.min(700, $(window).height() * 0.8),
        autoCenter: true,
        display: 'double',
        duration: 800,
        gradients: true,
      });
    } catch (err) {
      showError("Turn.js 初始化失敗（可能 turn.min.js 未成功載入）");
      return;
    }
  }

  // 綁定 PDF 項目點擊
  $('.pdf-item').on('click', function () {
    const name = $(this).data('book');
    if (!name) return;
    openPDF(name);

    $('html,body').animate(
      { scrollTop: $('#pdf-flipbook-section').offset().top },
      500
    );
  });

  // 關閉 flipbook
  $('.close-flipbook').on('click', function () {
    resetFlipbook();
    $('#pdf-flipbook-viewer').removeClass('active');
  });

})();
