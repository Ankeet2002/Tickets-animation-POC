import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  selectBetPerTicket,
  selectDrawnNumbers,
  selectSortedTickets,
} from '../../store/selectors.js'
import VisibleTicketPool from './VisibleTicketPool.jsx'
import {
  getSortAnimationTickets,
  getVisibleRowRange,
  useTicketGridData,
} from './useFlipTicketGrid.js'
import './Panel.css'

function Panel() {
  const tickets = useSelector(selectSortedTickets)
  const drawnNumbers = useSelector(selectDrawnNumbers)
  const betPerTicket = useSelector(selectBetPerTicket)
  const viewportRef = useRef(null)
  const contentPoolRef = useRef(null)
  const scrollbarTrackRef = useRef(null)
  const scrollbarThumbRef = useRef(null)
  const scrollRafRef = useRef(0)
  const prevSortedOrderRef = useRef([])
  const visibleRowRangeRef = useRef(getVisibleRowRange(0))
  const scrollbarMetricsRef = useRef({
    visible: false,
    thumbHeight: 0,
  })
  const [scrollbarVisible, setScrollbarVisible] = useState(false)

  const { sortedOrder, ticketsById, ticketToSlot, totalH } =
    useTicketGridData(tickets)

  const flipTicketNumbers = useMemo(
    () =>
      getSortAnimationTickets(
        prevSortedOrderRef.current,
        sortedOrder,
        visibleRowRangeRef.current,
      ),
    [sortedOrder],
  )

  useLayoutEffect(() => {
    prevSortedOrderRef.current = sortedOrder
  }, [sortedOrder])

  const updateScrollbar = useCallback(() => {
    const viewport = viewportRef.current
    const track = scrollbarTrackRef.current
    const thumb = scrollbarThumbRef.current
    if (!viewport || !track || !thumb) return

    const { scrollTop, scrollHeight, clientHeight } = viewport
    const canScroll = scrollHeight > clientHeight + 1

    if (!canScroll) {
      if (scrollbarMetricsRef.current.visible) {
        scrollbarMetricsRef.current = { visible: false, thumbHeight: 0 }
        setScrollbarVisible(false)
      }
      return
    }

    const trackHeight = clientHeight
    const thumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, 28)
    const maxThumbTop = trackHeight - thumbHeight
    const scrollRatio = scrollTop / (scrollHeight - clientHeight)
    const thumbTop = scrollRatio * maxThumbTop

    thumb.style.height = `${thumbHeight}px`
    thumb.style.transform = `translateY(${thumbTop}px)`

    const metrics = scrollbarMetricsRef.current
    if (!metrics.visible || metrics.thumbHeight !== thumbHeight) {
      scrollbarMetricsRef.current = { visible: true, thumbHeight }
      setScrollbarVisible(true)
    }
  }, [])

  const handleScroll = useCallback(() => {
    if (scrollRafRef.current) return

    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = 0
      const viewport = viewportRef.current
      if (!viewport) return

      updateScrollbar()
      visibleRowRangeRef.current = getVisibleRowRange(viewport.scrollTop)
      contentPoolRef.current?.onScroll(viewport.scrollTop)
    })
  }, [updateScrollbar])

  useEffect(() => {
    const viewport = viewportRef.current
    if (viewport) {
      visibleRowRangeRef.current = getVisibleRowRange(viewport.scrollTop)
      contentPoolRef.current?.onScroll(viewport.scrollTop)
    }
    updateScrollbar()
    window.addEventListener('resize', updateScrollbar)
    return () => {
      window.removeEventListener('resize', updateScrollbar)
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current)
      }
    }
  }, [tickets, updateScrollbar])

  function handleTrackClick(event) {
    const viewport = viewportRef.current
    const track = event.currentTarget
    if (!viewport || !track) return

    const trackRect = track.getBoundingClientRect()
    const clickY = event.clientY - trackRect.top
    const scrollable = viewport.scrollHeight - viewport.clientHeight
    const targetTop =
      (clickY / track.clientHeight) * scrollable - viewport.clientHeight / 2

    viewport.scrollTop = Math.max(0, Math.min(scrollable, targetTop))
  }

  return (
    <div className="panel-wrapper">
      <div className="panel">
        <div
          className="panel-viewport"
          ref={viewportRef}
          onScroll={handleScroll}
        >
          <div className="panel-grid-spacer" style={{ height: totalH }} />

          <VisibleTicketPool
            ref={contentPoolRef}
            viewportRef={viewportRef}
            sortedOrder={sortedOrder}
            prevSortedOrder={prevSortedOrderRef.current}
            ticketsById={ticketsById}
            ticketToSlot={ticketToSlot}
            flipTicketNumbers={flipTicketNumbers}
            drawnNumbers={drawnNumbers}
            betPerTicket={betPerTicket}
          />
        </div>
      </div>

      <div
        ref={scrollbarTrackRef}
        className={`panel-scrollbar${scrollbarVisible ? '' : ' panel-scrollbar--idle'}`}
        onClick={scrollbarVisible ? handleTrackClick : undefined}
      >
        <div
          ref={scrollbarThumbRef}
          className="panel-scrollbar-thumb"
          style={{ display: scrollbarVisible ? undefined : 'none' }}
        />
      </div>
    </div>
  )
}

export default Panel
