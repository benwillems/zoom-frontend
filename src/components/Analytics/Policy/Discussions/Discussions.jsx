import React, { useState } from 'react'
import Select from 'react-select'
import dynamic from 'next/dynamic'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowRight,
  User,
  LineChart,
  Phone,
} from 'lucide-react'

const ResponsiveBar = dynamic(
  () => import('@nivo/bar').then(mod => mod.ResponsiveBar),
  { ssr: false, loading: () => <div>Loading chart...</div> }
)

const Discussions = ({ data }) => {
  const [viewLevel, setViewLevel] = useState({
    value: 'org',
    label: 'Organization Level',
  })

  const nutritionistOptions = [
    { value: 'org', label: 'Organization Level' },
    ...(data?.mentions?.topNutritionists?.map(nutritionist => ({
      value: nutritionist.name,
      label: nutritionist.name,
    })) || []),
  ]

  // Function to randomize data within a reasonable range
  const randomizeValue = originalValue => {
    if (viewLevel.value === 'org') return originalValue

    const variation = 0.3 // 30% variation
    const minFactor = 1 - variation
    const maxFactor = 1 + variation
    const randomFactor = minFactor + Math.random() * (maxFactor - minFactor)
    return Math.round(originalValue * randomFactor)
  }

  // Transform data for stacked bar chart with randomization
  const chartData = [
    ...(data?.discussions?.positiveResponses.map(response => {
      const randomizedTotal = randomizeValue(response.count)
      const randomizedConversions = randomizeValue(response.conversions)
      // Ensure converted doesn't exceed total
      const actualConversions = Math.min(randomizedConversions, randomizedTotal)
      return {
        statement: response.phrase,
        positive: randomizedTotal - actualConversions,
        converted: actualConversions,
      }
    }) || []),
    ...(data?.discussions?.negativeResponses.map(response => ({
      statement: response.phrase,
      negative: randomizeValue(response.count),
    })) || []),
  ]

  return (
    <div className='space-y-6'>
      {/* Response Analysis Charts */}
      <div className='bg-white rounded-lg border shadow-sm'>
        <div className='p-6 space-y-6'>
          <div className='flex justify-between items-start'>
            <div>
              <h2 className='text-xl font-semibold'>Response Analysis</h2>
              <p className='text-sm text-gray-500 mt-1'>
                Client responses to creatine discussions
                {viewLevel.value !== 'org' && ` - ${viewLevel.label}`}
              </p>
            </div>
            <div className='w-64'>
              <Select
                value={viewLevel}
                onChange={setViewLevel}
                options={nutritionistOptions}
                className='text-sm'
                isSearchable={false}
              />
            </div>
          </div>

          {/* Marimekko Chart */}
          <div style={{ height: '400px' }}>
            <ResponsiveBar
              data={chartData}
              keys={['converted', 'positive', 'negative']}
              indexBy='statement'
              margin={{ top: 20, right: 150, bottom: 120, left: 60 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={['#22c55e', '#93c5fd', '#ef4444']}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 0.2]],
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Response Types',
                legendPosition: 'middle',
                legendOffset: 100,
              }}
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
              label={d => `${d.value}`}
              labelTextColor='#ffffff'
              tooltip={({ indexValue, value, id }) => (
                <div className='bg-gray-800 text-white px-3 py-2 rounded-md text-sm'>
                  <strong>{indexValue}</strong>
                  <br />
                  {id === 'converted'
                    ? 'Converted Sales'
                    : id === 'positive'
                    ? 'Positive Response'
                    : 'No Sales'}
                  : {value}
                </div>
              )}
              legends={[
                {
                  dataFrom: 'keys',
                  anchor: 'right',
                  direction: 'column',
                  justify: false,
                  translateX: 120,
                  translateY: 0,
                  itemsSpacing: 4,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemDirection: 'left-to-right',
                  itemOpacity: 0.85,
                  symbolSize: 20,
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemOpacity: 1,
                      },
                    },
                  ],
                  data: [
                    {
                      id: 'converted',
                      label: 'Converted Sales',
                      color: '#22c55e',
                    },
                    {
                      id: 'positive',
                      label: 'Positive Response',
                      color: '#93c5fd',
                    },
                    {
                      id: 'negative',
                      label: 'No Sales',
                      color: '#ef4444',
                    },
                  ],
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Response Phrases and Objections Grid */}
      <div className='grid grid-cols-2 gap-6'>
        {/* Positive Response Phrases */}
        <div className='bg-white rounded-lg border shadow-sm'>
          <div className='p-6'>
            <h2 className='text-xl font-semibold'>Positive Response Phrases</h2>
            <p className='text-sm text-gray-500 mt-1'>
              Key phrases indicating client interest
            </p>
            <div className='mt-4 space-y-3'>
              {data?.discussions?.positiveResponses.map((response, index) => (
                <div
                  key={index}
                  className='flex items-start space-x-2 text-green-600'
                >
                  <ArrowUpIcon className='h-5 w-5 mt-0.5' />
                  <span className='text-gray-800'>"{response.phrase}"</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Common Objections */}
        <div className='bg-white rounded-lg border shadow-sm'>
          <div className='p-6'>
            <h2 className='text-xl font-semibold'>Common Objections</h2>
            <p className='text-sm text-gray-500 mt-1'>
              Frequent concerns raised during discussions
            </p>
            <div className='mt-4 space-y-3'>
              {data?.discussions?.negativeResponses.map((objection, index) => (
                <div
                  key={index}
                  className='flex items-start space-x-2 text-red-600'
                >
                  <ArrowDownIcon className='h-5 w-5 mt-0.5' />
                  <span className='text-gray-800'>"{objection.phrase}"</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Effective Discussion Techniques */}
      <div className='bg-white rounded-lg border shadow-sm'>
        <div className='p-6'>
          <h2 className='text-xl font-semibold'>
            Effective Discussion Techniques
          </h2>
          <p className='text-sm text-gray-500 mt-1'>
            Strategies for engaging clients
          </p>
          <div className='mt-4 space-y-3'>
            {data?.discussions?.effectiveDiscussionTechniques.map(
              (technique, index) => (
                <div key={index} className='flex items-start space-x-2'>
                  <ArrowRight className='h-5 w-5 mt-0.5' />
                  <div>
                    <span className='font-medium'>{technique.technique}</span>
                    <span className='text-sm text-gray-500 ml-2'>
                      Success Rate: {technique.successRate}%
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Discussions
