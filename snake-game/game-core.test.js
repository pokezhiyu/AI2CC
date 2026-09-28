import test from 'node:test'
import assert from 'node:assert/strict'
import {
  advanceGame,
  createGame,
  DIRECTIONS,
  queueDirection,
  startGame,
} from './game-core.js'

test('创建游戏时生成四节蛇身和可用食物', () => {
  const game = createGame({ cols: 12, rows: 12, random: () => 0 })
  assert.equal(game.snake.length, 4)
  assert.equal(game.status, 'idle')
  assert.ok(game.food)
  assert.equal(game.snake.some((cell) => cell.x === game.food.x && cell.y === game.food.y), false)
})

test('不能直接反向移动', () => {
  const game = createGame()
  assert.equal(queueDirection(game, 'left'), game)
  assert.deepEqual(queueDirection(game, 'up').pendingDirection, DIRECTIONS.up)
})

test('吃到食物后增长并按经典模式计分', () => {
  const initial = startGame(createGame({ cols: 12, rows: 12, mode: 'classic' }))
  const head = initial.snake[0]
  const game = { ...initial, food: { x: head.x + 1, y: head.y } }
  const next = advanceGame(game, () => 0)
  assert.equal(next.snake.length, game.snake.length + 1)
  assert.equal(next.score, 10)
  assert.equal(next.foodsEaten, 1)
  assert.equal(next.lastEvent, 'food-eaten')
})

test('经典模式碰墙结束游戏', () => {
  const game = {
    ...startGame(createGame({ cols: 8, rows: 8, mode: 'classic' })),
    snake: [{ x: 7, y: 3 }, { x: 6, y: 3 }, { x: 5, y: 3 }, { x: 4, y: 3 }],
    direction: DIRECTIONS.right,
    pendingDirection: DIRECTIONS.right,
    food: { x: 0, y: 0 },
  }
  const next = advanceGame(game)
  assert.equal(next.status, 'gameover')
  assert.equal(next.lastEvent, 'wall-collision')
})

test('轻松模式可以穿过边界', () => {
  const game = {
    ...startGame(createGame({ cols: 8, rows: 8, mode: 'relaxed' })),
    snake: [{ x: 7, y: 3 }, { x: 6, y: 3 }, { x: 5, y: 3 }, { x: 4, y: 3 }],
    direction: DIRECTIONS.right,
    pendingDirection: DIRECTIONS.right,
    food: { x: 2, y: 2 },
  }
  const next = advanceGame(game)
  assert.equal(next.status, 'running')
  assert.deepEqual(next.snake[0], { x: 0, y: 3 })
})
