/**
 * DataPane.tsx
 *
 * Allows user to see aggregate data for every options contract.
 */

import React from 'react';
import '../App.css';
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

import {
  MultiChartData, MultiChart
} from './MultiChart';

import {
  OptionsChain, ContractFields
} from '../interfaces';

import {
  formatValue, getContractFieldConfig
} from '../Conversions';

interface DataConfig {
  x_axis: string;
  y_axis: string;
  chart_type: string;
  option_type: string;
  dataset_type: string;
  dataset_value: string;
  lower_bound: string;
  upper_bound: string;
}

interface FilteredDataPoints {
  Calls?: [any, any][];
  Puts?: [any, any][];
}

/**
 * Trading pane for Data View
 */
export function DataPane(props: any) {

  // Generate (sorted) lists of expirattions and strikes
  const expirations: string[] = Object.keys(props.optionsChain.lookup.byExpiration);
  const strikes: string[] = Object.keys(props.optionsChain.lookup.byStrike).sort((a: string, b: string) => {return Number(a) - Number(b);});

  // Initial configuration of data
  var [config, setConfig]: [DataConfig, any] = React.useState({
    x_axis: "strike",
    y_axis: "mark",
    chart_type: "line",
    option_type: "both",
    dataset_type: "byExpiration",
    dataset_value: (expirations != null && expirations.length > 0) ? expirations[0] : "",
    lower_bound: (strikes != null && strikes.length > 0) ? strikes[0] : "",
    upper_bound: (strikes != null && strikes.length > 0) ? strikes[strikes.length - 1] : ""
  });

  const handleConfigChange = (newConfig: DataConfig) => {
    setConfig(newConfig);
  }

  return ((props.optionsChain != null) ? (
    <div style={{display: (props.isVisible ? 'flex' : 'none'), flexFlow: 'column', flexGrow: 1}}>
      <DataPaneToolbar config={config} onConfigChange={handleConfigChange} optionsChain={props.optionsChain}/>
      <Divider sx={{marginTop: '8px', marginBottom: '8px'}} light/>
      <DataPaneMainContent config={config} optionsChain={props.optionsChain}/>
    </div>
  ) : (
    <div style={{display: (props.isVisible ? 'flex' : 'none')}}>
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

  // Create table header
  var bodyRows: any[] = [];
  var headColumnCells: any[] = [];
  headColumnCells.push(<TableCell key={"xAxis"}>{getContractFieldConfig(props.config.x_axis).name}</TableCell>);
  for (var series in filteredData) {
    headColumnCells.push(<TableCell key={series}>{getContractFieldConfig(props.config.y_axis).name + " (" + series + ")"}</TableCell>);
  }

  // Create table body
  for (var index in tableData) {
    var bodyRowCells: any[] = [];
    for (var cellInd in tableData[index]) {
      var format: string = getContractFieldConfig(props.config.y_axis).format;
      if (Number(cellInd) === 0) {
        format = getContractFieldConfig(props.config.x_axis).format;
      }
      bodyRowCells.push(<TableCell key={cellInd}>{formatValue(tableData[index][cellInd], format)}</TableCell>);
    }
    bodyRows.push(<TableRow key={index}>{bodyRowCells}</TableRow>);
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
          <MultiChart
            data={filteredData as MultiChartData}
            style={{display: 'flex', flex: '1 0 0'}}
            usesDate={props.config.dataset_type === "byStrike"}
            chartType={props.config.chart_type}
            xAxisLabel={getContractFieldConfig(props.config.x_axis).name}
            yAxisLabel={getContractFieldConfig(props.config.y_axis).name}/>
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

  const boundsSorted: string[] = (datasetType === "byExpiration") ? Object.keys(props.optionsChain.lookup.byStrike).sort((a: string, b: string) => {return Number(a) - Number(b);}) : Object.keys(props.optionsChain.lookup.byExpiration);

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
      upper_bound: upperBound
    };
    newConfig[key] = value;
    props.onConfigChange(newConfig);
  }

  // get list of stikes or expirations depending on type selected
  for (var val in props.optionsChain.lookup[datasetType]) {
    datasetMenuItems.push(<MenuItem key={val} value={val}>{val}</MenuItem>);
  }

  // get list of stikes or expirations depending on x axis
  for (var boundVal in boundsSorted) {
    boundsMenuItems.push(<MenuItem key={boundsSorted[boundVal]} value={boundsSorted[boundVal]}>{boundsSorted[boundVal]}</MenuItem>);
  }

  // get list of data points for contracts
  for (var index in ContractFields) {
    filterMenuItems.push(<MenuItem key={ContractFields[index]} value={ContractFields[index]}>{getContractFieldConfig(ContractFields[index]).name}</MenuItem>)
  }

  // more involved since it changes the options for dataset values
  const handleDatasetTypeChange = (event: any) => {
    if (props.optionsChain.lookup[event.target.value] != null) {
      var datasetValues: string[] = Object.keys(props.optionsChain.lookup[event.target.value]);
      const boundsValues: string[] = (event.target.value === "byExpiration") ? Object.keys(props.optionsChain.lookup.byStrike).sort((a: string, b: string) => {return Number(a) - Number(b);}) : Object.keys(props.optionsChain.lookup.byExpiration);

      setDatasetValue(datasetValues[0]);
      setLowerBound(boundsValues[0]);
      setUpperBound(boundsValues[boundsValues.length - 1]);


      setXAxis(event.target.value === "byExpiration" ? "strike" : "expiration_date_integer_millis");
      setDatasetType(event.target.value);

      var newConfig: any = {
        x_axis: (event.target.value === "byExpiration" ? "strike" : "expiration_date_integer_millis"),
        y_axis: yAxis,
        chart_type: chartType,
        option_type: optionType,
        dataset_type: event.target.value,
        dataset_value: datasetValues[0],
        lower_bound: boundsValues[0],
        upper_bound: boundsValues[boundsValues.length - 1]
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

/**
 * Format data in a way that can easily be processed for a table.
 */
function formatTableData(filteredDataInput: FilteredDataPoints) {
  // need to cast data as any for proper iteration
  const filteredData: any = filteredDataInput as any;

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
      if (filteredData[series][index][0] === result[index][0]) {
        result[index].push(filteredData[series][index][1]);
      } else {
        result[index].push("ERR");
      }
    }
  }

  return result;

}

/**
 * Retrieve contracts in the options chain which meet the specified config,
 * then return the data in a format which can be processed for visualizations.
 */
function getFilteredData(optionsChain: OptionsChain, config: DataConfig) {
  const lookup: any = optionsChain.lookup;
  const entry: any = lookup[config.dataset_type];
  const callsAndPuts: any = entry[config.dataset_value];

  var callPoints: any[] = [];
  var putPoints: any[] = [];

  var reachedLowerBound: boolean = false;
  var reachedUpperBound: boolean = false;
  var lowerBoundVal: number = (config.dataset_type === "byExpiration") ? Number(config.lower_bound) : Date.parse(config.lower_bound);
  var upperBoundVal: number = (config.dataset_type === "byExpiration") ? Number(config.upper_bound) : Date.parse(config.upper_bound);

  var result: FilteredDataPoints = {};

  if (callsAndPuts != null) {
    const calls: string[] = callsAndPuts.call;
    const puts: string[] = callsAndPuts.put;

    for (var i in calls) {
      const call: any = optionsChain.contracts[calls[i]];
      const put: any = optionsChain.contracts[puts[i]];

      // determine bounds comparison value for this options pair
      var currentBoundVal: number = 0;
      if (call != null && config.dataset_type === "byExpiration") {
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

  if (config.option_type === "call" || config.option_type === "both") {
    result["Calls"] = callPoints;
  }

  if (config.option_type === "put" || config.option_type === "both") {
    result["Puts"] = putPoints;
  }

  return result;
}
