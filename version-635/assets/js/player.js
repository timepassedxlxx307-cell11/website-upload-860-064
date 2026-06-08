function initializeMoviePlayer(videoUrl) {
  var box = document.querySelector("[data-player]");
  var video = document.querySelector("[data-video]");
  var button = document.querySelector("[data-play-button]");
  var overlay = document.querySelector("[data-player-overlay]");
  var status = document.querySelector("[data-player-status]");
  var loaded = false;
  var hls = null;

  if (!box || !video || !button || !videoUrl) {
    return;
  }

  function setStatus(text) {
    if (status) {
      status.textContent = text;
    }
  }

  function loadSource() {
    if (loaded) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      loaded = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      loaded = true;
      return;
    }

    video.src = videoUrl;
    loaded = true;
  }

  function startPlayback() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    setStatus("正在加载");
    loadSource();

    var playResult = video.play();

    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {
        setStatus("点击画面继续播放");
      });
    }
  }

  button.addEventListener("click", startPlayback);
  overlay.addEventListener("click", startPlayback);
  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });
  video.addEventListener("playing", function () {
    setStatus("");
  });
  video.addEventListener("error", function () {
    setStatus("播放暂时不可用");
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
