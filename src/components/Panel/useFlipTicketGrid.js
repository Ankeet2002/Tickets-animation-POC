import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'

export const COLS = 4
export const CARD_W = 197
export const CARD_H = 43
export const GAP = 6
export const CELL_W = CARD_W + GAP
export const CELL_H = CARD_H + GAP
export const VISIBLE_ROWS = 4
export const VIEWPORT_H = VISIBLE_ROWS * CELL_H - GAP
export const FLIP_TRANSITION = 'transform 1.1s cubic-bezier(0.34, 1.1, 0.64, 1)'

function getSlotPosition(slot) {
  const row = Math.floor(slot / COLS)
  const col = slot % COLS
  return { x: col * CELL_W, y: row * CELL_H }
}

export function useFlipTicketGrid(tickets) {
  const nodeRefs = useRef({})
  const posSnapshot = useRef({})

  const sortedOrder = useMemo(
    () => tickets.map((ticket) => ticket.ticketNumber),
    [tickets],
  )

  const ticketToSlot = useMemo(() => {
    const map = new Map()
    sortedOrder.forEach((ticketNumber, slot) => {
      map.set(ticketNumber, slot)
    })
    return map
  }, [sortedOrder])

  const ticketsById = useMemo(() => {
    const map = new Map()
    tickets.forEach((ticket) => {
      map.set(ticket.ticketNumber, ticket)
    })
    return map
  }, [tickets])

  const totalRows = Math.max(1, Math.ceil(tickets.length / COLS) || 0)
  const totalH = Math.max(VIEWPORT_H, totalRows * CELL_H - GAP)

  useLayoutEffect(() => {
    const newSnapshot = {}

    sortedOrder.forEach((ticketNumber) => {
      const slot = ticketToSlot.get(ticketNumber)
      if (slot === undefined) return
      newSnapshot[ticketNumber] = getSlotPosition(slot)
    })

    sortedOrder.forEach((ticketNumber) => {
      const el = nodeRefs.current[ticketNumber]
      const oldPos = posSnapshot.current[ticketNumber]
      const newPos = newSnapshot[ticketNumber]
      if (!el || !newPos) return

      if (!oldPos) {
        el.style.transition = 'none'
        el.style.transform = `translate3d(${newPos.x}px, ${newPos.y}px, 0)`
        return
      }

      if (oldPos.x === newPos.x && oldPos.y === newPos.y) return

      el.style.transition = 'none'
      el.style.transform = `translate3d(${oldPos.x}px, ${oldPos.y}px, 0)`
      el.getBoundingClientRect()
      el.style.transition = FLIP_TRANSITION
      el.style.transform = `translate3d(${newPos.x}px, ${newPos.y}px, 0)`
    })

    posSnapshot.current = newSnapshot
  })

  useLayoutEffect(() => {
    const activeIds = new Set(sortedOrder)
    Object.keys(nodeRefs.current).forEach((id) => {
      const ticketNumber = Number(id)
      if (!activeIds.has(ticketNumber)) {
        delete nodeRefs.current[ticketNumber]
        delete posSnapshot.current[ticketNumber]
      }
    })
  }, [sortedOrder])

  const registerNodeRef = useCallback((ticketNumber, element) => {
    if (element) {
      nodeRefs.current[ticketNumber] = element
      return
    }
    delete nodeRefs.current[ticketNumber]
  }, [])

  return {
    sortedOrder,
    registerNodeRef,
    ticketsById,
    totalH,
  }
}
