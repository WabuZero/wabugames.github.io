document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("sharedLightbox")) return;

  const lightbox = document.createElement("div");
  lightbox.id = "sharedLightbox";
  lightbox.className = "media-lightbox";
  lightbox.setAttribute("aria-hidden", "true");

  lightbox.innerHTML = `
    <button class="media-lightbox-close" id="sharedLightboxClose" aria-label="Close expanded media">×</button>
    <button class="media-lightbox-nav media-lightbox-prev" id="sharedLightboxPrev" aria-label="Previous media">‹</button>
    <button class="media-lightbox-nav media-lightbox-next" id="sharedLightboxNext" aria-label="Next media">›</button>
    <img class="media-lightbox-content" id="sharedLightboxImage" alt="">
    <video class="media-lightbox-content" id="sharedLightboxVideo" controls playsinline></video>
    <div class="media-lightbox-caption" id="sharedLightboxCaption"></div>
  `;

  document.body.appendChild(lightbox);

  const imageEl = document.getElementById("sharedLightboxImage");
  const videoEl = document.getElementById("sharedLightboxVideo");
  const closeEl = document.getElementById("sharedLightboxClose");
  const prevEl = document.getElementById("sharedLightboxPrev");
  const nextEl = document.getElementById("sharedLightboxNext");
  const captionEl = document.getElementById("sharedLightboxCaption");

  let items = [];
  let currentIndex = 0;

  function getCaption(item) {
    const figcaption = item.closest("figure")?.querySelector("figcaption");
    return figcaption ? figcaption.textContent.replace(/\s+/g, " ").trim() : (item.getAttribute("alt") || "");
  }

  function hideMedia() {
    imageEl.style.display = "none";
    videoEl.style.display = "none";

    imageEl.removeAttribute("src");
    imageEl.alt = "";

    videoEl.pause();
    videoEl.removeAttribute("src");
    videoEl.load();
  }

  function showItem(index) {
    if (!items.length) return;

    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];

    hideMedia();

    if (item.tagName.toLowerCase() === "video") {
      videoEl.src = item.currentSrc || item.getAttribute("src") || "";
      videoEl.style.display = "block";
      videoEl.currentTime = 0;
    } else {
      imageEl.src = item.currentSrc || item.getAttribute("src") || "";
      imageEl.alt = item.getAttribute("alt") || "Expanded project media";
      imageEl.style.display = "block";
    }

    captionEl.textContent = getCaption(item);

    const navDisplay = items.length > 1 ? "grid" : "none";
    prevEl.style.display = navDisplay;
    nextEl.style.display = navDisplay;
  }

  function openFromItem(item) {
    const gallery = item.closest(".media-grid");
    items = gallery ? Array.from(gallery.querySelectorAll("img, video")) : [item];
    currentIndex = Math.max(0, items.indexOf(item));

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    showItem(currentIndex);
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    hideMedia();
    captionEl.textContent = "";
    document.body.style.overflow = "";
  }

  function prevItem() {
    showItem(currentIndex - 1);
  }

  function nextItem() {
    showItem(currentIndex + 1);
  }

  document.querySelectorAll(".media-grid img, .media-grid video").forEach((item) => {
    item.addEventListener("click", () => openFromItem(item));
  });

  closeEl.addEventListener("click", (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  prevEl.addEventListener("click", (e) => {
    e.stopPropagation();
    prevItem();
  });

  nextEl.addEventListener("click", (e) => {
    e.stopPropagation();
    nextItem();
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") prevItem();
    if (e.key === "ArrowRight") nextItem();
  });

  document.querySelectorAll(".media-grid video[data-thumb-time]").forEach((video) => {
    const thumbTime = parseFloat(video.dataset.thumbTime || "0");

    const seekToThumb = () => {
      try {
        video.currentTime = Math.max(0, thumbTime);
      } catch (_) {}
    };

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    video.addEventListener("loadedmetadata", seekToThumb, { once: true });
    video.addEventListener("seeked", () => video.pause(), { once: true });

    if (video.readyState >= 1) seekToThumb();

    video.addEventListener("play", () => {
      if (Math.abs(video.currentTime - thumbTime) < 0.35) {
        video.currentTime = 0;
      }
    });
  });
});
