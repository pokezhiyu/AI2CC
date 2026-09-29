import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { workspaceGitPlugin } from './server/workspaceGitPlugin.ts'
import { workspaceSkillPlugin } from './server/workspaceSkillPlugin.ts'
import { workspaceDocumentPlugin } from './server/workspaceDocumentPlugin.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const projectRoot = process.cwd()
  const workspaceGitRoot = env.WORKSPACE_GIT_ROOT ? path.resolve(env.WORKSPACE_GIT_ROOT) : projectRoot
  return {
    plugins: [vue(), tailwindcss(), workspaceDocumentPlugin(projectRoot), workspaceGitPlugin(workspaceGitRoot), workspaceSkillPlugin(projectRoot)],
    optimizeDeps: {
      exclude: ['mermaid'],
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        buffer: fileURLToPath(new URL('./node_modules/buffer/index.js', import.meta.url)),
      },
    },
  }
})
