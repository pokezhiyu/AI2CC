# 青柠蛇场

一个无需后端、可直接在浏览器运行的贪吃蛇项目。核心规则与 Canvas 界面分离，支持键盘、触屏、暂停、重新开始、三种难度和本地最高分。

## 本地访问

在仓库根目录启动现有开发服务：

```bash
npm run dev
```

访问：

```text
http://127.0.0.1:5173/snake-game/
```

## 测试

```bash
npm run test:snake
```

## 目录

- `index.html`：页面结构与可访问语义。
- `styles.css`：响应式视觉和控件状态。
- `game-core.js`：纯函数游戏规则。
- `game.js`：Canvas 渲染、输入和本地存储。
- `game-core.test.js`：核心规则测试。

## 部署边界

当前 Workspace 只承担研发与测试。正式上线时将 `snake-game/` 作为静态站点交付到独立生产环境，不在本仓库会话中直接发布。
