/**
 * DataPane.tsx
 *
 * Data Pane for Analytics View
 *
 * TODO
 * - Implement table view option
 * - Implement range selection
 */

import React from 'react';
import '../App.css';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Paper from '@mui/material/Paper';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

import { Chart as ChartJS, registerables } from 'chart.js';
import { Line, Bar, Scatter } from 'react-chartjs-2';

import {
  Contract, LookupTable, LookupTableEntry, OptionsChain
} from '../interfaces';
const fetch = require('node-fetch');

ChartJS.register(...registerables);

var colors = [
  '#666ad1',
  '#48a999',
  '#fff263',
  '#ff5f52',
  '#ae52d4',
  '#5eb8ff',
  '#99d066',
  '#ffad42',
  '#ff7d47',
  '#fa5788',
  '#8559da',
  '#63a4ff',
  '#56c8d8',
  '#6abf69',
  '#e4e65e',
  '#ffd149',
];

/**
 * Non-null values indicate a sorting range, while nulls should be ignored
 */
interface DataFilters {
  option_type?: string;
  expiration_date_integer_millis?: [number, number];
  strike?: [number, number];
  bid?: [number, number];
  ask?: [number, number];
  open?: [number, number];
  close?: [number, number];
  change?: [number, number];
  last?: [number, number];
  high?: [number, number];
  low?: [number, number];
  volume?: [number, number];
  open_interest?: [number, number];
  trade_date_integer_millis?: [number, number];
  delta?: [number, number];
  gamma?: [number, number];
  theta?: [number, number];
  rho?: [number, number];
  vega?: [number, number];
  implied_volatility?: [number, number];
  smooth_implied_volatility?: [number, number];
  intrinsic_value?: [number, number];
  extrinsic_value?: [number, number];
  leverage_ratio?: [number, number];
  interest_equivalent?: [number, number];
  mark?: [number, number];
}

interface DataConfig {
  x_axis: string;
  y_axis: string;
  chart_type: string;
  option_type: string;
  dataset_type: string;
  dataset_value: string;
  lower_bound: string;
  upper_bound: string;
  filters: DataFilters;
}

/**
 * Trading pane for Data View
 */
export function DataPane(props: any) {

  var filters: DataFilters = {
    expiration_date_integer_millis: undefined,
    strike: undefined,
    option_type: undefined,
    bid: undefined,
    ask: undefined,
    open: undefined,
    close: undefined,
    change: undefined,
    last: undefined,
    high: undefined,
    low: undefined,
    volume: undefined,
    open_interest: undefined,
    trade_date_integer_millis: undefined,
    delta: undefined,
    gamma: undefined,
    theta: undefined,
    rho: undefined,
    vega: undefined,
    implied_volatility: undefined,
    smooth_implied_volatility: undefined,
    intrinsic_value: undefined,
    extrinsic_value: undefined,
    leverage_ratio: undefined,
    interest_equivalent: undefined,
    mark: undefined
  };

  const expirations: string[] = Object.keys(props.optionsChain.lookup.byExpiration);
  const strikes: string[] = Object.keys(props.optionsChain.lookup.byStrike).sort((a: string, b: string) => {return Number(a) - Number(b);});

  var [config, setConfig]: [DataConfig, any] = React.useState({
    x_axis: "strike",
    y_axis: "mark",
    chart_type: "line",
    option_type: "both",
    dataset_type: "byExpiration",
    dataset_value: (expirations != null && expirations.length > 0) ? expirations[0] : "",
    lower_bound: (strikes != null && strikes.length > 0) ? strikes[0] : "",
    upper_bound: (strikes != null && strikes.length > 0) ? strikes[strikes.length - 1] : "",
    filters: filters
  });

  const handleConfigChange = (newConfig: DataConfig) => {
    setConfig(newConfig);
  }

  return ((props.optionsChain != null) ? (
    <div style={{display: 'flex', flexFlow: 'column', flexGrow: 1}}>
      <DataPaneToolbar config={config} onConfigChange={handleConfigChange} optionsChain={props.optionsChain}/>
      <Divider sx={{marginTop: '8px', marginBottom: '8px'}} light/>
      <DataPaneMainContent config={config} optionsChain={props.optionsChain}/>
    </div>
  ) : (
    <div>
    An error occurred with options chain data.
    </div>
  ));
}

