import React from 'react'
import { twMerge } from 'tailwind-merge'

const ActionButton = ({
  onClick,
  buttonText,
  Icon,
  buttonClasses,
  iconClases,
  disabled,
}) => {
  return (
    <button
      className={twMerge(
        'flex items-center space-x-1.5 bg-blue-500 text-sm text-white hover:bg-blue-600 rounded-md py-1.5 px-3 transition-colors duration-300 disabled:bg-gray-400',
        buttonClasses
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon className={twMerge('size-5', iconClases)} />}
      <span>{buttonText}</span>
    </button>
  )
}

export default ActionButton
