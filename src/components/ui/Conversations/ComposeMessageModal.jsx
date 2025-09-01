import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { fetchWithAuth } from '@/utils/generalUtils'
import { IoSend } from 'react-icons/io5'
import { IoIosAttach } from 'react-icons/io'
import useConversationStore from '@/store/useConversationStore'
import useNotificationStore from '@/store/useNotificationStore'

const ComposeMessageModal = ({ modalId }) => {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { setSelectedConversation, fetchLatestMessages } =
    useConversationStore()
  const addNotification = useNotificationStore(state => state.addNotification)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetchWithAuth('/api/clients')
      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }
      const data = await response.json()
      const formattedClients = data.map(client => ({
        value: client.id,
        label: `${client.name} - ${client.phone || 'No phone'}`,
        phone: client.phone,
        name: client.name,
      }))
      setClients(formattedClients)
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const handleClientChange = selectedOption => {
    setSelectedClient(selectedOption)
  }

  const handleMessageChange = e => {
    setMessage(e.target.value)
  }

  const handleSubmit = async () => {
    if (!selectedClient || !message.trim()) {
      alert('Please select a client and enter a message.')
      return
    }

    setIsSending(true)

    try {
      const response = await fetchWithAuth('/api/client/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: selectedClient.value,
          message: message.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      // Set the selected conversation with the new data
      setSelectedConversation({ ...data })

      addNotification({
        iconColor: 'green',
        header: `Text message was sent!`,
        icon: IoSend,
        hideProgressBar: false,
      })

      // Re-fetch the latest messages to update the left side of the UI
      await fetchLatestMessages()

      // Reset form and close modal
      setSelectedClient(null)
      setMessage('')
      document.getElementById(modalId).close()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className='flex flex-col h-full w-[750px]'>
      <div className='p-4 flex-grow flex flex-col'>
        <h2 className='text-lg font-semibold mb-4'>Compose New Message</h2>
        <div className='flex items-center mb-4'>
          <div className='flex-grow mr-2'>
            <Select
              options={clients}
              value={selectedClient}
              onChange={handleClientChange}
              placeholder='Select a client'
              classNamePrefix='react-select'
            />
          </div>
        </div>
        <textarea
          value={message}
          onChange={handleMessageChange}
          placeholder='Type your message here...'
          className='flex-grow w-full px-4 py-4 text-base resize-none border focus:outline-blue-500 placeholder:text-gray-600'
        />
      </div>

      <div className='px-4 pb-4 flex justify-between items-center'>
        {/* <IoIosAttach className='size-5 cursor-pointer' /> */}
        <button
          onClick={handleSubmit}
          className='flex justify-center items-center bg-blue-500 px-4 py-2 rounded-md text-white hover:bg-blue-600 space-x-2 disabled:bg-gray-900 disabled:cursor-not-allowed'
          disabled={isSending || !selectedClient || !message.trim()}
        >
          <IoSend className='mr-2' />
          <span className='text-sm'>
            {isSending ? 'Sending...' : 'Send SMS'}
          </span>
        </button>
      </div>
    </div>
  )
}

export default ComposeMessageModal
