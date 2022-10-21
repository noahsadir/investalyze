/**
 * Conversions.tsx
 *
 * Convert different data types into human-readable
 * or computer-parseable formats
 */

/**
 * Get the percent change from one number to another
 */
export function getPercentChange(from: number, to: number) {
  if (to === 0) return "ERR";
  if (from === 1) return "+0%";
  const ratio: number = to / from;
  if (ratio > 1) {
    return "+" + ((ratio - 1) * 100).toFixed(2) + "%";
  }
  return "-" + ((1 - ratio) * 100).toFixed(2) + "%";
}

/**
 * Convert a ratio into a percentage
 */
export function getPercentage(ratio: number) {
  return (ratio * 100).toFixed(2) + "%";
}

/**
 * Abbreviate a large number
 */
export function getBigNumber(val: number) {
  if (val >= 1000000000000) {
    return (val / 1000000000000).toFixed(2) + "T";
  } else if (val >= 1000000000) {
    return (val / 1000000000).toFixed(2) + "B";
  } else if (val >= 1000000) {
    return (val / 1000000).toFixed(2) + "M";
  } else if (val >= 1000) {
    return (val / 1000).toFixed(2) + "K";
  } else {
    return Math.round(val).toString();
  }
}

/**
 * Convert raw value into human-readable string
 */
export function formatValue(value: any, classification: string) {
  var result: string = "";

  if (value == null) {
    return "N/A";
  }

  if (classification === "price" && !isNaN(value)) {
    result = (value < 0) ? ("-$" + Math.abs(value).toFixed(2)) : ("$" + value.toFixed(2));
  } else if (classification === "percentage" && !isNaN(value)) {
    result = (value * 100).toFixed(2) + "%";
  } else if (classification === "date_millis" && !isNaN(value)) {
    result = (new Date(value)).toISOString().split("T")[0];
  } else if (classification === "greeks" && !isNaN(value)) {
    result = value.toFixed(2);
  } else if (classification === "strike" && !isNaN(value)){
    result = "$" + value.toString();
  } else if (classification === "integer" && !isNaN(value)) {
    result = Math.round(value).toString();
  }

  return result;
}

/**
 * Get the name and format for any given type of field
 */
export function getContractFieldConfig(filterID: string) {
  const filterNames: any = {
    expiration_date_integer_millis: {
      name: "Expiration",
      format: "date_millis"
    },
    strike: {
      name: "Strike Price",
      format: "strike"
    },
    option_type: {
      name: "Option Type",
      format: "option_type"
    },
    bid: {
      name: "Bid Price",
      format: "price"
    },
    ask: {
      name: "Ask Price",
      format: "price"
    },
    open: {
      name: "Open Price",
      format: "price"
    },
    close: {
      name: "Close Price",
      format: "price"
    },
    change: {
      name: "Day Change",
      format: "price"
    },
    last: {
      name: "Last Price",
      format: "price"
    },
    high: {
      name: "High Price",
      format: "price"
    },
    low: {
      name: "Low Price",
      format: "price"
    },
    volume: {
      name: "Volume",
      format: "integer"
    },
    open_interest: {
      name: "Open Interest",
      format: "integer"
    },
    trade_date_integer_millis: {
      name: "Trade Date",
      format: "date_millis"
    },
    delta: {
      name: "Delta",
      format: "greeks"
    },
    gamma: {
      name: "Gamma",
      format: "greeks"
    },
    theta: {
      name: "Theta",
      format: "greeks"
    },
    rho: {
      name: "Rho",
      format: "greeks"
    },
    vega: {
      name: "Vega",
      format: "greeks"
    },
    implied_volatility: {
      name: "Implied Volatility",
      format: "percentage"
    },
    smooth_implied_volatility: {
      name: "Smooth IV",
      format: "percentage"
    },
    intrinsic_value: {
      name: "Intrinsic Value",
      format: "price"
    },
    extrinsic_value: {
      name: "Extrinsic Value",
      format: "price"
    },
    leverage_ratio: {
      name: "Leverage Ratio",
      format: "price"
    },
    interest_equivalent: {
      name: "Interest Equivalent",
      format: "percentage"
    },
    mark: {
      name: "Mark",
      format: "price"
    }
  }

  if (filterNames[filterID] != null) {
    return filterNames[filterID];
  }

  return {
    name: undefined,
    format: undefined
  };
}
