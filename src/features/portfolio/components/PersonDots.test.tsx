import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PersonDots } from './PersonDots';

const onlyPerson = { id: 'a', name: 'JW' };
const people = [onlyPerson, { id: 'b', name: 'Jan' }, { id: 'c', name: 'Piet' }];

const getDotLabel = (name: string): string => `Go to ${name}`;

describe('PersonDots', () => {
  it('renders nothing for zero or one account', () => {
    const { container: emptyContainer } = render(
      <PersonDots
        activeIndex={0}
        getDotLabel={getDotLabel}
        onSelectIndex={jest.fn()}
        people={[]}
      />,
    );
    const { container: singleContainer } = render(
      <PersonDots
        activeIndex={0}
        getDotLabel={getDotLabel}
        onSelectIndex={jest.fn()}
        people={[onlyPerson]}
      />,
    );

    expect(emptyContainer).toBeEmptyDOMElement();
    expect(singleContainer).toBeEmptyDOMElement();
  });

  it('renders one dot per account and marks the active one', () => {
    render(
      <PersonDots
        activeIndex={1}
        getDotLabel={getDotLabel}
        onSelectIndex={jest.fn()}
        people={people}
      />,
    );

    expect(screen.getByRole('button', { name: 'Go to JW' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('button', { name: 'Go to Jan' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Go to Piet' })).not.toHaveAttribute('aria-current');
  });

  it('invokes onSelectIndex with the tapped dot index', async () => {
    const user = userEvent.setup();
    const onSelectIndex = jest.fn();
    render(
      <PersonDots
        activeIndex={0}
        getDotLabel={getDotLabel}
        onSelectIndex={onSelectIndex}
        people={people}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Go to Piet' }));

    expect(onSelectIndex).toHaveBeenCalledWith(2);
  });
});
