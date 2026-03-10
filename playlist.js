(function () {
  const player = document.getElementById("player");
  const trackItems = document.querySelectorAll(".track-item");

  if (!player || !trackItems.length) return;

  let currentTrack = null;

  const formatTime = (sec) => {
    if (!isFinite(sec) || sec < 0) return "—:—";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const setPlaying = (el) => {
    trackItems.forEach((item) => item.classList.remove("playing"));
    if (el) el.classList.add("playing");
    currentTrack = el;
  };

  const loadTrack = (src) => {
    player.src = src;
    player.load();
  };

  const playTrack = (item) => {
    const src = item.dataset.src;
    if (!src) return;

    if (currentTrack === item && !player.paused) {
      player.pause();
      setPlaying(null);
      return;
    }

    loadTrack(src);
    player.play().catch((err) => console.warn("播放失败:", err));
    setPlaying(item);
  };

  player.addEventListener("loadedmetadata", () => {
    const dur = player.duration;
    if (currentTrack) {
      const span = currentTrack.querySelector(".track-duration");
      if (span) span.textContent = formatTime(dur);
    }
  });

  player.addEventListener("ended", () => {
    setPlaying(null);
  });

  player.addEventListener("error", () => {
    if (currentTrack) {
      const span = currentTrack.querySelector(".track-duration");
      if (span) span.textContent = "加载失败";
    }
    setPlaying(null);
  });

  trackItems.forEach((item) => {
    const btn = item.querySelector(".track-play");
    if (!btn) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      playTrack(item);
    });
  });
})();
