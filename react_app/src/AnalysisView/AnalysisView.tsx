import React from 'react';
import '../App.css';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
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

  const [analysisType, setAnalysisType] = React.useState('summary');

  const handleAnalysisTypeChange = (event: any, selectedType: string) => {
    if (selectedType !== null) {
      setAnalysisType(selectedType);
    }
  };

  const toggleStyle = {
    flexGrow: 1
  };

  return (
    <div style={{display: 'flex', flexFlow: 'column', flexGrow: 1}}>
      <Paper style={{margin: 8, marginBottom: 0, padding: 8, display: 'flex', flexGrow: 0}} elevation={3}>
        <ToggleButtonGroup style={{display: 'flex', flexGrow: 1}} value={analysisType} color="primary" onChange={handleAnalysisTypeChange} exclusive>
          <ToggleButton style={toggleStyle} value="summary">Summary</ToggleButton>
          <ToggleButton style={toggleStyle} value="data">Data</ToggleButton>
          <ToggleButton style={toggleStyle} value="metrics">Metrics</ToggleButton>
          <ToggleButton style={toggleStyle} value="trading">Trading</ToggleButton>
        </ToggleButtonGroup>
      </Paper>
      <div style={{flexGrow: 1, display: 'flex'}}>
        <MainContent optionsChains={props.optionsChains} paneType={analysisType}/>
      </div>
    </div>
  );
}

/**
 * Manages pane toggling and general configuration
 */
function MainContent(props: any) {
  const [selectedSymbol, setSelectedSymbol] = React.useState("");
  const [symbolList, setSymbolList] = React.useState([]);

  if (props.optionsChains[selectedSymbol] == null && Object.keys(props.optionsChains).length > 0) {
    setSelectedSymbol(Object.keys(props.optionsChains)[0]);
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
    <Paper style={{margin: 8, padding: 8, display: 'flex', flexGrow: 1, flexFlow: 'column'}} elevation={1}>
      <div style={{flexGrow: 0, display: 'flex', paddingBottom: '8px'}}>
        <Select sx={{minWidth: 128, maxHeight: 32}} id="symbolSelect" value={selectedSymbol} label="Symbol" onChange={handleSymbolSelectChange}>
        {symbolSelectItems}
        </Select>
        <p></p>
      </div>
      <Divider light />
      {selectedPane}
    </Paper>
  ) : (
    <Paper style={{margin: 8, padding: 8, display: 'flex', flexGrow: 1, flexFlow: 'column'}} elevation={1}>
    </Paper>
  );
}