/**
 * Display data from the options chain
 */
function DataPaneMainContent(props: any) {

  const filteredData: any = getFilteredData(props.optionsChain, props.config);
  const tableData: any = formatTableData(filteredData);
  const chartData: any = formatChartData(filteredData, props.config.chart_type);

  const chartJSOptions: any = {
    legend: {
      labels: {
        color: '#ffffff',
      },
      display: true,
    },
    responsive: true,
    maintainAspectRatio: false,
    animations: null,
    scales: {
      y: {
        type: 'linear',
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: '#00000000'
        }
      },
      x: {
        type: (props.config.chart_type == "line") ? 'linear' : 'category',
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: '#00000000'
        }
      }
    }
  };

  var datasets: any[] = [];
  for (var key in chartData) {
    if (key != "labels") {
      datasets.push({
        label: key,
        pointRadius: 2,
        fill: false,
        backgroundColor: colors[datasets.length],
        borderColor: colors[datasets.length],
        data: chartData[key],
        showLine: true
      });
    }
  }

  const chart: any = (props.config.chart_type == "bar") ? (
    <Bar
      style={{flexGrow: 0, flexBasis: 0, width: '100%', height: '100%'}}
      datasetIdKey='id'
      data={{
        labels: chartData.labels,
        datasets: datasets
      }}
      options={chartJSOptions}
    />
  ) : (
    <Scatter
      style={{flexGrow: 0, flexBasis: 0, width: '100%', height: '100%'}}
      datasetIdKey='id'
      data={{
        datasets: datasets
      }}
      options={chartJSOptions}
    />
  );

  var bodyRows: any[] = [];
  var headColumnCells: any[] = [];
  headColumnCells.push(<TableCell>{getFilterConfig(props.config.x_axis).name}</TableCell>);
  for (var series in filteredData) {
    headColumnCells.push(<TableCell>{getFilterConfig(props.config.y_axis).name + " (" + series + ")"}</TableCell>);
  }

  for (var index in tableData) {
    var bodyRowCells: any[] = [];
    for (var cellInd in tableData[index]) {
      var format: string = getFilterConfig(props.config.y_axis).format;
      if (Number(cellInd) == 0) {
        format = getFilterConfig(props.config.x_axis).format;
      }
      bodyRowCells.push(<TableCell>{formatDataValue(tableData[index][cellInd], format)}</TableCell>);
    }
    bodyRows.push(<TableRow>{bodyRowCells}</TableRow>);
  }

  return (
    <div style={{display: 'flex', flexFlow: 'row', flexGrow: 1}}>
      <Paper sx={{flex: '1 0 0', flexFlow: 'column', display: 'flex', overflow: 'hidden'}} variant={"outlined"}>
        <TableContainer sx={{flex: '1 0 0', 'minHeight': 0}}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {headColumnCells}
              </TableRow>
            </TableHead>
            <TableBody>
              {bodyRows}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <div style={{margin: '4px', height: 'auto'}} className="mobile-hidden"></div>
      <div style={{flex: '2 0 0', display: 'flex'}} className="mobile-hidden">
        <Paper className="mobile-hidden" sx={{overflow: "hidden", display: "flex", flexFlow: "row", flex: "1 0 0"}} variant={"outlined"}>
          <div style={{flex: "1 0 0", display: "flex", flexFlow: "column"}}>
            <div style={{flex: "1 0 0"}}/>
            <p style={{display: "block", writingMode: "vertical-rl",textAlign:"center",margin:0,padding:0,paddingBottom:24}}>{getFilterConfig(props.config.y_axis).name}</p>
            <div style={{flex: "1 0 0"}}/>
          </div>
          <div style={{overflow: "hidden", display: "flex", flexFlow: "column", flex: "100 0 0"}}>
            <div style={{flex: "1 0 0"}}/>
            <div style={{flex: "100 0 0", overflow: "hidden", borderRadius: 8}}>
              {chart}
            </div>
            <p style={{display: "block", margin:0,padding:0,textAlign:"center",height:24,lineHeight:"24px"}}>{getFilterConfig(props.config.x_axis).name}</p>
            <div style={{flex: "1 0 0"}}/>
          </div>
          <div style={{flex: "1 0 0"}}/>
        </Paper>
      </div>

    </div>
  );

}

