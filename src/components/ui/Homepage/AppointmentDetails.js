import React, { useState, useEffect } from 'react'
import useClientStore from '@/store/clientStore'
import { MdDelete, MdPeopleAlt, MdWarning, MdClose } from 'react-icons/md'
import useAudioStore from '@/store/useAudioStore'
import Link from 'next/link'
import { FaPencil, FaRegCalendarCheck, FaLink } from 'react-icons/fa6'
import Alert from '../common/Alert'
import { RiDeleteBin6Line } from 'react-icons/ri'
import useNotificationStore from '@/store/useNotificationStore'
import { IoPersonSharp } from 'react-icons/io5'
import ProgramStatusBar from '@/components/Program/ProgramStatus'
import { BsChatDots } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import animationData from "@/animations/Animation.json";
import buttonAnimationData from "@/animations/Animation3.json";
import closeAnimationData from "@/animations/Animationclosed.json";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { fetchWithAuth } from '@/utils/generalUtils' // Correct import path


const AppointmentDetails = ({ useAppointmentNote }) => {
  const { appointmentNote, fetchAllAppointments } = useClientStore()
  const { activeAppointment, setActiveAppointment, setIsEditSchedule } =
    useAudioStore()
  const { addNotification } = useNotificationStore()

  const [showAlert, setShowAlert] = useState(false)
  const [showNoShowAlert, setShowNoShowAlert] = useState(false) // Add this state
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState([])
  const [loading, setLoading] = useState(false)
  const [openCategories, setOpenCategories] = useState({})

  const appointmentDetails = useAppointmentNote
    ? appointmentNote
    : activeAppointment

  const { id } = appointmentDetails

  const markAppointmentAsDeleted = async () => {
    try {
      const response = await fetch(`/api/appointment/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: id,
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok.')
      }

      addNotification({
        iconColor: 'red',
        header: 'Appointment was deleted!',
        icon: RiDeleteBin6Line,
        hideProgressBar: false,
      })

      setActiveAppointment(null)
      fetchAllAppointments()
    } catch (error) {
      console.error('Failed to mark appointment as deleted:', error)
    }
  }

  // Display Alert
  const deleteAppointment = () => {
    markAppointmentAsDeleted(id)
    setShowAlert(false)
  }

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard')
    })
  }

  // 1. In state, track open/closed by a unique key for each node:
  const [openNodes, setOpenNodes] = useState({})

  // 2. Toggle helper:
  const toggleNode = nodeId =>
    setOpenNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }))

  // 3. Human-readable title formatter (optional):
  const formatKey = key =>
    key
      .replace(/([A-Z])/g, ' $1') // camelCase → words
      .replace(/^./, str => str.toUpperCase())

  // 4. Recursive renderer:
  const renderTalkingPoints = (data, parentId = '') =>
    Object.entries(data).map(([key, value]) => {
      const nodeId = parentId ? `${parentId}.${key}` : key
      const isArray = Array.isArray(value)
      const isObject = value !== null && typeof value === 'object' && !isArray

      return (
        <motion.div
          key={nodeId}
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className='bg-white border border-gray-300 rounded-xl shadow-md'
        >
          {/* Header */}
          <div
            className='flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50'
            onClick={() => toggleNode(nodeId)}
          >
            <h3 className='text-lg font-semibold'>{formatKey(key)}</h3>
            <span className='text-sm text-gray-600'>
              {isArray
                ? `${value.length} item${value.length !== 1 ? 's' : ''}`
                : isObject
                ? `${Object.keys(value).length} section${
                    Object.keys(value).length !== 1 ? 's' : ''
                  }`
                : String(value).slice(0, 20) +
                  (String(value).length > 20 ? '…' : '')}
            </span>
            {openNodes[nodeId] ? (
              <MdExpandLess className='text-2xl' />
            ) : (
              <MdExpandMore className='text-2xl' />
            )}
          </div>

          {/* Body */}
          <AnimatePresence>
            {openNodes[nodeId] && (
              <motion.div
                layout
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className='overflow-hidden border-t border-gray-200'
              >
                <div className='p-4 space-y-2'>
                  {isArray && (
                    <ul className='list-disc list-inside space-y-1'>
                      {value.map((pt, i) => (
                        <li key={i} className='text-gray-700'>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  )}
                  {isObject && renderTalkingPoints(value, nodeId)}
                  {!isArray && !isObject && (
                    <p className='text-gray-700'>{String(value)}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )
    })

  useEffect(() => {
    let timeoutId
    let isCancelled = false
    const controller = new AbortController()

    const pollTalkingPoints = async () => {
      if (isCancelled) return
      setLoading(true)
      try {
        const payload = { appointmentId: appointmentDetails.id }
        const response = await fetch(`/api/talkingPoints/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error('Network response was not ok.')
        }

        const data = await response.json()

        if (isCancelled) return

        // If valid talkingPoints data is found, update state and stop polling
        if (data.talkingPoints && Object.keys(data.talkingPoints).length > 0) {
          setPopupData(data.talkingPoints)
          setLoading(false)
          // Do not schedule another poll since we got valid data
        } else {
          // Schedule the next poll after 1 second if data is empty
          timeoutId = setTimeout(pollTalkingPoints, 1000)
        }
      } catch (error) {
        if (error.name === 'AbortError') return // fetch was aborted, exit silently
        console.error('Failed to fetch data:', error)
        // In case of an error, try again after 1 second
        timeoutId = setTimeout(pollTalkingPoints, 1000)
      }
    }

    if (showPopup) {
      pollTalkingPoints()
    }

    // Cleanup function: cancel polling when popup is closed
    return () => {
      isCancelled = true
      controller.abort() // abort any ongoing fetch
      clearTimeout(timeoutId) // clear any pending timeout
    }
  }, [showPopup, appointmentDetails.id])

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const modalVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  }

  const buttonAnimationOptions = {
    loop: true,
    autoplay: true,
    animationData: buttonAnimationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  const closeAnimationOptions = {
    loop: false,
    autoplay: true,
    animationData: closeAnimationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
      imageAssetsFolder: '/lottie-assets/',
    },
  }

  const toggleCategory = category => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }))
  }

  // Add this new function to handle No Show
  const markAppointmentAsNoShow = async () => {
    try {
      const response = await fetchWithAuth(`/api/appointment/noshow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: id,
          status: 'NO_SHOW',
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok.')
      }

      addNotification({
        iconColor: 'orange',
        header: 'Appointment marked as No Show!',
        icon: MdWarning,
        hideProgressBar: false,
      })

      setActiveAppointment(null)
      fetchAllAppointments()
    } catch (error) {
      console.error('Failed to mark appointment as no show:', error)
      addNotification({
        iconColor: 'red',
        header: 'Failed to mark appointment as No Show',
        icon: MdWarning,
        hideProgressBar: false,
      })
    }
  }

  // Add this function to handle No Show confirmation
  const handleNoShow = () => {
    markAppointmentAsNoShow()
    setShowNoShowAlert(false)
  }

  return (
    <div className='flex flex-col justify-start sm:justify-center px-2 sm:px-0 h-20 sm:h-36 w-full'>
      {appointmentDetails && (
        <div className='flex'>
          <div className='flex flex-1 flex-col space-y-0 sm:space-y-0.5 pr-4'>
            <div className='flex justify-start items-center sm:space-x-1 text-base sm:text-2xl font-bold'>
              <div className='w-5 sm:w-7'>
                <IoPersonSharp />
              </div>
              <p className='block sm:hidden text-black'>
                {appointmentDetails?.client?.name}
              </p>

              <Link
                className='hidden sm:block text-blue-600 hover:underline hover:underline-offset-4'
                href={`/clientDetails/${appointmentDetails?.client?.id}`}
              >
                {appointmentDetails?.client?.name}
              </Link>
            </div>
            <div className='flex items-center space-x-4 flex-wrap'>
              <div className='flex items-center sm:space-x-1'>
                <div className='w-5 sm:w-7'>
                  <FaRegCalendarCheck className='text-base sm:text-2xl' />
                </div>
                <p className='text-sm sm:text-xl'>
                  {appointmentDetails &&
                  appointmentDetails.scheduleStartAt &&
                  appointmentDetails.scheduleEndAt
                    ? `${new Date(
                        appointmentDetails.scheduleStartAt
                      ).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })} to ${new Date(
                        appointmentDetails.scheduleEndAt
                      ).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}`
                    : new Date(appointmentDetails?.date).toLocaleString([], {
                        weekday: 'short',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                </p>
              </div>
            </div>

            {/* <h1 className='text-base sm:text-base'>
              {appointmentDetails?.title
                ? activeAppointment?.title
                : 'No title was added'}
            </h1> */}

            {appointmentDetails?.isMultiMembers && (
              <div className='flex items-center space-x-2.5 ml-0.5'>
                <MdPeopleAlt className='text-base sm:text-xl' />
                <p className='italic'>
                  Multiple clients will be attending this call.
                </p>
              </div>
            )}
            <div className='flex items-center ellipsis'>
              <p className='text-xs sm:text-base'>
                {appointmentDetails?.description
                  ? appointmentDetails?.description
                  : ''}
              </p>
            </div>
            <div className='w-1/2 '>
              {appointmentDetails && (
                <>
                  {/* {console.log("clientDetails", appointmentDetails)}
                  <ProgramStatusBar
                    clientDetails={appointmentDetails?.client}
                    size="xl"
                    weight="bold"
                  /> */}
                  {appointmentDetails.zoomMeeting?.meetingJoinUrl && (
                    <div className='flex items-center space-x-3'>
                      <div className='flex items-center space-x-3  '>
                        <FaLink className='w-6 h-6 text-black' />

                        <button
                          onClick={() =>
                            copyToClipboard(
                              appointmentDetails.zoomMeeting.meetingJoinUrl
                            )
                          }
                          className=' hidden sm:block text-blue-600 hover:underline hover:underline-offset-4 sm:space-x-1 text-base sm:text-2xl font-bold'
                        >
                          <span className='text-sm  sm:text-xl truncate max-w-[150px] hidden sm:block text-blue-600 hover:underline hover:underline-offset-4'>
                            Zoom Link
                          </span>
                          <span className='sr-only'>Copy link</span>
                          <span className='absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-white text-gray-700 text-xs rounded py-1 px-2 whitespace-nowrap'>
                            Copy link
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className='flex flex-wrap gap-2 items-end '>
            <div className='relative group top-2'>
              <button
                className='text-gray-600 hover:text-gray-800 pr-7 pt-3 rounded-full hover:bg-gray-100 transition-colors duration-200'
                onClick={() => setShowPopup(true)}
              >
               <BsChatDots className="w-8 h-8" />
              </button>

              <div className='absolute -top-8 left-0 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2'>
                Talking Point
              </div>
            </div>

            <AnimatePresence>
              {showPopup && (
                <motion.div
                  className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'
                  variants={backdropVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  onClick={() => setShowPopup(false)}
                >
                  <motion.div
                    className='relative bg-white p-6 rounded-3xl shadow-2xl  w-[65%] mx-4 overflow-hidden'
                    variants={modalVariants}
                    onClick={e => e.stopPropagation()}
                    style={{ maxHeight: '80vh', overflowY: 'auto' }}
                  >
                    <div className='sticky -top-6 bg-white pb-4 z-10'>
                      {/* <button
                        className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full"
                        onClick={() => setShowPopup(false)}
                      >
                        <Lottie options={closeAnimationOptions} height={79} width={79} />
                      </button> */}
                      <button
                        className='absolute top-2 right-2 flex items-center justify-center w-7 h-7 text-red-500 border-[3px] border-red-500 rounded-full'
                        onClick={() => setShowPopup(false)}
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          className='w-5 h-5'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={3}
                            d='M6 18L18 6M6 6l12 12'
                          />
                        </svg>
                      </button>
                      <h2 className='text-2xl font-semibold mb-4 text-center'>
                        Talking Points
                      </h2>
                    </div>

                    <div>
                      {loading ? (
                        <div>
                          <div className="flex justify-center mb-4">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                          </div>
                          <p className="text-center">Loading...</p>
                        </div>
                      ) : (
                        <div className='space-y-4'>
                          {popupData && Object.keys(popupData).length > 0 ? (
                            renderTalkingPoints(popupData)
                          ) : (
                            <p className='text-center text-gray-500'>
                              No data available
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* <div className='flex flex-wrap gap-2'> */}
            {/* {!appointmentNote && activeAppointment?.status == 'SCHEDULED' && ( */}
            {!appointmentNote && (activeAppointment?.status == 'SCHEDULED' || activeAppointment?.status == 'MEETING_STARTED' || activeAppointment?.status == 'MEETING_ENDED') && (
              <div className='flex justify-end items-end h-full text-sm space-x-2'>
                <button
                  className='flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-sm'
                  onClick={() => setIsEditSchedule(true)}
                >
                  <FaPencil />
                  <p>Edit</p>
                </button>

                <button
                  className='flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-sm'
                  onClick={() => setShowNoShowAlert(true)}
                >
                  <MdWarning />
                  <p>No Show</p>
                </button>
              </div>
            )}

            {/* Delete button - show for SCHEDULED or USER_CANCELLED appointments */}
            {!appointmentNote &&
              (activeAppointment?.status == 'SCHEDULED' ||
                activeAppointment?.status == 'USER_CANCELLED') && (
                <div className='flex justify-end items-end h-full text-sm'>
                  <button
                    className='flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-sm'
                    onClick={() => setShowAlert(true)}
                  >
                    <MdDelete className='size-5' />
                    <p>Delete</p>
                  </button>
                </div>
              )}

            {/* Delete Alert */}
            {showAlert && (
              <Alert
                title='Delete Appointment'
                message='Are you sure you want to delete this appointment? This action cannot be undone.'
                onCancel={() => setShowAlert(false)}
                onConfirm={deleteAppointment}
                buttonActionText={'Delete'}
                Icon={MdWarning}
              />
            )}

            {/* No Show Alert */}
            {showNoShowAlert && (
              <Alert
                title='Mark as No Show'
                message='Are you sure you want to mark this appointment as No Show? The client did not attend the scheduled appointment.'
                onCancel={() => setShowNoShowAlert(false)}
                onConfirm={handleNoShow}
                buttonActionText={'Mark No Show'}
                Icon={MdWarning}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentDetails
