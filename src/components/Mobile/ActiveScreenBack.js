import useClientStore from '@/store/clientStore'
import useAudioStore from '@/store/useAudioStore'
import React from 'react'
import { MdKeyboardBackspace } from 'react-icons/md'
import MobileTooltip from './MobileTooltip'

const ActiveScreenBack = ({ setSearchTerm }) => {
  const { activeAppointment, setActiveAppointment, isPausing } = useAudioStore()
  const { fetchAllAppointments } = useClientStore()

  const isDisabled = activeAppointment?.status === 'RECORDING' || isPausing

  const handleBackClick = () => {
    if (!isDisabled) {
      setActiveAppointment(null)
      setSearchTerm('')
      fetchAllAppointments()
    }
  }

  return (
    <>
      {activeAppointment && (
        <MobileTooltip
          message={
            isPausing
              ? 'Recording is uploading, please wait'
              : 'Pause your recording before going back'
          }
          disabled={isDisabled}
        >
          <button
            className='flex justify-start items-center mx-1 mt-3 text-blue-500 space-x-1 cursor-pointer hover:underline hover:underline-offset-4 disabled:text-gray-500 select-none'
            disabled={isDisabled}
          >
            <MdKeyboardBackspace />
            <p className='text-base font-semibold' onClick={handleBackClick}>
              Back to Appointments
            </p>
          </button>
        </MobileTooltip>
      )}
    </>
  )
}

export default ActiveScreenBack
