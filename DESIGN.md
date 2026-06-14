# 集市 Agora · 设计系统（Design Tokens）

> 基于 **tweakcn / shadcn/ui** 的 CSS 变量骨架，叠加 **像素点阵（Pixel Art / Dot Matrix）** 视觉语言与品牌色 **雅典黄（Honey Gold）**。  
> 适用组件：书库、上传、阅读、详情、首页 Hero 之外的所有 UI。

---

## 0. 设计原则

| 维度 | 取舍 |
|---|---|
| **设计骨架** | tweakcn + shadcn（语义化 `<role>` / `<role>-foreground` 配对） |
| **色彩空间** | OKLCH（感知均匀，与 tweakcn 默认一致） |
| **品牌色** | 雅典黄 = 蜂蜜金（oklch `0.7473 0.0888 78.4` ≈ `#c9a86c`），仅做 **accent / highlight** |
| **字体** | 像素字体优先（`ArkPixel 12px` 中文友好；`ChillBitmap 7/16px` 西文/小标签） |
| **圆角** | 全局 `--radius: 0`（硬边方角） |
| **阴影** | **硬阴影** `4px 4px 0 0`（不用 tweakcn 的模糊软阴影） |
| **边框** | 1px 实体线（`--border`） |
| **背景纹理** | 1px 网格 / 2px 点阵 SVG 重复（可叠加在 card / surface 上） |
| **图像渲染** | 全局 `image-rendering: pixelated`（图片、SVG 描边） |

> **与 tweakcn 不同的关键点**：tweakcn 默认是 Material 软阴影 + 圆角 + 抗锯齿字体；本设计系统**整体覆盖**为像素点阵硬边美学。

---

## 1. 颜色 Tokens（shadcn 命名 + OKLCH + 雅典黄）

### 1.1 Light 主题（默认 / 米白大理石）

```css
:root {
  /* —— 表面 —— */
  --background:           oklch(0.974 0.012 85);   /* #f8f6f1 大理石米白 */
  --foreground:           oklch(0.225 0.022 60);   /* #2a2218 深棕墨色 */

  --card:                 oklch(0.974 0.012 85);
  --card-foreground:      oklch(0.225 0.022 60);

  --popover:              oklch(0.974 0.012 85);
  --popover-foreground:   oklch(0.225 0.022 60);

  /* —— 品牌：雅典黄（蜂蜜金）—— */
  --primary:              oklch(0.747 0.089 78);    /* #c9a86c 蜂蜜金 */
  --primary-foreground:   oklch(0.225 0.022 60);    /* 深棕墨色文字 on 金 */

  /* —— 次级 / 弱化 —— */
  --secondary:            oklch(0.937 0.014 82);    /* #f0ece3 米黄 */
  --secondary-foreground: oklch(0.225 0.022 60);

  --muted:                oklch(0.917 0.018 80);    /* #e8e2d5 */
  --muted-foreground:     oklch(0.49 0.025 65);     /* #6b5d4b */

  --accent:               oklch(0.808 0.105 82);    /* #d4b87a 蜂蜜亮金 */
  --accent-foreground:    oklch(0.225 0.022 60);

  /* —— 危险 / 警示 —— */
  --destructive:          oklch(0.553 0.165 35);    /* #a65d45 陶土红 */
  --destructive-foreground: oklch(0.974 0.012 85);

  /* —— 边框 / 输入 / 焦点环 —— */
  --border:               oklch(0.225 0.022 60 / 0.18);   /* 深棕 18% */
  --input:                oklch(0.225 0.022 60 / 0.18);
  --ring:                 oklch(0.747 0.089 78);          /* 焦点 = 雅典黄 */

  /* —— 图表色阶（5 色） —— */
  --chart-1: oklch(0.747 0.089 78);     /* 蜂蜜金 */
  --chart-2: oklch(0.553 0.165 35);     /* 陶土红 */
  --chart-3: oklch(0.493 0.078 130);    /* 橄榄绿 */
  --chart-4: oklch(0.553 0.130 40);     /* 古铜 */
  --chart-5: oklch(0.45  0.020 60);     /* 深棕墨 */

  /* —— 侧边栏 —— */
  --sidebar:                    oklch(0.937 0.014 82);
  --sidebar-foreground:         oklch(0.225 0.022 60);
  --sidebar-primary:            oklch(0.747 0.089 78);
  --sidebar-primary-foreground: oklch(0.225 0.022 60);
  --sidebar-accent:             oklch(0.808 0.105 82);
  --sidebar-accent-foreground:  oklch(0.225 0.022 60);
  --sidebar-border:             oklch(0.225 0.022 60 / 0.18);
  --sidebar-ring:               oklch(0.747 0.089 78);

  /* —— 圆角：0 —— */
  --radius: 0;

  /* —— 字体 —— */
  --font-sans:   "ArkPixel", "ChillBitmap16", "Helvetica Neue", "PingFang SC", system-ui, sans-serif;
  --font-mono:   "ChillBitmap7", ui-monospace, "SFMono-Regular", monospace;
  --font-serif:  "Songti SC", "STSongti", Georgia, serif;

  /* —— 阴影：硬边 —— */
  --shadow-color:        oklch(0.225 0.022 60);  /* 阴影 = 深棕墨色 */
  --shadow-opacity:      1;                      /* 不模糊，全实 */
  --shadow-blur:         0;                      /* 0 模糊 = 硬边 */
  --shadow-spread:       0;
  --shadow-offset-x:     4px;
  --shadow-offset-y:     4px;
  /* 由以上派生的"tweakcn 软阴影"自动变成 0 模糊 4px 偏移的硬阴影 */

  /* —— 排版 —— */
  --letter-spacing: 0.02em;
  --spacing:        0.25rem;
}
```

