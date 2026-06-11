import {
  formatPayoutAmount,
  getTicketPayout,
  shouldShowTicketPayout,
} from '../../logic/bingo/payoutLogic.js'
import { ANIMATION_POOL_SIZE } from './useFlipTicketGrid.js'
import {
  ensureTicketShell,
  releaseTicketShell,
  setTextNode,
} from './ticketShellDom.js'

export function createDrawState(drawnNumbers, betPerTicket) {
  return {
    drawnNumbers,
    drawnSet: new Set(drawnNumbers),
    betPerTicket,
  }
}

export function getShellHandle(poolElement) {
  return poolElement?.__shellHandle ?? null
}

export { releaseTicketShell }

export function clearTicketShell(poolElement) {
  const handle = getShellHandle(poolElement)
  if (!handle) return

  handle.ticketNumber = null
  handle.numbers = null
  handle.payoutFormatted = null
  handle.root.classList.remove('ticket--winning')
  handle.payoutEl.hidden = true

  for (let index = 0; index < handle.drawnSlots.length; index++) {
    if (handle.drawnSlots[index]) {
      handle.slotEls[index].classList.remove('ticket-slot--drawn')
      handle.drawnSlots[index] = false
    }
  }
}

export function updateTicketShellContent(poolElement, assignment) {
  if (!assignment) {
    clearTicketShell(poolElement)
    return
  }

  const handle = ensureTicketShell(poolElement)
  const { ticketNumber, numbers } = assignment

  if (handle.ticketNumber !== ticketNumber) {
    setTextNode(handle.ticketNumberText, ticketNumber)
    handle.ticketNumber = ticketNumber
  }

  for (let index = 0; index < handle.slotValueTexts.length; index++) {
    const nextValue = numbers[index]
    if (handle.displayedNumbers[index] !== nextValue) {
      setTextNode(handle.slotValueTexts[index], nextValue)
      handle.displayedNumbers[index] = nextValue
    }
  }

  handle.numbers = numbers
}

export function updateTicketShellDrawState(poolElement, numbers, drawState) {
  const handle = getShellHandle(poolElement)
  if (!handle || !numbers || !drawState) return

  for (let index = 0; index < handle.slotEls.length; index++) {
    const value = numbers[index]
    const isDrawn = drawState.drawnSet.has(value)

    if (handle.drawnSlots[index] !== isDrawn) {
      handle.slotEls[index].classList.toggle('ticket-slot--drawn', isDrawn)
      handle.drawnSlots[index] = isDrawn
    }
  }

  const ticket = { numbers }
  const showPayout = shouldShowTicketPayout(ticket, drawState.drawnNumbers)

  if (showPayout) {
    const formatted = formatPayoutAmount(
      getTicketPayout(ticket, drawState.drawnNumbers, drawState.betPerTicket),
    )

    if (handle.payoutFormatted !== formatted) {
      setTextNode(handle.payoutText, formatted)
      handle.payoutFormatted = formatted
    }

    handle.payoutEl.hidden = false
    handle.root.classList.add('ticket--winning')
    return
  }

  if (handle.payoutFormatted !== null) {
    handle.payoutFormatted = null
  }

  handle.payoutEl.hidden = true
  handle.root.classList.remove('ticket--winning')
}

export function updateTicketShell(poolElement, assignment, drawState) {
  if (!assignment) {
    clearTicketShell(poolElement)
    return
  }

  updateTicketShellContent(poolElement, assignment)
  const handle = getShellHandle(poolElement)
  updateTicketShellDrawState(poolElement, handle.numbers, drawState)
}

export function applyShellContentUpdates(
  poolRefs,
  indices,
  assignments,
  drawState,
) {
  for (const index of indices) {
    const poolElement = poolRefs[index]
    if (!poolElement) continue

    updateTicketShell(poolElement, assignments[index], drawState)
  }
}

export function applyShellContentToPool(
  poolRefs,
  assignments,
  activeSlots,
  drawState,
) {
  for (let index = 0; index < activeSlots; index++) {
    const poolElement = poolRefs[index]
    if (!poolElement) continue

    const assignment = assignments[index]
    if (!assignment) {
      releaseTicketShell(poolElement)
      continue
    }

    updateTicketShell(poolElement, assignment, drawState)
  }
}

export function applyShellDrawStateToPool(
  poolRefs,
  assignments,
  activeSlots,
  drawState,
) {
  for (let index = 0; index < activeSlots; index++) {
    const assignment = assignments[index]
    const poolElement = poolRefs[index]
    if (!assignment || !poolElement) continue

    const handle = getShellHandle(poolElement)
    if (!handle?.numbers) continue

    updateTicketShellDrawState(poolElement, assignment.numbers, drawState)
  }
}

export function releaseInactivePoolShells(poolRefs, activeSlots) {
  for (let index = activeSlots; index < ANIMATION_POOL_SIZE; index++) {
    const poolElement = poolRefs[index]
    if (!poolElement) continue
    releaseTicketShell(poolElement)
  }
}