/**
 * Change the parameters of the data to be displayed by the chart
 */
function DataPaneToolbar(props: any) {

  var filterMenuItems: any[] = [];
  var datasetMenuItems: any[] = [];
  var boundsMenuItems: any[] = [];

  var [chartType, setChartType]: [string, any] = React.useState(props.config.chart_type);
  var [xAxis, setXAxis]: [string, any] = React.useState(props.config.x_axis);
  var [yAxis, setYAxis]: [string, any] = React.useState(props.config.y_axis);

  var [optionType, setOptionType]: [string, any] = React.useState(props.config.option_type);
  var [datasetType, setDatasetType]: [string, any] = React.useState(props.config.dataset_type);
  var [datasetValue, setDatasetValue]: [string, any] = React.useState(props.config.dataset_value);

  var [lowerBound, setLowerBound]: [string, any] = React.useState(props.config.lower_bound);
  var [upperBound, setUpperBound]: [string, any] = React.useState(props.config.upper_bound);

  const boundsSorted: string[] = (datasetType == "byExpiration") ? Object.keys(props.optionsChain.lookup.byStrike).sort((a: string, b: string) => {return Number(a) - Number(b);}) : Object.keys(props.optionsChain.lookup.byExpiration);

  // propogate changes to parent
  const handleConfigChange = (key: string, value: any) => {
    var newConfig: any = {
      x_axis: xAxis,
      y_axis: yAxis,
      chart_type: chartType,
      option_type: optionType,
      dataset_type: datasetType,
      dataset_value: datasetValue,
      lower_bound: lowerBound,
      upper_bound: upperBound,
      filters: props.config.filters
    };
    newConfig[key] = value;
    props.onConfigChange(newConfig);
  }

  // get list of stikes or expirations depending on type selected
  for (var val in props.optionsChain.lookup[datasetType]) {
    datasetMenuItems.push(<MenuItem value={val}>{val}</MenuItem>);
  }

  // get list of stikes or expirations depending on x axis
  for (var val in boundsSorted) {
    boundsMenuItems.push(<MenuItem value={boundsSorted[val]}>{boundsSorted[val]}</MenuItem>);
  }

  // get list of data points for contracts
  for (var key in props.config.filters) {
    filterMenuItems.push(<MenuItem value={key}>{getFilterConfig(key).name}</MenuItem>)
  }

  // more involved since it changes the options for dataset values
  const handleDatasetTypeChange = (event: any) => {
    if (props.optionsChain.lookup[event.target.value] != null) {
      var datasetValues: string[] = Object.keys(props.optionsChain.lookup[event.target.value]);
      const boundsValues: string[] = (event.target.value == "byExpiration") ? Object.keys(props.optionsChain.lookup.byStrike).sort((a: string, b: string) => {return Number(a) - Number(b);}) : Object.keys(props.optionsChain.lookup.byExpiration);

      setDatasetValue(datasetValues[0]);
      setLowerBound(boundsValues[0]);
      setUpperBound(boundsValues[boundsValues.length - 1]);


      setXAxis(event.target.value == "byExpiration" ? "strike" : "expiration_date_integer_millis");
      setDatasetType(event.target.value);

      var newConfig: any = {
        x_axis: (event.target.value == "byExpiration" ? "strike" : "expiration_date_integer_millis"),
        y_axis: yAxis,
        chart_type: chartType,
        option_type: optionType,
        dataset_type: event.target.value,
        dataset_value: datasetValues[0],
        lower_bound: boundsValues[0],
        upper_bound: boundsValues[boundsValues.length - 1],
        filters: props.config.filters
      };
      props.onConfigChange(newConfig);
    }
  }

  // Selects are quite a PITA
  return (
    <div className="hbox-mobile" style={{flexGrow: 0}}>
      <div style={{flexGrow: 2, flexBasis: 0, display: 'flex', flexFlow: 'column', maxHeight: '64px', minWidth: '0px', marginTop: '8px'}}>
        <div style={{display: 'flex', flexGrow: 0}}>
          <div style={{flexGrow: 1}}></div>
          <Typography sx={{fontSize: '12px', paddingBottom: '12px', flexGrow: 0}}>CHART OPTIONS</Typography>
          <div style={{flexGrow: 1}}></div>
        </div>
        <div style={{display: 'flex', flexGrow: 1}}>
          <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px', marginRight: '8px'}}>
            <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
              <InputLabel>Chart Type</InputLabel>
              <Select sx={{height: 32}} label="Chart Type" id="chartTypeSelect" value={chartType}
                      onChange={(event: any) => {setChartType(event.target.value); handleConfigChange("chart_type", event.target.value);}}>
                <MenuItem value={"bar"}>{"Bar Chart"}</MenuItem>
                <MenuItem value={"line"}>{"Line Chart"}</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px'}}>
            <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
              <InputLabel>Y-Axis</InputLabel>
              <Select sx={{height: 32}} label="Y-Axis" id="yAxisSelect" value={yAxis}
                      onChange={(event: any) => {setYAxis(event.target.value); handleConfigChange("y_axis", event.target.value);}}>
                {filterMenuItems}
              </Select>
            </FormControl>
          </div>
        </div>
      </div>
      <Divider light sx={{marginLeft: '8px', marginRight: '8px', maxHeight: '64px', marginTop: '8px'}} className="mobile-hidden" orientation="vertical"/>
      <div style={{flexGrow: 3, flexBasis: 0, display: 'flex', flexFlow: 'column', maxHeight: '64px', minWidth: '0px', marginTop: '8px'}}>
        <div style={{display: 'flex', flexGrow: 0}}>
          <div style={{flexGrow: 1}}></div>
          <Typography sx={{fontSize: '12px', paddingBottom: '12px', flexGrow: 0}}>DATASET</Typography>
          <div style={{flexGrow: 1}}></div>
        </div>
        <div style={{display: 'flex', flexGrow: 1, flexShrink: 1}}>
          <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px', marginRight: '8px'}}>
            <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
              <InputLabel>Option Type</InputLabel>
              <Select sx={{height: 32}} label="Option Type" id="optionTypeSelect" value={optionType}
                      onChange={(event: any) => {setOptionType(event.target.value); handleConfigChange("option_type", event.target.value);}}>
                <MenuItem value={"both"}>{"Calls & Puts"}</MenuItem>
                <MenuItem value={"call"}>{"Calls only"}</MenuItem>
                <MenuItem value={"put"}>{"Puts only"}</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px', marginRight: '8px'}}>
            <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
              <InputLabel>Dataset Type</InputLabel>
              <Select sx={{height: 32}} label="Dataset Type" id="datasetTypeSelect" value={datasetType}
                      onChange={handleDatasetTypeChange}>
                <MenuItem value={"byExpiration"}>{"Expirations"}</MenuItem>
                <MenuItem value={"byStrike"}>{"Strikes"}</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px'}}>
            <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
              <InputLabel>Dataset Value</InputLabel>
              <Select sx={{height: 32}} label="Dataset Value" id="datasetValueSelect" value={datasetValue}
                      onChange={(event: any) => {setDatasetValue(event.target.value); handleConfigChange("dataset_value", event.target.value);}}>
                {datasetMenuItems}
              </Select>
            </FormControl>
          </div>
        </div>
      </div>
      <Divider light sx={{marginLeft: '8px', marginRight: '8px', maxHeight: '64px', marginTop: '8px'}} className="mobile-hidden" orientation="vertical"/>
      <div style={{flexGrow: 2, flexBasis: 0, display: 'flex', flexFlow: 'column', maxHeight: '64px', minWidth: '0px', marginTop: '8px'}}>
        <div style={{display: 'flex', flexGrow: 0}}>
          <div style={{flexGrow: 1}}></div>
          <Typography sx={{fontSize: '12px', paddingBottom: '12px', flexGrow: 0}}>X-AXIS RANGE</Typography>
          <div style={{flexGrow: 1}}></div>
        </div>
        <div style={{display: 'flex', flexGrow: 1, flexShrink: 1}}>
          <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px', marginRight: '8px'}}>
            <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
              <InputLabel>From</InputLabel>
              <Select sx={{height: 32}} label="From" id="yAxisSelect" value={lowerBound}
                      onChange={(event: any) => {setLowerBound(event.target.value); handleConfigChange("lower_bound", event.target.value);}}>
                {boundsMenuItems}
              </Select>
            </FormControl>
          </div>
          <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px'}}>
            <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
              <InputLabel>To</InputLabel>
              <Select sx={{height: 32}} label="To" id="yAxisSelect" value={upperBound}
                      onChange={(event: any) => {setUpperBound(event.target.value); handleConfigChange("upper_bound", event.target.value);}}>
                {boundsMenuItems}
              </Select>
            </FormControl>
          </div>
        </div>
      </div>
      <div style={{flexGrow: 0, flexBasis: 0, display: 'flex', flexFlow: 'column', maxHeight: '64px'}}></div>
    </div>
  );
}

