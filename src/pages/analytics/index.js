// import React, { useState } from 'react'
// import PageHeader from '@/components/common/Page/PageHeader'
// import PagePadding from '@/components/common/Page/PagePadding'
// import { Phone, Clock, MessageSquare, Heart } from 'lucide-react'
// import MetricsCard from '@/components/Analytics/Policy/common/MetricsCard'
// import RecentCallsAndNutritionistPerformance from '@/components/Analytics/Policy/Overview/RecentCallsAndNutritionistPerformance'
// import NutritionistPerformanceGraph from '@/components/Analytics/Policy/Overview/NutritionistPerformanceGraph'
// import OrgLevelPolicyTable from '@/components/Analytics/Policy/Overview/OrgLevelPolicyTable'

// const Analytics = () => {
//   const metrics = {
//     totalCalls: {
//       title: 'Total Calls',
//       value: 365,
//       change: 12,
//       icon: Phone,
//       isPositive: true,
//       displayIcon: true,
//     },
//     avgDuration: {
//       title: 'Avg. Call Duration',
//       value: '29m',
//       change: -3,
//       icon: Clock,
//       unit: 'm',
//       isPercentage: false,
//     },
//     conversationRate: {
//       title: 'Succeeded',
//       value: '78.5%',
//       change: 6,
//       icon: MessageSquare,
//       isPositive: true,
//       displayIcon: true,
//     },
//     noShow: {
//       title: 'No Show',
//       value: '4.8',
//       change: 0.3,
//       icon: Heart,
//       isPositive: true,
//       isPercentage: false,
//       displayIcon: true,
//     },
//   }

//   const recentCalls = [
//     {
//       nutritionist: 'Corey Wilkins',
//       client: 'Sam Smith',
//       duration: 33,
//       tone: 'Positive',
//       type: 'Check-in Call',
//       time: '3m',
//     },
//     {
//       nutritionist: 'Rebecca Puggs',
//       client: 'Joanna Betts',
//       duration: 38,
//       tone: 'Negative',
//       type: 'Check-in Call',
//       time: '1h',
//     },
//     {
//       nutritionist: 'Corey Wilkins',
//       client: 'Patricia Knowls',
//       duration: 28,
//       tone: 'Positive',
//       type: 'Check-in Call',
//       time: '2h',
//     },
//   ]

//   // 1. Add state for period selection
//   const [period, setPeriod] = useState('day');

//   return (
//     <PagePadding>
//       <div className="relative">
//         <PageHeader
//           title='Nutritionist Analytics'
//           description='Monitor your nutritionists performance and call metrics'
//         />
//         {/* Period selection top right */}
//         <div className="absolute top-0 right-0 mt-2 mr-2 z-10">
//           <div className="inline-flex rounded-md shadow-sm bg-gray-100">
//             {['last seven days', 'last month', 'last three months'].map(option => (
//               <button
//                 key={option}
//                 onClick={() => setPeriod(option)}
//                 className={`px-4 py-1 text-sm font-medium border border-gray-200 first:rounded-l-md last:rounded-r-md
//                   ${period === option ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}
//                 `}
//               >
//                 {option.charAt(0).toUpperCase() + option.slice(1)}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//       <div className='mt-8 flex flex-col gap-6 h-full'>
//         <div className='flex flex-col lg:flex-row gap-6 h-[370px] '>
//           {/* Right side card */}
//           <div className='grid grid-cols-2 gap-4 h-full lg:w-[600px]'>  
//             {Object.entries(metrics).map(([key, data]) => (
//               <MetricsCard
//                 key={key}
//                 title={data.title
//                   .replace(/([A-Z])/g, ' $1')
//                   .replace(/^./, str => str.toUpperCase())}
//                 metricValue={data.value}
//                 metricChange={data.change}
//                 icon={data.icon}
//                 displayIcon={data.displayIcon}
//                 isPositive={data.isPositive}
//                 isPercentage={data.isPercentage !== false}
//                 unit={data.unit}
//               />
//             ))}
//           </div>
//           <div className='flex-1 flex flex-col'>
//          {/* Policies Table */}
//             <OrgLevelPolicyTable period={period} />
//           </div>
//         </div>
//         <div className='flex items-center space-x-4'>
//           <div className='flex-1'>
//             <RecentCallsAndNutritionistPerformance recentCalls={recentCalls} />
//           </div>
//           <div className='w-3/5'>
//             <NutritionistPerformanceGraph />
//           </div>
//         </div>
//       </div>
//     </PagePadding>
//   )
// }

// export default Analytics





import React, { useState, useEffect } from 'react'
import PageHeader from '@/components/common/Page/PageHeader'
import PagePadding from '@/components/common/Page/PagePadding'
import { Phone, Clock, MessageSquare, Heart } from 'lucide-react'
import MetricsCard from '@/components/Analytics/Policy/common/MetricsCard'
import RecentCallsAndNutritionistPerformance from '@/components/Analytics/Policy/Overview/RecentCallsAndNutritionistPerformance'
import NutritionistPerformanceGraph from '@/components/Analytics/Policy/Overview/NutritionistPerformanceGraph'
import OrgLevelPolicyTable from '@/components/Analytics/Policy/Overview/OrgLevelPolicyTable'
import { fetchWithAuth } from '@/utils/generalUtils'

