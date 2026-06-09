import './DrawnBalls.css'

function DrawnBall({ value }) {
  return <span className="drawn-ball">{value ?? '–'}</span>
}

export default DrawnBall
