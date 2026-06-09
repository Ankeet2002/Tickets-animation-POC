import { configureStore } from '@reduxjs/toolkit'
import betReducer from './betSlice.js'
import drawReducer from './drawSlice.js'
import gameReducer from './gameSlice.js'
import ticketsReducer from './ticketsSlice.js'

export const store = configureStore({
  reducer: {
    tickets: ticketsReducer,
    draw: drawReducer,
    bet: betReducer,
    game: gameReducer,
  },
})
