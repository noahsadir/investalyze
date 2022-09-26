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

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Scatter } from 'react-chartjs-2';

import {
  Contract, LookupTable, LookupTableEntry, OptionsChain
} from '../interfaces';
const fetch = require('node-fetch');

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

  const expirations = Object.keys(props.optionsChain.lookup.byExpiration);


  var [config, setConfig]: [DataConfig, any] = React.useState({
    x_axis: "strike",
    y_axis: "mark",
    chart_type: "line",
    option_type: "both",
    dataset_type: "byExpiration",
    dataset_value: (expirations != null && expirations.length > 0) ? expirations[0] : "",
    filters: filters
  });

  const handleConfigChange = (newConfig: DataConfig) => {
    setConfig(newConfig);
    console.log(newConfig);
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

  //console.log(props.config);

  const chartData: any = getFilteredData(props.optionsChain, props.config);

  console.log(chartData);

  const chartJSOptions: any = {
    legend: {
      labels: {
        fontColor: 'orange',
      },
      display: true,
    },
    responsive: true,
    maintainAspectRatio: false,
    animations: null,
    scales: {
      y: {
        type: 'linear'
      },
      x: {
        type: 'linear'
      },
    }
  };

  var datasets: any[] = [];
  for (var key in chartData) {
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

  return (
    <div style={{overflow: "hidden", display: "flex", flexFlow: "row", flex: "1 0 0"}}>
      <div style={{flex: "1 0 0", display: "flex", flexFlow: "column"}}>
        <div style={{flex: "1 0 0"}}/>
        <p style={{display: "block", writingMode: "vertical-rl",textAlign:"center",margin:0,padding:0,paddingBottom:24}}>{getFilterConfig(props.config.y_axis).name}</p>
        <div style={{flex: "1 0 0"}}/>
      </div>
      <div style={{overflow: "hidden", display: "flex", flexFlow: "column", flex: "100 0 0"}}>
        <div style={{flex: "1 0 0"}}/>
        <div style={{flex: "100 0 0", overflow: "hidden", borderRadius: 8}}>
          <Scatter
            style={{flexGrow: 0, flexBasis: 0, width: '100%', height: '100%'}}
            datasetIdKey='id'
            data={{
              datasets: datasets
            }}
            options={chartJSOptions}
          />
        </div>
        <p style={{display: "block", margin:0,padding:0,textAlign:"center",height:24,lineHeight:"24px"}}>{getFilterConfig(props.config.x_axis).name}</p>
        <div style={{flex: "1 0 0"}}/>
      </div>
      <div style={{flex: "1 0 0"}}/>
    </div>
  );

}

/**
 * Change the parameters of the data to be displayed by the chart
 */
function DataPaneToolbar(props: any) {

  var filterMenuItems: any[] = [];
  var datasetMenuItems: any[] = [];

  var [chartType, setChartType]: [string, any] = React.useState(props.config.chart_type);
  var [xAxis, setXAxis]: [string, any] = React.useState(props.config.x_axis);
  var [yAxis, setYAxis]: [string, any] = React.useState(props.config.y_axis);

  var [optionType, setOptionType]: [string, any] = React.useState(props.config.option_type);
  var [datasetType, setDatasetType]: [string, any] = React.useState(props.config.dataset_type);
  var [datasetValue, setDatasetValue]: [string, any] = React.useState(props.config.dataset_value);

  // propogate changes to parent
  const handleConfigChange = (key: string, value: any) => {
    var newConfig: any = {
      x_axis: xAxis,
      y_axis: yAxis,
      chart_type: chartType,
      option_type: optionType,
      dataset_type: datasetType,
      dataset_value: datasetValue,
      filters: props.config.filters
    };
    newConfig[key] = value;
    props.onConfigChange(newConfig);
  }

  // get list of stikes or expirations depending on type selected
  for (var val in props.optionsChain.lookup[datasetType]) {
    datasetMenuItems.push(<MenuItem value={val}>{val}</MenuItem>);
  }

  // get list of data points for contracts
  for (var key in props.config.filters) {
    filterMenuItems.push(<MenuItem value={key}>{getFilterConfig(key).name}</MenuItem>)
  }

  // more involved since it changes the options for dataset values
  const handleDatasetTypeChange = (event: any) => {
    if (props.optionsChain.lookup[event.target.value] != null) {
      var defaultVal = Object.keys(props.optionsChain.lookup[event.target.value])[0];
      setDatasetValue(defaultVal);
    }

    setDatasetType(event.target.value);
    handleConfigChange("dataset_type", event.target.value);
  }

  // Selects are quite a PITA
  return (
    <div className="hbox-mobile" style={{flexGrow: 0, marginTop: '8px'}}>
      <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', flexFlow: 'column', maxHeight: '64px'}}>
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
                <MenuItem value={"surface"}>{"Surface Chart"}</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px', marginRight: '8px'}}>
            <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
              <InputLabel>X-Axis</InputLabel>
              <Select sx={{height: 32}} label="X-Axis" id="xAxisSelect" value={xAxis}
                      onChange={(event: any) => {setXAxis(event.target.value); handleConfigChange("x_axis", event.target.value);}}>
                {filterMenuItems}
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
      <Divider light sx={{marginLeft: '8px', marginRight: '8px', maxHeight: '64px'}} className="mobile-hidden" orientation="vertical"/>
      <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', flexFlow: 'column', maxHeight: '64px'}}>
        <div style={{display: 'flex', flexGrow: 0}}>
          <div style={{flexGrow: 1}}></div>
          <Typography sx={{fontSize: '12px', paddingBottom: '12px', flexGrow: 0}}>DATASET</Typography>
          <div style={{flexGrow: 1}}></div>
        </div>
        <div style={{display: 'flex', flexGrow: 1}}>
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
    </div>
  );
}

/**
 * Produce a dataset within the desired parameters
 */
function getFilteredData(optionsChain: OptionsChain, config: DataConfig) {

  const lookup: any = optionsChain.lookup;
  const entry: any = lookup[config.dataset_type];
  const callsAndPuts: any = entry[config.dataset_value];

  var callPoints: any[] = [];
  var putPoints: any[] = [];

  var result: any = {};

  if (callsAndPuts != null) {
    const calls: string[] = callsAndPuts.call;
    const puts: string[] = callsAndPuts.put;

    var dataset: Contract[] = [];
    for (var i in calls) {
      const call: any = optionsChain.contracts[calls[i]];
      const put: any = optionsChain.contracts[puts[i]];
      callPoints.push({x: call[config.x_axis], y: call[config.y_axis]});
      putPoints.push({x: put[config.x_axis], y: put[config.y_axis]});
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
