import { createSlice } from '@reduxjs/toolkit'
import { parseBetAmount } from '../logic/bingo/betLogic.js'

const betSlice = createSlice({
  name: 'bet',
  initialState: {
    betPerTicket: 0,
  },
  reducers: {
    setBetPerTicket(state, action) {
      state.betPerTicket = parseBetAmount(action.payload)
    },
    resetBet(state) {
      state.betPerTicket = 0
    },
  },
})

export const { resetBet, setBetPerTicket } = betSlice.actions
export default betSlice.reducer
