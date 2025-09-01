import useClientStore from '@/store/clientStore'
import React from 'react'

const TabNavigation = () => {
  const { clientCurrentTab, setClientCurrentTab } = useClientStore()

  const TABS = [
    { name: 'Overview', id: 'overview' },
    { name: 'Check-Ins', id: 'checkin' },
    // { name: 'Metrics', id: 'metrics' },
  ]

  return (
    <div className='flex w-full px-4 py-4 space-x-4'>
      {TABS.map(tab => {
        return (
          <div
            key={tab.id}
            className={`cursor-pointer rounded-md ${
              clientCurrentTab == tab.id
                ? 'bg-blue-100 text-blue-600'
                : 'hover:bg-gray-200'
            }`}
            onClick={() => setClientCurrentTab(tab.id)}
          >
            <div className='py-1.5 px-5 font-semibold'>{tab.name}</div>
          </div>
        )
      })}
    </div>
  )
}

export default TabNavigation
