interface InteractiveFlowStep {
  label: string
  owner?: string
  description?: string
  output?: string
  done?: string
}

interface InteractiveFlowConfig {
  title?: string
  description?: string
  autoplayMs?: number
  steps: InteractiveFlowStep[]
}

interface InteractiveMindBranch {
  label: string
  summary?: string
  items?: string[]
}

interface InteractiveMindmapConfig {
  title?: string
  description?: string
  center?: string
  branches: InteractiveMindBranch[]
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function button(className: string, text: string): HTMLButtonElement {
  const node = element('button', className, text)
  node.type = 'button'
  return node
}

function decodeConfig<T>(container: HTMLElement): T {
  return JSON.parse(decodeURIComponent(container.dataset.config ?? '')) as T
}

function clampAutoplay(value: number | undefined): number {
  if (!Number.isFinite(value)) return 2800
  return Math.min(10_000, Math.max(1400, value ?? 2800))
}

function renderConfigurationError(container: HTMLElement): () => void {
  container.classList.add('interactive-document--error')
  container.textContent = '互动内容配置无法解析，请切换到编辑模式检查 JSON。'
  return () => undefined
}

function mountFlow(container: HTMLElement): () => void {
  let config: InteractiveFlowConfig
  try {
    config = decodeConfig<InteractiveFlowConfig>(container)
  } catch {
    return renderConfigurationError(container)
  }

  const steps = Array.isArray(config.steps)
    ? config.steps.filter((step) => typeof step?.label === 'string' && step.label.trim())
    : []
  if (!steps.length) return renderConfigurationError(container)

  container.classList.add('interactive-document', 'interactive-flow')
  container.replaceChildren()

  const header = element('header', 'interactive-document__header')
  const headingCopy = element('div', 'interactive-document__heading')
  headingCopy.append(
    element('span', 'interactive-document__kind', '点击演示'),
    element('h3', '', config.title || '交互流程'),
  )
  if (config.description) headingCopy.append(element('p', '', config.description))

  const controls = element('div', 'interactive-document__controls')
  const previous = button('interactive-control', '上一步')
  const autoplay = button('interactive-control interactive-control--primary', '自动演示')
  const next = button('interactive-control', '下一步')
  controls.append(previous, autoplay, next)
  header.append(headingCopy, controls)

  const track = element('div', 'interactive-flow__track')
  track.setAttribute('role', 'tablist')
  track.setAttribute('aria-label', config.title || '交互流程步骤')
  const stepButtons = steps.map((step, index) => {
    const stepButton = button('interactive-flow__step', '')
    stepButton.setAttribute('role', 'tab')
    stepButton.setAttribute('aria-label', `${index + 1}. ${step.label}`)
    stepButton.append(
      element('span', 'interactive-flow__number', String(index + 1).padStart(2, '0')),
      element('strong', '', step.label),
      element('small', '', step.owner || '查看阶段说明'),
    )
    track.append(stepButton)
    return stepButton
  })
  track.style.gridTemplateColumns = `repeat(${steps.length}, minmax(132px, 1fr))`

  const progress = element('div', 'interactive-flow__progress')
  progress.setAttribute('aria-hidden', 'true')
  const progressValue = element('span')
  progress.append(progressValue)

  const detail = element('article', 'interactive-flow__detail')
  const detailIndex = element('div', 'interactive-flow__detail-index')
  const detailCopy = element('div', 'interactive-flow__detail-copy')
  const detailOwner = element('span')
  const detailTitle = element('h4')
  const detailDescription = element('p')
  detailCopy.append(detailOwner, detailTitle, detailDescription)
  const facts = element('dl', 'interactive-flow__facts')
  const outputRow = element('div')
  const outputValue = element('dd')
  outputRow.append(element('dt', '', '阶段产出'), outputValue)
  const doneRow = element('div')
  const doneValue = element('dd')
  doneRow.append(element('dt', '', '完成条件'), doneValue)
  facts.append(outputRow, doneRow)
  detail.append(detailIndex, detailCopy, facts)

  const liveStatus = element('span', 'sr-only')
  liveStatus.setAttribute('aria-live', 'polite')
  container.append(header, track, progress, detail, liveStatus)

  let activeIndex = 0
  let timer: number | null = null

  function stopAutoplay(): void {
    if (timer !== null) window.clearInterval(timer)
    timer = null
    autoplay.textContent = activeIndex === steps.length - 1 ? '重新演示' : '自动演示'
    autoplay.setAttribute('aria-pressed', 'false')
  }

  function render(index: number, announce = true): void {
    activeIndex = Math.min(steps.length - 1, Math.max(0, index))
    const step = steps[activeIndex]
    if (!step) return
    stepButtons.forEach((stepButton, buttonIndex) => {
      stepButton.dataset.state = buttonIndex < activeIndex ? 'complete' : buttonIndex === activeIndex ? 'active' : 'upcoming'
      stepButton.setAttribute('aria-selected', String(buttonIndex === activeIndex))
      stepButton.tabIndex = buttonIndex === activeIndex ? 0 : -1
    })
    detailIndex.textContent = String(activeIndex + 1).padStart(2, '0')
    detailOwner.textContent = step.owner || `步骤 ${activeIndex + 1}`
    detailTitle.textContent = step.label
    detailDescription.textContent = step.description || '查看该阶段的主要任务与交付结果。'
    outputValue.textContent = step.output || '—'
    doneValue.textContent = step.done || '—'
    previous.disabled = activeIndex === 0
    next.textContent = activeIndex === steps.length - 1 ? '回到起点' : '下一步'
    progressValue.style.width = `${((activeIndex + 1) / steps.length) * 100}%`
    detail.classList.remove('is-updating')
    void detail.offsetWidth
    detail.classList.add('is-updating')
    if (announce) liveStatus.textContent = `当前步骤：${step.label}，${activeIndex + 1} / ${steps.length}`
  }

  function startAutoplay(): void {
    if (activeIndex === steps.length - 1) render(0)
    autoplay.textContent = '暂停演示'
    autoplay.setAttribute('aria-pressed', 'true')
    timer = window.setInterval(() => {
      if (activeIndex >= steps.length - 1) {
        stopAutoplay()
        return
      }
      render(activeIndex + 1)
    }, clampAutoplay(config.autoplayMs))
  }

  const listeners: Array<() => void> = []
  stepButtons.forEach((stepButton, index) => {
    const select = () => {
      stopAutoplay()
      render(index)
    }
    const navigate = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      const offset = event.key === 'ArrowRight' ? 1 : -1
      const nextIndex = (index + offset + steps.length) % steps.length
      stopAutoplay()
      render(nextIndex)
      stepButtons[nextIndex]?.focus()
    }
    stepButton.addEventListener('click', select)
    stepButton.addEventListener('keydown', navigate)
    listeners.push(() => {
      stepButton.removeEventListener('click', select)
      stepButton.removeEventListener('keydown', navigate)
    })
  })

