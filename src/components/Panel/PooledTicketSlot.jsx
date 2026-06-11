import { memo, useCallback } from 'react'

function PooledTicketSlot({ poolIndex, registerPoolRef }) {
  const ref = useCallback(
    (element) => registerPoolRef(poolIndex, element),
    [poolIndex, registerPoolRef],
  )

  return <div ref={ref} className="panel-pool-slot" aria-hidden />
}

export default memo(PooledTicketSlot)
