/**
 * interfaces.ts
 *
 * Data structures used by app
 */

export const ContractFields: string[] = [
  "expiration_date_string",
  "expiration_date_integer_millis",
  "strike",
  "option_type",
  "bid",
  "ask",
  "open",
  "close",
  "change",
  "last",
  "high",
  "low",
  "volume",
  "open_interest",
  "trade_date_integer_millis",
  "delta",
  "gamma",
  "theta",
  "rho",
  "vega",
  "implied_volatility",
  "smooth_implied_volatility",
  "intrinsic_value",
  "extrinsic_value",
  "leverage_ratio",
  "interest_equivalent",
  "mark"
];

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
  symbol: string;
}

export interface LookupTable {
  byExpiration: {[key: string]: LookupTableEntry};
  byStrike: {[key: number]: LookupTableEntry};
}

export interface LookupTableEntry {
  call: string[];
  put: string[];
}

export interface StockQuote {
  symbol: string;
  name: string;
  spot_price: number;
  change: number;
}

export interface OptionsChain {
  lookup: LookupTable;
  contracts: {[key: string]: Contract};
  quote: StockQuote;
  spot_price: number;
  fetch_date: number;
  historical: HistoricalQuote[];
}

export interface OptionStrategy {
  legs: StrategyLeg[];
  share_count: number;
  underlying_cost_basis: number;
  spot_price: number;
  fetch_date: number;
}

export interface StrategyLeg {
  contract: Contract;
  id: string;
  premium: number;
  position_size: number;
}

export interface HistoricalQuote {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}
