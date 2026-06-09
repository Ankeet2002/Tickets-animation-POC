import './AddTickets.css'

function UndoButton({ disabled, onClick }) {
  return (
    <button
      type="button"
      className="undo-button"
      disabled={disabled}
      onClick={onClick}
    >
      Undo
    </button>
  )
}

export default UndoButton
