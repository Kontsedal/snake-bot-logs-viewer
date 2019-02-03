import React, {Component} from "react";
import {LogsViewer} from "../../components/LogsViewer";
import {AppBar, Select} from "@material-ui/core";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import MenuItem from "@material-ui/core/MenuItem";
import Toolbar from "@material-ui/core/Toolbar";
import TextField from "@material-ui/core/TextField";
import styled from "styled-components";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";

const OnlineViewerControls = styled.div`
    padding: 0 0 0 50px;
    display: flex;
    flex-grow: 100;
`;

enum TABS {
  LOG_VIEWER,
  ONLINE_VIEWER
}

interface RootPageState {
  currentTab: TABS,
  currentSession: string | undefined,
  sessions: Array<string>,
  connectionUrl: string | undefined
}

export class RootPage extends Component<{}, RootPageState> {
  state = {
    currentTab: TABS.LOG_VIEWER,
    currentSession: undefined,
    sessions: [],
    connectionUrl: undefined
  };

  onConnectUrlChange = (event) => {
    this.setState({
      connectionUrl: event.target.value
    })
  };

  changeTabHandler = (event, value) => {
    this.setState({
      currentTab: value
    })
  };

  handleSessionChange = (event) => {
    this.setState({
      currentSession: event.target.value
    })
  };

  getLogViewerControls = () => {
    if (!this.state.sessions.length) {
      return;
    }
    return <Select
      value={this.state.currentSession}
      onChange={this.handleSessionChange}
      name="sessionId"
    >
      {this.state.sessions.map(session => {
        return <MenuItem value={session} key={session}>Session: {session}</MenuItem>
      })}
    </Select>
  };

  getOnlineViewerControls = () => {
    return <OnlineViewerControls>
      <TextField
        id="connection-url"
        placeholder="Connection url"
        value={this.state.connectionUrl}
        variant="outlined"
        onChange={this.onConnectUrlChange}
        style={{width: "100%"}}
        type="text"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                title="Connect"
                aria-label="Connect"
                onClick={() => {
                  alert("go")
                }}>
                <Icon>forward</Icon>
              </IconButton>
            </InputAdornment>
           )
        }}/>

    </OnlineViewerControls>
  };

  onLogViewerDataLoad = ({sessions, currentSession}: {sessions: Array<string>, currentSession: string}) => {
    this.setState({
      sessions,
      currentSession
    })
  };

  render() {
    let {currentTab} = this.state;
    return <>
    <AppBar position="static" color="default">
    <Toolbar>
    <Tabs value={currentTab} onChange={this.changeTabHandler}>
    <Tab label="Logs viewer" value={TABS.LOG_VIEWER}/>
    <Tab label="Online viewer" value={TABS.ONLINE_VIEWER}/>
    </Tabs>
    {this.state.currentTab === TABS.LOG_VIEWER && this.getLogViewerControls()}
    {this.state.currentTab === TABS.ONLINE_VIEWER && this.getOnlineViewerControls()}
    </Toolbar>
    </AppBar>
    <div style={{display: currentTab === TABS.LOG_VIEWER ? "block" : "none", height: "calc(100vh - 48px)"}}>
    <LogsViewer onDataLoad={this.onLogViewerDataLoad} currentSession={this.state.currentSession}/>
    </div>
    </>
  }
  }