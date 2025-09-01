import React from 'react'
import { BsCardChecklist } from 'react-icons/bs'

const ReferencesLoading = () => {
  return (
    <div className='flex flex-col justify-start'>
      <div className='flex items-center text-green-500 mb-1 mt-3'>
        <BsCardChecklist className='text-xl' />
        <h1 className='text-lg ml-2 font-medium'>References</h1>
      </div>
      <div className='flex flex-wrap'>
        {Array(3)
          .fill()
          .map((_, index) => {
            return (
              <div
                key={index}
                className='flex flex-col justify-between w-44 h-14 text-zinc-600 bg-zinc-200 border-zinc-200 dark:bg-secondary-dark border dark:border-primary-dark-light rounded-md px-1 py-1 mr-2 my-1 cursor-pointer animate-pulse'
              ></div>
            )
          })}
      </div>
    </div>
  )
}

export default ReferencesLoading
