import useOrgStore from '@/store/useOrgStore'

const Tabs = ({ tabs }) => {
  const { details, isAdmin, activeTab, setActiveTab } = useOrgStore()
  let availableTabs

  // If the user has no organization details, only show the Organization tab.
  if (!details) {
    availableTabs = tabs?.filter(tab => tab?.name === 'Organization')
  } else {
    // If the user has organization details, show all tabs if they are an admin,
    // or filter out the 'Team' tab if they are not an admin.
    availableTabs = isAdmin ? tabs : tabs?.filter(tab => tab?.name !== 'Team')
  }

  const renderTabContent = () => {
    const activeTabContent = availableTabs?.find(tab => tab.name === activeTab)

    if (activeTabContent) {
      const Component = activeTabContent.component
      return <Component setActiveTab={setActiveTab} activeTab={activeTab} />
    }

    return null
  }

  return (
    <div className='mt-12 sm:mt-0 w-full overflow-x-auto'>
      <div className='flex justify-center sm:justify-start items-center whitespace-nowrap px-2 sm:px-6'>
        {availableTabs?.map((tab, index) => (
          <button
            key={index}
            className={`flex items-center p-2 sm:p-4 text-center text-3xl sm:font-bold sm:text-lg transition-colors duration-150 ${
              activeTab === tab.name
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab(tab?.name)}
            disabled={!isAdmin && tab?.name === 'Team'} // Disable the button if the user is not an admin and the tab is 'Team'
          >
            <div className='flex items-center'>
              {tab.icon} {/* Display the icon */}
              <span className='ml-2 hidden sm:block'>{tab?.name}</span>{' '}
              {/* Display the name only on larger screens */}
            </div>
          </button>
        ))}
      </div>
      <div className='mt-4'>{renderTabContent()}</div>
    </div>
  )
}

export default Tabs
