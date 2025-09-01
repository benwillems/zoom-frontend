import { useState } from 'react'

const KebabMenu = ({ index }) => {
  // Write a function to delete specifc row from table

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleKebabMenuClick = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <div className='relative inline-block'>
      <button
        className='text-gray-500 hover:text-gray-700 focus:outline-none'
        onClick={handleKebabMenuClick}
      >
        {/* Kebab menu icon */}
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6 text-black'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z'
          />
        </svg>
      </button>
      <div
        className={`absolute items-center right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 ${
          isDropdownOpen ? 'block' : 'hidden'
        }`}
        onMouseLeave={() => setIsDropdownOpen(false)}
      >
        <div className='block px-6 py-2 text-sm text-gray-700 hover:bg-gray-100'>
          Remove
        </div>
      </div>
    </div>
  )
}

export default KebabMenu
