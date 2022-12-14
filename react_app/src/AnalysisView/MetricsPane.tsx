/**
 * MetricsPane.tsx
 *
 * Allows user to view different calculations made using options data
 */

import React from 'react';
import '../App.css';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';

import {
  Contract, OptionsChain, HistoricalQuote
} from '../interfaces';

import {
  MultiChartData, MultiChart
} from './MultiChart';

import {
  getContractFieldConfig, getPercentage, getPercentChange, getBigNumber
} from '../Conversions';

interface MetricsPoint {
  implied_move: number;
  ntm_implied_volatility: number;
  total_volume: number;
  total_open_interest: number;
  open_interest_value: number;
  maximum_pain: number;
}

interface TableData {
  header: string[];
  body: string[][];
}

/**
 * Metrics pane for Analysis View
 */
export function MetricsPane(props: any) {

  var [chartType, setChartType]: [string, any] = React.useState("line");
  var [metricType, setMetricType]: [string, any] = React.useState("implied_move");
  var [multiplier, setMultiplier]: [number, any] = React.useState(1);

  const metricsData: any = calculateAggregateData(props.optionsChain, multiplier);

  const handleConfigChange = (config: any) => {
    setChartType(config.chart_type);
    setMetricType(config.metric_type);
  };

  return ((props.optionsChain != null) ? (
    <div style={{display: (props.isVisible ? 'flex' : 'none'), flexFlow: 'column', flexGrow: 1}}>
      <MetricsPaneToolbar
        onConfigChange={handleConfigChange}
        onMultiplierChange={(mult: number) => setMultiplier(mult)}
        metricType={metricType}
        chartType={chartType}/>
      <Divider sx={{marginTop: '8px', marginBottom: '8px'}} light/>
      <MetricsPaneContent
        historical={props.optionsChain.historical}
        data={metricsData}
        spotPrice={props.optionsChain.spot_price}
        metricType={metricType}
        chartType={chartType}/>
    </div>
  ) : (
    <div style={{display: (props.isVisible ? 'flex' : 'none')}}>
    An error occurred with options chain data.
    </div>
  ));
}

function MetricsPaneContent(props: any) {

  var chartData: MultiChartData = formatChartData(props.data, props.metricType, props.spotPrice, props.historical);

  var tableData: TableData = formatTableData(props.data, props.metricType, props.spotPrice);

  return (
    <div style={{display: 'flex', flexFlow: 'row', flexGrow: 1}}>
      <Paper sx={{flex: '1 0 0', flexFlow: 'column', display: 'flex', overflow: 'hidden'}} variant={"outlined"}>
        {buildTable(tableData)}
      </Paper>
      <div style={{margin: '4px', height: 'auto'}} className="mobile-hidden"></div>
      <div style={{flex: '1 0 0', display: 'flex'}} className="mobile-hidden">
        <Paper className="mobile-hidden" sx={{overflow: "hidden", display: "flex", flexFlow: "row", flex: "1 0 0"}} variant={"outlined"}>
          <MultiChart
            data={chartData}
            style={{display: 'flex', flex: '1 0 0'}}
            chartType={props.chartType}
            usesDate={true}
            xAxisLabel={"Date"}
            yAxisLabel={getContractFieldConfig(props.metricType).name}/>
        </Paper>
      </div>

    </div>
  );
}

/**
 * Allows user to view their desired metric and visualization
 */
