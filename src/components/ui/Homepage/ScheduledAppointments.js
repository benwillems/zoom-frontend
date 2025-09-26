import React, { useEffect, useState } from 'react'
import {
  MdDelete,
  MdOutlineCancel,
  MdPeopleAlt,
  MdWarning,
} from 'react-icons/md'
import useClientStore from '@/store/clientStore'
import { CgNotes } from 'react-icons/cg'
import useAudioStore from '@/store/useAudioStore'
import { BiRefresh } from 'react-icons/bi'
import {
  FaArrowsSpin,
  FaMicrophoneLines,
  FaPause,
  FaRegCalendarCheck,
  FaRegClock,
} from 'react-icons/fa6'
import CircleSpinner from '@/components/common/CircleSpinner'
import Link from 'next/link'
import { fetchWithAuth } from '@/utils/generalUtils'
import { IoPersonSharp } from 'react-icons/io5'
import AppointmentMultiModal from './MultiClient/AppointmentMultiModal'
import { HiLightBulb } from 'react-icons/hi'
import AICourseModal from '@/components/modals/AICourseModal'

function StatusBadgeREadOnly({ status }) {
  let colorClasses
  let displayText = status.replaceAll(/_/g, ' ')

  switch (status) {
    case 'FAILED':
      colorClasses = 'bg-red-50 text-red-700 ring-red-600/10'
      break
    case 'RECORDING':
      colorClasses = 'bg-red-50 text-red-700 ring-red-600/10'
      break
    case 'USER_CANCELLED':
      colorClasses = 'bg-red-50 text-red-700 ring-red-600/10'
      displayText = 'CANCELLED'
      break
    case 'SUCCEEDED':
      colorClasses = 'bg-green-50 text-green-700 ring-green-600/20'
      break
    case 'SUCCEEDED_MULTI':
      colorClasses = 'bg-green-50 text-green-700 ring-green-600/20'
      displayText = 'SUCCEEDED'
      break
    case 'NO_SHOW':
      colorClasses = 'bg-red-50 text-red-700 ring-red-600/20'
      displayText = 'NO SHOW'
      break
    case 'SCHEDULED':
      colorClasses = 'bg-blue-50 text-blue-700 ring-blue-600/20'
      break
    case 'PAUSED':
      colorClasses = 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
      break
    case 'PROCESSING':
      colorClasses = 'bg-gray-50 text-gray-600 ring-gray-500/10'
      break
    case 'GENERATING_NOTES':
      colorClasses = 'bg-purple-50 text-purple-700 ring-purple-700/10'
      displayText = 'GENERATING'
      break
    case 'WAITING_FOR_TEMPLATE_INPUT':
      colorClasses = 'bg-yellow-50 text-gray-600 ring-gray-500/10'
      displayText = 'WAITING'
      break
    case 'MEETING_ENDED':
      colorClasses = 'bg-gray-50 text-gray-600 ring-gray-500/10'
      displayText = 'ENDED'
      break
    case 'MEETING_STARTED':
      colorClasses = 'bg-gray-50 text-gray-600 ring-gray-500/10'
      displayText = 'STARTED'
      break
    case 'USER_DELETED':
      colorClasses = 'bg-gray-50 text-gray-600 ring-gray-500/10'
      displayText = 'DELETED'
      break
    default:
      colorClasses = 'bg-gray-50 text-gray-600 ring-gray-500/10'
  }

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${colorClasses} ring-1 ring-inset`}
    >
      {displayText}
    </span>
  )
}

const ScheduledAppointments = ({ searchTerm, selectedStatuses }) => {
  const {
    setAppointmentNote,
    events,
    appointmentNote,
    isAppointmentsLoading,
    fetchAllAppointments,
  } = useClientStore()

  const {
    activeAppointment,
    setActiveAppointment,
    setIsNoteLoading,
    setCurrentTimer,
    setIsSchedule,
    pauseRecording,
    setNoAppointmentsForTheDay,
    regenerateNotes,
    templateId,
  } = useAudioStore()

  const [openMultiClientModal, setOpenMultiClientModal] = useState(false)
  const [multiClientAppointment, setMultiClientAppointment] = useState(null)

    // add new state for AI Course Modal
    const [openAICourseModal, setOpenAICourseModal] = useState(false)
    const [currentAppointment, setCurrentAppointment] = useState(null)

  useEffect(() => {
    const noAppointmentsForTheDay = !(events?.length > 0)
    setNoAppointmentsForTheDay(noAppointmentsForTheDay)

    // let pollInterval

    // Only poll if NO appointment is PROCESSING or GENERATING_NOTES
    // const hasProcessingOrGenerating = Array.isArray(events)
    //   ? events.some(
    //       appointment =>
    //         appointment.status === 'PROCESSING' ||
    //         appointment.status === 'GENERATING_NOTES'
    //     )
    //   : false

    // if (!hasProcessingOrGenerating) {
    //   pollInterval = setInterval(() => {
    //     fetchAllAppointments()
    //   }, 5000)
    // }

    return () => {
      // clearInterval(pollInterval)
    }
  }, [events])

  const statusPriority = [
    'RECORDING',
    'SCHEDULED', 
    'PAUSED',
    'SUCCEEDED',
    'SUCCEEDED_MULTI',
    'PROCESSING',
    'GENERATING_NOTES',
    'NO_SHOW', // Add this new status
    'FAILED',
    'USER_CANCELLED', 
    'USER_DELETED',
    'WAITING_FOR_TEMPLATE_INPUT',
    'MEETING_ENDED',
    'MEETING_STARTED',
  ]

  // Filter appointments based on the selected statuses
  const filteredAppointments = Array?.isArray(events)
    ? events?.filter(appointment =>
        selectedStatuses?.includes(appointment?.status)
      )
    : []

  // Custom sorting function to sort by status, then start time, then duration (for same start time)
  filteredAppointments?.sort((a, b) => {
    const priorityA = statusPriority.indexOf(a?.status)
    const priorityB = statusPriority.indexOf(b?.status)

    // Sort by status priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }

    // Convert scheduleStartAt or date to Date objects
    const startTimeA = new Date(a?.scheduleStartAt || a?.date)
    const startTimeB = new Date(b?.scheduleStartAt || b?.date)

    // Sort by start time if different
    if (startTimeA?.getTime() !== startTimeB?.getTime()) {
      return startTimeA - startTimeB
    }

    // If the start times are the same, sort by the duration (shorter duration first)
    // Note: If scheduleEndAt is missing, treat the end time as the same as the start time (i.e., zero duration)
    const endTimeA = a?.scheduleEndAt ? new Date(a?.scheduleEndAt) : startTimeA
    const endTimeB = b?.scheduleEndAt ? new Date(b?.scheduleEndAt) : startTimeB
    const durationA = endTimeA - startTimeA
    const durationB = endTimeB - startTimeB

    return durationA - durationB
  })

  const searchedAppointments = filteredAppointments?.filter(
    appointment =>
      appointment?.title?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      appointment?.client?.name
        .toLowerCase()
        .includes(searchTerm?.toLowerCase())
  )

  const handleSetActiveAppointment = (status, appointment) => {
    if (status == 'SUCCEEDED') {
      setIsNoteLoading(true)
      fetchWithAuth(`/api/appointment/${appointment?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => {
          setAppointmentNote(data?.appointment)
          setActiveAppointment(null)
          setIsNoteLoading(false)
        })
        .catch(error => {
          console.error('Error fetching note: ', error)
          setIsNoteLoading(false)
        })
    } else if (activeAppointment?.status == 'RECORDING') {
      // pauseRecording()
      setActiveAppointment(appointment)
    } else if (status == 'SUCCEEDED_MULTI') {
      setOpenMultiClientModal(true)
      setMultiClientAppointment(appointment)
    } else {
      setActiveAppointment(appointment)
      setCurrentTimer(appointment?.currentTimerMili)
      setAppointmentNote(null)
    }
    setIsSchedule(false)
  }

  const handleRegenerateNotes = async (e, appointment) => {
    e.stopPropagation() // Prevent the appointment from being selected
    try {
      await regenerateNotes(appointment.id, templateId, appointment.client?.id)
      // Refresh appointments list to show updated status
      await fetchAllAppointments()
    } catch (error) {
      console.error('Error regenerating notes:', error)
    }
  }

  let displayIcons = status => {
    // if (status == 'SCHEDULED') {
    //   return <FaRegCalendarCheck className='text-base sm:text-lg' />
    // } else if (status == 'RECORDING') {
    //   return <FaMicrophoneLines className='text-base sm:text-lg' />
    // } else if (status == 'PAUSED') {
    //   return <FaPause className='text-base sm:text-lg' />
    // }
    if (status == 'SUCCEEDED_MULTI') {
      return (
        <div className='flex space-x-1.5 items-center text-red-600 font-medium'>
          <MdWarning className='text-base text-red-500' />
          <p className='text-sm'>Action Needed</p>
        </div>
      )
      // } else if (status == 'USER_CANCELLED') {
      //   return <MdOutlineCancel className='text-base sm:text-lg' />
      // } else if (status == 'USER_DELETED') {
      //   return <MdDelete className='text-base sm:text-lg' />
      // } else if (status == 'FAILED') {
      //   return <MdWarning className='text-base sm:text-lg' />
      // } else if (status == 'GENERATING_NOTES') {
      //   return <FaArrowsSpin className='text-base sm:text-lg' />
      // }
    }
  }

  if (isAppointmentsLoading) {
    return <CircleSpinner loading={isAppointmentsLoading} />
  }

  if (!isAppointmentsLoading && (!events || events.length === 0)) {
    return (
      <div className='h-full sm:h-auto flex text-center justify-center items-center sm:pt-4'>
        <h1 className='font-semibold text-base sm:text-lg'>
          No appointments have been scheduled for today
        </h1>
      </div>
    )
  }

  return (
    <>
      {searchedAppointments?.map(appointment => {
        let matchedAppointment =
          appointment?.id === activeAppointment?.id ||
          (!activeAppointment && appointment?.id === appointmentNote?.id)

        return (
          <div
            key={appointment?.id}
            className={`flex flex-row sm:last:mb-0 text-start items-center justify-between py-2 sm:py-3 px-2 sm:px-2.5 border-b border-gray-200 ${
              matchedAppointment
                ? 'bg-blue-300 sm:bg-blue-300 px-2 sm:px-0'
                : 'hover:bg-blue-100'
            } cursor-pointer`}
            onClick={() =>
              handleSetActiveAppointment(appointment?.status, appointment)
            }
          >
            <div className='flex-1 pr-4 relative space-y-1'>
              <div className='flex flex-col items-start flex-wrap'>
                <div className='hidden sm:flex items-center space-x-1 text-base font-bold pr-2'>
                  <IoPersonSharp />
                  <p>{appointment?.client?.name}</p>
                </div>
                <Link
                  href={`/clientDetails/${appointment?.client?.id}`}
                  className='sm:hidden flex items-center space-x-1 text-base font-bold pr-2'
                >
                  <IoPersonSharp />
                  <p className='text-blue-600'>{appointment?.client?.name}</p>
                </Link>
              </div>
              <div className='flex items-center'>
                <FaRegClock className='text-sm' />

                <p className='text-base md:text-base text-black pl-1'>
                  {appointment &&
                  appointment?.scheduleStartAt &&
                  appointment?.scheduleEndAt
                    ? `${new Date(
                        appointment?.scheduleStartAt
                      ).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })} to ${new Date(
                        appointment?.scheduleEndAt
                      ).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}`
                    : new Date(appointment?.date).toLocaleString([], {
                        weekday: 'short',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                </p>
              </div>
              {/* <h3 className='text-sm text-black font pr-4 ellipsis'>
                {appointment?.title ? appointment?.title : ''}
              </h3> */}
            </div>
            <div className='flex flex-col h-16 w-32 justify-between items-end select-none relative space-y-1.5'>
              <div className=' mt-1'>
                <StatusBadgeREadOnly status={appointment?.status} />
              </div>
              <div className="absolute bottom-0 right-0">
                {displayIcons(appointment?.status)}
                {(appointment?.status === 'SUCCEEDED' ||
                  appointment?.status === 'SUCCEEDED_MULTI') && (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      setCurrentAppointment(appointment)
                      setOpenAICourseModal(true)
                    }}
                    className="bg-blue-500 text-white px-2 py-1 text-xs rounded mt-1 flex items-center space-x-1"
                  >
                    <HiLightBulb className="text-lg" />
                    <span className="hidden sm:block">
                      {appointment.totalScore !== null &&
                      appointment.obtainedScore !== null
                        ? `Score: ${appointment.obtainedScore}/${appointment.totalScore}`
                        : 'AI Course'}
                    </span>
                  </button>
                   )}
                {appointment?.status === 'FAILED' && (
                  <button
                    onClick={e => handleRegenerateNotes(e, appointment)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded mt-1 flex items-center space-x-1 transition-colors"
                    title="Regenerate notes for this failed appointment"
                  >
                    <BiRefresh className="text-sm" />
                    <span className="hidden sm:block">Regenerate</span>
                  </button>
                )}
                </div>
              
            </div>
          </div>
        )
      })}

      {openMultiClientModal && (
        <AppointmentMultiModal
          appointments={multiClientAppointment}
          onCancel={() => {
            setOpenMultiClientModal(false)
            setMultiClientAppointment([])
          }}
        />
      )}

{openAICourseModal && (
        <AICourseModal
          appointment={currentAppointment}
          onClose={() => setOpenAICourseModal(false)}
        />
      )}

    </>
  )
}

export default ScheduledAppointments