function formatDataValue(value: any, classification: string) {
  var result: string = "";

  if (value == null) {
    return "N/A";
  }

  if (classification == "price" && !isNaN(value)) {
    result = (value < 0) ? ("-$" + Math.abs(value).toFixed(2)) : ("$" + value.toFixed(2));
  } else if (classification == "percentage" && !isNaN(value)) {
    result = (value * 100).toFixed(2) + "%";
  } else if (classification == "date_millis" && !isNaN(value)) {
    result = (new Date(value)).toISOString().split("T")[0];
  } else if (classification == "greeks" && !isNaN(value)) {
    result = value.toFixed(2);
  } else {
    result = value;
  }

  return result;
}

function formatChartData(filteredData: any, chartType: string) {
  var newData: any = {};
  var didAddLabels: boolean = false;
  for (var series in filteredData) {
    var newSeriesPoints: any[] = [];
    for (var pointInd in filteredData[series]) {
      if (chartType == "line") {
        newSeriesPoints.push({x: filteredData[series][pointInd][0], y: filteredData[series][pointInd][1]});
      } else if (chartType == "bar") {
        if (!didAddLabels) {
          if (newData.labels == null) {
            newData.labels = [];
          }
          newData.labels.push(filteredData[series][pointInd][0]);
        }
        newSeriesPoints.push(filteredData[series][pointInd][1]);
      }
    }
    didAddLabels = true;
    newData[series] = newSeriesPoints;
  }

  return newData;
}

