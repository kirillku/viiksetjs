import React, { Fragment } from 'react'

import { ChartArea, Threshold, LineChart } from 'viiksetjs'
import thresholdSeries from '../../data/thresholdSeries.json'
import { GraphContainer, Snippet } from '../styledComponents'

const isMobile = window.innerWidth <= 500

const ThresholdExample = () => (
  <Fragment>
    <GraphContainer>
      <ChartArea
        data={thresholdSeries.data}
        color="black"
        stroke="rgba(109, 109, 109, 0.13)"
        notool
        numXTicks={isMobile ? 1 : 4}
      >
        <Threshold y0="usd" y1="eur" />
        <LineChart dataKey="usd" color="black" nofill />
        <LineChart dataKey="eur" color="black" nofill lineProps={{ strokeDasharray: [9, 9] }} />
      </ChartArea>
    </GraphContainer>
    <Snippet>
      {`
            <ChartArea
                data={thresholdSeries.data}
                color="black"
                stroke="rgba(109, 109, 109, 0.13)"
                notool
                numXTicks={isMobile ? 1 : 4}
            >
                <Threshold y0="usd" y1="eur" />
                <LineChart dataKey="usd" color="black" nofill />
                <LineChart
                  dataKey="eur"
                  color="black"
                  nofill
                  lineProps={{ strokeDasharray: [9, 9] }}
                />
            </ChartArea>
        `}
    </Snippet>
  </Fragment>
)

export default ThresholdExample
