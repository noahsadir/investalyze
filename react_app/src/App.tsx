import React from 'react';
import './App.css';

import { styled, alpha } from '@mui/material/styles';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Paper from '@mui/material/Paper';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

import SearchIcon from '@mui/icons-material/Search';

/**
 * Search bar object
 * Adapted from MUI docs: section 'App bar with search field'
 * https://mui.com/material-ui/react-app-bar/
 */
function SearchBar() {

  const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%'
  }));

  const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }));

  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create('width'),
      width: '100%',
    },
    width: '100%'
  }));

  return (
    <Search>
      <SearchIconWrapper>
        <SearchIcon/>
      </SearchIconWrapper>
      <StyledInputBase placeholder="e.g. MSFT" inputProps={{'aria-label': 'search'}}/>
    </Search>
  );
}

/**
 * Main entry point of application
 */
function App() {

  return (
    <div className="App" style={{height: '100%', display: 'flex', flexFlow: 'column'}}>
      <MainToolbar/>
      <MainContent/>
    </div>
  );
}

/**
 * Toolbar for application
 */
function MainToolbar() {
  return (
    <AppBar position="static" sx={{padding: 0}}>
      <Toolbar style={{display: 'flex', padding: 0}}>
        <div className="hbox-mobile" style={{flexGrow: 1}}>
          <div style={{display: 'flex', flexFlow: 'column', flexGrow: 0, paddingLeft: 16}}>
            <p style={{margin: 0, padding: 0, textAlign: 'left', fontSize: 22, fontWeight: 'bold'}}>Investalyze</p>
            <p style={{margin: 0, marginTop: -4, padding: 0, textAlign: 'left', fontSize: 14}}>by Noah Sadir</p>
          </div>
          <div className="hbox-mobile-spacer" style={{flexGrow: 1}}></div>
          <div className="toolbar-search" style={{flexGrow: 0}}>
            <div style={{padding: 8, paddingLeft: 16, paddingRight: 16}}>
              <SearchBar/>
            </div>
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
}

/**
 * Main content container
 */
function MainContent() {
  return (
    <div style={{display: 'flex', flexGrow: 1}}>
      <AnalysisView/>
    </div>
  );
}

/**
 * Manages analysis section of the app.
 */
function AnalysisView() {

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
          <ToggleButton style={toggleStyle} value="metrics">Metrics</ToggleButton>
          <ToggleButton style={toggleStyle} value="trading">Trading</ToggleButton>
        </ToggleButtonGroup>
      </Paper>
      <div style={{flexGrow: 1, display: 'flex'}}>
        <AnalysisView_MainContent paneType={analysisType}/>
      </div>
    </div>
  );
}

/**
 * Manages pane toggling and general configuration
 */
function AnalysisView_MainContent(props: any) {
  const [selectedSymbol, setSelectedSymbol] = React.useState("MSFT");

  var selectedPane: any = null;
  switch (props.paneType) {
    case "summary":
      selectedPane = (<AnalysisView_SummaryPane/>);
      break;
    case "metrics":
      selectedPane = (<AnalysisView_MetricsPane/>);
      break;
    case "trading":
      selectedPane = (<AnalysisView_TradingPane/>);
      break;
    default:
      break;
  }

  const handleSymbolSelectChange = (event: SelectChangeEvent) => {
    setSelectedSymbol(event.target.value);
  };

  return (
    <Paper style={{margin: 8, padding: 8, display: 'flex', flexGrow: 1, flexFlow: 'column'}} elevation={1}>
      <div style={{flexGrow: 0, display: 'flex'}}>
        <Select sx={{minWidth: 128, maxHeight: 32}} id="symbolSelect" value={selectedSymbol} label="Symbol" onChange={handleSymbolSelectChange}>
          <MenuItem value={"MSFT"}>MSFT</MenuItem>
          <MenuItem value={"AAPL"}>AAPL</MenuItem>
          <MenuItem value={"SPY"}>SPY</MenuItem>
        </Select>
        <p></p>
      </div>
      {selectedPane}
    </Paper>
  );
}

/**
 * Summary pane for Analysis View
 */
function AnalysisView_SummaryPane() {
  return (
    <div style={{display: 'flex', flexGrow: 1}}>
      <p>Summary Pane</p>
    </div>
  );
}

/**
 * Metrics pane for Analysis View
 */
function AnalysisView_MetricsPane() {
  return (
    <div style={{display: 'flex', flexGrow: 1}}>
      <p>Metrics Pane</p>
    </div>
  );
}

/**
 * Trading pane for Analysis View
 */
function AnalysisView_TradingPane() {
  return (
    <div style={{display: "flex", flexGrow: 1}}>
      <p>Trading Pane</p>
    </div>
  );
}
export default App;
