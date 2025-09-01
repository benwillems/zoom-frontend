import React, { useState } from 'react'

const Alert = ({
  title,
  message,
  onCancel,
  onConfirm,
  Icon,
  buttonActionText,
}) => {
  const [show, setShow] = useState(true)

  const handleCancel = () => {
    setShow(false)
    if (onCancel) onCancel()
  }

  const handleConfirm = () => {
    setShow(false)
    if (onConfirm) onConfirm()
  }

  // Only render if `show` is true
  return show ? (
    <div className='fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 px-2'>
      <div className='relative top-8 m-4 p-3 border max-w-md shadow-lg rounded-md bg-white mx-auto mt-5'>
        <div className='text-center'>
          <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100'>
            <Icon className='h-6 w-6 text-red-600' />
          </div>
          <h3 className='text-lg sm:text-xl leading-6 font-medium text-gray-900'>
            {title}
          </h3>
          <div className='mt-2 px-0 sm:px-7 py-3'>
            <p className='text-sm sm:text-base text-gray-600'>{message}</p>
          </div>
          <div className='flex justify-center gap-4 px-4 py-3'>
            <button
              id='cancel-btn'
              className='px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300'
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              id='confirm-btn'
              className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
              onClick={handleConfirm}
            >
              {buttonActionText || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null
}

export default Alert
