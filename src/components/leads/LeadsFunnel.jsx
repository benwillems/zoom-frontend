// components/leads/LeadsFunnel.jsx
import React, { useMemo, Suspense } from 'react'
import dynamic from 'next/dynamic'

const ResponsiveFunnel = dynamic(
  () => import('@nivo/funnel').then(mod => mod.ResponsiveFunnel),
  { ssr: false }
)

const LoadingFunnel = () => (
  <div className='h-[400px] w-full flex items-center justify-center'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
  </div>
)

const LeadsFunnel = ({ data, onStepClick }) => {
  const funnelData = useMemo(() => {
    const totalCalls = data.length
    const notBookedMeetings = data.filter(
      lead => lead.status === 'NO_BOOKING'
    ).length
    const bookedMeetings = data.filter(
      lead => lead.status === 'MEETING_BOOKED'
    ).length

    return [
      {
        id: 'Total Calls',
        value: totalCalls,
        label: `Total Calls`,
      },
      {
        id: 'Booked Meetings',
        value: bookedMeetings,
        label: `Meetings Booked`,
      },
      {
        id: 'Did Not Book Meeting',
        value: notBookedMeetings,
        label: `Didn't Book`,
      },
    ]
  }, [data])

  const PartLabel = ({ part }) => {
    return (
      <g transform={`translate(${part.x}, ${part.y})`}>
        <text
          textAnchor='middle'
          dominantBaseline='central'
          style={{
            fill: '#fff',
            fontSize: '13px',
            fontWeight: 'bold',
            pointerEvents: 'none',
          }}
        >
          {`${part.data.value.toLocaleString()} ${part.data.label}`}
        </text>
      </g>
    )
  }

  const Labels = props => {
    return props.parts.map(part => <PartLabel key={part.data.id} part={part} />)
  }

  return (
    <div className='h-[calc(100vh-170px)] w-full'>
      <Suspense fallback={<LoadingFunnel />}>
        <ResponsiveFunnel
          data={funnelData}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          valueFormat='>-.0f'
          colors={{ scheme: 'tableau10' }}
          labelColor='#fff'
          // borderWidth={20}
          // beforeSeparatorLength={0}
          // beforeSeparatorOffset={20}
          // afterSeparatorLength={0}
          // afterSeparatorOffset={20}
          // currentPartSizeExtension={10}
          enableBeforeSeparators={false}
          enableAfterSeparators={false}
          isInteractive={true}
          beforeSeparatorLength={100}
          beforeSeparatorOffset={20}
          afterSeparatorLength={100}
          afterSeparatorOffset={20}
          currentPartSizeExtension={10}
          currentBorderWidth={20}
          motionConfig='wobbly'
          // borderWidth={0}
          // spacing={3}
          // shapeBlending={0}
          // beforeSeparatorLength={0}
          // beforeSeparatorOffset={20}
          // afterSeparatorLength={0}
          // afterSeparatorOffset={20}
          // currentPartSizeExtension={10}
          // currentBorderWidth={0}
          // onClick={handleFunnelClick}
          enableLabel={false}
          layers={['separators', 'parts', Labels, 'annotations']}
          // tooltip={({ part }) => formatTooltip(part.data)}
          tooltip={() => null}
        />
      </Suspense>
    </div>
  )
}

export default LeadsFunnel
