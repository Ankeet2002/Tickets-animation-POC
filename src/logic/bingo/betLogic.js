export function getTotalBet(betPerTicket, ticketCount) {
  if (betPerTicket <= 0 || ticketCount <= 0) return 0
  return betPerTicket * ticketCount
}

export function parseBetAmount(value) {
  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed) || parsed < 0) return 0
  return parsed
}
