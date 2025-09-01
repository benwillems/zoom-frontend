import React, { useEffect, useRef } from 'react'
import useNotificationStore from '@/store/useNotificationStore'

const Notification = ({
  id,
  header,
  description,
  icon: Icon,
  iconColor,
  hideProgressBar,
  notificationDisplayTimer = 4000,
}) => {
  const removeNotification = useNotificationStore(
    state => state.removeNotification
  )
  const progressRef = useRef(null)

  useEffect(() => {
    if (!hideProgressBar) {
      const startTime = Date.now()
      const timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime
        const progress = Math.min(elapsedTime / notificationDisplayTimer, 1)
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${1 - progress})`
        }
        if (progress === 1) {
          clearInterval(timer)
          removeNotification(id)
        }
      }, 100)

      return () => {
        clearInterval(timer)
      }
    }
  }, [id, removeNotification, hideProgressBar])

  return (
    <div className='bg-white rounded-md shadow-md p-4 relative overflow-hidden ring-1 ring-opacity-10 ring-gray-700'>
      <div className='flex items-start'>
        {Icon && (
          <Icon
            className={`flex-shrink-0 mr-3 h-4 w-4 text-${iconColor}-500 ${
              header ? 'mt-1' : 'mt-0.5'
            }`}
          />
        )}
        <div className='mr-4'>
          {header && (
            <h3 className='text-base text-gray-600 font-semibold mb-1 mr-2'>
              {header}
            </h3>
          )}
          <p
            className={`text-sm ${
              header ? 'text-gray-500' : 'text-gray-900'
            } text-gray-600`}
          >
            {description}
          </p>
        </div>
        <button
          className='ml-auto text-gray-500 hover:text-gray-700 focus:outline-none'
          onClick={() => removeNotification(id)}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>
      {!hideProgressBar && (
        <div className='absolute bottom-0 left-0 right-0 h-1 bg-blue-100'>
          <div
            ref={progressRef}
            className='h-full bg-blue-300 transform origin-left transition-transform duration-15000 ease-linear'
          ></div>
        </div>
      )}
    </div>
  )
}

export default Notification
