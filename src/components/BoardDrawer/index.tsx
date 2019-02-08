import React, {Component} from "react";
import {ELEMENT_TYPE, IMAGES_MAP} from "./constants";
import styled from 'styled-components';
import _ from "lodash";
import styledComponentsTS from 'styled-components-ts'
import {getKeyByValue} from "../../utils/getKeyByValue";
import "./styles.scss";

let DrawerWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #262626;
  display: flex;
  align-items: center;
  justify-content: center;
`;

let Canvas = styled.canvas`
 
`;

interface HolderProps {
}

``
let Holder = styledComponentsTS<HolderProps>(styled.div)`
  position: relative;
`;


interface BoardDrawerProps {
  board: string,
  rectangles?: Array<{ color: string, x: number, y: number }>
}

interface BoardDrawerState {
  canvasWidth: number,
  cells: { x: number, y: number, type: string, typeName: string }[]
}


export class BoardDrawer extends Component<BoardDrawerProps, BoardDrawerState> {
  canvas: HTMLCanvasElement | null = null;
  wrapper: HTMLElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  boardRowLength: number = 1;
  imagesCache: { [kay: string]: HTMLCanvasElement } = {};

  state = {
    canvasWidth: 500,
    cells: []
  };

  updateCanvas() {
    console.log("update")
    if (!this.ctx) {
      return;
    }
    this.ctx.clearRect(0, 0, this.state.canvasWidth, this.state.canvasWidth);
    let {board} = this.props;
    let boardRowLength = Math.sqrt(board.length);
    this.boardRowLength = boardRowLength;
    let cells: any = [];
    board.split("").map((element, index) => {
      let y = Math.floor(index / boardRowLength);
      let x = index - y * boardRowLength;
      let image = IMAGES_MAP[element as ELEMENT_TYPE];
      let typeName = getKeyByValue(ELEMENT_TYPE, element);
      cells.push({
        x,
        y,
        type: element,
        typeName
      });
      return this.drawObject({x, y, image})
    });
    this.setState({
      cells
    })
  }


  componentDidMount(): void {
    if (!this.canvas) {
      return;
    }
    this.ctx = this.canvas.getContext("2d");
    window.addEventListener("resize", _.throttle(this.updateCanvasSize, 500, {trailing: false}));
    this.updateCanvasSize();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.board !== this.props.board || prevState.canvasWidth !== this.state.canvasWidth) {
      this.updateCanvas();
    }
  }

  updateCanvasSize = () => {
    if (!this.wrapper) {
      return;
    }
    let canvasWidth = Math.min(this.wrapper.clientWidth, this.wrapper.clientHeight);
    this.setState({
      canvasWidth: canvasWidth,
    });
  };

  drawObject({x, y, image}: { x: number, y: number, image: string }) {
    return new Promise(resolve => {
      let cellSize = this.state.canvasWidth / this.boardRowLength;
      let cachedImage = this.imagesCache[image + cellSize];
      if (cachedImage) {
        if (!this.ctx) {
          return resolve();
        }
        this.ctx.drawImage(cachedImage, x * cellSize, y * cellSize, cellSize, cellSize);
        return resolve();
      }

      let img = new Image();
      img.onload = () => {
        let offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = cellSize;
        offscreenCanvas.height = cellSize;
        let offscreenCanvasCtx = offscreenCanvas.getContext("2d");
        if (!this.ctx || !offscreenCanvasCtx) {
          return resolve();
        }
        offscreenCanvasCtx.drawImage(img, 0, 0, cellSize, cellSize);
        this.ctx.drawImage(offscreenCanvas, x * cellSize, y * cellSize, cellSize, cellSize);
        this.imagesCache[image + cellSize] = offscreenCanvas;
        resolve();
      };
      img.src = image;
    })
  }

  render() {
    let cellSize = this.state.canvasWidth / this.boardRowLength;
    return <DrawerWrapper ref={(elem: HTMLElement | null) => this.wrapper = elem}>
      <Holder>
        {this.state.cells.map(({y, x, type, typeName}) => {
          return <div className="c-cell"
                      key={x + ":" + y}
                      title={`y:${y} x:${x} type:"${type}" typeName: "${typeName}"`}
                      style={{
                        top: y * cellSize,
                        left: x * cellSize,
                        width: cellSize,
                        height: cellSize
                      }}/>
        })}
        {this.props.rectangles && this.props.rectangles.map(rectangle => {
          return <div className="c-rectangle"
                      key={rectangle.x + ":" + rectangle.y + ":" + rectangle.color}
                      style={{
                        top: rectangle.y * cellSize,
                        left: rectangle.x * cellSize,
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: rectangle.color
                      }}/>;
        })}
        <Canvas width={this.state.canvasWidth} height={this.state.canvasWidth}
                ref={(elem: HTMLCanvasElement | null) => this.canvas = elem}/>
      </Holder>
    </DrawerWrapper>
  }
}

export default BoardDrawer;