  const showPrevious = () => {
    stopAutoplay()
    render(activeIndex - 1)
  }
  const showNext = () => {
    stopAutoplay()
    render(activeIndex === steps.length - 1 ? 0 : activeIndex + 1)
  }
  const toggleAutoplay = () => timer === null ? startAutoplay() : stopAutoplay()
  previous.addEventListener('click', showPrevious)
  next.addEventListener('click', showNext)
  autoplay.addEventListener('click', toggleAutoplay)
  listeners.push(() => previous.removeEventListener('click', showPrevious))
  listeners.push(() => next.removeEventListener('click', showNext))
  listeners.push(() => autoplay.removeEventListener('click', toggleAutoplay))

  render(0, false)
  return () => {
    stopAutoplay()
    listeners.forEach((remove) => remove())
  }
}

function mountMindmap(container: HTMLElement): () => void {
  let config: InteractiveMindmapConfig
  try {
    config = decodeConfig<InteractiveMindmapConfig>(container)
  } catch {
    return renderConfigurationError(container)
  }

  const branches = Array.isArray(config.branches)
    ? config.branches.filter((branch) => typeof branch?.label === 'string' && branch.label.trim())
    : []
  if (!branches.length) return renderConfigurationError(container)

  container.classList.add('interactive-document', 'interactive-mindmap')
  container.replaceChildren()
  const header = element('header', 'interactive-document__header')
  const headingCopy = element('div', 'interactive-document__heading')
  headingCopy.append(
    element('span', 'interactive-document__kind', '点击分支'),
    element('h3', '', config.title || '交互思维导图'),
  )
  if (config.description) headingCopy.append(element('p', '', config.description))
  header.append(headingCopy)

  const canvas = element('div', 'interactive-mindmap__canvas')
  const core = element('div', 'interactive-mindmap__core')
  core.append(element('span', '', '项目核心'), element('strong', '', config.center || '当前项目'))
  const branchList = element('div', 'interactive-mindmap__branches')
  branchList.setAttribute('role', 'tablist')
  branchList.setAttribute('aria-label', config.title || '思维导图分支')
  const branchButtons = branches.map((branch) => {
    const branchButton = button('interactive-mindmap__branch', '')
    branchButton.setAttribute('role', 'tab')
    branchButton.append(element('strong', '', branch.label), element('small', '', branch.summary || '查看分支内容'))
    branchList.append(branchButton)
    return branchButton
  })
  canvas.append(core, branchList)

  const detail = element('article', 'interactive-mindmap__detail')
  const detailLabel = element('span')
  const detailTitle = element('h4')
  const detailList = element('ul')
  detail.append(detailLabel, detailTitle, detailList)
  const liveStatus = element('span', 'sr-only')
  liveStatus.setAttribute('aria-live', 'polite')
  container.append(header, canvas, detail, liveStatus)

  let activeIndex = 0
  function render(index: number, announce = true): void {
    activeIndex = index
    const branch = branches[index]
    if (!branch) return
    branchButtons.forEach((branchButton, buttonIndex) => {
      branchButton.setAttribute('aria-selected', String(buttonIndex === activeIndex))
      branchButton.tabIndex = buttonIndex === activeIndex ? 0 : -1
    })
    detailLabel.textContent = `${String(index + 1).padStart(2, '0')} / ${String(branches.length).padStart(2, '0')}`
    detailTitle.textContent = branch.label
    const items = Array.isArray(branch.items) ? branch.items.filter((item) => typeof item === 'string') : []
    detailList.replaceChildren(...items.map((item) => element('li', '', item)))
    detail.classList.remove('is-updating')
    void detail.offsetWidth
    detail.classList.add('is-updating')
    if (announce) liveStatus.textContent = `当前分支：${branch.label}`
  }

  const listeners: Array<() => void> = []
  branchButtons.forEach((branchButton, index) => {
    const select = () => render(index)
    const navigate = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      const offset = event.key === 'ArrowRight' ? 1 : -1
      const nextIndex = (index + offset + branches.length) % branches.length
      render(nextIndex)
      branchButtons[nextIndex]?.focus()
    }
    branchButton.addEventListener('click', select)
    branchButton.addEventListener('keydown', navigate)
    listeners.push(() => {
      branchButton.removeEventListener('click', select)
      branchButton.removeEventListener('keydown', navigate)
    })
  })
  render(0, false)
  return () => listeners.forEach((remove) => remove())
}

export function mountInteractiveDocuments(root: HTMLElement): () => void {
  const cleanups = [...root.querySelectorAll<HTMLElement>('[data-interactive-kind]')].map((container) => {
    if (container.dataset.interactiveKind === 'flow') return mountFlow(container)
    if (container.dataset.interactiveKind === 'mindmap') return mountMindmap(container)
    return renderConfigurationError(container)
  })
  return () => cleanups.forEach((cleanup) => cleanup())
}
