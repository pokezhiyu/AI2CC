import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const backupRoot = path.join(repositoryRoot, 'workspace-template', '技术空间', '前端', '源码备份')
const updated = new Date().toISOString().slice(0, 10)

const snapshots = [
  {
    id: 'ENGINEERING-SOURCE-SNAKE-HTML',
    title: 'index.html 源码快照',
    sourcePath: 'snake-game/index.html',
    targetName: 'index.html.md',
    language: 'html',
    responsibility: '页面语义结构、游戏信息层级与可访问入口。',
  },
  {
    id: 'ENGINEERING-SOURCE-SNAKE-CSS',
    title: 'styles.css 源码快照',
    sourcePath: 'snake-game/styles.css',
    targetName: 'styles.css.md',
    language: 'css',
    responsibility: '设计 Token、响应式布局、控件状态与减少动态效果适配。',
  },
  {
    id: 'ENGINEERING-SOURCE-SNAKE-CORE',
    title: 'game-core.js 源码快照',
    sourcePath: 'snake-game/game-core.js',
    targetName: 'game-core.js.md',
    language: 'javascript',
    responsibility: '无 DOM 依赖的游戏状态、移动、碰撞、得分和模式规则。',
  },
  {
    id: 'ENGINEERING-SOURCE-SNAKE-UI',
    title: 'game.js 源码快照',
    sourcePath: 'snake-game/game.js',
    targetName: 'game.js.md',
    language: 'javascript',
    responsibility: 'Canvas 渲染、键盘与触屏输入、计时、本地最高分和界面状态。',
  },
  {
    id: 'ENGINEERING-SOURCE-SNAKE-TEST',
    title: 'game-core.test.js 源码快照',
    sourcePath: 'snake-game/game-core.test.js',
    targetName: 'game-core.test.js.md',
    language: 'javascript',
    responsibility: '核心规则的 Node.js 自动化测试代码。测试策略和结果仍由测试空间维护。',
  },
]

function yamlString(value) {
  return JSON.stringify(value)
}

function snapshotDocument(snapshot, source) {
  return `---
id: ${snapshot.id}
title: ${yamlString(snapshot.title)}
type: source-snapshot
domain: engineering
version: 0.1.0
status: active
owner: engineering
updated: ${updated}
sourcePath: ${yamlString(snapshot.sourcePath)}
generatedBy: ${yamlString('scripts/sync-code-backups.mjs')}
related:
  - ENGINEERING-SOURCE-SNAKE-INDEX
  - ENGINEERING-ARCH-SNAKE-001
---

# ${snapshot.title}

> 本文档是 \`${snapshot.sourcePath}\` 的生成式完整快照，用于 Workspace 内阅读、Agent 上下文加载和 Git 协作交接。可执行源码是唯一实现事实来源，请勿直接编辑代码块；修改源码后运行 \`npm run sync:code-backups\` 重新生成。

## 文件职责

${snapshot.responsibility}

## 同步约定

- **唯一真源**：\`${snapshot.sourcePath}\`
- **生成器**：\`scripts/sync-code-backups.mjs\`
- **重新生成**：\`npm run sync:code-backups\`
- **版本历史**：由 Git 保存，不在文件名中维护版本号

## 完整源码

\`\`\`${snapshot.language}
${source.trimEnd()}
\`\`\`
`
}

await mkdir(backupRoot, { recursive: true })

for (const snapshot of snapshots) {
  const source = await readFile(path.join(repositoryRoot, snapshot.sourcePath), 'utf8')
  const destination = path.join(backupRoot, snapshot.targetName)
  await writeFile(destination, snapshotDocument(snapshot, source), 'utf8')
}

console.log(`Synced ${snapshots.length} source snapshots to ${path.relative(repositoryRoot, backupRoot)}`)
