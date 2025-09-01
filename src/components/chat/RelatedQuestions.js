import React, { useState } from 'react'
import { MdReadMore } from 'react-icons/md'
import { AiOutlinePlus } from 'react-icons/ai'
import { useConversationContext } from '../context/ConversationProvider'
import { addToConversation } from './utils/addToConversation'

const RelatedQuestions = ({ relatedQuestions }) => {
  const { conversation, setConversation } = useConversationContext()

  const futherConversation = question => {
    let apiBody = {
      message: question,
    }
    addToConversation(conversation, apiBody, setConversation)
  }

  return (
    <div className='mb-4'>
      <div className='flex items-center text-green-500 mb-1 mt-3'>
        <MdReadMore className='text-2xl' />
        <h1 className='text-lg ml-2 font-medium'>Related</h1>
      </div>
      {relatedQuestions.map((question, index) => {
        return (
          <React.Fragment key={index}>
            <div
              className='flex items-center cursor-pointer duration-300 ease-in-out text-primary-white hover:text-green-500'
              onClick={() => futherConversation(question)}
            >
              <AiOutlinePlus className='text-base text-green-500' />
              <div className='font-normal ml-1'>{question}</div>
            </div>
            {/* Only render divider if it's not the last item in the array */}
            {index !== relatedQuestions.length - 1 && (
              <div className='w-full flex ml-auto mr-auto bg-primary-dark-light h-0.5 my-2'></div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default RelatedQuestions
