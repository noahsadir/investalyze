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

import { Contract, LookupTable, LookupTableEntry, OptionsChain } from '../interfaces';
import { SummaryPane } from './SummaryPane';
import { MetricsPane } from './MetricsPane';
import { DataPane } from './DataPane';
import { TradingPane } from './TradingPane';
const fetch = require('node-fetch');

/**
 * Manages analysis section of the app.
 */
export function AnalysisView(props: any) {

  const [analysisType, setAnalysisType] = React.useState('data');

  const handleAnalysisTypeChange = (event: any, selectedType: string) => {
    if (selectedType !== null) {
      setAnalysisType(selectedType);
    }
  };

  const toggleStyle = {
    flexGrow: 1
  };
  
  /*
  <ToggleButton style={toggleStyle} value="summary">Summary</ToggleButton>
  <ToggleButton style={toggleStyle} value="data">Data</ToggleButton>
  <ToggleButton style={toggleStyle} value="metrics">Metrics</ToggleButton>
  <ToggleButton style={toggleStyle} value="trading">Trading</ToggleButton>
  */

  return (
    <div style={{display: 'flex', flexFlow: 'column', flexGrow: 1}}>
      <Paper style={{margin: 8, marginBottom: 0, padding: 8, display: 'flex', flexGrow: 0}} elevation={3}>
        <ToggleButtonGroup style={{display: 'flex', flexGrow: 1}} value={analysisType} color="primary" onChange={handleAnalysisTypeChange} exclusive>
          <ToggleButton style={toggleStyle} value="data">Data</ToggleButton>
        </ToggleButtonGroup>
      </Paper>
      <div style={{flexGrow: 1, display: 'flex'}}>
        <MainContent optionsChains={props.optionsChains} paneType={analysisType}/>
      </div>
    </div>
  );
}

function getFractionPercentage(numerator: number, denominator: number) {
  if (denominator == 0) {
    return "-- %";
  }
  const ratio: number = numerator / denominator;
  return ((ratio < 0 ? "" : "+") + (ratio * 100).toFixed(2) + "%");
}

/**
 * Manages pane toggling and general configuration
 */
function MainContent(props: any) {


  const [selectedSymbol, setSelectedSymbol] = React.useState("");
  const [symbolList, setSymbolList] = React.useState([]);

  var symbolName: string = "--";
  var symbolPrice: string = "$ --";

  if (props.optionsChains[selectedSymbol] == null && Object.keys(props.optionsChains).length > 0) {
    setSelectedSymbol(Object.keys(props.optionsChains)[0]);
  }

  if (props.optionsChains[selectedSymbol] != null) {
    symbolName = props.optionsChains[selectedSymbol].quote.name;
    symbolPrice = "$" + props.optionsChains[selectedSymbol].quote.spot_price.toFixed(2) + " (" + getFractionPercentage(props.optionsChains[selectedSymbol].quote.change, props.optionsChains[selectedSymbol].quote.spot_price) + ")";
  }

  var selectedPane: any = null;
  switch (props.paneType) {
    case "summary":
      selectedPane = (<SummaryPane selectedSymbol={selectedSymbol} optionsChain={props.optionsChains[selectedSymbol]}/>);
      break;
    case "data":
      selectedPane = (<DataPane selectedSymbol={selectedSymbol} optionsChain={props.optionsChains[selectedSymbol]}/>);
      break;
    case "metrics":
      selectedPane = (<MetricsPane selectedSymbol={selectedSymbol} optionsChain={props.optionsChains[selectedSymbol]}/>);
      break;
    case "trading":
      selectedPane = (<TradingPane selectedSymbol={selectedSymbol} optionsChain={props.optionsChains[selectedSymbol]}/>);
      break;
    default:
      break;
  }

  const handleSymbolSelectChange = (event: SelectChangeEvent) => {
    setSelectedSymbol(event.target.value);
  };

  var symbolSelectItems: any[] = [];
  for (var symbol in props.optionsChains) {
    symbolSelectItems.push(<MenuItem value={symbol}>{symbol}</MenuItem>);
  }

  //<MenuItem value={"MSFT"}>MSFT</MenuItem>
  return (props.optionsChains[selectedSymbol] != null) ? (
    <Paper style={{margin: 8, padding: 8, display: 'flex', flexGrow: 1, flexFlow: 'column', maxWidth: 'calc(calc(100vw) - 16px)'}} elevation={1}>
      <div style={{flexGrow: 0, display: 'flex', paddingBottom: '8px'}}>
        <div style={{flexBasis: 0, flexGrow: 1, display: 'flex'}}>
          <FormControl sx={{minWidth: 128, flexBasis: 0, flexGrow: 0}}>
            <InputLabel>Symbol</InputLabel>
            <Select sx={{maxHeight: 32}} id="symbolSelect" value={selectedSymbol} label="Symbol" onChange={handleSymbolSelectChange}>
            {symbolSelectItems}
            </Select>
          </FormControl>
          <div style={{flexBasis: 0, flexGrow: 1}}></div>
        </div>
        <div style={{flexBasis: 0, flexGrow: 1}}></div>
        <div style={{display: 'flex', flexFlow: 'column', flexGrow: 1}}>
          <div style={{flexGrow: 1}}></div>
          <Typography sx={{fontSize: '18px', fontWeight: '800', margin: '0px'}}>{symbolName}</Typography>
          <div style={{flexGrow: 1}}></div>
        </div>
        <div style={{flexBasis: 0, flexGrow: 1}}></div>
        <div style={{flexGrow: 1, display: 'flex'}}>
          <div style={{flexGrow: 1}}></div>
          <div style={{display: 'flex', flexFlow: 'column', flexGrow: 0}}>
            <div style={{flexGrow: 1}}></div>
            <Typography sx={{fontSize: '18px', fontWeight: '800', margin: '0px'}}>{symbolPrice}</Typography>
            <div style={{flexGrow: 1}}></div>
          </div>
        </div>
      </div>
      <Divider light />
      {selectedPane}
    </Paper>
  ) : (
    <Paper style={{margin: 8, padding: 8, display: 'flex', flexGrow: 1, flexFlow: 'column'}} elevation={1}>
    </Paper>
  );
}
