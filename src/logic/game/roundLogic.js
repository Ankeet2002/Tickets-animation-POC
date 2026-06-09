export function shouldResetRound(previousGameState, nextGameState) {
  return (
    previousGameState.betsOpen === false && nextGameState.betsOpen === true
  )
}
