import React from 'react'
import ProfileIcon from '../ProfileIcon'

const UserMessage = ({ message, name }) => {
  const hasTextContent = message?.content && message?.content?.trim() !== ''
  // const hasAttachments = message.attachments && message.attachments.length > 0

  return (
    <div className='chat chat-start'>
      <div className='chat-image avatar'>
        <ProfileIcon name={name} size={10} />
      </div>
      <div className='chat-header mb-0.5 mr-1'>
        <time className='text-[11px] opacity-60 ml-1'>
          {new Date(message?.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </time>
      </div>
      <div className='chat-bubble bg-blue-200 text-black'>
        {hasTextContent && <p className='mb-2'>{message?.content}</p>}
        {message?.imageUrl && (
          <img
            key={index}
            src={message?.imageUrl}
            alt={`Attachment`}
            className='h-auto rounded-lg p-5 max-w-80'
          />
        )}
        {/* {hasAttachments && (
          <div className={hasTextContent ? 'mt-2' : ''}>
            {message.attachments.map((attachment, index) => (
              <img
                key={index}
                src={attachment.url}
                alt={`Attachment ${index + 1}`}
                className='h-auto rounded-lg p-5 max-w-80'
              />
            ))}
          </div>
        )} */}
      </div>
      {/* <div className='chat-footer opacity-50'>{message.status || 'Sent'}</div> */}
    </div>
  )
}

export default UserMessage
