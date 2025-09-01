import React, { useState, useEffect, useRef } from 'react'
import { BiSolidCity, BiSolidDownArrow } from 'react-icons/bi'
import { useConversationContext } from '../context/ConversationProvider'

const CountyDropdown = () => {
  const { selectedCounty, setSelectedCounty } = useConversationContext()
  // const availableCounties = [{ label: 'Redmond', value: 'RedmondExpirement5' }]
  const availableCounties = [{ label: 'Mckinstry', value: 'Mckinstry' }]
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const defaultCounty = 'Mckinstry'

  useEffect(() => {
    if (!selectedCounty) {
      setSelectedCounty(defaultCounty)
    }
  }, [])

  useEffect(() => {
    const checkIfClickedOutside = e => {
      if (
        showDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', checkIfClickedOutside)

    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside)
    }
  }, [showDropdown])

  const toggleDropdown = () => setShowDropdown(!showDropdown)

  const selectCounty = county => {
    setSelectedCounty(county)
    setShowDropdown(false)
  }

  return (
    <div className='relative flex items-center' ref={dropdownRef}>
      <BiSolidCity className='text-lg xl:text-2xl mr-2 text-zinc-500 dark:text-primary-light' />
      <div
        className='h-8 w-40 dark:bg-primary-dark flex border border-zinc-300 dark:border-secondary-dark-light rounded items-center'
        onClick={toggleDropdown}
      >
        <input
          value={defaultCounty}
          name='select'
          id='select'
          className='px-2 appearance-none outline-none text-zinc-600 dark:bg-primary-dark dark:text-primary-light w-full cursor-pointer placeholder:text-zinc-600 dark:placeholder:text-primary-light'
          readOnly
          // required
          // placeholder='Choose a city...'
        />

        <BiSolidDownArrow className='mr-1 text-sm text-zinc-600 dark:text-primary-light cursor-pointer' />
      </div>

      {showDropdown && (
        <div className='absolute top-0 rounded shadow bg-white dark:bg-primary-dark overflow-hidden flex flex-col w-full mt-10 border border-zinc-300 dark:border-secondary-dark-light'>
          {availableCounties.map(county => (
            <div
              key={county}
              className='cursor-pointer group dark:border-t-secondary-dark-light'
              onClick={() => selectCounty(county.value)}
            >
              <a className='block p-2 border-transparent border-l-4 text-zinc-600 border-t-secondary-dark-light dark:text-primary-light group-hover:border-green-500 group-hover:bg-lt-primary-off-white dark:group-hover:bg-zinc-800'>
                {county.label}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CountyDropdown
