// =============================
// main.js (精簡版)
// Portfolio Slider + Lightbox + Contact Form
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