### 1.2 Dark 主题（夜读 / 卫城黄昏）

```css
.dark {
  --background:           oklch(0.225 0.022 60);   /* 深棕墨底 */
  --foreground:           oklch(0.974 0.012 85);   /* 米白文字 */

  --card:                 oklch(0.272 0.024 58);
  --card-foreground:      oklch(0.974 0.012 85);
  --popover:              oklch(0.272 0.024 58);
  --popover-foreground:   oklch(0.974 0.012 85);

  --primary:              oklch(0.808 0.105 82);   /* 暗色下主色提亮 */
  --primary-foreground:   oklch(0.225 0.022 60);

  --secondary:            oklch(0.32  0.020 60);
  --secondary-foreground: oklch(0.974 0.012 85);

  --muted:                oklch(0.32  0.020 60);
  --muted-foreground:     oklch(0.7   0.018 78);

  --accent:               oklch(0.747 0.089 78);
  --accent-foreground:    oklch(0.225 0.022 60);

  --destructive:          oklch(0.65  0.18  30);
  --destructive-foreground: oklch(0.974 0.012 85);

  --border:               oklch(0.974 0.012 85 / 0.15);
  --input:                oklch(0.974 0.012 85 / 0.15);
  --ring:                 oklch(0.808 0.105 82);

  /* 图表 / sidebar / 阴影 / 字体 / 圆角 同 light */
}
```

### 1.3 与既有 token 的**双轨映射**

为兼容首页 Hero 等老代码（使用 `var(--bg-primary)` / `var(--accent-gold)`），新加别名映射：

```css
:root {
  /* 旧 token → 新 token 别名（保证老组件不破） */
  --bg-primary:      var(--background);
  --bg-secondary:    var(--secondary);
  --bg-tertiary:     var(--muted);
  --bg-dark:         oklch(0.225 0.022 60);
  --text-primary:    var(--foreground);
  --text-secondary:  var(--muted-foreground);
  --text-tertiary:   var(--muted-foreground);
  --text-light:      oklch(0.55 0.02 65);
  --accent-gold:     var(--primary);
  --accent-honey:    var(--accent);
  --accent-ochre:    oklch(0.747 0.12 75);
  --accent-bronze:   oklch(0.62 0.06 65);
  --accent-clay:     oklch(0.71 0.05 70);
  --accent-olive:    oklch(0.62 0.08 130);
  --accent-rust:     var(--destructive);
  --accent-terracotta: oklch(0.58 0.13 35);
  --border-soft:     oklch(0.225 0.022 60 / 0.08);
  --border-medium:   var(--border);
  --border-strong:   oklch(0.225 0.022 60 / 0.35);
  --font-hero:       "ChillBitmap7", monospace;
  --font-pixel:      "ArkPixel", "ChillBitmap16", monospace;
  --transition-fast: 0.15s steps(2, end);   /* 改用 steps() = 像素跳变感 */
  --transition-medium: 0.25s steps(3, end);
}
```

> **关键差异**：transition 改用 `steps()`，动画**没有平滑过渡**而是**帧切换**（像素游戏感）。

---

## 2. 字体系统（Pixel Fonts）

