import useConversationStore from '@/store/useConversationStore'
import React from 'react'
import ProfileIcon from './ProfileIcon'

const InboxItem = ({ id, name, time, message, unreadCount, onClick }) => {
  const { selectedConversation } = useConversationStore()

  let isMatch = id == selectedConversation?.id

  return (
    <div
      className={`flex items-start px-4 py-3 border-b border-gray-200 ${
        !isMatch ? 'hover:bg-gray-100' : ''
      } cursor-pointer select-none ${isMatch ? 'bg-gray-200' : ''} relative`}
      onClick={onClick}
    >
      {isMatch && (
        <div className='absolute right-0 top-0 bottom-0 w-1 bg-blue-500'></div>
      )}
      <ProfileIcon name={name} size={10} className='mt-1' />
      <div className='ml-4 flex-1 min-w-0'>
        <div className='flex justify-between items-start'>
          <div className='flex flex-col'>
            <h4 className='text-sm font-semibold truncate'>{name}</h4>
            <p className='text-xs text-gray-500 truncate mt-1'>{message}</p>
          </div>
          <div className='flex flex-col items-end ml-2 flex-shrink-0'>
            <span className='text-xs text-gray-500'>{time}</span>
            {unreadCount > 0 && (
              <span className='bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full mt-1'>
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InboxItem
