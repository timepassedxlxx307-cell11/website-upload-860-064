(function () {
  function showStatus(status, text) {
    if (!status) {
      return;
    }
    status.textContent = text;
    status.classList.add("is-visible");
  }

  function hideStatus(status) {
    if (!status) {
      return;
    }
    status.classList.remove("is-visible");
  }

  function setupPlayer(shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".play-overlay");
    var status = shell.querySelector(".player-status");
    if (!video || !overlay) {
      return;
    }

    var source = video.getAttribute("data-video-url");
    var hls = null;
    var initialized = false;

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          showStatus(status, "请再次点击播放");
        });
      }
    }

    function attachSource() {
      if (!source) {
        showStatus(status, "视频暂不可用");
        return;
      }
      showStatus(status, "视频加载中");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          hideStatus(status);
          playVideo();
        }, { once: true });
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          hideStatus(status);
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showStatus(status, "播放失败，请稍后重试");
            if (hls) {
              hls.destroy();
              hls = null;
            }
          }
        });
        return;
      }
      showStatus(status, "浏览器无法播放该视频");
    }

    function start() {
      overlay.hidden = true;
      if (!initialized) {
        initialized = true;
        attachSource();
        return;
      }
      playVideo();
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!initialized) {
        start();
      }
    });
    video.addEventListener("playing", function () {
      overlay.hidden = true;
      hideStatus(status);
    });
    video.addEventListener("pause", function () {
      if (initialized && video.currentTime > 0 && !video.ended) {
        overlay.hidden = false;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
  });
})();
