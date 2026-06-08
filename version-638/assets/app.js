(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("open");
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");

        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dots] button"));
            var index = 0;

            function show(next) {
                if (!slides.length) {
                    return;
                }

                index = (next + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === index);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                });
            });

            setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function bindFilter(input) {
            var grid = input.closest("section").querySelector("[data-card-grid]") || document.querySelector("[data-card-grid]");

            if (!grid) {
                return;
            }

            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-search]"));

            function applyFilter() {
                var query = normalize(input.value);

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search") + " " + card.textContent);
                    card.hidden = query && haystack.indexOf(query) === -1;
                });
            }

            input.addEventListener("input", applyFilter);
            applyFilter();
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-grid-search]")).forEach(bindFilter);

        var pageSearch = document.querySelector("[data-page-search]");

        if (pageSearch) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            pageSearch.value = query;
            bindFilter(pageSearch);
        }
    });

    window.initMoviePlayer = function (videoId, playId, overlayId, source) {
        var video = document.getElementById(videoId);
        var play = document.getElementById(playId);
        var overlay = document.getElementById(overlayId);
        var initialized = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (initialized) {
                return;
            }

            initialized = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function startPlayback() {
            attachSource();

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            var promise = video.play();

            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }

        if (play) {
            play.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
