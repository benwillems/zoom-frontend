import React, { useEffect, useState } from 'react'
import { CiCircleMore } from 'react-icons/ci'
import {
  FaHeadphonesAlt,
  FaRegCheckCircle,
  FaRegEdit,
  FaRegFilePdf,
  FaRegSave,
} from 'react-icons/fa'
import { HiOutlineClipboardCopy } from 'react-icons/hi'
import { RiDeleteBin6Line } from 'react-icons/ri'
import ReactTextareaAutosize from 'react-textarea-autosize'
import CopyButton from '../common/CopyButton'
import copy from 'copy-to-clipboard'
import { downloadClientNotesAsPDF } from '@/utils/clientDetailActions'
import useClientStore from '@/store/clientStore'
import pdfConfig from '../../pdf/pdfConfig.json'
import Attachments from './Attachments/Attachments'
import useNotificationStore from '@/store/useNotificationStore'
import Alert from '@/components/ui/common/Alert'
import { MdWarning } from 'react-icons/md'
import Email from './Email/Email'
import CustomAudioPlayer from './Audio/CustomAudioPlayer'
import { FaRegCopy } from 'react-icons/fa6'
import CopyAppointmentToAClientModal from './AppointmentRecordDetails/CopyAppointmentToAClientModal'
import { fetchWithAuth } from '@/utils/generalUtils'

const sectionAttributes = {
  topics_to_discuss: {
    title: 'Topics to Discuss',
    headerBGColor: 'bg-blue-300',
    borderColor: 'border-blue-100',
  },
  onboarding_details: {
    title: 'Onboarding Details',
    headerBGColor: 'bg-blue-300',
    borderColor: 'border-blue-100',
  },
  recap_or_homework: {
    title: 'Recap or homework',
    headerBGColor: 'bg-purple-300',
    borderColor: 'border-purple-100',
  },
  obstacles: {
    title: 'Obstacles',
    headerBGColor: 'bg-red-300',
    borderColor: 'border-red-100',
  },
  notes: {
    title: 'Notes',
    headerBGColor: 'bg-green-300',
    borderColor: 'border-green-100',
  },
  wins: {
    title: 'Wins',
    headerBGColor: 'bg-green-300',
    borderColor: 'border-green-100',
  },
  goals: {
    title: 'Goals',
    headerBGColor: 'bg-green-300',
    borderColor: 'border-green-100',
  },
  nutrition_targets: {
    title: 'Nutrition Targets',
    headerBGColor: 'bg-orange-300',
    borderColor: 'border-orange-100',
  },
  calorie_goal_breakdown: {
    title: 'Calorie Goal Breakdown',
    headerBGColor: 'bg-orange-300',
    borderColor: 'border-orange-100',
  },
  nutritional_assessment: {
    title: 'Nutritional Assessment',
    headerBGColor: 'bg-orange-300',
    borderColor: 'border-orange-100',
  },
  why_now: {
    title: 'Why Now',
    headerBGColor: 'bg-indigo-300',
    borderColor: 'border-indigo-100',
  },
  last_check_in_call_report: {
    title: 'Last Check in Call Report',
    headerBGColor: 'bg-gray-300',
    borderColor: 'border-gray-100',
  },
  // Add other known sections here
}

// Define a list of colors for unknown sections
const defaultColors = [
  { headerBGColor: 'bg-indigo-300', borderColor: 'border-indigo-100' },
  { headerBGColor: 'bg-teal-300', borderColor: 'border-teal-100' },
  { headerBGColor: 'bg-pink-300', borderColor: 'border-pink-100' },
  { headerBGColor: 'bg-yellow-300', borderColor: 'border-yellow-100' },
  { headerBGColor: 'bg-purple-300', borderColor: 'border-purple-100' },
  { headerBGColor: 'bg-orange-300', borderColor: 'border-orange-100' },
  { headerBGColor: 'bg-lime-300', borderColor: 'border-lime-100' },
  { headerBGColor: 'bg-cyan-300', borderColor: 'border-cyan-100' },
  { headerBGColor: 'bg-fuchsia-300', borderColor: 'border-fuchsia-100' },
  { headerBGColor: 'bg-rose-300', borderColor: 'border-rose-100' },
]

const orderedSections = [
  'onboard_details',
  'calorie_goal_breakdown',
  'nutritional_assessment',
  'why_now',
  'goals',
  'notes',
  'nutrition_targets',
  'wins',
  'obstacles',
  'topics_to_discuss',
  'last_check_in_call_report',
  'recap_or_homework',
  // Add other known sections here in the order you want them to appear
]

