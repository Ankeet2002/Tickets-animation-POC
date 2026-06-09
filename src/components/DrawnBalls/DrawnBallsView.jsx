import { useSelector } from 'react-redux'
import { BALLS_PER_DRAW } from '../../logic/bingo/constants.js'
import { selectDrawnNumbers } from '../../store/selectors.js'
import DrawnBall from './DrawnBall.jsx'
import DrawnBallsLabel from './DrawnBallsLabel.jsx'
import './DrawnBalls.css'

function DrawnBallsView() {
  const drawnNumbers = useSelector(selectDrawnNumbers)

  return (
    <div className="drawn-balls-view">
      <DrawnBallsLabel count={drawnNumbers.length} />
      <div className="drawn-balls-view__balls">
        {Array.from({ length: BALLS_PER_DRAW }, (_, index) => (
          <DrawnBall key={index} value={drawnNumbers[index]} />
        ))}
      </div>
    </div>
  )
}

export default DrawnBallsView
