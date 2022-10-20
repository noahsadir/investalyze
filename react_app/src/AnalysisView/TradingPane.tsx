import React from 'react';
import '../App.css';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Paper from '@mui/material/Paper';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { red, yellow } from '@mui/material/colors';
import { StrategyView } from './StrategyView';

import {
  Contract, LookupTable, LookupTableEntry, OptionsChain, OptionStrategy, StrategyLeg
} from '../interfaces';

import {
  calculateInflectionPrices
} from '../Pricing';

const fetch = require('node-fetch');

const toggleStyle = {
  flexGrow: 1
};

/**
 * Trading pane for Analysis View
 */
export function TradingPane(props: any) {

  var [strategy, setStrategy]: [OptionStrategy, any] = React.useState({
    legs: [],
    share_count: 0,
    underlying_cost_basis: props.optionsChain.spot_price,
    spot_price: props.optionsChain.spot_price,
    fetch_date: props.optionsChain.fetch_date
  });

  var [updateCounter, setUpdateCounter]: [boolean, any] = React.useState(false);

  var [selectedView, setSelectedView]: [string, any] = React.useState("list");

  var [strategyViewOpen, setStrategyViewOpen]: [boolean, any] = React.useState(false);

  const handleAddLeg = (id: string) => {
    strategy.legs.push({
      contract: props.optionsChain.contracts[id],
      id: id,
      premium: props.optionsChain.contracts[id].mark,
      position_size: 1,
    });
    setStrategy(strategy);
    setUpdateCounter(!updateCounter);
  }

  const handleRemoveLeg = (id: string) => {
    for (var i = 0; i < strategy.legs.length; i++) {
      if (strategy.legs[i].id == id) {
        strategy.legs.splice(i, 1);
        break;
      }
    }
    setStrategy(strategy);
    setUpdateCounter(!updateCounter);
  }

  const handleLegPremiumChange = (id: string, premium: number) => {
    for (var i = 0; i < strategy.legs.length; i++) {
      if (strategy.legs[i].id == id) {
        strategy.legs[i].premium = premium;
        break;
      }
    }
    setStrategy(strategy);
    setUpdateCounter(!updateCounter);
  }

  const handleLegSizeChange = (id: string, size: number) => {
    for (var i = 0; i < strategy.legs.length; i++) {
      if (strategy.legs[i].id == id) {
        strategy.legs[i].position_size = size;
        break;
      }
    }
    setStrategy(strategy);
    setUpdateCounter(!updateCounter);
  }

  const handleStrategyViewClose = () => {
    setStrategyViewOpen(false);
  }

  const handleStrategyViewOpen = () => {
    setStrategyViewOpen(true);
  }
  return (
    <div style={{display: (props.isVisible ? 'flex' : 'none'), flexFlow: 'column', flexGrow: 1}}>
      <StrategyView strategy={strategy} optionsChain={props.optionsChain} isOpen={strategyViewOpen} title="Strategy" onClose={handleStrategyViewClose}/>
      <ToggleButtonGroup
        style={{display: 'flex', marginTop: '8px'}}
        value={selectedView}
        className="mobile-visible"
        color="primary"
        onChange={(event: any) => {
          setSelectedView(event.target.value);
        }}
        exclusive>
        <ToggleButton style={toggleStyle} value="list">List</ToggleButton>
        <ToggleButton style={toggleStyle} value="builder">Builder</ToggleButton>
      </ToggleButtonGroup>
      <div style={{display: "flex", flexGrow: 1, marginTop: '8px'}}>
        <div style={{display: 'flex', flex: '2 0 0', overflow: 'auto'}} className={selectedView == "list" ? "" : "mobile-hidden"}>
          <ContractListView strategy={strategy} optionsChain={props.optionsChain} onAddLeg={handleAddLeg} onRemoveLeg={handleRemoveLeg}/>
        </div>
        <div style={{margin: '4px', height: 'auto'}} className="mobile-hidden"></div>
        <div style={{display: 'flex', flex: '3 0 0'}} className={selectedView == "builder" ? "" : "mobile-hidden"}>
          <StrategySummaryView onStrategyViewClick={handleStrategyViewOpen} optionsChain={props.optionsChain} strategy={strategy} onLegRemove={handleRemoveLeg} onLegPremiumChange={handleLegPremiumChange} onLegSizeChange={handleLegSizeChange}/>
        </div>
      </div>
    </div>
  );
}

