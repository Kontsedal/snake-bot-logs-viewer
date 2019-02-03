import React, {ChangeEvent, Component} from 'react';
import BoardDrawer from "../BoardDrawer";
import styled, {css} from 'styled-components';
import {PlayControls} from "../PlayControls";
import Dropzone from 'react-dropzone'
import styledComponentsTS from "styled-components-ts";

let DrawerWrapper = styled.div`
  height: 100%;
  max-height: calc(100vh - 122px);
  width: 100%;
`;

interface StyledDropAreaProps {
  isDragActive: boolean,
  [key:string]: any
}
const StyledDropArea = styledComponentsTS<StyledDropAreaProps>(styled.div)`
    height: calc(100vh - 64px);
    border: 8px dashed #e0e0e0;
    padding: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 40px;
    text-transform: uppercase;
    font-weight: bold;
    letter-spacing: 5px;
    color: #ababab;
    font-family: Roboto;
    cursor: pointer;
    background-color: #f1f1f1;
    &:hover {
      background-color: #e6efe6;
    }
  ${props => (props.isDragActive) && css`
    border-color: #6ea86b;
  `}
`;

interface Logs {
  sessions: {
    [key: string]: [
      {
        tickNumber: number,
        board: string,
        pathMatrix: Array<Array<0|1>>,
        possibleTargets: Array<{points:number, element: {x, y}}>,
        selectedTarget: {x, y};
        nextPosition: {x:number, y:number} | null;
        snakeIsDead: boolean,
        debug: {
          [key:string]: any
        }
      }
      ]
  }
}

interface LogsViewerState {
  logs: Logs,
  sessions: Array<string>,
  currentSession: string,
  currentTick: number
}

interface LogsViewerProps {
  onDataLoad: ({sessions, currentSession}: {sessions:Array<string>, currentSession: string}) => void,
  currentSession: string | undefined
}

export class LogsViewer extends Component<LogsViewerProps, LogsViewerState> {
  constructor(props: any) {
    super(props);
    this.state = {
      logs: {sessions:{}},
      sessions: [],
      currentSession: "",
      currentTick: 0
    }
  }

  onFile = (files: File[] | null) => {
    if (!files || !files.length) {
      return;
    }
    let reader = new FileReader();
    let file = files[0];
    reader.onloadend = () => {
      let text = reader.result as string;
      this.parseLogs(text)
    };

    reader.readAsText(file);
  };

  parseLogs = (logs: string) => {
    let data = JSON.parse(logs) as Logs;
    let sessions = Object.keys(data.sessions);
    let currentSession = sessions[0];
    this.setState({
      logs: data,
      sessions,
      currentSession: currentSession,
      currentTick: 0
    });

    this.props.onDataLoad({sessions: sessions, currentSession})
  };

  static getDerivedStateFromProps(props, state) {
    if(props.currentSession && props.currentSession !== state.currentSession) {
      return {
        currentSession: props.currentSession,
        currentTick: 0
      }
    }
    return null;
  }

  onTickChange = (newTick) => {
    this.setState({
      currentTick: newTick
    })
  };

  getRectangles = () => {
    let log = this.state.logs.sessions[this.state.currentSession][this.state.currentTick];
    let rectangles:any = [];
    let colorsMap = {
      CANT_MOVE: "rgba(240, 40, 40, 0.5)",
      POSSIBLE_TARGET: "rgba(82, 240, 40, 0.5)",
      SELECTED_TARGET: "rgba(40, 32, 204, 0.5)",
      NEXT_POSITION: "rgba(240, 158, 40, 0.5)",
    };

    log.pathMatrix.forEach((row, y) => {
      row.forEach((canMove, x) => {
        if(canMove === 1) {
          rectangles.push({x, y, color: colorsMap.CANT_MOVE});
        }
      })
    });

    log.possibleTargets.forEach(({element:{x, y}}) => {
      rectangles.push({x, y, color: colorsMap.POSSIBLE_TARGET});
    });

    if(log.selectedTarget) {
      rectangles.push({x: log.selectedTarget.x, y:log.selectedTarget.y, color: colorsMap.SELECTED_TARGET});
    }

    if(log.nextPosition) {
      rectangles.push({x: log.nextPosition.x, y:log.nextPosition.y, color: colorsMap.NEXT_POSITION});
    }

    return rectangles;
  };

  getMarks = () => {
    let marks:any = [];
    let ticks = this.state.logs.sessions[this.state.currentSession];
    ticks.forEach((tick, index) => {
      if(tick.snakeIsDead) {
        marks.push({
          value: index,
          label: ""
        })
      }
    });
    return marks;
  };

  render() {
    let board, ticks;
    if(this.state.currentSession && typeof this.state.currentTick === "number" && this.state.logs) {
      ticks = this.state.logs.sessions[this.state.currentSession];
      if(ticks[this.state.currentTick]) {
        board = ticks[this.state.currentTick].board;
      }
    }
    return <>
      {!board && <Dropzone onDrop={this.onFile}>
        {({isDragActive, isDragAccept, isDragReject, acceptedFiles, rejectedFiles, getInputProps, getRootProps}) => {
          return <StyledDropArea isDragActive={isDragActive} {...getRootProps()}>
            <input {...getInputProps()} />
            <p>Click or drop log here</p>
          </StyledDropArea>
        }}
      </Dropzone>}
      {
        board &&
        <DrawerWrapper onClick={() => {console.log(this.state.logs.sessions[this.state.currentSession][this.state.currentTick])}}>
          <BoardDrawer board={board} rectangles={this.getRectangles()}/>
        </DrawerWrapper>
      }
      {board && <PlayControls currentTick={this.state.currentTick}
                              markers={this.getMarks()}
                              onTickChange={this.onTickChange}
                              ticksCount={ticks.length} />}
    </>
  }
}