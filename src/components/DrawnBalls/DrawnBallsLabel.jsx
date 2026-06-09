import { BALLS_PER_DRAW } from '../../logic/bingo/constants.js'
import './DrawnBalls.css'

function DrawnBallsLabel({ count }) {
  return (
    <span className="drawn-balls-label">
      Drawn balls ({count}/{BALLS_PER_DRAW})
    </span>
  )
}

export default DrawnBallsLabel
