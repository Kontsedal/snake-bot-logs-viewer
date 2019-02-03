import React, {Component} from "react";
import "./styles.scss";
import cx from "classnames";

const SLIDER_CLASS = "c-slider";
const VERTICAL_SLIDER_CLASS = SLIDER_CLASS + "--vertical";
const STRIP_CLASS = SLIDER_CLASS + "__strip";
const BACKGROUND_STRIP_CLASS = STRIP_CLASS + "--background";
const PROGRESS_STRIP_CLASS = STRIP_CLASS + "--progress";
const MARKERS_CLASS = SLIDER_CLASS + "__markers";
const MARKER_CLASS = SLIDER_CLASS + "__marker";
const THUMB_CLASS = SLIDER_CLASS + "__thumb";
const TOOLTIP_CLASS = SLIDER_CLASS + "__tooltip";

interface Marker {
    label: string,
    className: string,
    value: number
    percent: number,
}

interface SliderViewProps {
    vertical:boolean,
    onThumbRef:(elem: HTMLElement | null) => void,
    onStripRef:(elem: HTMLElement | null) => void,
    progressPercent: number,
    min:number,
    max:number,
    value:number,
    onStripMouseMove:(event: any) => void,
    onStripMouseLeave:(event: any) => void,
    mainTooltipValue:string | number,
    onStripClick: (event: any) => void,
    hoverPercent: number,
    seekTooltipValue: number,
    withTooltips: boolean,
    markers:Array<Marker>,
    showSeekTooltip,
    onThumbKeyDown
}

export class SliderView extends Component<SliderViewProps> {
    static defaultProps: { onChange: () => void; tipFormatter: (val) => any; markers: any[] };
    render() {
        let {
            vertical, onThumbRef, onStripRef, progressPercent, min, max, value,
            onStripMouseMove, onStripMouseLeave, mainTooltipValue, onStripClick,
            hoverPercent, seekTooltipValue, withTooltips, markers, showSeekTooltip, onThumbKeyDown
        } = this.props;
        let progressStripStyles, thumbStyles, mainTooltipStyles, seekTooltipStyles;
        if (!vertical) {
            progressStripStyles = {
                width: progressPercent + "%"
            };
            thumbStyles = {
                left: progressPercent + "%"
            };
            mainTooltipStyles = {
                left: progressPercent + "%"
            };
            seekTooltipStyles = {
                left: hoverPercent + "%"
            };
        } else {
            progressStripStyles = {
                height: progressPercent + "%"
            };
            thumbStyles = {
                bottom: progressPercent + "%"
            };
            mainTooltipStyles = {
                bottom: progressPercent + "%"
            };
            seekTooltipStyles = {
                bottom: hoverPercent + "%"
            };
        }
        return <div className={cx(SLIDER_CLASS, {[VERTICAL_SLIDER_CLASS]: vertical})}
                    onMouseMove={onStripMouseMove}
                    onMouseLeave={onStripMouseLeave}
                    onClick={onStripClick}>
            <div className={cx(STRIP_CLASS, BACKGROUND_STRIP_CLASS)}
                 ref={onStripRef}/>
            <div className={cx(STRIP_CLASS, PROGRESS_STRIP_CLASS)}
                 style={progressStripStyles}/>
            <div className={MARKERS_CLASS}>
                {markers.map(({label, className, value, percent}) => {
                    let markerStyles;
                    if (vertical) {
                        markerStyles = {
                            bottom: percent + "%"
                        };
                    } else {
                        markerStyles = {
                            left: percent + "%"
                        };
                    }
                    return <div key={label + className + value}
                                className={cx(MARKER_CLASS, className)} style={markerStyles}>{label}</div>
                })}
            </div>
            <div className={THUMB_CLASS}
                 onDragStart={(event) => event.preventDefault()}
                 ref={onThumbRef}
                 onKeyDown={onThumbKeyDown}
                 style={thumbStyles}
                 role="slider"
                 tabIndex={0}
                 aria-valuemin={min}
                 aria-valuemax={max} aria-valuenow={value} aria-disabled="false"/>
            {withTooltips && <div className={TOOLTIP_CLASS} style={mainTooltipStyles}>{mainTooltipValue}</div>}
            {withTooltips && showSeekTooltip &&
            <div className={TOOLTIP_CLASS} style={seekTooltipStyles}>{seekTooltipValue}</div>}
        </div>
    }
}
