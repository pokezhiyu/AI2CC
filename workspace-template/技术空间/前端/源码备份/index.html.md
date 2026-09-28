---
id: ENGINEERING-SOURCE-SNAKE-HTML
title: "index.html 源码快照"
type: source-snapshot
domain: engineering
version: 0.1.0
status: active
owner: engineering
updated: 2026-09-28
sourcePath: "snake-game/index.html"
generatedBy: "scripts/sync-code-backups.mjs"
related:
  - ENGINEERING-SOURCE-SNAKE-INDEX
  - ENGINEERING-ARCH-SNAKE-001
---

# index.html 源码快照

> 本文档是 `snake-game/index.html` 的生成式完整快照，用于 Workspace 内阅读、Agent 上下文加载和 Git 协作交接。可执行源码是唯一实现事实来源，请勿直接编辑代码块；修改源码后运行 `npm run sync:code-backups` 重新生成。

## 文件职责

页面语义结构、游戏信息层级与可访问入口。

## 同步约定

- **唯一真源**：`snake-game/index.html`
- **生成器**：`scripts/sync-code-backups.mjs`
- **重新生成**：`npm run sync:code-backups`
- **版本历史**：由 Git 保存，不在文件名中维护版本号

## 完整源码

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0d1510" />
    <meta name="description" content="青柠蛇场是一款支持键盘与触屏操作的轻量贪吃蛇游戏。" />
    <title>青柠蛇场 · 贪吃蛇</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div class="app-shell">
      <header class="topbar">
        <a class="brand" href="./" aria-label="青柠蛇场首页">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" role="img">
              <path d="M7 10.5C7 6.91 9.91 4 13.5 4h5A6.5 6.5 0 0 1 25 10.5v2A6.5 6.5 0 0 1 18.5 19H13a3 3 0 1 0 0 6h8" />
              <circle cx="20.5" cy="9.5" r="1.4" />
            </svg>
          </span>
          <span>
            <strong>青柠蛇场</strong>
            <small>LIME SNAKE</small>
          </span>
        </a>
        <div class="topbar-note">方向键 / WASD 移动 · 空格暂停</div>
      </header>

      <main class="game-layout">
        <section class="game-panel" aria-labelledby="game-title">
          <div class="game-heading">
            <div>
              <p class="eyebrow">CLASSIC ARCADE · WEB</p>
              <h1 id="game-title">吃下果实，别撞到自己。</h1>
            </div>
            <label class="mode-field">
              <span>游戏模式</span>
              <select id="mode-select">
                <option value="relaxed">轻松 · 穿墙</option>
                <option value="classic" selected>经典 · 碰墙结束</option>
                <option value="sprint">极速 · 高速挑战</option>
              </select>
            </label>
          </div>

          <div class="board-frame">
            <canvas id="game-canvas" width="672" height="672" tabindex="0" role="img" aria-label="贪吃蛇游戏棋盘"></canvas>
            <div class="game-overlay" id="game-overlay">
              <div class="overlay-card">
                <p class="overlay-kicker" id="overlay-kicker">准备好了吗？</p>
                <h2 id="overlay-title">从一颗果实开始</h2>
                <p id="overlay-copy">使用方向键或 WASD 控制青柠蛇，连续吃下果实会逐步加速。</p>
                <button class="button button-primary" id="start-button" type="button">开始游戏</button>
              </div>
            </div>
          </div>

          <div class="mobile-controls" aria-label="触屏方向控制">
            <button class="direction-button direction-up" type="button" data-direction="up" aria-label="向上移动">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6" /></svg>
            </button>
            <button class="direction-button direction-left" type="button" data-direction="left" aria-label="向左移动">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
            </button>
            <button class="direction-button direction-down" type="button" data-direction="down" aria-label="向下移动">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <button class="direction-button direction-right" type="button" data-direction="right" aria-label="向右移动">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
            </button>
          </div>
        </section>

        <aside class="side-panel" aria-label="游戏状态与控制">
          <section class="score-panel" aria-labelledby="score-title">
            <div class="section-label" id="score-title">本局数据</div>
            <div class="score-grid">
              <div class="score-primary">
                <span>得分</span>
                <strong id="score-value">000</strong>
              </div>
              <div class="score-item">
                <span>最高</span>
                <strong id="best-value">000</strong>
              </div>
              <div class="score-item">
                <span>等级</span>
                <strong id="level-value">01</strong>
              </div>
            </div>
            <div class="status-row">
              <span class="status-dot" id="status-dot" aria-hidden="true"></span>
              <span id="status-text" aria-live="polite">等待开始</span>
            </div>
          </section>

          <section class="control-panel" aria-labelledby="control-title">
            <div class="section-label" id="control-title">游戏控制</div>
            <div class="button-stack">
              <button class="button button-secondary" id="pause-button" type="button" disabled>暂停游戏</button>
              <button class="button button-quiet" id="restart-button" type="button">重新开始</button>
            </div>
          </section>

          <section class="rules-panel" aria-labelledby="rules-title">
            <div class="section-label" id="rules-title">玩法提示</div>
            <ol class="rule-list">
              <li><span>01</span>吃下琥珀果实，蛇身增长并获得分数。</li>
              <li><span>02</span>每吃五颗果实升一级，移动速度提高。</li>
              <li><span>03</span>按 <kbd>R</kbd> 可随时重开，按 <kbd>Space</kbd> 暂停。</li>
            </ol>
          </section>
        </aside>
      </main>

      <footer class="footer">
        <span>本地运行 · 不收集个人数据</span>
        <span>青柠蛇场 V1</span>
      </footer>
    </div>
    <script type="module" src="./game.js"></script>
  </body>
</html>
```
