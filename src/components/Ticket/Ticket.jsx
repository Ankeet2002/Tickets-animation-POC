import {
  getTicketPayout,
  shouldShowTicketPayout,
} from '../../logic/bingo/payoutLogic.js'
import TicketNumber from './TicketNumber.jsx'
import TicketPayout from './TicketPayout.jsx'
import TicketSlot from './TicketSlot.jsx'
import './Ticket.css'

function Ticket({
  ticketNumber,
  numbers,
  drawnNumbers = [],
  betPerTicket = 0,
}) {
  const drawnSet = new Set(drawnNumbers)
  const ticket = { numbers }
  const showPayout = shouldShowTicketPayout(ticket, drawnNumbers)
  const payout = getTicketPayout(ticket, drawnNumbers, betPerTicket)

  return (
    <div className={`ticket${showPayout ? ' ticket--winning' : ''}`}>
      <div className="ticket-header">
        {showPayout && <TicketPayout amount={payout} />}
        <TicketNumber value={ticketNumber} />
      </div>
      <div className="ticket-numbers">
        {numbers.map((num, index) => (
          <TicketSlot
            key={index}
            value={num}
            isDrawn={drawnSet.has(num)}
          />
        ))}
      </div>
    </div>
  )
}

export default Ticket