const formatKeyName = key => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const RecordDetails = ({ appointment, setIsExpanded, homePage }) => {
  const { addNotification } = useNotificationStore()
  const { fetchClientRecords, appointmentNote } = useClientStore()
  if (!appointment) {
    appointment = appointmentNote
  }
  const { notes: appointmentNotes, id, clientId } = appointment || {}
  const [showAlert, setShowAlert] = useState(false)
  const [tabInView, setTabInView] = useState('appointment')
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editedRecord, setEditedRecord] = useState(
    Object.entries(appointmentNotes || {}).reduce((acc, [key, value]) => {
      acc[key] = value || `No ${formatKeyName(key)} was found`
      return acc
    }, {})
  )

  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [audioUrls, setAudioUrls] = useState([])
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false)

  useEffect(() => {
    setEditedRecord(
      Object.entries(appointmentNotes || {}).reduce((acc, [key, value]) => {
        acc[key] = value || `No ${formatKeyName(key)} was found`
        return acc
      }, {})
    )
  }, [appointmentNotes])

  const handleCopyAllNotes = () => {
    const soapOrder = [
      'onboarding_details',
      'calorie_goal_breakdown',
      'nutritional_assessment',
      'why_now',
      'goals',
      'notes',
      'nutrition_targets',
      'wins',
      'obstacles',
      'topics_to_discuss',
      'last_check_in_call_report',
      'recap_or_homework',
    ]

    let allNotesText = soapOrder
      .map(key => {
        if (editedRecord.hasOwnProperty(key)) {
          const title = key
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          return `**${title}:**\n${editedRecord[key]}\n` // Surround the header with double asterisks
        }
        return null
      })
      .filter(section => section !== null)
      .join('\n') // Use a single newline to separate sections

    copy(allNotesText)

    addNotification({
      iconColor: 'green',
      header: 'All notes copied!',
      description: 'You can now paste all your notes',
      icon: FaRegCheckCircle,
      hideProgressBar: false,
    })

    setShowMoreOptions(false)
  }

  // Utility function to handle input changes
  const handleInputChange = (section, value) => {
    setEditedRecord({
      ...editedRecord,
      [section]: value,
    })
  }

  const convertMiliToTime = timerMilli => {
    let seconds = Math.floor(timerMilli / 1000) // Convert milliseconds to seconds
    let minutes = Math.floor(seconds / 60) // Convert seconds to minutes
    seconds = seconds % 60 // Remaining seconds
    let hours = Math.floor(minutes / 60) // Convert minutes to hours
    minutes = minutes % 60 // Remaining minutes

    // Formatting to ensure two digits
    hours = hours.toString().padStart(2, '0')
    minutes = minutes.toString().padStart(2, '0')
    seconds = seconds.toString().padStart(2, '0')

    console.log(timerMilli)
    console.log(`${hours}:${minutes}:${seconds}`)
    return `${hours}:${minutes}:${seconds}`
  }

  const updateAppointmentNotes = async (appointmentId, updatedNotes) => {
    try {
      const payload = {
        updatedNotes,
        appointmentId,
      }
      const response = await fetch('/api/update-appointment-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok.')
      }

      addNotification({
        iconColor: 'green',
        header: 'Note was saved!',
        icon: FaRegSave,
        hideProgressBar: false,
      })
    } catch (error) {
      console.error('Failed to save changes:', error)
    }
  }

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
        header: 'Note was deleted!',
        icon: RiDeleteBin6Line,
        hideProgressBar: false,
      })

      // Optionally, fetch updated appointments list
      fetchClientRecords(clientId)
      setIsExpanded(false)
    } catch (error) {
      console.error('Failed to mark appointment as deleted:', error)
    }
  }

  // Utility function to render list items or textareas based on editMode
  const renderSection = (section, text) => {
    if (!text) return null
    if (editMode) {
      return (
        <div className='text-sm whitespace-pre-wrap'>
          <ReactTextareaAutosize
            className='flex justify-center items-center pt-1.5 w-full h-auto outline-none resize-none placeholder:text-gray-600'
            value={text}
            onChange={e => handleInputChange(section, e.target.value)}
            placeholder={`Enter notes here...`}
            autoComplete='off'
          />
        </div>
      )
    }
    return <div className='text-base my-1.5 whitespace-pre-wrap'>{text}</div>
  }

  const renderDynamicSections = () => {
    const noteKeys = Object.keys(editedRecord)

    const orderedSectionElements = noteKeys
      .filter(key => orderedSections.includes(key))
      .sort((a, b) => orderedSections.indexOf(a) - orderedSections.indexOf(b))
      .map(key => {
        const formattedKeyName = formatKeyName(key)
        const { headerBGColor, borderColor } =
          sectionAttributes[key] || defaultColors[0]

        const value =
          typeof editedRecord[key] === 'object'
            ? `Error in generating notes for ${formattedKeyName}.`
            : editedRecord[key]

        return (
          <div
            key={key}
            className='flex flex-col first:mt-0 sm:first:mt-2 mt-2 overflow-hidden'
          >
            <div
              className={`flex justify-between items-center px-2.5 py-1.5 rounded-t-lg ${headerBGColor} text-black`}
            >
              <p className='font-semibold text-base'>{formattedKeyName}</p>
              <CopyButton
                text={value || ''}
                title={formattedKeyName}
                displayNotification={true}
              />
            </div>
            <div
              className={`py-2 px-3 border-2 ${borderColor} rounded-b-lg border-t-0`}
            >
              {renderSection(key, value)}
            </div>
          </div>
        )
      })

    const remainingSectionElements = noteKeys
      .filter(key => !orderedSections.includes(key) && key !== 'summary')
      .map(key => {
        const formattedKeyName = formatKeyName(key)
        const { headerBGColor, borderColor } = defaultColors[0]

        const value =
          typeof editedRecord[key] === 'object'
            ? `Error in generating notes for ${formattedKeyName}.`
            : editedRecord[key]

        return (
          <div
            key={key}
            className='flex flex-col first:mt-0 sm:first:mt-2 mt-2 overflow-hidden'
          >
            <div
              className={`flex justify-between items-center px-2.5 py-1.5 rounded-t-lg ${headerBGColor} text-black`}
            >
              <p className='font-semibold text-base'>{formattedKeyName}</p>
              <CopyButton
                text={value || ''}
                title={formattedKeyName}
                displayNotification={true}
              />
            </div>
            <div
              className={`py-2 px-3 border-2 ${borderColor} rounded-b-lg border-t-0`}
            >
              {renderSection(key, value)}
            </div>
          </div>
        )
      })

    return [...orderedSectionElements, ...remainingSectionElements]
  }

  // Toggles edit mode and calls onSave when saving
  const toggleEditMode = () => {
    if (editMode) {
      handleSave(editedRecord)
    }
    setEditMode(!editMode)
  }

  // Inside RecordDetails component
  const handleSave = () => {
    updateAppointmentNotes(id, editedRecord)
    setEditMode(false)
  }

  // Display Alert
  const deleteAppointment = () => {
    markAppointmentAsDeleted(id)
    setShowAlert(false)
  }

  // Handle Alert opening up
  const displayDeleteAppointmentAlert = () => {
    setShowAlert(true)
  }

  const handleListenClick = async () => {
    try {
      const response = await fetchWithAuth(`/api/appointment/${id}/audio`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Network response was not ok.')
      }

      const audioData = await response.json()
      setAudioUrls(audioData)
      setShowAudioPlayer(true)
    } catch (error) {
      console.error('Failed to fetch audio data:', error)
    }

    // setAudioUrls(fakeAudioURLs)
    // setShowAudioPlayer(true)
  }

  const openCopyModal = () => {
    setIsCopyModalOpen(true)
  }

  const closeCopyModal = () => {
    setIsCopyModalOpen(false)
  }

  const handleCopySuccess = () => {
    // Refresh the appointment list or perform any necessary actions after copying
    fetchClientRecords(clientId)
  }

  return (
    <div
      className={`text-base sm:mb-2 px-2 sm:px-0 ${
        homePage ? 'sm:px-0' : 'sm:px-4 sm:mt-3 pb-2'
      } h-auto w-full bg-white rounded-none sm:rounded-md relative`}
    >
      <div
        className={`sticky top-0 bg-white flex gap-1 sm:gap-0 flex-col sm:flex-row justify-center sm:justify-between items-center select-none flex-wrap ${
          homePage ? 'sm:pb-2.5 py-2.5' : 'pt-2.5 pb-1 mt-1.5 px-0.5'
        }`}
      >
        <div className='flex items-center space-x-2 h-auto sm:h-10'>
          <h1
            className={`font-bold text-sm sm:text-base uppercase ${
              tabInView === 'appointment'
                ? 'py-0.5 px-2.5 bg-gray-600 text-white rounded-md'
                : 'hover:text-blue-500 cursor-pointer'
            }`}
            onClick={() => setTabInView('appointment')}
          >
            Notes
          </h1>
          <div className='pb-0.5'>|</div>
          <h1
            className={`font-bold text-sm sm:text-base uppercase ${
              tabInView === 'emails'
                ? 'py-0.5 px-2.5 bg-gray-600 text-white rounded-md'
                : 'hover:text-blue-500 cursor-pointer'
            }`}
            onClick={() => setTabInView('emails')}
          >
            Emails
          </h1>
          <div className='pb-0.5'>|</div>
          <h1
            className={`font-bold text-sm sm:text-base uppercase ${
              tabInView === 'attachments'
                ? 'py-0.5 px-2.5 bg-gray-600 text-white rounded-md'
                : 'hover:text-blue-500 cursor-pointer'
            }`}
            onClick={() => setTabInView('attachments')}
          >
            Attachments
          </h1>
        </div>

        {tabInView == 'appointment' && (
          <div className='flex justify-center items-center space-x-3 gap-[15px] sm:gap-0'>
            <div
              className='flex
              items-center space-x-2 text-black hover:underline hover:underline-offset-2 px-0.5 cursor-pointer'
              onClick={handleListenClick}
            >
              <FaHeadphonesAlt className='size-3.5' />
              <h1 className='text-sm font-medium uppercase'>Listen</h1>
            </div>

            <div
              className='flex justify-center items-center cursor-pointer'
              onClick={toggleEditMode}
            >
              {editMode ? (
                <div className='flex items-center justify-center w-24 text-green-600 hover:text-green-700 hover:underline hover:underline-offset-2'>
                  <FaRegSave className='h-4 w-4 mr-1.5' />
                  <h1 className='uppercase text-xs sm:text-sm font-semibold'>
                    Save Note
                  </h1>
                </div>
              ) : (
                <div className='flex items-center justify-center w-24 text-blue-600 hover:text-blue-700 hover:underline hover:underline-offset-2'>
                  <FaRegEdit className='h-4 w-4 pl-0.5 mr-1.5' />
                  <h1 className='uppercase text-xs sm:text-sm font-semibold'>
                    Edit Note
                  </h1>
                </div>
              )}
            </div>

            <div className='relative select-none'>
              <div
                className={`flex items-center cursor-pointer `}
                onClick={() => setShowMoreOptions(!showMoreOptions)}
              >
                <CiCircleMore className='size-7' />
              </div>
              {showMoreOptions && (
                <div
                  className='absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50'
                  onMouseLeave={() => setShowMoreOptions(false)}
                >
                  <div
                    className='flex items-center justify-start py-2 px-4 text-sm border-b text-gray-700 hover:bg-gray-100 cursor-pointer'
                    onClick={() =>
                      downloadClientNotesAsPDF(appointmentNote, pdfConfig)
                    }
                  >
                    <FaRegFilePdf className='mr-2 h-5 w-5' />
                    <span>Download PDF</span>
                  </div>

                  <div
                    className='flex items-center justify-start py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                    onClick={openCopyModal}
                  >
                    <FaRegCopy className='mr-2 h-5 w-5' />
                    <span>Copy to Client</span>
                  </div>

                  <div
                    className='flex items-center justify-start py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                    onClick={handleCopyAllNotes}
                  >
                    <HiOutlineClipboardCopy className='mr-2 h-5 w-5' /> Copy All
                    Notes
                  </div>

                  <div
                    className='flex items-center justify-start py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer border-t'
                    onClick={() => displayDeleteAppointmentAlert()}
                  >
                    <RiDeleteBin6Line className='mr-2 h-5 w-5' /> Delete Record
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <CopyAppointmentToAClientModal
        isOpen={isCopyModalOpen}
        onRequestClose={closeCopyModal}
        appointmentId={appointment.id}
        onCopySuccess={handleCopySuccess}
        clientId={clientId}
      />

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

      {/* Appointment Details */}
      {tabInView == 'appointment' && (
        <>
          <div className='flex items-center w-full space-x-3 mt-1'>
            <div className='w-full'>
              {showAudioPlayer && (
                <div className='animate-fade-in'>
                  <CustomAudioPlayer audioUrls={audioUrls} />
                </div>
              )}
            </div>
          </div>
          <div className='mb-4'>{renderDynamicSections()}</div>
        </>
      )}

      {tabInView == 'attachments' && <Attachments />}

      {tabInView == 'emails' && <Email appointment={appointment} />}
    </div>
  )
}

export default RecordDetails
