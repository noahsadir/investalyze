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
 * Format Tradier data to generic format accepted by client
 * Doing this allows for us to change the data source without breaking the whole
 * program or requiring a massive rewrite.
 */
function formatChain(data: any[]) {
  // lookup contains contract IDs indexed by date and strike
  // contracts contains data for each individual contract
  var output: any = {
    lookup: {
      byExpiration: {

      },
      byStrike: {

      }
    },
    contracts: {

    }
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

    // add contract data entry
    output.contracts[symbol] = {
      expiration_date_string: rawContractData.expiration_date,
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
    };
  }

  return output;
}

/**
 * Retrieve entire options chain for a specified symbol
 */
app.post('/api/options_chain', (req, res) => {
  var body: any = req.body;
  // validate parameters
  if (body.symbol != null && body.api_key != null) {
    var allContracts: any = {};

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
              allContracts = Object.keys(allContracts).sort().reduce(function (result, key) {
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
              res.json(formatChain(flattenedContracts));
            }
          });
        }
      } else { // failed request
        res.status(status);
        res.json(data);
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
