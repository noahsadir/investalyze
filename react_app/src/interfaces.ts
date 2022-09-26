export interface Contract {
  expiration_date_string: string;
  expiration_date_integer_millis: number;
  strike: number;
  option_type: string;
  bid: number;
  ask: number;
  open: number;
  close: number;
  change: number;
  last: number;
  high: number;
  low: number;
  volume: number;
  open_interest: number;
  trade_date_integer_millis: number;
  delta: number;
  gamma: number;
  theta: number;
  rho: number;
  vega: number;
  implied_volatility: number;
  smooth_implied_volatility: number;
  intrinsic_value: number;
  extrinsic_value: number;
  leverage_ratio: number;
  interest_equivalent: number;
  mark: number;
}

export interface LookupTable {
  byExpiration: {[key: string]: LookupTableEntry};
  byStrike: {[key: number]: LookupTableEntry};
}

export interface LookupTableEntry {
  call: string[];
  put: string[];
}

export interface OptionsChain {
  lookup: LookupTable;
  contracts: {[key: string]: Contract};
  spot_price: number;
  fetch_date: number;
}
