(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setupHero() {
    var slides = selectAll(".hero-slide");
    var dots = selectAll(".hero-dot");
    if (!slides.length || !dots.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-target") || 0));
        start();
      });
    });

    var carousel = document.querySelector(".hero-carousel");
    if (carousel) {
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
    }
    start();
  }

  function setupCatalogFilters() {
    var input = document.querySelector(".catalog-search");
    var filters = selectAll(".catalog-filter");
    var cards = selectAll(".catalog-grid .movie-card");
    if (!cards.length) {
      return;
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var values = {};
      filters.forEach(function (filter) {
        values[filter.getAttribute("data-filter")] = normalize(filter.value);
      });
      cards.forEach(function (card) {
        var keywords = normalize(card.getAttribute("data-keywords"));
        var year = normalize(card.getAttribute("data-year"));
        var type = normalize(card.getAttribute("data-type"));
        var matchesQuery = !query || keywords.indexOf(query) !== -1;
        var matchesYear = !values.year || year === values.year;
        var matchesType = !values.type || type === values.type;
        card.hidden = !(matchesQuery && matchesYear && matchesType);
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    filters.forEach(function (filter) {
      filter.addEventListener("change", apply);
    });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[character];
    });
  }

  function renderSearchCard(item) {
    return [
      '<article class="movie-card">',
      '<a href="' + escapeHtml(item.url) + '">',
      '<div class="poster-wrap">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="duration-badge">' + escapeHtml(item.duration) + '</span>',
      '<span class="hover-play">▶</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<span class="category-chip">' + escapeHtml(item.category) + '</span>',
      '<h3>' + escapeHtml(item.title) + '</h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="meta-row"><span>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join("");
  }

  function setupSearchPage() {
    var results = document.getElementById("searchResults");
    if (!results || !Array.isArray(window.movieSearchItems)) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var input = document.getElementById("searchPageInput");
    var category = document.getElementById("searchCategory");
    var type = document.getElementById("searchType");
    var initialQuery = params.get("q") || "";

    if (input) {
      input.value = initialQuery;
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var categoryValue = normalize(category ? category.value : "");
      var typeValue = normalize(type ? type.value : "");
      var output = window.movieSearchItems.filter(function (item) {
        var keywords = normalize([item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine, item.category].join(" "));
        var matchesQuery = !query || keywords.indexOf(query) !== -1;
        var matchesCategory = !categoryValue || normalize(item.category) === categoryValue;
        var matchesType = !typeValue || normalize(item.type).indexOf(typeValue) !== -1;
        return matchesQuery && matchesCategory && matchesType;
      }).slice(0, 180);
      if (!output.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配内容，请尝试更换关键词。</div>';
        return;
      }
      results.innerHTML = output.map(renderSearchCard).join("");
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (category) {
      category.addEventListener("change", apply);
    }
    if (type) {
      type.addEventListener("change", apply);
    }
    apply();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupCatalogFilters();
    setupSearchPage();
  });
})();
