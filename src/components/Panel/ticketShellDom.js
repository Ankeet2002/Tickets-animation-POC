import '../Ticket/Ticket.css'

function createTextSpan(className) {
  const el = document.createElement('span')
  el.className = className
  const text = document.createTextNode('')
  el.append(text)
  return { el, text }
}

export function setTextNode(textNode, value) {
  const next = String(value)
  if (textNode.nodeValue !== next) {
    textNode.nodeValue = next
  }
}

export function buildTicketShellElement() {
  const root = document.createElement('div')
  root.className = 'ticket'

  const header = document.createElement('div')
  header.className = 'ticket-header'

  const payout = createTextSpan('ticket-payout')
  payout.el.hidden = true

  const ticketNumber = createTextSpan('ticket-number')

  header.append(payout.el, ticketNumber.el)

  const numbers = document.createElement('div')
  numbers.className = 'ticket-numbers'

  const slotEls = []
  const slotValueEls = []
  const slotValueTexts = []
  const displayedNumbers = []

  for (let index = 0; index < 5; index++) {
    const slot = document.createElement('div')
    slot.className = 'ticket-slot'

    const value = createTextSpan('ticket-slot-value')
    slot.append(value.el)

    slotEls.push(slot)
    slotValueEls.push(value.el)
    slotValueTexts.push(value.text)
    displayedNumbers.push(null)
    numbers.append(slot)
  }

  root.append(header, numbers)

  return {
    root,
    ticketNumberEl: ticketNumber.el,
    ticketNumberText: ticketNumber.text,
    payoutEl: payout.el,
    payoutText: payout.text,
    slotEls,
    slotValueEls,
    slotValueTexts,
    displayedNumbers,
    drawnSlots: [false, false, false, false, false],
    ticketNumber: null,
    numbers: null,
    payoutFormatted: null,
  }
}

export function releaseTicketShell(poolElement) {
  if (!poolElement) return

  poolElement.replaceChildren()
  delete poolElement.__shellHandle
}

export function ensureTicketShell(poolElement) {
  if (!poolElement) return null

  if (poolElement.__shellHandle) {
    return poolElement.__shellHandle
  }

  const handle = buildTicketShellElement()
  poolElement.append(handle.root)
  poolElement.__shellHandle = handle
  return handle
}
