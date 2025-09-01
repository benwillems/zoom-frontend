import useConversationStore from '@/store/useConversationStore'
import React from 'react'
import ProfileIcon from './ProfileIcon'
import { MdOutlineEmail } from 'react-icons/md'
import { AiOutlinePhone } from 'react-icons/ai'
import Link from 'next/link'
import { FiExternalLink } from 'react-icons/fi'
import { IoPersonOutline } from 'react-icons/io5'

const ContactDetails = () => {
  const { selectedConversation } = useConversationStore()

  if (!selectedConversation) return null

  return (
    <div className='flex flex-col'>
      <div className='flex flex-col items-center justify-center space-y-4 pt-8 pb-20'>
        {selectedConversation?.name && (
          <ProfileIcon name={selectedConversation?.name} size={10} />
        )}
        <Link
          href={`/clientDetails/${selectedConversation?.id}`}
          className='flex items-center space-x-3 cursor-pointer'
        >
          <h1 className='text-lg font-medium'>{selectedConversation?.name}</h1>
          <FiExternalLink className='size-5 text-blue-600' />
        </Link>
      </div>

      <div className='border-t pt-3 px-5 space-y-5'>
        <div>
          <p className=' text-lg text-gray-700 font-medium'>Contact</p>
        </div>
        <div className='pb-2'>
          <div className='flex items-center space-x-1.5 text-gray-500'>
            <MdOutlineEmail className='h-[18px] w-[18px]' />
            <p className='text-base font-medium'>Email</p>
          </div>
          <p className='text-base text-gray-600 px-0.5'>
            {selectedConversation?.email}
          </p>
        </div>
        <div className='border-b pb-5'>
          <div className='flex items-center space-x-1.5 text-gray-500'>
            <AiOutlinePhone className='size-5 rotate-90' />
            <p className='text-base font-medium'>Phone</p>
          </div>
          <p className='text-base text-gray-600 px-0.5'>
            {selectedConversation?.phone}
          </p>
        </div>
      </div>

      {/* <div className='border-b py-5 px-5'>
        <div className='flex items-center space-x-1.5 text-gray-500'>
          <IoPersonOutline className='h-[17px] w-[17px]' />
          <p className='text-base font-medium'>Owner (Assigned to)</p>
        </div>
        <div className='flex items-center space-x-2 pt-2'>
          <ProfileIcon name={'Corey Hughes'} size={8} />
          <p className='text-base text-gray-600 px-0.5'>Corey Hughes</p>
        </div>
      </div> */}
    </div>
  )
}

export default ContactDetails
