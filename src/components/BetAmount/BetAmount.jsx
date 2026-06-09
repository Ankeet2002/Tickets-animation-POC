import BetAmountInput from './BetAmountInput.jsx'
import TotalBetDisplay from './TotalBetDisplay.jsx'
import './BetAmount.css'

function BetAmount() {
  return (
    <div className="bet-amount">
      <BetAmountInput />
      <TotalBetDisplay />
    </div>
  )
}

export default BetAmount
