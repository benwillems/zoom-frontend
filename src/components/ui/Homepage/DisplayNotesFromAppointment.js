import React from 'react'
import { MdOutlineCancel } from 'react-icons/md'
import RecordDetails from '../PetDetails/RecordDetails'
import useClientStore from '@/store/clientStore'
import useAudioStore from '@/store/useAudioStore'
import CircleSpinner from '@/components/common/CircleSpinner'
import AppointmentDetails from './AppointmentDetails'

const DisplayNotesFromAppointment = ({ setSelectedClient, setSearchTerm }) => {
  const { appointmentNote, setAppointmentNote } = useClientStore()
  const { setActiveAppointment, isNoteLoading, setNoAppointmentsForTheDay } =
    useAudioStore()

  const closeNote = () => {
    setNoAppointmentsForTheDay(false)
    setActiveAppointment(null)
    setAppointmentNote(null)
    setSelectedClient(null)
    setSearchTerm('')
  }

  return (
    <div className='flex flex-col sm:max-h-[96vh] h-screen relative z-40 sm:h-full w-full lg:w-[90%] px-0 pt-2 sm:px-6 bg-white rounded-lg border sm:mx-6 sm:my-4 lg:mx-0 border-gray-200 shadow-lg'>
      {isNoteLoading ? (
        <CircleSpinner loading={isNoteLoading} />
      ) : (
        <>
          <div className='flex justify-between'>
            <AppointmentDetails useAppointmentNote={true} />
            <div className=''>
              <button
                onClick={closeNote}
                className='text-red-400 disabled:text-gray-400 disabled:cursor-not-allowed'
              >
                <MdOutlineCancel className='mr-1 sm:mr-0 text-4xl' />
              </button>
            </div>
          </div>
          {appointmentNote?.notes?.summary && (
            <div className='flex items-start space-x-2 px-2 sm:px-0 mt-2 sm:mt-2 pb-2 sm:pb-1 border-b sm:mb-0 mb-0'>
              <h1 className='text-sm sm:text-lg font-semibold'>Summary:</h1>
              <p className='text-sm sm:text-lg'>
                {appointmentNote?.notes?.summary}
              </p>
            </div>
          )}
          <div className='overflow-y-auto hide-scrollbar'>
            <RecordDetails homePage={true} />
          </div>
          {/* <div className='sm:hidden absolute bottom-0 flex justify-center items-center w-full'>
            <button
              className='w-full mx-1 rounded-sm text-base py-2 px-2 mt-2 mb-0.5 bg-red-400 hover:bg-red-500 text-white font-semibold'
              onClick={closeNote}
            >
              Close Note
            </button>
          </div> */}
        </>
      )}
    </div>
  )
}

export default DisplayNotesFromAppointment
