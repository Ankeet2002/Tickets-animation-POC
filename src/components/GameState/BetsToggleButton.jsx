import { useDispatch, useSelector } from 'react-redux'
import { toggleBetsFromBackend } from '../../store/gameStateActions.js'
import { selectBetsOpen } from '../../store/selectors.js'
import './GameState.css'

function BetsToggleButton() {
  const dispatch = useDispatch()
  const betsOpen = useSelector(selectBetsOpen)

  return (
    <button
      type="button"
      className={`bets-toggle${betsOpen ? ' bets-toggle--open' : ' bets-toggle--closed'}`}
      onClick={() => dispatch(toggleBetsFromBackend())}
    >
      <span className="bets-toggle__indicator" aria-hidden="true" />
      {betsOpen ? 'Bets open' : 'Bets closed'}
    </button>
  )
}

export default BetsToggleButton
