import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssetRow } from './AssetRow';

describe('AssetRow', () => {
  it('pins the asset name to the left side of its grid cell', () => {
    render(
      <AssetRow
        absoluteChange="+EUR 120"
        changeDisplayMode="absolute"
        changeValue={120}
        isSelected={false}
        isTotal={false}
        label="BTC"
        onSelect={jest.fn()}
        onToggleChangeDisplayMode={jest.fn()}
        percentageChange="+1.2%"
        selectLabel="Select BTC"
        toggleChangeLabel="Toggle change for BTC"
        value="EUR 50.000"
      />,
    );

    expect(screen.getByText('BTC')).toHaveClass('justify-self-start', 'text-left');
  });

  it('keeps selection and change toggles as separate controls', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const onToggleChangeDisplayMode = jest.fn();

    render(
      <AssetRow
        absoluteChange="+EUR 120"
        changeDisplayMode="absolute"
        changeValue={120}
        isSelected
        isTotal={false}
        label="BTC"
        onSelect={onSelect}
        onToggleChangeDisplayMode={onToggleChangeDisplayMode}
        percentageChange="+1.2%"
        selectLabel="Select BTC"
        toggleChangeLabel="Toggle change for BTC"
        value="EUR 50.000"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Select BTC' }));
    await user.click(screen.getByRole('button', { name: 'Toggle change for BTC' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onToggleChangeDisplayMode).toHaveBeenCalledTimes(1);
  });
});
