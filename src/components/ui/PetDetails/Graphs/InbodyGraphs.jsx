import React from 'react'
import dynamic from 'next/dynamic'

const ResponsiveLineCanvas = dynamic(
  () => import('@nivo/line').then(module => module.ResponsiveLineCanvas),
  { ssr: false }
)

const InBodyGraph = ({ data, metric }) => {
  return (
    <div style={{ width: '100%', height: '100%', minWidth: 0 }}>
      <ResponsiveLineCanvas
        data={data}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        curve='natural'
        axisTop={null}
        axisRight={null}
        axisBottom={null}
        axisLeft={null}
        enableGridX={false}
        enableGridY={false}
        pointSize={10}
        pointColor='#2563EB' // Darker blue color for points
        pointBorderWidth={2}
        pointBorderColor='#2563EB' // Darker blue color for point borders
        pointLabelYOffset={-12}
        useMesh={true}
        enableArea={true}
        areaBaselineValue={0}
        enableSlices='x'
        colors={['#93C5FD']} // Light blue color for the line and area fill
        fillOpacity={0.2} // Opacity of the area fill
        sliceTooltip={({ slice }) => {
          const point = slice.points[0]
          return (
            <div
              style={{
                background: 'white',
                padding: '8px 12px',
                border: '1px solid #ccc',
              }}
            >
              <strong>{point.data.x}</strong>
              <br />
              {metric === 'Weight (lbs)'
                ? `${point.data.y} lbs`
                : `${point.data.y}%`}
            </div>
          )
        }}
      />
    </div>
  )
}

export default InBodyGraph
