import React, {Component} from "react";
import {SliderView} from "./view";
import {KEY_CODES} from "../../utils/events";
import _ from "lodash";

const MAX_ON_CHANGE_FREQUENCY_MS = 100;

interface Marker {
  label?: string,
  className?: string,
  value: number,
  color?: string
}

interface SliderProps {
  vertical?: boolean,
  min: number,
  max: number,
  value: number,
  step: number,
  onChange?: Function,
  tipFormatter?: Function,
  withTooltips?: boolean,
  markers?: Array<Marker>,
  className?: string
}

export class Slider extends Component<SliderProps> {
  onChangeHandler: (value: number) => void;
  stripElement: HTMLElement | null = null;

  state = {
    tempProgressPercent: 0,
    tempProgressEnabled: false,
    hoverPercent: 0,
    showTooltips: false
  };
  static defaultProps: { onChange: () => void; tipFormatter: (val) => any; markers: any[] };

  constructor(props) {
    super(props);

    this.onChangeHandler = _.throttle((newValue: number) => {
      if (typeof newValue === 'number') {
        // @ts-ignore
        this.props.onChange(newValue);
      }
    }, MAX_ON_CHANGE_FREQUENCY_MS, {trailing: false});
  }

  onThumbRef = (element:HTMLElement | null) => {
    if (!element) {
      return;
    }
    element.addEventListener("mousedown", () => {
      const mouseMoveHandler = (event) => {
        let cursorPercent = this.getCursorPercent(event);
        this.setState({
          tempProgressEnabled: true,
          tempProgressPercent: cursorPercent
        })

      };

      const mouseUpHandler = () => {
        document.removeEventListener("mouseup", mouseUpHandler);
        document.removeEventListener("mousemove", mouseMoveHandler);
        let cursorPosition = this.state.hoverPercent || this.state.tempProgressPercent;
        // @ts-ignore
        this.onChangeHandler(Math.floor(cursorPosition * this.props.max / 100));
        this.setState({
          tempProgressEnabled: false,
          tempProgressPercent: 0
        })
      };

      document.addEventListener("mouseup", mouseUpHandler);
      document.addEventListener("mousemove", mouseMoveHandler);
    });
  };

  getPercentsPerStep() {
    let {min, max, step} = this.props;
    let stepsCount = (max - min) / step;
    return (((max - min) / max) * 100) / stepsCount;
  }

  onStripRef = (element: HTMLElement | null) => {
    if (!element) {
      return;
    }
    this.stripElement = element;
  };

  getProgressPercent() {
    let {tempProgressPercent, tempProgressEnabled} = this.state;
    let {value, max} = this.props;
    if (tempProgressEnabled) {
      return tempProgressPercent;
    }
    let percentsPerStep = this.getPercentsPerStep();
    let valuePercent = (value / max) * 100;
    if (valuePercent > 100) {
      valuePercent = 100;
    }

    if (valuePercent < 0) {
      valuePercent = 0;
    }

    if (valuePercent !== 0 && valuePercent !== 100) {
      valuePercent = Math.floor(valuePercent / percentsPerStep) * percentsPerStep;
    }

    return valuePercent;
  }

  getCursorPercent(event) {
    if (!this.stripElement) {
      return;
    }
    let {vertical} = this.props;
    let stripDimensions = this.stripElement.getBoundingClientRect();
    let percentsPerStep = this.getPercentsPerStep();
    let cursorDiff;
    if (vertical) {
      cursorDiff = stripDimensions.top + stripDimensions.height - event.clientY;
    } else {
      cursorDiff = event.clientX - stripDimensions.left;
    }
    if (cursorDiff < 0) {
      cursorDiff = 0;
    }
    let diffPercent;
    if (cursorDiff === 0) {
      diffPercent = 0
    } else {
      if (vertical) {
        diffPercent = cursorDiff * 100 / stripDimensions.height;
      } else {
        diffPercent = cursorDiff * 100 / stripDimensions.width;
      }
    }

    if (diffPercent > 100) {
      diffPercent = 100;
    }

    if (diffPercent !== 100 && diffPercent % percentsPerStep !== 0) {
      diffPercent = Math.floor(diffPercent / percentsPerStep) * percentsPerStep;
    }
    return diffPercent;
  }

