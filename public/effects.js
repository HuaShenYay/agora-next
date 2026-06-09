/**
 * Agora Landing Page Effects
 * 滚动破碎效果 + 区块显现 + 像素动效 + Apple风格动画
 */

(function () {
  "use strict";

  // 等待 DOM 加载
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    // 等待加载器完成后初始化效果
    waitForLoader(() => {
      initScrollShatter();
      initRevealSections();
      initParallax();
      initSmoothScroll();
      initMagneticButtons();
      initParallaxDepth();
      initImageReveal();
      initStaggerAnimations();
      initHeaderScroll();
      initTextReveal();
    });
  }

  /**
   * 滚动破碎效果 - Scroll Shatter Effect
   * 当文字进入视口时触发像素错位动画
   */
  function initScrollShatter() {
    const shatterElements = document.querySelectorAll(".pixel-shift");

    if (!shatterElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 添加随机延迟，创造错落感
          const delay = Math.random() * 300;
          setTimeout(() => {
            entry.target.classList.add("active");

            // 动画结束后移除类，以便下次触发
            setTimeout(() => {
              entry.target.classList.remove("active");
            }, 600);
          }, delay);
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: "0px 0px -10% 0px",
    });

    shatterElements.forEach((el) => observer.observe(el));
  }

  /**
   * 区块显现动画 - Reveal Sections
   * 区块进入视口时淡入上滑
   */
  function initRevealSections() {
    const sections = document.querySelectorAll(
      ".reveal-section, .reveal-on-scroll",
    );

    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          // 只触发一次
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: "0px 0px -5% 0px",
    });

    sections.forEach((section) => observer.observe(section));
  }

  /**
   * 视差滚动效果 - Parallax
   * Hero 区域的视差移动
   */
  function initParallax() {
    const hero = document.querySelector(".main");
    if (!hero) return;

    const parallaxElements = hero.querySelectorAll(".parallax");
    if (!parallaxElements.length) return;

    let ticking = false;

    function updateParallax() {
      const scrolled = globalThis.scrollY;
      const heroHeight = hero.offsetHeight;

      // 只在 Hero 区域内生效
      if (scrolled < heroHeight) {
        parallaxElements.forEach((el, i) => {
          const speed = 0.08 * (i % 3 + 1);
          const yPos = scrolled * speed;
          el.style.transform = `translateY(${yPos}px)`;
        });
      }

      ticking = false;
    }

    globalThis.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * 平滑滚动 - Smooth Scroll
   * 锚点链接平滑滚动
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }

  /**
   * 磁性按钮效果 - Magnetic Button Effect
   * 按钮跟随光标轻微移动
   */
  function initMagneticButtons() {
    const magneticElements = document.querySelectorAll(
      ".btn-apple, .magnetic-btn",
    );

    if (!magneticElements.length) return;

    magneticElements.forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Apple-style magnetic strength (subtle)
        const strength = 0.3;

        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });

      el.addEventListener("mouseleave", () => {
        // Smooth return to original position
        el.style.transform = "translate(0, 0)";
      });
    });
  }

  /**
   * 深度视差效果 - Parallax Depth
   * 多层级视差滚动
   */
  function initParallaxDepth() {
    const parallaxContainers = document.querySelectorAll("[data-parallax]");

    if (!parallaxContainers.length) return;

    let ticking = false;
    let _lastScrollY = 0;

    function updateParallaxDepth() {
      const scrolled = globalThis.scrollY;
      const viewportHeight = globalThis.innerHeight;

      parallaxContainers.forEach((container) => {
        const rect = container.getBoundingClientRect();
        const speed = parseFloat(container.dataset.parallax) || 0.5;

        // Only animate when visible
        if (rect.top < viewportHeight && rect.bottom > 0) {
          const yPos = (scrolled - container.offsetTop) * speed * 0.1;
          container.style.transform = `translateY(${yPos}px)`;
        }
      });

      ticking = false;
      _lastScrollY = scrolled;
    }

    globalThis.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(updateParallaxDepth);
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * 图片显现效果 - Image Reveal
   * 图片进入视口时的缩放和模糊动画
   */
  function initImageReveal() {
    const images = document.querySelectorAll(
      ".img-reveal-container, .img-hover-zoom",
    );

    if (!images.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px",
    });

    images.forEach((img) => observer.observe(img));
  }

  /**
   * 错落动画 - Stagger Animations
   * 子元素依次动画显现
   */
  function initStaggerAnimations() {
    const staggerContainers = document.querySelectorAll(".stagger-container");

    if (!staggerContainers.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const children = entry.target.children;
          Array.from(children).forEach((child, index) => {
            setTimeout(() => {
              child.classList.add("stagger-visible");
            }, index * 100);
          });
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
    });

    staggerContainers.forEach((container) => observer.observe(container));
  }

  /**
   * 头部滚动效果 - Header Scroll Effect
   * 滚动时头部添加背景和阴影
   */
  function initHeaderScroll() {
    const header = document.querySelector(".header");
    if (!header) return;

    let lastScroll = 0;
    let ticking = false;

    function updateHeader() {
      const scrolled = globalThis.scrollY;

      // Add background blur after scrolling 50px
      if (scrolled > 50) {
        header.style.background = "rgba(248, 246, 241, 0.95)";
        header.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.05)";
      } else {
        header.style.background = "rgba(248, 246, 241, 0.82)";
        header.style.boxShadow = "none";
      }

      // Hide/show header based on scroll direction
      if (scrolled > lastScroll && scrolled > 100) {
        header.style.transform = "translateY(-100%)";
      } else {
        header.style.transform = "translateY(0)";
      }

      lastScroll = scrolled;
      ticking = false;
    }

    globalThis.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });

    // Add transition styles
    header.style.transition =
      "transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease";
  }

  /**
   * 文字显现效果 - Text Reveal
   * 逐词显现动画
   */
  function initTextReveal() {
    const textElements = document.querySelectorAll("[data-text-reveal]");

    if (!textElements.length) return;

    textElements.forEach((el) => {
      const text = el.textContent;
      const words = text.split(" ");

      el.innerHTML = words.map((word, index) =>
        `<span style="display: inline-block; opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease ${
          index * 0.05
        }s, transform 0.5s ease ${index * 0.05}s">${word}</span>`
      ).join(" ");

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const spans = entry.target.querySelectorAll("span");
            spans.forEach((span) => {
              span.style.opacity = "1";
              span.style.transform = "translateY(0)";
            });
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.3,
      });

      observer.observe(el);
    });
  }

  /**
   * 检查页面是否已加载完成
   * 等待马赛克加载器完成后再初始化效果
   */
  function waitForLoader(callback) {
    const loader = document.getElementById("mosaic-loader");

    if (!loader) {
      // 如果没有加载器，直接执行
      callback();
      return;
    }

    // 检查加载器是否还在显示
    const checkLoader = setInterval(() => {
      if (
        loader.classList.contains("hidden") || loader.style.display === "none"
      ) {
        clearInterval(checkLoader);
        callback();
      }
    }, 100);

    // 超时保护
    setTimeout(() => {
      clearInterval(checkLoader);
      callback();
    }, 5000);
  }

  /**
   * 文字切片破碎效果 - Text Slice Shatter
   * 将文字分割成多个切片，各自动画
   */
  function createTextSlices(element) {
    const text = element.textContent;
    element.innerHTML = "";

    // 将文字分割成字符或词组
    const chars = text.split("");

    chars.forEach((char, i) => {
      const span = document.createElement("span");
      span.className = "slice";
      span.textContent = char === " " ? "\u00A0" : char;

      // 为每个切片设置随机动画参数
      span.style.setProperty("--tx", `${(Math.random() - 0.5) * 10}px`);
      span.style.setProperty("--ty", `${(Math.random() - 0.5) * 10}px`);
      span.style.setProperty("--r", `${(Math.random() - 0.5) * 6}deg`);
      span.style.setProperty("--tx2", `${(Math.random() - 0.5) * 8}px`);
      span.style.setProperty("--ty2", `${(Math.random() - 0.5) * 8}px`);
      span.style.setProperty("--r2", `${(Math.random() - 0.5) * 4}deg`);
      span.style.setProperty("--tx3", `${(Math.random() - 0.5) * 6}px`);
      span.style.setProperty("--ty3", `${(Math.random() - 0.5) * 6}px`);
      span.style.setProperty("--r3", `${(Math.random() - 0.5) * 3}deg`);
      span.style.animationDelay = `${i * 0.02}s`;

      element.appendChild(span);
    });

    element.classList.add("shatter-text");
  }

  // 文字组容器动画
  function animateTextGroups() {
    const textGroups = document.querySelectorAll(".hero-text-group");

    if (!textGroups.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          // 添加随机延迟，创造错落感
          const delay = Math.random() * 300;
          setTimeout(() => {
            entry.target.classList.add("visible");

            // 动画结束后移除类，以便下次触发
            setTimeout(() => {
              entry.target.classList.remove("visible");
            }, 800);
          }, delay);
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: "0px 0px -10% 0px",
    });

    textGroups.forEach((el) => observer.observe(el));
  }

  // 单个文字元素动画
  function animateTextElements() {
    const textElements = document.querySelectorAll(".hero-text-element");

    if (!textElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");

          // 添加随机延迟，创造错落感
          const delay = Math.random() * 500;
          setTimeout(() => {
            entry.target.classList.add("visible");

            // 动画结束后移除类，以便下次触发
            setTimeout(() => {
              entry.target.classList.remove("visible");
            }, 1000);
          }, delay);
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: "0px 0px -20% 0px",
    });

    textElements.forEach((el) => observer.observe(el));
  }

  // 注册动画
  function registerAnimations() {
    animateTextGroups();
    animateTextElements();
  }

  // 暴露全局函数供外部使用
  globalThis.AgoraEffects = {
    createTextSlices,
    initScrollShatter,
    initRevealSections,
    initParallax,
    initMagneticButtons,
    initParallaxDepth,
    initImageReveal,
    initStaggerAnimations,
    initHeaderScroll,
    initTextReveal,
    registerAnimations,
  };
})();
