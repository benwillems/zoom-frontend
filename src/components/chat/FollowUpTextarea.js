import React, { useState } from 'react'
import { BsArrowRightShort } from 'react-icons/bs'
import TextareaAutosize from 'react-textarea-autosize'
import { useConversationContext } from '../context/ConversationProvider'
import { addToConversation } from './utils/addToConversation'

const FollowUpTextarea = ({ petName }) => {
  const { conversation, setConversation, setConversationIsLoading } =
    useConversationContext()
  const [message, setMessage] = useState('')

  const handleInputChange = event => {
    setMessage(event.target.value)
  }

  const handleSendClick = () => {
    let apiBody = {
      search: message,
      namespace: petName,
    }

    addToConversation(
      conversation,
      apiBody,
      setConversation,
      setConversationIsLoading
    )

    setMessage('')
  }

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendClick()
    }
  }

  return (
    <div className='flex lg:w-1/3 z-30 justify-between mx-4 py-0.5 absolute bottom-0 mb-6 bg-white rounded-md border dark:border-primary-dark-light dark:bg-secondary-dark dark:text-primary-white shadow-md'>
      <TextareaAutosize
        value={message}
        onChange={handleInputChange}
        className='w-full text-zinc-600 bg-white dark:text-primary-white dark:bg-secondary-dark p-3 outline-none resize-none caret-green-500 ml-2 placeholder:text-zinc-400 dark:placeholder:text-primary-light'
        placeholder='Ask another question...'
        onKeyDown={handleKeyPress}
        autoComplete='off'
      />
      <div
        className='flex h-7 items-center justify-center p-0.5 m-2.5 rounded-full bg-green-600 hover:bg-green-700 cursor-pointer ease-in-out duration-300 mr-4'
        onClick={handleSendClick}
      >
        <BsArrowRightShort className='text-2xl text-white' />
      </div>
    </div>
  )
}

export default FollowUpTextarea
