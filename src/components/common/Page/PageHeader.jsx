import React from 'react'

const PageHeader = ({ title, description }) => {
  return (
    <div className='mb-6'>
      <h1 className='text-3xl font-bold text-gray-900'>{title}</h1>
      <p className='text-base text-gray-600'>{description}</p>
    </div>
  )
}

export default PageHeader
