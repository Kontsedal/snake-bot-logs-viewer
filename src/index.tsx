import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import {createGlobalStyle} from 'styled-components';
import {RootPage} from "./pages/Root";
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles';
import {orange, teal} from "@material-ui/core/colors";

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  html, body {
    height: 100%;
  }
  #root {
    height: 100%;
    overflow: hidden;
  }
`;


const theme = createMuiTheme({
    palette: {
        primary: teal,
        secondary: orange,
    },
    typography: {
        useNextVariants: true,
    },
});

ReactDOM.render(<>
    <MuiThemeProvider theme={theme}>
        <GlobalStyle/>
        <RootPage/>
    </MuiThemeProvider>
</>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
