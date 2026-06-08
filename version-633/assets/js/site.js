(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, position) {
            slide.classList.toggle("active", position === current);
        });

        dots.forEach(function (dot, position) {
            var active = position === current;
            dot.classList.toggle("active", active);
            dot.setAttribute("aria-pressed", String(active));
        });
    }

    function restartTimer() {
        if (timer) {
            window.clearInterval(timer);
        }

        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    if (slides.length) {
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide-to")) || 0);
                restartTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restartTimer();
            });
        }

        showSlide(0);
        restartTimer();
    }

    Array.prototype.slice.call(document.querySelectorAll(".local-filter")).forEach(function (input) {
        var list = document.getElementById(input.getAttribute("data-filter-list"));
        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-filter-text]"));
        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
                card.hidden = query !== "" && text.indexOf(query) === -1;
            });
        });
    });

    var searchResults = document.getElementById("search-results");
    var searchInput = document.getElementById("search-page-input");
    var emptyState = document.getElementById("search-empty");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-search-filter]"));
    var activeFilter = "";

    function cardHtml(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return [
            "<article class=\"movie-card\">",
            "<a class=\"poster-link\" href=\"" + escapeAttr(movie.url) + "\" aria-label=\"" + escapeAttr(movie.title) + " 在线观看\">",
            "<img src=\"" + escapeAttr(movie.image) + "\" alt=\"" + escapeAttr(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"poster-shade\"></span>",
            "<span class=\"play-chip\">播放</span>",
            "</a>",
            "<div class=\"movie-info\">",
            "<h3><a href=\"" + escapeAttr(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
            "<p class=\"movie-meta\">" + escapeHtml(movie.year + " · " + movie.region + " · " + movie.type) + "</p>",
            "<p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p>",
            "<div class=\"tag-row\">" + tags + "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;"
            }[char];
        });
    }

    function escapeAttr(value) {
        return escapeHtml(value).replace(/"/g, "&quot;");
    }

    function renderSearch() {
        if (!searchResults || !Array.isArray(window.SEARCH_MOVIES)) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = (searchInput && searchInput.value ? searchInput.value : params.get("q") || "").trim();
        var normalized = query.toLowerCase();

        if (searchInput && searchInput.value !== query) {
            searchInput.value = query;
        }

        filterButtons.forEach(function (button) {
            button.classList.toggle("active", button.getAttribute("data-search-filter") === activeFilter);
        });

        var results = window.SEARCH_MOVIES.filter(function (movie) {
            var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.oneLine].concat(movie.tags).join(" ").toLowerCase();
            var matchedQuery = normalized === "" || text.indexOf(normalized) !== -1;
            var matchedFilter = activeFilter === "" || text.indexOf(activeFilter.toLowerCase()) !== -1;
            return matchedQuery && matchedFilter;
        }).slice(0, 120);

        searchResults.innerHTML = results.map(cardHtml).join("");

        if (emptyState) {
            emptyState.hidden = results.length !== 0;
        }
    }

    if (searchResults) {
        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-search-filter") || "";
                renderSearch();
            });
        });

        if (searchInput) {
            searchInput.addEventListener("input", renderSearch);
        }

        renderSearch();
    }
})();
