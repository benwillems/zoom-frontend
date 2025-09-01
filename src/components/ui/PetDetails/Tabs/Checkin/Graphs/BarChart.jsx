import React from 'react'
import dynamic from 'next/dynamic'

const ResponsiveBarCanvas = dynamic(
  () => import('@nivo/bar').then(module => module.ResponsiveBarCanvas),
  { ssr: false }
)

const BarChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return <div>No data available for {title}</div>
  }

  // Modify the data to use an index instead of the full response
  const modifiedData = data.data.map((item, index) => ({
    ...item,
    index: index.toString(),
  }))

  return (
    <div style={{ height: '320px', width: '600px' }}>
      <h3 className='text-lg font-semibold border-l-4 border-blue-400 text-left pl-4'>
        {title}
      </h3>
      <ResponsiveBarCanvas
        data={modifiedData}
        keys={data?.keys}
        indexBy='index'
        margin={{ top: 40, right: 130, bottom: 20, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'nivo' }}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 1.6]],
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={null} // This will completely remove the bottom axis
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Count',
          legendPosition: 'middle',
          legendOffset: -40,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: 'color',
          modifiers: [['darker', 1.6]],
        }}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 15,
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
        role='application'
        ariaLabel='Nivo bar chart demo'
        tooltip={({ value, data }) => (
          <div
            style={{
              background: 'white',
              padding: '9px 12px',
              border: '1px solid #ccc',
            }}
          >
            <strong>{data.response}</strong>
            <br />
            Count: {value}
          </div>
        )}
      />
    </div>
  )
}

export default BarChart
