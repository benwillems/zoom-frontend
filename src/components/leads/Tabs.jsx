import React from 'react'

/**
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects with name, component, and icon
 * @param {string} props.activeTab - Name of the currently active tab
 * @param {Function} props.onTabChange - Callback function when tab changes
 * @param {string} [props.className] - Optional additional CSS classes
 * @param {boolean} [props.showIconsOnly] - Option to show only icons
 * @param {Array} [props.disabled] - Array of tab names to disable
 */
const Tabs = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  showIconsOnly = false,
  disabled = [],
}) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <div className='flex justify-start items-center whitespace-nowrap'>
        {tabs?.map((tab, index) => (
          <button
            key={index}
            className={`flex items-center p-2 sm:p-4 text-center text-3xl sm:font-bold sm:text-lg transition-colors duration-150 ${
              activeTab === tab.name
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => onTabChange(tab.name)}
            disabled={disabled.includes(tab.name)}
            role='tab'
            aria-selected={activeTab === tab.name}
            aria-controls={`panel-${tab.name}`}
          >
            <div className='flex items-center'>
              {tab.icon}
              {!showIconsOnly && (
                <span className='ml-2 hidden sm:block'>{tab.name}</span>
              )}
            </div>
          </button>
        ))}
      </div>
      <div className='mt-4' role='tabpanel' id={`panel-${activeTab}`}>
        {tabs.find(tab => tab.name === activeTab)?.component}
      </div>
    </div>
  )
}

export default Tabs
