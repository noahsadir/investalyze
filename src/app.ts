import express from 'express';
import * as bodyParser from "body-parser";

const port = 3001;

const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

/**
 * Perform call to Tradier API
 */
function fetchTradierJSON(url: string, api_key: string, callback: (status: number, data: any) => void) {
  var config: any = {
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + api_key,
      'Accept': 'application/json'
    }
  };

  var status: number = 400;

  fetch(url, config)
  .then((response: any) => {
    status = response.status;
    return response.json();
  })
  .then((data: any) => {
    if (status == 200) {
      if (data != null) {
        callback(status, data);
      } else {
        callback(500, {success: false, message: "Error fetching data.", error: "ERR_DATA_NULL", details: data});
      }
    } else {
      callback(status, {success: false, message: "Error fetching data.", error: "ERR_DATA_FETCH", details: data});
    }
  })
  .catch((error: any) => {
    callback(500, {success: false, message: "Error fetching data.", error: "ERR_DATA_INVALID", details: error});
  });
}

/**
 * Get options expiration dates for the given symbol
 */
function tradierExpirations(symbol: string, api_key: string, callback: (status: number, data: any) => void) {
  fetchTradierJSON('https://sandbox.tradier.com/v1/markets/options/expirations?symbol=' + symbol, api_key, (trdStat: number, trdData: any) => {
    if (trdStat == 200) {
      if (trdData.expirations != null && trdData.expirations.date != null) {
        callback(200, {expirations: trdData.expirations.date});
      } else {
        callback(500, {success: false, message: "Error fetching options expirations.", error: "ERR_EXPIRATION_FETCH", details: trdData});
      }
    } else {
      callback(trdStat, trdData);
    }
  });
}

/**
 * Get options chain for the given symbol at the specified expiration date.
 */
function tradierOptionsChain(symbol: string, expiration: string, api_key: string, callback: (status: number, data: any) => void) {
  var url: string = 'https://sandbox.tradier.com/v1/markets/options/chains?symbol=' + symbol + '&expiration=' + expiration + '&greeks=true';
  fetchTradierJSON(url, api_key, (trdStat: number, trdData: any) => {
    if (trdStat == 200) {
      if (trdData.options != null && trdData.options.option != null) {
        callback(200, {expiration: expiration, chain: trdData.options.option});
      } else {
        callback(500, {success: false, message: "Error fetching options expirations.", error: "ERR_EXPIRATION_FETCH", details: trdData});
      }
    } else {
      callback(trdStat, trdData);
    }
  });
}

/**
 * Get options chain for the given symbol at the specified expiration date.
 */
function tradierSymbolQuote(symbol: string, api_key: string, callback: (status: number, data: any) => void) {
  var url: string = 'https://sandbox.tradier.com/v1/markets/quotes?symbols=' + symbol;
  fetchTradierJSON(url, api_key, (trdStat: number, trdData: any) => {
    if (trdStat == 200) {
      if (trdData.quotes != null && trdData.quotes.quote != null) {
        var quote: any = trdData.quotes.quote;
        callback(200, {
          symbol: quote.symbol,
          name: quote.description,
          spot_price: quote.last,
          change: quote.change
        });
      } else {
        callback(500, {
          success: false,
          message: "Error fetching quote.",
          error: "ERR_QUOTE_FETCH",
          details: trdData
        });
      }
    } else {
      callback(trdStat, trdData);
    }
  });
}

/**
 * Format Tradier data to generic format accepted by client
 * Doing this allows for us to change the data source without breaking the whole
 * program or requiring a massive rewrite.
 */
function formatChain(data: any[], quote: any) {
  // lookup contains contract IDs indexed by date and strike
  // contracts contains data for each individual contract

  const fetch_date: number = Date.now();
  const spot_price: number = quote.spot_price;

  var output: any = {
    lookup: {
      byExpiration: {

      },
      byStrike: {

      }
    },
    contracts: {

    },
    quote: quote,
    fetch_date: fetch_date,
    spot_price: spot_price
  };

  for (var index in data) {
    var rawContractData: any = data[index];

    // add lookup table entry
    var symbol: string = rawContractData.symbol;
    var expirationDate: string = rawContractData.expiration_date;
    var strike: number = rawContractData.strike;
    var optionType: string = rawContractData.option_type;

    if (output.lookup.byExpiration[expirationDate] == null) {
      output.lookup.byExpiration[expirationDate] = {call: [], put: []};
    }

    if (output.lookup.byStrike[strike] == null) {
      output.lookup.byStrike[strike] = {call: [], put: []};
    }

    output.lookup.byExpiration[expirationDate][optionType].push(symbol);
    output.lookup.byStrike[strike][optionType].push(symbol);

    if (rawContractData.greeks == null) {
      rawContractData.greeks = {
        delta: undefined,
        gamme: undefined,
        theta: undefined,
        rho: undefined,
        vega: undefined,
        implied_volatility: undefined,
        smooth_implied_volatility: undefined
      }
    }

    const calculated_expiration: number = Date.parse(rawContractData.expiration_date);
    const calculated_mark: number = calculateMark(rawContractData.bid, rawContractData.ask);
    const calculated_intrinsic: number = calculateIntrinsic(rawContractData.option_type, rawContractData.strike, spot_price);
    const calculated_extrinsic: number = calculateExtrinsic(calculated_intrinsic, calculated_mark);
    const calculated_leverage_ratio: number = calculateLeverageRatio(rawContractData.greeks.delta, calculated_mark, spot_price);
    const calculated_interest_equivalent: number = calculateInterestEquivalent(rawContractData.greeks.delta, calculated_expiration, fetch_date, calculated_leverage_ratio, calculated_extrinsic, spot_price);

    // add contract data entry
    output.contracts[symbol] = {
      expiration_date_string: rawContractData.expiration_date,
      expiration_date_integer_millis: calculated_expiration,
      strike: rawContractData.strike,
      option_type: rawContractData.option_type,
      bid: rawContractData.bid,
      ask: rawContractData.ask,
      open: rawContractData.open,
      close: rawContractData.close,
      change: rawContractData.change,
      last: rawContractData.last,
      high: rawContractData.high,
      low: rawContractData.low,
      volume: rawContractData.volume,
      open_interest: rawContractData.open_interest,
      trade_date_integer_millis: rawContractData.trade_date,
      delta: rawContractData.greeks.delta,
      gamma: rawContractData.greeks.gamma,
      theta: rawContractData.greeks.theta,
      rho: rawContractData.greeks.rho,
      vega: rawContractData.greeks.vega,
      implied_volatility: rawContractData.greeks.mid_iv,
      smooth_implied_volatility: rawContractData.greeks.smv_vol,
      mark: calculated_mark,
      intrinsic_value: calculated_intrinsic,
      extrinsic_value: calculated_extrinsic,
      leverage_ratio: calculated_leverage_ratio,
      interest_equivalent: calculated_interest_equivalent,
      symbol: symbol
    };
  }

  return output;
}

