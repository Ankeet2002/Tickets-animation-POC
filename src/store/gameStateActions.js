import { shouldResetRound } from '../logic/game/roundLogic.js'
import { resetBet } from './betSlice.js'
import { resetDrawState } from './drawSlice.js'
import { setGameStateFromBackend } from './gameSlice.js'
import { resetTickets } from './ticketsSlice.js'

function resetGameRound(dispatch) {
  dispatch(resetTickets())
  dispatch(resetBet())
  dispatch(resetDrawState())
}

export function applyGameStateFromBackend(gameState) {
  return (dispatch, getState) => {
    if (typeof gameState.betsOpen !== 'boolean') return

    const previousGameState = getState().game

    if (shouldResetRound(previousGameState, gameState)) {
      resetGameRound(dispatch)
    }

    dispatch(setGameStateFromBackend(gameState))
  }
}

export function toggleBetsFromBackend() {
  return (dispatch, getState) => {
    const betsOpen = getState().game.betsOpen
    dispatch(applyGameStateFromBackend({ betsOpen: !betsOpen }))
  }
}
