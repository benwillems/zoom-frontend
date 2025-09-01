import React from 'react'
import { BiSolidDownArrow } from 'react-icons/bi'

const IconMetricUpOrDown = ({ isPositive }) => {
  return (
    <BiSolidDownArrow
      className={`size-4 ${
        isPositive ? 'text-[#5FF880] rotate-180' : 'text-[#F47362]'
      } `}
    />
  )
}

const MetricsCard = ({
  title,
  icon: Icon,
  metricValue,
  isPositive,
  displayIcon,
  metricChange,
  isPercentage = true,
  unit,
}) => {
  const formattedChange = isPercentage
    ? `${metricChange > 0 ? '+' : ''}${metricChange}% from last month`
    : `${metricChange > 0 ? '+' : ''}${metricChange}${
        unit || ''
      } from last month`

  return (
    <div className='flex flex-col w-auto h-44 p-6 border rounded-md bg-white'>
      <div className='flex justify-between items-center'>
        <h1 className='text-lg font-medium'>{title}</h1>
        <Icon className='size-5 text-gray-600' />
      </div>
      <div className='mt-auto space-y-0.5'>
        <p className='text-2xl font-bold'>{metricValue}</p>
        <div className='flex items-center space-x-1.5'>
          {/* {displayIcon && <IconMetricUpOrDown isPositive={isPositive} />}
          <p className='text-gray-600 text-sm'>{formattedChange}</p> */}
        </div>
      </div>
    </div>
  )
}

export default MetricsCard
