import React, { useEffect, useState } from 'react'
import { GrTextAlignLeft } from 'react-icons/gr'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

const AnswerLoading = ({ className }) => {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const darkModePreference =
      window.localStorage.getItem('darkMode') === 'true'
    setDarkMode(darkModePreference)
  }, [])

  return (
    <div
      className={`px-0.5 text-black dark:text-primary-white mt-3 mb-1 ${className}`}
    >
      <div className='flex items-center text-green-500 mb-1 mt-3'>
        <GrTextAlignLeft className='text-xl' />
        <h1 className='text-lg ml-2 font-medium'>Answer</h1>
      </div>
      <SkeletonTheme
        baseColor={darkMode ? '#1C2026' : '#e4e4e7'}
        highlightColor={darkMode ? '#2D3540' : '#a1a1aa'}
      >
        <p className='text-base tracking-wide font-light leading-relaxed'>
          <Skeleton className='w-full' count={6} enableAnimation={true} />
        </p>
      </SkeletonTheme>
    </div>
  )
}

export default AnswerLoading
