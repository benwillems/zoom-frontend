import React from 'react'
import { FaPencil, FaRegClock } from 'react-icons/fa6'
import {
  MdDelete,
  MdOutlineCancel,
  MdPeopleAlt,
  MdWarning,
} from 'react-icons/md'
import { BeatLoader } from 'react-spinners'

const DisplayMessageAboutAppointment = ({ activeAppointment }) => {
  const getContentByStatus = () => {
    switch (activeAppointment?.status) {
      case 'SCHEDULED':
        return (
          <>
            <div className='flex sm:hidden items-center absolute top-0 left-0 px-4 mt-1.5'>
              <FaPencil className='size-3' />
              <h1 className='text-sm mb-0.5 pl-1'>Edit appointment</h1>
            </div>
            <div className='flex sm:hidden flex-col justify-center h-full items-start pt-5'>
              <div className='flex flex-col items-start text-base flex-wrap'>
                <div className='flex items-center space-x-1 pr-2 font-bold '>
                  <MdPeopleAlt />
                  <p>{activeAppointment?.client?.name}</p>
                </div>
                {/* <div className='flex items-center space-x-1'>
                  <MdPeopleAlt />
                  <p>{activeAppointment?.pet?.client?.name}</p>
                </div> */}
              </div>
              {/* <p className='text-sm font-semibold'>
                {activeAppointment?.title}
              </p> */}
              <div className='flex items-center'>
                <FaRegClock className='text-base' />

                <p className='text-sm pl-1'>
                  {activeAppointment &&
                  activeAppointment.scheduleStartAt &&
                  activeAppointment.scheduleEndAt
                    ? `${new Date(
                        activeAppointment.scheduleStartAt
                      ).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })} to ${new Date(
                        activeAppointment.scheduleEndAt
                      ).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}`
                    : new Date(activeAppointment?.date).toLocaleString([], {
                        weekday: 'short',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                </p>
              </div>
            </div>
          </>
        )
      case 'USER_CANCELLED':
        return (
          <div className='flex h-full justify-center items-center flex-col text-red-500 space-y-3'>
            <MdOutlineCancel className='text-3xl sm:text-5xl' />
            <p className='text-base sm:text-2xl font-semibold'>
              Appointment for{' '}
              <span className='font-bold underline underline-offset-4'>
                {activeAppointment?.client?.name}
              </span>{' '}
              was cancelled!
            </p>
          </div>
        )
      case 'USER_DELETED':
        return (
          <div className='flex h-full justify-center items-center flex-col text-gray-500 space-y-3'>
            <MdDelete className='text-3xl sm:text-5xl' />
            <p className='text-base sm:text-2xl font-semibold'>
              Appointment for{' '}
              <span className='font-bold underline underline-offset-4'>
                {activeAppointment?.client?.name}
              </span>{' '}
              was deleted!
            </p>
          </div>
        )
      case 'FAILED':
        return (
          <div className='flex h-full justify-center items-center flex-col text-red-500 space-y-3'>
            <MdWarning className='text-3xl sm:text-5xl' />
            <p className='text-base sm:text-2xl font-semibold'>
              Recording for{' '}
              <span className='font-bold underline underline-offset-4'>
                {activeAppointment?.client?.name}
              </span>{' '}
              failed
            </p>
          </div>
        )
      case 'PROCESSING':
      case 'GENERATING_NOTES':
        return (
          <>
            {/* Mobile */}
            <div className='flex sm:hidden h-full justify-center items-center space-x-3'>
              <BeatLoader color='#4A90E2' size={16} />
              <p className='text-xl font-semibold'>Generating Notes...</p>
            </div>
            {/* Desktop */}
            <div className='hidden sm:flex h-full justify-center items-center space-x-3'>
              <BeatLoader color='#4A90E2' size={28} />
              <p className='text-2xl font-semibold'>Generating Notes...</p>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return <>{getContentByStatus()}</>
}

export default DisplayMessageAboutAppointment
