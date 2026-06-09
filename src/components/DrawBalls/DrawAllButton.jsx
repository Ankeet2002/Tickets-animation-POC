import './DrawBalls.css'

function DrawAllButton({ disabled, onClick }) {
  return (
    <button
      type="button"
      className="draw-ball-button"
      disabled={disabled}
      onClick={onClick}
    >
      Draw 6 balls
    </button>
  )
}

export default DrawAllButton