| Token | 字体栈 | 用途 |
|---|---|---|
| `--font-sans` | `"ArkPixel", "ChillBitmap16", "PingFang SC", system-ui, sans-serif` | 全部正文 / 标题 / 按钮（中文 fallback PingFang 防止缺字） |
| `--font-mono` | `"ChillBitmap7", ui-monospace, monospace` | 时间码、版本号、ID 标签（最小尺寸 7px） |
| `--font-serif` | `"Songti SC", "STSongti", Georgia, serif` | 学术引用 / 大段阅读（与正文形成对比） |
| `--font-pixel` | `"ArkPixel", "ChillBitmap16", monospace` | 旧代码兼容 = `--font-sans` |
| `--font-hero` | `"ChillBitmap7", monospace` | 大型展示字（首屏大字） |

```css
/* 已预置字体文件（public/fonts/） */
@font-face {
  font-family: "ArkPixel";
  src: url("/fonts/ark-pixel-12px.woff2") format("woff2");
  font-display: swap;
}
@font-face {
  font-family: "ArkPixel16";
  src: url("/fonts/ark-pixel-16px.woff2") format("woff2");
  font-display: swap;
}
/* 已有 ChillBitmap 7/16px */
```

> **关键点**：ArkPixel 12px 是**中文友好**的等宽像素字体，避免老 ChillBitmap 只有西文时中文 fallback 到系统字体破坏像素感。

---

## 3. 圆角与阴影（**与 tweakcn 相反**）

| 维度 | tweakcn 默认 | 本设计系统 |
|---|---|---|
| `--radius` | `0.625rem` | **`0`**（硬方角） |
| `--shadow-blur` | `3px` | **`0`**（硬边阴影） |
| `--shadow-offset-x/y` | `0 / 1px` | **`4px / 4px`**（强偏移） |
| 阴影色 | 黑 10% | **`var(--foreground)` 全实**（深棕墨色） |

**派生圆角**：

```css
@theme inline {
  --radius-sm:  calc(var(--radius) * 0.5);  /* 0 */
  --radius-md:  var(--radius);              /* 0 */
  --radius-lg:  var(--radius);              /* 0 */
  --radius-xl:  var(--radius);              /* 0 */
  --radius-2xl: var(--radius);              /* 0 */
  --radius-3xl: var(--radius);              /* 0 */
  --radius-4xl: var(--radius);              /* 0 */
}
```

> 所有圆角变量都是 `0`。如需个别"软化"组件（弹窗、Toast），用类名覆写 `border-radius: 2px` 即可，不动 token。

**派生阴影**：

```css
@theme inline {
  --shadow-2xs: 2px 2px 0 0 var(--shadow-color);
  --shadow-xs:  3px 3px 0 0 var(--shadow-color);
  --shadow-sm:  4px 4px 0 0 var(--shadow-color);
  --shadow-md:  5px 5px 0 0 var(--shadow-color);
  --shadow-lg:  6px 6px 0 0 var(--shadow-color);
  --shadow-xl:  8px 8px 0 0 var(--shadow-color);
  --shadow-2xl: 10px 10px 0 0 var(--shadow-color);
}
```

---

## 4. 像素点阵纹理（点阵背景 / 扫描线）

通过 `background-image` + `background-size` 实现**1px 网格**、**2px 圆点**、**扫描线**三种纹理：

```css
@theme inline {
  --pattern-dots:
    radial-gradient(circle, var(--border) 1px, transparent 1px);
  --pattern-grid:
    linear-gradient(to right, var(--border) 1px, transparent 1px),
    linear-gradient(to bottom, var(--border) 1px, transparent 1px);
  --pattern-scanlines:
    repeating-linear-gradient(
      0deg,
      transparent 0,
      transparent 3px,
      var(--border) 3px,
      var(--border) 4px
    );
}

/* 用法 */
.surface-dots    { background-image: var(--pattern-dots);    background-size: 8px 8px; }
.surface-grid    { background-image: var(--pattern-grid);    background-size: 16px 16px; }
.surface-scan    { background-image: var(--pattern-scanlines); }
```

| 纹理 | 推荐场景 | 透明度 |
|---|---|---|
| 点阵 dots | card 背景、toolbar | `--border` 即可（淡） |
| 网格 grid | 详情页正文容器、上传区 | `--border` 0.4 透明度 |
| 扫描线 scanlines | Hero / 暗色模式 hero | 慎用，仅作装饰 |

---

## 5. 全局图像渲染（像素保真）

