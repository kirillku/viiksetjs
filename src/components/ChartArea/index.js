import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Group } from '@vx/group'
import { Bar } from '@vx/shape'
import { bisect } from 'd3-array'
import flow from 'lodash/flow'
import uniq from 'lodash/uniq'
import head from 'lodash/head'
import isEmpty from 'lodash/isEmpty'
import get from 'lodash/get'

import {
  getX,
  getY,
  extractLabels,
  extractX,
  extractY,
  createScalarData
} from '../../utils/dataUtils'
import { formatTicks, formatXTicks } from '../../utils/formatUtils'
import {
  determineXScale,
  biaxial,
  localPoint,
  determineYScale,
  findTooltipX,
  recursiveCloneChildren
} from '../../utils/chartUtils'
import DataContext from '../DataContext'
import withTooltip from '../Tooltip/withTooltip'
import withParentSize from '../Responsive/withParentSize'
import {
  Indicator,
  StyledGridRows,
  defaultTooltipRenderer,
  defaultTooltipContent,
  StyledLeftAxis,
  StyledBottomAxis
} from '../styledComponents'

const margin = { top: 18, right: 15, bottom: 15, left: 30 }

class ChartArea extends Component {
  state = {
    bar: false,
    chartData: false
  }

  // To prevent tooltips from not showing on bar chart due to minification changing names
  declareBar = () => this.setState({ bar: true })

  mouseMove = ({ event, xPoints, xScale, yScale, yScales, dataKeys, datum }) => {
    const { data, updateTooltip, xKey, type } = this.props
    const svgPoint = localPoint(this.chart, event)

    if (datum) {
      return updateTooltip({
        calculatedData: datum,
        x: get(svgPoint, 'x'),
        mouseX: get(svgPoint, 'x'),
        mouseY: get(svgPoint, 'y'),
        showTooltip: true
      })
    }

    const xValue = xScale.invert(get(svgPoint, 'x'))
    return flow(
      xValue => bisect(xPoints, xValue),
      index => {
        const bounds = { dLeft: data[index - 1], dRight: data[index] }
        return xValue - xPoints[index - 1] > xPoints[index] - xValue
          ? bounds.dRight || bounds.dLeft
          : bounds.dLeft || bounds.dRight
      },
      calculatedData => {
        const calculatedX = head(extractX(calculatedData, xKey))
        const x = findTooltipX({ type, calculatedX, xScale })
        const yCoords = yScales
          ? dataKeys.map(key => yScales[key](calculatedData[key]))
          : extractY(calculatedData).map(item => yScale(item))
        return updateTooltip({
          calculatedData,
          x,
          showTooltip: true,
          mouseX: get(svgPoint, 'x'),
          mouseY: get(svgPoint, 'y'),
          yCoords
        })
      }
    )(xValue)
  }

  mouseLeave = () =>
    this.props.updateTooltip({ calculatedData: null, x: null, yCoords: null, showTooltip: false })