function calculateMark(bid: number, ask: number) {
  if (!isNaN(bid) && !isNaN(ask)) {
    return Math.round(((bid + ask) / 2) * 100) / 100;
  } else if (!isNaN(bid)) {
    return bid;
  } else if (!isNaN(ask)) {
    return ask;
  }
  return undefined;
}

function calculateIntrinsic(type: string, strike: number, spot: number) {
  var intrinsic: number = 0;
  if (type == "call") {
    intrinsic = spot - strike;
  } else if (type == "put") {
    intrinsic = strike - spot;
  } else {
    return undefined;
  }
  return (intrinsic > 0) ? intrinsic : 0;
}

function calculateExtrinsic(intrinsic: number, mark: number) {
  if (!isNaN(intrinsic) && !isNaN(mark)) {
    return (mark - intrinsic > 0) ? (mark - intrinsic) : 0;
  }
  return undefined;
}

function calculateLeverageRatio(delta: number, mark: number, spot: number) {
  if (!isNaN(mark)) {
    return ((spot * delta) - mark) / mark;
  }
  return undefined;
}

function calculateInterestEquivalent(delta: number, exp_millis: number, fetch_millis: number, leverage_ratio: number, extrinsic: number, spot: number) {
  if (!isNaN(extrinsic) && !isNaN(leverage_ratio)) {
    const annual_extrinsic = extrinsic * (365.25 / ((exp_millis - fetch_millis) / 86400000));
    const interestEquiv: number = annual_extrinsic / (spot * delta * leverage_ratio);
    if (!isNaN(interestEquiv) && Math.abs(interestEquiv) < 100) {
      return interestEquiv;
    }
  }
  return undefined;
}

/**
 * Retrieve entire options chain for a specified symbol
 */
app.post('/api/options_chain', (req, res) => {
  var body: any = req.body;
  // validate parameters
  if (body.symbol != null && body.api_key != null) {
    var allContracts: any = {};

    tradierSymbolQuote(body.symbol, body.api_key, (quoteStatus: number, quoteData: any) => {
      if (quoteStatus == 200) {
        // get all expiration dates
        tradierExpirations(body.symbol, body.api_key, (status: number, data: any) => {
          if (status == 200 && data.expirations != null) {
            var responseCount: number = 0;
            for (var index in data.expirations) {
              var expDate: string = data.expirations[index];
              tradierOptionsChain(body.symbol, expDate, body.api_key, (ocStat: number, ocData: any) => {

                // if successful, add data to output
                // otherwise, throw an error
                if (ocStat == 200) {
                  responseCount += 1;
                  //allContracts.concat(ocData.chain);
                  allContracts[ocData.expiration] = ocData.chain;
                } else {
                  res.status(500);
                  res.json({success: false, message: "Error fetching options chain.", error: "ERR_OPTIONSCHAIN_FETCH", details: ocData})
                }

                // all options chain fetches were successful; return full chain
                if (responseCount == Object.keys(data.expirations).length) {

                  // Arrage contracts in order of date
                  // https://www.w3docs.com/snippets/javascript/how-to-sort-javascript-object-by-key.html
                  allContracts = Object.keys(allContracts).sort().reduce(function (result: any, key: string) {
                    result[key] = allContracts[key];
                    return result;
                  }, {});

                  /**/
                  var flattenedContracts: any[] = [];
                  for (var expInd in allContracts) {
                    for (var conInd in allContracts[expInd]) {
                      flattenedContracts.push(allContracts[expInd][conInd]);
                    }
                  }
                  /**/

                  res.status(200);
                  res.json(formatChain(flattenedContracts, quoteData));
                }
              });
            }
          } else { // failed request
            res.status(status);
            res.json(data);
          }
        });
      } else {
        res.status(quoteStatus);
        res.json(quoteData);
      }
    });

  } else { // failed request
    res.status(400);
    res.json({"success": false, "message": "Missing parameters.", "error": "ERR_MISSING_PARAMS"});
  }
});

app.post('*', (req, res) => {
  res.status(400);
  res.json({"success": false, "message": "Invalid API call.", "error": "ERR_BAD_REQUEST"});
});

/**
 * Serve files from directory of built react app.
 */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "..", "react_app", "build", req.path));
});

/**
 * Run express server.
 */
app.listen(port, () => {
    console.log('The application is listening on port ' + port + '!');
});
