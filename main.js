// =============================
// main.js
// =============================

(function () {
  // ----------------- Header scroll & fade-in -----------------
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

  // ----------------- Portfolio slider + Lightbox -----------------
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

  // ----------------- Contact Form -----------------
  const $form = $('#contact-form');
  const $msg = $('#success-message');

  $form.on('submit', function (e) {
    e.preventDefault();
    $msg.addClass('show');
    setTimeout(() => $msg.removeClass('show'), 3000);
    this.reset();
  });

  // ----------------- PDF Flipbook (新增/修改) -----------------
  const releaseBase = "https://github.com/anatasia220/portfolio/releases/download/v1.0/";

  function showError(msg) {
    console.error(msg);
    $('#pdf-flipbook').html(`<div style="color:red;">❌ ${msg}</div>`);
  }

  function resetFlipbook() {
    try { $('#pdf-flipbook').turn('destroy'); } catch(e){}
    $('#pdf-flipbook').empty().append('<div>載入中…</div>');
  }

  async function loadPDF(url) {
    try {
      return await pdfjsLib.getDocument(url).promise;
    } catch(err) {
      showError("PDF 無法載入");
      return null;
    }
  }

  async function renderPages(pdf) {
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const scale = Math.min(1.2, window.innerWidth / 1000);
const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      pages.push(canvas);
    }
    return pages;
  }

  async function openPDF(name) {
    resetFlipbook();
    $('#pdf-flipbook-viewer').removeClass('hidden');

    const url = `${releaseBase}portfolio_${name}.pdf`;
    const pdf = await loadPDF(url);
    if (!pdf) return;

    const pages = await renderPages(pdf);
    $('#pdf-flipbook').empty();
    pages.forEach(cv => {
      const $p = $('<div class="page"></div>').append(cv);
      $('#pdf-flipbook').append($p);
    });

    $('#pdf-flipbook').turn({
      width: Math.min(1000, $(window).width()*0.8),
      height: Math.min(700, $(window).height()*0.8),
      autoCenter: true,
      display: 'double'
    });
  }

  // 綁定 PDF 封面點擊 (新增 data-book 屬性)
  $('.pdf-item').on('click', function(){
    const book = $(this).data('book'); // 取得 A~N
    if (!book) return;
    openPDF(book);
  });

  $('.close-flipbook').on('click', function(){
    resetFlipbook();
    $('#pdf-flipbook-viewer').addClass('hidden');
  });

})();
