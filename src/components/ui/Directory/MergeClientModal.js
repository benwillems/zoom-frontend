import useSearchClientsStore from '@/store/useSearchClientsStore'
import React, { useState } from 'react'
import { FaLongArrowAltRight } from 'react-icons/fa'
import Select from 'react-select'

const MergeClientModal = ({
  clientReceivingMerge,
  onCancel,
  onConfirm,
  Icon,
  buttonActionText,
}) => {
  const [show, setShow] = useState(true)
  const { clients } = useSearchClientsStore()
  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedReceivingClient, setSelectedReceivingClient] = useState(null)

  const handleCancel = () => {
    setShow(false)
    if (onCancel) onCancel()
  }

  const handleConfirm = () => {
    setShow(false)
    if (onConfirm)
      onConfirm(selectedClient.value, selectedReceivingClient.value)
  }

  const handleClientChange = selectedOption => {
    setSelectedClient(selectedOption)
  }

  const handleReceivingClientChange = selectedOption => {
    setSelectedReceivingClient(selectedOption)
  }

  const clientOptions = clients.map(client => ({
    value: client.id,
    label: client.name,
  }))

  // Set the initial selected receiving client
  useState(() => {
    const initialReceivingClient = clientOptions.find(
      option => option.value === clientReceivingMerge?.id
    )
    setSelectedReceivingClient(initialReceivingClient)
  }, [clientReceivingMerge, clientOptions])

  // Filter the dropdown options based on the selected client and receiving client
  const filteredClientOptions = clientOptions.filter(
    option =>
      option.value !== selectedReceivingClient?.value &&
      option.value !== selectedClient?.value
  )

  const filteredReceivingClientOptions = clientOptions.filter(
    option =>
      option.value !== selectedClient?.value &&
      option.value !== selectedReceivingClient?.value
  )

  // Custom styles for the left dropdown
  const leftDropdownStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: selectedClient ? '#ef4444' : provided.borderColor,
      boxShadow: state.isFocused
        ? `0 0 0 1px ${selectedClient ? '#ef4444' : provided.borderColor}`
        : provided.boxShadow,
      '&:hover': {
        borderColor: selectedClient ? '#ef4444' : provided.borderColor,
      },
    }),
    singleValue: (provided, state) => ({
      ...provided,
      color: selectedClient ? '#ef4444' : provided.color,
    }),
    menuList: provided => ({
      ...provided,
      maxHeight: '200px',
      fontSize: '16px',
    }),
  }

  // Custom styles for the right dropdown
  const rightDropdownStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: selectedReceivingClient ? '#16a34a' : provided.borderColor,
      boxShadow: state.isFocused
        ? `0 0 0 1px ${
            selectedReceivingClient ? '#16a34a' : provided.borderColor
          }`
        : provided.boxShadow,
      '&:hover': {
        borderColor: selectedReceivingClient ? '#16a34a' : provided.borderColor,
      },
    }),
    singleValue: (provided, state) => ({
      ...provided,
      color: selectedReceivingClient ? '#16a34a' : provided.color,
    }),
    menuList: provided => ({
      ...provided,
      maxHeight: '200px',
      fontSize: '16px',
    }),
  }

  // Only render if `show` is true
  return show ? (
    <div className='fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 px-2'>
      <div className='relative top-8 m-4 p-3 border max-w-3xl shadow-lg rounded-md bg-white mx-auto mt-5'>
        <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100'>
          <Icon className='h-6 w-6 text-blue-600 rotate-90' />
        </div>
        <h3 className='text-center text-lg sm:text-xl leading-6 font-medium text-gray-900'>
          Merge Clients
        </h3>
        <div className='py-3 px-0 sm:px-7 pb-3'>
          <p className='text-sm sm:text-base text-gray-600'>
            Select the clients you want to merge. The client on the{' '}
            <span className='text-black font-medium underline underline-offset-2'>
              left
            </span>{' '}
            will be{' '}
            <span className='text-black font-medium underline underline-offset-2'>
              deleted
            </span>{' '}
            and the goals and appointments will be{' '}
            <span className='text-black font-medium underline underline-offset-2'>
              merged
            </span>{' '}
            into the client on the{' '}
            <span className='text-black font-medium underline underline-offset-2'>
              right
            </span>
            .{' '}
            <span className='text-red-500 font-medium'>
              This action is permanent and cannot be undone.
            </span>
          </p>
        </div>

        <div className='flex flex-col justify-center items-center gap-8 my-6'>
          <div className='flex w-full justify-between items-center px-6'>
            <div className='flex flex-col w-5/12'>
              <h1 className='text-right font-medium'>FROM</h1>
              <Select
                options={filteredClientOptions}
                value={selectedClient}
                onChange={handleClientChange}
                placeholder='Select or search client to merge'
                styles={leftDropdownStyles}
              />
            </div>
            <div className='flex justify-center items-center w-2/12'>
              <FaLongArrowAltRight className='size-8 text-blue-600' />
            </div>
            <div className='flex flex-col w-5/12'>
              <h1 className='text-left font-medium'>TO</h1>
              <Select
                options={filteredReceivingClientOptions}
                value={selectedReceivingClient}
                onChange={handleReceivingClientChange}
                placeholder='Select or search receiving client'
                styles={rightDropdownStyles}
              />
            </div>
          </div>
        </div>
        <div className='flex justify-center gap-4 px-4 py-3'>
          <button
            id='cancel-btn'
            className='px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300'
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            id='confirm-btn'
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-800 disabled:hover:bg-gray-900 disabled:cursor-not-allowed'
            onClick={handleConfirm}
            disabled={!selectedClient?.value || !selectedReceivingClient?.value}
          >
            {buttonActionText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  ) : null
}

export default MergeClientModal
