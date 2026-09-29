---
id: HARNESS-PROJECT-001
title: "青柠蛇场 Project Harness"
type: harness-project
domain: workspace
version: 0.3.0
status: active
owner: engineering
updated: 2026-09-29
related:
  - INDEX-WORKSPACE-001
  - HARNESS-DESIGN-INTERACTION-001
  - HARNESS-LOCAL-DOCUMENT-SYNC-001
---

# 青柠蛇场 Project Harness

## 项目身份

青柠蛇场（贪吃蛇小游戏）

## 项目规则扩展

### 设计空间动态交互

凡用于展示页面交互、用户流程、状态变化、原型行为或信息结构的设计成果，必须直接显示在对应设计空间 Markdown 文档的阅读模式中。独立页面、静态截图或普通流程图不能替代文档内动态展示。

完整规则与完成检查见 [Design Document Interaction](design-document-interaction.md)。

### 本地文档与页面实时同步

每次项目内容变更必须同步至对应本地文档；用户已打开的 Workspace 应自动读取并显示新内容。浏览器缓存、聊天结果、独立预览或 Git 提交不能替代本地文件与当前阅读页的一致性。存在未保存编辑或并发修改时，保留版本并显式提示冲突。

完整规则见 [Local Document Sync](local-document-sync.md)。

后续如需增加 API、数据库、测试、安全或发布规则，应作为明确的项目规则变更写入本文件或同目录的项目规则文件，并进入 Git 历史。不得在普通开发任务中静默修改 Harness。
