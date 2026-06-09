import { useSelector } from 'react-redux'
import { MAX_TICKETS } from '../../logic/bingo/constants.js'
import { selectTicketCount } from '../../store/selectors.js'
import './AddTickets.css'

function TicketCount() {
  const count = useSelector(selectTicketCount)

  return (
    <span className="ticket-count">
      {count} / {MAX_TICKETS}
    </span>
  )
}

export default TicketCount
