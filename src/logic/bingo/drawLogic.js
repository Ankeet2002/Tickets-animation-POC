import { BALLS_PER_DRAW, MAX_NUMBER, MIN_NUMBER } from './constants.js'

export function createDrawState() {
  return {
    drawnNumbers: [],
  }
}

export function isValidBallNumber(value) {
  return Number.isInteger(value) && value >= MIN_NUMBER && value <= MAX_NUMBER
}

export function canDrawBall(drawState) {
  return drawState.drawnNumbers.length < BALLS_PER_DRAW
}

export function getRemainingNumbers(drawState) {
  const drawn = new Set(drawState.drawnNumbers)

  return Array.from(
    { length: MAX_NUMBER - MIN_NUMBER + 1 },
    (_, index) => MIN_NUMBER + index,
  ).filter((number) => !drawn.has(number))
}

export function applyDrawnNumber(drawState, number) {
  if (!canDrawBall(drawState)) {
    return { ok: false, error: 'DRAW_COMPLETE', drawState }
  }

  if (!isValidBallNumber(number)) {
    return { ok: false, error: 'INVALID_NUMBER', drawState }
  }

  if (drawState.drawnNumbers.includes(number)) {
    return { ok: false, error: 'ALREADY_DRAWN', drawState }
  }

  return {
    ok: true,
    drawState: {
      drawnNumbers: [...drawState.drawnNumbers, number],
    },
  }
}

export function drawBall(drawState) {
  const remaining = getRemainingNumbers(drawState)
  if (!canDrawBall(drawState) || remaining.length === 0) {
    return drawState
  }

  const number = remaining[Math.floor(Math.random() * remaining.length)]
  return applyDrawnNumber(drawState, number).drawState
}

export function drawAllBalls(drawState = createDrawState()) {
  let current = drawState

  while (canDrawBall(current)) {
    current = drawBall(current)
  }

  return current
}

export function resetDraw() {
  return createDrawState()
}
