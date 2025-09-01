// horizontal view
'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
const Sidebar = dynamic(() => import('../navigation/Sidebar'))
const MobileMenu = dynamic(() => import('../navigation/MobileMenu'))
import { FaBars } from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'
import NotificationList from '../Notification/NotificationList'
import RecordingBar from '../audio/RecordingBar'
import useAudioStore from '@/store/useAudioStore'
import { useRouter } from 'next/router'
import ZoomHeaderHorizontal from './ZoomHeader'
import FloatingMeetingIndicator from '../ui/PetDetails/MeetingLayout/FloatingMeetingIndicator'

export default function Layout({ children }) {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false) // Add sidebar state
  const { activeAppointment, isMeetingActive } = useAudioStore()
  const router = useRouter()

  // Always use horizontal layout
  const viewLayout = 'horizontal';

  // Auto-collapse sidebar when meeting starts
  useEffect(() => {
    if (isMeetingActive) {
      setSidebarCollapsed(true)
    }
    // Optionally restore sidebar when meeting ends
    // if (!isMeetingActive) {
    //   setSidebarCollapsed(false)
    // }
  }, [isMeetingActive])

  let hideRecordingBar = [
    'USER_CANCELLED',
    'USER_DELETED',
    'FAILED',
  ]

  return (
    <div className='h-screen flex relative'>
      {/* Sidebar */}
      <div className='hidden sm:flex'>
        <Sidebar 
          onToggle={setSidebarCollapsed}
          forceCollapsed={isMeetingActive}
        />
      </div>
      
      {/* Main content area */}
      <div 
        className={`flex-1 flex flex-col relative transition-all duration-300 ${
          sidebarCollapsed 
            ? 'sm:ml-16' 
            : 'sm:ml-16 13Inch:ml-[205px]'
        }`}
      >
        {/* Only render horizontal header */}
        {isMeetingActive && (
          <div className='sticky top-0 w-full'>
            <ZoomHeaderHorizontal />
          </div>
        )}
          
        <main className='flex-1 overflow-y-auto bg-lt-primary-off-white dark:bg-primary-dark'>
          {children}
          
          {activeAppointment != null &&
            !hideRecordingBar.includes(activeAppointment?.status) &&
            router.pathname != '/' && (
              <div 
                className={`fixed bottom-0 left-0 right-0 transition-all duration-300 ${
                  sidebarCollapsed 
                    ? 'sm:left-16' 
                    : 'sm:left-16 13Inch:left-[205px]'
                }`}
              >
                {/* <RecordingBar /> */}
              </div>
            )}
        </main>
      </div>

      <div 
        className={`hidden sm:block fixed top-4 right-4 z-50 transition-all duration-300`}
      >
        <NotificationList />
      </div>
      <FloatingMeetingIndicator />
    </div>
  )
}