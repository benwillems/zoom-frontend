/* eslint-disable @next/next/no-img-element */
import React from 'react'
import useChatStore from '@/store/useChatStore'

const ChatWindowImage = ({ hide }) => {
  const { displayChatWindow, setDisplayChatwindow } = useChatStore()

  const toggleChat = () => {
    setDisplayChatwindow(!displayChatWindow)
    if (!displayChatWindow) {
      document.body.style.overflow = 'hidden' // Prevent scrolling when chat is open
    } else {
      document.body.style.overflow = 'auto' // Re-enable scrolling when chat is closed
    }
  }

  return (
    <div
      onClick={toggleChat}
      className={`h-16 w-16 ${
        hide ? 'hidden' : 'block'
      } cursor-pointer bg-white hover:bg-slate-100 rounded-full md:w-[70px] md:h-[70px]`}
    >
      <img
        className='object-cover h-full w-full rounded-full border-2 border-black shadow-2xl'
        src='/images/user_profile.jpg'
        alt='Chatbox'
      />
    </div>
  )
}

export default ChatWindowImage
