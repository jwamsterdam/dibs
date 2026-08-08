# Dibs Specifications

Specs in this folder should describe Dibs behavior in Given/When/Then form.

Suggested MVP specs:

- Portfolio overview opens at `/`
- Period selection updates rows and chart
- Asset selection updates the chart dataset
- Change values toggle between absolute and percentage
- ETH staking rewards render as one calm row
- Portfolio configuration stays local and never appears in the URL
- Settings let a person configure their name, fiat currency, and coin holdings
- Configuring at least one holding switches the portfolio to live CoinGecko data; removing
  all holdings falls back to the read-only mock snapshot
- A failed CoinGecko fetch shows a status message and falls back to the mock snapshot
  instead of a blank screen

Future specs:

- Settings for validator pubkeys/indices (ETH staking)
- Secure mode unlock and encrypted local storage
- Encrypted backup export/import
