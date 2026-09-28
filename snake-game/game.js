import {
  advanceGame,
  createGame,
  getTickMs,
  MODES,
  queueDirection,
  startGame,
  togglePause,
} from './game-core.js'

const canvas = document.querySelector('#game-canvas')
const context = canvas.getContext('2d')
const overlay = document.querySelector('#game-overlay')
const overlayKicker = document.querySelector('#overlay-kicker')
const overlayTitle = document.querySelector('#overlay-title')
const overlayCopy = document.querySelector('#overlay-copy')
const startButton = document.querySelector('#start-button')
const pauseButton = document.querySelector('#pause-button')
const restartButton = document.querySelector('#restart-button')
const modeSelect = document.querySelector('#mode-select')
const scoreValue = document.querySelector('#score-value')
const bestValue = document.querySelector('#best-value')
const levelValue = document.querySelector('#level-value')
const statusText = document.querySelector('#status-text')
const statusDot = document.querySelector('#status-dot')

const BEST_SCORE_KEY = 'lime-snake:best-scores'
const directionByKey = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
}

let state = createGame({ mode: modeSelect.value })
let timer = null
let bestScores = loadBestScores()

function loadBestScores() {
  try {
    return JSON.parse(localStorage.getItem(BEST_SCORE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function persistBestScore() {
  if (state.score <= (bestScores[state.mode] ?? 0)) return
  bestScores = { ...bestScores, [state.mode]: state.score }
  localStorage.setItem(BEST_SCORE_KEY, JSON.stringify(bestScores))
}

function padScore(value, length = 3) {
  return String(value).padStart(length, '0')
}

function roundedCell(x, y, size, radius) {
  context.beginPath()
  context.roundRect(x, y, size, size, radius)
  context.fill()
}

function drawBoard() {
  const size = canvas.width
  const cellSize = size / state.cols
  context.clearRect(0, 0, size, size)
  context.fillStyle = '#0c140f'
  context.fillRect(0, 0, size, size)

  context.strokeStyle = 'rgba(125, 156, 133, 0.08)'
  context.lineWidth = 1
  for (let index = 1; index < state.cols; index += 1) {
    const coordinate = Math.round(index * cellSize) + 0.5
    context.beginPath()
    context.moveTo(coordinate, 0)
    context.lineTo(coordinate, size)
    context.stroke()
    context.beginPath()
    context.moveTo(0, coordinate)
    context.lineTo(size, coordinate)
    context.stroke()
  }

  if (state.food) {
    const centerX = (state.food.x + 0.5) * cellSize
    const centerY = (state.food.y + 0.54) * cellSize
    context.fillStyle = '#ffc857'
    context.beginPath()
    context.arc(centerX, centerY, cellSize * 0.28, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#9ebc3d'
    context.beginPath()
    context.ellipse(centerX + cellSize * 0.12, centerY - cellSize * 0.28, cellSize * 0.13, cellSize * 0.07, -0.45, 0, Math.PI * 2)
    context.fill()
  }

  state.snake.slice().reverse().forEach((cell, reverseIndex) => {
    const index = state.snake.length - 1 - reverseIndex
    const inset = index === 0 ? cellSize * 0.08 : cellSize * 0.12
    const x = cell.x * cellSize + inset
    const y = cell.y * cellSize + inset
    const segmentSize = cellSize - inset * 2
    context.fillStyle = index === 0 ? '#c8ff63' : `hsl(83 82% ${Math.max(45, 67 - index * 0.6)}%)`
    roundedCell(x, y, segmentSize, cellSize * 0.22)
  })

  drawEyes(cellSize)
}

function drawEyes(cellSize) {
  const head = state.snake[0]
  if (!head) return
  const dx = state.direction.x
  const dy = state.direction.y
  const perpendicular = { x: -dy, y: dx }
  const center = { x: (head.x + 0.5) * cellSize, y: (head.y + 0.5) * cellSize }
  const forward = cellSize * 0.17
  const spread = cellSize * 0.16
  context.fillStyle = '#17220d'

  for (const side of [-1, 1]) {
    context.beginPath()
    context.arc(
      center.x + dx * forward + perpendicular.x * spread * side,
      center.y + dy * forward + perpendicular.y * spread * side,
      Math.max(2, cellSize * 0.055),
      0,
      Math.PI * 2,
    )
    context.fill()
  }
}

function statusLabel() {
  if (state.status === 'running') return `${MODES[state.mode].label}模式进行中`
  if (state.status === 'paused') return '游戏已暂停'
  if (state.status === 'gameover') return '本局已结束'
  if (state.status === 'won') return '棋盘已清空'
  return '等待开始'
}

function updateInterface() {
  scoreValue.textContent = padScore(state.score)
  bestValue.textContent = padScore(Math.max(state.score, bestScores[state.mode] ?? 0))
  levelValue.textContent = padScore(state.level, 2)
  statusText.textContent = statusLabel()
  statusDot.dataset.active = String(state.status === 'running')
  pauseButton.disabled = !['running', 'paused'].includes(state.status)
  pauseButton.textContent = state.status === 'paused' ? '继续游戏' : '暂停游戏'
}

function showOverlay(kind) {
  overlay.hidden = false
  const content = {
    idle: ['准备好了吗？', '从一颗果实开始', '使用方向键或 WASD 控制青柠蛇，连续吃下果实会逐步加速。', '开始游戏'],
    paused: ['休息一下', '游戏已暂停', '当前进度已经保留，准备好后继续。', '继续游戏'],
    gameover: ['本局结束', `得分 ${state.score}`, '碰到边界或蛇身会结束本局。调整节奏，再试一次。', '再来一局'],
    won: ['完成挑战', '棋盘已清空', '你已经占满整块棋盘，这是一场完整胜利。', '重新开始'],
  }[kind]
  ;[overlayKicker.textContent, overlayTitle.textContent, overlayCopy.textContent, startButton.textContent] = content
}

function hideOverlay() {
  overlay.hidden = true
  canvas.focus({ preventScroll: true })
}

function render() {
  drawBoard()
  updateInterface()
}

function clearTimer() {
  if (timer !== null) window.clearTimeout(timer)
  timer = null
}

function scheduleTick() {
  clearTimer()
  if (state.status !== 'running') return
  timer = window.setTimeout(() => {
    state = advanceGame(state)
    persistBestScore()
    render()
    if (state.status === 'gameover') showOverlay('gameover')
    else if (state.status === 'won') showOverlay('won')
    else scheduleTick()
  }, getTickMs(state))
}

function resetGame(autoStart = false) {
  clearTimer()
  state = createGame({ mode: modeSelect.value })
  if (autoStart) {
    state = startGame(state)
    hideOverlay()
    scheduleTick()
  } else {
    showOverlay('idle')
  }
  render()
}

function beginOrResume() {
  if (state.status === 'paused') {
    state = togglePause(state)
  } else if (['idle', 'gameover', 'won'].includes(state.status)) {
    state = startGame(createGame({ mode: modeSelect.value }))
  }
  hideOverlay()
  render()
  scheduleTick()
}

function pauseOrResume() {
  if (!['running', 'paused'].includes(state.status)) return
  state = togglePause(state)
  render()
  if (state.status === 'paused') {
    clearTimer()
    showOverlay('paused')
  } else {
    hideOverlay()
    scheduleTick()
  }
}

function changeDirection(direction) {
  state = queueDirection(state, direction)
}

startButton.addEventListener('click', beginOrResume)
pauseButton.addEventListener('click', pauseOrResume)
restartButton.addEventListener('click', () => resetGame(true))
modeSelect.addEventListener('change', () => resetGame(false))

document.querySelectorAll('[data-direction]').forEach((button) => {
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault()
    changeDirection(button.dataset.direction)
  })
})

window.addEventListener('keydown', (event) => {
  const direction = directionByKey[event.key]
  if (direction) {
    event.preventDefault()
    changeDirection(direction)
    if (state.status === 'idle') beginOrResume()
    return
  }
  if (event.code === 'Space') {
    event.preventDefault()
    pauseOrResume()
  }
  if (event.key === 'r' || event.key === 'R') {
    event.preventDefault()
    resetGame(true)
  }
})

document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.status === 'running') pauseOrResume()
})

window.addEventListener('resize', render)

showOverlay('idle')
render()
