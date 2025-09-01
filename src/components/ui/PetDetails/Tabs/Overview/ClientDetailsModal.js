import useNotificationStore from '@/store/useNotificationStore'
import React, { useState, useEffect } from 'react'
import { FaRegSave } from 'react-icons/fa'
import { MdWarning } from 'react-icons/md'
import Modal from 'react-modal'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '400px',
    width: '90%',
    padding: '2rem',
    borderRadius: '0.5rem',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
}

Modal.setAppElement('#__next') // Set the app root element for accessibility

const ClientDetailsModal = ({
  isOpen,
  onClose,
  clientDetails,
  setClientDetails,
}) => {
  const { addNotification } = useNotificationStore()

  const [editedClientDetails, setEditedClientDetails] = useState({
    email: clientDetails?.email || 'Add email',
    phone: clientDetails?.phone || 'Add phone number',
  })

  const resetEditedClientDetails = () => {
    setEditedClientDetails({
      email: clientDetails?.email || 'Add email',
      phone: clientDetails?.phone || 'Add phone number',
    })
  }

  useEffect(() => {
    setEditedClientDetails({
      email: clientDetails?.email || 'Add email',
      phone: clientDetails?.phone || 'Add phone number',
    })
  }, [clientDetails])

  const handleInputChange = (field, value) => {
    setEditedClientDetails(prevDetails => ({
      ...prevDetails,
      [field]: value,
    }))
  }

  let isPlaceholderEmailOrPhone =
    editedClientDetails?.email === 'Add email' &&
    editedClientDetails?.phone === 'Add phone number'

  const saveClientDetails = async () => {
    const formData = new FormData()
    if (editedClientDetails?.email === 'Add email') {
      delete editedClientDetails.email
    } else {
      formData.append('email', editedClientDetails?.email)
    }
    if (editedClientDetails?.phone === 'Add phone number') {
      delete editedClientDetails?.phone
    } else {
      formData.append('phoneNumber', editedClientDetails?.phone)
    }
    formData.append('clientId', clientDetails?.id)

    try {
      const response = await fetch(`/api/update/client`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const updatedClient = await response.json()
      const mergedClientDetails = {
        ...updatedClient,
        latestObstacles: clientDetails?.latestObstacles || '',
        latestRecapOrHomework: clientDetails?.latestRecapOrHomework || '',
        latestObstaclesDate: clientDetails?.latestObstaclesDate,
        latestRecapOrHomeworkDate: clientDetails?.latestRecapOrHomeworkDate,
      }

      setClientDetails(mergedClientDetails)
      onClose()
      addNotification({
        iconColor: 'green',
        header: 'Client details were saved!',
        icon: FaRegSave,
        hideProgressBar: false,
      })
    } catch (error) {
      console.error('Error updating client details', error)
      setEditedClientDetails({
        email: clientDetails?.email || 'Add email',
        phone: clientDetails?.phone || 'Add phone number',
      })
      onClose()
      addNotification({
        iconColor: 'red',
        header: 'Error saving client details',
        icon: MdWarning,
        hideProgressBar: false,
      })
    }
  }

  const handleClose = () => {
    onClose()
    resetEditedClientDetails()
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel='Client Details Modal'
    >
      <h2 className='text-xl font-bold mb-4'>Edit Client Details</h2>
      <div className='max-w-sm mx-1 mt-2 flex-wrap gap-4'>
        <div className='flex flex-col justify-between mb-2 text-base'>
          <span className='text-gray-600 font-semibold flex-grow'>Email</span>
          <input
            type='email'
            value={editedClientDetails?.email}
            onChange={e => handleInputChange('email', e.target.value)}
            className='w-72 focus:outline-none px-2 bg-gray-200 focus:border-blue-500 placeholder:text-gray-600'
            placeholder='Email'
          />
        </div>
        <div className='flex flex-col justify-between mb-4 text-base'>
          <span className='text-gray-600 flex-grow font-semibold'>
            Phone number
          </span>
          <input
            type='tel'
            value={editedClientDetails?.phone}
            onChange={e => handleInputChange('phone', e.target.value)}
            className='w-72 focus:outline-none bg-gray-200 px-2 focus:border-blue-500 placeholder:text-gray-600'
            placeholder='Phone'
            pattern='[0-9]{10}'
          />
        </div>
      </div>
      <div className='mt-4'>
        <button
          className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded disabled:bg-gray-800 disabled:hover:bg-gray-900 disabled:cursor-not-allowed'
          onClick={saveClientDetails}
          disabled={isPlaceholderEmailOrPhone}
        >
          Save
        </button>
        <button
          className='bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded ml-2'
          onClick={handleClose}
        >
          Cancel
        </button>
      </div>
    </Modal>
  )
}

export default ClientDetailsModal
