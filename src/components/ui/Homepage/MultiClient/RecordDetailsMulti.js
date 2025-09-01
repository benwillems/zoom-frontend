import React, { useEffect, useState } from 'react'
import { FaRegEdit, FaRegSave } from 'react-icons/fa'
import ReactTextareaAutosize from 'react-textarea-autosize'
import useClientStore from '@/store/clientStore'
import CopyButton from '../../common/CopyButton'

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
]

const formatKeyName = key => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const RecordDetailsMulti = ({
  appointment,
  updateAppointmentNotes,
  noteIndex,
  appointmentId,
}) => {
  const { appointmentNote } = useClientStore()
  if (!appointment) {
    appointment = appointmentNote
  }
  const { notes: appointmentNotes } = appointment || {}
  const [editMode, setEditMode] = useState(false)
  const [editedRecord, setEditedRecord] = useState(
    Object.entries(appointmentNotes || {}).reduce((acc, [key, value]) => {
      acc[key] = value || `No ${formatKeyName(key)} was found`
      return acc
    }, {})
  )

  useEffect(() => {
    setEditedRecord(
      Object.entries(appointmentNotes || {}).reduce((acc, [key, value]) => {
        acc[key] = value || `No ${formatKeyName(key)} was found`
        return acc
      }, {})
    )
  }, [appointmentNotes])

  // Utility function to handle input changes
  const handleInputChange = (section, value) => {
    setEditedRecord({
      ...editedRecord,
      [section]: value,
    })
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

  // Inside RecordDetailsMulti component
  const handleSave = () => {
    const updatedAppointment = {
      ...appointment,
      notes: editedRecord,
    }

    console.log(updatedAppointment)
    updateAppointmentNotes(appointmentId, updatedAppointment.notes, noteIndex)
    setEditMode(false)
  }

  return (
    <div
      className={`text-base sm:mb-2 pb-2 px-2 sm:px-4 sm:mt-3 h-96 overflow-y-auto w-full bg-white rounded-none sm:rounded-md relative`}
    >
      <div
        className={`sticky top-0 bg-white z-10 flex gap-1 sm:gap-0 flex-col sm:flex-row justify-center sm:justify-between items-center select-none flex-wrap sm:py-2.5 pt-1.5 pb-1.5 mt-1.5 px-0.5`}
      >
        <div className='flex justify-center items-center space-x-2 gap-[15px] sm:gap-0'>
          <div
            className='flex justify-center items-center space-x-2 cursor-pointer'
            onClick={toggleEditMode}
          >
            {editMode ? (
              <div className='flex items-center justify-center w-auto sm:w-32 px-2 sm:px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg'>
                <FaRegSave className='h-4 w-4 mr-1.5' />
                <h1 className='uppercase text-xs sm:text-sm font-semibold'>
                  Save Note
                </h1>
              </div>
            ) : (
              <div className='flex items-center justify-center w-auto sm:w-32 px-2 sm:px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md'>
                <FaRegEdit className='h-4 w-4 pl-0.5 mr-1.5' />
                <h1 className='uppercase text-xs sm:text-sm font-semibold'>
                  Edit Note
                </h1>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='mb-4'>{renderDynamicSections()}</div>
    </div>
  )
}

export default RecordDetailsMulti
