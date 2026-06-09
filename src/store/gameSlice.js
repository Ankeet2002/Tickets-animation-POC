import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  betsOpen: true,
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameStateFromBackend(state, action) {
      if (typeof action.payload.betsOpen === 'boolean') {
        state.betsOpen = action.payload.betsOpen
      }
    },
  },
})

export const { setGameStateFromBackend } = gameSlice.actions
export default gameSlice.reducer
