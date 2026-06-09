export function canAddTickets(gameState) {
  return gameState.betsOpen
}

export function canChangeBetAmount(gameState) {
  return gameState.betsOpen
}

export function canUndoTickets(gameState) {
  return gameState.betsOpen
}

export function canDrawBalls(gameState) {
  return !gameState.betsOpen
}
