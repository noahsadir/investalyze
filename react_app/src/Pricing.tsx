/**
 * Pricing.tsx
 *
 * Perform Black-Scholes calculations for an options contract or strategy
 */

import { Contract, OptionStrategy, StrategyLeg } from './interfaces';

var bs = require("black-scholes");

/**
 * Estimate the premium of a contract given a particular date and spot price
 */
export function contractValue(contract: Contract, spot: number, currentDateMillis: number) {
  if (currentDateMillis > contract.expiration_date_integer_millis) {
    currentDateMillis = contract.expiration_date_integer_millis;
  }
  const yearsToExpiration: number = (contract.expiration_date_integer_millis - currentDateMillis) / (86400000 * 365.25);
  const result: number = bs.blackScholes(spot, contract.strike, yearsToExpiration, contract.implied_volatility, 0.035, contract.option_type);
  return (isNaN(result) ? 0 : result);
}

/**
 * Estimate the premium of a strategy given a particular date and spot price
 */
export function strategyValue(strategy: OptionStrategy, spot: number, currentDateMillis: number) {
  var overallValue: number = strategy.share_count * spot;
  for (var leg of strategy.legs) {
    const val: number = contractValue(leg.contract, spot, currentDateMillis);
    overallValue += (val * leg.position_size * 100);
  }
  return (Math.round(overallValue * 10000) / 10000);
}

/**
 * Estimate the premium of a strategy over a range of dates and spot prices
 */
export function strategyValueForecastTable(strategy: OptionStrategy, spot: number, currentDateMillis: number, dateInterval: number, spotInterval: number, spotIntervalCount: number) {
  var dates: number[] = [];
  var spots: number[] = [];
  var result: any = {};
  var dateBacktrack = 0;

  // get range of spot prices
  spots.push(spot);
  for (var i = 1; i <= spotIntervalCount; i++) {
    spots.push(spot - (spotInterval * i));
    spots.unshift(spot + (spotInterval * i));
  }

  for (var leg of strategy.legs) {
    const newSpot: number = leg.contract.strike;
    if (!spots.includes(newSpot)) {
      spots.push(newSpot);
    }

    // find earliest expiration date in strategy
    if (dateBacktrack === 0 || leg.contract.expiration_date_integer_millis < dateBacktrack) {
      dateBacktrack = leg.contract.expiration_date_integer_millis;
    }
  }

  spots.sort().reverse();


  // get range of dates
  while (dateBacktrack > currentDateMillis) {
    dates.unshift(dateBacktrack);
    dateBacktrack -= dateInterval;
  }
  dates.unshift(currentDateMillis);

  // calculate strategy value at each date and strike
  for (var dateInd in dates) {
    const dateVal: number = dates[dateInd];
    result[dateVal] = {};
    for (var spotInd in spots) {
      const spotVal: number = spots[spotInd];
      result[dateVal][spotVal.toFixed(2)] = strategyValue(strategy, spotVal, dateVal);
    }
  }

  return result;
}

/**
 * Calcuate the intrinsic value of a contract at a given spot price
 */
function contractValueAtExpiration(contract: Contract, spot: number) {
  if (contract.option_type === "call") {
    return (spot - contract.strike > 0) ? (spot - contract.strike) : 0;
  } else if (contract.option_type === "put") {
    return (contract.strike - spot > 0) ? (contract.strike - spot) : 0;
  }
  return NaN;
}

/**
 * Calcuate the intrinsic value of a strategy at a given spot price
 */
function strategyValueAtExpiration(strategy: OptionStrategy, spot: number) {
  // Assume infinity = 1 trillion dollars for simplifying calculation
  // Plus, I doubt a stock will have a spot price > $1T
  if (spot === Infinity) spot = 1000000000000;

  var result: number = (strategy.share_count * spot);
  for (var index in strategy.legs) {
    const leg: StrategyLeg = strategy.legs[index];
    result += (contractValueAtExpiration(leg.contract, spot) * leg.position_size * 100);
  }

  if (result > 1000000000) {
    return Number.POSITIVE_INFINITY;
  } else if (result < -1000000000) {
    return Number.NEGATIVE_INFINITY;
  }

  return result;
}

/**
 * Calcuate the expiration value of a strategy at critical spot prices
 * - Helpful for determining max gain/loss
 */
export function calculateInflectionPrices(strategy: OptionStrategy) {
  var inflectionPoints: number[] = [];
  var earliest = 0;

  inflectionPoints.push(0);
  for (var leg of strategy.legs) {
    inflectionPoints.push(leg.contract.strike);
    if (earliest === 0 || leg.contract.expiration_date_integer_millis < earliest) {
      earliest = leg.contract.expiration_date_integer_millis;
    }
  }
  inflectionPoints.push(Infinity);

  var pricesAtInflectionPoints: any = {};
  for (var point of inflectionPoints) {
    pricesAtInflectionPoints[point] = strategyValueAtExpiration(strategy, point);
  }

  return pricesAtInflectionPoints;
}
