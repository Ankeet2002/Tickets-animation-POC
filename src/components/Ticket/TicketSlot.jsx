import './Ticket.css'

function TicketSlot({ value, isDrawn }) {
  return (
    <div className={`ticket-slot${isDrawn ? ' ticket-slot--drawn' : ''}`}>
      <span className="ticket-slot-value">{value}</span>
    </div>
  )
}

export default TicketSlot
