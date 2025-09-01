import React, { useState } from 'react'
import { FaStop } from 'react-icons/fa'
import { FaMicrophoneLines, FaRegClock } from 'react-icons/fa6'
import { BeatLoader } from 'react-spinners'
import useAudioStore from '@/store/useAudioStore'
import Alert from '../ui/common/Alert'
import { MdWarning } from 'react-icons/md'
import useFormattedTimer from './useFormattedTimer'
import { CgNotes } from 'react-icons/cg'
import TemplateSelect from '../ui/common/TemplateSelect'
import { Tooltip } from 'react-tooltip/dist/react-tooltip'
import { IoPersonSharp } from 'react-icons/io5'
import Link from 'next/link'

const RecordingBar = () => {
  const {
    activeAppointment,
    isEnding,
    isPaused,
    pauseRecording,
    resumeRecording,
    isResuming,
    isPausing,
    stopRecording,
    cancelRecording,
    startRecording,
    templateId,
  } = useAudioStore()

  const [showCancelAlert, setShowCancelAlert] = useState(false)

  const NEGATIVE_STATUS_FILTER = [
    'SCHEDULED',
    'USER_DELETED',
    'USER_CANCELLED',
    'FAILED',
  ]
  const formattedTime = useFormattedTimer()

  let hideButtonDueToStatus = [
    'SCHEDULED',
    'USER_CANCELLED',
    'USER_DELETED',
    'FAILED',
    'PROCESSING',
    'GENERATING_NOTES',
  ]

  return (
    <div
      className='grid grid-cols-3 gap-2 items-center py-2 px-4 bg-blue-300 text-black border-t border-gray-200 z-50'
      style={{ zIndex: 1000 }}
    >
      {/* Section 1: Active Appointment Details */}
      <div className='flex justify-between items-center'>
        {activeAppointment && (
          <>
            <div className='flex flex-col'>
              <div className='flex items-center'>
                <IoPersonSharp className='text-black' />
                <Link
                  href={`/clientDetails/${activeAppointment.client?.id}`}
                  className='text-lg font-bold pl-1 text-black hover:underline hover:underline-offset-4'
                >
                  {activeAppointment?.client?.name}
                </Link>
              </div>
              <div className='flex items-center'>
                <FaRegClock className='text-sm' />
                <p className='text-base pl-1'>
                  {activeAppointment &&
                  activeAppointment?.scheduleStartAt &&
                  activeAppointment?.scheduleEndAt
                    ? `${new Date(
                        activeAppointment?.scheduleStartAt
                      ).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })} to ${new Date(
                        activeAppointment?.scheduleEndAt
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
            {!isEnding && (
              <button
                className='h-10 text-white bg-red-600 hover:bg-red-700 px-4 text-base py-2 font-semibold rounded-md disabled:bg-gray-800 disabled:hover:bg-gray-900 disabled:cursor-not-allowed mr-24'
                onClick={() => setShowCancelAlert(true)}
                disabled={isPausing || isResuming}
              >
                Delete
              </button>
            )}
          </>
        )}
      </div>

      {/* Section 2: Recording Controls */}
      <div className='flex items-center justify-center space-x-4'>
        {isEnding ? (
          <div className='flex items-center space-x-2'>
            <BeatLoader color='#4A90E2' size={16} />
            <span className='text-lg font-semibold'>Generating Notes...</span>
          </div>
        ) : (
          <>
            {(!activeAppointment ||
              (activeAppointment &&
                activeAppointment.status === 'SCHEDULED')) && (
              <button
                className='flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed'
                onClick={() => startRecording()}
                disabled={!activeAppointment}
              >
                <FaMicrophoneLines className='w-5 h-5' />
                <span>Start</span>
              </button>
            )}
            {activeAppointment &&
              activeAppointment.status === 'RECORDING' &&
              !isEnding &&
              !isPaused &&
              !isPausing && (
                <button
                  className='flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md animate-pulse hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed'
                  onClick={() => pauseRecording()}
                  disabled={isResuming}
                >
                  <span className='font-medium'>Stop</span>
                  <FaStop className='w-5 h-5' />
                </button>
              )}
            {activeAppointment &&
              (activeAppointment.status === 'PAUSED' ||
                activeAppointment.status === 'RECORDING') &&
              !isEnding &&
              (isPausing || isPaused) && (
                <>
                  <button
                    className='flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-28 disabled:bg-gray-600 disabled:cursor-not-allowed'
                    onClick={resumeRecording}
                    disabled={isPausing || isResuming}
                  >
                    <span className='font-medium'>Resume</span>
                    <FaMicrophoneLines className='size-6' />
                  </button>
                </>
              )}
            <span className='text-lg font-semibold'>{formattedTime}</span>
          </>
        )}
      </div>

      {/* Section 3: Generate Notes */}
      <div className='flex justify-end items-center space-x-4'>
        {activeAppointment &&
          !hideButtonDueToStatus.includes(activeAppointment?.status) && (
            <>
              {activeAppointment &&
                !NEGATIVE_STATUS_FILTER.includes(activeAppointment.status) &&
                isPaused &&
                !isPausing &&
                !isEnding &&
                activeAppointment.status == 'PAUSED' && (
                  <div>
                    <TemplateSelect
                      flexCol={false}
                      customClass='w-80'
                      mobile={true}
                    />
                  </div>
                )}
              {!isEnding &&
                activeAppointment &&
                !NEGATIVE_STATUS_FILTER.includes(activeAppointment.status) && (
                  <>
                    {activeAppointment?.status !== 'GENERATING_NOTES' && (
                      <div className='flex items-center space-x-2'>
                        <button
                          className='flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed'
                          onClick={stopRecording}
                          disabled={
                            isPausing || isResuming || !isPaused || !templateId
                          }
                          data-tooltip-id='generateNotes'
                          data-tooltip-content='Must select a template to be able to generate notes or go to Templates page and set a default template'
                        >
                          <CgNotes className='w-5 h-5' />
                          <span>Generate</span>
                        </button>
                        {!templateId && (
                          <Tooltip
                            id='generateNotes'
                            style={{
                              marginLeft: '-0px',
                              padding: '3px 12px',
                              width: '280px',
                              display: 'flex',
                              justifyContent: 'center',
                              textAlign: 'center',
                            }}
                          />
                        )}
                      </div>
                    )}
                  </>
                )}
            </>
          )}
      </div>

      {showCancelAlert && (
        <Alert
          show={showCancelAlert}
          title='Delete Recording'
          message='Are you sure you want to delete the recording? This action can not be undone.'
          onCancel={() => setShowCancelAlert(false)}
          onConfirm={() => {
            cancelRecording()
            setShowCancelAlert(false)
          }}
          Icon={MdWarning}
          buttonActionText='Delete Recording'
        />
      )}
    </div>
  )
}

export default RecordingBar
