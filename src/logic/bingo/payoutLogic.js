import { countMatchedSlots } from './ticketLogic.js'

const PAYOUT_MULTIPLIERS = {
  0: 0,
  1: 0,
  2: 2,
  3: 4,
  4: 14,
  5: 59,
  6: 99,
}

export function getPayoutMultiplier(matchCount) {
  return PAYOUT_MULTIPLIERS[matchCount] ?? 0
}

export function shouldShowTicketPayout(ticket, drawnNumbers) {
  if (drawnNumbers.length === 0) return false

  const matchCount = countMatchedSlots(ticket, drawnNumbers)
  return getPayoutMultiplier(matchCount) > 0
}

export function getTicketPayout(ticket, drawnNumbers, betPerTicket) {
  if (drawnNumbers.length === 0) return 0

  const matchCount = countMatchedSlots(ticket, drawnNumbers)
  const multiplier = getPayoutMultiplier(matchCount)

  if (multiplier === 0) return 0

  return betPerTicket * multiplier
}

export function formatPayoutAmount(amount) {
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
