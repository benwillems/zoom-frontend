
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useSearchClientsStore from '@/store/useSearchClientsStore'
import { CiSearch } from 'react-icons/ci'
import AddClientForm from '@/components/inputForms/clientForm'
import { FaPlus } from 'react-icons/fa'
import CircleSpinner from '@/components/common/CircleSpinner'
import useOrgStore from '@/store/useOrgStore'
import {
  FaArrowDownAZ,
  FaArrowDownLong,
  FaArrowUpAZ,
  FaArrowUpLong,
} from 'react-icons/fa6'
import ClientTable from '@/components/ui/Directory/ClientTable'
import useClientStore from '@/store/clientStore'

const Directory = () => {
  const {
    clients,
    searchQuery,
    setSearchQuery,
    selectedClientId,
    fetchClients,
    addClient,
    clientLoading,
  } = useSearchClientsStore()
  const { resetCheckIns } = useClientStore()
  const { details, fetchOrgDetails } = useOrgStore()
  const router = useRouter()
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc',
  })
  const [selectedClient, setSelectedClient] = useState(null);
  const [showProgramModalAfterAdd, setShowProgramModalAfterAdd] = useState(false);

  useEffect(() => {
    if (details === undefined || details === null) {
      fetchOrgDetails(router)
    }
  }, [])

  useEffect(() => {
    if (details) {
      fetchClients()
    }
  }, [selectedClientId, details])

  useEffect(() => {
    if (details) {
      setSearchQuery('')
    }
  }, [details])

  useEffect(() => {
    // resetCheckIns()
  }, [])

  const handleSearch = query => {
    setSearchQuery(query)
  }

  const filteredClients = clients?.filter(client =>
    client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddClient = async (clientData) => {
    const newClient = await addClient(clientData)
    setSelectedClient(newClient);
    setIsClientModalOpen(false)
    setShowProgramModalAfterAdd(true);
  }

  const openAddClientModal = () => {
    setIsClientModalOpen(true)
  }

  const handleSort = key => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }
  const tableActions = [
    {
      name: 'Alphabetical',
      onClick: () => handleSort('name'),
      icon:
        sortConfig.key === 'name' && sortConfig.direction === 'asc' ? (
          <FaArrowUpAZ className='size-5' />
        ) : (
          <FaArrowDownAZ className='size-5' />
        ),
      primary: false,
    },
    {
      name: 'Date Added',
      onClick: () => handleSort('createdAt'),
      icon:
        sortConfig.key === 'createdAt' && sortConfig.direction === 'asc' ? (
          <FaArrowUpLong className='size-4' />
        ) : (
          <FaArrowDownLong className='size-4' />
        ),
      primary: false,
    },
    {
      name: 'Last Appointments',
      onClick: () => handleSort('lastAppointmentDate'),
      icon:
        sortConfig.key === 'lastAppointmentDate' &&
        sortConfig.direction === 'asc' ? (
          <FaArrowUpLong className='size-4' />
        ) : (
          <FaArrowDownLong className='size-4' />
        ),
      primary: false,
    },
    {
      name: 'Progress',
      onClick: () => handleSort('programProgress'),
      icon:
        sortConfig.key === 'programProgress' &&
        sortConfig.direction === 'asc' ? (
          <FaArrowUpLong className='size-4' />
        ) : (
          <FaArrowDownLong className='size-4' />
        ),
      primary: false,
    },
    {
      name: 'Client',
      onClick: openAddClientModal,
      icon: <FaPlus />,
      primary: true,
    },
  ]

  return (
    <div className='px-2 sm:p-6 mt-7'>
      <div className='mb-6'>
        <h3 className='text-3xl font-bold text-gray-900'>Directory</h3>
        <p className='text-base text-gray-600'>
          Search clients using filters and add, remove and merge clients.
        </p>
      </div>
      <div className='flex justify-between items-center my-2 w-full flex-wrap gap-4'>
        <div className='flex items-center space-x-2 min-w-96 w-96 bg-white rounded-md border py-2 px-2'>
          <CiSearch className='text-lg md:text-2xl' />
          <input
            type='text'
            placeholder={'Search for a client...'}
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className='text-base placeholder:text-gray-500 outline-none w-full'
          />
        </div>
        <div className='flex justify-center items-center h-full select-none pt-5'>
          <div className='flex items-center space-x-4'>
            {tableActions.map((action, index) => (
              <div
                key={index}
                className={`flex justify-center items-center space-x-2 px-5 py-2 rounded-lg font-medium cursor-pointer ${
                  action.primary
                    ? 'bg-blue-300 hover:bg-blue-400 text-black'
                    : 'bg-white hover:bg-blue-50 text-black border hover:border-gray-800'
                }`}
                onClick={action.onClick}
              >
                {action.icon}
                <h1 className='text-xs sm:text-base lg:text-base'>
                  {action.name}
                </h1>
              </div>
            ))}
          </div>
        </div>
      </div>

      {clientLoading && (
        <div className='flex justify-center'>
          <CircleSpinner loading={clientLoading} />
        </div>
      )}

      {!clientLoading && !filteredClients?.length > 0 && (
        <div className='flex justify-center items-center h-[80vh] w-full'>
          <div>No clients were found</div>
        </div>
      )}

      {filteredClients?.length > 0 && !clientLoading && (
        <div className='overflow-x-auto mt-6'>
          <div className='min-w-full sm:min-w-0'>
            <ClientTable
              clients={filteredClients}
              sortConfig={sortConfig}
              isClientModalOpen={isClientModalOpen}
              showProgramModalAfterAdd={showProgramModalAfterAdd}
              setShowProgramModalAfterAdd={setShowProgramModalAfterAdd}
              currentAddClient={selectedClient}
            />
          </div>
        </div>
      )}

      {isClientModalOpen && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center'>
          <div className='bg-white p-6 rounded shadow-lg'>
            <AddClientForm
              onSubmit={handleAddClient}
              onCancel={() => setIsClientModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Directory

