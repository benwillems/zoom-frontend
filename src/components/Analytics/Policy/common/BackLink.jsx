import Link from 'next/link'
import React from 'react'
import { BsArrowLeft } from 'react-icons/bs'

const BackLink = ({ href, title }) => {
  return (
    <Link className='inline-flex items-center space-x-3' href={`/${href}`}>
      <div className='flex items-center justify-center size-7 bg-blue-100 rounded-full '>
        <BsArrowLeft className='text-blue-600 text-lg' />
      </div>
      <h1 className='text-sm font-semibold'>{title}</h1>
    </Link>
  )
}

export default BackLink
