import { useDispatch, useSelector } from 'react-redux'
import { trySetBetPerTicket } from '../../store/gameActions.js'
import {
  selectBetPerTicket,
  selectCanChangeBetAmount,
} from '../../store/selectors.js'
import './BetAmount.css'

function BetAmountInput() {
  const dispatch = useDispatch()
  const betPerTicket = useSelector(selectBetPerTicket)
  const canChangeBet = useSelector(selectCanChangeBetAmount)

  return (
    <label className="bet-amount-input">
      <span className="bet-amount-input__label">Bet per ticket</span>
      <input
        type="number"
        min="0"
        step="0.01"
        value={betPerTicket === 0 ? '' : betPerTicket}
        placeholder="0"
        disabled={!canChangeBet}
        onChange={(event) => dispatch(trySetBetPerTicket(event.target.value))}
      />
    </label>
  )
}

export default BetAmountInput
