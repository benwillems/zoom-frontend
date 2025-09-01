import React, { useState } from 'react'
import { BsArrowRightShort } from 'react-icons/bs'
import TextareaAutosize from 'react-textarea-autosize'
import { useConversationContext } from '../context/ConversationProvider'
import { addToConversation } from './utils/addToConversation'
import { useRouter } from 'next/router'

const Textarea = ({ petName }) => {
  const {
    conversation,
    setConversation,
    setInitialQuestion,
    setConversationIsLoading,
  } = useConversationContext()
  const [message, setMessage] = useState('')

  const router = useRouter()

  const handleInputChange = event => {
    setMessage(event.target.value)
  }

  const handleSendClick = () => {
    let apiBody = {
      search: message,
      namespace: petName,
    }

    setInitialQuestion(message)

    // if (router.pathname == `/petRecordsChat/${petName}`) {
    // }
    router.push({pathname: '/conversation', query: { petName: petName }})

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
    <div className='flex items-center gap-2'>
      <TextareaAutosize
        value={message}
        onChange={handleInputChange}
        className='w-full text-zinc-600 dark:bg-secondary-dark dark:text-primary-white p-3 outline-none resize-none caret-green-500 placeholder:text-sm xl:placeholder:text-base placeholder:text-primary-light'
        placeholder='Ask about health, vaccines etc...'
        onKeyDown={handleKeyPress}
        autoComplete='off'
      />
      <button
        className='flex items-center justify-center rounded-full p-0.5 bg-green-600 hover:bg-green-700 cursor-pointer ease-in-out duration-300'
        onClick={handleSendClick}
      >
        <BsArrowRightShort className='text-2xl text-white' />
      </button>
    </div>
  )
}

export default Textarea
