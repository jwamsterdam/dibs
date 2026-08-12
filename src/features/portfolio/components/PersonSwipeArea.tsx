import { useRef, useState } from 'react';

const swipeThresholdRatio = 0.25;
const maxSwipeThresholdPx = 80;

/**
 * Pure threshold math for "which account did this drag land on" — kept separate from the
 * pointer-event plumbing below so it's directly unit-testable (jsdom can't meaningfully
 * simulate a real drag gesture; that gets a manual browser check instead).
 */
export function getSwipeTargetIndex(
  currentIndex: number,
  deltaX: number,
  containerWidth: number,
  personCount: number,
): number {
  if (personCount <= 1) {
    return currentIndex;
  }

  const threshold = Math.min(containerWidth * swipeThresholdRatio, maxSwipeThresholdPx);
  if (deltaX <= -threshold) {
    return Math.min(currentIndex + 1, personCount - 1);
  }
  if (deltaX >= threshold) {
    return Math.max(currentIndex - 1, 0);
  }
  return currentIndex;
}

type DragState = {
  readonly pointerId: number;
  readonly startX: number;
  readonly deltaX: number;
};

type PersonSwipeAreaProps = {
  readonly activeIndex: number;
  readonly personCount: number;
  readonly onIndexChange: (index: number) => void;
  readonly children: React.ReactNode;
};

/**
 * Wraps the swipeable body content: a horizontal drag past the threshold swaps the active
 * account. Only the active account's data is ever fetched (see usePortfolioController), so
 * this only ever slides the current single rendered view — crossing the threshold swaps it
 * for the next account's (possibly cached, possibly loading) content, rather than dragging a
 * pre-loaded neighboring pane into view.
 */
export function PersonSwipeArea({
  activeIndex,
  personCount,
  onIndexChange,
  children,
}: PersonSwipeAreaProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>): void {
    if (personCount <= 1) {
      return;
    }
    // Not every environment implements pointer capture (jsdom doesn't) — the drag still works
    // without it, capture just keeps it going if the pointer leaves the element's bounds.
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragState({ deltaX: 0, pointerId: event.pointerId, startX: event.clientX });
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>): void {
    if (dragState === null || event.pointerId !== dragState.pointerId) {
      return;
    }
    const rawDeltaX = event.clientX - dragState.startX;
    // Resistance at the first/last account so you can't drag past either end.
    const atStart = activeIndex === 0 && rawDeltaX > 0;
    const atEnd = activeIndex === personCount - 1 && rawDeltaX < 0;
    const deltaX = atStart || atEnd ? rawDeltaX / 3 : rawDeltaX;
    setDragState({ ...dragState, deltaX });
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>): void {
    if (dragState === null || event.pointerId !== dragState.pointerId) {
      return;
    }
    const containerWidth = containerRef.current?.clientWidth ?? 1;
    const targetIndex = getSwipeTargetIndex(
      activeIndex,
      dragState.deltaX,
      containerWidth,
      personCount,
    );
    setDragState(null);
    if (targetIndex !== activeIndex) {
      onIndexChange(targetIndex);
    }
  }

  const dragOffset = dragState?.deltaX ?? 0;

  return (
    <div
      className="flex min-h-0 flex-1 touch-pan-y select-none flex-col overflow-hidden"
      data-testid="person-swipe-area"
      onPointerCancel={endDrag}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      ref={containerRef}
    >
      <div
        className={`flex min-h-0 flex-1 flex-col ${dragState === null ? 'transition-transform duration-200 ease-out' : ''}`}
        style={{ transform: `translateX(${dragOffset}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
