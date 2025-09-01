import React, { useState, useEffect } from 'react'
import {
  FaPhone,
  FaBookOpen,
  FaClinicMedical,
  FaChevronDown,
  FaRegCalendarTimes,
  FaRegCalendarPlus,
  FaPlus,
  FaMinus,
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import GetStarted, { GetStartedButton } from '@/components/leads/GetStarted'
import TranscriptViewer from '@/components/leads/TranscriptViewer'
import useNotificationStore from '@/store/useNotificationStore'
import LeadsTable from '@/components/leads/LeadsTable'
import CallMetrics from '@/components/leads/DataCards/CallMetrics'
import LeadsMetrics from '@/components/leads/LeadsMetrics'
import Campaign from '@/components/leads/Campaigns/Campaign'
import { RiTeamFill } from 'react-icons/ri'
import Tabs from '@/components/leads/Tabs'

const Leads = () => {
  const [currentTab, setCurrentTab] = useState('Leads')
  const [selectedTranscript, setSelectedTranscript] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc',
  })
  const [showGetStarted, setShowGetStarted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [leadsFromApi, setLeadsFromApi] = useState([])
  const [recurrence, setRecurrence] = useState(' Recurrance')
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false)
  const [scheduleName, setScheduleName] = useState('')
  const [schedules, setSchedules] = useState([
    { id: 1, numberOfUnits: 1, type: 'Days', timeSlots: [{ id: 1, time: '' }] },
  ])
  const [showViewButton, setShowViewButton] = useState(false)

  const [gymTemplates, setGymTemplates] = useState([])
  const { addNotification } = useNotificationStore()
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(null)
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [activeTemplateId, setActiveTemplateId] = useState(null)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        // if (process.env.NODE_ENV === 'development') {
        //   setLeadsFromApi(mockLeadsDataProd.leads)
        //   setIsLoading(false)
        //   return
        // }

        const response = await fetch('/leads/fetchAllLeads')
        if (!response.ok) {
          throw new Error('Failed to fetch leads')
        }
        const data = await response.json()
        setLeadsFromApi(data)
      } catch (error) {
        console.error('Error fetching leads:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeads()
  }, [])

  const fetchGymTemplates = async () => {
    setIsTemplatesLoading(true)
    try {
      const response = await fetch('/leads/template/fetch')
      if (!response.ok) {
        throw new Error('Failed to fetch gym templates')
      }
      const data = await response.json()
      setGymTemplates(data)
    } catch (error) {
      console.error('Error fetching gym templates:', error)
      addNotification({
        iconColor: 'red',
        header: 'Failed to fetch templates',
        hideProgressBar: false,
      })
    } finally {
      setIsTemplatesLoading(false)
    }
  }

  const handleSort = key => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleGetStartedSubmit = async formData => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/leads/agent/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          programs: [],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to initiate call')
      }

      addNotification({
        iconColor: 'green',
        header: `An AI Agent will be calling you shortly!`,
        icon: FaPhone,
        hideProgressBar: false,
      })

      setShowGetStarted(false)
    } catch (error) {
      addNotification({
        iconColor: 'red',
        header: error.message || 'Failed to initiate call',
        icon: FaPhone,
        hideProgressBar: false,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRecurrenceChange = e => {
    const value = e.target.value
    setRecurrence(value)
    setShowViewButton(value === 'Gym Template')

    if (value === 'Add Schedule') {
      setShowAddScheduleModal(true)
    }
  }

  const handleAddTimeSlot = scheduleId => {
    setSchedules(schedules =>
      schedules.map(schedule =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              timeSlots: [
                ...schedule.timeSlots,
                { id: schedule.timeSlots.length + 1, time: '' },
              ],
            }
          : schedule
      )
    )
  }

  const handleRemoveTimeSlot = (scheduleId, slotId) => {
    setSchedules(schedules =>
      schedules.map(schedule =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              timeSlots: schedule.timeSlots.filter(slot => slot.id !== slotId),
            }
          : schedule
      )
    )
  }

  const handleTimeSlotChange = (scheduleId, slotId, newTime) => {
    setSchedules(schedules =>
      schedules.map(schedule =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              timeSlots: schedule.timeSlots.map(slot =>
                slot.id === slotId ? { ...slot, time: newTime } : slot
              ),
            }
          : schedule
      )
    )
  }

  const handleScheduleChange = (id, field, value) => {
    setSchedules(schedules =>
      schedules.map(schedule =>
        schedule.id === id ? { ...schedule, [field]: value } : schedule
      )
    )
  }

  const handleSaveSchedule = async () => {
    const payload = {
      name: scheduleName,
      body: schedules.map(schedule => ({
        type: schedule.type.toLowerCase(),
        number: schedule.numberOfUnits,
        time: schedule.timeSlots.map(slot => slot.time),
      })),
    }

    try {
      const response = await fetch('/leads/template/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to save schedule')
      }

      const data = await response.json()
      console.log('Schedule saved successfully:', data)
      addNotification({
        iconColor: 'green',
        header: 'Schedule saved successfully!',
        hideProgressBar: false,
      })
    } catch (error) {
      console.error('Error saving schedule:', error)
      addNotification({
        iconColor: 'red',
        header: 'Failed to save schedule',
        hideProgressBar: false,
      })
    } finally {
      setShowAddScheduleModal(false)
    }
  }

  const isSaveDisabled =
    !scheduleName ||
    schedules.some(schedule => schedule.timeSlots.some(slot => !slot.time))

  const toggleActiveStatus = async templateId => {
    if (templateId === activeTemplateId || isActivating) return

    setIsActivating(true)
    setActiveTemplateId(templateId)

    try {
      const response = await fetch(`leads/template/default/${templateId}`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to activate template')
      }

      const data = await response.json()
      setGymTemplates(prevTemplates =>
        prevTemplates.map(template =>
          template.id === templateId
            ? { ...template, active: true }
            : { ...template, active: false }
        )
      )
    } catch (error) {
      console.error('Error activating template:', error)
      setActiveTemplateId(null)
    } finally {
      setIsActivating(false)
    }
  }

  const generateSummary = template => {
    const formatDate = date =>
      date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })

    let currentDate = new Date()
    let output = `For the lead starting today ${formatDate(currentDate)}, `
    let previousDate = new Date(currentDate)
    let totalDays = 0

    template.userTemplate.forEach((item, index) => {
      let endDate = new Date(previousDate)
      if (item.type.toLowerCase() === 'weeks') {
        endDate.setDate(endDate.getDate() + parseInt(item.number) * 7)
        totalDays += parseInt(item.number) * 7
        output += `it calls for ${
          item.number
        } weeks every day at ${item.time.join(', ')} till ${formatDate(
          endDate
        )}`
      } else if (item.type.toLowerCase() === 'days') {
        endDate.setDate(endDate.getDate() + parseInt(item.number))
        totalDays += parseInt(item.number)
        output += `it calls for ${
          item.number
        } days every day at ${item.time.join(', ')} till ${formatDate(endDate)}`
      }
      if (index < template.userTemplate.length - 1) {
        output += ', then '
      } else {
        output += ', and then it ends.'
      }
      previousDate = endDate
    })

    output += ` Total duration: ${totalDays} days.`

    return output
  }

  const handleAddSchedule = () => {
    const newSchedule = {
      id: schedules.length + 1,
      numberOfUnits: 1,
      type: 'Days',
      timeSlots: [{ id: 1, time: '' }],
    }
    setSchedules([...schedules, newSchedule])
  }

  const handleRemoveSchedule = scheduleId => {
    setSchedules(schedules.filter(schedule => schedule.id !== scheduleId))
  }

  function highlightNumbers(str) {
    if (!str) return ''
    // Replace all numeric occurrences with a bold span
    return str.replace(
      /\d+/g,
      '<span class="font-bold text-gray-900">$&</span>'
    )
  }
  const tabContents = [
    {
      name: 'Leads',
      header: {
        title: 'Leads',
        description: 'View and manage incoming leads from website inquiries.',
      },
      component: (
        <div className='flex flex-col'>
          <div className='flex'>
            <div className='flex-1 pt-3'>
              <div className='flex'>
                <CallMetrics leads={leadsFromApi} />
                <LeadsMetrics leads={leadsFromApi} />
              </div>
              <LeadsTable
                leads={leadsFromApi}
                onTranscriptView={setSelectedTranscript}
                selectedTranscript={selectedTranscript}
                sortConfig={sortConfig}
                onSort={handleSort}
                isLoading={isLoading}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
          </div>
        </div>
      ),
      icon: <FaClinicMedical />,
    },
    {
      name: 'Campaigns',
      header: {
        title: 'Promotional Campaigns',
        description: 'Manage and view progress on promotional outreach.',
      },
      component: <Campaign />,
      icon: <RiTeamFill />,
    },
  ]

  return (
    <div className='flex flex-col h-full'>
      <div className='flex flex-col h-full'>
        {/* Header */}
        <div className='px-2 sm:p-6'>
          <div className='flex justify-between items-center'>
            <div>
              <h3 className='text-3xl font-bold text-gray-900'>
                {tabContents.find(tab => tab.name === currentTab)?.header.title}
              </h3>
              <p className='text-base text-gray-600'>
                {
                  tabContents.find(tab => tab.name === currentTab)?.header
                    .description
                }
              </p>
            </div>
            <div className='flex items-center'>
              <div className='mr-4 relative'>
                <button
                  onClick={() => {
                    setIsOpen(!isOpen)
                    if (!isOpen) {
                      fetchGymTemplates()
                    }
                  }}
                  className='flex items-center justify-between w-40 h-10 px-4 py-2.5 bg-blue-300 border 
  border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:ring-2 
  focus:ring-blue-500 focus:outline-none font-medium text-gray-700'
                >
                  <span>{recurrence || 'Select Schedule'}</span>
                  <FaChevronDown
                    className={`w-4 h-4 text-gray-500 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <ul
                    className='absolute w-72 mt-2 bg-gray-100 border rounded-lg shadow-lg z-[500] 
    overflow-hidden  '
                  >
                    <div className='border-b bg-gray-50 p-2'>
                      <h3 className='text-sm font-semibold text-gray-600 mb-2 px-2'>
                        Quick Options
                      </h3>
                      <li
                        className='flex items-center px-4 py-2.5 hover:bg-blue-50 cursor-pointer 
          rounded-md transition-colors duration-150'
                        onClick={() => {
                          handleRecurrenceChange({ target: { value: 'None' } })
                          setIsOpen(false)
                        }}
                      >
                        <FaRegCalendarTimes className='w-4 h-4 text-gray-500 mr-3' />
                        <span className='font-medium text-gray-700'>
                          No Recurrence
                        </span>
                      </li>
                      <li
                        className='flex items-center px-4 py-2.5 hover:bg-blue-50 cursor-pointer 
          rounded-md transition-colors duration-150'
                        onClick={() => {
                          handleRecurrenceChange({
                            target: { value: 'Add Schedule' },
                          })
                          setIsOpen(false)
                        }}
                      >
                        <FaRegCalendarPlus className='w-4 h-4 text-gray-500 mr-3' />
                        <span className='text-gray-700'>Add New Schedule</span>
                      </li>
                    </div>

                    <div className='p-2'>
                      <h3 className='text-sm font-semibold text-gray-600 mb-2 px-2'>
                        Saved Templates
                      </h3>
                      {gymTemplates.map(template => (
                        <li
                          key={template.id}
                          className={`flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 
            cursor-pointer rounded-md transition-colors duration-150 
            ${template.active ? 'bg-blue-100' : ''}`}
                          onClick={async () => {
                            handleRecurrenceChange({
                              target: { value: template.name },
                            })

                            if (!isActivating) {
                              await toggleActiveStatus(template.id)
                            }

                            setIsOpen(false)
                          }}
                        >
                          <div className='flex items-center'>
                            <FaRegClock className='w-4 h-4 text-gray-500 mr-3' />
                            <span className='text-gray-700'>
                              {template.name}
                            </span>
                          </div>

                          <div
                            className='relative inline-block group'
                            // onMouseEnter={() => setShowTooltip(template.id)}
                            onMouseLeave={() => setShowTooltip(null)}
                          >
                            <div className='relative group w-5 h-5'>
                              <FaInfoCircle
                                className='w-full h-full text-gray-400 transition-colors duration-200 hover:text-blue-500'
                                // style={{ cursor: 'help' }}
                                onClick={e => {
                                  e.stopPropagation()
                                  setShowTooltip(template.id)
                                }}
                              />

                              <div
                                className='opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 
               transform -translate-x-1/2 mb-2 flex items-center gap-1
               px-3 py-1.5 bg-gray-100 text-gray-800 text-sm font-medium 
               rounded-md shadow-lg pointer-events-none
               transition-all duration-200 ease-in-out'
                              >
                                View Details
                              </div>
                            </div>

                            {showTooltip === template.id && (
                              <Modal onClose={() => setShowTooltip(null)}>
                                <div
                                  className='fixed inset-0 flex items-center justify-center z-[9999]'
                                  onClick={e => e.stopPropagation()}
                                >
                                  <div
                                    className='relative bg-white rounded-xl shadow-2xl w-[550px] 
      transition-all duration-500 ease-in-out transform hover:scale-105'
                                  >
                                    {/* Header */}
                                    <div
                                      className='px-6 py-4 border-b border-gray-100 flex justify-between 
        items-center bg-gray-50 rounded-t-xl'
                                    >
                                      <div className='flex items-center space-x-3'>
                                        <div className='p-2 bg-blue-100 rounded-lg'>
                                          <FaClipboardList className='w-5 h-5 text-blue-600' />
                                        </div>
                                        <div>
                                          <h3 className='text-lg font-bold text-gray-800'>
                                            Template Details
                                          </h3>
                                          <div className='flex items-center space-x-2 mt-1'>
                                            <span
                                              className='px-2 py-0.5 bg-blue-100 text-blue-700 
              rounded-full text-xl font-bold'
                                            >
                                              {template.name}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => setShowTooltip(null)}
                                        className='p-2 hover:bg-gray-200 rounded-full'
                                      >
                                        <FaTimes className='w-5 h-5 text-gray-500' />
                                      </button>
                                    </div>

                                    <div className='p-4 rounded-b-xl bg-white'>
                                      <div
                                        className='prose prose-sm prose-slate max-h-[60vh] text-lg 
      overflow-y-auto bg-gray-100 rounded-lg p-4 leading-relaxed shadow-md'
                                        dangerouslySetInnerHTML={{
                                          __html: highlightNumbers(
                                            generateSummary(template)
                                          ),
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </Modal>
                            )}
                          </div>
                        </li>
                      ))}
                    </div>
                  </ul>
                )}
              </div>

              <GetStartedButton onClick={() => setShowGetStarted(true)} />
            </div>
          </div>
          <div>
            <Tabs
              tabs={tabContents}
              activeTab={currentTab}
              onTabChange={setCurrentTab}
            />
          </div>
        </div>

        {/* Slide-out Transcript Panel */}
        <AnimatePresence>
          {selectedTranscript && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className='fixed top-0 right-0 h-full w-[400px] bg-white shadow-lg overflow-y-auto z-50'
            >
              <div className='sticky top-0 z-10 bg-blue-300 py-2.5 px-4 flex justify-between items-center'>
                <div className='inline-flex items-center space-x-2'>
                  <FaBookOpen className='size-5' />
                  <h3 className='text-base font-semibold'>
                    {selectedTranscript?.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTranscript(null)}
                  className='text-gray-700 hover:text-gray-900'
                >
                  ✕
                </button>
              </div>
              <div className='p-4'>
                <TranscriptViewer
                  transcripts={selectedTranscript?.transcript}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay for transcript panel */}
        {selectedTranscript && (
          <div
            className='fixed inset-0 bg-black bg-opacity-25 z-40'
            onClick={() => setSelectedTranscript(null)}
          />
        )}

        {/* GetStarted Modal */}
        {showGetStarted && (
          <GetStarted
            onClose={() => setShowGetStarted(false)}
            onSubmit={handleGetStartedSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Add Schedule Modal */}

        {showAddScheduleModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-full overflow-y-auto'>
              <input
                type='text'
                id='scheduleName'
                name='scheduleName'
                value={scheduleName}
                onChange={e => setScheduleName(e.target.value)}
                placeholder='Enter Schedule Title'
                className='mt-1 block w-full pl-4 pr-4 py-3 text-2xl text-gray-900 font-bold mb-4 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-md placeholder-gray-500 placeholder:font-bold'
              />
              {schedules.map((schedule, index) => (
                <div
                  key={schedule.id}
                  className='mb-4 p-4 rounded-md shadow-md bg-gray-50'
                >
                  <div className='mb-4 flex flex-col md:flex-row items-center'>
                    <div className='mr-4 w-full md:w-1/2'>
                      <label
                        htmlFor={`numberOfUnits-${schedule.id}`}
                        className='block text-lg font-medium text-gray-700'
                      >
                        Number
                      </label>
                      <input
                        type='number'
                        id={`numberOfUnits-${schedule.id}`}
                        name={`numberOfUnits-${schedule.id}`}
                        value={schedule.numberOfUnits}
                        onChange={e =>
                          handleScheduleChange(
                            schedule.id,
                            'numberOfUnits',
                            e.target.value
                          )
                        }
                        className='mt-1 block w-full pl-1 pr-10 py-2 text-lg bg-slate-100 border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md'
                      />
                    </div>
                    <div className='w-full md:w-1/2'>
                      <label
                        htmlFor={`scheduleType-${schedule.id}`}
                        className='block text-lg font-medium text-gray-700'
                      >
                        Type
                      </label>
                      <select
                        id={`scheduleType-${schedule.id}`}
                        name={`scheduleType-${schedule.id}`}
                        value={schedule.type}
                        onChange={e =>
                          handleScheduleChange(
                            schedule.id,
                            'type',
                            e.target.value
                          )
                        }
                        className='mt-1 block w-full pl-3 pr-10 bg-slate-100 py-2 text-lg border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md'
                      >
                        <option value='Days'>Days</option>
                        <option value='Weeks'>Weeks</option>
                      </select>
                    </div>
                  </div>
                  {schedule.timeSlots.map((slot, index) => (
                    <div
                      key={slot.id}
                      className='mb-3 flex flex-col md:flex-row items-center justify-between'
                    >
                      <div className='flex items-center w-full md:w-3/4'>
                        <label
                          htmlFor={`time-${slot.id}-${schedule.id}`}
                          className='block text-lg font-medium pr-5 text-gray-700'
                        >
                          <div className='flex items-center justify-normal'>
                            <span className='inline-block pr-2'>Slot</span>{' '}
                            <span className='inline-block'>{slot.id}</span>
                          </div>
                        </label>
                        <input
                          type='time'
                          id={`time-${slot.id}-${schedule.id}`}
                          value={slot.time}
                          onChange={e =>
                            handleTimeSlotChange(
                              schedule.id,
                              slot.id,
                              e.target.value
                            )
                          }
                          className='mt-1 block w-full pl-3 py-2 text-lg bg-slate-100 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md'
                        />
                      </div>
                      <div className='flex items-center mt-3 md:mt-0'>
                        {index > 0 && (
                          <button
                            onClick={() =>
                              handleRemoveTimeSlot(schedule.id, slot.id)
                            }
                            className='ml-3 px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-lg'
                          >
                            <FaMinus />
                          </button>
                        )}
                        <button
                          onClick={() => handleAddTimeSlot(schedule.id)}
                          className='ml-3 px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center text-lg'
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                  ))}
                  {index > 0 && (
                    <button
                      onClick={() => handleRemoveSchedule(schedule.id)}
                      className='mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600'
                    >
                      Remove Schedule
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddSchedule}
                className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
              >
                Add Another Schedule
              </button>
              <div className='mt-4'>
                <h3 className='text-xl font-bold mb-2'>Summary</h3>
                <p className='text-md text-gray-700 mb-4'>
                  {generateSummary({
                    userTemplate: schedules.map(schedule => ({
                      type: schedule.type,
                      number: schedule.numberOfUnits,
                      time: schedule.timeSlots.map(slot => slot.time),
                    })),
                  })}
                </p>
              </div>
              <div className='mt-4 flex justify-end'>
                <button
                  onClick={() => setShowAddScheduleModal(false)}
                  className='mr-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600'
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log(
                      'Save button clicked, isSaveDisabled =',
                      isSaveDisabled
                    )
                    if (isSaveDisabled) {
                      addNotification({
                        iconColor: 'Fuchsia',
                        header:
                          '🙏🙏🙏Please fill out all required fields before saving.✍✍✍',
                        body: 'Please fill out all required fields before saving.',
                      })
                    } else {
                      handleSaveSchedule()
                    }
                  }}
                  className={`px-4 py-2 text-white rounded-md ${
                    isSaveDisabled
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Leads
