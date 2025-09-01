import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import PageHeader from '@/components/common/Page/PageHeader'
import PagePadding from '@/components/common/Page/PagePadding'
import { TrendingUp, DollarSign, BarChart2 } from 'lucide-react'
import Mentions from '@/components/Analytics/Policy/Mentions/Mentions'
import Overview from '@/components/Analytics/Policy/Overview/Overview'
import policyViewData from '@/components/Analytics/Policy/policyViewData.json'
import Sales from '@/components/Analytics/Policy/Sales/Sales'
import Discussions from '@/components/Analytics/Policy/Discussions/Discussions'
import BackLink from '@/components/Analytics/Policy/common/BackLink'
import { fetchWithAuth } from '@/utils/generalUtils'

const ResponsiveFunnel = dynamic(
  () => import('@nivo/funnel').then(mod => mod.ResponsiveFunnel),
  {
    ssr: false,
  }
)

export async function getServerSideProps(context) {
  const { policyId } = context.params

  // --- MOCK DATA FOR TESTING ---
  const mockPolicy = {
    policy: {
      id: policyId,
      name:
        policyId === 'demo-001'
          ? 'Demo Policy'
          : policyId === 'demo-002'
          ? 'Retention Policy'
          : 'Sample Policy',
      criteria: {
        goal:
          policyId === 'demo-001'
            ? 'Achieve 80% client satisfaction'
            : policyId === 'demo-002'
            ? 'Maintain 90% client retention rate'
            : 'Sample goal',
      },
      active: policyId === 'demo-001',
    },
  }

  // Always return mock data for testing
  return {
    props: {
      policy: mockPolicy,
      error: null,
    },
  }
}

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

const PolicyDetailsPage = ({ policy, error }) => {
  const [activeStep, setActiveStep] = useState('overview')

  // Handle error state
  if (error) {
    return (
      <PagePadding>
        <PageHeader title='Error' description='Unable to load policy data' />
        <div className='text-red-500'>{error}</div>
      </PagePadding>
    )
  }

  // Handle loading state (although with SSR this should be rare)
  if (!policy) {
    return (
      <PagePadding>
        <PageHeader title='Loading' description='Loading policy data...' />
      </PagePadding>
    )
  }

  // Define funnel data
  const funnelData = [
    {
      id: 'overview',
      value: policyViewData.sales.conversionFunnel.totalProspects,
      label: 'Total Calls',
    },
    {
      id: 'mentions',
      value: policyViewData.sales.conversionFunnel.initialInterest,
      label: 'Mentions',
    },
    {
      id: 'discussions',
      value: policyViewData.sales.conversionFunnel.productDiscussion,
      label: 'Discussions',
    },
    {
      id: 'sales',
      value: policyViewData.sales.conversionFunnel.completed,
      label: 'Sales',
    },
  ]

  // Map icons to metrics since we can't store them in JSON
  const metricIcons = {
    mentionRate: BarChart2,
    conversionRate: TrendingUp,
    revenueGenerated: DollarSign,
    potentialRevenueLoss: DollarSign,
  }

  const renderContent = () => {
    const components = {
      overview: () => (
        <Overview data={policyViewData.overview} icons={metricIcons} />
      ),
      mentions: () => <Mentions data={policyViewData.mentions} />,
      discussions: () => <Discussions data={policyViewData} />,
      // sales: () => <Sales data={policyViewData.sales} />,
    }

    return components[activeStep]?.() || components.overview()
  }

  const handleFunnelClick = data => {
    if (data.data && data.data.id) {
      setActiveStep(data.data.id)
    }
  }

  return (
    <PagePadding>
      <PageHeader
        title={policy?.policy?.name}
        description='Monitor policy performance and optimize sales strategies'
      />

      <BackLink href='analytics' title='Policies' />

      <div className='mt-6 flex gap-6 h-[calc(100vh-180px)]'>
        <div className='w-2/5 bg-white rounded-lg border shadow-sm p-6 cursor-pointer'>
          <div className='h-full'>
            <div style={{ height: '100%', width: '100%' }}>
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
                borderWidth={0}
                spacing={3}
                shapeBlending={0}
                beforeSeparatorLength={0}
                beforeSeparatorOffset={20}
                afterSeparatorLength={0}
                afterSeparatorOffset={20}
                currentPartSizeExtension={10}
                currentBorderWidth={0}
                onClick={handleFunnelClick}
                enableLabel={false}
                layers={['separators', 'parts', Labels, 'annotations']}
                // tooltip={({ part }) => formatTooltip(part.data)}
                tooltip={() => null}
              />
            </div>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto'>{renderContent()}</div>
      </div>
    </PagePadding>
  )
}

export default PolicyDetailsPage
