/**
 * StrategyView.tsx
 *
 * View forecasts, historical data, and characteristics of a particular
 * options strategy
 */

import React from 'react';
import '../App.css';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Slide from '@mui/material/Slide';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TransitionProps } from '@mui/material/transitions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import {
  MultiChartData, MultiChart
} from './MultiChart';

import { red, green } from '@mui/material/colors';

import {
  formatValue
} from '../Conversions';

import {
  strategyValueForecastTable
} from '../Pricing';

import {
  OptionStrategy, StrategyLeg
} from '../interfaces';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * Dialog of TradingPane which displays strategy info
 */
export function StrategyView(props: any) {

  const netPremium: number = netPremiumForStrategy(props.strategy);

  var legDataString: string = "";
  for (var index in props.strategy.legs) {
    if (legDataString !== "") {
      legDataString += ", ";
    }
    legDataString += ((props.strategy.legs[index].position_size > 0 ? "LONG " : "SHORT ") + "$" + props.strategy.legs[index].contract.strike + props.strategy.legs[index].contract.option_type.charAt(0).toUpperCase());
  }

  return (
    <Dialog fullScreen open={props.isOpen} TransitionComponent={Transition}>
      <AppBar sx={{position: 'relative'}}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={(event: any) => props.onClose()} aria-label="close">
            <CloseRoundedIcon/>
          </IconButton>
          <div style={{display: 'flex', flexGrow: 0, flexBasis: 0, flexFlow: 'column', marginRight: '16px'}}>
            <Typography sx={{fontWeight: 800, fontSize: '16px', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>{props.title}</Typography>
            <Typography sx={{fontSize: '12px', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>{legDataString}</Typography>
          </div>
          <div style={{display: 'flex', flexGrow: 1}}></div>
          <div style={{display: 'flex', flexGrow: 0, flexBasis: 0, flexFlow: 'column', marginRight: '16px'}}>
            <Typography sx={{fontSize: '12px', whiteSpace: 'nowrap'}}>{"NET " + (netPremium < 0 ? "CREDIT" : "DEBIT")}</Typography>
            <Typography sx={{fontSize: '16px', whiteSpace: 'nowrap'}}>{"$" + Math.abs(netPremium).toFixed(2)}</Typography>
          </div>
          <div style={{display: 'flex', flexGrow: 0, flexBasis: 0, flexFlow: 'column', marginRight: '8px'}}>
            <Typography sx={{fontSize: '12px', whiteSpace: 'nowrap'}}>{props.optionsChain.quote.symbol + " SPOT"}</Typography>
            <Typography sx={{fontSize: '16px', whiteSpace: 'nowrap'}}>{"$" + props.optionsChain.spot_price.toFixed(2)}</Typography>
          </div>
        </Toolbar>
      </AppBar>
      <StrategyViewMainContent isOpen={props.isOpen} strategy={props.strategy} optionsChain={props.optionsChain}/>
    </Dialog>
  );
}

/**
 * Main content of strategy view
 */
function StrategyViewMainContent(props: any) {
  if (props.isOpen) {
    return (
      <div style={{display: 'flex', flexFlow: 'column', flex: '1 0 0', margin: '8px'}}>
        <ForecastView strategy={props.strategy} optionsChain={props.optionsChain}/>
      </div>
    );
  } else {
    return (
      <div></div>
    );
  }
}

/**
 * Allows user to view forecast of future options prices
 */
function ForecastView(props: any) {

  var [chartType, setChartType]: [string, any] = React.useState("table");

  var [spotInterval, setSpotInterval]: [number, any] = React.useState(3);
  var [spotIntervalType, setSpotIntervalType]: [string, any] = React.useState("percent");

  var [dateInterval, setDateInterval]: [number, any] = React.useState(86400000 * 7);

  const calculatedSpotInterval: number = (spotIntervalType === "dollar") ? spotInterval : (props.optionsChain.spot_price * (0.01 * spotInterval));

  var forecastData: any = strategyValueForecastTable(props.strategy, props.optionsChain.spot_price, props.optionsChain.fetch_date, dateInterval, calculatedSpotInterval, 4);
  const netPremium: number = netPremiumForStrategy(props.strategy);

  const tableData: any = generateTableData(forecastData, netPremium, props.optionsChain.spot_price, props.optionsChain.quote.symbol);
  const chartData: MultiChartData = generateChartData(forecastData);

  const handleConfigChange = (config: string, value: any) => {
    if (config === "chart_type") {
      setChartType(value);
    } else if (config === "spot_interval_amount") {
      setSpotInterval(value);
    } else if (config === "spot_interval_type") {
      setSpotIntervalType(value);
    } else if (config === "date_interval_amount") {
      setDateInterval(value);
    }
  }

  return (
    <Paper sx={{flexGrow: 1, flexFlow: 'column', display: 'flex'}}>
      <ForecastToolbar config={{chart_type: chartType, spot_interval_amount: spotInterval, spot_interval_type: spotIntervalType, date_interval_amount: dateInterval}}
        onConfigChange={handleConfigChange}/>
      <Divider light style={{margin: '8px'}}/>
      <Paper variant="outlined" sx={{flexGrow: 1, flexFlow: 'column', display: (chartType === "table" ? 'flex' : 'none'), overflow: 'hidden', margin: '8px'}}>
        <TableContainer sx={{flex: '1 0 0', 'minHeight': 0}}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {tableData.headCells}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.bodyRows}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Paper variant="outlined" sx={{flexGrow: 1, flexFlow: 'column', display: (chartType === "chart" ? 'flex' : 'none'), overflow: 'hidden', margin: '8px'}}>
        <MultiChart
          data={chartData}
          style={{display: 'flex', flex: '1 0 0'}}
          usesDate={false}
          chartType={"line"}
          xAxisLabel={"Spot Price"}
          yAxisLabel={"Strategy Value"}/>
      </Paper>
    </Paper>
  );
}

/**
 * Allows user to customize bounds and display of forecast
 */
function ForecastToolbar(props: any) {

  return (
    <div className="hbox-mobile" style={{flexGrow: 0, marginLeft: '8px', marginRight: '8px'}}>
      <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', flexFlow: 'column', maxHeight: '64px', minWidth: '0px', marginTop: '8px'}}>
        <div style={{display: 'flex', flexGrow: 0}}>
          <div style={{flexGrow: 1}}></div>
          <Typography sx={{fontSize: '12px', paddingBottom: '12px', flexGrow: 0}}>CHART OPTIONS</Typography>
          <div style={{flexGrow: 1}}></div>
        </div>
        <div style={{display: 'flex', flexGrow: 1}}>
          <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px', marginRight: '8px'}}>
            <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
              <InputLabel>Display Type</InputLabel>
              <Select sx={{height: 32}} label="Display Type" id="chartTypeSelect" value={props.config.chart_type}
                      onChange={(event: any) => {props.onConfigChange("chart_type", event.target.value);}}>
                <MenuItem key={"chartTypeTable"} value={"table"}>{"Table"}</MenuItem>
                <MenuItem key={"chartTypeChart"} value={"chart"}>{"Chart"}</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      </div>
      <div style={{flexGrow: 2, flexBasis: 0, display: 'flex', flexFlow: 'column', maxHeight: '64px', minWidth: '0px', marginTop: '8px'}}>
        <div style={{display: 'flex', flexGrow: 0}}>
          <div style={{flexGrow: 1}}></div>
          <Typography sx={{fontSize: '12px', paddingBottom: '12px', flexGrow: 0}}>SPOT INTERVAL</Typography>
          <div style={{flexGrow: 1}}></div>
        </div>
        <div style={{display: 'flex', flexGrow: 1}}>
          <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px', marginRight: '8px'}}>
            <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
              <InputLabel>Interval</InputLabel>
              <Select sx={{height: 32}} label="Interval" id="spotIntervalAmountSelect" value={props.config.spot_interval_amount}
                      onChange={(event: any) => {props.onConfigChange("spot_interval_amount", event.target.value);}}>
                <MenuItem key={"spIntvl1"} value={1}>{"1"}</MenuItem>
                <MenuItem key={"spIntvl2"} value={2}>{"2"}</MenuItem>
                <MenuItem key={"spIntvl3"} value={3}>{"3"}</MenuItem>
                <MenuItem key={"spIntvl4"} value={4}>{"4"}</MenuItem>
                <MenuItem key={"spIntvl5"} value={5}>{"5"}</MenuItem>
                <MenuItem key={"spIntvl10"} value={10}>{"10"}</MenuItem>
                <MenuItem key={"spIntvl15"} value={15}>{"15"}</MenuItem>
                <MenuItem key={"spIntvl20"} value={20}>{"20"}</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px', marginRight: '8px'}}>
            <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
              <InputLabel>Type</InputLabel>
              <Select sx={{height: 32}} label="Type" id="spotIntervalTypeSelect" value={props.config.spot_interval_type}
                      onChange={(event: any) => {props.onConfigChange("spot_interval_type", event.target.value);}}>
                <MenuItem key={"spTypeDollar"} value={"dollar"}>{"Dollars ($)"}</MenuItem>
                <MenuItem key={"spTypePercent"} value={"percent"}>{"Percent (%)"}</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      </div>
      <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', flexFlow: 'column', maxHeight: '64px', minWidth: '0px', marginTop: '8px'}}>
        <div style={{display: 'flex', flexGrow: 0}}>
          <div style={{flexGrow: 1}}></div>
          <Typography sx={{fontSize: '12px', paddingBottom: '12px', flexGrow: 0}}>DATE INTERVAL</Typography>
          <div style={{flexGrow: 1}}></div>
        </div>
        <div style={{display: 'flex', flexGrow: 1}}>
          <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px', marginRight: '8px'}}>
            <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
              <InputLabel>Interval</InputLabel>
              <Select sx={{height: 32}} label="Interval" id="dateIntervalSelect" value={props.config.date_interval_amount}
                      onChange={(event: any) => {props.onConfigChange("date_interval_amount", event.target.value);}}>
                <MenuItem key={"dateIntvlDaily"} value={86400000}>{"Daily"}</MenuItem>
                <MenuItem key={"dateIntvlWeekly"} value={86400000 * 7}>{"Weekly"}</MenuItem>
                <MenuItem key={"dateIntvlMonthly"} value={86400000 * 30}>{"Monthly"}</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Converts forecast data into format accepted by MultiChart
 */
function generateChartData(forecastData: any) {
  var result: MultiChartData = {};
  for (var date in forecastData) {
    const dateString: string = formatValue(Number(date), "date_millis");
    result[dateString] = [];
    for (var spot in forecastData[date]) {
      result[dateString].push([Number(spot), forecastData[date][spot]]);
    }
  }
  return result;
}

/**
 * Build table using forecast data
 */
function generateTableData(forecastData: any, netPremium: number, currentSpot: number, symbol: string) {
  var tableHeadCells: any[] = [];
  var tableBodyRows: any[] = [];

  // silence 'already defined' errors
  var date: string;
  var spot: string;


  // build table header
  var invertedForecastData: any = {};
  tableHeadCells.push(
    <TableCell key={"headSpot"} sx={{whiteSpace: 'nowrap', backgroundColor: '#000000', position: 'sticky', left: 0, zIndex: 3}}>
    {symbol + " Price"}
    </TableCell>
  );

  for (date in forecastData) {
    tableHeadCells.push(<TableCell key={"head" + date} sx={{whiteSpace: 'nowrap', backgroundColor: '#000000'}}>{formatValue(Number(date), "date_millis")}</TableCell>);
    for (spot in forecastData[date]) {
      if (invertedForecastData[spot] == null) {
        invertedForecastData[spot] = {};
      }
      invertedForecastData[spot][date] = forecastData[date][spot];
    }
  }

  // build table body
  for (spot in invertedForecastData) {
    var rowCells: any[] = [];
    rowCells.push(
      <TableCell key={spot} sx={{backgroundColor: '#000000', position: 'sticky', left: 0}}>
        <div style={{display: 'flex', flexFlow: 'column'}}>
          <Typography>{"$" + Number(spot).toFixed(2)}</Typography>
          <Typography style={{color: ((Number(spot) - currentSpot >= 0) ? green[300] : red[300])}}>{getNetProfitPercentage(currentSpot, Number(spot))}</Typography>
        </div>
    </TableCell>
    );

    for (date in invertedForecastData[spot]) {
      rowCells.push(
        <TableCell key={date} style={{}}>
          <div style={{display: 'flex', flexFlow: 'column'}}>
            <Typography>{(invertedForecastData[spot][date] < 0 ? "-" : "") + "$" + Math.abs(invertedForecastData[spot][date]).toFixed(2)}</Typography>
            <Typography style={{color: ((invertedForecastData[spot][date] - netPremium >= 0) ? green[300] : red[300])}}>{getNetProfitPercentage(netPremium, invertedForecastData[spot][date])}</Typography>
          </div>
        </TableCell>
      );
    }
    tableBodyRows.push(<StyledTableRow key={"row" + spot}>{rowCells}</StyledTableRow>);
  }

  return {
    headCells: tableHeadCells,
    bodyRows: tableBodyRows
  }
}

function getNetProfitPercentage(openValue: number, closeValue: number) {
  var ratio: number = (closeValue - openValue) / openValue;
  if (openValue < 0) {
    ratio *= -1;
  }
  return ((ratio >= 0) ? "+" : "-") + Math.abs(ratio * 100).toFixed(2) + "%";
}

function netPremiumForStrategy(strategy: OptionStrategy) {
  var netPremium: number = (strategy.share_count * strategy.underlying_cost_basis);

  for (var index in strategy.legs) {
    const leg: StrategyLeg = strategy.legs[index];
    netPremium += (leg.premium * leg.position_size * 100);
  }

  return netPremium;
}
