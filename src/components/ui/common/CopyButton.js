import React, { useState } from 'react'
import copy from 'copy-to-clipboard'
import { HiOutlineClipboardCopy } from 'react-icons/hi' // Assuming you're using this for the copy icon
import { FaRegCheckCircle } from 'react-icons/fa' // For showing success state
import useNotificationStore from '@/store/useNotificationStore'

const CopyButton = ({ text, title, displayNotification }) => {
  const [copied, setCopied] = useState(false)
  const addNotification = useNotificationStore(state => state.addNotification)

  const handleCopy = () => {
    copy(text)

    if (displayNotification) {
      addNotification({
        iconColor: 'green',
        header: `Copied ${title}`,
        description: 'You can now paste the notes anywhere',
        icon: FaRegCheckCircle,
        hideProgressBar: false,
      })
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000) // Hide the "Copied!" message after 2 seconds
  }

  return (
    <div
      className='flex justify-center items-center cursor-pointer w-20'
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <FaRegCheckCircle className='w-[18px] h-[18px] text-black' />
          <span className='ml-1 text-sm text-black'>Copied!</span>
        </>
      ) : (
        <>
          <HiOutlineClipboardCopy className='w-[20px] h-[20px] text-black' />
          <span className='ml-1 text-sm text-black'>Copy</span>
        </>
      )}
    </div>
  )
}

export default CopyButton