const Analytics = () => {
  const [period, setPeriod] = useState('last seven days')
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Function to calculate date range based on period
  const getDateRange = (period) => {
    let endDate = new Date()
    const startDate = new Date()

    switch (period) {
      case 'last seven days':
        startDate.setDate(endDate.getDate() - 7)
        break
      case 'last month':
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case 'last three months':
        startDate.setMonth(endDate.getMonth() - 3)
        break
      default:
        startDate.setDate(endDate.getDate() - 7)
    }

    //add one day in end date
    endDate.setDate(endDate.getDate() + 1)

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  }

  // Function to fetch analytics data
  const fetchAnalyticsData = async (selectedPeriod) => {
    try {
      setLoading(true)
      const { startDate, endDate } = getDateRange(selectedPeriod)
      
      // You can get userId from your auth store or context
      const userId = 1 // Replace with actual userId from your auth system
      
      const queryParams = new URLSearchParams({
        startDate,
        endDate,
        userId: userId.toString(),
        compare: 'true'
      })

      const response = await fetchWithAuth(`/api/analytics/appointments?${queryParams}`)
      const data = await response.json()
      
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when component mounts or period changes
  useEffect(() => {
    fetchAnalyticsData(period)
  }, [period])

  // Calculate metrics from API data
  const metrics = analyticsData ? {
    totalCalls: {
      title: 'Total Calls',
      value: analyticsData.summary.total,
      change: 0, // You can calculate this from comparison data if needed
      icon: Phone,
      isPositive: true,
      displayIcon: true,
    },
    avgDuration: {
      title: 'Avg. Call Duration Minutes',
      value: analyticsData.summary.averageDurationMinutes,
      change: -3,
      icon: Clock,
      unit: 'm',
      isPercentage: false,
    },
    conversationRate: {
      title: 'Succeeded',
      value: `${(analyticsData.summary.successRate * 100).toFixed(1)}%`,
      change: 0, // Calculate from comparison if needed
      icon: MessageSquare,
      isPositive: analyticsData.summary.successRate > 0.5,
      displayIcon: true,
    },
    noShow: {
      title: 'No Show',
      value: `${(analyticsData.summary.noShowRate * 100).toFixed(1)}%`,
      change: 0, // Calculate from comparison if needed
      icon: Heart,
      isPositive: analyticsData.summary.noShowRate < 0.1, // Lower no-show rate is better
      isPercentage: false,
      displayIcon: true,
    },
  } : {
    // Default/loading metrics
    totalCalls: {
      title: 'Total Calls',
      value: 0,
      change: 0,
      icon: Phone,
      isPositive: true,
      displayIcon: true,
    },
    avgDuration: {
      title: 'Avg. Call Duration',
      value: '0m',
      change: 0,
      icon: Clock,
      unit: 'm',
      isPercentage: false,
    },
    conversationRate: {
      title: 'Succeeded',
      value: '0%',
      change: 0,
      icon: MessageSquare,
      isPositive: true,
      displayIcon: true,
    },
    noShow: {
      title: 'No Show',
      value: '0%',
      change: 0,
      icon: Heart,
      isPositive: true,
      isPercentage: false,
      displayIcon: true,
    },
  }

  const recentCalls = [
    {
      nutritionist: 'Corey Wilkins',
      client: 'Sam Smith',
      duration: 33,
      tone: 'Positive',
      type: 'Check-in Call',
      time: '3m',
    },
    {
      nutritionist: 'Rebecca Puggs',
      client: 'Joanna Betts',
      duration: 38,
      tone: 'Negative',
      type: 'Check-in Call',
      time: '1h',
    },
    {
      nutritionist: 'Corey Wilkins',
      client: 'Patricia Knowls',
      duration: 28,
      tone: 'Positive',
      type: 'Check-in Call',
      time: '2h',
    },
  ]

  return (
    <PagePadding>
      <div className="relative">
        <PageHeader
          title='Nutritionist Analytics'
          description='Monitor your nutritionists performance and call metrics'
        />
        {/* Period selection top right */}
        <div className="absolute top-0 right-0 mt-2 mr-2 z-10">
          <div className="inline-flex rounded-md shadow-sm bg-gray-100">
            {['last seven days', 'last month', 'last three months'].map(option => (
              <button
                key={option}
                onClick={() => setPeriod(option)}
                className={`px-4 py-1 text-sm font-medium border border-gray-200 first:rounded-l-md last:rounded-r-md
                  ${period === option ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}
                `}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className='mt-8 flex flex-col gap-6 h-full'>
        <div className='flex flex-col lg:flex-row gap-6 h-[370px] '>
          {/* Right side card */}
          <div className='grid grid-cols-2 gap-4 h-full lg:w-[600px]'>  
            {Object.entries(metrics).map(([key, data]) => (
              <MetricsCard
                key={key}
                title={data.title
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())}
                metricValue={loading ? 'Loading...' : data.value}
                metricChange={data.change}
                icon={data.icon}
                displayIcon={data.displayIcon}
                isPositive={data.isPositive}
                isPercentage={data.isPercentage !== false}
                unit={data.unit}
              />
            ))}
          </div>
          <div className='flex-1 flex flex-col'>
         {/* Policies Table */}
            <OrgLevelPolicyTable period={period} />
          </div>
        </div>
        <div className='flex items-center space-x-4'>
          <div className='flex-1'>
            <RecentCallsAndNutritionistPerformance recentCalls={recentCalls} />
          </div>
          <div className='w-3/5'>
            <NutritionistPerformanceGraph />
          </div>
        </div>
      </div>
    </PagePadding>
  )
}

export default Analytics

