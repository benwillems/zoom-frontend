import React, { useState } from 'react'
import { FaArrowRightLong, FaNotesMedical } from 'react-icons/fa6'
import { MdPeopleAlt } from 'react-icons/md'
import useClientStore from '@/store/clientStore'
import { convertToLocalTime } from '@/utils/dates'
import Select from 'react-select'
import useSearchClientsStore from '@/store/useSearchClientsStore'
import RecordDetailsMulti from './RecordDetailsMulti'
import useNotificationStore from '@/store/useNotificationStore'
import { FaRegSave } from 'react-icons/fa'

// Individual Log Item Component
const LogItem = ({ appointment, isLast, index, updateAppointmentNotes }) => {
  const { clients } = useSearchClientsStore()
  const { multiClientsSelected, setMultiClientsSelected } = useClientStore()

  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)

  const clientOptions = clients
    .filter(
      client =>
        !multiClientsSelected.some(selected => selected?.id === client.id)
    )
    .map(client => ({
      value: client.id,
      label: client.name,
    }))

  console.log('Log Item', appointment)

  const getLetterFromIndex = index => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return alphabet[index % alphabet.length]
  }

  const handleClientChange = (selectedOption, index) => {
    const updatedClients = [...multiClientsSelected]
    if (selectedOption) {
      updatedClients[index] = {
        id: selectedOption.value,
        name: selectedOption.label,
      }
    } else {
      updatedClients.splice(index, 1)
    }
    setMultiClientsSelected(updatedClients)
    setSelectedClient(selectedOption)
  }

  return (
    <div className='flex'>
      <div
        className={`block sm:flex sm:items-start w-full mb-2 sm:mb-0 ${
          isExpanded ? 'pb-4' : ''
        } select-none`}
      >
        <div className='hidden sm:block relative mr-2 flex-shrink-0'>
          <div className='flex flex-col items-center mt-3'>
            <div
              className={`w-8 h-8 rounded-full flex justify-center items-center ${
                isExpanded ? 'bg-green-300' : 'bg-blue-300'
              } text-black`}
            >
              <MdPeopleAlt />
            </div>
            {!isExpanded && !isLast && (
              <div className='w-[2px] h-8 bg-gray-300 flex-grow mt-2'></div>
            )}
          </div>
        </div>
        <div
          className={`flex-1 px-0 sm:px-4 py-1.5 bg-gray-200 sm:hover:bg-blue-200 rounded-lg transition-all duration-300`}
        >
          <div
            className='flex items-center sm:flex-row text-center sm:text-start sm:items-center justify-between cursor-pointer w-full'
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className='flex flex-row items-center justify-center w-full'>
              <div
                className={`flex justify-center items-center w-8 h-8 mr-2 rounded-full sm:hidden ${
                  isExpanded ? 'bg-green-300' : 'bg-blue-300'
                } text-black block ml-2`}
              >
                <MdPeopleAlt />
              </div>
              <div className='flex-1 text-start'>
                <h1 className='font-bold text-sm sm:text-base ellipsis pr-2'>
                  {selectedClient
                    ? `${
                        selectedClient?.label
                      } has been assigned to note ${getLetterFromIndex(index)}`
                    : `Assign note ${getLetterFromIndex(index)} to a client`}
                </h1>
                <h2 className='font-normal text-sm'>
                  {convertToLocalTime(appointment?.date)}
                </h2>
              </div>
            </div>

            <div className='flex w-auto sm:w-40 justify-end items-center text-blue-400 gap-1.5 pr-2 sm:pr-0 '>
              <FaNotesMedical className='size-5 mr-0.5 sm:size-4' />
              <p className='hidden sm:block uppercase text-base font-semibold'>
                {isExpanded ? 'close' : 'view'}
              </p>
            </div>
          </div>

          {isExpanded && (
            <RecordDetailsMulti
              setIsExpanded={setIsExpanded}
              appointment={{ notes: appointment?.appointment }}
              appointmentId={appointment?.id}
              updateAppointmentNotes={updateAppointmentNotes}
              noteIndex={index}
            />
          )}
        </div>
      </div>

      <div></div>

      <div className='flex justify-center w-96 mx-2 mt-2'>
        <FaArrowRightLong className='mr-5 size-6 mt-2' />
        <div className='flex flex-col'>
          <Select
            options={clientOptions}
            value={selectedClient}
            onChange={selectedOption =>
              handleClientChange(selectedOption, index)
            }
            placeholder={`Assign note ${getLetterFromIndex(index)} to a client`}
            className='w-60'
            isClearable={true}
          />
        </div>
      </div>
    </div>
  )
}

// Main Log Component
const AppointmentLogMulti = appointments => {
  // console.log(appointments.appointments)

  const { addNotification } = useNotificationStore()

  console.log(appointments)

  const updateAppointmentNotes = async (
    appointmentId,
    updatedNotes,
    noteIndex
  ) => {
    try {
      console.log('update function', updatedNotes)

      const payload = {
        updatedNotes: appointments?.appointments?.notes.map((note, index) =>
          index === noteIndex ? updatedNotes : note
        ),
        appointmentId,
      }
      const response = await fetch('/api/update-appointment-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok.')
      }

      addNotification({
        iconColor: 'green',
        header: 'Note was saved!',
        icon: FaRegSave,
        hideProgressBar: false,
      })
    } catch (error) {
      console.error('Failed to save changes:', error)
    }
  }

  return (
    <div>
      {appointments?.appointments?.notes.length > 0 &&
        appointments?.appointments?.notes.map((appointment, index) => (
          <LogItem
            key={appointment?.id || index}
            appointment={{ ...appointments?.appointments, appointment }}
            isFirst={index === 0}
            index={index}
            isLast={index === appointments?.appointments?.notes?.length - 1}
            updateAppointmentNotes={updateAppointmentNotes}
          />
        ))}
    </div>
  )
}

export default AppointmentLogMulti
