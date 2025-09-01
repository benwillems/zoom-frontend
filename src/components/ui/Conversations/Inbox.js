import React, { useState, useEffect } from 'react'
import { CiSearch } from 'react-icons/ci'
import useConversationStore from '@/store/useConversationStore'
import InboxItem from './InboxItem'
import { IoMdCreate } from 'react-icons/io'
import ComposeMessageModal from './ComposeMessageModal'
import { FaPhoneAlt } from 'react-icons/fa'
import CallClientModal from './CallClientModal'
import CircleSpinner from '@/components/common/CircleSpinner'
import { LuInbox } from 'react-icons/lu'

const Inbox = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const {
    setSelectedConversation,
    conversations,
    fetchLatestMessages,
    isLoadingInbox,
    setIsLoadingConversation,
    updateUnreadCount,
  } = useConversationStore()

  const textModalId = `new-msg-modal-${Math.random().toString(36).substr(2, 9)}`
  const callModalId = `call-modal-${Math.random().toString(36).substr(2, 9)}`

  useEffect(() => {
    fetchLatestMessages()
    setSelectedConversation(null)
  }, [])

  const formatTimestamp = timestamp => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleConversationClick = async clientId => {
    try {
      setIsLoadingConversation(true)
      const response = await fetch(`/api/client/${clientId}/message`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      setSelectedConversation({
        ...data,
      })
      updateUnreadCount(clientId)
    } catch (error) {
      console.error('Error fetching conversation details:', error)
    } finally {
      setIsLoadingConversation(false)
    }
  }

  const filteredConversations = conversations?.filter(
    conversation =>
      conversation?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      conversation?.messages[0]?.message
        .toLowerCase()
        .includes(searchQuery?.toLowerCase())
  )

  return (
    <div className={`flex flex-col h-full relative`}>
      <div className='sticky top-0 z-10 bg-lt-primary-off-white'>
        <div className='flex justify-between items-center'>
          <h2 className='text-lg font-semibold mb-3 px-4 pt-3'>Inbox</h2>
          <div className='flex justify-end space-x-2 px-4'>
            <button
              className='flex justify-center items-center bg-blue-500 px-2 py-1 rounded-md text-white hover:bg-blue-600 space-x-2'
              onClick={() => document.getElementById(textModalId).showModal()}
            >
              <IoMdCreate />
              <p className='pr-1 text-sm'>Compose</p>
            </button>
            {/* <button
              className='flex justify-center items-center bg-green-500 px-2 py-1 rounded-md text-white hover:bg-green-600 space-x-2'
              onClick={() => document.getElementById(callModalId).showModal()}
            >
              <FaPhoneAlt className='size-3' />
              <p className='pr-1 text-sm'>Call</p>
            </button> */}
          </div>
        </div>
        <div className='flex items-center mb-3 px-4'>
          <div className='flex flex-1 items-center space-x-2 bg-white rounded-md border py-1.5 px-2'>
            <CiSearch className='text-md md:text-xl' />
            <input
              type='text'
              placeholder={'Search for client or message'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='text-base placeholder:text-gray-500 placeholder:text-sm outline-none w-full'
            />
          </div>
        </div>
      </div>
      {/* Conversations list items */}
      <div className='flex-1 overflow-y-auto'>
        {isLoadingInbox ? (
          <div className='flex flex-col items-center justify-center'>
            <CircleSpinner height={45} width={45} loading={isLoadingInbox} />{' '}
            <p>Loading inbox...</p>
          </div>
        ) : conversations?.length == 0 ? (
          <div className='flex h-full flex-col justify-center items-center space-y-2'>
            <LuInbox className='size-8' />
            <p className='text-lg'>Inbox is empty</p>
          </div>
        ) : (
          conversations?.length > 0 &&
          filteredConversations?.map(conversation => (
            <InboxItem
              key={conversation?.id}
              id={conversation?.id}
              name={conversation?.name}
              time={formatTimestamp(
                conversation?.messages[0]?.createdAt || conversation?.updatedAt
              )}
              unreadCount={conversation?.unreadMessageCount}
              message={conversation?.messages[0]?.message || 'No messages yet'}
              onClick={() => handleConversationClick(conversation?.id)}
            />
          ))
        )}
      </div>

      {/* Text Modal */}
      <dialog id={textModalId} className='modal'>
        <div className='modal-box max-w-none w-auto h-[60vh] flex flex-col'>
          <button
            className='btn btn-sm btn-circle btn-neutral absolute right-2 top-2 z-10'
            onClick={() => document.getElementById(textModalId).close()}
          >
            ✕
          </button>
          <ComposeMessageModal modalId={textModalId} />
        </div>
        <form method='dialog' className='modal-backdrop'>
          <button>close</button>
        </form>
      </dialog>

      {/* Call Modal */}
      <dialog id={callModalId} className='modal'>
        <div className='modal-box max-w-none w-auto h-[60vh] flex flex-col'>
          <button
            className='btn btn-sm btn-circle btn-neutral absolute right-2 top-2 z-10'
            onClick={() => document.getElementById(callModalId).close()}
          >
            ✕
          </button>
          <CallClientModal modalId={callModalId} />
        </div>
        <form method='dialog' className='modal-backdrop'>
          <button>close</button>
        </form>
      </dialog>
    </div>
  )
}

export default Inbox
