(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var index = 0;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, currentIndex) {
          var active = currentIndex === index;
          slide.classList.toggle("is-active", active);
          slide.setAttribute("aria-hidden", active ? "false" : "true");
        });

        dots.forEach(function (dot, currentIndex) {
          dot.classList.toggle("is-active", currentIndex === index);
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
      });

      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));

    filterForms.forEach(function (form) {
      var list = document.querySelector("[data-filter-list]");
      var input = form.querySelector("[data-filter-input]");
      var category = form.querySelector("[data-filter-category]");
      var year = form.querySelector("[data-filter-year]");

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card-wrapper"));

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var selectedCategory = category ? category.value : "";
        var selectedYear = year ? year.value : "";

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();
          var categoryMatch = !selectedCategory || card.getAttribute("data-category") === selectedCategory;
          var yearMatch = !selectedYear || card.getAttribute("data-year") === selectedYear;
          var textMatch = !query || text.indexOf(query) !== -1;

          card.classList.toggle("is-hidden", !(categoryMatch && yearMatch && textMatch));
        });
      }

      [input, category, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
    });
  });
})();
