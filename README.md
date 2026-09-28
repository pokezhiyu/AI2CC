# 青柠蛇场

青柠蛇场是一个无需后端、可直接在浏览器运行的轻量贪吃蛇项目。项目支持键盘、WASD 与触屏方向控制，提供轻松、经典、极速三种模式，并在本地保存各模式最高分。

本仓库同时使用 AI Coding Workspace 记录产品、设计、技术、测试和运维资料。代码是可运行交付物，`workspace-template/` 中的 Markdown 文档是供 Human 与 Agent 长期协作的项目知识，两者通过 Git 一起维护。

## 已实现功能

- 24 × 24 方格棋盘与经典贪吃蛇规则
- 果实随机生成、蛇身增长、计分、升级与逐级加速
- 轻松、经典、极速三种游戏模式
- 方向键、WASD、空格暂停、`R` 键重新开始
- 移动端触屏方向键
- 按游戏模式保存本地最高分
- 页面切换到后台时自动暂停
- 响应式布局、键盘焦点和减少动态效果支持

## 技术方案

游戏使用原生 HTML、CSS、JavaScript 和 Canvas 实现，不依赖后端服务。

- `snake-game/game-core.js`：游戏状态、移动、碰撞、成长、计分和模式规则
- `snake-game/game.js`：Canvas 渲染、输入控制、定时调度和本地最高分
- `snake-game/index.html`：游戏页面结构与可访问语义
- `snake-game/styles.css`：视觉样式、响应式布局和控件状态
- `snake-game/game-core.test.js`：核心规则测试文件

Workspace 管理界面使用 Vue 3、TypeScript、Vite、Pinia 和 Vue Router，用于维护跨角色项目资料及本地预览。

## 环境要求

- Node.js 22.12 或更高版本
- npm
- Git

可使用以下命令检查本机环境：

```bash
node --version
npm --version
git --version
```

## 获取项目

```bash
git clone https://github.com/pokezhiyu/AI2CC.git
cd AI2CC
```

## 安装依赖

为保证依赖版本与锁文件一致，推荐使用：

```bash
npm ci
```

如果需要更新依赖，可改用：

```bash
npm install
```

## 本地启动

启动开发服务：

```bash
npm run dev -- --host 127.0.0.1
```

启动后访问：

- 贪吃蛇游戏：<http://127.0.0.1:5173/snake-game/>
- 项目 Workspace：<http://127.0.0.1:5173/>

如果当前 Windows 环境运行最新版 Vite 时出现原生构建进程内存不足，可使用已经验证过的兼容启动方式：

```bash
npm exec --yes --package=vite@7.2.2 -- vite --host 127.0.0.1
```

## 常用命令

```bash
# 启动开发服务
npm run dev

# 构建生产静态资源
npm run build

# 预览生产构建
npm run preview -- --host 127.0.0.1

# TypeScript 类型检查
npm run typecheck

# 运行贪吃蛇核心规则测试
npm run test:snake

# 将真实源码同步成技术空间中的 Markdown 备份
npm run sync:code-backups
```

## 项目结构

```text
snake-game/                          贪吃蛇可运行源码
workspace-template/产品空间/         产品愿景、需求与迭代计划
workspace-template/设计空间/         交互与 UI 设计资料
workspace-template/技术空间/         架构、ADR、实现说明和源码备份
workspace-template/测试空间/         测试计划、用例与验收记录
workspace-template/运维空间/         环境、部署与发布记录
src/                                 Workspace 管理界面源码
server/                              本地 Git 与 Skill 服务
scripts/                             校验和源码备份同步脚本
```

## 代码与文档协同约定

- 可运行代码以 `snake-game/` 为准。
- 技术空间的源码备份用于 Agent 阅读和长期项目记录，不替代真实源码。
- 代码变化后运行 `npm run sync:code-backups`，再同时提交源码和生成的 Markdown。
- 产品范围、设计决策、架构变化、测试结论和部署方式分别写入对应专业空间。
- Git 保存版本历史；当前有效的项目事实应保存在仓库文件中，而不是只留在聊天记录里。

## 部署边界

当前仓库和 Workspace 用于研发、记录、协作与本地测试，不是正式生产环境。

正式上线时可将 `snake-game/` 作为纯静态站点部署到独立 Web Server 或静态托管平台。V1 不需要业务 API、数据库、账号系统或云端存储；如以后增加远程排行榜，需要先补充产品需求、隐私设计、后端架构与技术决策记录。