function StrategySummaryView(props: any) {

  var legListItems: any[] = [];

  for (var index in props.strategy.legs) {
    const leg: StrategyLeg = props.strategy.legs[index];
    legListItems.push(
      <StrategyLegListItem leg={leg} onLegRemove={props.onLegRemove} onLegPremiumChange={props.onLegPremiumChange} onLegSizeChange={props.onLegSizeChange}/>
    );
  }

  return (
    <Paper sx={{display: 'flex', flexGrow: 1, flexBasis: 0, flexFlow: 'column'}} variant={"outlined"}>
      <SummaryInfoView strategy={props.strategy} optionsChain={props.optionsChain} onStrategyViewClick={props.onStrategyViewClick}/>
      <Divider light sx={{margin: '8px'}}/>
      <List>
        {legListItems}
      </List>
    </Paper>
  );
}

function StrategyLegListItem(props: any) {

  var [premiumFieldValue, setPremiumFieldValue]: [string, any] = React.useState(props.leg.premium);
  var [positionDirection, setPositionDirection]: [string, any] = React.useState("buy");

  return (
    <ListItem sx={{display: 'flex'}}>
      <div style={{display: 'flex', flexGrow: 1, flexBasis: 0, flexFlow: 'column', marginRight: '8px'}}>
        <Typography sx={{fontSize: '16px'}}>{"$" + props.leg.contract.strike + " " + props.leg.contract.option_type.toUpperCase()}</Typography>
        <Typography sx={{fontSize: '12px'}}>{props.leg.contract.expiration_date_string}</Typography>
      </div>
      <div style={{display: 'flex', flexGrow: 1, flexBasis: 0, flexFlow: 'column', marginRight: '8px'}}>
        <Typography sx={{fontSize: '12px'}}>{"BID"}</Typography>
        <Typography sx={{fontSize: '16px'}}>{props.leg.contract.bid.toFixed(2)}</Typography>
      </div>
      <div style={{display: 'flex', flexGrow: 1, flexBasis: 0, flexFlow: 'column', marginRight: '8px'}}>
        <Typography sx={{fontSize: '12px'}}>{"ASK"}</Typography>
        <Typography sx={{fontSize: '16px'}}>{props.leg.contract.ask.toFixed(2)}</Typography>
      </div>
      <div style={{display: 'flex', flexGrow: 1, flexBasis: 0, flexFlow: 'column', marginRight: '8px'}}>
        <ToggleButtonGroup
          style={{display: 'flex', flexGrow: 1}}
          value={positionDirection}
          color="primary"
          size="small"
          onChange={(event: any) => {
            setPositionDirection(event.target.value);
            props.onLegSizeChange(props.leg.id, (event.target.value == "buy") ? 1 : -1);
          }}
          exclusive>
          <ToggleButton style={toggleStyle} value="buy">Buy</ToggleButton>
          <ToggleButton style={toggleStyle} value="sell">Sell</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div style={{display: 'flex', flexGrow: 1, flexBasis: 0, flexFlow: 'column', marginRight: '8px'}}>
        <TextField size="small" value={premiumFieldValue} onChange={(event: any) => {setPremiumFieldValue(event.target.value); props.onLegPremiumChange(props.leg.id, event.target.value);}}/>
      </div>
      <div style={{display: 'flex', flexGrow: 0, flexBasis: 0, flexFlow: 'column'}}>
        <IconButton sx={{color: red[200]}} onClick={(event: any) => props.onLegRemove(props.leg.id)}>
          <DeleteOutlineRoundedIcon/>
        </IconButton>
      </div>
    </ListItem>
  );
}

