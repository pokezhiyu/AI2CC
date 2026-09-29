---
id: INDEX-WORKSPACE-001
title: "AI2CC Workspace 索引"
type: index
domain: workspace
version: 0.2.0
status: active
owner: product
updated: 2026-09-29
related:
  - PROJECT-OVERVIEW-001
---

# AI2CC Workspace 索引

## Project

青柠蛇场（贪吃蛇小游戏）

## Current Version

V1 初始阶段

## Current Goal

建立项目的首批有效知识，并形成 Human 与 Agent 可以共同维护的工作上下文。

## Current Status

Workspace 已初始化。各专业 Space 已就绪，具体项目知识将随工作持续补充。

## Active Requirements

从产品空间中的需求文档按需加载。

## Architecture

从技术空间中的技术架构按需加载。

## Important Decisions

从技术空间中的技术决策按需加载。

## Engineering Rules

先读取 Manifest、Agent Protocol、Harness 与 Project Harness，再按任务加载相关知识。

## Roles

从 Role Registry 与 Active Roles 获取当前角色上下文。

## Recently Changed

- 2026-09-28：完成 Workspace 初始化。
- 2026-09-29：设计空间动态交互纳入 Project Harness，交互展示须直接渲染在对应 Markdown 文档中。