function MetricsPaneToolbar(props: any) {

  var [chartType, setChartType]: [string, any] = React.useState(props.chartType);
  var [metricType, setMetricType]: [string, any] = React.useState(props.metricType);
  var [multiplier, setMultiplier]: [string, any] = React.useState("1");

  const handleConfigChange = (config: string, value: any) => {

    var newConfig: any = {
      chart_type: chartType,
      metric_type: metricType
    };

    if (config === "chart_type") {
      setChartType(value);
    } else if (config === "metric_type") {
      setMetricType(value);
    }

    newConfig[config] = value;
    props.onConfigChange(newConfig);
  }

  const handleMultiplierChange = (value: any) => {
    setMultiplier(value);

    if (!isNaN(value) && Number(value) > 0) {
      props.onMultiplierChange(Number(value));
    }
  }

  return (
    <div className="hbox-mobile" style={{flexGrow: 0}}>
      <div style={{flexGrow: 2, flexBasis: 0, display: 'flex', flexFlow: 'column', maxHeight: '72px', minWidth: '0px', marginTop: '8px'}}>
        <div style={{display: 'flex', flexGrow: 0}}>
          <div style={{flexGrow: 1}}></div>
          <Typography sx={{fontSize: '12px', paddingBottom: '12px', flexGrow: 0}}>OPTIONS</Typography>
          <div style={{flexGrow: 1}}></div>
        </div>
        <div style={{display: 'flex', flexGrow: 1}}>
          <div style={{flexGrow: 2, flexBasis: 0, display: 'flex', minWidth: '0px', marginRight: '8px'}}>
            <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
              <InputLabel>Chart Type</InputLabel>
              <Select sx={{height: 40}} label="Chart Type" id="chartTypeSelect" value={chartType}
                      onChange={(event: any) => {handleConfigChange("chart_type", event.target.value);}}>
                <MenuItem value={"bar"}>{"Bar Chart"}</MenuItem>
                <MenuItem value={"line"}>{"Line Chart"}</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div style={{flexGrow: 2, flexBasis: 0, display: 'flex', minWidth: '0px', marginRight: '8px'}}>
            <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
              <InputLabel>Metric Type</InputLabel>
              <Select sx={{height: 40}} label="Metric Type" id="metricTypeSelect" value={metricType}
                      onChange={(event: any) => {handleConfigChange("metric_type", event.target.value);}}>
                <MenuItem value={"implied_move"}>{"Implied Move"}</MenuItem>
                <MenuItem value={"ntm_implied_volatility"}>{"Implied Volatility"}</MenuItem>
                <MenuItem value={"total_volume"}>{"Total Volume"}</MenuItem>
                <MenuItem value={"total_open_interest"}>{"Total Open Interest"}</MenuItem>
                <MenuItem value={"open_interest_value"}>{"Open Interest Value"}</MenuItem>
                <MenuItem value={"maximum_pain"}>{"Maximum Pain"}</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div style={{flexGrow: 1, flexBasis: 0, display: ((metricType === "implied_move") ? 'flex' : 'none'), minWidth: '0px'}}>
            <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
              <TextField label="IM Multiplier" size="small" value={multiplier} onChange={(event: any) => {handleMultiplierChange(event.target.value);}}/>
            </FormControl>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Build a table from the specified data
 */
function buildTable(tableData: any) {

  // Create table header
  var bodyRows: any[] = [];
  var headColumnCells: any[] = [];
  for (var headerInd in tableData.header) {
    headColumnCells.push(<TableCell key={headerInd}>{tableData.header[headerInd]}</TableCell>);
  }

  // Create table body
  for (var bodyInd in tableData.body) {
    var bodyRowCells: any[] = [];
    for (var cellInd in tableData.body[bodyInd]) {
      bodyRowCells.push(<TableCell key={cellInd}>{tableData.body[bodyInd][cellInd]}</TableCell>);
    }
    bodyRows.push(<TableRow key={bodyInd}>{bodyRowCells}</TableRow>);
  }

  return (
    <TableContainer sx={{flex: '1 0 0', 'minHeight': 0}}>
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow key={"head"}>
            {headColumnCells}
          </TableRow>
        </TableHead>
        <TableBody>
          {bodyRows}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/**
 * Convert metrics data into format accepted by MultiChart
 */
function formatChartData(aggregateData: any, metricType: any, spotPrice: number, historical: HistoricalQuote[]) {
  var data: MultiChartData = {};
  var date: string;

  if (metricType === "total_open_interest") {
    data.Calls = [];
    data.Puts = [];
    for (date in aggregateData) {
      data.Calls.push([date, aggregateData[date].call.total_open_interest]);
      data.Puts.push([date, aggregateData[date].put.total_open_interest]);
    }
  } else if (metricType === "total_volume") {
    data.Calls = [];
    data.Puts = [];
    for (date in aggregateData) {
      data.Calls.push([date, aggregateData[date].call.total_volume]);
      data.Puts.push([date, aggregateData[date].put.total_volume]);
    }
  } else if (metricType === "open_interest_value") {
    data.Calls = [];
    data.Puts = [];
    for (date in aggregateData) {
      data.Calls.push([date, aggregateData[date].call.open_interest_value]);
      data.Puts.push([date, aggregateData[date].put.open_interest_value]);
    }
  } else if (metricType === "implied_move") {
    data.High = [];
    data.Low = [];
    data.Historical = [];

    const recentQuote: HistoricalQuote = historical[historical.length - 1];
    data.High.push([Date.parse(recentQuote.date), Math.round(recentQuote.close * 100) / 100]);
    data.Low.push([Date.parse(recentQuote.date), Math.round(recentQuote.close * 100) / 100]);
    for (date in aggregateData) {
      data.High.push([date, Math.round((spotPrice + aggregateData[date].call.implied_move) * 100) / 100]);
      data.Low.push([date, Math.round((spotPrice - aggregateData[date].call.implied_move) * 100) / 100]);
    }

    for (var quote of historical) {
      data.Historical.push([Date.parse(quote.date), Math.round(quote.close * 100) / 100]);
    }
  } else if (metricType === "ntm_implied_volatility") {
    data.Calls = [];
    data.Puts = [];
    for (date in aggregateData) {
      data.Calls.push([date, aggregateData[date].call.ntm_implied_volatility]);
      data.Puts.push([date, aggregateData[date].put.ntm_implied_volatility]);
    }
  } else if (metricType === "maximum_pain") {
    data["Max Pain"] = [];
    for (date in aggregateData) {
      data["Max Pain"].push([date, aggregateData[date].call.maximum_pain]);
    }
  }

  return data;
}

/**
 * Convert metrics data into format accepted by buildTable()
 */
function formatTableData(aggregateData: any, metricType: any, spotPrice: number) {
  var header: string[] = [];
  var body: string[][] = [];
  var date: string;

  if (metricType === "total_open_interest") {
    header = ["Date", "Calls", "Puts", "Total", "P/C Ratio"];
    for (date in aggregateData) {
      const callOI: number = aggregateData[date].call.total_open_interest;
      const putOI: number = aggregateData[date].put.total_open_interest;
      body.push([date, callOI.toString(), putOI.toString(), (callOI + putOI).toString(), (putOI / callOI).toFixed(2)]);
    }
  } else if (metricType === "open_interest_value") {
    header = ["Date", "Calls", "Puts", "Total", "P/C Ratio"];
    for (date in aggregateData) {
      const callOI: number = aggregateData[date].call.open_interest_value;
      const putOI: number = aggregateData[date].put.open_interest_value;
      body.push([date, "$" + getBigNumber(callOI), "$" + getBigNumber(putOI), "$" + getBigNumber(callOI + putOI), (putOI / callOI).toFixed(2)]);
    }
  } else if (metricType === "total_volume") {
    header = ["Date", "Calls", "Puts", "Total", "P/C Ratio"];
    for (date in aggregateData) {
      const callVolume: number = aggregateData[date].call.total_volume;
      const putVolume: number = aggregateData[date].put.total_volume;
      body.push([date, callVolume.toString(), putVolume.toString(), (callVolume + putVolume).toString(), (putVolume / callVolume).toFixed(2)]);
    }
  } else if (metricType === "ntm_implied_volatility") {
    header = ["Date", "Call IV", "Put IV", "Avg IV"];
    for (date in aggregateData) {
      const callIV: number = aggregateData[date].call.ntm_implied_volatility;
      const putIV: number = aggregateData[date].put.ntm_implied_volatility;
      body.push([date, getPercentage(callIV), getPercentage(putIV), getPercentage((callIV + putIV) / 2)]);
    }
  } else if (metricType === "implied_move") {
    header = ["Date", "Low", "High", "Move ($)", "Move (%)"];
    for (date in aggregateData) {
      const impliedMove: number = aggregateData[date].call.implied_move;

      body.push([date, "$" + (spotPrice - impliedMove).toFixed(2), "$" + (spotPrice + impliedMove).toFixed(2), "+/- $" + impliedMove.toFixed(2), "+/- " + getPercentage(impliedMove / spotPrice)]);
    }
  } else if (metricType === "maximum_pain") {
    header = ["Date", "Max Pain", "Suggested Move"];
    for (date in aggregateData) {
      const maxPain: number = aggregateData[date].call.maximum_pain;
      body.push([date, "$" + maxPain.toFixed(2), getPercentChange(spotPrice, maxPain)]);
    }
  }

  return {
    header: header,
    body: body
  };
}

/**
 * Calculate metrics for a stock using its options data
 */
function calculateAggregateData(optionsChain: OptionsChain, multiplier: number) {
  var result: any = {};
  for (var date in optionsChain.lookup.byExpiration) {
    var callIDs: string[] = optionsChain.lookup.byExpiration[date].call;
    var putIDs: string[] = optionsChain.lookup.byExpiration[date].put;

    var smallestSpotStrikeSpread: any = undefined;
    var currentSum: any = 0;
    var sumsAtStrike: any = {};

    var callData: MetricsPoint = {
      implied_move: 0,
      ntm_implied_volatility: 0,
      total_volume: 0,
      total_open_interest: 0,
      open_interest_value: 0,
      maximum_pain: 0
    };

    var putData: MetricsPoint = {
      implied_move: 0,
      ntm_implied_volatility: 0,
      total_volume: 0,
      total_open_interest: 0,
      open_interest_value: 0,
      maximum_pain: 0
    };

    for (var callInd = 0; callInd < callIDs.length; callInd++) {
      const contract: Contract = optionsChain.contracts[callIDs[callInd]];
      if (contract != null) {
        callData.total_open_interest += contract.open_interest;
        callData.total_volume += contract.volume;
        callData.open_interest_value += (contract.open_interest * contract.mark);
        if (isNaN(smallestSpotStrikeSpread) || smallestSpotStrikeSpread > Math.abs(contract.strike - optionsChain.spot_price)) {
          callData.ntm_implied_volatility = contract.implied_volatility;
          callData.implied_move = contract.mark; // stored value for later calculation
          smallestSpotStrikeSpread = Math.abs(contract.strike - optionsChain.spot_price);
        }
        currentSum += contract.mark;
        sumsAtStrike[contract.strike] = currentSum;

      }
    }

    smallestSpotStrikeSpread = undefined;
    currentSum = 0;

    for (var putInd = putIDs.length - 1; putInd >= 0; putInd--) {
      const contract: Contract = optionsChain.contracts[putIDs[putInd]];
      if (contract != null) {
        putData.total_open_interest += contract.open_interest;
        putData.total_volume += contract.volume;
        putData.open_interest_value += (contract.open_interest * contract.mark);
        if (isNaN(smallestSpotStrikeSpread) || smallestSpotStrikeSpread > Math.abs(contract.strike - optionsChain.spot_price)) {
          putData.ntm_implied_volatility = contract.implied_volatility;
          putData.implied_move = contract.mark; // stored value for later calculation
          smallestSpotStrikeSpread = Math.abs(contract.strike - optionsChain.spot_price);
        }
        currentSum += contract.mark;
        if (sumsAtStrike[contract.strike] != null) {
          sumsAtStrike[contract.strike] += currentSum;
        }
      }
    }

    // find point of max pain
    var maxPain: number = 0;
    var highestSum: any = undefined;
    for (var key in sumsAtStrike) {
      if (isNaN(highestSum) || sumsAtStrike[key] > highestSum) {
        highestSum = sumsAtStrike[key];
        maxPain = Number(key);
      }
    }

    const impliedMove: number = (callData.implied_move + putData.implied_move) * 0.85 * multiplier;
    callData.implied_move = impliedMove;
    putData.implied_move = impliedMove;
    callData.maximum_pain = maxPain;
    putData.maximum_pain = maxPain;

    result[date] = {};
    result[date].call = callData;
    result[date].put = putData;
  }

  return result;
}
