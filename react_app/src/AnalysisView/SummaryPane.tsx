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
import {
  Contract, LookupTable, LookupTableEntry, OptionsChain
} from '../interfaces';
const fetch = require('node-fetch');

/**
 * Trading pane for Summary View
 */
export function SummaryPane(props: any) {
  return (
    <div style={{display: "flex", flexGrow: 1}}>

    </div>
  );
}
