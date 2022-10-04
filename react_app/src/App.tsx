/**
 * App.tsx
 *
 *   _________ __________   ________    ____    __   __   __    _________  ____
 *  /  ______/ \__    __/  /  ___   \  /    \  |  \ |  | /  /  /  ______/ \    /
 * |  |______     |  |    |  |   |  | |  |\  \ |  | |  |/  /  |  |______   \  /
 * \______   \    |  |    |  |   |  | |  | \  \|  | |     |   \______   \   \/
 *  ______|  |    |  |    |  |___|  | |  |  \  |  | |  |\  \   ______|  |   __
 * \________/     |__|    \________/  \__/   \___/  \__| \__\ \________/   |__|
 *
 */

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
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import {
  Contract, LookupTable, LookupTableEntry, OptionsChain
} from './interfaces';
import { AnalysisView } from './AnalysisView/AnalysisView';
const fetch = require('node-fetch');

/**
 * Search bar object
 * Adapted from MUI docs: section 'App bar with search field'
 * https://mui.com/material-ui/react-app-bar/
 */
function SearchBar(props: any) {

  const [symbolValue, setSymbolValue] = React.useState("");

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
  }))

  const onSymbolBarKeyDown = (event: any) => {
    if (event.key === "Enter") {
      props.onSymbolEnter(symbolValue.toUpperCase());
      setSymbolValue("");
    }
  }

  return (
    <Search>
      <SearchIconWrapper>
        <SearchIcon/>
      </SearchIconWrapper>
      <StyledInputBase
        autoFocus={true}
        onKeyDown={onSymbolBarKeyDown}
        onChange={(event: any) => {setSymbolValue(event.target.value);}}
        value={symbolValue}
        placeholder="e.g. MSFT"
        inputProps={{'aria-label': 'search'}}
        />
    </Search>
  );
}

/**
 * Fetch options chain for the symbol
 */
function loadSymbol(symbol: string, callback: (success: boolean, data: any) => void) {

  if (symbol == "@TEST") {
    callback(true, require('./test_data.json'));
  } else {
    var url: string = "https://" + window.location.host + "/api/options_chain";
    var config: any = {
      method: 'post',
      headers: {
        'mode': 'no-cors',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'symbol': symbol,
        'api_key': ""
      })
    };

    var status: number = 500;
    fetch(url, config)
    .then((response: any) => {
      status = response.status;
      return response.json();
    })
    .then((data: any) => {
      if (status == 200) {
        if (data != null) {
          callback(true, data);
        } else {
          callback(false, {
            success: false,
            message: "Error fetching data.",
            error: "ERR_DATA_NULL",
            details: data
          });
        }
      } else {
        callback(false, {
          success: false,
          message: "Error fetching data.",
          error: "ERR_DATA_FETCH",
          details: data
        });
      }
    })
    .catch((error: any) => {
      console.log(error);
      callback(false, {
        success: false,
        message: "Error fetching data.",
        error: "ERR_RESPONSE_FETCH",
        details: error
      });
    });
  }
}

/**
 * Main entry point of application
 */
function App() {

  //var optionsChains: {[key: string]: OptionsChain} = {};

  const [loadingScreenOpen, setLoadingScreenOpen] = React.useState(false);
  const [optionsChains, setOptionsChains]: [{[key: string]: OptionsChain}, any] = React.useState({});
  const [updates, setUpdates] = React.useState(0);

  const handleSymbolEntered = (symbol: string) => {
    setLoadingScreenOpen(true);
    loadSymbol(symbol, (success, data) => {
      optionsChains[symbol] = data;
      setLoadingScreenOpen(false);

      // necessary to force state update (particularly with @TEST symbol)
      setUpdates(updates + 1);
    });
  }

  return (
    <div className="App" style={{height: '100%', display: 'flex', flexFlow: 'column'}}>
      <MainToolbar onSymbolEnter={handleSymbolEntered}/>
      <MainContent optionsChains={optionsChains}/>
      <Backdrop sx={{zIndex: (theme) => theme.zIndex.drawer + 1}} open={loadingScreenOpen}>
        <CircularProgress color="inherit"/>
      </Backdrop>
    </div>
  );
}

/**
 * Toolbar for application
 */
function MainToolbar(props: any) {
  return (
    <AppBar position="static" sx={{padding: 0}}>
      <Toolbar style={{display: 'flex', padding: 0}}>
        <div className="hbox-mobile" style={{flexGrow: 1}}>
          <div style={{display: 'flex', flexFlow: 'column', flexGrow: 0, paddingLeft: 16}}>
            <div style={{flexGrow: 1}}></div>
            <p style={{margin: 0, padding: 0, textAlign: 'left', fontSize: 24, fontWeight: 'bold'}}>
              Investalyze
            </p>
            <div style={{flexGrow: 1}}></div>
          </div>
          <div className="hbox-mobile-spacer" style={{flexGrow: 1}}></div>
          <div className="toolbar-search" style={{flexGrow: 0}}>
            <div style={{padding: 8, paddingLeft: 16, paddingRight: 16}}>
              <SearchBar onSymbolEnter={props.onSymbolEnter}/>
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
function MainContent(props: any) {
  return (
    <div style={{display: 'flex', flexGrow: 1}}>
      <AnalysisView optionsChains={props.optionsChains}/>
    </div>
  );
}

export default App;