function SummaryInfoView(props: any) {

  const greekNameStyle: any = {
    textAlign: 'left',
    color: 'secondary',
    fontSize: '12px'
  };

  var netPremium: number = (props.strategy.share_count * props.strategy.underlying_cost_basis);
  var netDelta: number = 0;
  var netGamma: number = 0;
  var netTheta: number = 0;
  var netVega: number = 0;
  var netRho: number = 0;

  for (var index in props.strategy.legs) {
    const leg: StrategyLeg = props.strategy.legs[index];
    netPremium += (leg.premium * leg.position_size * 100);
    netDelta += (leg.contract.delta * leg.position_size * 100);
    netGamma += (leg.contract.gamma * leg.position_size * 100);
    netTheta += (leg.contract.theta * leg.position_size * 100);
    netVega += (leg.contract.vega * leg.position_size * 100);
    netRho += (leg.contract.rho * leg.position_size * 100);
  }

  var inflectionPrices: any = calculateInflectionPrices(props.strategy);
  var maxGain: number = Number.NEGATIVE_INFINITY;
  var maxLoss: number = Number.POSITIVE_INFINITY;
  var potOdds: string = "N/A"
  for (var spot in inflectionPrices) {
    const netProfit: number = inflectionPrices[spot] - netPremium;
    if (netProfit < maxLoss) {
      maxLoss = netProfit;
    }
    if (netProfit > maxGain) {
      maxGain = netProfit;
    }
  }
  maxLoss *= -1;
  // 120 : 130
  if (maxLoss != Infinity && maxGain != Infinity) {
    potOdds = ((maxLoss / (maxGain + maxLoss)) * 100).toFixed(2) + "%";
  }

  const handleStrategyViewClick = (event: any) => {
    props.onStrategyViewClick();
  }

  return (
    <div style={{display: 'flex', flexFlow: 'column', flexGrow: 0, margin: '8px', marginBottom: 0}}>
      <Typography sx={{textAlign: 'left', fontSize: '20px', fontWeight: 600, marginBottom: '8px'}}>{getStrategyName(props.strategy)}</Typography>
      <div style={{marginBottom: '8px', display: ((maxLoss == Infinity) ? 'flex' : 'none')}}>
        <WarningRoundedIcon style={{color: yellow[400], marginRight: '8px', width: '42px', height: '42px'}}/>
        <div style={{display: 'flex', flexFlow: 'column'}}>
          <Typography style={{color: yellow[400], fontWeight: 800, textAlign: 'left'}}>WARNING - UNDEFINED RISK TRADE</Typography>
          <Typography style={{fontSize: '14px', textAlign: 'left'}}>This trade could result in substantial losses.</Typography>
        </div>
      </div>
      <div style={{display: 'flex', marginBottom: '8px'}}>
        <div style={{flexGrow: 1, flexBasis: 0}}>
          <Typography sx={greekNameStyle}>MAX GAIN</Typography>
          <Typography sx={{textAlign: 'left'}}>{(maxGain == Infinity) ? "Infinity" : ("$" + maxGain.toFixed(2))}</Typography>
        </div>
        <div style={{flexGrow: 1, flexBasis: 0}}>
          <Typography sx={greekNameStyle}>MAX LOSS</Typography>
          <Typography sx={{textAlign: 'left', color: ((maxLoss == Infinity) ? red[400] : null)}}>{(maxLoss == Infinity) ? "Infinity" : ("$" + maxLoss.toFixed(2))}</Typography>
        </div>
        <div style={{flexGrow: 1, flexBasis: 0}}>
          <Typography sx={greekNameStyle}>POT ODDS</Typography>
          <Typography sx={{textAlign: 'left'}}>{potOdds}</Typography>
        </div>
      </div>
      <div style={{display: 'flex', marginBottom: '8px'}}>
        <div style={{flexGrow: 1, flexBasis: 0}}>
          <Typography sx={greekNameStyle}>{"DELTA"}</Typography>
          <Typography sx={{textAlign: 'left'}}>{netDelta.toFixed(2)}</Typography>
        </div>
        <div style={{flexGrow: 1, flexBasis: 0}}>
          <Typography sx={greekNameStyle}>GAMMA</Typography>
          <Typography sx={{textAlign: 'left'}}>{netGamma.toFixed(2)}</Typography>
        </div>
        <div style={{flexGrow: 1, flexBasis: 0}}>
          <Typography sx={greekNameStyle}>THETA</Typography>
          <Typography sx={{textAlign: 'left'}}>{netTheta.toFixed(2)}</Typography>
        </div>
      </div>
      <div style={{display: 'flex', marginBottom: '8px'}}>
        <div style={{flexGrow: 1, flexBasis: 0}}>
          <Typography sx={greekNameStyle}>RHO</Typography>
          <Typography sx={{textAlign: 'left'}}>{netRho.toFixed(2)}</Typography>
        </div>
        <div style={{flexGrow: 1, flexBasis: 0}}>
          <Typography sx={greekNameStyle}>VEGA</Typography>
          <Typography sx={{textAlign: 'left'}}>{netVega.toFixed(2)}</Typography>
        </div>
        <div style={{flexGrow: 1, flexBasis: 0}}>

        </div>
      </div>
      <div style={{display: 'flex'}}>
        <div style={{flexGrow: 1, flexBasis: 0}}>
          <Typography sx={{textAlign: 'left', fontSize: '20px'}}>{(netPremium < 0 ? "Net Credit" : "Net Debit") + ": $" + Math.abs(netPremium).toFixed(2)}</Typography>
        </div>
        <div style={{flexGrow: 0, flexBasis: 0}} >
          <Button style={{width: '128px'}} variant="contained" onClick={handleStrategyViewClick}>View</Button>
        </div>
      </div>
    </div>
  );
}

