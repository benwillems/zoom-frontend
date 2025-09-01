import React, { useState } from 'react'
import NutritionistPerformanceTable from './NutritionistPerformanceTable'
import Select from 'react-select'
import dynamic from 'next/dynamic'

const ResponsiveBar = dynamic(
  () => import('@nivo/bar').then(mod => mod.ResponsiveBar),
  { ssr: false, loading: () => <div>Loading chart...</div> }
)

const Mentions = ({ data }) => {
  const [viewLevel, setViewLevel] = useState({
    value: 'org',
    label: 'Organization Level',
  })

  const nutritionistOptions = [
    { value: 'org', label: 'Organization Level' },
    ...data.topNutritionists.map(nutritionist => ({
      value: nutritionist.name,
      label: nutritionist.name,
    })),
  ]

  const getChartData = () => {
    if (viewLevel.value === 'org') {
      return data.entryPoints.map(point => ({
        point: point.point,
        effectiveness: point.effectiveness,
      }))
    } else {
      const nutritionistData = data.entryPoints.map(point => ({
        point: point.point,
        effectiveness: Math.trunc(
          point.effectiveness * (Math.random() * (1.2 - 0.8) + 0.8)
        ),
      }))
      return nutritionistData
    }
  }

  return (
    <div className='space-y-6'>
      {/* Performance Table */}
      <NutritionistPerformanceTable data={data} />

      {/* Entry Points Bar Chart */}
      <div className='bg-white rounded-lg border shadow-sm'>
        <div className='p-6 space-y-6'>
          <div className='flex justify-between items-start'>
            <div>
              <h2 className='text-xl font-semibold'>
                Most Effective Conversation Entry Points
              </h2>
              <p className='text-sm text-gray-500 mt-1'>
                Best contexts for introducing creatine
                {viewLevel.value !== 'org' && ` - ${viewLevel.label}`}
              </p>
            </div>
            <div className='w-64'>
              {' '}
              {/* Fixed width for select */}
              <Select
                value={viewLevel}
                onChange={setViewLevel}
                options={nutritionistOptions}
                className='text-sm'
                classNamePrefix='select'
                isSearchable={false}
                placeholder='Select View'
              />
            </div>
          </div>
        </div>
        <div className='px-6 pb-6'>
          <div style={{ height: '400px' }}>
            <ResponsiveBar
              data={getChartData()}
              keys={['effectiveness']}
              indexBy='point'
              margin={{ top: 10, right: 30, bottom: 30, left: 150 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              layout='horizontal'
              colors='#3B82F6'
              borderRadius={4}
              borderWidth={1}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 0.2]],
              }}
              enableGridY={false}
              axisTop={null}
              axisRight={null}
              labelSkipWidth={12}
              labelSkipHeight={12}
              label={d => `${d.value}%`}
              labelTextColor='#ffffff'
              labelStyle={{
                fontWeight: 'bold',
                fontSize: 13,
              }}
              role='application'
              ariaLabel='Entry Points Effectiveness'
              barAriaLabel={e =>
                e.id + ': ' + e.formattedValue + ' effectiveness'
              }
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fontSize: 13,
                    },
                  },
                },
              }}
              tooltip={({ indexValue, value }) => (
                <div className='bg-gray-800 text-white px-3 py-2 rounded-md text-sm'>
                  <strong>{indexValue}</strong>: {value}%
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Mentions
