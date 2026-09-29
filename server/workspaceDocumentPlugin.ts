import { createHash, randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { readWorkspaceSnapshot } from './workspaceGitPlugin.ts'
import { RoleAccessService } from '../src/features/roles/RoleAccessService.ts'

function json(response: ServerResponse, status: number, value: unknown): void {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  response.end(JSON.stringify(value))
}

export function workspaceDocumentPlugin(projectRoot: string): Plugin {
  const root = path.resolve(projectRoot, 'workspace-template')
  // Serialize read/compare/write operations from multiple browser tabs.
  let pending: Promise<void> = Promise.resolve()
  const middleware = (request: IncomingMessage, response: ServerResponse, next: () => void): void => {
    const pathname = request.url?.split('?')[0]
    if (!pathname?.startsWith('/api/workspace/')) return next()
    pending = pending.then(async () => {
      try {
        if (request.headers.origin && new URL(request.headers.origin).host !== request.headers.host) {
          return json(response, 403, { error: '仅允许当前 Workspace 页面访问本地文档。' })
        }
        const entries = (await readWorkspaceSnapshot(projectRoot))
          .filter((entry) => !entry.path.startsWith('.workspace/skills/installed/'))
        if (pathname === '/api/workspace/snapshot' && request.method === 'GET') {
          const revision = createHash('sha256').update(JSON.stringify(entries
            .filter((entry) => entry.kind === 'file')
            .map(({ path, content }) => [path, content]).sort())).digest('hex')
          response.setHeader('ETag', `"${revision}"`)
          if (request.headers['if-none-match'] === `"${revision}"`) {
            response.writeHead(304, { 'Cache-Control': 'no-store' })
            response.end()
            return
          }
          return json(response, 200, { entries, revision })
        }
        if (pathname !== '/api/workspace/document' || request.method !== 'POST') {
          return json(response, 404, { error: '未知本地文档操作。' })
        }
        if (!request.headers['content-type']?.startsWith('application/json')) {
          return json(response, 415, { error: '仅支持 JSON 文档请求。' })
        }
        let body = ''
        for await (const chunk of request) {
          body += String(chunk)
          if (Buffer.byteLength(body) > 2 * 1024 * 1024) throw new Error('文档超过 2 MB 保存上限。')
        }
        const input = JSON.parse(body) as { path?: unknown; content?: unknown; expectedContent?: unknown }
        if (typeof input.path !== 'string' || typeof input.content !== 'string'
          || !(input.expectedContent === null || typeof input.expectedContent === 'string')) {
          return json(response, 400, { error: '缺少文档内容或原始版本。' })
        }
        const relative = input.path
        if (relative.includes('\\') || relative.split('/').some((part) => !part || part.startsWith('.')) || !relative.endsWith('.md')) {
          return json(response, 400, { error: '不支持的专业文档路径。' })
        }
        const access = new RoleAccessService({ list: async () => entries })
        if (!access.canWritePath(relative, entries)) {
          return json(response, 403, { error: access.denialForPath(relative, entries).message })
        }
        const target = path.resolve(root, relative)
        // Reject symlink ancestors and symlink targets, including newly created paths.
        let current = root
        for (const part of relative.split('/')) {
          current = path.join(current, part)
          const stat = await fs.lstat(current).catch((error: NodeJS.ErrnoException) => {
            if (error.code !== 'ENOENT') throw error
            return null
          })
          if (stat?.isSymbolicLink()) return json(response, 400, { error: '不能通过符号链接写入文档。' })
        }
        const previous = await fs.readFile(target, 'utf8').catch((error: NodeJS.ErrnoException) => {
          if (error.code !== 'ENOENT') throw error
          return null
        })
        if (previous !== input.expectedContent) {
          return json(response, 409, { error: '本地文件已被其他人或 Agent 修改。你的编辑已保留，请对比后合并。' })
        }
        await fs.mkdir(path.dirname(target), { recursive: true })
        const temporary = `${target}.${randomUUID()}.tmp`
        try {
          await fs.writeFile(temporary, input.content, 'utf8')
          await fs.rename(temporary, target)
        } finally {
          await fs.unlink(temporary).catch(() => undefined)
        }
        json(response, 200, { saved: true })
      } catch (error) {
        json(response, 500, { error: error instanceof Error ? error.message : '本地文档同步失败。' })
      }
    }).catch(() => undefined)
  }
  return {
    name: 'workspace-local-documents',
    configureServer(server) { server.middlewares.use(middleware) },
    configurePreviewServer(server) { server.middlewares.use(middleware) },
    // Documents update through the live snapshot, preserving unsaved editor text.
    handleHotUpdate(context) {
      if (context.file.replaceAll('\\', '/').startsWith(`${root.replaceAll('\\', '/')}/`)) return []
    },
  }
}
