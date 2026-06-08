(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-missing");
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
        });
      });

      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get("q"));
    var searchInput = document.querySelector("[data-search-input]");
    var searchPage = document.querySelector("[data-search-page]");

    if (searchInput && query) {
      searchInput.value = params.get("q") || "";
    }

    if (searchPage) {
      var cards = Array.prototype.slice.call(searchPage.querySelectorAll("[data-card]"));
      var resultText = searchPage.querySelector("[data-result-text]");

      function filterCards(value) {
        var term = normalize(value);
        var visible = 0;

        cards.forEach(function (card) {
          var matched = !term || normalize(card.getAttribute("data-search")).indexOf(term) !== -1;
          card.classList.toggle("is-hidden-card", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (resultText) {
          resultText.textContent = term ? "已筛选出 " + visible + " 部相关影片。" : "输入关键词后浏览相关影片。";
        }
      }

      filterCards(query);

      if (searchInput) {
        searchInput.addEventListener("input", function () {
          filterCards(searchInput.value);
        });
      }
    }

    var pageFilter = document.querySelector("[data-page-filter]");
    var filterList = document.querySelector("[data-filter-list]");

    if (pageFilter && filterList) {
      var filterCardsList = Array.prototype.slice.call(filterList.querySelectorAll("[data-card]"));
      pageFilter.addEventListener("input", function () {
        var term = normalize(pageFilter.value);
        filterCardsList.forEach(function (card) {
          var matched = !term || normalize(card.getAttribute("data-search")).indexOf(term) !== -1;
          card.classList.toggle("is-hidden-card", !matched);
        });
      });
    }
  });
})();
