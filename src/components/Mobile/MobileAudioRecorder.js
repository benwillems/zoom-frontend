import React from 'react'
import { MdOutlinePets, MdPeopleAlt } from 'react-icons/md'
import { BeatLoader } from 'react-spinners'
import { IoMdCloudUpload } from 'react-icons/io'
import useAudioStore from '@/store/useAudioStore'
import AudioRecorderHP from '../audio/AudioRecordingHP'
import useFormattedTimer from '../audio/useFormattedTimer'
import { CgNotes } from 'react-icons/cg'
import { FaMicrophoneLines } from 'react-icons/fa6'
import DisplayMessageAboutAppointment from './DisplayMessageAboutAppointment'
import TemplateSelect from '../ui/common/TemplateSelect'

const MobileAudioRecorder = ({ selectedClient, setSelectedClient }) => {
  const {
    activeAppointment,
    isEnding,
    isPaused,
    isResuming,
    isPausing,
    stopRecording,
    isSchedule,
    setIsEditSchedule,
    templateId,
  } = useAudioStore()

  const formattedTime = useFormattedTimer()

  const NEGATIVE_STATUS_FILTER = [
    'SCHEDULED',
    'USER_DELETED',
    'USER_CANCELLED',
    'FAILED',
    'PROCESSING',
    'GENERATING_NOTES',
  ]

  const displayClientName = selectedClientForAppointment => {
    if (selectedClientForAppointment?.name) {
      return (
        <>
          <MdPeopleAlt />
          <p>{selectedClientForAppointment?.name}</p>
        </>
      )
    } else if (
      selectedClientForAppointment?.label?.startsWith('Add new client')
    ) {
      return (
        <>
          <MdPeopleAlt />
          <p>{selectedClientForAppointment?.label}</p>
        </>
      )
    }
  }

  let SCHEDULED_APPOINTMENT = activeAppointment?.status == 'SCHEDULED'

  const HIDE_BUTTONS_DUE_TO_STATUS = [
    'USER_CANCELLED',
    'USER_DELETED',
    'FAILED',
    'PROCESSING',
    'GENERATING_NOTES',
  ]

  return (
    <div className='flex flex-col justify-center items-center w-full px-2 pb-2 pt-2 sm:hidden bg-lt-primary-off-white'>
      {activeAppointment &&
        !NEGATIVE_STATUS_FILTER.includes(activeAppointment.status) &&
        isPaused &&
        !isPausing &&
        !isEnding &&
        activeAppointment.status == 'PAUSED' && (
          <div className='w-full'>
            <TemplateSelect
              flexCol={true}
              customClass='mb-3 mt-2'
              mobile={true}
            />
          </div>
        )}
      {!isSchedule && (
        <>
          <div
            className={`flex h-28 w-full rounded-md outline outline-1 ${
              activeAppointment?.status == 'RECORDING' && !isPausing
                ? 'outline-red-500 animate-pulse'
                : 'outline-gray-500'
            } `}
          >
            <div
              className={`${
                SCHEDULED_APPOINTMENT ? 'w-[80%]' : 'w-full'
              } border-r border-1 border-gray-200`}
            >
              {activeAppointment &&
                NEGATIVE_STATUS_FILTER.includes(activeAppointment.status) && (
                  <div
                    className='flex flex-col h-full px-4 py-2 relative'
                    onClick={
                      SCHEDULED_APPOINTMENT
                        ? () => setIsEditSchedule(true)
                        : null
                    }
                  >
                    <DisplayMessageAboutAppointment
                      activeAppointment={activeAppointment}
                    />
                  </div>
                )}

              <div className='flex flex-col h-full w-full py-2 justify-center items-center'>
                {isEnding && (
                  <div className='flex flex-col w-full h-full text-center flex-grow items-center justify-center'>
                    <div className='flex space-x-2'>
                      <BeatLoader color='#4A90E2' size={14} />
                      <span className='text-sm font-bold'>
                        Generating Notes
                      </span>
                    </div>
                    <h1 className='text-sm pt-2 px-4 font-semibold'>
                      Notes may take up to 1 minute to generate. You can record
                      another appointment while waiting.
                    </h1>
                  </div>
                )}
                {!activeAppointment && !selectedClient && (
                  <div className='flex flex-col h-full flex-grow text-center items-center justify-center px-2 space-y-2'>
                    <h1 className='text-base'>
                      Select an appointment above to start recording
                    </h1>
                  </div>
                )}
                {!activeAppointment && selectedClient && (
                  <div className='flex flex-col h-full flex-grow text-center items-center justify-center px-2 space-y-2'>
                    <h1 className='text-base font-semibold'>
                      Start Appointment
                    </h1>
                    <div className='flex flex-col items-center space-y-2 text-sm flex-wrap'>
                      <div className='flex items-center space-x-1'>
                        {displayClientName(selectedClient)}
                      </div>
                      {/* <div className='flex items-center space-x-1'>
                        <MdPeopleAlt />
                        <p>{selectedClient?.label}</p>
                      </div> */}
                    </div>
                  </div>
                )}
                <div className='flex-grow flex flex-col justify-center'>
                  {!isEnding &&
                    activeAppointment &&
                    !NEGATIVE_STATUS_FILTER.includes(
                      activeAppointment.status
                    ) && (
                      <>
                        {!isEnding &&
                          !isPaused &&
                          !isPausing &&
                          activeAppointment.status == 'RECORDING' && (
                            <div className='flex items-center space-x-4 text-red-500'>
                              <div className='w-4 text-2xl flex-shrink-0'>
                                <FaMicrophoneLines />
                              </div>
                              <p className='text-2xl font-semibold'>
                                {formattedTime}
                              </p>
                            </div>
                          )}
                        {isPaused &&
                          !isPausing &&
                          activeAppointment.status == 'PAUSED' && (
                            <div className='flex items-center space-x-3'>
                              <div className='w-4 text-2xl flex-shrink-0'>
                                <FaMicrophoneLines />
                              </div>
                              <p className='text-2xl font-semibold'>
                                {formattedTime}
                              </p>
                            </div>
                          )}
                        {isPausing && (
                          <div className='flex justify-center items-center space-x-2'>
                            <p className='text-xl font-semibold'>
                              Uploading Audio
                            </p>
                            <IoMdCloudUpload className='text-3xl text-blue-600' />
                          </div>
                        )}
                      </>
                    )}
                </div>

                {!isEnding &&
                  activeAppointment &&
                  activeAppointment?.status !== 'RECORDING' &&
                  !NEGATIVE_STATUS_FILTER.includes(
                    activeAppointment?.status
                  ) && (
                    <>
                      {isResuming ? (
                        <div className='flex h-full justify-center items-center space-x-2'>
                          <p className='text-xl font-semibold'>
                            Resuming recording
                          </p>
                        </div>
                      ) : (
                        <button
                          className='flex justify-center items-center mb-2 text-white bg-green-600 hover:bg-green-700 px-4 text-base py-1.5 font-semibold rounded-md disabled:cursor-not-allowed disabled:bg-gray-800 disabled:hover:bg-gray-900'
                          onClick={() => {
                            stopRecording()
                            setSelectedClient(null)
                          }}
                          disabled={
                            isPausing || isResuming || !isPaused || !templateId
                          }
                        >
                          Generate Notes
                          <CgNotes className='text-lg ml-2' />
                        </button>
                      )}
                    </>
                  )}
              </div>
            </div>

            {!HIDE_BUTTONS_DUE_TO_STATUS.includes(activeAppointment?.status) &&
              !isEnding && (
                <div className='flex-1 flex justify-center items-center h-full px-3'>
                  <AudioRecorderHP
                    clientId={
                      typeof selectedClient?.value == 'number'
                        ? selectedClient?.value
                        : null
                    }
                    clientName={
                      typeof selectedClient?.value == 'string'
                        ? selectedClient?.value
                        : null
                    }
                    setSelectedClient={setSelectedClient}
                  />
                </div>
              )}
          </div>
        </>
      )}
    </div>
  )
}

export default MobileAudioRecorder