```css
:root {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

img, svg, video, canvas {
  image-rendering: inherit;
}

/* 字体永远不抗锯齿 */
* {
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: unset;
  text-rendering: geometricPrecision;
}
```

---

## 6. 间距与排版节奏

```css
@theme inline {
  --spacing: 0.25rem;       /* 4px 基准 */

  /* 文字尺寸阶（基于 4px 网格） */
  --text-xs:   0.625rem;    /* 10px */
  --text-sm:   0.75rem;     /* 12px */
  --text-base: 0.875rem;    /* 14px */
  --text-md:   1rem;        /* 16px */
  --text-lg:   1.25rem;     /* 20px */
  --text-xl:   1.5rem;      /* 24px */
  --text-2xl:  2rem;        /* 32px */
  --text-3xl:  2.5rem;      /* 40px */
  --text-4xl:  3.25rem;     /* 52px */
  --text-5xl:  4rem;        /* 64px */
}
```

| 元素 | 字号 | 字重 | letter-spacing |
|---|---|---|---|
| H1 (页面) | `text-4xl` ~ `text-5xl` | 800 | -0.02em |
| H2 (区块) | `text-2xl` | 700 | -0.01em |
| H3 (卡片) | `text-lg` | 700 | 0 |
| 正文 | `text-base` | 400 | 0 |
| 标签 / 按钮 | `text-sm` | 500 | 0.05em |
| 索引编号 | `text-xs` | 700 | 0.12em, UPPERCASE |

---

## 7. 组件规范（常见 6 个）

### 7.1 Button（4 个变体）

```css
/* 基础 */
.btn-pixel {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  height: 2.25rem; padding: 0 1rem;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: 0.05em;
  border: 1px solid var(--foreground);
  border-radius: 0;
  box-shadow: 4px 4px 0 0 var(--foreground);
  transition: transform 0.1s steps(2), box-shadow 0.1s steps(2);
  cursor: pointer;
  text-transform: uppercase;
}
.btn-pixel:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 0 var(--foreground); }
.btn-pixel:active { transform: translate(2px, 2px); box-shadow: 0 0 0 0 var(--foreground); }

/* primary：雅典黄填充 */
.btn-pixel-primary { background: var(--primary); color: var(--primary-foreground); }

/* secondary：米黄 */
.btn-pixel-secondary { background: var(--secondary); color: var(--secondary-foreground); }

/* outline：透明 + 边线 */
.btn-pixel-outline { background: transparent; color: var(--foreground); }

/* ghost：纯文字 */
.btn-pixel-ghost { background: transparent; color: var(--foreground); border-color: transparent; box-shadow: none; }
.btn-pixel-ghost:hover { background: var(--accent); }
```

### 7.2 Card

```css
.card-pixel {
  background: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
  border-radius: 0;
  box-shadow: 4px 4px 0 0 var(--shadow-color);
  /* 可选：叠加点阵纹理 */
  background-image: var(--pattern-dots);
  background-size: 12px 12px;
  background-position: 0 0;
}
```

### 7.3 Input

```css
.input-pixel {
  height: 2.25rem;
  padding: 0 0.75rem;
  background: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
  border-radius: 0;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  box-shadow: inset 0 -2px 0 0 var(--border);
}
.input-pixel:focus {
  outline: none;
  border-color: var(--ring);
  box-shadow: inset 0 -2px 0 0 var(--ring), 0 0 0 2px var(--ring);
}
```

### 7.4 Badge

```css
.badge-pixel {
  display: inline-flex; align-items: center;
  height: 1.25rem; padding: 0 0.5rem;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: var(--accent);
  color: var(--accent-foreground);
  border: 1px solid var(--foreground);
  border-radius: 0;
}
```

### 7.5 Dialog / Modal

```css
.dialog-pixel {
  background: var(--popover);
  color: var(--popover-foreground);
  border: 1px solid var(--foreground);
  border-radius: 0;
  box-shadow: 8px 8px 0 0 var(--shadow-color);
  padding: 1.5rem;
}
```

### 7.6 Toast

```css
.toast-pixel {
  background: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--foreground);
  border-left-width: 4px;
  border-left-color: var(--primary);
  box-shadow: 4px 4px 0 0 var(--shadow-color);
  border-radius: 0;
  padding: 0.75rem 1rem;
}
```

---

## 8. Tailwind 暴露（@theme inline）

