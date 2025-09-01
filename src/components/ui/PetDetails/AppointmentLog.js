import React, { useState, useMemo } from 'react'
import { FaNotesMedical } from 'react-icons/fa6'
import RecordDetails from './RecordDetails'
import useClientStore from '@/store/clientStore'
import { convertToLocalTime } from '@/utils/dates'
import useChatStore from '@/store/useChatStore'
import ScheduledAppointment from './AppointmentType/ScheduledAppointment'
import CircleSpinner from '@/components/common/CircleSpinner'
import { MdNote } from 'react-icons/md'

// Individual Log Item Component
const LogItem = ({ appointment, isLast }) => {
  const setAppointmentNote = useClientStore(state => state.setAppointmentNote)
  const { appointmentReferencesFromChat } = useChatStore()
  const [isExpanded, setIsExpanded] = useState(false)

  let toHighlight = appointmentReferencesFromChat.includes(appointment.id)

  // Handler to update appointment note in Zustand store
  const handleNoteClick = () => {
    setAppointmentNote(appointment) // Store the selected appointment's note
  }

  return (
    <>
      {appointment.status == 'SCHEDULED' ? (
        <ScheduledAppointment appointment={appointment} isLast={isLast} />
      ) : (
        <div
          className={`block sm:flex sm:items-start w-full ${
            isExpanded ? 'pb-4' : ''
          } ${isLast ? 'mb-[50vh]' : 'mb-2 sm:mb-0'} `}
          onClick={handleNoteClick}
        >
          <div className='hidden sm:block relative mr-2 flex-shrink-0'>
            <div className='flex flex-col items-center mt-3'>
              <div
                className={`w-8 h-8 rounded-full flex justify-center items-center ${
                  isExpanded ? 'bg-green-300' : 'bg-blue-300'
                } text-black`}
              >
                <MdNote />
              </div>
              {!isExpanded && !isLast && (
                <div className='w-[2px] h-8 bg-gray-300 flex-grow mt-2'></div>
              )}
            </div>
          </div>
          <div
            className={`flex-1 px-0 sm:px-4 py-1.5 ${
              toHighlight && !isExpanded ? 'bg-yellow-200' : ''
            } ${
              !isExpanded ? 'hover:bg-gray-200' : 'bg-gray-200'
            } sm:hover:bg-gray-200 rounded-lg transition-all duration-300`}
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
                  <MdNote />
                </div>
                <div className='flex-1 text-start'>
                  <h1 className='font-bold text-sm sm:text-base ellipsis pr-2'>
                    {appointment?.notes?.summary
                      ? appointment?.notes?.summary
                      : 'No summary was found'}
                  </h1>
                  <h2 className='font-normal text-sm'>
                    {convertToLocalTime(appointment?.scheduleStartAt)}
                  </h2>
                </div>
              </div>

              {/* <div className='flex flex-col ml-auto items-end rounded-md bg-blue-50 text-blue-700 border border-blue-600/20'>
                <p className='flex justify-center text-sm px-2 py-1 w-32 '>
                  {appointment?.template?.name}
                </p>
              </div> */}

              <div className='flex w-auto sm:w-40 justify-end items-center text-blue-400 gap-1.5 pr-2 sm:pr-0 '>
                <FaNotesMedical className='size-5 mr-0.5 sm:size-4' />
                <p className='hidden sm:block uppercase text-base font-semibold'>
                  {isExpanded ? 'close' : 'view'}
                </p>
              </div>
            </div>

            {isExpanded && (
              <RecordDetails
                setIsExpanded={setIsExpanded}
                appointment={appointment}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

// Main Log Component
const AppointmentLog = () => {
  const { filteredAppointments, clientDetails, isFetchingClientRecordings } =
    useClientStore()
  
    const sortedAppointments = useMemo(() => {
      return [...filteredAppointments].sort((a, b) => {
        return (
          new Date(b.scheduleStartAt).getTime() -
          new Date(a.scheduleStartAt).getTime()
        )
      })
    }, [filteredAppointments])

  return (
    <div className='w-full py-4 px-4'>
      <h1 className='pb-4 text-xl font-bold'>Latest Appointments</h1>
      {isFetchingClientRecordings ? (
        <div className='flex justify-center items-center h-[56.4vh]'>
          <CircleSpinner loading={isFetchingClientRecordings} />
          <h1 className='text-lg'>Loading appointments...</h1>
        </div>
      ) : sortedAppointments.length > 0 ? (
        sortedAppointments.map((appointment, index) => (
          <LogItem
            key={appointment.id || index}
            appointment={appointment}
            isFirst={index === 0}
            isLast={index === sortedAppointments.length - 1}
          />
        ))
      ) : (
        <div className='flex justify-center items-center mx-1 h-[56.4vh] sm:mx-0'>
          <p className='text-lg'>
            No appointments for{' '}
            <span className='font-bold'>{clientDetails?.name}</span> were found
          </p>
        </div>
      )}
    </div>
  )
}

export default AppointmentLog
