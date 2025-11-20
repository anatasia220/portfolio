(function () {
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
      const viewport = page.getViewport({ scale: 1.2 });
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

  // 綁定 PDF 封面點擊
  $('.pdf-item').on('click', function(){
    const book = $(this).data('book');
    if (!book) return;
    openPDF(book);
  });

  $('.close-flipbook').on('click', function(){
    resetFlipbook();
    $('#pdf-flipbook-viewer').addClass('hidden');
  });
})();
