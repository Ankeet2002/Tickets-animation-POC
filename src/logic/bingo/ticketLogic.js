import {
  MAX_NUMBER,
  MIN_NUMBER,
  NUMBERS_PER_TICKET,
} from './constants.js'

export function isValidTicketNumber(value) {
  return (
    Number.isInteger(value) && value >= MIN_NUMBER && value <= MAX_NUMBER
  )
}

export function generateTicketNumbers() {
  const numbers = new Set()

  while (numbers.size < NUMBERS_PER_TICKET) {
    const value =
      Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER
    numbers.add(value)
  }

  return [...numbers]
}

export function createTicket(ticketNumber) {
  return {
    ticketNumber,
    numbers: generateTicketNumbers(),
  }
}

export function countMatchedSlots(ticket, drawnNumbers, drawnSet = null) {
  if (drawnNumbers.length === 0) return 0

  const set = drawnSet ?? new Set(drawnNumbers)
  return ticket.numbers.filter((number) => set.has(number)).length
}

export function sortTicketsByMatches(tickets, drawnNumbers) {
  if (drawnNumbers.length === 0) return tickets

  const drawnSet = new Set(drawnNumbers)
  const buckets = Array.from({ length: NUMBERS_PER_TICKET + 1 }, () => [])

  for (const ticket of tickets) {
    const matchCount = countMatchedSlots(ticket, drawnNumbers, drawnSet)
    buckets[matchCount].push(ticket)
  }

  const sorted = []

  for (let matchCount = NUMBERS_PER_TICKET; matchCount >= 0; matchCount -= 1) {
    const bucket = buckets[matchCount]

    if (bucket.length > 1) {
      bucket.sort((a, b) => a.ticketNumber - b.ticketNumber)
    }

    sorted.push(...bucket)
  }

  return sorted
}
