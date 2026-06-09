import { useDispatch, useSelector } from 'react-redux'
import { tryUndoAdd } from '../../store/gameActions.js'
import { selectAddStack, selectCanUndoTickets } from '../../store/selectors.js'
import AddTicketsButtons from './AddTicketsButtons.jsx'
import TicketCount from './TicketCount.jsx'
import UndoButton from './UndoButton.jsx'
import './AddTickets.css'

function AddTickets() {
  const dispatch = useDispatch()
  const addStack = useSelector(selectAddStack)
  const canUndo = useSelector(selectCanUndoTickets)

  return (
    <div className="add-tickets">
      <TicketCount />
      <div className="add-tickets__actions">
        <AddTicketsButtons />
        <UndoButton
          disabled={!canUndo || addStack.length === 0}
          onClick={() => dispatch(tryUndoAdd())}
        />
      </div>
    </div>
  )
}

export default AddTickets
