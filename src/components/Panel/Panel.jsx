import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  selectBetPerTicket,
  selectDrawnNumbers,
  selectSortedTickets,
} from '../../store/selectors.js'
import Ticket from '../Ticket/Ticket.jsx'
import { useFlipTicketGrid } from './useFlipTicketGrid.js'
import './Panel.css'

function Panel() {
  const tickets = useSelector(selectSortedTickets)
  const drawnNumbers = useSelector(selectDrawnNumbers)
  const betPerTicket = useSelector(selectBetPerTicket)
  const viewportRef = useRef(null)
  const [scrollbar, setScrollbar] = useState({
    visible: false,
    thumbHeight: 0,
    thumbTop: 0,
  })

  const { sortedOrder, registerNodeRef, ticketsById, totalH } =
    useFlipTicketGrid(tickets)

  const updateScrollbar = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const { scrollTop, scrollHeight, clientHeight } = viewport
    const canScroll = scrollHeight > clientHeight + 1

    if (!canScroll) {
      setScrollbar({ visible: false, thumbHeight: 0, thumbTop: 0 })
      return
    }

    const trackHeight = clientHeight
    const thumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, 28)
    const maxThumbTop = trackHeight - thumbHeight
    const scrollRatio = scrollTop / (scrollHeight - clientHeight)

    setScrollbar({
      visible: true,
      thumbHeight,
      thumbTop: scrollRatio * maxThumbTop,
    })
  }, [])

  const handleScroll = useCallback(() => {
    updateScrollbar()
  }, [updateScrollbar])

  useEffect(() => {
    updateScrollbar()
    window.addEventListener('resize', updateScrollbar)
    return () => window.removeEventListener('resize', updateScrollbar)
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

          {sortedOrder.map((ticketNumber) => {
            const ticket = ticketsById.get(ticketNumber)
            if (!ticket) return null

            return (
              <div
                key={ticketNumber}
                ref={(element) => registerNodeRef(ticketNumber, element)}
                className="panel-ticket-node"
              >
                <Ticket
                  ticketNumber={ticket.ticketNumber}
                  numbers={ticket.numbers}
                  drawnNumbers={drawnNumbers}
                  betPerTicket={betPerTicket}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div
        className={`panel-scrollbar${scrollbar.visible ? '' : ' panel-scrollbar--idle'}`}
        onClick={scrollbar.visible ? handleTrackClick : undefined}
      >
        {scrollbar.visible && (
          <div
            className="panel-scrollbar-thumb"
            style={{
              height: scrollbar.thumbHeight,
              transform: `translateY(${scrollbar.thumbTop}px)`,
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Panel
