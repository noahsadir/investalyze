# Investalyze

A human-friendly interface for stock market and options data.

## Basics


## API

- `options_chain`

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
  fetch_date: (number)
}
```
