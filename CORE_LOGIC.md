# Virtual Scroll — Main Logic

**Demo:** [tickets-animation-poc-black.vercel.app](https://tickets-animation-poc-black.vercel.app)

This POC has 1000 tickets in state but only **32 fixed DOM nodes** on screen while scrolling. This doc explains that virtual-scroll approach so the team can see what I am trying to prove.

---

## The idea

Normal list: **1 ticket = 1 DOM node**. At 1000 tickets that is 1000 nodes in the tree.

This approach:

1. Keep all tickets in memory as a **sorted array** (`sortedOrder`) — slot `0` is top-left, slot `1` is next column, etc.
2. Use a **tall spacer** inside the scroll viewport so the scrollbar behaves like a full grid.
3. Render only a **fixed pool** of ~32 absolutely positioned divs.
4. On scroll, figure out which logical slots are visible and **reassign** pool divs to show those tickets.

The pool divs are recycled. A single physical DOM node might show ticket #47, then scroll away and later show ticket #312.

```
Logical grid (1000 tickets, in memory only)
┌────┬────┬────┬────┐
│  1 │  2 │  3 │  4 │  row 0
├────┼────┼────┼────┤
│  5 │  6 │  7 │  8 │  row 1
├────┼────┼────┼────┤
│ .. │ .. │ .. │ .. │
└────┴────┴────┴────┘
        ↑ only ~8 rows worth of slots are assigned to the DOM pool at once

Physical DOM (always 32 nodes)
┌──────────────────────────────┐
│  pool[0]  pool[1]  ... pool[31]  │  ← same nodes, new ticket + position each scroll
└──────────────────────────────┘
```

---

## Step 1 — Fake the full grid height

The viewport scrolls, but we do not render every row. A spacer div sets the scrollable height.

```jsx
// Panel.jsx
const { sortedOrder, ticketsById, ticketToSlot, totalH } = useTicketGridData(tickets)

<div className="panel-viewport" ref={viewportRef} onScroll={handleScroll}>
  <div className="panel-grid-spacer" style={{ height: totalH }} />
  <VisibleTicketPool ... />
</div>
```

```js
// useFlipTicketGrid.js
const totalRows = Math.max(1, Math.ceil(tickets.length / COLS))
const totalH = Math.max(VIEWPORT_H, totalRows * CELL_H - GAP)
```

`totalH` makes the scrollbar correct for 1000 tickets even though only 32 are mounted.

---

## Step 2 — Map scroll position → visible row range

From `scrollTop`, compute which rows should be in the DOM. We add a **2-row buffer** above and below the viewport so fast scroll does not show empty space immediately.

```js
// useFlipTicketGrid.js
export const COLS = 4
export const VISIBLE_ROWS = 4
export const VISIBILITY_BUFFER_ROWS = 2
export const SCROLL_WINDOW_SLOTS =
  (VISIBLE_ROWS + VISIBILITY_BUFFER_ROWS * 2) * COLS  // 8 rows × 4 cols = 32

export function getVisibleRowRange(scrollTop, bufferRows = VISIBILITY_BUFFER_ROWS) {
  const scrolledRow = Math.floor(scrollTop / CELL_H)
  return {
    firstRow: Math.max(0, scrolledRow - bufferRows),
    lastRow: scrolledRow + VISIBLE_ROWS - 1 + bufferRows,
  }
}
```

Example: if the user has scrolled to row 10, we might keep rows 8–15 in the pool (4 visible + 2 buffer each side).

---

## Step 3 — Map row range → logical slot indices

Each ticket has a **slot index** in the sorted grid (0-based, left-to-right, top-to-bottom).

```js
// useFlipTicketGrid.js
export function getVisibleSlots(ticketCount, rowRange) {
  if (ticketCount === 0) return []

  const firstSlot = rowRange.firstRow * COLS
  const lastSlot = Math.min(
    (rowRange.lastRow + 1) * COLS - 1,
    ticketCount - 1,
  )
  const slots = []

  for (let slot = firstSlot; slot <= lastSlot; slot++) {
    slots.push(slot)
  }

  return slots
}
```

`sortedOrder[slot]` gives the ticket number at that grid position.

---

## Step 4 — Build pool assignments

Pool index `0..31` is **not** the same as grid slot. Pool index is just "the Nth physical DOM node". We fill each pool slot with whichever ticket is currently visible.

```js
// useFlipTicketGrid.js
export function getSlotPosition(slot) {
  const row = Math.floor(slot / COLS)
  const col = slot % COLS
  return { x: col * CELL_W, y: row * CELL_H }
}

export function buildPoolAssignments(sortedOrder, rowRange, ticketsById, ticketToSlot) {
  const items = []

  for (const slot of getVisibleSlots(sortedOrder.length, rowRange)) {
    const ticketNumber = sortedOrder[slot]
    const ticket = ticketsById.get(ticketNumber)
    if (!ticket) continue

    const position = getSlotPosition(slot)
    items.push({
      slot,
      ticketNumber: ticket.ticketNumber,
      numbers: ticket.numbers,
      x: position.x,
      y: position.y,
    })
  }

  const assignments = Array(SCROLL_WINDOW_SLOTS).fill(null)
  for (let index = 0; index < Math.min(items.length, SCROLL_WINDOW_SLOTS); index++) {
    assignments[index] = items[index]
  }

  return assignments
}
```

Each assignment says: **pool div #index** should show **this ticket** at **this x/y** in the grid.

Positions use `translate3d` so tickets sit in the correct cell without being in normal document flow.

---

## Step 5 — Fixed React pool (32 empty divs)

React only mounts the pool once. It does not map `tickets.map(...)`.

```jsx
// VisibleTicketPool.jsx — scroll mode renders 32 slots
const SCROLL_POOL_INDICES = Array.from({ length: SCROLL_WINDOW_SLOTS }, (_, i) => i)

{SCROLL_POOL_INDICES.map((poolIndex) => (
  <PooledTicketSlot key={poolIndex} poolIndex={poolIndex} registerPoolRef={registerPoolRef} />
))}
```

```jsx
// PooledTicketSlot.jsx — just an empty positioned shell
<div ref={ref} className="panel-pool-slot" />
```

Ticket visuals are painted into these shells imperatively (separate from virtual scroll), but the **scroll performance win** comes from never growing this list beyond 32.

---

## Step 6 — On scroll: diff old vs new assignments

Scroll handler is rAF-throttled in `Panel.jsx`:

```js
const handleScroll = useCallback(() => {
  if (scrollRafRef.current) return

  scrollRafRef.current = requestAnimationFrame(() => {
    scrollRafRef.current = 0
    contentPoolRef.current?.onScroll(viewport.scrollTop)
  })
}, [])
```

`VisibleTicketPool.applyScrollWindow` is the virtual-scroll core:

```js
// VisibleTicketPool.jsx
const applyScrollWindow = useCallback((scrollTop, { force = false } = {}) => {
  const { range, assignments: nextAssignments } = buildScrollAssignments(scrollTop)

  const prevRange = visibleRowRangeRef.current
  const rangeChanged =
    prevRange.firstRow !== range.firstRow ||
    prevRange.lastRow !== range.lastRow

  // Skip work if scroll did not cross into a new row window
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

  // Only repaint ticket content for pool indices that changed ticket
  if (contentChanges.length > 0) {
    applyShellContentUpdates(poolRefs.current, contentChanges, assignmentsRef.current, drawStateRef.current)
  }

  return true
}, [buildScrollAssignments])
```

Important optimisations here:

- **Range gate** — if `scrollTop` moves inside the same row window, do nothing.
- **Position vs content split** — moving a pool div is cheap (`transform`); swapping ticket data is tracked separately via `contentChanges`.

---

## Step 7 — Apply positions and recycle pool nodes

`diffAndApplyScrollPool` walks the 32 pool slots and updates the DOM imperatively:

```js
// poolController.js
export function applyPoolPosition(element, position) {
  element.style.transition = 'none'
  element.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`
}

