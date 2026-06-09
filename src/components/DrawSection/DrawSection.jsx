import DrawBalls from '../DrawBalls/DrawBalls.jsx'
import DrawnBallsView from '../DrawnBalls/DrawnBallsView.jsx'
import './DrawSection.css'

function DrawSection() {
  return (
    <div className="draw-section">
      <DrawnBallsView />
      <DrawBalls />
    </div>
  )
}

export default DrawSection
