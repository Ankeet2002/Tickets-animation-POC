import { formatPayoutAmount } from '../../logic/bingo/payoutLogic.js'
import './Ticket.css'

function TicketPayout({ amount }) {
  return (
    <span className="ticket-payout">{formatPayoutAmount(amount)}</span>
  )
}

export default TicketPayout
