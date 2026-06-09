import { useDispatch, useSelector } from 'react-redux'
import AddTicketsButtons from '../AddTickets/AddTicketsButtons.jsx'
import UndoButton from '../AddTickets/UndoButton.jsx'
import TicketCount from '../AddTickets/TicketCount.jsx'
import BetAmountInput from '../BetAmount/BetAmountInput.jsx'
import TotalBetDisplay from '../BetAmount/TotalBetDisplay.jsx'
import DrawBalls from '../DrawBalls/DrawBalls.jsx'
import DrawnBallsView from '../DrawnBalls/DrawnBallsView.jsx'
import BetsToggleButton from '../GameState/BetsToggleButton.jsx'
import { tryUndoAdd } from '../../store/gameActions.js'
import { selectAddStack, selectCanUndoTickets } from '../../store/selectors.js'
import './ControlsSection.css'

function ControlsSection() {
  const dispatch = useDispatch()
  const addStack = useSelector(selectAddStack)
  const canUndo = useSelector(selectCanUndoTickets)

  return (
    <div className="controls-section">
      <div className="controls-section__row controls-section__row--header">
        <BetsToggleButton />
        <TicketCount />
        <TotalBetDisplay />
      </div>

      <div className="controls-section__divider" />

      <div className="controls-section__row controls-section__row--betting">
        <BetAmountInput />
        <div className="controls-section__ticket-actions">
          <AddTicketsButtons />
          <UndoButton
            disabled={!canUndo || addStack.length === 0}
            onClick={() => dispatch(tryUndoAdd())}
          />
        </div>
      </div>

      <div className="controls-section__divider" />

      <div className="controls-section__row controls-section__row--draw">
        <DrawnBallsView />
        <DrawBalls />
      </div>
    </div>
  )
}

export default ControlsSection
