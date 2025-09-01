import React, { useState } from 'react'
import { Clock, ArrowUpRight, X } from 'lucide-react'

const NutritionistItem = ({ nutritionist, metrics, onViewDetails }) => {
  return (
    <div className='flex items-center justify-between first:pt-0 last:pb-0 py-2.5 border-b last:border-b-0'>
      <div className='space-y-0.5'>
        <p className='font-medium'>{nutritionist}</p>
        <div className='flex items-center gap-1.5 text-sm text-gray-500'>
          <span>Avg. Call Duration: {metrics.duration}</span>
          <span>•</span>
          <span>Conversion Rate: {metrics.conversionRate}</span>
          <span>•</span>
          <span>Client Satisfaction: {metrics.satisfaction}</span>
        </div>
      </div>
      <button
        onClick={() => onViewDetails(nutritionist)}
        className='text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-7'
      >
        Details
        <ArrowUpRight className='w-4 h-4' />
      </button>
    </div>
  )
}

const DetailsDrawer = ({ nutritionist, onClose, isOpen }) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-[40%] z-30 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl font-semibold'>{nutritionist}</h2>
            <button
              onClick={onClose}
              className='text-gray-500 hover:text-gray-700'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          <div className='space-y-6'>
            <div>
              <h3 className='text-sm font-medium text-gray-500 mb-2'>
                Performance Metrics
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div className='p-4 bg-gray-50 rounded-lg'>
                  <p className='text-sm text-gray-500'>Total Calls</p>
                  <p className='text-xl font-semibold'>124</p>
                </div>
                <div className='p-4 bg-gray-50 rounded-lg'>
                  <p className='text-sm text-gray-500'>Avg Duration</p>
                  <p className='text-xl font-semibold'>38m</p>
                </div>
                <div className='p-4 bg-gray-50 rounded-lg'>
                  <p className='text-sm text-gray-500'>Conversion Rate</p>
                  <p className='text-xl font-semibold'>72%</p>
                </div>
                <div className='p-4 bg-gray-50 rounded-lg'>
                  <p className='text-sm text-gray-500'>Satisfaction</p>
                  <p className='text-xl font-semibold'>4.7</p>
                </div>
              </div>
            </div>

            {/* Add more sections as needed */}
          </div>
        </div>
      </div>
    </>
  )
}

const NutritionistPerformance = () => {
  const [selectedNutritionist, setSelectedNutritionist] = useState(null)

  const nutritionists = [
    {
      name: 'Alice Johnson',
      metrics: {
        duration: '44m',
        conversionRate: '95%',
        satisfaction: '5.0',
      },
    },
    {
      name: 'Bob Smith',
      metrics: {
        duration: '38m',
        conversionRate: '78%',
        satisfaction: '4.7',
      },
    },
    {
      name: 'Carol Williams',
      metrics: {
        duration: '32m',
        conversionRate: '85%',
        satisfaction: '4.9',
      },
    },
  ]

  const handleViewDetails = nutritionist => {
    setSelectedNutritionist(nutritionist)
  }

  const handleCloseDrawer = () => {
    setSelectedNutritionist(null)
  }

  return (
    <div className='h-full z-50'>
      <div className='space-y-0.5 overflow-y-auto h-[calc(100%-2rem)]'>
        {nutritionists.map(item => (
          <NutritionistItem
            key={item.name}
            nutritionist={item.name}
            metrics={item.metrics}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      <DetailsDrawer
        nutritionist={selectedNutritionist}
        isOpen={!!selectedNutritionist}
        onClose={handleCloseDrawer}
      />
    </div>
  )
}

export default NutritionistPerformance
