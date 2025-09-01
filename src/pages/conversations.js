import ContactDetails from '@/components/ui/Conversations/ContactDetails'
import ConversationDetails from '@/components/ui/Conversations/ConversationDetails'
import Inbox from '@/components/ui/Conversations/Inbox'
import useConversationStore from '@/store/useConversationStore'
import React from 'react'
import { HiChatBubbleOvalLeft } from 'react-icons/hi2'

const Conversation = () => {
  const { selectedConversation, conversations } = useConversationStore()

  return (
    <div className='h-[88.5vh]'>
      {/* Header Section */}
      <div className='px-2 sm:p-6'>
        <div>
          <h3 className='text-3xl font-bold text-gray-900'>Conversations</h3>
          <p className='text-base text-gray-600'>
            Interact with clients through SMS.
          </p>
        </div>
      </div>

      {/* Main Flex Container */}
      <div className='flex h-full border border-t'>
        {/* Left Section: Conversations List */}
        <div className={'md:min-w-1 lg:min-w-[370px] border-r border-gray-200'}>
          <Inbox />
        </div>

        {!selectedConversation && conversations?.length > 0 ? (
          <div className='flex flex-col items-center justify-center h-full w-full'>
            <HiChatBubbleOvalLeft className='size-10 text-gray-400' />
            <p className='text-lg font-medium uppercase text-gray-400'>
              No conversation selected
            </p>
          </div>
        ) : (
          selectedConversation && (
            <>
              {/* Middle Section: Conversation Details */}
              <div className='flex-1 border-r border-gray-200'>
                <ConversationDetails />
              </div>

              {/* Right Section: Contact Information */}
              <div className='w-1/4'>
                <ContactDetails />
              </div>
            </>
          )
        )}
      </div>
    </div>
  )
}

export default Conversation
