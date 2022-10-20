import { Contract, OptionStrategy, StrategyLeg } from './interfaces';

var bs = require("black-scholes");

export function contractValue(contract: Contract, spot: number, currentDateMillis: number) {
  if (currentDateMillis > contract.expiration_date_integer_millis) {
    currentDateMillis = contract.expiration_date_integer_millis;
  }
  const yearsToExpiration: number = (contract.expiration_date_integer_millis - currentDateMillis) / (86400000 * 365.25);
  const result: number = bs.blackScholes(spot, contract.strike, yearsToExpiration, contract.implied_volatility, 0.035, contract.option_type);
  return (isNaN(result) ? 0 : result);
}

export function strategyValue(strategy: OptionStrategy, spot: number, currentDateMillis: number) {
  var overallValue: number = strategy.share_count * spot;
  for (var index in strategy.legs) {
    const val: number = contractValue(strategy.legs[index].contract, spot, currentDateMillis);
    overallValue += (val * strategy.legs[index].position_size * 100);
  }
  return (Math.round(overallValue * 10000) / 10000);
}

export function strategyValueForecastTable(strategy: OptionStrategy, spot: number, currentDateMillis: number, dateInterval: number, spotInterval: number, spotIntervalCount: number) {
  var dates: number[] = [];
  var spots: number[] = [];
  var result: any = {};

  // get range of spot prices
  spots.push(spot);
  for (var i = 1; i <= spotIntervalCount; i++) {
    spots.push(spot - (spotInterval * i));
    spots.unshift(spot + (spotInterval * i));
  }

  for (var index in strategy.legs) {
    const newSpot: number = strategy.legs[index].contract.strike;
    if (!spots.includes(newSpot)) {
      spots.push(newSpot);
    }
  }

  spots.sort().reverse();

  // find earliest expiration date in strategy
  var dateBacktrack = 0;
  for (var index in strategy.legs) {
    const leg: StrategyLeg = strategy.legs[index];
    if (dateBacktrack == 0 || leg.contract.expiration_date_integer_millis < dateBacktrack) {
      dateBacktrack = leg.contract.expiration_date_integer_millis;
    }
  }

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

function contractValueAtExpiration(contract: Contract, spot: number) {
  if (contract.option_type == "call") {
    return (spot - contract.strike > 0) ? (spot - contract.strike) : 0;
  } else if (contract.option_type == "put") {
    return (contract.strike - spot > 0) ? (contract.strike - spot) : 0;
  }
  return NaN;
}

function strategyValueAtExpiration(strategy: OptionStrategy, spot: number) {
  // Assume infinity = 1 trillion dollars for simplifying calculation
  // Plus, I doubt a stock will have a spot price > $1T
  if (spot == Infinity) spot = 1000000000000;

  var result: number = (strategy.share_count * spot);
  var contractValues: any[] = [];
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

export function calculateInflectionPrices(strategy: OptionStrategy) {
  var inflectionPoints: number[] = [];
  var earliest = 0;

  inflectionPoints.push(0);
  for (var index in strategy.legs) {
    inflectionPoints.push(strategy.legs[index].contract.strike);
    if (earliest == 0 || strategy.legs[index].contract.expiration_date_integer_millis < earliest) {
      earliest = strategy.legs[index].contract.expiration_date_integer_millis;
    }
  }
  inflectionPoints.push(Infinity);

  var pricesAtInflectionPoints: any = {};
  for (var index in inflectionPoints) {
    pricesAtInflectionPoints[inflectionPoints[index]] = strategyValueAtExpiration(strategy, inflectionPoints[index]);
  }

  return pricesAtInflectionPoints;
}
