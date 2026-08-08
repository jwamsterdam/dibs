# Project Brief: Dibs Crypto Portfolio React PWA

## Goal

Dibs is an iPhone-first React PWA for viewing a crypto portfolio per person. The app must
feel calm, Apple-like, and privacy-friendly: no account, no backend in the MVP, no
portfolio data in URLs, and only useful information on screen.

## MVP Experience

The user opens the app and sees:

- the active person, for example `JW`
- period tabs: `1D`, `1W`, `1M`, `YTD`, `1Y`, `ALL`
- a compact list with `Totaal` and individual assets
- a subtle blue vertical indicator next to the selected row
- a Recharts chart for the selected row
- one ETH staking rewards row at the bottom

The list is the navigation. Tapping a row only selects the chart dataset.

## Data And Privacy

MVP data is local mock/read-only data. Future settings will support people, assets,
amounts, and Ethereum validator pubkeys/indices. Portfolio configuration must stay local,
preferably in IndexedDB. Secure mode should use PBKDF2 and AES-GCM through Web Crypto.

Future online providers:

- CoinGecko for spot and historical prices
- Ethereum Beacon/validator APIs for staking rewards

## UI Direction

- Minimal, white, iOS/macOS-inspired
- No cards, shadows, decorative gradients, or chevrons behind rows
- Right-aligned values
- Subtle dividers
- Blue selected-row indicator and chart line
- One change display per row: absolute by default, percentage after tapping the change

## Acceptance Criteria

- The app opens directly to the Dibs portfolio view.
- `Totaal` and each asset row are selectable.
- No asset row has a chevron or detail navigation.
- Period tabs affect row changes and chart data.
- Change values toggle between absolute and percentage.
- The chart uses Recharts and follows the Figma reference direction.
- ETH staking rewards render as one quiet row.
- Portfolio data is not encoded in the URL.
- The app remains readable and polished on iPhone-sized viewports.
