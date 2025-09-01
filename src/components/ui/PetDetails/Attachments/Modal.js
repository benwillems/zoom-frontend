import React from 'react'

const Modal = ({ isOpen, onClose, fileName, children }) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col justify-center items-center'>
      <div className='bg-white rounded-lg sm:mx-0 w-auto'>
        <div className='w-full uppercase py-2 px-3 font-bold bg-blue-300 rounded-t'>
          Viewing:{' '}
          <span className='underline underline-offset-4 decoration-dashed'>
            {fileName}
          </span>
        </div>
        <div className='m-1.5'>{children}</div>
        <div className='flex justify-end'>
          <button
            onClick={onClose}
            className='py-1 select-none uppercase text-base font-bold rounded-sm px-4 mr-5 mb-4 bg-blue-300 hover:bg-blue-200 text-black mt-2'
          >
            Close file viewer
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal
