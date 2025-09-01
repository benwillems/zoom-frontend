import React, { useState, useEffect, useRef } from 'react'

const MobileTooltip = ({ message, children, duration = 3000, disabled }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef(null)

  useEffect(() => {
    if (showTooltip && disabled) {
      const timer = setTimeout(() => {
        setShowTooltip(false)
      }, duration)

      return () => clearTimeout(timer)
    } else if (showTooltip && !disabled) {
      setShowTooltip(false)
    }
  }, [showTooltip, duration, disabled])

  const handlePress = () => {
    if (disabled) {
      setShowTooltip(true)
    }
  }

  return (
    <div className='relative inline-block select-none'>
      <div
        className='inline-block'
        onTouchStart={handlePress}
        onMouseDown={handlePress}
      >
        {children}
      </div>
      {showTooltip && disabled && (
        <div
          ref={tooltipRef}
          className='absolute left-1/2 transform ml-14 -translate-x-1/2 mt-0 w-60 text-center text-sm bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg drop-shadow-md z-10'
        >
          {message}
        </div>
      )}
    </div>
  )
}

export default MobileTooltip
