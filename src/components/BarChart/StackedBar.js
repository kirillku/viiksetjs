import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Group } from '@vx/group'
import { stack } from 'd3-shape'
import { scaleOrdinal, scaleBand, scaleLinear, scaleTime } from 'd3-scale'
import get from 'lodash/get'
import flatten from 'lodash/flatten'
import head from 'lodash/head'
import sum from 'lodash/sum'
import set from 'lodash/set'

import { extractLabels, extractX } from '../../utils/dataUtils'
import { StyledBar } from '../styledComponents'

class StackedBar extends Component {
  componentDidMount() {
    this.props.declareBar()
  }

  shouldComponentUpdate(prevProps) {
    return !(prevProps.yPoints === this.props.yPoints) || !(prevProps.keys === this.props.keys)
  }

  determineScales = ({ orientation, type, data, keys }) => {
    const { margin, height, width, yPoints, xPoints } = this.props
    const dataDomain = Math.max(
      ...flatten(data.map(d => keys.map(key => get(d, key))).map(arr => sum(arr)))
    )

    const scalar = type === 'linear' ? scaleLinear : scaleTime

    if (orientation === 'horizontal') {
      const xScale = scalar()
        .domain([0, dataDomain])
        .range([margin.left, width])
      const yScale = scaleBand()
        .domain(yPoints)
        .range([height, margin.top])
        .padding(0.1)
      return { xScale, yScale }
    } else {
      const xScale = scaleBand()
        .domain(xPoints)
        .range([margin.left, width])
        .padding(0.1)
      const yScale = scalar()
        .domain([dataDomain, 0])
        .range([height, margin.top])
      return { xScale, yScale }
    }
  }

  determineBarWidth = ({ d, isHorizontal, xScale, yScale }) => {
    if (isHorizontal) {
      return xScale(d[1]) - xScale(d[0])
    } else {
      return yScale(d[1]) - yScale(d[0])
    }
  }

  render() {
    const {
      data,
      type,
      orientation,
      colors,
      keys,
      yKey,
      xKey,
      height,
      margin,
      notool,
      mouseMove,
      mouseLeave,
      barProps
    } = this.props

    if (!keys) {
      // eslint-disable-next-line
      console.warn(
        'StackedBar: You have not provided the keys prop, this could explain unexpected render output'
      )
    }

    const zScale = scaleOrdinal()
      .domain(keys || extractLabels(data[0]))
      .range(colors)
    const { xScale, yScale } = this.determineScales({ type, orientation, data, keys })
    const isHorizontal = orientation === 'horizontal'
    const series = stack().keys(keys || extractLabels(data[0]))(data)
    const bandwidth = isHorizontal ? yScale.bandwidth() : xScale.bandwidth()
    const yPoint = d => yScale(get(d, yKey))
    const xPoint = d => xScale(extractX(d, xKey))
    return (
      <Group>
        {series &&
          series.map((s, i) => (
            <Group key={i}>
              {s.map((d, ii) => {
                const barWidth = this.determineBarWidth({ d, isHorizontal, xScale, yScale })
                return (
                  <StyledBar
                    key={`bar-group-bar-${i}-${ii}-${s.key}`}
                    x={isHorizontal ? xScale(d[0]) : xPoint(get(d, 'data'))}
                    y={isHorizontal ? yPoint(get(d, 'data')) : height + margin.top - yScale(d[1])}
                    width={isHorizontal ? barWidth : bandwidth}
                    height={isHorizontal ? bandwidth : barWidth}
                    fill={zScale(s.key)}
                    onMouseMove={() => event => {
                      const key = s.key
                      const datum = set({}, xKey || 'xValue', head(extractX(get(d, 'data'), xKey)))
                      set(datum, key, get(d, `data.${key}`))
                      return notool || mouseMove({ event, datum })
                    }}
                    onMouseLeave={() => () => mouseLeave()}
                    {...barProps}
                  />
                )
              })}
            </Group>
          ))}
      </Group>
    )
  }
}

StackedBar.propTypes = {
  xScale: PropTypes.func,
  inheritedScale: PropTypes.func,
  colors: PropTypes.array
}

export default StackedBar
