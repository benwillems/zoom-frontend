import CalendarDisplay from '@/components/Mobile/CalendarDisplay'
import React, { useState } from 'react'
import ScheduleAppointmentModal from './ScheduleAppointmentModal'
import { FaPlus } from 'react-icons/fa6'
import DisplayTooltip from '@/components/common/DisplayTooltip'
import useAudioStore from '@/store/useAudioStore'

const ScheduleAppointmentHeader = ({
  selectedClient,
  setSelectedClient,
  searchTerm,
  setSearchTerm,
}) => {
  const {
    setActiveAppointment,
    setIsSchedule,
    isEditSchedule,
    setIsEditSchedule,
  } = useAudioStore()
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  const openScheduleModal = () => {
    setIsScheduleModalOpen(true)
    setActiveAppointment(null)
    setSelectedClient(null)
  }

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false)
    setIsEditSchedule(null)
    setSelectedClient(null)
  }

  return (
    <>
      <div className='pt-3 flex flex-col border-b border-gray-200 space-y-1.5 sm:space-y-3'>
        <CalendarDisplay />
        <div className='flex items-center pb-2.5 sm:pb-4 space-x-3'>
          <input
            type='text'
            placeholder='Search appointment'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='flex-1 block w-full py-1 px-2 sm:p-2 text-base text-gray-900 bg-gray-50 rounded-md border border-gray-300 focus:outline focus:outline-blue-300'
          />
          {/* Desktop */}
          <div className='hidden sm:flex sm:justify-center sm:items-center'>
            <DisplayTooltip
              id='scheduleAppointmentFormHP'
              message='Schedule an Appointment'
              place='top'
              effect='solid'
              variant='dark'
              customStyle={{
                marginLeft: '-0px',
                padding: '3px 12px',
                display: 'flex',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <button
                onClick={openScheduleModal}
                className='hidden sm:flex justify-center items-center h-9 w-9 bg-blue-500 hover:bg-blue-600 text-white'
              >
                <FaPlus />
              </button>
            </DisplayTooltip>
          </div>

          {/* Mobile */}
          <div className='flex sm:hidden'>
            <button
              onClick={() => {
                setIsSchedule(true)
                setActiveAppointment(null)
              }}
              className='flex sm:hidden justify-center items-center h-7 w-7 p-0.5 bg-blue-500 hover:bg-blue-600 text-white'
            >
              <FaPlus />
            </button>
          </div>
        </div>
      </div>
      {(isScheduleModalOpen || isEditSchedule) && (
        <ScheduleAppointmentModal
          onClose={closeScheduleModal}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
        />
      )}
    </>
  )
}

export default ScheduleAppointmentHeader
