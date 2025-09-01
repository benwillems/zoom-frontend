import React, { useEffect, useState } from 'react'
import ClientForm from '../ui/Homepage/ClientForm'
import useClientStore from '@/store/clientStore'
import useAudioStore from '@/store/useAudioStore'
import ReactTextareaAutosize from 'react-textarea-autosize'
import 'react-calendar/dist/Calendar.css'
import { formatDateByShortDayLongMonthNumericDay } from '@/utils/dates'
import { MdKeyboardBackspace } from 'react-icons/md'
import useSearchClientsStore from '@/store/useSearchClientsStore'
import { fetchWithAuth } from '@/utils/generalUtils'

const ScheduleForm = ({ onClose, selectedClient, setSelectedClient }) => {
  const { fetchClients } = useSearchClientsStore()
  const { fetchAllAppointments } = useClientStore()
  const { calendarDate, activeAppointment, setActiveAppointment } =
    useAudioStore()

  useEffect(() => {
    if (activeAppointment) {
      setScheduleTitle(activeAppointment.title || '')
      setScheduleStartTime(
        formatTime(new Date(activeAppointment.scheduleStartAt))
      )
      setScheduleEndTime(formatTime(new Date(activeAppointment.scheduleEndAt)))
      setScheduleDescription(activeAppointment.description || '')
      setSelectedDate(new Date(activeAppointment.scheduleStartAt))
      setDisplayDate(
        formatDateByShortDayLongMonthNumericDay(
          new Date(activeAppointment.scheduleStartAt)
        )
      )

      if (activeAppointment?.client) {
        setSelectedClient({
          value: activeAppointment.client.id,
          label: activeAppointment.client.name,
        })
      }
    }
  }, [activeAppointment])

  const formatTime = dateInput => {
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) {
      console.error('formatTime: provided value is not a valid date', dateInput)
      return ''
    }
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const [scheduleTitle, setScheduleTitle] = useState('')
  const [scheduleStartTime, setScheduleStartTime] = useState(
    formatTime(new Date())
  )
  const defaultEndTime = new Date(Date.now() + 30 * 60000)
  const [scheduleEndTime, setScheduleEndTime] = useState(
    formatTime(defaultEndTime)
  )
  const [scheduleDescription, setScheduleDescription] = useState('')
  const [selectedDate, setSelectedDate] = useState(calendarDate)
  const [isCalendarVisible, setIsCalendarVisible] = useState(false)
  const [displayDate, setDisplayDate] = useState(
    formatDateByShortDayLongMonthNumericDay(new Date(selectedDate))
  )

  const handleDateChange = newDate => {
    setSelectedDate(newDate)
    setDisplayDate(formatDateByShortDayLongMonthNumericDay(new Date(newDate)))
    setIsCalendarVisible(false)
  }

  const handleScheduleAppointment = () => {
    const startDate = new Date(selectedDate)
    const timeParts = scheduleStartTime.split(':')
    const hours = parseInt(timeParts[0], 10)
    const minutes = parseInt(timeParts[1], 10)
    startDate.setHours(hours, minutes)

    const endDate = new Date(selectedDate)
    const endTimeParts = scheduleEndTime.split(':')
    const endHours = parseInt(endTimeParts[0], 10)
    const endMinutes = parseInt(endTimeParts[1], 10)
    endDate.setHours(endHours, endMinutes)

    let formData = new FormData()
    formData.append('scheduleStartAt', startDate)
    formData.append('scheduleEndAt', endDate)
    formData.append('title', scheduleTitle)
    formData.append('description', scheduleDescription)

    if (activeAppointment?.id) {
      formData.append('appointmentId', activeAppointment.id)
    } else if (selectedClient) {
      if (typeof selectedClient?.value === 'number') {
        formData.append('clientId', selectedClient.value)
      } else if (typeof selectedClient?.value === 'string') {
        formData.append('clientName', selectedClient.value)
      }
    }

    fetchWithAuth('/api/appointment/schedule', {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then(data => {
        fetchAllAppointments()
        setActiveAppointment(data?.appointment)
        fetchClients()
        onClose()
      })
      .catch(error => console.error('Error creating new appointment:', error))

    onClose()
  }

  const handleStartTimeChange = e => {
    const newStartTime = e.target.value
    setScheduleStartTime(newStartTime)
    const [hours, minutes] = newStartTime.split(':').map(Number)
    const newEndTime = new Date(selectedDate)
    newEndTime.setHours(hours, minutes + 30)
    setScheduleEndTime(formatTime(newEndTime))
  }

  return (
    <div className='flex flex-col justify-between z-30 w-full h-dvh bg-white rounded-b-none drop-shadow-sm shadow-md rounded-md p-3 mx-0 sm:hidden'>
      <div className='flex justify-start items-center text-blue-500 space-x-1 cursor-pointer hover:underline hover:underline-offset-4'>
        <MdKeyboardBackspace />
        <p className='text-base font-semibold' onClick={() => onClose()}>
          Back to Appointments
        </p>
      </div>
      <div className='flex flex-col justify-center flex-grow'>
        <div className='mb-12'>
          <h2 className='text-xl font-semibold '>Schedule Appointment</h2>
          <input
            type='text'
            placeholder='Select Day'
            className='w-36 outline-none bg-white'
            value={displayDate}
            onClick={() => setIsCalendarVisible(!isCalendarVisible)}
            readOnly
          />
        </div>
        {/* {isCalendarVisible && (
          <Calendar
            value={selectedDate}
            onChange={handleDateChange}
            className='absolute z-10'
          />
        )} */}

        <div className='space-y-2.5'>
          <ClientForm
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
          />
          <div className='flex flex-col mx-1 relative'>
            <div className='flex justify-between items-center space-x-2'>
              <div className='custom-time-container'>
                <input
                  type='time'
                  value={scheduleStartTime}
                  onChange={handleStartTimeChange}
                  className='custom-time-input'
                  required
                />
              </div>
              <div className='mx-2'>to</div>
              <div className='custom-time-container'>
                <input
                  type='time'
                  value={scheduleEndTime}
                  onChange={e => setScheduleEndTime(e.target.value)}
                  className='custom-time-input'
                  required
                />
              </div>
            </div>
          </div>
          {/* <input
            type='text'
            name='title'
            placeholder='Add title (optional)'
            value={scheduleTitle}
            onChange={e => setScheduleTitle(e.target.value)}
            className='w-full border-b-2 pl-0.5 text-base border-blue-300 placeholder:text-slate-500 outline-none'
          /> */}
          <ReactTextareaAutosize
            name='description'
            placeholder='Enter description (optional)'
            value={scheduleDescription}
            onChange={e => setScheduleDescription(e.target.value)}
            minRows={2}
            className='flex w-full border bg-white text-sm border-slate-200 rounded-md py-2 px-2 focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300 placeholder:text-slate-500 resize-none'
          />
          <div className='flex justify-end items-center space-x-2 pt-3'>
            <button
              type='button'
              onClick={onClose}
              className='text-gray-800 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-md text-sm px-3 py-1.5 text-center'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={handleScheduleAppointment}
              className='text-gray-800 bg-blue-300 border hover:bg-blue-400 focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-md text-sm px-3 py-1.5 text-center disabled:cursor-not-allowed disabled:bg-gray-300'
              disabled={!selectedClient}
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScheduleForm
