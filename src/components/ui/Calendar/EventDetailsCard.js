import React, { useEffect, useState } from 'react'
import { IoClose } from 'react-icons/io5'
import {
  MdOutlineEdit,
  MdOutlinePets,
  MdPeopleAlt,
  MdWarning,
} from 'react-icons/md'
import { RiDeleteBin6Line } from 'react-icons/ri'
import { LuText } from 'react-icons/lu'
import { BiText } from 'react-icons/bi'
import useSearchClientsStore from '@/store/useSearchClientsStore'
import { useRef } from 'react'
import useEscapeAndOutsideClick from '@/components/hooks/useEscapeAndOutsideClick'
import Alert from '../common/Alert'

function StatusBadge({ status }) {
  let colorClasses

  switch (status) {
    case 'FAILED':
      colorClasses = 'bg-red-50 text-red-700 ring-red-600/10'
      break
    case 'USER_CANCELLED':
      colorClasses = 'bg-red-50 text-red-700 ring-red-600/10'
      break
    case 'SUCCEEDED':
      colorClasses = 'bg-green-50 text-green-700 ring-green-600/20'
      break
    case 'NO_SHOW':
      colorClasses = 'bg-red-50 text-red-700 ring-red-600/20'
      break
    case 'SCHEDULED':
      colorClasses = 'bg-blue-50 text-blue-700 ring-blue-600/20'
      break
    case 'PAUSED':
      colorClasses = 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
      break
    case 'PROCESSING':
      colorClasses = 'bg-blue-50 text-blue-700 ring-blue-700/10'
      break
    case 'GENERATING NOTES':
      colorClasses = 'bg-purple-50 text-purple-700 ring-purple-700/10'
      break
    default:
      colorClasses = 'bg-gray-50 text-gray-600 ring-gray-500/10'
  }

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${colorClasses} ring-1 ring-inset`}
    >
      {status.replaceAll(/_/g, ' ')}
    </span>
  )
}

const EventDetailsCard = ({
  event,
  onClose,
  onEdit,
  onDelete,
  position,
  fetchAllAppointments,
}) => {
  if (!event) return null // Don't render if there's no event

  const { clients } = useSearchClientsStore()
  const [showAlert, setShowAlert] = useState(false)
  const [isOutsideClickActive, setIsOutsideClickActive] = useState(true)
  const [associatedClient, setAssociatedClient] = useState('')

  // Ref for handling outside click
  const formRef = useRef(null)
  useEscapeAndOutsideClick(formRef, onClose, isOutsideClickActive)

  useEffect(() => {
    if (clients?.length > 0) {
      const foundClient = clients.find(client => client?.id === event?.clientId)
      setAssociatedClient(foundClient)
    }
  }, [event, clients])

  // Format the start and end times
  const startTime = event?.start?.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const endTime = event?.end?.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const formatDate = date => {
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
    return date?.toLocaleDateString([], options)
  }

  const removeAppointmentFromCalendar = appointmentId => {
    const formData = new FormData()

    if (appointmentId) {
      formData.append('appointmentId', appointmentId)
    }

    fetch(`/api/appointment/delete`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(() => {
        fetchAllAppointments()
        setShowAlert(false)
        setIsOutsideClickActive(true)
        onDelete()
      })
      .catch(error =>
        console.error('Error deleting appointment from calendar', error)
      )
  }

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: `${position?.y}px`,
          left: `${position?.x}px`,
          zIndex: 10,
        }}
        key={event?.id}
        className='bg-white shadow-2xl drop-shadow-2xl h-auto w-[410px] px-3 pt-3 pb-5 rounded-lg space-y-1.5'
        ref={formRef}
      >
        <div className='flex justify-between px-2'>
          <div>
            <StatusBadge status={event?.status} />
          </div>
          <div className='flex items-center space-x-2'>
            {event?.status == 'SCHEDULED' && (
              <button
                onClick={onEdit}
                className='text-base p-1.5 rounded-full bg-gray-600 hover:bg-gray-700 text-white'
              >
                <MdOutlineEdit />
              </button>
            )}
            <button
              onClick={() => {
                setIsOutsideClickActive(false)
                setShowAlert(true)
              }}
              className='text-base p-1.5 rounded-full bg-gray-600 hover:bg-gray-700 text-white'
            >
              <RiDeleteBin6Line />
            </button>
            <button
              onClick={onClose}
              className='text-base p-1.5 rounded-full bg-gray-600 hover:bg-gray-700 text-white'
            >
              <IoClose />
            </button>{' '}
          </div>
        </div>
        <div className='flex space-x-2'>
          <div className='flex-shrink-0'>
            <span className='inline-flex items-start mt-2 justify-center h-full mr-2 pl-2 rounded-l-md'>
              <span className='text-xs text-gray-600'>
                <BiText className='text-xl' />
              </span>
            </span>
          </div>
          <div className='flex-grow'>
            <h3 className='text-lg font-semibold text-gray-700'>
              {event?.title
                ? event?.title
                : `Appointment for ${associatedPet?.name}`}
            </h3>
            <p className='text-sm'>
              {formatDate(event?.start)} • {`${startTime} - ${endTime}`}
            </p>
          </div>
        </div>
        <div className='flex flex-col pl-1.5 space-y-0.5'>
          {associatedClient && (
            <div className='flex'>
              <div className='flex-shrink-0 self-start'>
                <span className='inline-flex items-center justify-center h-6 w-6'>
                  <MdPeopleAlt className='text-xl text-gray-600' />
                </span>
              </div>
              <div className='flex-grow'>
                <p className='text-base ml-4'>{associatedClient?.name}</p>
              </div>
            </div>
          )}
          {event?.description && (
            <div className='flex'>
              <div className='flex-shrink-0 self-start'>
                <span className='inline-flex items-center justify-center h-6 w-6'>
                  <LuText className='text-xl text-gray-600' />
                </span>
              </div>
              <div className='flex-grow'>
                <p className='text-base ml-4'>{event?.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {showAlert && (
        <Alert
          title={`Remove ${event?.title} from Calendar?`}
          message={`Are you sure you want to remove ${event?.title}? This cannot be undone.`}
          onCancel={() => {
            setShowAlert(false)
          }}
          onConfirm={() => {
            removeAppointmentFromCalendar(event?.id)
          }}
          buttonActionText='Confirm'
          Icon={MdWarning}
        />
      )}
    </>
  )
}

export default EventDetailsCard
