import {
  ANIMATION_POOL_SIZE,
  buildTicketSlotMap,
  FLIP_TRANSITION,
  getSlotPosition,
  SCROLL_WINDOW_SLOTS,
} from './useFlipTicketGrid.js'

export function createEmptyAssignments() {
  return Array(ANIMATION_POOL_SIZE).fill(null)
}

export function createEmptyLayoutState() {
  return Array(ANIMATION_POOL_SIZE).fill(null)
}

export function applyPoolPosition(element, position) {
  element.style.transition = 'none'
  element.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`
}

export function diffAndApplyScrollPool({
  poolRefs,
  assignments,
  layoutState,
  nextAssignments,
  activeSlots = SCROLL_WINDOW_SLOTS,
}) {
  const contentChanges = []

  for (let index = 0; index < activeSlots; index++) {
    const next = nextAssignments[index] ?? null
    const prev = assignments[index]
    const element = poolRefs[index]

    if (
      next?.ticketNumber !== prev?.ticketNumber ||
      next?.numbers !== prev?.numbers
    ) {
      contentChanges.push(index)
    }

    assignments[index] = next

    if (!element) continue

    const prevLayout = layoutState[index]

    if (!next) {
      if (prevLayout?.visible !== false) {
        element.style.visibility = 'hidden'
        element.setAttribute('aria-hidden', 'true')
        layoutState[index] = { visible: false }
      }
      continue
    }

    const posChanged =
      !prevLayout ||
      prevLayout.x !== next.x ||
      prevLayout.y !== next.y

    if (posChanged) {
      applyPoolPosition(element, next)
    }

    if (prevLayout?.visible !== true) {
      element.style.visibility = 'visible'
      element.removeAttribute('aria-hidden')
    }

    layoutState[index] = {
      visible: true,
      x: next.x,
      y: next.y,
      ticketNumber: next.ticketNumber,
    }
  }

  for (let index = activeSlots; index < ANIMATION_POOL_SIZE; index++) {
    if (!assignments[index] && layoutState[index]?.visible === false) {
      continue
    }

    assignments[index] = null
    const element = poolRefs[index]

    if (element && layoutState[index]?.visible !== false) {
      element.style.visibility = 'hidden'
      element.setAttribute('aria-hidden', 'true')
      layoutState[index] = { visible: false }
    } else if (!element) {
      layoutState[index] = { visible: false }
    }
  }

  return contentChanges
}

export function applyDrawFlip({
  poolRefs,
  assignments,
  layoutState,
  nextAssignments,
  flipTicketNumbers,
  prevSortedOrder,
  animationTicketsRef,
  lastFlippedDrawRef,
}) {
  const flipSet = flipTicketNumbers
  const isFlipStart =
    flipSet?.size > 0 && flipSet !== lastFlippedDrawRef.current

  if (isFlipStart) {
    lastFlippedDrawRef.current = flipSet
  }

  const prevOrderSlots =
    isFlipStart && prevSortedOrder.length > 0
      ? buildTicketSlotMap(prevSortedOrder)
      : null

  const isAnimating = animationTicketsRef.current !== null
  const activeSlots = ANIMATION_POOL_SIZE

  for (let index = 0; index < activeSlots; index++) {
    const next = nextAssignments[index] ?? null
    const element = poolRefs[index]

    assignments[index] = next

    if (!element) continue

    const prevLayout = layoutState[index]

    if (!next) {
      element.classList.remove('panel-pool-slot--animating')
      if (prevLayout?.visible !== false) {
        element.style.visibility = 'hidden'
        element.setAttribute('aria-hidden', 'true')
        layoutState[index] = { visible: false }
      }
      continue
    }

    if (prevLayout?.visible !== true) {
      element.style.visibility = 'visible'
      element.removeAttribute('aria-hidden')
    }

    const newPos = { x: next.x, y: next.y }

    let oldPos = null
    if (isFlipStart && flipSet?.has(next.ticketNumber) && prevOrderSlots) {
      const oldSlot = prevOrderSlots.get(next.ticketNumber)
      if (oldSlot !== undefined) {
        oldPos = getSlotPosition(oldSlot)
      }
    }

    const shouldFlip =
      oldPos && (oldPos.x !== newPos.x || oldPos.y !== newPos.y)

    if (shouldFlip) {
      element.classList.add('panel-pool-slot--animating')
      applyPoolPosition(element, oldPos)
      element.getBoundingClientRect()
      element.style.transition = FLIP_TRANSITION
      element.style.transform = `translate3d(${newPos.x}px, ${newPos.y}px, 0)`
    } else if (isAnimating && flipSet?.has(next.ticketNumber) && !isFlipStart) {
      continue
    } else {
      element.classList.remove('panel-pool-slot--animating')
      const posChanged =
        !prevLayout ||
        prevLayout.x !== newPos.x ||
        prevLayout.y !== newPos.y

      if (posChanged) {
        applyPoolPosition(element, newPos)
      }
    }

    layoutState[index] = {
      visible: true,
      x: newPos.x,
      y: newPos.y,
      ticketNumber: next.ticketNumber,
    }
  }
}

export function clearFlipWillChange(poolRefs) {
  for (let index = 0; index < ANIMATION_POOL_SIZE; index++) {
    poolRefs[index]?.classList.remove('panel-pool-slot--animating')
  }
}
