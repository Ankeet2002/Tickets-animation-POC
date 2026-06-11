import { useMemo } from 'react'

export const COLS = 4
export const CARD_W = 197
export const CARD_H = 43
export const GAP = 6
export const CELL_W = CARD_W + GAP
export const CELL_H = CARD_H + GAP
export const VISIBLE_ROWS = 4
export const VIEWPORT_H = VISIBLE_ROWS * CELL_H - GAP
export const FLIP_TRANSITION = 'transform 1.1s cubic-bezier(0.34, 1.1, 0.64, 1)'
export const FLIP_DURATION_MS = 1100
export const VISIBILITY_BUFFER_ROWS = 2
export const SCROLL_WINDOW_SLOTS =
  (VISIBLE_ROWS + VISIBILITY_BUFFER_ROWS * 2) * COLS
export const ANIMATION_POOL_SIZE = SCROLL_WINDOW_SLOTS * 2

export function getSlotPosition(slot) {
  const row = Math.floor(slot / COLS)
  const col = slot % COLS
  return { x: col * CELL_W, y: row * CELL_H }
}

export function getVisibleRowRange(
  scrollTop,
  bufferRows = VISIBILITY_BUFFER_ROWS,
) {
  const scrolledRow = Math.floor(scrollTop / CELL_H)
  return {
    firstRow: Math.max(0, scrolledRow - bufferRows),
    lastRow: scrolledRow + VISIBLE_ROWS - 1 + bufferRows,
  }
}

export function getVisibleSlots(ticketCount, rowRange) {
  if (ticketCount === 0) return []

  const firstSlot = rowRange.firstRow * COLS
  const lastSlot = Math.min(
    (rowRange.lastRow + 1) * COLS - 1,
    ticketCount - 1,
  )
  const slots = []

  for (let slot = firstSlot; slot <= lastSlot; slot++) {
    slots.push(slot)
  }

  return slots
}

export function getVisibleTicketNumbers(sortedOrder, rowRange) {
  return getVisibleSlots(sortedOrder.length, rowRange).map(
    (slot) => sortedOrder[slot],
  )
}

export function hasSortedOrderChanged(prevOrder, nextOrder) {
  if (prevOrder.length !== nextOrder.length) {
    return prevOrder.length > 0 && nextOrder.length > 0
  }
  if (prevOrder.length === 0) return false
  return prevOrder.some(
    (ticketNumber, index) => ticketNumber !== nextOrder[index],
  )
}

export function buildTicketSlotMap(sortedOrder) {
  const map = new Map()
  sortedOrder.forEach((ticketNumber, slot) => {
    map.set(ticketNumber, slot)
  })
  return map
}

export function getSortAnimationTickets(prevOrder, nextOrder, rowRange) {
  if (!hasSortedOrderChanged(prevOrder, nextOrder)) return null

  const wasVisible = getVisibleTicketNumbers(prevOrder, rowRange)
  const willBeVisible = getVisibleTicketNumbers(nextOrder, rowRange)
  return new Set([...wasVisible, ...willBeVisible])
}

export function buildPoolAssignments(
  sortedOrder,
  rowRange,
  ticketsById,
  ticketToSlot,
  extraTicketNumbers = null,
) {
  const items = []
  const usedTickets = new Set()

  for (const slot of getVisibleSlots(sortedOrder.length, rowRange)) {
    const ticketNumber = sortedOrder[slot]
    const ticket = ticketsById.get(ticketNumber)
    if (!ticket) continue

    const position = getSlotPosition(slot)
    items.push({
      slot,
      ticketNumber: ticket.ticketNumber,
      numbers: ticket.numbers,
      x: position.x,
      y: position.y,
    })
    usedTickets.add(ticketNumber)
  }

  if (extraTicketNumbers) {
    for (const ticketNumber of extraTicketNumbers) {
      if (usedTickets.has(ticketNumber) || items.length >= ANIMATION_POOL_SIZE) {
        continue
      }

      const slot = ticketToSlot.get(ticketNumber)
      if (slot === undefined) continue

      const ticket = ticketsById.get(ticketNumber)
      if (!ticket) continue

      const position = getSlotPosition(slot)
      items.push({
        slot,
        ticketNumber: ticket.ticketNumber,
        numbers: ticket.numbers,
        x: position.x,
        y: position.y,
      })
      usedTickets.add(ticketNumber)
    }
  }

  const assignments = Array(ANIMATION_POOL_SIZE).fill(null)
  for (
    let index = 0;
    index < Math.min(items.length, ANIMATION_POOL_SIZE);
    index++
  ) {
    assignments[index] = items[index]
  }

  return assignments
}

export function useTicketGridData(tickets) {
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

  return {
    sortedOrder,
    ticketsById,
    ticketToSlot,
    totalH,
  }
}
