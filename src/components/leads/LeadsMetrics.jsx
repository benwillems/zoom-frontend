import React, { useMemo } from 'react'
import { BiSolidDownArrow } from 'react-icons/bi'
import { FaPercent, FaClock, FaPhone, FaCalendarWeek } from 'react-icons/fa'
import dynamic from 'next/dynamic'

const ResponsiveBar = dynamic(
  () => import('@nivo/bar').then(mod => mod.ResponsiveBar),
  {
    ssr: false,
    loading: () => (
      <div className='h-64 w-full flex items-center justify-center'>
        Loading chart...
      </div>
    ),
  }
)

const IconMetricUpOrDown = ({ isPositive }) => {
  return (
    <BiSolidDownArrow
      className={`size-4 ${
        isPositive ? 'text-[#5FF880] rotate-180' : 'text-[#F47362]'
      } `}
    />
  )
}

const MetricsCard = ({
  title,
  icon: Icon,
  metricValue,
  isPositive,
  displayIcon,
  metricChange,
  isPercentage = true,
  unit,
}) => {
  const formattedChange = isPercentage
    ? `${metricChange > 0 ? '+' : ''}${metricChange}% from last month`
    : `${metricChange > 0 ? '+' : ''}${metricChange}${
        unit || ''
      } from last month`
  return (
    <div className='flex flex-col w-auto h-[182px] p-6 border rounded-md shadow bg-white'>
      <div className='flex justify-between items-center'>
        <div className='flex flex-col items-start'>
          <h1 className='text-lg font-medium'>{title}</h1>
        </div>
        <Icon className='size-5 text-gray-600' />
      </div>
      <div className='mt-auto space-y-0.5'>
        <p className='text-2xl font-bold'>{metricValue}</p>
        <div className='flex items-center space-x-1.5'>
          {displayIcon && <IconMetricUpOrDown isPositive={isPositive} />}
          <p className='text-gray-600 text-sm'>{formattedChange}</p>
        </div>
      </div>
    </div>
  )
}

const LeadsMetrics = ({ leads }) => {
  const metrics = useMemo(() => {
    // Get current date and previous month for comparisons
    const now = new Date()
    const currentMonth = now.getMonth()
    const previousMonth = currentMonth - 1

    // Split leads into current and previous month
    const currentMonthLeads = leads.filter(
      lead => new Date(lead.createdAt).getMonth() === currentMonth
    )
    const previousMonthLeads = leads.filter(
      lead => new Date(lead.createdAt).getMonth() === previousMonth
    )

    // Calculate booking rate
    const getCurrentBookingRate = leads => {
      const totalLeads = leads.length
      const bookedLeads = leads.filter(lead => lead.bookingDate !== null).length
      return totalLeads ? (bookedLeads / totalLeads) * 100 : 0
    }

    const currentBookingRate = getCurrentBookingRate(currentMonthLeads)
    const previousBookingRate = getCurrentBookingRate(previousMonthLeads)
    const bookingRateChange = currentBookingRate - previousBookingRate

    // Calculate average call duration
    const getAverageCallDuration = leads => {
      const totalDuration = leads.reduce((sum, lead) => sum + lead.duration, 0)
      return leads.length ? totalDuration / leads.length : 0
    }

    const currentAvgDuration = getAverageCallDuration(currentMonthLeads)
    const previousAvgDuration = getAverageCallDuration(previousMonthLeads)
    const durationChange = currentAvgDuration - previousAvgDuration

    // Calculate average calls per booking
    const getAverageCallsPerBooking = leads => {
      // Group leads by phone number to get booking status
      const leadsByPhone = leads.reduce((acc, lead) => {
        if (!acc[lead.phone]) {
          acc[lead.phone] = {
            calls: 1,
            hasBooked: lead.bookingDate !== null,
          }
        } else {
          acc[lead.phone].calls++
          // If any interaction led to a booking, mark as booked
          if (lead.bookingDate !== null) {
            acc[lead.phone].hasBooked = true
          }
        }
        return acc
      }, {})

      // Filter to only booked leads and calculate average
      const bookedLeads = Object.values(leadsByPhone).filter(
        lead => lead.hasBooked
      )
      const totalCalls = bookedLeads.reduce((sum, lead) => sum + lead.calls, 0)

      return bookedLeads.length ? totalCalls / bookedLeads.length : 0
    }

    const currentAvgCalls = getAverageCallsPerBooking(currentMonthLeads)
    const previousAvgCalls = getAverageCallsPerBooking(previousMonthLeads)
    const callsChange = currentAvgCalls - previousAvgCalls

    // Calculate leads by weekday
    const getWeekdayData = leads => {
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const counts = weekdays.map(day => ({ day, count: 0 }))

      leads.forEach(lead => {
        const dayIndex = new Date(lead.createdAt).getDay()
        counts[dayIndex].count++
      })

      return counts
    }

    return {
      bookingRate: {
        current: currentBookingRate.toFixed(1),
        change: bookingRateChange.toFixed(1),
        isPositive: bookingRateChange > 0,
      },
      callDuration: {
        current: currentAvgDuration.toFixed(1),
        change: durationChange.toFixed(1),
        isPositive: durationChange > 0,
      },
      callsPerBooking: {
        current: currentAvgCalls.toFixed(1),
        change: callsChange.toFixed(1),
        isPositive: callsChange > 0,
      },
      weekdayData: getWeekdayData(leads),
    }
  }, [leads])

  const theme = {
    axis: {
      ticks: {
        text: {
          fill: '#64748b',
          fontSize: 11,
        },
      },
    },
    grid: {
      line: {
        stroke: '#e2e8f0',
        strokeWidth: 1,
      },
    },
  }

  return (
    <div className='grid grid-cols-2 gap-4 ml-4 w-3/5'>
      <MetricsCard
        title='Booking Rate'
        description='Percentage of leads leading to an appointment'
        icon={FaPercent}
        metricValue={`${metrics.bookingRate.current}%`}
        isPositive={metrics.bookingRate.isPositive}
        displayIcon={true}
        metricChange={metrics.bookingRate.change}
      />
      <MetricsCard
        title='Avg. Call Duration'
        icon={FaClock}
        metricValue={`${metrics.callDuration.current} min`}
        isPositive={metrics.callDuration.isPositive}
        displayIcon={false}
        metricChange={metrics.callDuration.change}
        isPercentage={false}
        unit=' min'
      />
      <MetricsCard
        title='Avg. Calls per Booking'
        icon={FaPhone}
        metricValue={metrics.callsPerBooking.current}
        isPositive={metrics.callsPerBooking.isPositive}
        displayIcon={false}
        metricChange={metrics.callsPerBooking.change}
        isPercentage={false}
      />
      <div className='flex flex-col h-[182px] py-3 px-5 border rounded-md shadow bg-white'>
        <div className='flex justify-between items-center mb-2'>
          <h1 className='text-lg font-medium'>Calls per Day (2024)</h1>
          <FaCalendarWeek className='size-5 text-gray-600' />
        </div>
        <div className='flex-1'>
          <ResponsiveBar
            data={metrics.weekdayData}
            keys={['count']}
            indexBy='day'
            margin={{ top: 10, right: 10, bottom: 20, left: 30 }}
            padding={0.3}
            colors={'#4ade80'}
            borderRadius={4}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 5,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 5,
              tickValues: 5,
            }}
            enableGridY={true}
            enableLabel={false}
            theme={theme}
            role='application'
            ariaLabel='Leads by weekday chart'
          />
        </div>
      </div>
    </div>
  )
}

export default LeadsMetrics
