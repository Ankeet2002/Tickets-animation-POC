import { useDispatch, useSelector } from 'react-redux'
import { MAX_TICKETS } from '../../logic/bingo/constants.js'
import { tryAddTickets } from '../../store/gameActions.js'
import {
  selectCanAddTickets,
  selectTicketCount,
} from '../../store/selectors.js'
import AddTicketButton from './AddTicketButton.jsx'

const ADD_OPTIONS = [1, 5, 50, 100]

function AddTicketsButtons() {
  const dispatch = useDispatch()
  const ticketCount = useSelector(selectTicketCount)
  const canAdd = useSelector(selectCanAddTickets)

  return ADD_OPTIONS.map((amount) => (
    <AddTicketButton
      key={amount}
      amount={amount}
      disabled={!canAdd || ticketCount + amount > MAX_TICKETS}
      onClick={() => dispatch(tryAddTickets(amount))}
    />
  ))
}

export default AddTicketsButtons