```css
@theme inline {
  --color-background:            var(--background);
  --color-foreground:            var(--foreground);
  --color-card:                  var(--card);
  --color-card-foreground:       var(--card-foreground);
  --color-popover:               var(--popover);
  --color-popover-foreground:    var(--popover-foreground);
  --color-primary:               var(--primary);
  --color-primary-foreground:    var(--primary-foreground);
  --color-secondary:             var(--secondary);
  --color-secondary-foreground:  var(--secondary-foreground);
  --color-muted:                 var(--muted);
  --color-muted-foreground:      var(--muted-foreground);
  --color-accent:                var(--accent);
  --color-accent-foreground:     var(--accent-foreground);
  --color-destructive:           var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border:                var(--border);
  --color-input:                 var(--input);
  --color-ring:                  var(--ring);
  --color-chart-1:               var(--chart-1);
  --color-chart-2:               var(--chart-2);
  --color-chart-3:               var(--chart-3);
  --color-chart-4:               var(--chart-4);
  --color-chart-5:               var(--chart-5);
  --color-sidebar:               var(--sidebar);
  --color-sidebar-foreground:    var(--sidebar-foreground);
  --color-sidebar-primary:       var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent:        var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border:        var(--sidebar-border);
  --color-sidebar-ring:          var(--sidebar-ring);

  --radius-sm: var(--radius);
  --radius-md: var(--radius);
  --radius-lg: var(--radius);
  --radius-xl: var(--radius);
  --radius-2xl: var(--radius);
  --radius-3xl: var(--radius);
  --radius-4xl: var(--radius);

  --font-sans:  var(--font-sans);
  --font-mono:  var(--font-mono);
  --font-serif: var(--font-serif);

  --shadow-2xs: 2px 2px 0 0 var(--shadow-color);
  --shadow-xs:  3px 3px 0 0 var(--shadow-color);
  --shadow-sm:  4px 4px 0 0 var(--shadow-color);
  --shadow-md:  5px 5px 0 0 var(--shadow-color);
  --shadow-lg:  6px 6px 0 0 var(--shadow-color);
  --shadow-xl:  8px 8px 0 0 var(--shadow-color);
  --shadow-2xl: 10px 10px 0 0 var(--shadow-color);
}
```

---

## 9. 与 tweakcn 默认的差异速查

| 维度 | tweakcn 默认 | 集市 Agora 设计系统 |
|---|---|---|
| 主色 | 黑白灰（neutral） | **雅典黄 `#c9a86c`** 做 primary |
| 圆角 | `0.625rem` | **`0`** 全硬方角 |
| 阴影 | 软阴影（3px 模糊） | **硬边 `4px 4px 0 0`**（无模糊） |
| 字体 | Inter / Geist | **ArkPixel 12px + ChillBitmap 7/16px** |
| 过渡 | 平滑 cubic-bezier | **`steps()` 帧切换**（像素游戏感） |
| 图像 | 默认浏览器插值 | **全局 `pixelated`** |
| 背景 | 纯色 | 可选 **点阵 / 网格 / 扫描线** SVG 纹理 |
| 中文 | 走系统字体 | **ArkPixel**（中文友好像素字体） |
| 色彩 | oklch | oklch（一致） |
| Tailwind v4 | `@theme inline` | `@theme inline`（一致） |

---

## 10. 实施优先级

| 阶段 | 范围 | 说明 |
|---|---|---|
| **P0** | 替换 `:root` + `.dark` 全部 token；追加字体 @font-face 指向 `public/fonts/pixel-font.css` | 一行替换即可让所有 shadcn 命名类生效 |
| **P1** | 全局 `image-rendering: pixelated` + `* { -webkit-font-smoothing: none }` | 像素感的根基 |
| **P2** | 新组件用 `btn-pixel` / `card-pixel` / `input-pixel` / `badge-pixel` 6 套基础类 | 后续书库、上传、阅读器复用 |
| **P3** | 老组件（Hero、Footer）维持现状，仅靠 token 变量自动跟随新色 | 兼容期内不破坏首页体验 |
| **P4** | 引入 .dark 切换（暂未做） | 留 token 不用类 |

---

## 11. 文件结构

```
src/
  app/
    globals.css       ← 所有 token 与 6 套基础组件样式
  public/
    fonts/
      ark-pixel-12px.woff2     ← 预置
      ark-pixel-16px.woff2     ← 预置
      ChillBitmap_7px.ttf      ← 预置
      ChillBitmap_16px.ttf     ← 预置
      pixel-font.css           ← 预置（已含 ArkPixel 定义）
```

设计系统**零新依赖**，纯 CSS 变量 + 已有像素字体文件。
