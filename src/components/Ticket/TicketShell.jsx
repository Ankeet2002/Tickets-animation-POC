import './Ticket.css'

const SLOT_INDICES = [0, 1, 2, 3, 4]

function TicketShell() {
  return (
    <div className="ticket">
      <div className="ticket-header">
        <span className="ticket-payout" hidden />
        <span className="ticket-number" />
      </div>
      <div className="ticket-numbers">
        {SLOT_INDICES.map((index) => (
          <div key={index} className="ticket-slot">
            <span className="ticket-slot-value" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default TicketShell
