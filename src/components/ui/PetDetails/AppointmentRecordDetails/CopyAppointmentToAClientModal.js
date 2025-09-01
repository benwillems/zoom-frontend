import React, { useState } from 'react'
import Modal from 'react-modal'
import Select from 'react-select'
import useSearchClientsStore from '@/store/useSearchClientsStore'
import useNotificationStore from '@/store/useNotificationStore'
import { FaRegCheckCircle } from 'react-icons/fa'
import { MdWarning } from 'react-icons/md'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    minHeight: '45%',
    maxHeight: '80%',
    width: '40%',
    overflowY: 'auto',
    padding: '2rem',
    borderRadius: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
}

const CopyAppointmentToAClientModal = ({
  isOpen,
  onRequestClose,
  appointmentId,
  onCopySuccess,
  clientId,
}) => {
  const { clients } = useSearchClientsStore()
  const { addNotification } = useNotificationStore()
  const [selectedClient, setSelectedClient] = useState(null)

  const clientOptions = clients
    .filter(client => client.id !== clientId)
    .map(client => ({
      value: client.id,
      label: client.name,
    }))

  const handleCopyAppointment = async () => {
    if (!selectedClient) {
      addNotification({
        iconColor: 'red',
        header: 'No client selected',
        description: 'Please select a client to copy the appointment to',
        icon: MdWarning,
        hideProgressBar: false,
      })
      return
    }

    try {
      const response = await fetch('/api/appointment/copy-to-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentId, clientId: selectedClient.value }),
      })

      if (!response.ok) {
        throw new Error('Failed to copy appointment to client')
      }

      const copiedAppointment = await response.json()
      console.log('Copied appointment:', copiedAppointment)

      addNotification({
        iconColor: 'green',
        header: `Appointment was copied to ${selectedClient?.label}!`,
        icon: FaRegCheckCircle,
        hideProgressBar: false,
      })

      onCopySuccess()
      onRequestClose()
    } catch (error) {
      console.error('Error copying appointment to client:', error)
      addNotification({
        iconColor: 'red',
        header: 'Error copying appointment',
        description:
          'An error occurred while copying the appointment to the selected client',
        icon: MdWarning,
        hideProgressBar: false,
      })
    }
  }

  Modal.setAppElement('#__next')

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel='Copy Appointment to Client'
    >
      <div className='flex-grow px-6 py-4'>
        <h2 className='text-2xl font-bold mb-4'>Copy Appointment to Client</h2>
        <p className='text-gray-600 mb-4'>
          Select a client to copy the appointment details to:
        </p>
        <Select
          options={clientOptions}
          value={selectedClient}
          onChange={setSelectedClient}
          isSearchable={true}
          isClearable={true}
          placeholder='Select a client'
          className='mb-6'
          styles={{
            menuList: provided => ({
              ...provided,
              maxHeight: '200px',
              fontSize: '16px',
            }),
          }}
        />
      </div>
      <div className='px-6 py-4'>
        <div className='flex justify-end'>
          <button
            className='bg-blue-500 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:hover:bg-gray-900 text-white px-4 py-2 rounded mr-2'
            onClick={handleCopyAppointment}
            disabled={!selectedClient?.value}
          >
            Copy Appointment
          </button>
          <button
            className='bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded'
            onClick={onRequestClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default CopyAppointmentToAClientModal
