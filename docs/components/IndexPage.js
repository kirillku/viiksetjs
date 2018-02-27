import React from 'react'
import styled, { injectGlobal } from 'styled-components'
import { Line } from '@vx/shape'

import { ChartArea, LineChart, BarChart, withBounds } from '../../lib'
import timeSeries from '../data/timeSeries.json'
import categoricalSeries from '../data/categoricalSeries.json'
import numericSeries from '../data/numericSeries.json'

injectGlobal`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
  }
`

const PageWrapper = styled.div`
  width: 100%;
  height: 100vh;
  h2 {
    text-align: center;
  }
`

const GraphContainer = styled.div`
  width: 80%;
  height: 20rem;
  margin: auto;
`

const Header = styled.div`
  background: #00395e;
  display: flex;
  height: 100px;
  width: 100%;
  color: #fff;
  flex-direction: column;
  border-bottom: 3px solid #00adee;
`
const Snippet = styled.pre`
  background: #333;
  color: white;
  width: 80%;
  padding-top: 2rem;
  margin: auto;
  padding-bottom: 2rem;
`
const TooltipContainer = styled.span.attrs({
  style: p => ({
    left: `${p.rect ? p.left + p.rect.width : p.left}px`,
    top: `${p.parentRect ? -(p.parentRect.height - p.yCoord + p.rect.height) : p.yCoord}px`
  })
})`
  position: relative;
  pointer-events: none;
`

const Indicator = ({ mouseX, color, height }) => (
  <Line
    from={{ x: mouseX - 2.5, y: 0 }}
    to={{ x: mouseX - 2.5, y: height }}
    stroke={color}
    strokeWidth={5}
    strokeOpacity={1.5}
    style={{ pointerEvents: 'none' }}
  />
)
const BoundedTooltip = withBounds(TooltipContainer)
const LinearTooltip = ({ tooltipData, mouseX, yCoords }) => (
  <BoundedTooltip left={mouseX} yCoord={yCoords[1]}>
    {tooltipData.y < 300 ? '❄️' : '🔥'}
  </BoundedTooltip>
)
const IndexPage = () => (
  <PageWrapper>
    <Header>
      <h1 style={{ textAlign: 'center' }}>Welcome to ViiksetJS!</h1>
    </Header>
    <h1>Examples</h1>
    <h2>Time Series</h2>
    <GraphContainer>
      <ChartArea data={timeSeries.data} color="#2189C8" stroke="grey">
        <LineChart dataKey="messages" color="#2189C8" />
      </ChartArea>
    </GraphContainer>
    <Snippet>
      {`
        <ChartArea data={timeSeries.data} color="#2189C8" stroke="grey">
          <LineChart dataKey="messages" color="#2189C8" />
        </ChartArea>`}
    </Snippet>
    <h2>Categorical Series</h2>
    <GraphContainer>
      <ChartArea
        data={categoricalSeries.data}
        type="ordinal"
        color="#dc7d5b"
        xKey="company"
        stroke="grey"
        nogrid
        labelY="Culinary Score"
      >
        <BarChart dataKey="score" color="#dc7d5b" />
      </ChartArea>
    </GraphContainer>
    <Snippet>
      {`
      <ChartArea
        data={categoricalSeries.data}
        type="ordinal"
        color="#dc7d5b"
        xKey="company"
        stroke="grey"
        nogrid
        labelY="Culinary Score"
      >
        <BarChart dataKey="score" color="#dc7d5b" />
      </ChartArea>
      `}
    </Snippet>
    <h2>Numeric Data With Custom Tooltip</h2>
    <GraphContainer>
      <ChartArea
        data={numericSeries.data}
        color="#42f4c2"
        stroke="grey"
        xKey="x"
        yKey="y"
        type="linear"
        labelY="Heat (K)"
        labelX="Time (s)"
        tooltip={LinearTooltip}
        indicator={Indicator}
      >
        <LineChart dataKey="y" color="#42f4c2" />
      </ChartArea>
    </GraphContainer>
    <Snippet>
      {`
        const LinearTooltip = ({ tooltipData, mouseX, yCoords }) => (
          <BoundedTooltip left={mouseX} yCoord={yCoords[1]}>
             {tooltipData.y < 300 ? '❄️' : '🔥'}
          </BoundedTooltip>
          )
      <ChartArea
        data={numericSeries.data}
        color="#42f4c2"
        stroke="grey"
        xKey="x"
        yKey="y"
        type="linear"
        labelY="Heat (K)"
        labelX="Time (ms)"
        tooltip={LinearTooltip}
      >
        <LineChart dataKey="y" color="#42f4c2" />
      </ChartArea>
      `}
    </Snippet>
  </PageWrapper>
)
export default IndexPage