Array.prototype.slice.call(document.querySelectorAll(".stream-player")).forEach(function (video) {
    var source = video.getAttribute("data-stream");
    var overlay = document.querySelector("[data-play-for='" + video.id + "']");
    var prepared = false;
    var hls = null;

    function prepare() {
        if (prepared || !source) {
            return;
        }

        prepared = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function showOverlay(show) {
        if (overlay) {
            overlay.classList.toggle("is-hidden", !show);
        }
    }

    function start() {
        prepare();
        showOverlay(false);
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                showOverlay(true);
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener("play", function () {
        showOverlay(false);
    });

    video.addEventListener("ended", function () {
        showOverlay(true);
    });

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });

    prepare();
});
