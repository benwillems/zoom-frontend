import useAudioStore from '@/store/useAudioStore'
import React from 'react'
import { FaRegCalendar } from 'react-icons/fa6'
import { MdOutlinePets, MdPeopleAlt, MdWarning } from 'react-icons/md'

function StatusBadge({ status, isPausing }) {
  let colorClasses
  let displayStatus = status

  if (isPausing) {
    displayStatus = 'UPLOADING'
    colorClasses = 'bg-gray-50 text-gray-800 ring-gray-600/20'
  } else {
    switch (status) {
      case 'FAILED':
        colorClasses = 'bg-red-50 text-red-700 ring-red-600/10'
        break
      case 'RECORDING':
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
  }

  return (
    <span
      className={`inline-flex items-center w-full justify-center rounded-md px-2 py-1 text-xs font-medium ${colorClasses} ring-1 ring-inset`}
    >
      {displayStatus.replaceAll(/_/g, ' ')}
    </span>
  )
}

const ActiveRecordingScreen = () => {
  const { activeAppointment, isPausing } = useAudioStore()

  let displayDate = (
    <div className='flex items-center space-x-2'>
      <div className='w-4 flex-shrink-0'>
        <FaRegCalendar className='text-lg' />
      </div>
      <p className='text-base font-semibold'>
        {activeAppointment &&
        activeAppointment.scheduleStartAt &&
        activeAppointment.scheduleEndAt
          ? `${new Date(activeAppointment?.scheduleStartAt).toLocaleDateString(
              [],
              {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              }
            )} • ${new Date(
              activeAppointment?.scheduleStartAt
            ).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })} - ${new Date(
              activeAppointment?.scheduleEndAt
            ).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}`
          : new Date(activeAppointment?.date).toLocaleTimeString([], {
              weekday: 'short',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
      </p>
    </div>
  )

  let isRecording = activeAppointment?.status == 'RECORDING' && !isPausing

  return (
    <div className='flex flex-col h-full'>
      {activeAppointment && (
        <div className='flex flex-grow justify-center items-center w-full px-3 pb-32'>
          <div className='flex flex-1 flex-col space-y-2 rounded-md'>
            <div
              className={`flex flex-col h-32 justify-center items-center text-center text-red-500 pb-10 select-none`}
            >
              {isRecording && (
                <>
                  <MdWarning className='text-4xl mb-2' />
                  <p className='text-lg font-bold uppercase '>
                    Refreshing the page will result in your recording being
                    lost!
                  </p>
                </>
              )}
            </div>
            <div className='flex w-full justify-end items-end'>
              <div className='w-24 flex mt-0.5'>
                <StatusBadge
                  status={activeAppointment?.status}
                  isPausing={isPausing}
                />
              </div>
            </div>

            <div className='flex items-center space-x-2 font-bold text-xl'>
              <div className='w-4 flex-shrink-0'>
                <MdPeopleAlt />
              </div>
              <p>{activeAppointment?.client?.name}</p>
            </div>
            <div className='flex items-center'>{displayDate}</div>
            <div className='flex items-center ellipsis'>
              <p className='text-base'>
                {activeAppointment?.description
                  ? activeAppointment?.description
                  : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActiveRecordingScreen
