# Investalyze

A human-friendly interface for visualizing stock market and options data.

## Features

### Visualize Raw Data
- View raw data from options chain, such as the volume or open interest of
different contracts.
- Visualize data in various ways, such as a line or bar chart.

### View Metrics
- Investalyze calculates various metrics using data from the options chain.
- View implied move, max pain, and overall options volume of a particular equity.

### Trading Strategies
- Form different options strategies, such as spreads, condors, and covered calls.
- See historical performance of a strategy along with its forecasted value.

## API

### options_chain

Get options chain and related data for a particular equity.

#### Accepts
```
{
  "symbol": string,
  "api_key": string
}
```

#### Returns
```
{
  lookup: {
    byExpiration: {
      (string): {
        call: (string[]),
        put: (string[])
      },
      ...
    },
    byStrike: {
      (string): {
        call: (string[]),
        put: (string[])
      },
      ...
    }
  },
  contracts: {
    (string): {
      expiration_date_string: (string),
      strike: (number),
      option_type: (string),
      bid: (number),
      ask: (number),
      open: (number),
      close: (number),
      change: (number),
      last: (number),
      high: (number),
      low: (number),
      volume: (number),
      open_interest: (number),
      trade_date_integer_millis: (number),
      delta: (number),
      gamma: (number),
      theta: (number),
      rho: (number),
      vega: (number),
      implied_volatility: (number),
      smooth_implied_volatility: (number)
    },
    ...
  },
  historical: [
    {
      day: string,
      open: number,
      close: number,
      high: number,
      low: number,
      volume: number
    },
    ...
  ],
  quote: {
    symbol: (string),
    name: (string),
    spot_price: (number),
    change: (number)
  },
  spot_price: (number)
  fetch_date: (number)
}
```

### historical

Get historical data for symbol over a specified time period.

Also applies to options contracts (e.g. MSFT230120C00220000)

#### Accepts
```
{
  "symbols": string[],
  "api_key": string
  "duration": string
}
```

#### Returns
```
{
  (string): [
    {
      day: string,
      open: number,
      close: number,
      high: number,
      low: number,
      volume: number
    },
    ...
  ],
  ...
}
```
