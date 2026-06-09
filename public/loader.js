/**
 * 马赛克溶解载入动画 - 快速简洁版
 */

(function () {
  "use strict";

  function initLoader() {
    const loader = document.getElementById("mosaic-loader");
    const mosaicGrid = document.getElementById("mosaic-grid");

    if (!loader || !mosaicGrid) return;

    // 创建马赛克块
    const cols = Math.ceil(globalThis.innerWidth / 50);
    const rows = Math.ceil(globalThis.innerHeight / 50);
    const total = cols * rows;

    for (let i = 0; i < total; i++) {
      const block = document.createElement("div");
      block.className = "mosaic-block";
      mosaicGrid.appendChild(block);
    }

    // 快速随机溶解
    const blocks = Array.from(mosaicGrid.children);
    const shuffled = blocks.sort(() => Math.random() - 0.5);

    shuffled.forEach((block, index) => {
      const delay = index * 8 + Math.random() * 100;
      setTimeout(() => {
        block.classList.add("dissolving");
      }, delay);
    });

    // 隐藏加载器并显示页面
    setTimeout(() => {
      loader.classList.add("hidden");
      const page = document.querySelector(".page");
      if (page) {
        page.classList.add("loaded");
      }
    }, 600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLoader);
  } else {
    initLoader();
  }
})();
