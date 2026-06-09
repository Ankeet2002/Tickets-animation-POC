import './AddTickets.css'

function AddTicketButton({ amount, disabled, onClick }) {
  return (
    <button
      type="button"
      className="add-ticket-button"
      disabled={disabled}
      onClick={onClick}
    >
      +{amount}
    </button>
  )
}

export default AddTicketButton