  onStripMouseMove = (event) => {
    let cursorPercent = this.getCursorPercent(event);
    this.setState({
      hoverPercent: cursorPercent,
      showTooltips: this.props.withTooltips
    })
  };

  onStripMouseLeave = () => {
    this.setState({
      hoverPercent: 0,
      showTooltips: false
    })
  };

  onStripClick = () => {
    this.onChangeHandler(Math.floor(this.state.hoverPercent * this.props.max / 100));
  };

  getMainTooltipValue = () => {
    let {tempProgressPercent, tempProgressEnabled} = this.state;
    let {max, value} = this.props;
    if (!this.props.tipFormatter) {
      return;
    }
    if (tempProgressEnabled) {
      return this.props.tipFormatter(Math.floor(tempProgressPercent / 100 * max))
    }
    return this.props.tipFormatter(value)
  };

  getSeekTooltipValue = () => {
    if (!this.props.tipFormatter) {
      return;
    }
    let {hoverPercent} = this.state;
    let {max} = this.props;
    return this.props.tipFormatter(Math.floor(hoverPercent / 100 * max))
  };

  onThumbKeyDown = (event) => {
    let {value, step, min, max} = this.props;
    let keyCode = event.keyCode;
    if (![KEY_CODES.ARROW_LEFT, KEY_CODES.ARROW_RIGHT,
      KEY_CODES.ARROW_UP, KEY_CODES.ARROW_DOWN,
      KEY_CODES.PLUS, KEY_CODES.MINUS].includes(keyCode)) {
      return;
    }

    event.preventDefault();

    if ([KEY_CODES.ARROW_LEFT, KEY_CODES.ARROW_DOWN, KEY_CODES.MINUS].includes(keyCode)) {
      value -= step;
    }
    if ([KEY_CODES.ARROW_RIGHT, KEY_CODES.ARROW_UP, KEY_CODES.PLUS].includes(keyCode)) {
      value += step;
    }

    if (value < min) {
      value = min;
    }

    if (value > max) {
      value = max;
    }
    this.onChangeHandler(value)
  };

  getMarkers() {
    if (!this.props.markers) {
      return [];
    }
    let {markers, max} = this.props;
    markers = markers.filter(marker => _.isNumber(marker.value));
    return markers.map((marker: Marker) => {
      let newMarker = {
        value: 0,
        percent: 0,
        label: "",
        className: "",
        color: "inherit",
      };
      newMarker.value = marker.value;
      let percent = marker.value * 100 / max;
      if (percent < 0) {
        percent = 0;
      }
      if (percent > 100) {
        percent = 100;
      }
      newMarker.percent = percent;
      newMarker.label = !_.isUndefined(marker.label) ? marker.label : "";
      newMarker.className = marker.className || "";
      newMarker.color = marker.color || "";
      return newMarker;
    });
  }

  render() {
    let {vertical, min, max, value, withTooltips} = this.props;
    return <SliderView vertical={Boolean(vertical)}
                       onThumbRef={this.onThumbRef}
                       onStripRef={this.onStripRef}
                       onThumbKeyDown={this.onThumbKeyDown}
                       progressPercent={this.getProgressPercent()}
                       hoverPercent={this.state.hoverPercent}
                       showSeekTooltip={!this.state.tempProgressEnabled}
                       onStripMouseMove={this.onStripMouseMove}
                       onStripMouseLeave={this.onStripMouseLeave}
                       mainTooltipValue={this.getMainTooltipValue()}
                       seekTooltipValue={this.getSeekTooltipValue()}
                       onStripClick={this.onStripClick}
                       withTooltips={Boolean(withTooltips)}
                       markers={this.getMarkers()}
                       min={min}
                       max={max}
                       value={value}/>
  }
}
SliderView.defaultProps = {
  onChange: () => {
  },
  tipFormatter: val => val,
  markers: []
};
