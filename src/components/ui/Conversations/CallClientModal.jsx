import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { FaPhoneAlt } from 'react-icons/fa'
import { fetchWithAuth } from '@/utils/generalUtils'
import useConversationStore from '@/store/useConversationStore'

const CallClientModal = ({ modalId }) => {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const { setSelectedConversation, fetchLatestMessages } =
    useConversationStore()

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

  const handlePhoneCall = () => {
    if (selectedClient && selectedClient.phone) {
      window.location.href = `tel:${selectedClient.phone}`
    } else {
      alert('No phone number available for this client.')
    }
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
      <div className='p-4 flex flex-col'>
        <h2 className='text-lg font-semibold mb-4'>Call Client</h2>
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
      </div>

      <div className='flex flex-grow justify-center items-center'>
        <button
          onClick={handleSubmit}
          className='flex flex-col justify-center items-center space-y-3 bg-green-500 h-52 w-52 rounded-full text-white hover:bg-green-600 disabled:bg-gray-900 disabled:cursor-not-allowed'
          disabled={isSending || !selectedClient}
        >
          <FaPhoneAlt className='size-7' />
          <span className='text-xl font-semibold'>
            {selectedClient
              ? `Call ${selectedClient.name.split(' ')[0]}`
              : 'Call'}
          </span>
        </button>
      </div>
    </div>
  )
}

export default CallClientModal
