(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.textContent = nav.classList.contains('open') ? '×' : '☰';
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFiltering() {
    var cards = qsa('[data-card]');
    var input = qs('[data-search-input]');
    var category = qs('[data-filter-category]');
    var sortSelect = qs('[data-sort-select]');
    var grid = qs('[data-card-grid]');
    if (!cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input && initial) {
      input.value = initial;
    }

    function filter() {
      var term = input ? input.value.trim().toLowerCase() : '';
      var selectedCategory = category ? category.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-text') || '').toLowerCase();
        var matchesText = !term || text.indexOf(term) !== -1;
        var matchesCategory = !selectedCategory || text.indexOf(selectedCategory) !== -1;
        card.classList.toggle('is-hidden', !(matchesText && matchesCategory));
      });
    }

    function sortCards() {
      if (!sortSelect || !grid) {
        return;
      }
      var mode = sortSelect.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === 'rating') {
          return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
        }
        if (mode === 'views') {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        }
        if (mode === 'year') {
          return String(b.dataset.year || '').localeCompare(String(a.dataset.year || ''), 'zh-CN');
        }
        if (mode === 'title') {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-CN');
        }
        return 0;
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      filter();
    }

    if (input) {
      input.addEventListener('input', filter);
    }
    if (category) {
      category.addEventListener('change', filter);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
    }
    filter();
  }

  function initPlayers() {
    qsa('.movie-player').forEach(function (box) {
      var video = qs('video', box);
      var overlay = qs('.play-overlay', box);
      var src = box.getAttribute('data-src');
      if (!video || !src) {
        return;
      }

      function attachSource() {
        if (box.dataset.loaded === '1') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          box.hlsInstance = hls;
        } else {
          video.src = src;
        }
        box.dataset.loaded = '1';
      }

      function play() {
        attachSource();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      var playLinks = qsa('[data-detail-play]');
      playLinks.forEach(function (link) {
        link.addEventListener('click', function (event) {
          event.preventDefault();
          box.scrollIntoView({ behavior: 'smooth', block: 'center' });
          play();
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFiltering();
    initPlayers();
  });
})();
