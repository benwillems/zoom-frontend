import React, { useState, useEffect } from 'react'
import useAudioStore from '@/store/useAudioStore'
import useClientStore from '@/store/clientStore'
import ClientDetailsHeader from '../ClientDetailsHeader'
import MeetingTalkingPoints from './MeetingTalkingPoints'
import OverviewTab from '../Tabs/Overview/OverviewTab'
import { FaBars, FaTimes, FaExpand, FaCompress } from 'react-icons/fa'
import MeetingClientDetailsWrapper from './MeetingClientDetailsWrapper'

const MeetingClientLayout = () => {
  const { isMeetingActive, setIsMeetingClientLayoutActive } = useAudioStore()
  const { clientDetails } = useClientStore()

  // mobile: which pane is showing & whether to show the sidebar overlay
  const [activePartition, setActivePartition] = useState('sidebar')
  const [showSidebar, setShowSidebar] = useState(false)

  // start expanded by default:
  const [isClientDetailsExpanded, setIsClientDetailsExpanded] = useState(true)
  const [clientDetailsWidth, setClientDetailsWidth] = useState(null)
  const clientDetailsRef = React.useRef(null)

  // always measure the sidebar width on mount + on resize
  React.useEffect(() => {
    if (!clientDetailsRef.current) return

    // capture initial width
    setClientDetailsWidth(clientDetailsRef.current.getBoundingClientRect().width)

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setClientDetailsWidth(entry.contentRect.width)
      }
    })
    resizeObserver.observe(clientDetailsRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    if (isMeetingActive && clientDetails) {
      setIsMeetingClientLayoutActive(true)
    }
    return () => {
      setIsMeetingClientLayoutActive(false)
    }
  }, [isMeetingActive, clientDetails, setIsMeetingClientLayoutActive])

  if (!isMeetingActive || !clientDetails) {
    return null
  }

  const partitions = [
    { id: 'sidebar', label: 'Client Details', icon: '👤' },
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'talking', label: 'Talking Points', icon: '📝' }
  ]

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Mobile Navigation */}
      <div className="lg:hidden bg-blue-600 text-white p-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-blue-700 rounded"
          >
            {showSidebar ? <FaTimes /> : <FaBars />}
          </button>
          <h1 className="font-semibold">Meeting: {clientDetails?.name}</h1>
        </div>
        <div className="flex space-x-1">
          {partitions.map(partition => (
            <button
              key={partition.id}
              onClick={() => setActivePartition(partition.id)}
              className={`px-3 py-1 rounded text-xs ${
                activePartition === partition.id 
                  ? 'bg-white text-blue-600' 
                  : 'bg-blue-500 hover:bg-blue-400'
              }`}
            >
              {partition.icon} {partition.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 bg-gray-50 overflow-hidden ml-[1px]">
        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div className="lg:hidden fixed inset-0  bg-black bg-opacity-50" onClick={() => setShowSidebar(false)}>
            <div className="w-80 h-full bg-gray-100 shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
                <h2 className="font-semibold">Client Details</h2>
                <button onClick={() => setShowSidebar(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="overflow-y-auto h-full">
                <ClientDetailsHeader />
              </div>
            </div>
          </div>
        )}

        {/* Desktop Layout - Three Partitions */}
        <div className="hidden lg:flex w-full h-full">
          {/* First Partition - Sidebar */}
          <div
            ref={clientDetailsRef}
            className={`
              ${isClientDetailsExpanded
                ? 'absolute top-0 bottom-0 left-0 h-screen z-10'
                : 'relative h-full'
              }
              ${isClientDetailsExpanded ? 'w-96' : 'w-96'}
              bg-gray-100 border-r-2 border-blue-200 shadow-lg flex flex-col transition-all duration-300
              overflow-x-hidden overflow-y-auto
            `}
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 border-b flex-shrink-0 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold truncate">Client Details</h2>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
                  <span className="text-sm truncate">Meeting Active</span>
                </div>
              </div>
              {/* <button
                onClick={() => setIsClientDetailsExpanded(!isClientDetailsExpanded)}
                className="p-1.5 hover:bg-blue-500 rounded-full transition-colors flex-shrink-0 ml-2"
                title={isClientDetailsExpanded ? "Minimize" : "Expand"}
              >
                {isClientDetailsExpanded ? <FaCompress className="text-white text-sm" /> : <FaExpand className="text-white text-sm" />}
              </button> */}
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <MeetingClientDetailsWrapper />
            </div>
          </div>

          {/* Second Partition – Overview */}
          <div 
            className="bg-white border-r-2 border-blue-200 shadow-lg flex flex-col h-full min-w-0"
            style={{ 
              marginLeft: isClientDetailsExpanded ? '384px' : '0',
              width: isClientDetailsExpanded ? 'calc(100% - 790px)' : 'calc(100% - 704px)'
            }}
          >
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-2 border-b shadow-sm">
              <h2 className="text-lg font-semibold flex items-center">
                <span className="w-3 h-3 bg-white rounded-full mr-2"></span>
                Program Overview
              </h2>
              <p className="text-sm opacity-90">Client progress and program details</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <OverviewTab />
            </div>
          </div>

          {/* Third Partition - Talking Points */}
          <div 
            className="w-80 bg-white shadow-lg flex flex-col h-full flex-shrink-0"
          >
            <div className="flex-1 overflow-hidden">
              <MeetingTalkingPoints 
                clientDetails={clientDetails} 
                initiallyExpanded={true}
                isClientDetailsExpanded={isClientDetailsExpanded}
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout with height constraints */}
        <div className="lg:hidden w-full h-full max-h-screen overflow-hidden">
          {activePartition === 'sidebar' && (
            <div className="h-full overflow-y-auto bg-gray-100">
              <ClientDetailsHeader />
            </div>
          )}

          {activePartition === 'overview' && (
            <div className="h-full overflow-y-auto">
              <OverviewTab />
            </div>
          )}

          {activePartition === 'talking' && (
            <div className="h-full">
              <MeetingTalkingPoints clientDetails={clientDetails} initiallyExpanded={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MeetingClientLayout