export function diffAndApplyScrollPool({ poolRefs, assignments, layoutState, nextAssignments, activeSlots }) {
  const contentChanges = []

  for (let index = 0; index < activeSlots; index++) {
    const next = nextAssignments[index] ?? null
    const prev = assignments[index]
    const element = poolRefs[index]

    // Did this physical pool slot get a different ticket?
    if (next?.ticketNumber !== prev?.ticketNumber || next?.numbers !== prev?.numbers) {
      contentChanges.push(index)
    }

    assignments[index] = next
    if (!element) continue

    if (!next) {
      element.style.visibility = 'hidden'
      continue
    }

    const posChanged = !layoutState[index] || layoutState[index].x !== next.x || layoutState[index].y !== next.y
    if (posChanged) {
      applyPoolPosition(element, next)
    }

    element.style.visibility = 'visible'
    layoutState[index] = { visible: true, x: next.x, y: next.y, ticketNumber: next.ticketNumber }
  }

  return contentChanges
}
```

What happens when you scroll down one row:

1. `getVisibleRowRange` shifts → new logical slots enter the window.
2. `buildPoolAssignments` builds a fresh mapping.
3. Some pool divs **move** to new `x/y` (same ticket, new position).
4. Some pool divs get a **new ticket** → `contentChanges` → imperative content update.
5. Pool divs with no assignment are `visibility: hidden`, not unmounted.

---

## End-to-end flow

```
scrollTop
   │
   ▼
getVisibleRowRange()          → { firstRow, lastRow }
   │
   ▼
getVisibleSlots()             → [48, 49, 50, ...]
   │
   ▼
buildPoolAssignments()        → [{ ticketNumber, x, y }, ...] × 32
   │
   ▼
diffAndApplyScrollPool()      → move/hide pool divs, return contentChanges
   │
   ▼
applyShellContentUpdates()    → only for indices in contentChanges
```

---

## What I am trying to prove

| Without virtual scroll | With this approach |
|------------------------|-------------------|
| 1000 ticket components / DOM trees | 32 fixed pool nodes |
| React reconciles huge lists | React mounts pool once; scroll path is imperative |
| Memory + layout cost grows with tickets | DOM cost stays flat |

**Known trade-off:** very fast scrolling can still CPU-spike because each new row window triggers pool reassignment and content swaps. The buffer rows and range gate reduce how often that happens.

---

## Files to read (virtual scroll only)

| File | What to look at |
|------|-----------------|
| `src/components/Panel/useFlipTicketGrid.js` | `getVisibleRowRange`, `getVisibleSlots`, `buildPoolAssignments` |
| `src/components/Panel/VisibleTicketPool.jsx` | `applyScrollWindow`, `onScroll` imperative handle |
| `src/components/Panel/poolController.js` | `diffAndApplyScrollPool`, `applyPoolPosition` |
| `src/components/Panel/Panel.jsx` | spacer height, rAF scroll handler |
