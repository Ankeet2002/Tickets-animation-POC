import {
  canAddTickets,
  canChangeBetAmount,
  canDrawBalls,
  canUndoTickets,
} from '../logic/game/index.js'
import { canDrawBall } from '../logic/bingo/drawLogic.js'
import { setBetPerTicket } from './betSlice.js'
import {
  drawNextBall,
  drawRemainingBalls,
  resetDrawState,
} from './drawSlice.js'
import { addTickets, undoAdd } from './ticketsSlice.js'

export function tryAddTickets(amount) {
  return (dispatch, getState) => {
    if (!canAddTickets(getState().game)) return
    dispatch(addTickets(amount))
  }
}

export function tryUndoAdd() {
  return (dispatch, getState) => {
    if (!canUndoTickets(getState().game)) return
    dispatch(undoAdd())
  }
}

export function trySetBetPerTicket(value) {
  return (dispatch, getState) => {
    if (!canChangeBetAmount(getState().game)) return
    dispatch(setBetPerTicket(value))
  }
}

export function tryDrawNextBall() {
  return (dispatch, getState) => {
    const { game, draw } = getState()
    if (!canDrawBalls(game) || !canDrawBall(draw)) return
    dispatch(drawNextBall())
  }
}

export function tryDrawRemainingBalls() {
  return (dispatch, getState) => {
    const { game, draw } = getState()
    if (!canDrawBalls(game) || !canDrawBall(draw)) return
    dispatch(drawRemainingBalls())
  }
}

export function tryResetDraw() {
  return (dispatch, getState) => {
    if (!canDrawBalls(getState().game)) return
    dispatch(resetDrawState())
  }
}
