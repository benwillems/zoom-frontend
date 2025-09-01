// import useClientStore from '@/store/clientStore'
// import useAudioStore from '@/store/useAudioStore'
// import { formatTodaysDate } from '@/utils/dates'
// import React, { useEffect } from 'react'
// import { FaRegCalendar } from 'react-icons/fa6'
// import {
//   MdOutlineKeyboardArrowLeft,
//   MdOutlineKeyboardArrowRight,
// } from 'react-icons/md'

// const CalendarDisplay = () => {
//   const { calendarDate, setCalendarDate } = useAudioStore()
//   const { fetchAllAppointments } = useClientStore()

//   useEffect(() => {
//     fetchAllAppointments()
//   }, [calendarDate])

//   return (
//     <div className='flex justify-between items-center flex-wrap pb-1 sm:pb-0 text-black select-none'>
//       <div
//         className='p-0.5 rounded-sm flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
//         onClick={() =>
//           setCalendarDate(
//             new Date(calendarDate.getTime() - 24 * 60 * 60 * 1000)
//           )
//         }
//       >
//         <MdOutlineKeyboardArrowLeft className='text-2xl sm:text-3xl' />
//       </div>
//       <div className='flex items-center space-x-1.5'>
//         <FaRegCalendar className='text-base sm:text-2xl' />
//         <p className='text-base sm:text-xl'>{formatTodaysDate(calendarDate)}</p>
//       </div>
//       <div
//         className='p-0.5 rounded-sm flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
//         onClick={() =>
//           setCalendarDate(
//             new Date(calendarDate.getTime() + 24 * 60 * 60 * 1000)
//           )
//         }
//       >
//         <MdOutlineKeyboardArrowRight className='text-2xl sm:text-3xl' />
//       </div>
//     </div>
//   )
// }

// export default CalendarDisplay






import useClientStore from '@/store/clientStore'
import useAudioStore from '@/store/useAudioStore'
import { formatTodaysDate } from '@/utils/dates'
import React, { useEffect, useRef } from 'react'
import { FaRegCalendar } from 'react-icons/fa6'
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from 'react-icons/md'

const CalendarDisplay = () => {
  const { calendarDate, setCalendarDate } = useAudioStore()
  const { fetchAllAppointments } = useClientStore()
  const abortControllerRef = useRef(null)
  
  useEffect(() => {
   
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    
    const fetchData = async () => {
      try {
     
        await fetchAllAppointments(abortControllerRef.current.signal)
      } catch (error) {
     
        if (error.name !== 'AbortError') {
          console.error('Error fetching appointments:', error)
        }
      }
    }
    
    fetchData()
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [calendarDate, fetchAllAppointments])

  return (
    <div className='flex justify-between items-center flex-wrap pb-1 sm:pb-0 text-black select-none'>
      <div
        className='p-0.5 rounded-sm flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
        onClick={() =>
          setCalendarDate(
            new Date(calendarDate.getTime() - 24 * 60 * 60 * 1000)
          )
        }
      >
        <MdOutlineKeyboardArrowLeft className='text-2xl sm:text-3xl' />
      </div>
      <div className='flex items-center space-x-1.5'>
        <FaRegCalendar className='text-base sm:text-2xl' />
        <p className='text-base sm:text-xl'>{formatTodaysDate(calendarDate)}</p>
      </div>
      <div
        className='p-0.5 rounded-sm flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
        onClick={() =>
          setCalendarDate(
            new Date(calendarDate.getTime() + 24 * 60 * 60 * 1000)
          )
        }
      >
        <MdOutlineKeyboardArrowRight className='text-2xl sm:text-3xl' />
      </div>
    </div>
  )
}

export default CalendarDisplay