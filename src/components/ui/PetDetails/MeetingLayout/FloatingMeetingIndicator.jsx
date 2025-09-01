import React, { useState } from 'react'
import useAudioStore from '@/store/useAudioStore'
import useClientStore from '@/store/clientStore'
import { useRouter } from 'next/router'
import { FaVideo, FaExpand, FaEye } from 'react-icons/fa'

const FloatingMeetingIndicator = () => {
  const { isMeetingActive, activeAppointment } = useAudioStore()
  const { clientDetails } = useClientStore()
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  // Don't show if no meeting or already on client details page
  if (!isMeetingActive || !activeAppointment?.client?.id) {
    return null
  }

  // Fix the path check - remove the stray 'clientDetails' and fix the path
  const isOnClientDetailsPage = router.pathname.includes('/clientDetails/') && 
    router.query.clientId === activeAppointment.client.id.toString()
  
  if (isOnClientDetailsPage) {
    return null
  }

  const handleGoToMeeting = () => {
    router.push(`/clientDetails/${activeAppointment.client.id}`)
  }

  return (
    <div 
      className="fixed bottom-6 right-6 z-[9998]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-2xl transition-all duration-300 ${
        isHovered ? 'scale-105 shadow-3xl' : ''
      }`}>
        <div className="p-4 flex items-center space-x-3">
          {/* Pulsing indicator */}
          <div className="relative">
            <div className="w-4 h-4 bg-green-400 rounded-full"></div>
            <div className="absolute top-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
          </div>
          
          {/* Meeting info */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">Meeting Active</div>
            <div className="text-xs text-blue-200 truncate">
              with {clientDetails?.name || activeAppointment.client?.name}
            </div>
          </div>
          
          {/* Action button */}
          <button
            onClick={handleGoToMeeting}
            className="bg-green-500 hover:bg-green-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
          >
            <FaEye className="w-3 h-3" />
            <span>View</span>
          </button>
        </div>
        
        {/* Enhanced hover state */}
        {isHovered && (
          <div className="px-4 pb-3 border-t border-blue-500">
            <div className="text-xs text-blue-200 mt-2">
              Click "View" to return to the meeting layout
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FloatingMeetingIndicator
