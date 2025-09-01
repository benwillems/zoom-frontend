// Email.js
import { FaRegCheckCircle, FaRegEdit, FaRegSave } from 'react-icons/fa'
import { HiOutlineMail } from 'react-icons/hi'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import React, { useEffect, useRef, useState } from 'react'
import useNotificationStore from '@/store/useNotificationStore'
import copy from 'copy-to-clipboard'
import { FaCloudversify } from 'react-icons/fa6'
import { MdWarning } from 'react-icons/md'
import { fetchWithAuth } from '@/utils/generalUtils'
import useClientStore from '@/store/clientStore'
import { CgSpinner } from 'react-icons/cg'
import DisplayTooltip from '@/components/common/DisplayTooltip'
import { FiSend } from 'react-icons/fi'
import SendEmailModal from './SendEmailModal'
import { format } from 'date-fns'

const Email = ({ appointment }) => {
  const { addNotification, removeNotification } = useNotificationStore()
  const {
    fetchClientRecords,
    appointmentNote,
    setAppointmentNote,
    clientDetails,
  } = useClientStore()
  const { id, email, clientId, emailSent } = appointment
  const [copied, setCopied] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingEmail, setIsSavingEmail] = useState(false)
  const [editedEmailBody, setEditedEmailBody] = useState(null)
  const [selectedText, setSelectedText] = useState('')
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [message, setMessage] = useState('')
  const [isRegeneratingEmail, setIsRegeneratingEmail] = useState(false)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState('Appointment Recap')

  useEffect(() => {
    if (appointment) {
      if (appointment.emailSubject) {
        setEmailSubject(appointment.emailSubject)
      } else if (appointment.date) {
        const formattedDate = format(new Date(appointment.date), 'MMMM d, yyyy')
        setEmailSubject(`Appointment Recap - ${formattedDate}`)
      }
    }
  }, [appointment])

  const openSendModal = () => {
    setIsSendModalOpen(true)
  }

  const closeSendModal = () => {
    setIsSendModalOpen(false)
  }

  const messageTextareaRef = useRef(null)

  useEffect(() => {
    if (email !== null) {
      setEditedEmailBody(email)
    }
  }, [appointment])

  const createEmailToSendToClient = async () => {
    try {
      setIsLoading(true)
      // Display loading notification
      addNotification({
        id: 'email-loading',
        header: 'Generating your recap email...',
        loading: true,
        hideProgressBar: true,
      })

      const response = await fetchWithAuth(`/api/appointment/create/email`, {
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

      const data = await response.json()

      if (data) {
        // Remove loading notification
        removeNotification('email-loading')
        setEditedEmailBody(data?.emailBody)
        await fetchClientRecords(clientId)

        // Find and update the specific appointment note directly
        const updatedNote = {
          ...appointmentNote,
          email: editedEmailBody,
        }

        // Update the state with the new note information
        setAppointmentNote(updatedNote)

        setIsLoading(false)
      }
    } catch (error) {
      console.error('Failed to generate email to send to client:', error)

      setIsLoading(false)

      // Remove loading notification
      removeNotification('email-loading')

      // Display error notification
      addNotification({
        header: 'Error generating email',
        description: 'An error occurred while generating the email.',
        icon: MdWarning,
        iconColor: 'red',
        hideProgressBar: false,
      })
    }
  }

  // Handle email copy
  const handleCopy = () => {
    copy(editedEmailBody)

    addNotification({
      iconColor: 'green',
      header: 'Copied Email Response',
      icon: FaRegCheckCircle,
      hideProgressBar: false,
    })

    setCopied(true)
    setTimeout(() => setCopied(false), 4000)
  }

  // Toggle between edit/view mode
  const toggleEditMode = () => {
    if (editMode) {
      handleSave()
    }
    setEditMode(!editMode)
  }

  // Save the edited email content
  const handleSave = async () => {
    try {
      setIsSavingEmail(true)

      const response = await fetchWithAuth(`/api/appointment/update/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: id,
          email: editedEmailBody,
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok.')
      }

      setEditedEmailBody(editedEmailBody)
      // await fetchClientRecords(clientId)

      // Find and update the specific appointment note directly
      const updatedNote = {
        ...appointmentNote,
        email: editedEmailBody,
      }

      // Update the state with the new note information
      setAppointmentNote(updatedNote)

      setIsSavingEmail(false)

      addNotification({
        iconColor: 'green',
        header: 'Saved email response!',
        icon: FaRegCheckCircle,
        hideProgressBar: false,
      })
    } catch (error) {
      console.error('Failed to save email', error)

      setIsSavingEmail(false)

      // Display error notification
      addNotification({
        header: 'Error saving email',
        description: 'An error occurred while saving the email.',
        icon: MdWarning,
        iconColor: 'red',
        hideProgressBar: false,
      })
    }
  }

  const handleRegenerateEmail = async () => {
    try {
      setIsRegeneratingEmail(true)

      const response = await fetchWithAuth(
        '/api/appointment/regenerate/email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appointmentId: id,
            selectedEmailBody: selectedText,
            howToChangeEmail: message,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Network response was not ok.')
      }

      const data = await response.json()
      setEditedEmailBody(data.emailBody)
      setSelectedText('')
      setMessage('')

      addNotification({
        iconColor: 'green',
        header: 'Email was regenerated!',
        icon: FaRegCheckCircle,
        hideProgressBar: false,
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      // Handle error, show notification, etc.
    } finally {
      setIsRegeneratingEmail(false)
    }
  }

  let editEmailDivStyles = editMode
    ? 'outline-green-500 hover:bg-green-50'
    : 'outline-gray-500 hover:bg-gray-50'

  let editEmailTextStyles = editMode ? 'text-green-500' : 'text-gray-500'

  const handleMouseUp = e => {
    const selection = window.getSelection()
    const selectedText = selection.toString()

    // Remove existing highlights
    const existingHighlights = document.querySelectorAll('span.bg-yellow-200')
    existingHighlights.forEach(highlight => {
      const parent = highlight.parentNode
      while (highlight.firstChild) {
        parent.insertBefore(highlight.firstChild, highlight)
      }
      parent.removeChild(highlight)
    })

    if (selectedText.length > 0) {
      const range = selection.getRangeAt(0)
      const span = document.createElement('span')
      span.classList.add('bg-yellow-200')
      span.setAttribute('contenteditable', 'false')
      range.surroundContents(span)
      setIsHighlighted(true)
      setSelectedText(selectedText)
      messageTextareaRef.current.focus() // Focus the textarea
    } else {
      setIsHighlighted(false)
      setSelectedText('')
    }
  }

  const emailActions = [
    {
      name: 'professional',
      displayText: 'professional',
      value: 'Make it more professional',
    },
    {
      name: 'shorter',
      displayText: 'shorter',
      value: 'Make it shorter',
    },
    { name: 'longer', displayText: 'longer', value: 'Make it longer' },
  ]

  const sendEmailForAppointment = async () => {
    try {
      const response = await fetchWithAuth(
        `/api/appointment/${id}/send-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailBody: editedEmailBody,
            emailSubject: emailSubject,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      const updatedAppointment = await response.json()
      console.log('Email sent successfully:', updatedAppointment)

      // Update the appointment prop with the updated appointment data
      appointment.emailSent = updatedAppointment.emailSent
      appointment.email = updatedAppointment.email
      appointment.emailSubject = updatedAppointment.emailSubject

      // Update the appointmentNote state with the updated appointment data
      setAppointmentNote(updatedAppointment)

      addNotification({
        iconColor: 'green',
        header: 'Email was sent!',
        icon: FaRegCheckCircle,
        hideProgressBar: false,
      })
    } catch (error) {
      addNotification({
        iconColor: 'red',
        header: 'Error sending email!',
        icon: MdWarning,
        hideProgressBar: false,
      })
      console.error('Failed to send email:', error)
    }
  }

  const handleSendEmail = async () => {
    try {
      await sendEmailForAppointment()
      // Handle success, show notification, etc.
      closeSendModal()
    } catch (error) {
      console.error('Failed to send email:', error)
      // Handle error, show notification, etc.
    }
  }

  return (
    <div className='flex flex-col min-h-[70vh] sm:min-h-[550px] h-[70vh] pb-3'>
      <div className='flex flex-col space-y-1 mb-2'>
        <div className='pb-2 text-sm sm:text-base'>
          {emailSent ? (
            <p>
              An email for this appointment has already been sent to{' '}
              <span className='text-blue-500 font-medium'>
                {clientDetails?.email}
              </span>
            </p>
          ) : (
            <p>
              Create an email discussing the details of the appointment and
              highlighting the
              <span className='font-semibold underline underline-offset-4 mx-1'>
                recap or homework
              </span>
              section.
            </p>
          )}
        </div>

        {emailSent && (
          <p className='text-sm'>
            Subject:{' '}
            <span className='italic font-medium'>
              {appointment?.emailSubject}
            </span>
          </p>
        )}

        {/* Copy/Edit buttons or skeleton */}
        {isLoading ? (
          <div className='flex justify-between items-center'>
            <Skeleton
              width='144px'
              height='30px'
              borderRadius='6px'
              highlightColor='#d1d5db'
              duration={1.75}
            />
            <div className='flex gap-3'>
              <Skeleton
                width='144px'
                height='30px'
                borderRadius='6px'
                highlightColor='#d1d5db'
                duration={1.75}
              />
              <Skeleton
                width='144px'
                height='30px'
                borderRadius='6px'
                highlightColor='#d1d5db'
                duration={1.75}
              />
            </div>
          </div>
        ) : (
          !emailSent && (
            <div className='flex justify-center sm:justify-between items-center pr-0 sm:pr-0.5 flex-wrap gap-2'>
              <button
                className='flex items-center justify-center bg-blue-500 hover:bg-blue-600 w-40 space-x-2 py-1.5 rounded-md select-none disabled:bg-gray-800 disabled:hover:bg-gray-900 disabled:cursor-not-allowed'
                onClick={createEmailToSendToClient}
                disabled={appointment?.email}
              >
                <FaCloudversify className='size-5 text-white' />
                <span className='ml-1 text-sm text-white font-medium'>
                  Generate Email
                </span>
              </button>

              <div className='flex gap-3'>
                {/* Edit/Save Email Button */}
                <div
                  className={`flex items-center justify-center outline outline-1 w-28 space-x-2 py-1 rounded-md cursor-pointer select-none ${editEmailDivStyles}`}
                  onClick={toggleEditMode}
                >
                  {editMode ? (
                    isSavingEmail ? (
                      <CgSpinner
                        className='size-5 text-green-500 animate-spin'
                        onClick={handleSave}
                      />
                    ) : (
                      <FaRegSave
                        className='w-[18px] h-[18px] text-green-500'
                        onClick={handleSave}
                      />
                    )
                  ) : (
                    <FaRegEdit className='w-[18px] h-[18px] text-gray-500' />
                  )}
                  <span
                    className={`ml-1 text-sm font-medium ${editEmailTextStyles}`}
                  >
                    {editMode ? 'Save' : 'Edit'}
                  </span>
                </div>

                {/* Copy Email Button */}
                {copied ? (
                  <div
                    className='flex items-center justify-center outline outline-1 outline-green-600 hover:bg-green-50 w-28 space-x-2 py-1 rounded-md cursor-pointer select-none'
                    onClick={handleCopy}
                  >
                    <FaRegCheckCircle className='w-[18px] h-[18px] text-green-600' />
                    <span className='ml-1 text-sm text-green-600 font-medium'>
                      Copied
                    </span>
                  </div>
                ) : (
                  <div
                    className='flex items-center justify-center outline outline-1 outline-blue-500 hover:bg-blue-50 w-28 space-x-2 py-1 rounded-md cursor-pointer select-none'
                    onClick={handleCopy}
                  >
                    <HiOutlineMail className='w-[20px] h-[20px] text-blue-500' />
                    <span className='ml-1 text-sm text-blue-500 font-medium'>
                      Copy
                    </span>
                  </div>
                )}

                <DisplayTooltip
                  id='emailWasSentAlready'
                  place='top'
                  effect='solid'
                  variant='dark'
                  message='An email has already been sent for this appointment.'
                  customStyle={{
                    marginLeft: '-0px',
                    padding: '3px 12px',
                    width: '320px',
                    display: 'flex',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                  displayCondition={emailSent}
                >
                  <button
                    className='flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 w-28 space-x-2 py-1 rounded-md cursor-pointer select-none disabled:bg-gray-800 disabled:hover:bg-gray-900 disabled:cursor-not-allowed'
                    onClick={openSendModal}
                    disabled={!appointment?.email || emailSent}
                  >
                    <FiSend className='w-[16px] h-[16px] rotate-45' />
                    <span className='pl-0.5 text-sm font-medium'>Send</span>
                  </button>
                </DisplayTooltip>
              </div>
            </div>
          )
        )}
      </div>

      {/* Textarea or skeleton depending on loading state */}
      <div
        className={`flex flex-grow overflow-y-auto  ${
          emailSent ? 'pt-0' : 'pt-4'
        }`}
      >
        {isLoading ? (
          <div className='flex-grow'>
            <Skeleton
              width='100%'
              height='99%'
              borderRadius='4px'
              highlightColor='#d1d5db'
              duration={1.75}
            />
          </div>
        ) : isRegeneratingEmail ? (
          <div className='flex-grow w-full'>
            <Skeleton
              width='100%'
              height='99%'
              borderRadius='4px'
              highlightColor='#d1d5db'
              duration={1.75}
            />
          </div>
        ) : editedEmailBody === null ? (
          <div className='flex justify-center items-center w-full h-full pt-4 text-base text-center sm:text-xl px-4'>
            No email has been generated for this appointment. Click the
            "Generate Email" button to create an email for this appointment.
          </div>
        ) : editMode ? (
          <textarea
            value={editedEmailBody}
            onChange={e => setEditedEmailBody(e.target.value)}
            className='w-full h-full border bg-white text-sm border-slate-200 rounded-md py-4 px-8 focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300 placeholder:text-slate-500 resize-none'
          />
        ) : emailSent ? (
          <textarea
            value={editedEmailBody}
            readOnly
            className='w-full h-full border bg-white text-sm border-slate-200 rounded-md p-2 focus:outline-none cursor-default resize-none'
          />
        ) : (
          <div
            className='w-full h-full border bg-white text-sm border-slate-200 rounded-md py-4 px-8 focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300 placeholder:text-slate-500 overflow-y-auto whitespace-pre-wrap'
            onMouseUp={handleMouseUp}
          >
            {editedEmailBody}
          </div>
        )}
        {appointment?.email && !isLoading && !emailSent && (
          <div className='flex flex-col w-[415px] h-full border border-gray-400 rounded-md ml-4 mr-0.5 relative'>
            {editMode && (
              <div className='absolute inset-0 bg-black bg-opacity-80 rounded-md z-10 flex items-center justify-center'>
                <div className='text-white text-center'>
                  <p className='text-lg font-bold'>You are in edit mode.</p>
                  <p className='text-sm'>
                    Save the email to get out of edit mode.
                  </p>
                </div>
              </div>
            )}
            <div className='flex flex-col px-3 mt-1 max-h-[400px] overflow-y-auto'>
              {emailActions.map(action => (
                <button
                  className='w-full my-3 text-xs py-2 outline outline-2 outline-blue-300 text-blue-500 uppercase font-bold hover:bg-blue-50 rounded-md'
                  key={action.name}
                  onClick={() => setMessage(action.value)}
                >
                  {action.displayText}
                </button>
              ))}
            </div>
            <div className='flex flex-col mt-auto px-3 py-3'>
              <textarea
                ref={messageTextareaRef}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className='text-sm w-full h-20 border border-gray-400 rounded-md p-2 focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300 resize-none placeholder:text-gray-500'
                placeholder='Describe how you want the section to be updated...'
              />

              <DisplayTooltip
                id='updateEmail'
                place='top'
                effect='solid'
                variant='dark'
                message='In order to update the email, you need to select and highlight the text to update.'
                customStyle={{
                  marginLeft: '-0px',
                  padding: '3px 12px',
                  width: '320px',
                  display: 'flex',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
                displayCondition={!isLoading && !selectedText}
              >
                <button
                  className='py-1 bg-blue-500 hover:bg-blue-600 rounded-md uppercase text-white font-medium mt-2 w-full disabled:bg-gray-800 disabled:hover:bg-gray-900 disabled:cursor-not-allowed'
                  onClick={handleRegenerateEmail}
                  disabled={!selectedText}
                >
                  Update Email
                </button>
              </DisplayTooltip>
            </div>
          </div>
        )}
      </div>

      <SendEmailModal
        isOpen={isSendModalOpen}
        onClose={closeSendModal}
        emailContent={editedEmailBody}
        onSendEmail={handleSendEmail}
        emailSubject={emailSubject}
        setEmailSubject={setEmailSubject}
      />
    </div>
  )
}

export default Email
