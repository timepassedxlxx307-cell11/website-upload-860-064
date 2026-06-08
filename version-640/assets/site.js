(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var expanded = menuButton.getAttribute("aria-expanded") === "true";
            menuButton.setAttribute("aria-expanded", String(!expanded));
            mobilePanel.hidden = expanded;
        });
    }

    var slider = document.getElementById("hero-slider");

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var activeIndex = 0;
        var timer = null;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === activeIndex);
            });
        };

        var startSlider = function () {
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        };

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }

                showSlide(dotIndex);
                startSlider();
            });
        });

        startSlider();
    }

    var grid = document.getElementById("movie-grid");

    if (grid) {
        var searchInput = document.getElementById("grid-search");
        var regionFilter = document.getElementById("region-filter");
        var yearFilter = document.getElementById("year-filter");
        var resetButton = document.getElementById("filter-reset");
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

        var applyFilter = function () {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var region = regionFilter ? regionFilter.value : "";
            var year = yearFilter ? yearFilter.value : "";

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-genre") || "",
                    card.getAttribute("data-type") || ""
                ].join(" ").toLowerCase();

                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchRegion = !region || card.getAttribute("data-region") === region;
                var matchYear = !year || card.getAttribute("data-year") === year;
                card.classList.toggle("is-hidden", !(matchKeyword && matchRegion && matchYear));
            });
        };

        [searchInput, regionFilter, yearFilter].forEach(function (element) {
            if (element) {
                element.addEventListener("input", applyFilter);
                element.addEventListener("change", applyFilter);
            }
        });

        if (resetButton) {
            resetButton.addEventListener("click", function () {
                if (searchInput) {
                    searchInput.value = "";
                }

                if (regionFilter) {
                    regionFilter.value = "";
                }

                if (yearFilter) {
                    yearFilter.value = "";
                }

                applyFilter();
            });
        }
    }

    var resultBox = document.getElementById("search-results");
    var resultTitle = document.getElementById("search-result-title");
    var searchPageInput = document.getElementById("search-page-input");

    if (resultBox && typeof SEARCH_MOVIES !== "undefined") {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();

        if (searchPageInput) {
            searchPageInput.value = query;
        }

        var renderResults = function (items, keyword) {
            resultBox.innerHTML = "";
            resultTitle.textContent = keyword ? "搜索结果：" + keyword : "推荐影片";

            items.slice(0, 120).forEach(function (movie) {
                var article = document.createElement("article");
                article.className = "movie-card";
                article.innerHTML = [
                    "<a class=\"poster-link\" href=\"" + movie.url + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
                    "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
                    "<span class=\"poster-badge\">" + escapeHtml(movie.category) + "</span>",
                    "</a>",
                    "<div class=\"movie-card-body\">",
                    "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
                    "<h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>",
                    "<p>" + escapeHtml(movie.oneLine) + "</p>",
                    "<div class=\"tag-row\"><span>" + escapeHtml(movie.genre) + "</span></div>",
                    "</div>"
                ].join("");
                resultBox.appendChild(article);
            });
        };

        var normalizedQuery = query.toLowerCase();
        var results = SEARCH_MOVIES.filter(function (movie) {
            if (!normalizedQuery) {
                return movie.index <= 48;
            }

            var haystack = [movie.title, movie.region, movie.year, movie.type, movie.genre, movie.category, movie.oneLine].join(" ").toLowerCase();
            return haystack.indexOf(normalizedQuery) !== -1;
        });

        renderResults(results, query);
    }
})();

function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;"
        }[char];
    });
}

function initMoviePlayer(sourceUrl) {
    var video = document.getElementById("movie-player");
    var trigger = document.getElementById("play-trigger");

    if (!video || !sourceUrl) {
        return;
    }

    var prepared = false;
    var hlsInstance = null;

    var prepareVideo = function () {
        if (prepared) {
            return;
        }

        prepared = true;

        if (typeof Hls !== "undefined" && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else {
            video.src = sourceUrl;
        }
    };

    var startPlayback = function () {
        prepareVideo();

        if (trigger) {
            trigger.classList.add("is-hidden");
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                if (trigger) {
                    trigger.classList.remove("is-hidden");
                }
            });
        }
    };

    if (trigger) {
        trigger.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
        if (!prepared || video.paused) {
            startPlayback();
        }
    });

    video.addEventListener("play", function () {
        if (trigger) {
            trigger.classList.add("is-hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
