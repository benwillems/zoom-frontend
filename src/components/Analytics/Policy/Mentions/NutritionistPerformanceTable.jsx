import React from 'react'

const NutritionistPerformanceTable = ({ data }) => {
  // Destructure to get topNutritionists from the data prop
  const nutritionists = data?.topNutritionists || []

  return (
    <div className='space-y-6'>
      <div className='bg-white rounded-lg border shadow-sm'>
        <div className='p-6'>
          <h2 className='text-xl font-semibold'>
            Top Performing Nutritionists
          </h2>
          <p className='text-sm text-gray-500 mt-1'>
            Highest mention and conversion rates
          </p>
        </div>
        <div className='px-6 pb-6'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='text-left border-b'>
                  <th className='pb-2 font-medium'>Name</th>
                  <th className='pb-2 font-medium'>Mention Rate</th>
                  <th className='pb-2 font-medium'>Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {nutritionists.map((nutritionist, index) => (
                  <tr
                    key={index}
                    className={`${
                      index !== nutritionists.length - 1 ? 'border-b' : ''
                    }`}
                  >
                    <td className='py-3'>{nutritionist.name}</td>
                    <td className='py-3'>{nutritionist.mentionRate}%</td>
                    <td className='py-3'>{nutritionist.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NutritionistPerformanceTable
