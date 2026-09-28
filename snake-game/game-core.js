export const DIRECTIONS = Object.freeze({
  up: Object.freeze({ x: 0, y: -1 }),
  down: Object.freeze({ x: 0, y: 1 }),
  left: Object.freeze({ x: -1, y: 0 }),
  right: Object.freeze({ x: 1, y: 0 }),
})

export const MODES = Object.freeze({
  relaxed: Object.freeze({ id: 'relaxed', label: '轻松', wrap: true, baseTick: 142, minTick: 86, points: 5 }),
  classic: Object.freeze({ id: 'classic', label: '经典', wrap: false, baseTick: 108, minTick: 58, points: 10 }),
  sprint: Object.freeze({ id: 'sprint', label: '极速', wrap: false, baseTick: 76, minTick: 42, points: 15 }),
})

function sameCell(a, b) {
  return a.x === b.x && a.y === b.y
}

function isOpposite(a, b) {
  return a.x + b.x === 0 && a.y + b.y === 0
}

function randomIndex(length, random) {
  return Math.min(length - 1, Math.max(0, Math.floor(random() * length)))
}

export function spawnFood({ cols, rows, snake }, random = Math.random) {
  const occupied = new Set(snake.map(({ x, y }) => `${x}:${y}`))
  const freeCells = []

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (!occupied.has(`${x}:${y}`)) freeCells.push({ x, y })
    }
  }

  return freeCells.length ? freeCells[randomIndex(freeCells.length, random)] : null
}

export function createGame({ cols = 24, rows = 24, mode = 'classic', random = Math.random } = {}) {
  const selectedMode = MODES[mode] ?? MODES.classic
  const headX = Math.max(4, Math.floor(cols / 2))
  const headY = Math.floor(rows / 2)
  const snake = [0, 1, 2, 3].map((offset) => ({ x: headX - offset, y: headY }))
  const state = {
    cols,
    rows,
    mode: selectedMode.id,
    snake,
    direction: DIRECTIONS.right,
    pendingDirection: DIRECTIONS.right,
    food: null,
    score: 0,
    foodsEaten: 0,
    level: 1,
    moves: 0,
    status: 'idle',
    lastEvent: 'ready',
  }

  return { ...state, food: spawnFood(state, random) }
}

export function startGame(state) {
  if (state.status === 'running') return state
  return { ...state, status: 'running', lastEvent: 'started' }
}

export function togglePause(state) {
  if (state.status === 'running') return { ...state, status: 'paused', lastEvent: 'paused' }
  if (state.status === 'paused') return { ...state, status: 'running', lastEvent: 'resumed' }
  return state
}

export function queueDirection(state, directionName) {
  const nextDirection = DIRECTIONS[directionName]
  if (!nextDirection || isOpposite(state.direction, nextDirection)) return state
  return { ...state, pendingDirection: nextDirection }
}

export function getTickMs(state) {
  const mode = MODES[state.mode] ?? MODES.classic
  return Math.max(mode.minTick, mode.baseTick - (state.level - 1) * 8)
}

export function advanceGame(state, random = Math.random) {
  if (state.status !== 'running' || !state.food) return state

  const mode = MODES[state.mode] ?? MODES.classic
  const direction = state.pendingDirection
  const currentHead = state.snake[0]
  let nextHead = {
    x: currentHead.x + direction.x,
    y: currentHead.y + direction.y,
  }

  if (mode.wrap) {
    nextHead = {
      x: (nextHead.x + state.cols) % state.cols,
      y: (nextHead.y + state.rows) % state.rows,
    }
  } else if (nextHead.x < 0 || nextHead.x >= state.cols || nextHead.y < 0 || nextHead.y >= state.rows) {
    return { ...state, direction, status: 'gameover', lastEvent: 'wall-collision' }
  }

  const ateFood = sameCell(nextHead, state.food)
  const collisionBody = ateFood ? state.snake : state.snake.slice(0, -1)
  if (collisionBody.some((cell) => sameCell(cell, nextHead))) {
    return { ...state, direction, status: 'gameover', lastEvent: 'self-collision' }
  }

  const snake = ateFood
    ? [nextHead, ...state.snake]
    : [nextHead, ...state.snake.slice(0, -1)]
  const foodsEaten = state.foodsEaten + (ateFood ? 1 : 0)
  const score = state.score + (ateFood ? mode.points : 0)
  const level = 1 + Math.floor(foodsEaten / 5)
  const nextState = {
    ...state,
    snake,
    direction,
    pendingDirection: direction,
    score,
    foodsEaten,
    level,
    moves: state.moves + 1,
    lastEvent: ateFood ? 'food-eaten' : 'moved',
  }

  if (!ateFood) return nextState
  const food = spawnFood(nextState, random)
  if (!food) return { ...nextState, food: null, status: 'won', lastEvent: 'board-cleared' }
  return { ...nextState, food }
}
