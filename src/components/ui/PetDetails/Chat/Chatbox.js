/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from 'react'
import { BiRightArrow } from 'react-icons/bi'
import ReactTextareaAutosize from 'react-textarea-autosize'
import ChatWindowImage from './ChatWindowImage'
import RenderMarkdownContent from './RenderMarkdownContent'
import useChatStore from '@/store/useChatStore'
import useClientStore from '@/store/clientStore'
import { GrNotes, GrPowerReset } from 'react-icons/gr'
import { IoClose } from 'react-icons/io5'
import { FaExpand } from 'react-icons/fa'
import Alert from '@/components/ui/common/Alert'
import { MdWarning } from 'react-icons/md'
import DisplayTooltip from '@/components/common/DisplayTooltip'
import useAudioStore from '@/store/useAudioStore'

const Chatbox = () => {
  const messagesEndRef = useRef(null)

  const {
    chatConversation,
    addToConversation,
    chatLoading,
    setChatLoading,
    displayChatWindow,
    setDisplayChatwindow,
    setAppointmentReferencesFromChat,
    clearConversation,
    isExpanded,
    setIsExpanded,
  } = useChatStore()

  const { clientDetails, appointments, clientCurrentTab } = useClientStore()
  const isOngoingAppointment = useAudioStore(
    state => state.isOngoingAppointment
  )
  const [showIntroMessage, setShowIntroMessage] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    const isFirstVisit = localStorage.getItem('hasVisited')
    if (!isFirstVisit) {
      setShowIntroMessage(true)
      setTimeout(() => {
        setShowIntroMessage(false)
      }, 10000) // Hide the message after 10 seconds
      localStorage.setItem('hasVisited', 'true')
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleChatChange = event => {
    setChatInput(event.target.value)
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const toggleChat = () => {
    setDisplayChatwindow(!displayChatWindow)
    setAppointmentReferencesFromChat([])
    if (!displayChatWindow) {
      document.body.style.overflow = 'hidden' // Prevent scrolling when chat is open
    } else {
      document.body.style.overflow = 'auto' // Re-enable scrolling when chat is closed
    }
  }

  useEffect(() => {
    const saveScrollPos = window.pageYOffset // Save current scroll position
    scrollToBottom() // Scroll to bottom in your chatbox
    window.scrollTo(0, saveScrollPos) // Restore previous scroll position
  }, [chatConversation])

  const sendMessage = async () => {
    let userMessage = {
      role: 'user',
      content: chatInput,
    }

    if (!chatInput.trim()) return // Don't send empty messages

    setChatLoading(true)
    addToConversation([userMessage])
    const { chatConversation } = useChatStore.getState()
    try {
      const response = await fetch(`/api/search/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: chatConversation.map(message => {
            const { references, error, ...rest } = message
            return rest
          }),
          clientId: clientDetails.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Network response was not ok.')
      }

      addToConversation([
        {
          role: 'assistant',
          content: data.answer ? data.answer.answer : 'No answer available.', // Change this according to your data structure
          references: data.answer ? data.answer.source_appointment_ids : [],
        },
      ])

      setChatInput('')
    } catch (error) {
      addToConversation([
        {
          role: 'assistant',
          content: error.message,
          error: true,
        },
      ])
    } finally {
      setChatLoading(false) // Turn off loading indicator
    }
  }

  // Handler for pressing Enter key in textarea
  const handleInputEntry = async event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      // Check for Shift+Enter to allow line breaks
      event.preventDefault()

      await sendMessage()
    }
  }

  // Handler for clicking the send icon
  const handleIconClick = async () => {
    await sendMessage()
  }

  let chatWindowOpenStyles = 'px-2 sm:pl-8 mb-2 sm:mr-4'

  const confirmClearConversation = () => {
    clearConversation() // Clears the chat conversation
    setShowAlert(false) // Closes the alert
  }

  const triggerClearConversation = () => {
    setShowAlert(true) // Opens the alert to confirm action
  }

  return (
    appointments.length > 0 &&
    clientCurrentTab == 'overview' && (
      <div
        className={`fixed bottom-0 right-0 ${
          displayChatWindow ? chatWindowOpenStyles : 'mb-6 mr-6'
        } flex justify-end ${
          isOngoingAppointment() ? 'sm:mb-24 lg:mr-20' : 'sm:mb-10 lg:mr-20'
        } z-40 w-full sm:pl-0 sm:w-auto`}
      >
        {!displayChatWindow && (
          <>
            {showIntroMessage && (
              <div className='absolute bottom-[68px] sm:bottom-[73px] w-44 sm:w-48 right-0 mr-2 sm:mr-3 flex flex-col items-end'>
                <div className='bg-gray-800 text-white p-3  text-xs sm:text-sm rounded-lg shadow-lg'>
                  You can ask questions about your appointments!
                </div>
                <svg
                  className='h-3 w-3 mr-4 fill-current rotate-180 text-gray-800'
                  viewBox='0 0 20 20'
                >
                  <polygon points='10,0 20,20 0,20' />
                </svg>
              </div>
            )}
            <ChatWindowImage />
          </>
        )}

        {displayChatWindow && (
          <div
            className={`flex flex-col justify-between mt-4 pt-0 pb-1 px-0 bg-white rounded-lg shadow-xl ${
              isExpanded
                ? 'h-[550px] w-full sm:h-[650px] sm:w-[400px] md:w-[700px] ease-in-out duration-300'
                : 'h-[550px] w-full sm:h-[550px] sm:w-[400px] md:w-[450px] ease-in-out duration-300'
            } z-40`}
          >
            <div className='flex justify-between items-center py-2 px-2 border-b border-1 border-slate-200'>
              <ChatProfileImage
                height={8}
                width={8}
                chatWindow={true}
                onClick={toggleChat}
              />
              <div className='flex justify-center items-center space-x-2 text-gray-800'>
                <DisplayTooltip
                  id='resetChatTooltip'
                  place='top'
                  effect='solid'
                  variant='dark'
                  message='Reset Chat'
                  customStyle={{
                    marginLeft: '-0px',
                    padding: '3px 12px',
                  }}
                >
                  <div
                    className='text-base p-1.5 hover:bg-red-300 rounded-full cursor-pointer'
                    onClick={triggerClearConversation}
                  >
                    <GrPowerReset />
                  </div>
                </DisplayTooltip>
                <DisplayTooltip
                  id='expandChatTooltip'
                  place='top'
                  effect='solid'
                  variant='dark'
                  message='Expand Chat'
                  customStyle={{
                    marginLeft: '-0px',
                    padding: '3px 12px',
                  }}
                >
                  <div
                    onClick={toggleExpand}
                    className='hidden lg:block text-base p-[7.5px] hover:bg-gray-200 rounded-full cursor-pointer'
                  >
                    <FaExpand />
                  </div>
                </DisplayTooltip>
                <div
                  onClick={toggleChat}
                  className='text-base p-[4px] bg-gray-700 text-white hover:bg-gray-600 rounded-full cursor-pointer'
                >
                  <IoClose />
                </div>
              </div>
            </div>

            <div className='h-full first:pt-2 first:pb-2 last:pb-3 w-full px-2 mt-3 overflow-y-auto scrollbar-hide hide-scrollbar'>
              {chatConversation.map((msg, i) => (
                <ChatMessage message={msg} key={i} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {chatLoading && (
              <div className='flex items-center h-auto justify-start px-2 pt-2 mb-0'>
                <h1 className='flex text-sm py-2 px-4  rounded-xl mb-2 max-w-[100%] min-w-[10%] break-words font-medium'>
                  <div className='chat-loader mr-2'></div>
                  Vet Assist is typing...
                </h1>
              </div>
            )}

            <div
              className={`flex w-full justify-center items-center pb-4 px-2 ${
                chatLoading ? 'pt-0' : 'pt-4'
              }`}
            >
              <ReactTextareaAutosize
                className='flex w-full border border-slate-300 rounded-3xl py-1.5 px-4 shadow-md focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300 placeholder:text-slate-500 resize-none'
                placeholder={`How can I assist with ${clientDetails.name}?`}
                onChange={event => handleChatChange(event)}
                value={chatInput}
                onKeyDown={handleInputEntry}
                autoComplete='off'
              />
              <div
                className='flex justify-center items-center ml-2 h-8 w-9 rounded-full cyan-to-blue-btn cursor-pointer text-white'
                onClick={handleIconClick}
                role='button'
                aria-label='Send message'
              >
                {chatLoading ? (
                  <span className='animate-spin h-5 w-5 border-t-2 border-white rounded-full'></span> // Assuming you want a loader here
                ) : (
                  <BiRightArrow className='h-full w-full p-2' />
                )}
              </div>
            </div>
          </div>
        )}
        {showAlert && (
          <Alert
            title='Clear Conversation'
            message='Are you sure you want to clear this conversation? This action cannot be undone.'
            onCancel={() => setShowAlert(false)}
            onConfirm={confirmClearConversation}
            buttonActionText={'Clear'}
            Icon={MdWarning}
          />
        )}
      </div>
    )
  )
}

const ChatProfileImage = ({ height, width, chatWindow, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center cursor-pointer h-${height} w-${width} cursor-default select-none`}
    >
      <img
        className={`object-cover w-full h-full rounded-full ${
          chatWindow ? '' : 'border-2 border-black shadow-2xl'
        }`}
        src='/images/user_profile.jpg'
        alt='Chatbox'
      />
      {chatWindow && (
        <div className='flex justify-center items-center space-x-2'>
          <h1 className='ml-2 text-xs font-bold text-black whitespace-nowrap'>
            Nutri Assist
          </h1>
          <DisplayTooltip
            id='betaTooltip'
            place='top'
            effect='solid'
            variant='dark'
            message='Chat is in BETA and may not properly respond. Responses are AI generated!'
            customStyle={{
              marginLeft: '-0px',
              padding: '3px 12px',
              width: '280px',
              display: 'flex',
              justifyContent: 'center',
              textAlign: 'center', // Add this line
            }}
          >
            <div className='text-xs uppercase font-semibold bg-blue-300 px-2 py-1 rounded-md cursor-default'>
              BETA
            </div>
          </DisplayTooltip>
        </div>
      )}
    </div>
  )
}

const ChatMessage = ({ message }) => {
  const { content, references, role } = message
  const { setAppointmentReferencesFromChat } = useChatStore()

  // Function used to store the references to that message into Zustand
  // References are used to highlight the referenced appointment in the UI
  const storeReferences = (role, references) => {
    if (role == 'assistant' && references.length > 0) {
      setAppointmentReferencesFromChat(references)
    }
  }

  let userBubble = (
    <div className='py-2 px-4 bg-slate-100 rounded-xl mb-2 inline-block max-w-[100%] min-w-[10%] break-words'>
      {content}
    </div>
  )

  let assistantBubble = (
    <div
      className={`flex flex-col py-2 px-4  rounded-xl mb-2 max-w-[100%] min-w-[10%] break-words ${
        message?.error
          ? 'bg-red-100 outline outline-2 outline-red-300 font-medium'
          : 'bg-blue-50'
      }`}
    >
      <RenderMarkdownContent markdownContent={content} />
      {references?.length > 0 && (
        <div
          className='flex ml-auto items-center py-2 space-x-1 cursor-pointer text-gray-700'
          onClick={() => storeReferences(role, references)}
        >
          <GrNotes className='text-xs text-gray-600' />
          <p className='text-sm hover:underline underline-offset-2'>
            View Source
          </p>
        </div>
      )}
    </div>
  )

  return <>{role == 'user' ? userBubble : assistantBubble}</>
}
export default Chatbox
