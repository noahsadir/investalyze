import React from 'react';
import '../App.css';
import { styled, alpha } from '@mui/material/styles';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Slide from '@mui/material/Slide';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TransitionProps } from '@mui/material/transitions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { red, green, grey } from '@mui/material/colors';

import {
  contractValue,
  strategyValue,
  strategyValueForecastTable,
  calculateInflectionPrices
} from '../Pricing';

import {
  Contract, LookupTable, LookupTableEntry, OptionsChain, OptionStrategy, StrategyLeg
} from '../interfaces';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

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

export function StrategyView(props: any) {

  return (
    <Dialog fullScreen open={props.isOpen} TransitionComponent={Transition}>
      <AppBar sx={{position: 'relative'}}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={(event: any) => props.onClose()} aria-label="close">
            <CloseRoundedIcon/>
          </IconButton>
          <Typography>
          {props.title}
          </Typography>
        </Toolbar>
      </AppBar>
      <StrategyViewMainContent isOpen={props.isOpen} strategy={props.strategy} optionsChain={props.optionsChain}/>
    </Dialog>
  );
}

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
                <MenuItem value={"table"}>{"Table"}</MenuItem>
                <MenuItem value={"chart"}>{"Chart"}</MenuItem>
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
                <MenuItem value={1}>{"1"}</MenuItem>
                <MenuItem value={2}>{"2"}</MenuItem>
                <MenuItem value={3}>{"3"}</MenuItem>
                <MenuItem value={4}>{"4"}</MenuItem>
                <MenuItem value={5}>{"5"}</MenuItem>
                <MenuItem value={10}>{"10"}</MenuItem>
                <MenuItem value={15}>{"15"}</MenuItem>
                <MenuItem value={20}>{"20"}</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px', marginRight: '8px'}}>
            <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
              <InputLabel>Type</InputLabel>
              <Select sx={{height: 32}} label="Type" id="spotIntervalTypeSelect" value={props.config.spot_interval_type}
                      onChange={(event: any) => {props.onConfigChange("spot_interval_type", event.target.value);}}>
                <MenuItem value={"dollar"}>{"Dollars ($)"}</MenuItem>
                <MenuItem value={"percent"}>{"Percent (%)"}</MenuItem>
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
                <MenuItem value={86400000}>{"Daily"}</MenuItem>
                <MenuItem value={86400000 * 7}>{"Weekly"}</MenuItem>
                <MenuItem value={86400000 * 30}>{"Monthly"}</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForecastView(props: any) {

  var [chartType, setChartType]: [string, any] = React.useState("table");

  var [spotIntervalCount, setSpotIntervalCount]: [number, any] = React.useState(3);
  var [spotInterval, setSpotInterval]: [number, any] = React.useState(3);
  var [spotIntervalType, setSpotIntervalType]: [string, any] = React.useState("percent");

  var [dateInterval, setDateInterval]: [number, any] = React.useState(86400000 * 7);

  const calculatedSpotInterval: number = (spotIntervalType == "dollar") ? spotInterval : (props.optionsChain.spot_price * (0.01 * spotInterval));

  var forecastData: any = strategyValueForecastTable(props.strategy, props.optionsChain.spot_price, props.optionsChain.fetch_date, dateInterval, calculatedSpotInterval, spotIntervalCount);
  var netPremium: number = (props.strategy.share_count * props.strategy.underlying_cost_basis);

  for (var index in props.strategy.legs) {
    const leg: StrategyLeg = props.strategy.legs[index];
    netPremium += (leg.premium * leg.position_size * 100);
  }

  const tableData: any = generateTableData(forecastData, netPremium, props.optionsChain.spot_price);

  const handleConfigChange = (config: string, value: any) => {
    if (config == "chart_type") {
      setChartType(value);
    } else if (config == "spot_interval_amount") {
      setSpotInterval(value);
    } else if (config == "spot_interval_type") {
      setSpotIntervalType(value);
    } else if (config == "date_interval_amount") {
      setDateInterval(value);
    }
  }

  return (
    <Paper sx={{flexGrow: 1, flexFlow: 'column', display: 'flex'}} variant={"outlined"}>
      <ForecastToolbar config={{chart_type: chartType, spot_interval_amount: spotInterval, spot_interval_type: spotIntervalType, date_interval_amount: dateInterval}}
        onConfigChange={handleConfigChange}/>
      <Divider light style={{margin: '8px'}}/>
      <Paper sx={{flexGrow: 1, flexFlow: 'column', display: 'flex', overflow: 'hidden', margin: '8px'}}>
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
    </Paper>
  );
}

function generateTableData(forecastData: any, netPremium: number, currentSpot: number) {
  var tableHeadCells: any[] = [];
  var tableBodyRows: any[] = [];

  var invertedForecastData: any = {};
  tableHeadCells.push(
    <TableCell sx={{whiteSpace: 'nowrap', backgroundColor: '#000000', position: 'sticky', left: 0}}>
    Spot Price
    </TableCell>
  );
  for (var date in forecastData) {
    tableHeadCells.push(<TableCell sx={{whiteSpace: 'nowrap', backgroundColor: '#000000'}}>{humanReadableDate(Number(date))}</TableCell>);
    for (var spot in forecastData[date]) {
      if (invertedForecastData[spot] == null) {
        invertedForecastData[spot] = {};
      }

      invertedForecastData[spot][date] = forecastData[date][spot];
    }
  }

  for (var spot in invertedForecastData) {
    var rowCells: any[] = [];
    rowCells.push(
      <TableCell sx={{backgroundColor: '#000000', position: 'sticky', left: 0}}>
        <div style={{display: 'flex', flexFlow: 'column'}}>
          <Typography>{"$" + Number(spot).toFixed(2)}</Typography>
          <Typography style={{color: ((Number(spot) - currentSpot >= 0) ? green[300] : red[300])}}>{getNetProfitPercentage(currentSpot, Number(spot))}</Typography>
        </div>
    </TableCell>
    );
    for (var date in invertedForecastData[spot]) {
      rowCells.push(
        <TableCell>
          <div style={{display: 'flex', flexFlow: 'column'}}>
            <Typography>{(invertedForecastData[spot][date] < 0 ? "-" : "") + "$" + Math.abs(invertedForecastData[spot][date]).toFixed(2)}</Typography>
            <Typography style={{color: ((invertedForecastData[spot][date] - netPremium >= 0) ? green[300] : red[300])}}>{getNetProfitPercentage(netPremium, invertedForecastData[spot][date])}</Typography>
          </div>
        </TableCell>
      );
    }
    tableBodyRows.push(<StyledTableRow>{rowCells}</StyledTableRow>);
  }

  return {
    headCells: tableHeadCells,
    bodyRows: tableBodyRows
  }
}

function humanReadableDate(value: number) {
  return (new Date(value)).toISOString().split("T")[0];
}

function getNetProfitValue(openValue: number, closeValue: number) {
  var netProfit: number = closeValue - openValue;
  if (netProfit < 0) {
    return ("-$" + Math.abs(netProfit).toFixed(2));
  }
  return ("$" + netProfit.toFixed(2));
}

function getNetProfitPercentage(openValue: number, closeValue: number) {
  var ratio: number = (closeValue - openValue) / openValue;
  if (openValue < 0) {
    ratio *= -1;
  }
  return ((ratio >= 0) ? "+" : "-") + Math.abs(ratio * 100).toFixed(2) + "%";
}
