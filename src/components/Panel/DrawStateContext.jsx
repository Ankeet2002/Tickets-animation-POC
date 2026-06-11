import { createContext, useContext, useMemo } from 'react'

const DrawStateContext = createContext(null)

export function DrawStateProvider({ drawnNumbers, betPerTicket, children }) {
  const value = useMemo(
    () => ({
      drawnNumbers,
      drawnSet: new Set(drawnNumbers),
      betPerTicket,
    }),
    [drawnNumbers, betPerTicket],
  )

  return (
    <DrawStateContext.Provider value={value}>{children}</DrawStateContext.Provider>
  )
}

export function useDrawState() {
  const state = useContext(DrawStateContext)
  if (!state) {
    throw new Error('useDrawState must be used within DrawStateProvider')
  }
  return state
}
