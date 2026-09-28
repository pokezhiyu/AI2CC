const stages = [
  {
    owner: '产品空间 · 产品经理',
    title: '产品定义',
    copy: '先回答为谁做、解决什么问题，以及 V1 明确不做什么。范围稳定后，后续角色才有统一的判断依据。',
    output: '产品愿景、V1 范围、验收口径',
    done: '目标用户、核心价值和范围边界可复述',
  },
  {
    owner: '产品空间 · 产品经理',
    title: '玩法设计',
    copy: '把“贪吃蛇”拆成可执行规则：移动、转向、成长、计分、加速、碰撞，以及三种模式的差异。',
    output: '核心玩法需求与状态规则',
    done: '每种输入和游戏结果都有明确规则',
  },
  {
    owner: '设计空间 · UI/UX 设计师',
    title: '视觉交互',
    copy: '确定棋盘、信息层级、游戏状态和输入反馈，让桌面键盘与移动端触屏都能清楚操作。',
    output: '页面结构、视觉规范、交互状态',
    done: '开始、暂停、失败与重开均有明确反馈',
  },
  {
    owner: '技术空间 · 开发工程师',
    title: '核心开发',
    copy: '用纯函数维护规则，用 Canvas 承担渲染。界面输入与游戏状态分离，让行为可追踪、可扩展。',
    output: 'game-core.js、game.js 与页面样式',
    done: '三种模式均可完整进行一局游戏',
  },
  {
    owner: '测试空间 · QA 工程师',
    title: '体验验证',
    copy: '核对转向、碰撞、得分、速度、触屏和响应式布局，并记录能够复现的验收结论。',
    output: '测试用例、缺陷记录、验收结果',
    done: '阻断玩法的问题归零，范围内需求可验收',
  },
  {
    owner: '运维空间 · 运维工程师',
    title: '发布准备',
    copy: '将静态游戏从研发 Workspace 独立交付，记录构建、部署、回滚和正式环境边界。',
    output: '部署说明、发布清单、版本记录',
    done: '静态资源可在独立环境访问并可回滚',
  },
]

const mindBranches = {
  play: {
    label: '玩法系统',
    title: '一眼理解，一步学会。',
    copy: '蛇持续移动；玩家只改变方向。吃到果实后增长并得分，碰墙或碰到自己结束。',
    items: ['三种模式共享同一套核心状态', '果实不会生成在蛇身上', '禁止直接反向移动'],
  },
  experience: {
    label: '玩家体验',
    title: '每次操作都得到立即回应。',
    copy: '键盘、WASD 和触屏按钮使用同一套方向命令，暂停、失败和重开保持一致的文字与视觉反馈。',
    items: ['游戏状态始终可见', '页面进入后台时自动暂停', '窄屏保持可操作的触控区域'],
  },
  tech: {
    label: '技术实现',
    title: '规则与画面彼此独立。',
    copy: '核心模块只计算状态，界面模块负责输入、计时和绘制；本地最高分不依赖账号或服务器。',
    items: ['原生 JavaScript 与 Canvas', '纯函数规则便于验证', 'localStorage 按模式保存最高分'],
  },
  delivery: {
    label: '协作交付',
    title: '代码、知识和版本一起前进。',
    copy: '各角色把决策写入对应 Workspace，真实代码保存在 snake-game，Git 记录所有可交接的变化。',
    items: ['产品、设计、技术、测试、运维分区记录', '源码快照由脚本同步', '正式环境与研发会话分离'],
  },
}

const beginButton = document.querySelector('#begin-build')
const nextButton = document.querySelector('#next-stage')
const status = document.querySelector('#build-status')
const counter = document.querySelector('#stage-counter')
const stageNodes = [...document.querySelectorAll('.stage-node')]
const mindButtons = [...document.querySelectorAll('.mind-branch')]
let activeStage = -1

function renderStage(index) {
  const stage = stages[index]
  activeStage = index
  document.querySelector('#stage-index').textContent = String(index + 1).padStart(2, '0')
  document.querySelector('#stage-owner').textContent = stage.owner
  document.querySelector('#stage-title').textContent = stage.title
  document.querySelector('#stage-copy').textContent = stage.copy
  document.querySelector('#stage-output').textContent = stage.output
  document.querySelector('#stage-done').textContent = stage.done
  status.textContent = `正在查看：${stage.title}`
  counter.textContent = `${index + 1} / ${stages.length}`
  nextButton.disabled = false
  nextButton.textContent = index === stages.length - 1 ? '回到第一阶段' : '进入下一阶段'

  stageNodes.forEach((node, nodeIndex) => {
    node.classList.toggle('is-active', nodeIndex === index)
    node.classList.toggle('is-complete', nodeIndex < index)
    if (nodeIndex === index) node.setAttribute('aria-current', 'step')
    else node.removeAttribute('aria-current')
  })
}

function renderMind(key) {
  const branch = mindBranches[key]
  document.querySelector('#mind-label').textContent = branch.label
  document.querySelector('#mind-title').textContent = branch.title
  document.querySelector('#mind-copy').textContent = branch.copy
  document.querySelector('#mind-items').replaceChildren(...branch.items.map((item) => {
    const entry = document.createElement('li')
    entry.textContent = item
    return entry
  }))
  mindButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.mind === key)))
}

beginButton.addEventListener('click', () => {
  renderStage(0)
  beginButton.textContent = '从第一阶段重看'
  document.querySelector('#workflow').scrollIntoView({ behavior: 'smooth', block: 'start' })
})

nextButton.addEventListener('click', () => renderStage((activeStage + 1) % stages.length))
stageNodes.forEach((node) => node.addEventListener('click', () => renderStage(Number(node.dataset.stage))))
mindButtons.forEach((button) => button.addEventListener('click', () => renderMind(button.dataset.mind)))

