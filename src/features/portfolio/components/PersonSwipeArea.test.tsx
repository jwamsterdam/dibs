import { fireEvent, render, screen } from '@testing-library/react';
import { getSwipeTargetIndex, PersonSwipeArea } from './PersonSwipeArea';

describe('getSwipeTargetIndex', () => {
  it('stays put when there is only one (or zero) accounts, regardless of drag distance', () => {
    expect(getSwipeTargetIndex(0, -500, 400, 1)).toBe(0);
    expect(getSwipeTargetIndex(0, 500, 400, 0)).toBe(0);
  });

  it('stays put when the drag is below the threshold', () => {
    expect(getSwipeTargetIndex(1, -10, 400, 3)).toBe(1);
    expect(getSwipeTargetIndex(1, 10, 400, 3)).toBe(1);
  });

  it('advances to the next account on a decisive leftward drag', () => {
    expect(getSwipeTargetIndex(0, -120, 400, 3)).toBe(1);
  });

  it('goes back to the previous account on a decisive rightward drag', () => {
    expect(getSwipeTargetIndex(1, 120, 400, 3)).toBe(0);
  });

  it('clamps at the last account instead of overshooting', () => {
    expect(getSwipeTargetIndex(2, -120, 400, 3)).toBe(2);
  });

  it('clamps at the first account instead of undershooting', () => {
    expect(getSwipeTargetIndex(0, 120, 400, 3)).toBe(0);
  });

  it('caps the threshold in pixels rather than always scaling with a wide container', () => {
    // 25% of 2000px would be 500px — far more than a thumb can realistically drag — so the
    // threshold caps at 80px instead.
    expect(getSwipeTargetIndex(0, -90, 2_000, 3)).toBe(1);
  });
});

describe('PersonSwipeArea', () => {
  it('renders its children', () => {
    render(
      <PersonSwipeArea activeIndex={0} onIndexChange={jest.fn()} personCount={3}>
        <p>Body content</p>
      </PersonSwipeArea>,
    );

    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  // jsdom's PointerEvent support doesn't carry pointerId/clientX through fireEvent, so the
  // coordinate-driven drag itself can't be meaningfully exercised here — getSwipeTargetIndex
  // above covers that math directly, and the real gesture gets a manual browser check.
  it('ignores pointer gestures entirely when there is only one account', () => {
    const onIndexChange = jest.fn();
    render(
      <PersonSwipeArea activeIndex={0} onIndexChange={onIndexChange} personCount={1}>
        <p>Body content</p>
      </PersonSwipeArea>,
    );

    const area = screen.getByTestId('person-swipe-area');

    fireEvent.pointerDown(area, { clientX: 200, pointerId: 1 });
    fireEvent.pointerMove(area, { clientX: 40, pointerId: 1 });
    fireEvent.pointerUp(area, { clientX: 40, pointerId: 1 });

    expect(onIndexChange).not.toHaveBeenCalled();
  });
});
