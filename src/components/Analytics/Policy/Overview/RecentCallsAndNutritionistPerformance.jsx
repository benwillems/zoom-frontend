import React, { useState } from 'react'
import NutritionistPerformance from './NutritionistsPerformance'
import { Phone } from 'lucide-react'

const TabButton = ({ active, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`pb-4 text-sm font-medium relative ${
        active
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  )
}

const RecentCallItem = ({
  nutritionist,
  client,
  duration,
  tone,
  type,
  time,
}) => {
  return (
    <div className='flex items-center justify-between first:pt-0 last:pb-0 py-2.5 border-b last:border-b-0'>
      <div className='space-y-0.5'>
        <p className='font-medium'>
          {nutritionist} with {client}
        </p>
        <div className='flex items-center gap-1.5 text-sm text-gray-500'>
          <span>{duration} minutes</span>
          <span>•</span>
          <span
            className={tone === 'Positive' ? 'text-green-500' : 'text-red-500'}
          >
            {tone} tone
          </span>
          <span>•</span>
          <span>{type}</span>
        </div>
      </div>
      <span className='text-sm font-medium'>{time} ago</span>
    </div>
  )
}

const RecentCallsAndNutritionistPerformance = ({ recentCalls }) => {
  const [activeTab, setActiveTab] = useState('recent-calls')

  // Convert time string to minutes for sorting
  const timeToMinutes = timeStr => {
    const value = parseInt(timeStr)
    if (timeStr.includes('m')) return value
    if (timeStr.includes('h')) return value * 60
    return value
  }

  // Sort calls by time (most recent first)
  const sortedCalls = [...recentCalls].sort((a, b) => {
    return timeToMinutes(a.time) - timeToMinutes(b.time)
  })

  return (
    <div className='bg-white rounded-lg shadow-sm border p-6 h-[500px] flex flex-col relative'>
      {/* Call Amount For the Day */}
      {/* {activeTab === 'recent-calls' && (
        <div className='absolute right-0 top-0 mt-4 mr-6 h-8 w-20 rounded-md border border-black border-opacity-20 flex items-center justify-center space-x-3'>
          <p className=' text-gray-600 font-bold text-sm'>
            {sortedCalls?.length}
          </p>
          <Phone className='size-3.5 text-gray-600' />
        </div>
      )} */}
      {/* Custom tabs */}
      <div className='border-b'>
        <div className='flex space-x-6'>
          <TabButton
            active={activeTab === 'recent-calls'}
            onClick={() => setActiveTab('recent-calls')}
          >
            Recent Calls
          </TabButton>
          <TabButton
            active={activeTab === 'performance'}
            onClick={() => setActiveTab('performance')}
          >
            Nutritionist Performance
          </TabButton>
        </div>
      </div>

      {/* Tab content */}
      <div className='mt-6 flex-1 overflow-hidden'>
        {activeTab === 'recent-calls' ? (
          <div className='h-full'>
            <div className='space-y-0.5 overflow-y-auto h-[calc(100%-2rem)]'>
              {sortedCalls.map((call, index) => (
                <RecentCallItem key={index} {...call} />
              ))}
            </div>
          </div>
        ) : (
          <NutritionistPerformance />
        )}
      </div>
    </div>
  )
}

export default RecentCallsAndNutritionistPerformance
