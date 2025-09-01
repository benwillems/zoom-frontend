import React, { useState } from 'react'
import useConversationStore from '@/store/useConversationStore'
import AssistantMessage from './MessageTypes/AssistantMessage'
import UserMessage from './MessageTypes/UserMessage'
import { IoSend } from 'react-icons/io5'
import { IoIosAttach } from 'react-icons/io'
import { fetchWithAuth } from '@/utils/generalUtils'
import useNotificationStore from '@/store/useNotificationStore'
import CircleSpinner from '@/components/common/CircleSpinner'

const ConversationDetails = () => {
  const [message, setMessage] = useState('')
  const {
    selectedConversation,
    setSelectedConversation,
    fetchLatestMessages,
    isLoadingConversation,
  } = useConversationStore()
  const addNotification = useNotificationStore(state => state.addNotification)

  if (!selectedConversation) return null

  const handleSendMessage = async () => {
    if (message.trim() && selectedConversation) {
      try {
        const response = await fetchWithAuth('/api/client/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId: selectedConversation.id,
            message: message.trim(),
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }

        const data = await response.json()

        // Update the selected conversation with the new message
        setSelectedConversation({
          ...data,
        })

        addNotification({
          iconColor: 'green',
          header: `Text message was sent!`,
          icon: IoSend,
          hideProgressBar: false,
        })

        // Refresh the latest messages in the inbox
        fetchLatestMessages()

        setMessage('')
      } catch (error) {
        console.error('Error sending message:', error)
        alert('Failed to send message. Please try again.')
      }
    }
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='py-3 px-5 border-b'>
        <h2 className='text-xl font-semibold'>{selectedConversation?.name}</h2>
      </div>
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {isLoadingConversation ? (
          <div className='flex flex-col justify-center items-center'>
            <CircleSpinner
              loading={isLoadingConversation}
              height={40}
              width={40}
            />
            <p>Loading conversation...</p>
          </div>
        ) : (
          selectedConversation?.messages?.map(msg =>
            msg.messageOwner === 'USER' ? (
              <UserMessage
                key={msg.id}
                message={{
                  content: msg.message,
                  timestamp: msg.createdAt,
                  attachments: msg.imageUrl ? [{ url: msg.imageUrl }] : [],
                }}
                name={selectedConversation.name}
              />
            ) : (
              <AssistantMessage
                key={msg.id}
                message={{
                  content: msg.message,
                  timestamp: msg.createdAt,
                }}
              />
            )
          )
        )}
      </div>
      {/* Message input area */}
      <div className='border-t'>
        <div className='flex px-4 py-2'>
          <p className='text-blue-500 font-medium underline underline-offset-4 decoration-[3px]'>
            SMS
          </p>
        </div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder='Type a message...'
          className='w-full px-4 py-4 text-sm resize-none border-b border-t bg-lt-primary-off-white focus:outline-blue-500 placeholder:text-gray-600'
          rows={5}
        />
        <div className='flex justify-between items-center mb-1 px-2 h-10'>
          <div className='flex space-x-2 pl-1'>
            {/* Attachment buttons if needed */}
            {/* <IoIosAttach className='size-5 cursor-pointer' /> */}
          </div>
          <button
            onClick={handleSendMessage}
            className='flex justify-center items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg space-x-2 disabled:bg-gray-900 disabled:cursor-not-allowed'
            disabled={!message || isLoadingConversation}
          >
            <IoSend className='size-4' />
            <p className='text-sm'>Send SMS</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConversationDetails
