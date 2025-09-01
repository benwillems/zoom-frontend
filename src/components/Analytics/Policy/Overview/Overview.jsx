import React from 'react'
import MetricsCard from '@/components/Analytics/Policy/common/MetricsCard'
import { ArrowRight } from 'lucide-react'

const Overview = ({ data, icons }) => {
  const { metrics, actionInsights } = data

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 lg:grid-cols-2 gap-4'>
        {Object.entries(metrics).map(([key, metricData]) => (
          <MetricsCard
            key={key}
            title={metricData.title}
            metricValue={metricData.value}
            metricChange={metricData.change}
            icon={icons[key]}
            displayIcon={metricData.displayIcon}
            isPositive={metricData.isPositive}
            isPercentage={true}
          />
        ))}
      </div>

      <div className='bg-white rounded-lg border shadow-sm'>
        <div className='p-6'>
          <h2 className='text-xl font-semibold'>Action Insights</h2>
          <p className='text-sm text-gray-500 mt-1'>
            Recommended actions to improve sales performance
          </p>
        </div>
        <div className='px-6 pb-6'>
          <div className='space-y-4'>
            {actionInsights.map((insight, index) => (
              <div key={index} className='flex items-start space-x-3'>
                <ArrowRight className='h-5 w-5 mt-0.5 flex-shrink-0' />
                <span className='text-sm'>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Overview
