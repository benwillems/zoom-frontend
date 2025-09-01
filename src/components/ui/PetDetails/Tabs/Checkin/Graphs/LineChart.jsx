import React from 'react'
import dynamic from 'next/dynamic'

const ResponsiveLineCanvas = dynamic(
  () => import('@nivo/line').then(module => module.ResponsiveLineCanvas),
  { ssr: false }
)

const LineChart = ({ data, title }) => {
  return (
    <div style={{ height: '320px', width: '620px' }}>
      <h3 className='text-lg font-semibold border-l-4 border-blue-500 text-left pl-4 mb-4'>
        {title}
      </h3>
      <ResponsiveLineCanvas
        data={data}
        margin={{ top: 30, right: 140, bottom: 90, left: 70 }}
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: true,
          reverse: false,
        }}
        yFormat=' >-.2f'
        axisTop={null}
        axisRight={null}
        axisBottom={{
          orient: 'bottom',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -55,
          legend: 'Date',
          legendOffset: 70,
          legendPosition: 'middle',
        }}
        axisLeft={{
          orient: 'left',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Rating',
          legendOffset: -55,
          legendPosition: 'middle',
        }}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.8,
            symbolSize: 13,
            symbolShape: 'circle',
            symbolBorderColor: 'rgba(0, 0, 0, .5)',
            effects: [
              {
                on: 'hover',
                style: {
                  itemBackground: 'rgba(0, 0, 0, .03)',
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </div>
  )
}

export default LineChart
