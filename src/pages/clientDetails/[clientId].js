import { useEffect } from 'react'
import { useRouter } from 'next/router'
import useClientStore from '@/store/clientStore'
import ClientDetailsHeader from '@/components/ui/PetDetails/ClientDetailsHeader'
import Chatbox from '@/components/ui/PetDetails/Chat/Chatbox'
import useChatStore from '@/store/useChatStore'
import { fetchWithAuth } from '@/utils/generalUtils'
import useAudioStore from '@/store/useAudioStore'
import OverviewTab from '@/components/ui/PetDetails/Tabs/Overview/OverviewTab'
import TabNavigation from '@/components/ui/PetDetails/Tabs/TabNavigation'
import CheckIn from '@/components/ui/PetDetails/Tabs/Checkin/CheckIn'
import MeetingClientLayout from '@/components/ui/PetDetails/MeetingLayout/MeetingClientLayout'

export default function ClientDetailsPage() {
  const router = useRouter()
  const { clientId } = router.query
  const {
    setClientDetails,
    fetchClientRecords,
    clientCurrentTab,
    setClientCurrentTab,
    setIsClientLoading,
    setSelectedCheckInDay,
  } = useClientStore()
  const { fetchUsersTemplates, isMeetingActive } = useAudioStore()
  const { setClientId } = useChatStore()

  // Fetch client details and store clientId into ChatStore to fetch existing conversation stored in localStorage
  useEffect(() => {
    if (clientId) {
      setIsClientLoading(true)
      fetchWithAuth(`/api/clients/${clientId}`)
        .then(response => response.json())
        .then(data => {
          setClientDetails(data)
          setClientId(clientId)
          fetchClientRecords(clientId)
          fetchUsersTemplates()
          setClientCurrentTab('overview')
          setSelectedCheckInDay(null)
        })
        .catch(error => console.log('Error fetching client', error))
        .finally(() => setIsClientLoading(false))
    }
  }, [clientId])

  const renderContentBasedOnTab = () => {
    switch (clientCurrentTab) {
      case 'overview':
        return <OverviewTab />

      case 'checkin':
        return <CheckIn />

      default:
        return <OverviewTab />
    }
  }

  return (
    <>
      {/* Show meeting layout when Zoom meeting is active */}
       {isMeetingActive ? (
        <>
          <MeetingClientLayout />
          <div className="relative z-50">
            <Chatbox />
          </div>
        </>
      ) : (
        /* Normal client details layout */
        <div className='flex flex-col lg:flex-row relative'>
          <div className='bg-gray-100'>
            <div className='lg:sticky top-0 overflow-y-auto h-screen'>
              <ClientDetailsHeader />
            </div>
          </div>
          <div className='flex flex-col lg:w-5/6 xl:w-4/5 2xl:w-full'>
            <TabNavigation />
            {renderContentBasedOnTab()}
          </div>
          <Chatbox />
        </div>
      )}
    </>
  )
}
