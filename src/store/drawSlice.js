import { createSlice } from '@reduxjs/toolkit'
import {
  applyDrawnNumber,
  createDrawState,
  drawAllBalls,
  drawBall,
  resetDraw,
} from '../logic/bingo/drawLogic.js'

const drawSlice = createSlice({
  name: 'draw',
  initialState: createDrawState(),
  reducers: {
    drawNextBall(state) {
      return drawBall(state)
    },
    drawRemainingBalls(state) {
      return drawAllBalls(state)
    },
    resetDrawState() {
      return resetDraw()
    },
    setDrawnNumber(state, action) {
      const result = applyDrawnNumber(state, action.payload)
      return result.ok ? result.drawState : state
    },
  },
})

export const {
  drawNextBall,
  drawRemainingBalls,
  resetDrawState,
  setDrawnNumber,
} = drawSlice.actions
export default drawSlice.reducer
