/**
 * 字体加载优化脚本
 * 解决点阵字体加载时的闪烁问题
 */

(function () {
  "use strict";

  // 添加加载状态类
  document.documentElement.classList.add("fonts-loading");

  // 检查字体是否已加载的函数
  function checkFontsLoaded() {
    if (document.fonts) {
      // 使用 Font Loading API
      Promise.all([
        document.fonts.load("16px ChillBitmap16"),
        document.fonts.load("7px ChillBitmap7"),
      ]).then(function () {
        document.documentElement.classList.remove("fonts-loading");
        document.documentElement.classList.add("fonts-loaded");
      }).catch(function () {
        // 如果 Font Loading API 失败，使用备用方案
        fallbackFontCheck();
      });
    } else {
      // 浏览器不支持 Font Loading API，使用备用方案
      fallbackFontCheck();
    }
  }

  // 备用字体检查方案
  function fallbackFontCheck() {
    let checkCount = 0;
    const maxChecks = 20; // 最多检查20次，每次500ms

    const interval = setInterval(function () {
      checkCount++;

      // 检查字体是否可用（通过测量文本宽度）
      const testElement = document.createElement("span");
      testElement.style.position = "absolute";
      testElement.style.left = "-9999px";
      testElement.style.fontFamily = "ChillBitmap16, monospace";
      testElement.style.fontSize = "16px";
      testElement.textContent = "测试文字 Test";
      document.body.appendChild(testElement);

      const width = testElement.offsetWidth;
      document.body.removeChild(testElement);

      // 如果宽度不是默认的monospace宽度，说明自定义字体已加载
      if (width > 0 && width !== 120) { // 120是monospace的预期宽度
        document.documentElement.classList.remove("fonts-loading");
        document.documentElement.classList.add("fonts-loaded");
        clearInterval(interval);
      } else if (checkCount >= maxChecks) {
        // 超时后也移除loading状态
        document.documentElement.classList.remove("fonts-loading");
        clearInterval(interval);
      }
    }, 500);
  }

  // 页面加载完成后开始检查字体
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkFontsLoaded);
  } else {
    checkFontsLoaded();
  }

  // 添加CSS字体预加载提示
  const preloadLink = document.createElement("link");
  preloadLink.rel = "preload";
  preloadLink.as = "font";
  preloadLink.type = "font/truetype";
  preloadLink.href = "/fonts/ChillBitmap_16px.ttf";
  preloadLink.crossOrigin = "anonymous";
  document.head.appendChild(preloadLink);

  const preloadLink2 = document.createElement("link");
  preloadLink2.rel = "preload";
  preloadLink2.as = "font";
  preloadLink2.type = "font/truetype";
  preloadLink2.href = "/fonts/ChillBitmap_7px.ttf";
  preloadLink2.crossOrigin = "anonymous";
  document.head.appendChild(preloadLink2);
})();
