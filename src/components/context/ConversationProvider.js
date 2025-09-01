"use client"

import { createContext, useContext, useState } from 'react'

const ConversationContext = createContext({})

export const ConversationContextProvider = ({ children }) => {
  const [conversation, setConversation] = useState([])
  const [referenceChosen, setReferenceChosen] = useState({})
  const [selectedCounty, setSelectedCounty] = useState('')
  const [conversationIsLoading, setConversationIsLoading] = useState(false)
  const [initialQuestion, setInitialQuestion] = useState('')

  return (
    <ConversationContext.Provider
      value={{
        conversation,
        setConversation,
        referenceChosen,
        setReferenceChosen,
        selectedCounty,
        setSelectedCounty,
        conversationIsLoading,
        setConversationIsLoading,
        initialQuestion,
        setInitialQuestion,
      }}
    >
      {children}
    </ConversationContext.Provider>
  )
}

export const useConversationContext = () => useContext(ConversationContext)
