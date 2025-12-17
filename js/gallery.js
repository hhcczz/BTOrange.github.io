document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("gallery-modal");
  const grid = document.getElementById("gallery-grid");
  const titleEl = document.getElementById("gallery-title");
  const closeBtn = document.getElementById("gallery-close");
  const backdrop = document.getElementById("gallery-backdrop");

  // ✅ 라이트박스(큰 이미지) 요소
  const viewer = document.getElementById("image-viewer");
  const viewerImg = document.getElementById("viewer-img");
  const viewerClose = document.getElementById("viewer-close");
  const viewerBackdrop = document.getElementById("viewer-backdrop");

  // =========================
  // ✅ 이미지 프리로드 (video X)
  // =========================
  function unique(arr) {
    return [...new Set(arr.filter(Boolean))];
  }

  function collectAllImageUrls() {
    const urls = [];
    document.querySelectorAll(".open-gallery").forEach((btn) => {
      const images = (btn.dataset.images || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
      urls.push(...images);
    });
    return unique(urls);
  }

  function preloadImage(url) {
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.src = url;
  }

  function preloadAllProjectImages() {
    const urls = collectAllImageUrls();
    urls.forEach(preloadImage);
  }

  // ✅ 페이지가 한가할 때 프리로드 (첫 로딩 덜 막힘)
  if ("requestIdleCallback" in window) {
    requestIdleCallback(preloadAllProjectImages, { timeout: 2000 });
  } else {
    setTimeout(preloadAllProjectImages, 800);
  }

  // =========================
  // 갤러리/뷰어 로직
  // =========================
  function openViewer(src, alt = "preview") {
    viewerImg.src = src;
    viewerImg.alt = alt;
    viewer.classList.remove("hidden");
    viewer.setAttribute("aria-hidden", "false");
  }

  function closeViewer() {
    viewer.classList.add("hidden");
    viewer.setAttribute("aria-hidden", "true");
    viewerImg.src = "";
  }

  function openModal(title, images) {
    titleEl.textContent = title;
    grid.innerHTML = "";

    images.forEach((src, idx) => {
      const card = document.createElement("div");
      card.className =
        "glass-card rounded-2xl overflow-hidden border border-gray-700 hover:border-primary-500 transition";

      // 썸네일 클릭 -> 라이트박스 오픈
      card.innerHTML = `
        <div class="bg-gray-900/40 p-3 border-b border-gray-700 flex items-center justify-between">
          <p class="text-xs text-gray-400">Image ${idx + 1}</p>
          <button
            class="thumb-open text-xs text-gray-300 hover:text-white px-2 py-1 rounded-md bg-gray-800/60 border border-gray-700 hover:border-primary-500 transition"
            data-src="${src}">
            크게 보기
          </button>
        </div>

        <div class="p-3">
          <button class="thumb-wrap w-full text-left" data-src="${src}">
            <div class="bg-gray-900/60 rounded-xl overflow-hidden flex items-center justify-center h-[240px]">
              <img
                src="${src}"
                alt="Image ${idx + 1}"
                class="max-w-full max-h-full w-auto h-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          </button>
        </div>
      `;

      grid.appendChild(card);
    });

    // 썸네일 버튼 이벤트 바인딩
    grid.querySelectorAll("[data-src]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const src = el.getAttribute("data-src");
        openViewer(src, titleEl.textContent);
      });
    });

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.add("hidden");
    grid.innerHTML = "";
    document.body.style.overflow = "";
    closeViewer();
  }

  document.querySelectorAll(".open-gallery").forEach((btn) => {
    btn.addEventListener("click", () => {
      const title = btn.dataset.title || "프로젝트 이미지";
      const images = (btn.dataset.images || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      openModal(title, images);
    });
  });

  // 갤러리 닫기
  closeBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);

  // 라이트박스 닫기
  viewerClose.addEventListener("click", closeViewer);
  viewerBackdrop.addEventListener("click", closeViewer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // 라이트박스가 열려 있으면 라이트박스 우선 닫기
      if (!viewer.classList.contains("hidden")) closeViewer();
      else closeModal();
    }
  });
});
