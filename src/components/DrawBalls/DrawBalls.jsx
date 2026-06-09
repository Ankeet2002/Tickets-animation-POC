import { useDispatch, useSelector } from 'react-redux'
import { canDrawBall } from '../../logic/bingo/drawLogic.js'
import {
  tryDrawNextBall,
  tryDrawRemainingBalls,
  tryResetDraw,
} from '../../store/gameActions.js'
import { selectCanDrawBalls, selectDrawState } from '../../store/selectors.js'
import DrawAllButton from './DrawAllButton.jsx'
import DrawBallButton from './DrawBallButton.jsx'
import ResetDrawButton from './ResetDrawButton.jsx'
import './DrawBalls.css'

function DrawBalls() {
  const dispatch = useDispatch()
  const drawState = useSelector(selectDrawState)
  const canDrawInGame = useSelector(selectCanDrawBalls)
  const canDrawMore = canDrawBall(drawState)

  return (
    <div className="draw-balls">
      <DrawBallButton
        disabled={!canDrawInGame || !canDrawMore}
        onClick={() => dispatch(tryDrawNextBall())}
      />
      <DrawAllButton
        disabled={!canDrawInGame || !canDrawMore}
        onClick={() => dispatch(tryDrawRemainingBalls())}
      />
      <ResetDrawButton
        disabled={!canDrawInGame || drawState.drawnNumbers.length === 0}
        onClick={() => dispatch(tryResetDraw())}
      />
    </div>
  )
}

export default DrawBalls