function formatTableData(filteredData: any) {
  var result: any[][] = [];

  for (var series in filteredData) {
    const seriesArr: any[] = filteredData[series];
    for (var indVal in seriesArr) {
      var index: number = Number(indVal);
      if (index >= result.length) {
        var newRow: any[] = [];
        newRow.push(filteredData[series][index][0]);
        result.push(newRow);
      }

      // make sure values align in row
      if (filteredData[series][index][0] == result[index][0]) {
        result[index].push(filteredData[series][index][1]);
      } else {
        result[index].push("ERR");
      }
    }
  }

  return result;

}

function getFilteredData(optionsChain: OptionsChain, config: DataConfig) {
  const lookup: any = optionsChain.lookup;
  const entry: any = lookup[config.dataset_type];
  const callsAndPuts: any = entry[config.dataset_value];

  var callPoints: any[] = [];
  var putPoints: any[] = [];

  var reachedLowerBound: boolean = false;
  var reachedUpperBound: boolean = false;
  var lowerBoundVal: number = (config.dataset_type == "byExpiration") ? Number(config.lower_bound) : Date.parse(config.lower_bound);
  var upperBoundVal: number = (config.dataset_type == "byExpiration") ? Number(config.upper_bound) : Date.parse(config.upper_bound);

  var result: any = {};

  if (callsAndPuts != null) {
    const calls: string[] = callsAndPuts.call;
    const puts: string[] = callsAndPuts.put;

    var dataset: Contract[] = [];
    for (var i in calls) {
      const call: any = optionsChain.contracts[calls[i]];
      const put: any = optionsChain.contracts[puts[i]];

      // determine bounds comparison value for this options pair
      var currentBoundVal: number = 0;
      if (call != null && config.dataset_type == "byExpiration") {
        currentBoundVal = call.strike;
      } else if (call != null) {
        currentBoundVal = call.expiration_date_integer_millis;
      }

      // found lower bound; start adding entries
      if (currentBoundVal >= lowerBoundVal) {
        reachedLowerBound = true;
      }

      // add points to chart if within bounds
      if (call != null && put != null && reachedLowerBound && !reachedUpperBound) {
        callPoints.push([call[config.x_axis], call[config.y_axis]]);
        putPoints.push([put[config.x_axis], put[config.y_axis]]);
      }

      // found upper bound; stop adding entries
      if (currentBoundVal >= upperBoundVal) {
        reachedUpperBound = true;
      }
    }
  }

  if (config.option_type == "call" || config.option_type == "both") {
    result["Calls"] = callPoints;
  }

  if (config.option_type == "put" || config.option_type == "both") {
    result["Puts"] = putPoints;
  }

  return result;
}

