import React, { useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import useClientStore from '@/store/clientStore'
import moment from 'moment-timezone'
import Select from 'react-select'
import customTimezones from '../Checkin/timezones.json' // Adjust the path as needed
import { FaGear } from 'react-icons/fa6'
import { BsArrowLeft } from 'react-icons/bs'
import { FaRegSave } from 'react-icons/fa'
import { convertUTCToLocalTime } from '@/utils/dates'
import useNotificationStore from '@/store/useNotificationStore'

const countryCodeOptions = [
  {
    value: '+1',
    label: (
      <>
        <img
          src='/images/checkins/united_states.png'
          alt='American Flag'
          className='inline-block w-4 h-4 mr-2'
        />
        United States (+1)
      </>
    ),
  },
  {
    value: '(+1)',
    label: (
      <>
        <img
          src='/images/checkins/canada.png'
          alt='Canadian Flag'
          className='inline-block w-4 h-4 mr-2'
        />
        Canada (+1)
      </>
    ),
  },
]

const SetupCheckins = ({ SetSetupCheckInsFlag }) => {
  const { clientDetails, setClientDetails } = useClientStore()
  const addNotification = useNotificationStore(state => state.addNotification)

  const guessedTimezone = moment.tz.guess()
  const defaultTimezone =
    customTimezones.find(zone => zone.value === guessedTimezone) ||
    customTimezones.find(zone => zone.value === 'America/New_York')

  const [checkInTime, setCheckInTime] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedTimezone, setSelectedTimezone] = useState(defaultTimezone)
  const [phoneNumber, setPhoneNumber] = useState(
    '+1' + (clientDetails?.phone || '')
  )
  const [checkInGoal, setCheckInGoal] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(countryCodeOptions[0])

  console.log(phoneNumber)

  useEffect(() => {
    if (clientDetails) {
      // Set check-in goal
      if (clientDetails.checkInGoal) {
        setCheckInGoal(clientDetails.checkInGoal)
      }

      // Determine if we're updating
      setIsUpdating(!!clientDetails.checkInTime)

      // Set phone number and country code
      if (clientDetails.phone) {
        setPhoneNumber(clientDetails.phone)
        // const countryCode = clientDetails.phone.startsWith('(+1)')
        //   ? '(+1)'
        //   : '+1'
        // setSelectedCountry(
        //   countryCodeOptions.find(option => option.value === countryCode)
        // )
      }

      // Set timezone
      if (clientDetails.timeZone) {
        const timezone = customTimezones.find(
          zone => zone.value === clientDetails.timeZone
        )
        if (timezone) {
          setSelectedTimezone(timezone)
        }
      }

      // Set check-in time
      if (clientDetails.checkInTime) {
        const localTime = moment
          .utc(clientDetails.checkInTime)
          .tz(clientDetails.timeZone)
        setCheckInTime(localTime.format('HH:mm'))
      }
    }
  }, [clientDetails])

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#2563eb' : 'black',
      boxShadow: state.isFocused ? '0 0 0 1px #2563eb' : provided.boxShadow,
      '&:hover': {
        borderColor: state.isFocused ? '#2563eb' : 'black',
      },
    }),
  }

  const handleCountryCodeChange = selectedOption => {
    const newCode = selectedOption.value.replace(/[()]/g, '') // Remove parentheses if present
    setPhoneNumber(newCode + phoneNumber.slice(2))
    setSelectedCountry(selectedOption)
  }

  const saveCheckIn = async () => {
    try {
      const today = moment.tz(selectedTimezone.value).format('YYYY-MM-DD')
      const localDateTime = moment.tz(
        `${today} ${checkInTime}`,
        selectedTimezone.value
      )
      const utcDateTime = localDateTime.utc().format('YYYY-MM-DD HH:mm:ss')

      let checkinData = {
        checkInTime: utcDateTime,
        timeZone: selectedTimezone.value,
        checkInGoal,
      }

      if (!isUpdating) {
        // Only include these fields when adding a new check-in setup
        checkinData = {
          ...checkinData,
          clientId: clientDetails?.id,
          phoneNumber,
        }
      }

      const url = isUpdating
        ? `/api/update/client/${clientDetails?.id}/checkin`
        : '/api/add/checkin'

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkinData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      let res = await response.json()

      setClientDetails({
        ...clientDetails,
        checkInEnabled: res?.checkInEnabled,
        checkInTime: res?.checkInTime,
        timeZone: res?.timeZone,
        checkInGoal: res?.checkInGoal,
      })

      SetSetupCheckInsFlag(false)

      if (!isUpdating) {
        addNotification({
          iconColor: 'green',
          header: 'User now has Check-Ins setup!',
          description: `${
            clientDetails?.name?.split(' ')[0]
          } will receive their first check-in at ${convertUTCToLocalTime(
            res?.checkInTime
          )}`,
          icon: FaRegSave,
          hideProgressBar: false,
        })
      } else {
        addNotification({
          iconColor: 'green',
          header: 'Check-ins has been updated!',
          icon: FaRegSave,
          hideProgressBar: false,
        })
      }
    } catch (error) {
      console.error(
        `Error ${isUpdating ? 'updating' : 'saving'} checkin setup:`,
        error
      )
    }
  }

  let howToEditPhoneNumber = (
    <>
      To edit phone number click the
      <InlineIcon>
        <FaGear className='size-3.5' />
      </InlineIcon>
      icon next to the client's name.
    </>
  )

  let mustEditPhoneNumberToContinue = (
    <>
      Phone number is required. You can do this by clicking the
      <InlineIcon>
        <FaGear className='size-3.5' />
      </InlineIcon>
      icon next to the client's name.
    </>
  )

  return (
    <div className='w-[700px] p-4 space-y-6'>
      <div className='flex justify-center items-center'>
        {clientDetails?.checkInTime && (
          <div className='absolute left-0 pl-8 cursor-pointer'>
            <div
              className='flex items-center space-x-3'
              onClick={() => SetSetupCheckInsFlag(false)}
            >
              <div className='flex items-center justify-center size-8 bg-blue-100 rounded-full '>
                <BsArrowLeft className='text-blue-600 text-lg' />
              </div>
              <h1 className='text-base font-semibold'>Back to Check-Ins</h1>
            </div>
          </div>
        )}
        <h2 className='text-3xl font-bold'>Check-In Setup</h2>
      </div>
      <div>
        <label
          htmlFor='checkInTime'
          className='block text-xl font-medium text-gray-700'
        >
          Check-in Report Time
        </label>
        <p className='text-base italic text-gray-600 mb-1'>
          Select the daily check-in time and timezone
        </p>
        <div className='flex items-center space-x-2'>
          <input
            type='time'
            id='checkInTime'
            value={checkInTime}
            onChange={e => setCheckInTime(e.target.value)}
            className='block w-40 h-9 rounded-sm outline outline-black outline-1 p-1 shadow-sm focus:outline-none focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50'
          />
          <Select
            value={selectedTimezone}
            onChange={setSelectedTimezone}
            options={customTimezones}
            styles={customSelectStyles}
            className='w-full'
            placeholder='Select timezone...'
          />
        </div>
      </div>

      <div>
        <label
          htmlFor='phoneNumber'
          className='block text-xl font-medium text-gray-700'
        >
          Phone Number
        </label>

        <p
          className={`text-base italic text-gray-600 mb-1 ${
            clientDetails?.phone == null ? 'text-red-500' : ''
          }`}
        >
          {clientDetails?.phone == null
            ? mustEditPhoneNumberToContinue
            : howToEditPhoneNumber}
        </p>

        <div className='flex items-center space-x-2'>
          {/* <Select
            options={countryCodeOptions}
            isSearchable={false}
            value={selectedCountry}
            styles={customSelectStyles}
            onChange={handleCountryCodeChange}
            className='w-80 cursor-pointer'
          /> */}
          <input
            type='text'
            id='phoneNumber'
            value={phoneNumber.replace(/^\(\+1\)|\+1/, '')} // Remove either '(+1)' or '+1' from the start
            onChange={e => setPhoneNumber('(+1)' + e.target.value)}
            readOnly
            className='block w-full h-9 rounded-sm outline bg-gray-100 outline-black outline-1 p-1 shadow-sm cursor-default input input-bordered'
            disabled
          />
        </div>
      </div>

      <div>
        <label
          htmlFor='checkInGoal'
          className='block text-xl font-medium text-gray-700'
        >
          Check-in Goal
        </label>
        <p className='text-base italic text-gray-600 mb-1'>
          Describe the goal of the check-in
        </p>
        <TextareaAutosize
          id='checkInGoal'
          value={checkInGoal}
          onChange={e => setCheckInGoal(e.target.value)}
          minRows={6}
          className='mt-1 block w-full rounded-sm outline outline-gray-500 outline-1 py-2 px-3 shadow-sm focus:outline-none focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-50 resize-none placeholder:text-gray-500'
          placeholder='Example: We want to find out what you had for breakfast, lunch, and dinner today. Additionally, we are interested in knowing if you worked out at Sasquatch Strength. How were your energy levels throughout the day? Were they consistent or did they fluctuate? Finally, please rate your overall energy level on a scale of 1 to 5.'
        />
      </div>

      <div>
        <button
          onClick={saveCheckIn}
          className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-800 disabled:hover:bg-gray-900 disabled:cursor-not-allowed'
          disabled={
            clientDetails?.phone == null ||
            checkInGoal == '' ||
            checkInTime == ''
          }
        >
          {isUpdating ? 'Update' : 'Save'} Check-in Setup
        </button>
      </div>
    </div>
  )
}

const InlineIcon = ({ children }) => (
  <span className='inline-flex items-center align-middle mx-1'>{children}</span>
)

export default SetupCheckins
