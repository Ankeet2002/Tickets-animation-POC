import { createSlice } from '@reduxjs/toolkit'
import { MAX_TICKETS } from '../logic/bingo/constants.js'
import { createTicket } from '../logic/bingo/ticketLogic.js'

const initialState = {
  tickets: [],
  addStack: [],
}

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    addTickets(state, action) {
      const remaining = MAX_TICKETS - state.tickets.length
      const toAdd = Math.min(action.payload, remaining)
      if (toAdd <= 0) return

      const nextId = state.tickets.reduce(
        (max, ticket) => Math.max(max, ticket.ticketNumber),
        0,
      )
      const newTickets = Array.from({ length: toAdd }, (_, index) =>
        createTicket(nextId + index + 1),
      )

      state.tickets.push(...newTickets)
      state.addStack.push(toAdd)
    },
    undoAdd(state) {
      if (state.addStack.length === 0) return

      const count = state.addStack.pop()
      state.tickets.splice(state.tickets.length - count, count)
    },
    resetTickets(state) {
      state.tickets = []
      state.addStack = []
    },
  },
})

export const { addTickets, resetTickets, undoAdd } = ticketsSlice.actions
export default ticketsSlice.reducer
