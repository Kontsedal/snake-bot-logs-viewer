import React, {Component} from "react";
import {Slider} from "../Slider";
import styled from "styled-components";
import {IconButton} from "@material-ui/core";
import Icon from '@material-ui/core/Icon';

let ControlsWrapper = styled.div`
  width: 100%;
  padding: 5px 15px;
  background-color: #f9f9f9;
  display: flex;
  height: 58px;
`;
let SliderWrapper = styled.div`
  padding-left: 10px;
  width: 100%;
  display: inline-flex;
  align-items: center;
`;

interface PlayControlsProps {
  currentTick: number,
  onTickChange: (value: number) => void,
  ticksCount: number,
  markers: Array<{value:number}>,
}

interface PlayControlsState{
  isPlaying: boolean;
}

const PLAY_SPEED_MS = 500;

export class PlayControls extends Component<PlayControlsProps, PlayControlsState> {
  playInterval: any;

  state = {
    isPlaying: false
  };

  componentWillUnmount(): void {
    this.stopPlayInterval();
  }

  goToNextTick = () => {
    if(this.props.currentTick + 1 > this.props.ticksCount - 1) {
      return this.onPause();
    }
    this.props.onTickChange(this.props.currentTick + 1);
  };

  goToPreviousTick = () => {
    this.props.onTickChange(this.props.currentTick - 1);
  };

  onPlay = () => {
    if(this.props.currentTick + 1 === this.props.ticksCount) {
      this.props.onTickChange(0);
    }
    this.goToNextTick();
    this.setState({
      isPlaying: true
    });
    this.playInterval = setInterval(this.goToNextTick, PLAY_SPEED_MS)
  };

  onPause = () => {
    this.setState({
      isPlaying: false
    });
    this.stopPlayInterval();
  };

  stopPlayInterval = () => {
    clearInterval(this.playInterval);
  };

  render() {
    return <ControlsWrapper>
      <IconButton aria-label="Previous tick"
                  title="Previous tick"
                  onClick={this.goToPreviousTick}
                  disabled={this.props.currentTick === 0}>
        <Icon>navigate_before</Icon>
      </IconButton>
      {!this.state.isPlaying && <IconButton aria-label="Play" title="Play" onClick={this.onPlay}>
        <Icon>play_arrow</Icon>
      </IconButton>}
      {this.state.isPlaying && <IconButton aria-label="Pause" title="Pause" onClick={this.onPause}>
        <Icon>pause</Icon>
      </IconButton>}
      <IconButton aria-label="Next tick"
                  title="Next tick"
                  onClick={this.goToNextTick}
                  disabled={this.props.currentTick === this.props.ticksCount - 1}>
        <Icon>navigate_next</Icon>
      </IconButton>
      <SliderWrapper>
        <Slider value={this.props.currentTick}
                min={0}
                max={this.props.ticksCount - 1}
                markers={this.props.markers}
                step={1}
                tipFormatter={value => {
                  return `Tick: ${value}`
                }}
                withTooltips={true}
                onChange={this.props.onTickChange}/>
      </SliderWrapper>
    </ControlsWrapper>
  }
}

