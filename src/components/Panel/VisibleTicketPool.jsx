import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import PooledTicketSlot from './PooledTicketSlot.jsx'
import {
  applyDrawFlip,
  applyPoolPosition,
  clearFlipWillChange,
  createEmptyAssignments,
  createEmptyLayoutState,
  diffAndApplyScrollPool,
} from './poolController.js'
import {
  applyShellContentToPool,
  applyShellContentUpdates,
  applyShellDrawStateToPool,
  createDrawState,
  releaseInactivePoolShells,
  releaseTicketShell,
  updateTicketShell,
} from './ticketShellController.js'
import {
  ANIMATION_POOL_SIZE,
  buildPoolAssignments,
  FLIP_DURATION_MS,
  getVisibleRowRange,
  SCROLL_WINDOW_SLOTS,
} from './useFlipTicketGrid.js'

const SCROLL_POOL_INDICES = Array.from(
  { length: SCROLL_WINDOW_SLOTS },
  (_, index) => index,
)
const DRAW_POOL_INDICES = Array.from(
  { length: ANIMATION_POOL_SIZE },
  (_, index) => index,
)

const VisibleTicketPool = forwardRef(function VisibleTicketPool(
  {
    viewportRef,
    sortedOrder,
    ticketsById,
    ticketToSlot,
    flipTicketNumbers,
    prevSortedOrder,
    drawnNumbers,
    betPerTicket,
  },
  ref,
) {
  const visibleRowRangeRef = useRef(getVisibleRowRange(0))
  const animationTicketsRef = useRef(null)
  const prevFlipTicketNumbersRef = useRef(null)
  const sortAnimationTimerRef = useRef(0)
  const poolRefs = useRef({})
  const assignmentsRef = useRef(createEmptyAssignments())
  const layoutStateRef = useRef(createEmptyLayoutState())
  const lastFlippedDrawRef = useRef(null)
  const sortedOrderRef = useRef(sortedOrder)
  const ticketsByIdRef = useRef(ticketsById)
  const ticketToSlotMapRef = useRef(null)
  const drawStateRef = useRef(createDrawState(drawnNumbers, betPerTicket))
  const [drawSyncEpoch, setDrawSyncEpoch] = useState(0)

  sortedOrderRef.current = sortedOrder
  ticketsByIdRef.current = ticketsById
  drawStateRef.current = createDrawState(drawnNumbers, betPerTicket)

  if (flipTicketNumbers !== prevFlipTicketNumbersRef.current) {
    if (flipTicketNumbers?.size > 0) {
      animationTicketsRef.current = flipTicketNumbers
    }
    prevFlipTicketNumbersRef.current = flipTicketNumbers
  }

  const isDrawAnimating = animationTicketsRef.current !== null

  const ticketToSlotMap = useMemo(() => {
    if (ticketToSlot) return ticketToSlot
    const map = new Map()
    sortedOrder.forEach((ticketNumber, slot) => {
      map.set(ticketNumber, slot)
    })
    return map
  }, [sortedOrder, ticketToSlot])

  ticketToSlotMapRef.current = ticketToSlotMap

  const drawAssignments = useMemo(() => {
    if (!animationTicketsRef.current) {
      return null
    }

    return buildPoolAssignments(
      sortedOrder,
      visibleRowRangeRef.current,
      ticketsById,
      ticketToSlotMap,
      [...animationTicketsRef.current],
    )
  }, [flipTicketNumbers, sortedOrder, ticketsById, ticketToSlotMap, drawSyncEpoch])

  const getActiveSlots = useCallback(() => {
    return isDrawAnimating ? ANIMATION_POOL_SIZE : SCROLL_WINDOW_SLOTS
  }, [isDrawAnimating])

  const registerPoolRef = useCallback((poolIndex, element) => {
    if (element) {
      poolRefs.current[poolIndex] = element
      const assignment = assignmentsRef.current[poolIndex]

      if (assignment) {
        applyPoolPosition(element, assignment)
        element.style.visibility = 'visible'
        element.removeAttribute('aria-hidden')
        updateTicketShell(element, assignment, drawStateRef.current)
      } else {
        element.style.visibility = 'hidden'
        element.setAttribute('aria-hidden', 'true')
      }

      return
    }

    const poolElement = poolRefs.current[poolIndex]
    if (poolElement) {
      releaseTicketShell(poolElement)
    }
    delete poolRefs.current[poolIndex]
  }, [])

  const getScrollTop = useCallback(() => {
    return viewportRef.current?.scrollTop ?? 0
  }, [viewportRef])

  const buildScrollAssignments = useCallback((scrollTop) => {
    const range = getVisibleRowRange(scrollTop)
    return {
      range,
      assignments: buildPoolAssignments(
        sortedOrderRef.current,
        range,
        ticketsByIdRef.current,
        ticketToSlotMapRef.current,
      ),
    }
  }, [])

  const applyScrollWindow = useCallback(
    (scrollTop, { force = false } = {}) => {
      if (animationTicketsRef.current && !force) {
        return false
      }

      const { range, assignments: nextAssignments } =
        buildScrollAssignments(scrollTop)
      const prevRange = visibleRowRangeRef.current
      const rangeChanged =
        prevRange.firstRow !== range.firstRow ||
        prevRange.lastRow !== range.lastRow

      if (!force && !rangeChanged) {
        return false
      }

      visibleRowRangeRef.current = range

      const contentChanges = diffAndApplyScrollPool({
        poolRefs: poolRefs.current,
        assignments: assignmentsRef.current,
        layoutState: layoutStateRef.current,
        nextAssignments,
        activeSlots: SCROLL_WINDOW_SLOTS,
      })

      releaseInactivePoolShells(poolRefs.current, SCROLL_WINDOW_SLOTS)

      if (force) {
        applyShellContentToPool(
          poolRefs.current,
          assignmentsRef.current,
          SCROLL_WINDOW_SLOTS,
          drawStateRef.current,
        )
      } else if (contentChanges.length > 0) {
        applyShellContentUpdates(
          poolRefs.current,
          contentChanges,
          assignmentsRef.current,
          drawStateRef.current,
        )
      }

      return true
    },
    [buildScrollAssignments],
  )

  useImperativeHandle(
    ref,
    () => ({
      onScroll(scrollTop) {
        return applyScrollWindow(scrollTop)
      },
      getVisibleRowRange() {
        return visibleRowRangeRef.current
      },
    }),
    [applyScrollWindow],
  )

  useLayoutEffect(() => {
    if (!flipTicketNumbers || flipTicketNumbers.size === 0) {
      return undefined
    }

    window.clearTimeout(sortAnimationTimerRef.current)
    sortAnimationTimerRef.current = window.setTimeout(() => {
      animationTicketsRef.current = null
      lastFlippedDrawRef.current = null
      setDrawSyncEpoch((epoch) => epoch + 1)
      clearFlipWillChange(poolRefs.current)
      releaseInactivePoolShells(poolRefs.current, SCROLL_WINDOW_SLOTS)
      applyScrollWindow(getScrollTop(), { force: true })
    }, FLIP_DURATION_MS)

    return () => window.clearTimeout(sortAnimationTimerRef.current)
  }, [flipTicketNumbers, applyScrollWindow, getScrollTop])

  useLayoutEffect(() => {
    if (!isDrawAnimating || !drawAssignments) return

    applyDrawFlip({
      poolRefs: poolRefs.current,
      assignments: assignmentsRef.current,
      layoutState: layoutStateRef.current,
      nextAssignments: drawAssignments,
      flipTicketNumbers,
      prevSortedOrder,
      animationTicketsRef,
      lastFlippedDrawRef,
    })

    applyShellContentToPool(
      poolRefs.current,
      assignmentsRef.current,
      ANIMATION_POOL_SIZE,
      drawStateRef.current,
    )
  }, [isDrawAnimating, drawAssignments, flipTicketNumbers, prevSortedOrder])

  useLayoutEffect(() => {
    if (animationTicketsRef.current) return
    applyScrollWindow(getScrollTop(), { force: true })
  }, [sortedOrder, applyScrollWindow, getScrollTop])

  useLayoutEffect(() => {
    applyShellDrawStateToPool(
      poolRefs.current,
      assignmentsRef.current,
      getActiveSlots(),
      drawStateRef.current,
    )
  }, [drawnNumbers, betPerTicket, getActiveSlots])

  useEffect(
    () => () => window.clearTimeout(sortAnimationTimerRef.current),
    [],
  )

  const poolIndices = isDrawAnimating ? DRAW_POOL_INDICES : SCROLL_POOL_INDICES

  return (
    <div className="panel-pool-layer">
      {poolIndices.map((poolIndex) => (
        <PooledTicketSlot
          key={poolIndex}
          poolIndex={poolIndex}
          registerPoolRef={registerPoolRef}
        />
      ))}
    </div>
  )
})

export default VisibleTicketPool
