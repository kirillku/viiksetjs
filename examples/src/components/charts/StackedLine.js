import React, { Fragment } from 'react'

import { ChartArea, LineChart } from 'viiksetjs'
import biaxialSeries from '../../data/biaxialSeries.json'
import { GraphContainer, Snippet } from '../styledComponents'

const isMobile = window.innerWidth <= 500

const StackedLine = () => {
  return (
    <Fragment>
      <GraphContainer>
        <ChartArea
          data={biaxialSeries.data}
          color="rgb(238, 66, 244)"
          stroke="rgba(109, 109, 109, 0.13)"
          numXTicks={isMobile ? 1 : 4}
        >
          <LineChart color="rgb(238, 66, 244)" dataKey="users" />
          <LineChart color="rgb(244, 196, 65)" dataKey="posts" />
        </ChartArea>
      </GraphContainer>
      <Snippet>
        {`
         <ChartArea
          data={biaxialSeries.data}
          color="rgb(238, 66, 244)"
          stroke="rgba(109, 109, 109, 0.13)"
        >
          <LineChart color="rgb(238, 66, 244)" dataKey="users" />
          <LineChart color="rgb(244, 196, 65)" dataKey="posts" />
        </ChartArea>
        `}
      </Snippet>
    </Fragment>
  )
}

export default StackedLine
