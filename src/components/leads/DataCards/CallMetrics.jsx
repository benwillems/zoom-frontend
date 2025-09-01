import dynamic from 'next/dynamic'
import React, { useState } from 'react'
import Select from 'react-select'
import { format } from 'date-fns'

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

const ResponsiveLine = dynamic(
  () => import('@nivo/line').then(mod => mod.ResponsiveLine),
  {
    ssr: false,
    loading: () => (
      <div className='h-64 w-full flex items-center justify-center'>
        Loading chart...
      </div>
    ),
  }
)

const CallMetrics = ({ leads }) => {
  const currentYear = new Date().getFullYear()
  const [timeframe, setTimeframe] = useState({
    value: 'yearly',
    label: 'Yearly',
  })

  const { totalBookingsForTheYear, currentMonthBookings } =
    React.useMemo(() => {
      const currentMonth = new Date().getMonth()
      const currentMonthBookings = leads.filter(lead => {
        const leadMonth = new Date(lead.createdAt).getMonth()
        return leadMonth === currentMonth && lead.bookingDate !== null
      }).length

      const totalBookingsForTheYear = leads.filter(
        lead => lead.bookingDate !== null
      ).length

      return { totalBookingsForTheYear, currentMonthBookings }
    }, [leads])

  const selectStyles = {
    control: base => ({
      ...base,
      minHeight: '35px',
      background: 'white',
      borderColor: '#e2e8f0',
      '&:hover': {
        borderColor: '#cbd5e1',
      },
    }),
    menu: base => ({
      ...base,
      background: 'white',
      marginTop: '4px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#e2e8f0' : 'white',
      color: '#1e293b',
      '&:hover': {
        backgroundColor: '#f1f5f9',
      },
    }),
  }

  const barChartData = React.useMemo(() => {
    const monthlyData = {}

    leads.forEach(lead => {
      const date = new Date(lead.createdAt)
      const monthName = date.toLocaleString('default', { month: 'short' })
      // Create a date object for the first of each month
      const monthDate = new Date(date.getFullYear(), date.getMonth(), 1)

      if (!monthlyData[monthName]) {
        monthlyData[monthName] = {
          month: monthName,
          date: monthDate,
          'Not Booked': 0,
          Booked: 0,
        }
      }

      if (lead.bookingDate !== null) {
        monthlyData[monthName]['Booked'] += 1
      } else {
        monthlyData[monthName]['Not Booked'] += 1
      }
    })

    return Object.values(monthlyData)
  }, [leads])

  const lineChartData = React.useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentMonthLeads = leads.filter(lead => {
      const leadMonth = new Date(lead.createdAt).getMonth()
      return leadMonth === currentMonth
    })

    const lastDay = currentMonthLeads.reduce((max, lead) => {
      const day = new Date(lead.createdAt).getDate()
      return Math.max(max, day)
    }, 0)

    const dailyStats = {}

    for (let i = 1; i <= lastDay; i++) {
      dailyStats[i] = { x: i, bookedCalls: 0, notBooked: 0 }
    }

    currentMonthLeads.forEach(lead => {
      const date = new Date(lead.createdAt).getDate()
      if (lead.bookingDate !== null) {
        dailyStats[date].bookedCalls += 1
      } else {
        dailyStats[date].notBooked += 1
      }
    })

    const sortedData = Object.values(dailyStats).sort((a, b) => a.x - b.x)

    return [
      {
        id: 'Not Booked',
        data: sortedData.map(d => ({
          x: d.x,
          y: d.notBooked,
        })),
      },
      {
        id: 'Booked',
        data: sortedData.map(d => ({
          x: d.x,
          y: d.bookedCalls,
        })),
      },
    ]
  }, [leads])

  const maxY = React.useMemo(() => {
    const allValues = lineChartData.flatMap(series => series.data.map(d => d.y))
    return Math.max(...allValues)
  }, [lineChartData])

  const commonTheme = {
    axis: {
      ticks: {
        text: {
          fill: '#64748b',
          fontSize: 12,
        },
      },
      legend: {
        text: {
          fill: '#64748b',
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
    },
    grid: {
      line: {
        stroke: '#e2e8f0',
        strokeWidth: 1,
      },
    },
    legends: {
      text: {
        fill: '#64748b',
        fontSize: 14,
      },
    },
  }

  const getCurrentMonthName = () => {
    return format(new Date(), 'LLLL')
  }

  const formatTooltipDate = day => {
    const date = new Date(currentYear, new Date().getMonth(), day)
    return format(date, 'MMM, do, yyyy')
  }

  const CustomBarTooltip = ({ id, value, color, data }) => (
    <div className='bg-white p-2 shadow rounded border border-gray-200'>
      <div className='text-sm font-medium text-gray-600 mb-1'>
        {format(data.date, 'MMMM yyyy')}
      </div>
      <div className='flex items-center gap-2 text-sm'>
        <div
          className='w-3 h-3 rounded-full'
          style={{ backgroundColor: color }}
        />
        <strong>{id}</strong> - {value}
      </div>
    </div>
  )

  const calculateNiceScale = (maxValue, tickCount = 8) => {
    // Nice numbers for tick spacing
    const niceNumbers = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000]

    // Find a nice number that divides maxValue into approximately tickCount segments
    const roughStep = maxValue / (tickCount - 1)
    const niceStep =
      niceNumbers.find(n => n >= roughStep) ||
      niceNumbers[niceNumbers.length - 1]

    // Calculate the actual max value to use (round up to nearest step)
    const niceMax = Math.ceil(maxValue / niceStep) * niceStep

    // Generate the tick values
    return Array.from(
      { length: Math.floor(niceMax / niceStep) + 1 },
      (_, i) => i * niceStep
    )
  }

  const tickValues = React.useMemo(() => calculateNiceScale(maxY), [maxY])

  return (
    <div className='w-2/5 mb-6 bg-white rounded-lg shadow'>
      <div className='px-6 pt-4 pb-2'>
        <div className='flex justify-between items-center'>
          <div className='space-y-1'>
            <h2 className='text-xl font-semibold text-gray-800'>
              Call Metrics
            </h2>
            <p className='text-sm text-gray-600'>
              Displays {currentYear} Metrics
            </p>
          </div>
          <Select
            value={timeframe}
            onChange={setTimeframe}
            options={[
              { value: 'yearly', label: 'Yearly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
            styles={selectStyles}
            className='w-40'
          />
        </div>
      </div>

      <div className='px-3 py-5'>
        <div className='h-72 w-full relative'>
          {timeframe.value === 'yearly' ? (
            <ResponsiveBar
              data={barChartData}
              keys={['Booked', 'Not Booked']}
              indexBy='month'
              margin={{ top: 32, right: 15, bottom: 40, left: 34 }}
              padding={0.3}
              groupMode='grouped'
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={['#4ade80', '#f87171']}
              borderRadius={4}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                format: v => Math.round(v),
              }}
              tooltip={CustomBarTooltip}
              labelSkipWidth={12}
              labelSkipHeight={12}
              legends={[
                {
                  dataFrom: 'keys',
                  anchor: 'top-left',
                  direction: 'row',
                  justify: false,
                  translateX: -20,
                  translateY: -35,
                  itemsSpacing: 2,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemDirection: 'left-to-right',
                  symbolSize: 14,
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemBackground: 'rgba(0, 0, 0, .03)',
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]}
              theme={commonTheme}
            />
          ) : lineChartData[0]?.data?.length === 0 &&
            lineChartData[1]?.data?.length === 0 ? (
            <div className='h-full w-full flex flex-col items-center justify-center text-gray-500'>
              <p className='text-lg font-medium'>No data available</p>
              <p className='text-sm'>
                There are no calls recorded for this month
              </p>
            </div>
          ) : (
            <ResponsiveLine
              data={lineChartData}
              margin={{ top: 37, right: 15, bottom: 50, left: 31 }}
              xScale={{
                type: 'point',
              }}
              yScale={{
                type: 'linear',
                min: 0,
                max: Math.max(...tickValues),
                stacked: false,
                round: true,
                // tickValues: Array.from({ length: maxY + 1 }, (_, i) => i),
              }}
              curve='monotoneX'
              axisBottom={{
                tickSize: 10,
                tickPadding: 4,
                tickRotation: 0,
                tickValues: lineChartData[0].data.map(d => d.x),
                legend: getCurrentMonthName(),
                legendPosition: 'middle',
                legendOffset: 43,
              }}
              axisLeft={{
                tickSize: 6,
                tickPadding: 5,
                tickRotation: 0,
                format: v => Math.round(v),
                tickValues: tickValues,
              }}
              enablePoints={true}
              pointSize={8}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              enablePointLabel={false}
              enableArea={true}
              areaOpacity={0.4}
              enableGridX={false}
              gridYValues={7}
              enableGridY={true}
              useMesh={true}
              enableSlices='x'
              sliceTooltip={({ slice }) => (
                <div className='bg-white p-2 shadow rounded border border-gray-200'>
                  <div className='text-sm font-medium text-gray-600 mb-1'>
                    {formatTooltipDate(slice.points[0].data.x)}
                  </div>
                  {slice.points.map(point => (
                    <div
                      key={point.id}
                      className='flex items-center gap-2 text-sm'
                    >
                      <div
                        className='w-3 h-3 rounded-full'
                        style={{ backgroundColor: point.serieColor }}
                      />
                      <strong>{point.serieId}</strong> - {point.data.y}
                    </div>
                  ))}
                </div>
              )}
              colors={['#f87171', '#4ade80']}
              lineWidth={3}
              theme={commonTheme}
              legends={[
                {
                  anchor: 'top-left',
                  direction: 'row',
                  justify: false,
                  translateX: -18,
                  translateY: -40,
                  itemsSpacing: 2,
                  itemDirection: 'left-to-right',
                  itemWidth: 100,
                  itemHeight: 20,
                  symbolSize: 14,
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemBackground: 'rgba(0, 0, 0, .03)',
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]}
            />
          )}

          {timeframe.value === 'yearly' ? (
            <div className='absolute right-0 top-[-6px] px-4'>
              <div className='flex items-center gap-1'>
                <span className='text-sm text-gray-700 font-medium'>
                  Total Booked:
                </span>
                <span className='text-base mb-0.5 font-bold text-green-500'>
                  {totalBookingsForTheYear}
                </span>
              </div>
            </div>
          ) : (
            <div className='absolute right-0 top-[-7px] px-4'>
              {!lineChartData[0].data.length === 0 &&
                !lineChartData[1].data.length === 0 && (
                  <div className='flex items-center gap-1'>
                    <span className='text-sm text-gray-700 font-medium'>
                      Appointments Booked:
                    </span>
                    <span className='text-base mb-0.5 font-bold text-green-500'>
                      {currentMonthBookings}
                    </span>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CallMetrics
