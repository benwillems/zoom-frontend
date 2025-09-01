import React from 'react'
import PieChart from './PieChart'
import LineChart from './LineChart'
import BarChart from './BarChart'

const Charts = ({ graphs }) => {
  if (!graphs) {
    return <div>Loading graphs...</div>
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-5'>
      {graphs?.map((graph, index) => {
        if (!graph) return null

        const ChartComponent = (() => {
          switch (graph?.graphType) {
            case 'pie':
              return PieChart
            case 'line':
              return LineChart
            case 'bar':
              return BarChart
            default:
              console.warn(`Unknown graph type: ${graph?.graphType}`)
              return null
          }
        })()

        if (!ChartComponent) return null

        return (
          <div key={index} className='w-full h-full min-h-[350px]'>
            <ChartComponent
              data={graph?.graphType === 'bar' ? graph : graph.data}
              title={graph?.title}
            />
          </div>
        )
      })}
    </div>
  )
}

export default Charts
