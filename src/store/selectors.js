import { createSelector } from '@reduxjs/toolkit'
import { getTotalBet } from '../logic/bingo/betLogic.js'
import { sortTicketsByMatches } from '../logic/bingo/ticketLogic.js'
import {
  canAddTickets,
  canChangeBetAmount,
  canDrawBalls,
  canUndoTickets,
} from '../logic/game/index.js'

const selectTickets = (state) => state.tickets.tickets
const selectAddStack = (state) => state.tickets.addStack
const selectTicketCount = (state) => state.tickets.tickets.length
const selectDrawnNumbers = (state) => state.draw.drawnNumbers
const selectDrawState = (state) => state.draw
const selectBetPerTicket = (state) => state.bet.betPerTicket
const selectGameState = (state) => state.game
const selectBetsOpen = (state) => state.game.betsOpen

export const selectSortedTickets = createSelector(
  [selectTickets, selectDrawnNumbers],
  sortTicketsByMatches,
)

export const selectTotalBet = createSelector(
  [selectBetPerTicket, selectTicketCount],
  getTotalBet,
)

export const selectCanAddTickets = createSelector(
  [selectGameState],
  canAddTickets,
)

export const selectCanChangeBetAmount = createSelector(
  [selectGameState],
  canChangeBetAmount,
)

export const selectCanUndoTickets = createSelector(
  [selectGameState],
  canUndoTickets,
)

export const selectCanDrawBalls = createSelector(
  [selectGameState],
  canDrawBalls,
)

export {
  selectAddStack,
  selectBetPerTicket,
  selectBetsOpen,
  selectDrawnNumbers,
  selectDrawState,
  selectGameState,
  selectTicketCount,
  selectTickets,
}