  render() {
    const { bar } = this.state
    const {
      children,
      determineViewBox,
      data,
      noYAxis,
      xKey,
      formatY,
      formatX,
      yKey,
      labelY,
      labelYProps,
      labelX,
      labelXProps,
      yTickLabelProps,
      xTickLabelProps,
      xAxisProps,
      yAxisProps,
      numXTicks,
      numYTicks,
      type,
      orientation,
      stroke,
      nogrid,
      notool,
      gridStroke,
      color,
      yCoords,
      calculatedData,
      glyphRenderer,
      tooltipRenderer,
      tooltipContent,
      indicator: Indicator,
      mouseX,
      showTooltip,
      mouseY,
      x
    } = this.props
    return (
      <DataContext {...{ data, xKey, yKey, type, margin, orientation, x }}>
        {({
          xScale,
          size,
          dataKeys,
          biaxialChildren,
          data,
          width,
          height,
          yPoints,
          xPoints,
          yScale,
          yScales
        }) => (
          <div style={{ width: size.width, height: size.height }}>
            <svg
              width={width + margin.left + margin.right}
              height={height + margin.top + margin.bottom}
              preserveAspectRatio="none"
              viewBox={
                determineViewBox
                  ? determineViewBox({ size, margin })
                  : `-10 0 ${size.width} ${size.height}`
              }
              ref={svg => (this.chart = svg)}
            >
              <Group left={margin.left}>
                {!nogrid && (
                  <StyledGridRows
                    scale={yScale}
                    stroke={gridStroke || stroke}
                    width={width - margin.left}
                  />
                )}
                {biaxialChildren ||
                  noYAxis || (
                    <StyledLeftAxis
                      scale={determineYScale({
                        type,
                        orientation,
                        yPoints,
                        height,
                        margin
                      })}
                      {...{
                        color,
                        numTicks: numYTicks,
                        tickLabelProps: yTickLabelProps,
                        ...yAxisProps
                      }}
                      hideTicks
                      tickFormat={formatY}
                      label={labelY || ''}
                      labelProps={labelYProps}
                    />
                  )}
              </Group>
              {recursiveCloneChildren(children, {
                data,
                xScale,
                margin,
                height,
                yPoints,
                xPoints,
                width,
                notool,
                declareBar: this.declareBar,
                type,
                orientation,
                mouseMove: this.mouseMove,
                mouseLeave: this.mouseLeave,
                xKey,
                yKey,
                inheritedScale: yScale,
                formatY,
                numYTicks,
                formatX
              })}
              <Group left={margin.left}>
                {bar || (
                  <Bar
                    width={width}
                    height={height}
                    fill="transparent"
                    onMouseMove={() => event => {
                      notool ||
                        this.mouseMove({ event, xPoints, xScale, yScale, yScales, dataKeys })
                    }}
                    onTouchMove={() => event => {
                      notool ||
                        this.mouseMove({ event, xPoints, xScale, yScale, yScales, dataKeys })
                    }}
                    onTouchEnd={() => this.mouseLeave}
                    onMouseLeave={() => this.mouseLeave}
                  />
                )}
              </Group>
              {glyphRenderer && glyphRenderer({ width, height, xScale, yScale, margin })}
              <StyledBottomAxis
                scale={xScale}
                {...{
                  color,
                  height,
                  margin,
                  numTicks: numXTicks,
                  tickLabelProps: xTickLabelProps,
                  ...xAxisProps
                }}
                hideTicks
                tickFormat={formatX}
                label={labelX || ''}
                labelProps={labelXProps}
              />
              {x && !bar && <Indicator {...{ yCoords, x, stroke, color, height, mouseX }} />}
            </svg>
            {showTooltip &&
              tooltipRenderer({
                ...{
                  tooltipData: calculatedData,
                  tooltipContent,
                  yCoords,
                  x,
                  mouseX,
                  mouseY,
                  height,
                  color
                }
              })}
          </div>
        )}
      </DataContext>
    )
  }
}

