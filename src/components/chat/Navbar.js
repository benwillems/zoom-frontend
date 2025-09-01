import React from 'react'
import { IoIosShareAlt } from 'react-icons/io'
import { useConversationContext } from '../context/ConversationProvider'
import { BiSolidCity } from 'react-icons/bi'

const Navbar = () => {
  const { selectedCounty } = useConversationContext()

  // selectedCounty will change to saved chat details
  // Conditonal will be added once we get saved chat name
  const countyIconSize = 'text-xl'
  const countyTextSize = 'text-lg'

  return (
    <div className='flex sticky top-0 justify-between bg-primary-dark items-center h-14 my-1 w-full px-1 text-zinc-500'>
      <div className='flex flex-col text-primary-light'>
        {/* <h1 className='text-lg ml-0.5'>Building Codes for Redmond</h1> */}
        {selectedCounty && (
          <div className='flex items-center mx-0'>
            <BiSolidCity className={`mr-1 ${countyIconSize}`} />
            <h1 className={countyTextSize}>{selectedCounty}</h1>
          </div>
        )}
      </div>
      <button className='flex items-center px-2 py-0.5 text-sm rounded-md shadow-md font-medium text-secondary-dark bg-green-500 hover:bg-green-600'>
        <IoIosShareAlt className='text-lg mr-1' />
        Share
      </button>
    </div>
  )
}

export default Navbar
