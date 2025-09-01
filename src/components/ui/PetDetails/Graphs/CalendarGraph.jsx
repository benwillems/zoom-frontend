import dynamic from 'next/dynamic'
import useClientStore from '@/store/clientStore'

const ResponsiveCalendarCanvas = dynamic(
  () =>
    import('@nivo/calendar').then(module => module.ResponsiveCalendarCanvas),
  { ssr: false }
)

const CalendarGraph = () => {
  const {
    setSelectedCheckInDay,
    clientCheckIns,
    clientCurrentTab,
    setClientCurrentTab,
    clientDetails,
  } = useClientStore()

  const handleDayClick = data => {
    if (data?.data?.status == 'IN_PROGRESS') return

    setSelectedCheckInDay(data)
    if (clientCurrentTab === 'overview') {
      setClientCurrentTab('checkin')
    }
  }

  const formatDate = dateString => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric' })
  }

  const extractNumberFromClientsCalories = str => {
    // Use a regular expression to match one or more digits
    const match = str?.match(/\d+/)

    // If a match is found, convert it to a number and return it
    if (match) {
      return Number(match[0])
    }

    // If no number is found, return null
    return null
  }

  const formatTooltip = data => {
    const formattedDate = formatDate(data.day)
    const isHighCalories =
      data?.checkInSummary?.totalMacros?.calories >=
      extractNumberFromClientsCalories(
        clientDetails?.calorieGoalBreakdown?.calories
      )

    if (data?.status == 'IN_PROGRESS') {
      return (
        <div className='rounded-md py-2 px-4 shadow-lg drop-shadow-lg font-semibold bg-purple-100 text-purple-600'>
          <strong className='font-bold'>{formattedDate}</strong>
          <br />
          In Progress
        </div>
      )
    }

    return (
      <div
        className={`rounded-md py-2 px-4 shadow-lg drop-shadow-lg font-semibold ${
          isHighCalories
            ? 'bg-red-100 text-red-600'
            : 'bg-blue-100 text-blue-600'
        }`}
      >
        <strong className='font-bold'>{formattedDate}</strong>
        <br />
        Calories: {data?.checkInSummary?.totalMacros?.calories}
        <br />
        Fats: {data?.checkInSummary?.totalMacros?.fat}g<br />
        Proteins: {data?.checkInSummary?.totalMacros?.protein}g<br />
        Carbs: {data?.checkInSummary?.totalMacros?.carbohydrates}g
      </div>
    )
  }

  const adjustedCheckIns = clientCheckIns?.map(checkIn => {
    // Parse the original date
    const [year, month, day] = checkIn.day.split('-').map(Number)

    // Create a new Date object and add one day
    const adjustedDate = new Date(year, month - 1, day + 1)

    // Format the adjusted date back to YYYY-MM-DD
    const adjustedDay = adjustedDate.toISOString().split('T')[0]

    return {
      ...checkIn,
      day: adjustedDay,
      value: checkIn?.checkInSummary?.totalMacros?.calories, // Assuming you want to display calories
    }
  })

  const colorScale = value => {
    // Find a check-in with this value that is IN_PROGRESS
    const inProgressCheckIn = adjustedCheckIns?.find(
      ci => ci?.value == value && ci?.status == 'IN_PROGRESS'
    )

    if (inProgressCheckIn?.status == 'IN_PROGRESS') {
      return '#A78BFA' // Purple color for in-progress check-ins
    } else if (
      value >=
      extractNumberFromClientsCalories(
        clientDetails?.calorieGoalBreakdown?.calories
      )
    ) {
      return '#EF4444' // Red color for calories exceeding the goal
    } else {
      return '#2563EB' // Default blue color for other cases
    }
  }

  return (
    <div className='w-full h-48 select-none'>
      <ResponsiveCalendarCanvas
        data={adjustedCheckIns}
        from='2024-05-01'
        to='2024-12-31'
        onClick={data => handleDayClick(data)}
        emptyColor='#eeeeee'
        colors={['#2563EB', '#EF4444', '#A78BFA']} // Specify the color scale
        colorScale={colorScale} // Use the colorScale function
        margin={{ top: 20, right: 20, bottom: 20, left: 35 }}
        yearSpacing={40}
        monthBorderColor='#ffffff'
        dayBorderWidth={2}
        dayBorderColor='#ffffff'
        tooltip={({ data }) => formatTooltip(data)}
      />
    </div>
  )
}

export default CalendarGraph
