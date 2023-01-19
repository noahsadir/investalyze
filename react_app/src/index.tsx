/**
 * index.tsx
 *
 * Main entry point of application
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { CookiesProvider } from 'react-cookie';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material/';
import { indigo } from '@mui/material/colors';
import "@fontsource/open-sans";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const mode = 'dark';

const theme = createTheme({
  palette: {
    mode: mode,
    primary: {
      main: indigo[200],
    },
  },
  typography: {
    fontFamily: [
      '"Open Sans"',
      'sans-serif'
    ].join(",")
  }
});

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <CookiesProvider>
        <App />
      </CookiesProvider>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