function ContractListView(props: any) {

  const expirations: string[] = Object.keys(props.optionsChain.lookup.byExpiration);
  const strikes: string[] = Object.keys(props.optionsChain.lookup.byStrike).sort((a: string, b: string) => {return Number(a) - Number(b);});

  var [firstCol, setFirstCol] = React.useState("volume");
  var [secondCol, setSecondCol] = React.useState("open_interest");
  var [thirdCol, setThirdCol] = React.useState("mark");

  var [optionType, setOptionType]: [string, any] = React.useState("call");
  var [datasetType, setDatasetType]: [string, any] = React.useState("byExpiration");
  var [datasetValue, setDatasetValue]: [string, any] = React.useState((expirations != null && expirations.length > 0) ? expirations[0] : "");


  const contractListItems: any[] = [];
  var strategyContracts: any = {};

  for (var index in props.strategy.legs) {
    const leg: StrategyLeg = props.strategy.legs[index];
    strategyContracts[leg.id] = leg.contract;
  }

  const handleColumnChange = (column: number, value: string) => {
    if (column == 0) {
      setFirstCol(value);
    } else if (column == 1) {
      setSecondCol(value);
    } else if (column == 2) {
      setThirdCol(value);
    }
  }

  const handleConfigChange = (config: string, value: string) => {
    if (config == "option_type") {
      setOptionType(value);
    } else if (config == "dataset_type") {
      setDatasetType(value);
    } else if (config == "dataset_value") {
      setDatasetValue(value);
    }
  }

  const handleContractListClick = (contractID: string) => {
    if (strategyContracts[contractID] == null) {
      strategyContracts[contractID] = chain.contracts[contractID];
      props.onAddLeg(contractID);
    } else {
      strategyContracts[contractID] = null;
      props.onRemoveLeg(contractID);
    }
  }

  const chain: any = props.optionsChain;
  if (chain.lookup[datasetType] != null && chain.lookup[datasetType][datasetValue] != null && chain.lookup[datasetType][datasetValue][optionType] != null) {

    for (var index in chain.lookup[datasetType][datasetValue][optionType]) {
      const key: string = chain.lookup[datasetType][datasetValue][optionType][index];
      contractListItems.push(<ContractListItem onItemClick={handleContractListClick} sx={{minWidth: 0}} isSelected={strategyContracts[key] != null} id={key} contract={chain.contracts[key]} columns={{first: firstCol, second: secondCol, third: thirdCol}}/>);
    }
  }


  return (
    <Paper sx={{display: "flex", flexGrow: 1, flexBasis: 0, flexFlow: 'column', overflow: 'hidden'}} variant={"outlined"}>
      <DatasetToolbar onConfigChange={handleConfigChange} optionsChain={props.optionsChain} config={{option_type: optionType, dataset_type: datasetType, dataset_value: datasetValue}}/>
      <Divider sx={{margin: '8px', marginTop: '0px', marginBottom: '0px'}} light/>
      <TableContainer sx={{flex: '1 0 0', minWidth: 0, minHeight: 0}}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <ContractListToolbar optionsChain={props.optionsChain} onColumnChange={handleColumnChange} columns={{first: firstCol, second: secondCol, third: thirdCol}}/>
          </TableHead>
          <TableBody>
            {contractListItems}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function ContractListToolbar(props: any) {

  var filters: any = {
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

  var filterMenuItems: any[] = [];

  // get list of data points for contracts
  for (var key in filters) {
    filterMenuItems.push(<MenuItem value={key}>{getFilterConfig(key).name}</MenuItem>)
  }


  return (
    <TableRow>
      <TableCell sx={{maxWidth: '25%', padding: '8px', paddingLeft: '16px'}}>
        <Typography sx={{fontSize: 18, fontWeight: 800}}>Strike</Typography>
        <Typography sx={{fontSize: 12}}>Expiration</Typography>
      </TableCell>
      <TableCell sx={{maxWidth: '25%', padding: '8px'}}>
        <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px'}}>
          <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
            <Select sx={{height: 48}} id="firstConfigSelect" value={props.columns.first}
                    onChange={(event: any) => {props.onColumnChange(0, event.target.value);}}>
              {filterMenuItems}
            </Select>
          </FormControl>
        </div>
      </TableCell>
      <TableCell sx={{maxWidth: '25%', padding: '8px'}}>
        <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px'}}>
          <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
            <Select sx={{height: 48}} id="secondConfigSelect" value={props.columns.second}
                    onChange={(event: any) => {props.onColumnChange(1, event.target.value);}}>
              {filterMenuItems}
            </Select>
          </FormControl>
        </div>
      </TableCell>
      <TableCell sx={{maxWidth: '25%', padding: '8px'}}>
        <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px'}}>
          <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
            <Select sx={{height: 48}} id="thirdConfigSelect" value={props.columns.third}
                    onChange={(event: any) => {props.onColumnChange(2, event.target.value);}}>
              {filterMenuItems}
            </Select>
          </FormControl>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ContractListItem(props: any) {
  const handleClick = (event: any) => {
    props.onItemClick(props.id);
  }

  return (props.contract != null) ? (
    <TableRow hover onClick={handleClick} selected={props.isSelected}>
      <TableCell>
        <Typography sx={{fontSize: 18, fontWeight: 800, whiteSpace: 'nowrap'}}>{"$" + props.contract.strike}</Typography>
        <Typography sx={{fontSize: 12, whiteSpace: 'nowrap'}}>{props.contract.expiration_date_string}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{props.contract[props.columns.first]}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{props.contract[props.columns.second]}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{props.contract[props.columns.third]}</Typography>
      </TableCell>
    </TableRow>
  ) : (
    <TableRow>
      <TableCell>
        Error
      </TableCell>
    </TableRow>
  );
}

function DatasetToolbar(props: any) {

  var datasetMenuItems: any[] = [];

  // get list of stikes or expirations depending on type selected
  for (var val in props.optionsChain.lookup[props.config.dataset_type]) {
    datasetMenuItems.push(<MenuItem value={val}>{val}</MenuItem>);
  }

  return (
    <div style={{flexGrow: 3, flexBasis: 0, display: 'flex', flexFlow: 'column', maxHeight: '64px', minWidth: '0px', margin: '8px'}}>
      <div style={{display: 'flex', flexGrow: 0}}>
        <div style={{flexGrow: 1}}></div>
        <Typography sx={{fontSize: '12px', paddingBottom: '12px', flexGrow: 0}}>DATASET</Typography>
        <div style={{flexGrow: 1}}></div>
      </div>
      <div style={{display: 'flex', flexGrow: 1, flexShrink: 1}}>
        <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px', marginRight: '8px'}}>
          <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
            <InputLabel>Option Type</InputLabel>
            <Select sx={{height: 32}} label="Option Type" id="optionTypeSelect" value={props.config.option_type}
                    onChange={(event: any) => {props.onConfigChange("option_type", event.target.value);}}>
              <MenuItem value={"call"}>{"Calls"}</MenuItem>
              <MenuItem value={"put"}>{"Puts"}</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px', marginRight: '8px'}}>
          <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
            <InputLabel>Dataset Type</InputLabel>
            <Select sx={{height: 32}} label="Dataset Type" id="datasetTypeSelect" value={props.config.dataset_type}
                    onChange={(event: any) => {props.onConfigChange("dataset_type", event.target.value);}}>
              <MenuItem value={"byExpiration"}>{"Expirations"}</MenuItem>
              <MenuItem value={"byStrike"}>{"Strikes"}</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div style={{flexGrow: 1, flexBasis: 0, display: 'flex', minWidth: '0px'}}>
          <FormControl sx={{minWidth: '0px', maxWidth: '100%', flexGrow: 1}}>
            <InputLabel>Dataset Value</InputLabel>
            <Select sx={{height: 32}} label="Dataset Value" id="datasetValueSelect" value={props.config.dataset_value}
                    onChange={(event: any) => {props.onConfigChange("dataset_value", event.target.value);}}>
              {datasetMenuItems}
            </Select>
          </FormControl>
        </div>
      </div>
    </div>
  );
}

function getStrategyName(strategy: OptionStrategy) {

  if (strategy.legs.length == 1) {
    return singleLegStrategy(strategy);
  } else if (strategy.legs.length == 2) {
    return twoLegStrategy(strategy);
  } else if (strategy.legs.length == 3) {

  } else if (strategy.legs.length == 4) {
    return fourLegStrategy(strategy);
  }

  return "Unknown Strategy";
}

function singleLegStrategy(strategy: OptionStrategy) {
  if (strategy.legs.length != 1) return "Error";
  const leg1: StrategyLeg = strategy.legs[0];
  if (leg1.contract.option_type == "call") {
    if (leg1.position_size > 0) {
      if (strategy.share_count == 0) {
        return "Long Call";
      } else if (strategy.share_count > 0) {
        return "Long Call + Long Shares";
      } else if (strategy.share_count < 0) {
        if (strategy.share_count == leg1.position_size * 100) {
          return "Protective Call";
        } else {
          return "Long Call + Short Shares";
        }
      }
    } else if (leg1.position_size < 0) {
      if (strategy.share_count == 0) {
        return "Short Call";
      } else if (strategy.share_count > 0) {
        if (strategy.share_count == leg1.position_size * 100) {
          return "Covered Call";
        } else {
          return "Short Call + Long Shares";
        }
      } else if (strategy.share_count < 0) {
        return "Short Call + Short Shares";
      }
    }
  } else if (leg1.contract.option_type == "put") {
    if (leg1.position_size > 0) {
      if (strategy.share_count == 0) {
        return "Long Put";
      } else if (strategy.share_count > 0) {
        if (strategy.share_count == leg1.position_size * 100) {
          return "Protective Put";
        } else {
          return "Long Put + Long Shares";
        }
      } else if (strategy.share_count < 0) {
        return "Long Put + Short Shares";
      }
    } else if (leg1.position_size < 0) {
      if (strategy.share_count == 0) {
        return "Short Put";
      } else if (strategy.share_count > 0) {
        return "Short Put + Long Shares";
      } else if (strategy.share_count < 0) {
        if (strategy.share_count == leg1.position_size * 100) {
          return "Covered Put";
        } else {
          return "Long Put + Short Shares";
        }
      }
    }
  }
  return "Unknown Strategy";
}

function twoLegStrategy(strategy: OptionStrategy) {
  if (strategy.legs.length != 2) return "Error";
  const leg1: StrategyLeg = strategy.legs[0];
  const leg2: StrategyLeg = strategy.legs[1];

  if (leg1.contract.option_type == "call" && leg2.contract.option_type == "call") { // call spread
    const shortLeg: StrategyLeg | undefined = (leg1.position_size < 0) ? leg1 : ((leg2.position_size < 0) ? leg2 : undefined);
    const longLeg: StrategyLeg | undefined = (leg1.position_size > 0) ? leg1 : ((leg2.position_size > 0) ? leg2 : undefined);
    if (shortLeg != undefined && longLeg != undefined) {
      if (shortLeg.contract.strike > longLeg.contract.strike) {
        if (shortLeg.contract.expiration_date_string == longLeg.contract.expiration_date_string) {
          return "Vertical Call Debit Spread";
        } else {
          return "Diagonal Call Debit Spread";
        }
      } else if (shortLeg.contract.strike < longLeg.contract.strike) {
        if (shortLeg.contract.expiration_date_string == longLeg.contract.expiration_date_string) {
          return "Vertical Call Credit Spread";
        } else {
          return "Diagonal Call Credit Spread";
        }
      } else if (shortLeg.contract.strike == longLeg.contract.strike) {
        if (shortLeg.contract.expiration_date_integer_millis > longLeg.contract.expiration_date_integer_millis) {
          return "Calendar Call Credit Spread";
        } else if (shortLeg.contract.expiration_date_integer_millis < longLeg.contract.expiration_date_integer_millis) {
          return "Calendar Call Debit Spread";
        }
      }
    } else if (shortLeg != undefined) {
      return "Short Calls";
    } else if (longLeg != undefined) {
      return "Long Calls";
    }
  } else if (leg1.contract.option_type == "put" && leg2.contract.option_type == "put") { // put spread
    const shortLeg: StrategyLeg | undefined = (leg1.position_size < 0) ? leg1 : ((leg2.position_size < 0) ? leg2 : undefined);
    const longLeg: StrategyLeg | undefined = (leg1.position_size > 0) ? leg1 : ((leg2.position_size > 0) ? leg2 : undefined);
    if (shortLeg != undefined && longLeg != undefined) {
      if (shortLeg.contract.strike < longLeg.contract.strike) {
        if (shortLeg.contract.expiration_date_string == longLeg.contract.expiration_date_string) {
          return "Vertical Put Debit Spread";
        } else {
          return "Diagonal Put Debit Spread";
        }
      } else if (shortLeg.contract.strike > longLeg.contract.strike) {
        if (shortLeg.contract.expiration_date_string == longLeg.contract.expiration_date_string) {
          return "Vertical Put Credit Spread";
        } else {
          return "Diagonal Put Credit Spread";
        }
      } else if (shortLeg.contract.strike == longLeg.contract.strike) {
        if (shortLeg.contract.expiration_date_integer_millis > longLeg.contract.expiration_date_integer_millis) {
          return "Calendar Put Credit Spread";
        } else if (shortLeg.contract.expiration_date_integer_millis < longLeg.contract.expiration_date_integer_millis) {
          return "Calendar Put Debit Spread";
        }
      }
    } else if (shortLeg != undefined) {
    return "Short Puts";
    } else if (longLeg != undefined) {
    return "Long Puts";
    }
  } else if (leg1.contract.option_type != leg2.contract.option_type) { // straddle/strangle
    const callLeg: StrategyLeg | undefined = (leg1.contract.option_type == "call") ? leg1 : leg2;
    const putLeg: StrategyLeg | undefined = (leg1.contract.option_type == "put") ? leg1 : leg2;

    if (callLeg.contract.strike == putLeg.contract.strike) {
      if (callLeg.position_size > 0 && putLeg.position_size > 0) {
        return "Long Straddle";
      } else if (callLeg.position_size < 0 && putLeg.position_size < 0) {
        return "Short Straddle";
      }
    } else {
      if (callLeg.position_size > 0 && putLeg.position_size > 0) {
        return "Long Strangle";
      } else if (callLeg.position_size < 0 && putLeg.position_size < 0) {
        return "Short Strangle";
      }
    }
  }
  return "Unknown Strategy";
}

function fourLegStrategy(strategy: OptionStrategy) {
  if (strategy.legs.length != 4) return "Error";

  var longCalls: StrategyLeg[] = [];
  var longPuts: StrategyLeg[] = [];
  var shortCalls: StrategyLeg[] = [];
  var shortPuts: StrategyLeg[] = [];

  for (var index in strategy.legs) {
    const leg: StrategyLeg = strategy.legs[index];
    if (leg.contract.option_type == "call") {
      if (leg.position_size > 0) {
        longCalls.push(leg);
      } else if (leg.position_size < 0) {
        shortCalls.push(leg);
      }
    } else if (leg.contract.option_type == "put") {
      if (leg.position_size > 0) {
        longPuts.push(leg);
      } else if (leg.position_size < 0) {
        shortPuts.push(leg);
      }
    }
  }

  if (longCalls.length == 2 && shortCalls.length == 2) {
    return "Call Condor";
  } else if (longPuts.length == 2 && shortPuts.length == 2) {
    return "Put Condor";
  } else if (longCalls.length == 1 && shortCalls.length == 1 && longPuts.length == 1 && shortPuts.length == 1) {
    return "Iron Condor";
  }

  return "Unknown Strategy";
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
      format: "integer"
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