ChartArea.propTypes = {
  data: PropTypes.array.isRequired,
  /**
   * Optional prop to apply color axes and x-ticks
   */
  color: PropTypes.string,
  /**
   * Optional prop to apply color gridlines and/or indicator
   */
  stroke: PropTypes.string,
  /**
   * Optional prop to apply color gridlines
   */
  gridStroke: PropTypes.string,
  /**
   * A string indicating the type of scale the type should have, defaults to timeseries
   */
  type: PropTypes.oneOf(['ordinal', 'linear']),
  /**
   * A string indicating the orientation the chart should have
   */
  orientation: PropTypes.oneOf(['horizontal']),

  /**
   * A string indicating which data values should be used to create the x-axis
   */
  xKey: PropTypes.string,
  /**
   * A function that returns React component to return as a tooltip receives as props the following:
   * @param {Object} tooltipData - calculated data returned from tooltip calculations
   * @param {Number} x - x coordinate of closest data point
   * @param {Number} mouseX - x coordinate of mouse position
   * @param {Number} mouseY - y coordinate of mouse position
   * @param {Object[]} yCoords - array of y coordinates of closest data point(s)
   * @param {String} color - string of color inherited from ChartArea
   * @returns {ReactElement} Tooltip - TooltipComponent
   */
  tooltipRenderer: PropTypes.func,
  /**
   * A function that returns a React Component that renders inside the default tooltip container
   * @param {Object} tooltipData - calculated data returned from tooltip calculations
   * @returns {ReactElement} TooltipContent
   */
  tooltipContent: PropTypes.func,
  /**
   * A React component made with SVG to indicate the tooltip position
   */
  indicator: PropTypes.func,
  /**
   * A function which formats the yAxis
   */
  formatY: PropTypes.func,
  /**
   * If true, no Yaxis will be shown
   */
  noYAxis: PropTypes.bool,
  /**
   * A label for the yAxis
   */
  labelY: PropTypes.string,
  /**
   * Label props object for yLabel
   */
  labelYProps: PropTypes.object,
  /**
   * Label props for y ticks
   */
  yTickLabelProps: PropTypes.func,
  /**
   * A label for the xAxis
   */
  labelX: PropTypes.string,
  /**
   * Label props object for xLabel
   */
  labelXProps: PropTypes.object,
  /**
   * Optional props object to be applied to the xAxis
   */
  xAxisProps: PropTypes.object,
  /**
   * Optional props object to be applied to the yAxis
   */
  yAxisProps: PropTypes.object,
  /**
   * Label props for x ticks
   */
  xTickLabelProps: PropTypes.func,
  /**
   * Number of ticks for xAxis
   */
  numXTicks: PropTypes.number,
  /**
   * Number of ticks for yAxis
   */
  numYTicks: PropTypes.number,
  /*
   * A function that recieves `width`, `height`, `xScale`, `yScale`, and `margin` from the `ChartArea` and
   * renders a glyph or series of glyphs with a `z-index` above all chart elements.
   */
  glyphRenderer: PropTypes.function,
  /**
   * A function which formats the xAxis
   */
  formatX: PropTypes.func,
  /**
   * An optional function for the chart viewbox, passed size and margin props
   */
  determineViewBox: PropTypes.func,
  /**
   * If true, no gridlines will be shown.
   */
  nogrid: PropTypes.bool,
  /**
   * If true, no tooltip will be shown.
   */
  notool: PropTypes.bool,
  /**
   * An optional prop for chart margins
   */
  margin: PropTypes.object
}

ChartArea.defaultProps = {
  data: [],
  color: '#000',
  stroke: '#000',
  nogrid: false,
  notool: false,
  noYAxis: false,
  glyphRenderer: () => null,
  indicator: Indicator,
  tooltipRenderer: defaultTooltipRenderer,
  tooltipContent: defaultTooltipContent,
  formatY: formatTicks,
  labelY: '',
  labelX: '',
  numXTicks: 6,
  numYTicks: 4,
  yTickLabelProps: () => ({
    dy: '-0.25rem',
    dx: '-0.75rem',
    strokeWidth: '0.5px',
    fontWeight: 400,
    textAnchor: 'end',
    fontSize: 12
  }),
  xTickLabelProps: () => ({
    dy: '-0.25rem',
    fontWeight: 400,
    strokeWidth: '0.5px',
    textAnchor: 'start',
    fontSize: 12
  }),
  labelYProps: { fontSize: 12, textAnchor: 'middle', fill: 'black' },
  labelXProps: { fontSize: 12, textAnchor: 'middle', fill: 'black', dy: '-0.5rem' },
  formatX: formatXTicks,
  margin: margin
}

export default withTooltip(ChartArea)
