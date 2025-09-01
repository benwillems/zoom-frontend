import React from 'react'

const AssistantMessage = ({ message }) => (
  <div className='chat chat-end'>
    <div className='chat-image avatar'>
      <div className='w-10 rounded-full'>
        <img alt='Assistant' src='/images/user_profile.jpg' />
      </div>
    </div>
    <div className='chat-header mb-0.5 ml-1'>
      <time className='text-[11px] opacity-60 ml-1'>
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </time>
    </div>
    <div className='chat-bubble'>{message.content}</div>
    {/* <div className='chat-footer opacity-50'>{message.status || 'Sent'}</div> */}
  </div>
)

export default AssistantMessage
