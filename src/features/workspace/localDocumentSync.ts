import type { WorkspaceEntry } from '@/types/workspace'

export interface LocalDocumentSnapshot {
  revision: string
  entries: WorkspaceEntry[]
}

export async function readLocalDocuments(revision = ''): Promise<LocalDocumentSnapshot | null> {
  const response = await fetch('/api/workspace/snapshot', {
    headers: revision ? { 'If-None-Match': `"${revision}"` } : {},
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  })
  if (response.status === 304) return null
  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('本地文档服务不可用，请检查项目服务是否启动。')
  }
  return response.json() as Promise<LocalDocumentSnapshot>
}

export async function writeLocalDocument(path: string, content: string, expectedContent: string | null): Promise<void> {
  const response = await fetch('/api/workspace/document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content, expectedContent }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('本地文件未保存：请通过本地项目服务打开 Workspace。')
  }
  const result = await response.json() as { error?: string }
  if (!response.ok) throw new Error(result.error || '本地文档保存失败，编辑内容已保留。')
}
