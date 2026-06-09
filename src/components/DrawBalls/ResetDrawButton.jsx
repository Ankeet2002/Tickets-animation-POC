import './DrawBalls.css'

function ResetDrawButton({ disabled, onClick }) {
  return (
    <button
      type="button"
      className="draw-ball-button draw-ball-button--reset"
      disabled={disabled}
      onClick={onClick}
    >
      Reset draw
    </button>
  )
}

export default ResetDrawButton
