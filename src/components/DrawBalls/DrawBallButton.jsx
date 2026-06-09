import './DrawBalls.css'

function DrawBallButton({ disabled, onClick }) {
  return (
    <button
      type="button"
      className="draw-ball-button"
      disabled={disabled}
      onClick={onClick}
    >
      Draw ball
    </button>
  )
}

export default DrawBallButton