/**
 * Produce a dataset within the desired parameters
 */
function getFilteredDataOld(optionsChain: OptionsChain, config: DataConfig) {

  const lookup: any = optionsChain.lookup;
  const entry: any = lookup[config.dataset_type];
  const callsAndPuts: any = entry[config.dataset_value];

  var callPoints: any[] = [];
  var putPoints: any[] = [];

  var reachedLowerBound: boolean = false;
  var reachedUpperBound: boolean = false;
  var lowerBoundVal: number = (config.dataset_type == "byExpiration") ? Number(config.lower_bound) : Date.parse(config.lower_bound);
  var upperBoundVal: number = (config.dataset_type == "byExpiration") ? Number(config.upper_bound) : Date.parse(config.upper_bound);

  var result: any = {};

  if (config.chart_type == "bar") {
    result["labels"] = [];
  }

  if (callsAndPuts != null) {
    const calls: string[] = callsAndPuts.call;
    const puts: string[] = callsAndPuts.put;

    var dataset: Contract[] = [];
    for (var i in calls) {
      const call: any = optionsChain.contracts[calls[i]];
      const put: any = optionsChain.contracts[puts[i]];

      // determine bounds comparison value for this options pair
      var currentBoundVal: number = 0;
      if (call != null && config.dataset_type == "byExpiration") {
        currentBoundVal = call.strike;
      } else if (call != null) {
        currentBoundVal = call.expiration_date_integer_millis;
      }

      // found lower bound; start adding entries
      if (currentBoundVal >= lowerBoundVal) {
        reachedLowerBound = true;
      }

      // add points to chart if within bounds
      if (call != null && put != null && reachedLowerBound && !reachedUpperBound) {
        if (config.chart_type == "line") {
          callPoints.push({x: call[config.x_axis], y: call[config.y_axis]});
          putPoints.push({x: put[config.x_axis], y: put[config.y_axis]});

        } else if (config.chart_type == "bar") {
          result["labels"].push(call[config.x_axis]);
          callPoints.push(call[config.y_axis]);
          putPoints.push(put[config.y_axis]);
        }
      }

      // found upper bound; stop adding entries
      if (currentBoundVal >= upperBoundVal) {
        reachedUpperBound = true;
      }
    }
  }

  if (config.option_type == "call" || config.option_type == "both") {
    result["Calls"] = callPoints;
  }

  if (config.option_type == "put" || config.option_type == "both") {
    result["Puts"] = putPoints;
  }

  return result;
}

/**
 * Get the name and format for any given type of filter
 */
function getFilterConfig(filterID: string) {
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
      format: "Integer"
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
