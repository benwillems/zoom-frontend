import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi'
import InBodyGraph from '../../Graphs/InbodyGraphs'

const InBodyCard = ({ data, metric }) => {
  // Calculate the average
  const average =
    data[0].data.reduce((sum, entry) => sum + entry.y, 0) / data[0].data.length

  // Calculate the percentage change
  const firstValue = data[0].data[0].y
  const lastValue = data[0].data[data[0].data.length - 1].y
  const percentageChange = ((lastValue - firstValue) / firstValue) * 100

  // Determine the trend and color based on the metric
  let trend, color
  if (metric === 'Skeletal Muscle Mass (%)') {
    trend = percentageChange >= 0 ? 'increase' : 'decrease'
    color = trend === 'increase' ? 'text-green-500' : 'text-red-500'
  } else {
    trend = percentageChange >= 0 ? 'increase' : 'decrease'
    color = trend === 'increase' ? 'text-red-500' : 'text-green-500'
  }

  // Format the percentage change without the sign
  const formattedPercentageChange = `${Math.abs(percentageChange).toFixed(2)}%`

  return (
    <div className='flex flex-col h-44 w-auto justify-center items-center py-2 px-8 border rounded-3xl'>
      <h3 className='flex justify-start w-full pb-1 text-sm font-semibold'>
        {metric}
      </h3>
      <div className='flex justify-start items-center pb-4 w-full space-x-1'>
        <p className='flex justify-start text-2xl font-bold'>
          {average.toFixed(2)}
        </p>
        <div className='flex items-center mt-auto space-x-0.5'>
          {trend === 'increase' ? (
            <FiArrowUpRight className={`${color} size-5`} />
          ) : (
            <FiArrowDownRight className={`${color} size-5`} />
          )}
          <p className={`flex justify-start text-lg font-semibold ${color}`}>
            {formattedPercentageChange}
          </p>
        </div>
      </div>
      <div className='flex flex-col h-20 md:h-28 md:w-32 lg:w-40 xl:w-60 2xl:w-72'>
        <InBodyGraph data={data} metric={metric} />
      </div>
    </div>
  )
}

export default InBodyCard
