import React, { Fragment } from 'react'

import timeSeries from '../../data/timeSeries.json'
import { GraphContainer, Snippet } from '../styledComponents'
import { ChartArea, LineChart } from 'viiksetjs'
const TimeSeries = () => {
  return (
    <Fragment>
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
    </Fragment>
  )
}

export default TimeSeries
