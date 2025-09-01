export const convertToLocalTime = isoDateString => {
  const recordDate = new Date(isoDateString)
  const formattedDate = recordDate.toLocaleDateString([], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return formattedDate
}

export const convertUTCToLocalTime = utcTimeString => {
  // Create a Date object from the UTC time string
  const date = new Date(utcTimeString)

  // Get hours and minutes
  let hours = date.getHours()
  const minutes = date.getMinutes()

  // Determine AM or PM
  const ampm = hours >= 12 ? 'PM' : 'AM'

  // Convert to 12-hour format
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'

  // Add leading zero to minutes if needed
  const minutesStr = minutes < 10 ? '0' + minutes : minutes

  // Construct the time string
  return `${hours}:${minutesStr} ${ampm}`
}

// Display date as 5:00 AM or 2:00 PM
export function formatTodaysDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(date).toLocaleDateString([], options)
}

// Weekday Short, Month Long, Day Numeric
export const formatDateByShortDayLongMonthNumericDay = date => {
  const options = {
    weekday: 'short', // "short" for the abbreviated days, e.g., "Sat"
    month: 'long', // "long" for full month name
    day: 'numeric', // "numeric" for the day of the month
  }
  // Make sure 'date' is a Date object
  if (!(date instanceof Date) && typeof date === 'string') {
    date = new Date(date)
  }
  if (!(date instanceof Date)) {
    return '' // Return empty string if 'date' is still not a Date object
  }
  return date.toLocaleDateString([], options)
}

export const convertDate = dateString => {
  const date = new Date(dateString)
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return date.toLocaleDateString([], options)
}

// Convert 2024-05-25 -> May 25th, 2024
export const formatDateToReadable = inputDate => {
  // Ensure the date is interpreted as local time
  const date = new Date(inputDate)

  // Options for the toLocaleDateString to get month name and year
  const options = { month: 'long', day: 'numeric', year: 'numeric' }

  // Formatting the date as per the required format "May 25th, 2024"
  let formattedDate = date.toLocaleDateString('en-US', options)

  // Add the suffix for the day
  const day = date.getDate()
  let suffix = 'th'
  if (day % 10 === 1 && day !== 11) {
    suffix = 'st'
  } else if (day % 10 === 2 && day !== 12) {
    suffix = 'nd'
  } else if (day % 10 === 3 && day !== 13) {
    suffix = 'rd'
  }

  // Replace the day number with day number + suffix
  formattedDate = formattedDate.replace(
    new RegExp(`${day}(?!\\d)`),
    `${day}${suffix}`
  )

  return formattedDate
}

export default {
  convertToLocalTime,
  convertUTCToLocalTime,
  formatTodaysDate,
  convertDate,
  formatDateByShortDayLongMonthNumericDay,
  formatDateToReadable,
}
