import { useSelector } from 'react-redux'
import { selectTotalBet } from '../../store/selectors.js'
import './BetAmount.css'

function TotalBetDisplay() {
  const totalBet = useSelector(selectTotalBet)

  return (
    <span className="total-bet-display">
      Total bet: <strong>{totalBet.toFixed(2)}</strong>
    </span>
  )
}

export default TotalBetDisplay
