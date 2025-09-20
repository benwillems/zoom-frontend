import React, { useState, useEffect, useRef } from 'react'
import { FaCheckSquare, FaExpand, FaCompress, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaComments } from 'react-icons/fa'
import { MdCheck, MdRadioButtonUnchecked } from 'react-icons/md'
import { BiRefresh, BiX } from 'react-icons/bi'
import useAudioStore from '@/store/useAudioStore'
import TalkingPointTemplateSelect from '@/components/ui/common/TalkingPointTemplateSelect'

const MeetingTalkingPoints = ({ clientDetails, initiallyExpanded = false, isClientDetailsExpanded = false }) => {
  const { activeAppointment, viewLayout } = useAudioStore()
  const containerRef = useRef(null)
  
  const [talkingPointsData, setTalkingPointsData] = useState({})
  const [loading, setLoading] = useState(false)
  const [checkedPoints, setCheckedPoints] = useState(new Set())
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded) // Set initial state from prop
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [componentWidth, setComponentWidth] = useState(null)
  const [initialRender, setInitialRender] = useState(true)
  const [collapsedCategories, setCollapsedCategories] = useState({})
  const [selectedTemplateId, setSelectedTemplateId] = useState(null)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  
  // Helper function to recursively parse any nested structure
  const parseNestedData = (data, path = '') => {
    if (!data || typeof data !== 'object') return null
    
    const result = {}
    
    Object.keys(data).forEach(key => {
      const value = data[key]
      const currentPath = path ? `${path}.${key}` : key
      
      if (Array.isArray(value)) {
        // Handle arrays of strings/objects
        const filteredItems = value.filter(item => item && (typeof item === 'string' ? item.trim() : true))
        if (filteredItems.length > 0) {
          result[key] = {
            type: 'array',
            items: filteredItems,
            path: currentPath
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively parse nested objects
        const nested = parseNestedData(value, currentPath)
        if (nested && Object.keys(nested).length > 0) {
          result[key] = {
            type: 'nested',
            data: nested,
            path: currentPath
          }
        }
      } else if (typeof value === 'string' && value.trim()) {
        // Handle standalone strings
        result[key] = {
          type: 'string',
          content: value.trim(),
          path: currentPath
        }
      }
    })
    
    return result
  }

  // Helper function to get displayable content from any structure
  const getDisplayableItems = (categoryData) => {
    if (!categoryData) return []
    
    const items = []
    
    if (categoryData.type === 'array') {
      return categoryData.items.map((item, index) => ({
        id: `${categoryData.path}-${index}`,
        content: typeof item === 'string' ? item : JSON.stringify(item),
        type: 'point'
      }))
    }
    
    if (categoryData.type === 'string') {
      return [{
        id: categoryData.path,
        content: categoryData.content,
        type: 'info'
      }]
    }
    
    if (categoryData.type === 'nested' && categoryData.data) {
      const processNestedData = (nestedData, parentPath = '') => {
        Object.keys(nestedData).forEach(key => {
          const value = nestedData[key]
          const fullPath = parentPath ? `${parentPath}-${key}` : key
          
          if (value.type === 'array') {
            value.items.forEach((item, index) => {
              items.push({
                id: `${categoryData.path}-${fullPath}-${index}`,
                content: typeof item === 'string' ? item : JSON.stringify(item),
                type: 'point',
                subCategory: key
              })
            })
          } else if (value.type === 'string') {
            items.push({
              id: `${categoryData.path}-${fullPath}`,
              content: value.content,
              type: 'info',
              subCategory: key
            })
          } else if (value.type === 'nested') {
            processNestedData(value.data, fullPath)
          }
        })
      }
      
      processNestedData(categoryData.data)
    }
    
    return items
  }

  // 1) a single “humanize” helper (no more lookup tables)
  const humanize = (s = '') =>
    s
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_\-.]+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase())

  // 2) a fully‐generic recursive renderer
  const RenderNode = ({ data, path = '' }) => {
    if (data == null) return null

    // leaf strings & numbers → talking-point blocks
    if (typeof data === 'string' || typeof data === 'number') {
      const id = path
      const isChecked = checkedPoints.has(id)
      return (
        <div
          key={id}
          className={`flex items-start p-4 rounded-lg transition-all border cursor-pointer ${
            isChecked
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-50 hover:bg-blue-50 border-gray-200'
          }`}
          onClick={() => toggleCheck(id)}
        >
          <div className="flex-shrink-0 mt-1 mr-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isChecked ? 'bg-green-500' : 'border-2 border-gray-300 hover:border-blue-400'
              }`}
            >
              {isChecked && <MdCheck className="text-white text-base" />}
            </div>
          </div>
          <div className="flex-1">
            <p className={`text-sm leading-relaxed ${isChecked ? 'text-gray-500' : 'text-gray-700'}`}>
              {data}
            </p>
            {isChecked && (
              <span className="text-xs text-green-600 font-medium mt-2 flex items-center">
                <MdCheck className="mr-1" /> Discussed
              </span>
            )}
          </div>
        </div>
      )
    }

    // arrays → bullet lists
    if (Array.isArray(data)) {
      return (
        <ul className="list-disc ml-6 space-y-2">
          {data.map((item, idx) => (
            <li key={`${path}-${idx}`}>
              <RenderNode data={item} path={`${path}-${idx}`} />
            </li>
          ))}
        </ul>
      )
    }

    // objects → header + recurse
    if (typeof data === 'object') {
      return (
        <div className="space-y-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-2">
                {humanize(key)}
              </h4>
              <RenderNode data={value} path={path ? `${path}.${key}` : key} />
            </div>
          ))}
        </div>
      )
    }

    return null
  }

  // Effects for layout management
  useEffect(() => {
    if (containerRef.current && initialRender) {
      setComponentWidth(containerRef.current.offsetWidth)
      setInitialRender(false)
      // Set expanded state immediately if initiallyExpanded is true
      if (initiallyExpanded) {
        setIsExpanded(true)
      }
    }
  }, [containerRef.current, initialRender, initiallyExpanded])

  useEffect(() => {
    setIsExpanded(initiallyExpanded)
  }, [initiallyExpanded])

  useEffect(() => {
    if (!isExpanded && containerRef.current) {
      const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
          setComponentWidth(entry.contentRect.width)
        }
      })
      observer.observe(containerRef.current)
      return () => observer.disconnect()
    }
  }, [isExpanded])

  useEffect(() => {
    if (activeAppointment?.id) {
      fetchTalkingPoints()
    }
  }, [activeAppointment?.id])

  const fetchTalkingPoints = async () => {
    if (!activeAppointment?.id) return
    
    setLoading(true)
    setError(null)
    setRetryCount(0)
    
    let timeoutId
    let isCancelled = false
    const controller = new AbortController()
    const MAX_RETRIES = 10
    const RETRY_DELAY = 2000

    const pollTalkingPoints = async (attempt = 0) => {
      if (isCancelled) return
      
      try {
        const payload = { 
          appointmentId: activeAppointment.id,
          ...(selectedTemplateId && { templateId: selectedTemplateId })
        }
        const response = await fetch(`/api/talkingPoints/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        if (isCancelled) return

        // Handle nested talkingPoints structure
        let talkingPointsData = data.talkingPoints || data
        
        // If there's a nested talkingPoints object, extract it
        while (talkingPointsData && talkingPointsData.talkingPoints) {
          talkingPointsData = talkingPointsData.talkingPoints
        }
        
        // Parse the response dynamically
        const parsedData = parseNestedData(talkingPointsData)
        
        // Check if we have any content
        const hasContent = parsedData && Object.keys(parsedData).some(key => {
          const items = getDisplayableItems(parsedData[key])
          return items.length > 0
        })

        if (hasContent) {
          setTalkingPointsData(parsedData)
          setLoading(false)
          setError(null)
          setRetryCount(0)
        } else if (attempt < MAX_RETRIES) {
          setRetryCount(attempt + 1)
          timeoutId = setTimeout(() => pollTalkingPoints(attempt + 1), RETRY_DELAY)
        } else {
          setLoading(false)
          setError('Talking points are still being generated. Please try again in a few moments.')
        }
      } catch (error) {
        if (error.name === 'AbortError') return
        
        console.error('Failed to fetch talking points:', error)
        
        if (attempt < MAX_RETRIES) {
          setRetryCount(attempt + 1)
          timeoutId = setTimeout(() => pollTalkingPoints(attempt + 1), RETRY_DELAY)
        } else {
          setLoading(false)
          setError(`Failed to load talking points: ${error.message}`)
        }
      }
    }

    pollTalkingPoints()

    return () => {
      isCancelled = true
      controller.abort()
      clearTimeout(timeoutId)
    }
  }

  const toggleCheck = (pointId) => {
    const newChecked = new Set(checkedPoints)
    if (newChecked.has(pointId)) {
      newChecked.delete(pointId)
    } else {
      newChecked.add(pointId)
    }
    setCheckedPoints(newChecked)
  }

  const toggleCategoryCollapse = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const toggleExpand = () => {
    if (!isExpanded && containerRef.current && !componentWidth) {
      setComponentWidth(containerRef.current.offsetWidth)
    }
    setIsExpanded(!isExpanded)
  }
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Calculate totals dynamically
  const totalPoints = Object.keys(talkingPointsData).reduce((acc, category) => {
    const items = getDisplayableItems(talkingPointsData[category])
    return acc + items.filter(item => item.type === 'point').length
  }, 0)
  
  const totalCheckedPoints = checkedPoints.size

  // Get category progress
  const getCategoryProgress = (category, categoryData) => {
    const items = getDisplayableItems(categoryData)
    const points = items.filter(item => item.type === 'point')
    const checkedPointsCount = points.filter(point => checkedPoints.has(point.id)).length
    
    return { checked: checkedPointsCount, total: points.length }
  }

  // Render items with subcategory grouping
  const renderCategoryItems = (categoryData) => {
    const items = getDisplayableItems(categoryData)
    
    // Group items by subcategory
    const groupedItems = items.reduce((acc, item) => {
      const key = item.subCategory || 'main'
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})

    return Object.keys(groupedItems).map(subCategory => {
      const subItems = groupedItems[subCategory]
      const showSubheader = subCategory !== 'main' && Object.keys(groupedItems).length > 1

      return (
        <div key={subCategory} className="mb-4">
          {showSubheader && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                {formatSubCategoryName(subCategory)}
              </h4>
            </div>
          )}
          
          <div className="space-y-3">
            {subItems.map((item) => {
              if (item.type === 'info') {
                return (
                  <div key={item.id} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1 mr-3">
                        <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-amber-600 text-sm">ℹ️</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-amber-800 mb-1">
                          {item.subCategory ? formatSubCategoryName(item.subCategory) : 'Information'}
                        </h5>
                        <p className="text-sm text-amber-700 leading-relaxed">{item.content}</p>
                      </div>
                    </div>
                  </div>
                )
              }

              const isChecked = checkedPoints.has(item.id)
              
              return (
                <div 
                  key={item.id} 
                  className={`flex items-start p-4 rounded-lg transition-all border cursor-pointer ${
                    isChecked 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 hover:bg-blue-50 border-gray-200'
                  }`}
                  onClick={() => toggleCheck(item.id)}
                >
                  <div className="flex-shrink-0 mt-1 mr-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isChecked 
                        ? 'bg-green-500' 
                        : 'border-2 border-gray-300 hover:border-blue-400'
                    }`}>
                      {isChecked && <MdCheck className="text-white text-base" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm leading-relaxed ${
                      isChecked ? 'text-gray-500' : 'text-gray-700'
                    }`}>
                      {item.content}
                    </p>
                    {isChecked && (
                      <span className="text-xs text-green-600 font-medium mt-2 flex items-center">
                        <MdCheck className="mr-1" /> Discussed
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    })
  }

  const getContainerStyles = () => {
    const baseStyles = `bg-gradient-to-br from-blue-50 to-indigo-50 
                       transition-all duration-300 border shadow-lg rounded-lg overflow-hidden flex flex-col`
    
    if (isExpanded) {
      // Use fixed positioning with proper calculations to avoid overlap
      // Calculate left position based on whether client details is expanded
      const leftPosition = isClientDetailsExpanded ? '864px' : '500px' // Adjust based on first partition width
      
      return `fixed top-0 bottom-0 right-4 z-50 w-[403px] ${baseStyles}`
    }
    
    if (isCollapsed) {
      return `relative z-40 w-[50px] h-[50px] ${baseStyles}`
    }
    
    return `h-full flex flex-col ${baseStyles}`
  }

  // Alias old formatting names to our new humanize
  const formatCategoryName    = humanize
  const formatSubCategoryName = humanize

  return (
    <div 
      ref={containerRef}
      className={getContainerStyles()}
      style={!isExpanded && componentWidth ? { width: componentWidth } : {}}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-b shadow-sm flex-shrink-0">
        <div className="p-3">        
          <div className="flex items-center justify-between">
            <div className={`flex-1 min-w-0 flex items-center ${isCollapsed ? 'hidden' : ''}`}>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold truncate">💬 Talking Points Test</h2>
                  {selectedTemplateId && (
                    <span className="px-2 py-1 bg-blue-500 bg-opacity-30 rounded-full text-xs font-medium">
                      Custom Template
                    </span>
                  )}
                </div>
                <p className="text-sm opacity-90 truncate">{clientDetails?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isCollapsed && (
                <>
                  <button
                    onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                    className="p-2 hover:bg-blue-500 rounded-full transition-colors"
                    title="Template selector"
                  >
                    <FaComments className="text-white text-sm" />
                  </button>
                  <button
                    onClick={fetchTalkingPoints}
                    disabled={loading}
                    className="p-2 hover:bg-blue-500 rounded-full transition-colors"
                    title="Refresh"
                  >
                    <BiRefresh className={`text-white text-lg ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Template Selector */}
        {!isCollapsed && showTemplateSelector && (
          <div className="px-3 pb-3 bg-blue-600 border-t border-blue-500">
            <TalkingPointTemplateSelect
              selectedTemplateId={selectedTemplateId}
              onTemplateChange={(templateId) => {
                setSelectedTemplateId(templateId);
                // Optionally auto-refresh talking points when template changes
                fetchTalkingPoints();
              }}
              className="mt-2"
            />
          </div>
        )}
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 
                        scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 
                        hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full
                        [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-blue-100 
                        [&::-webkit-scrollbar-thumb]:bg-blue-400 [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb:hover]:bg-blue-500 [&::-webkit-scrollbar-track]:rounded-full">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-base text-gray-600">
                {retryCount > 0 
                  ? `Generating... (${retryCount}/10)`
                  : 'Loading talking points...'
                }
              </p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <p className="text-red-600 font-medium text-base mb-4">Error Loading</p>
              <p className="text-gray-600 text-sm mb-6">{error}</p>
              <button
                onClick={fetchTalkingPoints}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : Object.keys(talkingPointsData).length > 0 ? (
            <>
              {/* Progress Summary */}
              <div className="bg-blue-100 rounded-lg p-4 border border-gray-200 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-700 rounded-full mr-3"></div>
                    <span className="text-base font-medium text-gray-700">Session Progress</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">
                      {totalCheckedPoints}/{totalPoints} discussed
                    </span>
                    <div className="w-16 h-2 bg-gray-300 rounded-full">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${totalPoints > 0 ? (totalCheckedPoints / totalPoints) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* All Categories in Vertical Layout */}
              <div className="space-y-4">
                {Object.keys(talkingPointsData).map((category) => {
                  const progress = getCategoryProgress(category, talkingPointsData[category])
                  const isCollapsed = collapsedCategories[category]
                  
                  // Only show categories that have content
                  if (progress.total === 0) return null
                  
                  return (
                    <div key={category} className="bg-white rounded-lg shadow-md border border-gray-100">
                      <div 
                        className="p-4 border-b border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleCategoryCollapse(category)}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-800 flex items-center">
                            <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                            {formatCategoryName(category)}
                          </h3>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500">
                              {progress.checked}/{progress.total}
                            </span>
                            <div className="w-12 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${progress.total > 0 ? (progress.checked / progress.total) * 100 : 0}%` }}
                              />
                            </div>
                            {isCollapsed ? (
                              <FaChevronDown className="text-gray-400 text-sm" />
                            ) : (
                              <FaChevronUp className="text-gray-400 text-sm" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {!isCollapsed && (
                        <div className="p-4">
                          {renderCategoryItems(talkingPointsData[category])}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-5xl mb-4">📝</div>
              <p className="text-gray-500 font-medium text-base">No talking points yet</p>
              <p className="text-gray-400 text-sm mt-2 mb-6">Generate AI-powered discussion points</p>
              <button
                onClick={fetchTalkingPoints}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Generate Points
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MeetingTalkingPoints



