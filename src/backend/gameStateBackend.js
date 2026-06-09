import {
  applyGameStateFromBackend,
  toggleBetsFromBackend,
} from '../store/gameStateActions.js'
import { store } from '../store/index.js'

export function applyBackendGameState(gameState) {
  store.dispatch(applyGameStateFromBackend(gameState))
}

export function simulateBackendBetsOpen() {
  applyBackendGameState({ betsOpen: true })
}

export function simulateBackendBetsClosed() {
  applyBackendGameState({ betsOpen: false })
}

export function simulateBackendBetsToggle() {
  store.dispatch(toggleBetsFromBackend())
}
