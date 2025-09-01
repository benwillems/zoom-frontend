import CircleSpinner from '@/components/common/CircleSpinner'
import { fetchWithAuth } from '@/utils/generalUtils'
import React, { useEffect, useState } from 'react'
import { BiPhone } from 'react-icons/bi'
import { FaChevronRight } from 'react-icons/fa'
import fakePipelineData from './pipeline.json'
import fakeStageData from './stage.json'
import useExternalConnectorStore from '@/store/useExternalConnectorStore'
import { UserRoundX } from 'lucide-react'
import Modal from '@/components/common/Modal'
import StartCampaignForm from './StartCampaignForm'
import { MdCampaign } from 'react-icons/md'

// Sasquatch Strength AI Phone Agent Campaign - 1.25.2025 - 1.26.2025

const ITEMS_PER_PAGE = 20

const NavigationStep = ({ steps }) => {
  return (
    <div className='flex items-center space-x-2 mb-6 text-base pt-2'>
      {steps.map((step, index) => (
        <React.Fragment key={step.name}>
          <span
            className={`${
              step.active ? 'text-black font-semibold' : 'text-gray-600'
            } cursor-pointer`}
            onClick={step.onClick}
          >
            {step.label || step.name}
          </span>
          {index < steps.length - 1 && (
            <FaChevronRight className='text-gray-400 size-3' />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

const PipelineTable = ({ pipelines, onPipelineSelect }) => {
  return (
    <div className='border rounded-lg overflow-hidden bg-white'>
      <div className='h-[699px] overflow-auto'>
        <table className='w-full '>
          <thead className='bg-blue-300'>
            <tr>
              <th className='px-6 py-[18px] text-left text-sm font-semibold text-black'>
                Pipeline Name
              </th>
            </tr>
          </thead>
          <tbody>
            {pipelines.map((pipeline, index) => (
              <tr
                key={index}
                onClick={() => onPipelineSelect(pipeline)}
                className='cursor-pointer hover:bg-blue-100 border-b'
              >
                <td className='px-6 py-4'>{pipeline.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const StagesTable = ({ stages, onStageSelect }) => {
  return (
    <div className='border rounded-lg overflow-hidden bg-white'>
      <div className='h-[699px] overflow-auto'>
        <table className='w-full'>
          <thead className='bg-blue-300'>
            <tr>
              <th className='px-6 py-[18px] text-left text-sm font-semibold text-black'>
                Stage Name
              </th>
            </tr>
          </thead>
          <tbody>
            {stages.map(stage => (
              <tr
                key={stage.id}
                onClick={() => onStageSelect(stage)}
                className='cursor-pointer hover:bg-blue-100 border-b'
              >
                <td className='px-6 py-4'>{stage.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ContactsTable = ({
  contacts = [],
  onSelectionChange,
  loadingContacts,
  selectedContacts,
  selectedStage,
  fetchStageContacts,
  paginationMeta,
  parseNextPageUrl,
}) => {
  // Ensure contacts is always an array
  const contactsList = Array.isArray(contacts) ? contacts : []

  const toggleRow = id => {
    const selectedIds = new Set(selectedContacts.map(c => c.id))
    if (selectedIds.has(id)) {
      onSelectionChange(selectedContacts.filter(c => c.id !== id))
    } else {
      const contactToAdd = contactsList.find(c => c.id === id)
      onSelectionChange([...selectedContacts, contactToAdd])
    }
  }

  const toggleAllRows = () => {
    const displayedIds = new Set(contactsList.map(c => c.id))
    const otherSelectedContacts = selectedContacts.filter(
      c => !displayedIds.has(c.id)
    )

    if (contactsList.every(c => selectedContacts.some(sc => sc.id === c.id))) {
      onSelectionChange(otherSelectedContacts)
    } else {
      onSelectionChange([...otherSelectedContacts, ...contactsList])
    }
  }
  const isSelected = id => selectedContacts.some(c => c.id === id)
  const areAllDisplayedSelected = contactsList.every(c => isSelected(c.id))

  return (
    <div className='border rounded-lg overflow-hidden flex flex-col bg-white'>
      <div className='h-[635px] overflow-auto'>
        <table className='w-full'>
          <thead className='bg-blue-300 top-0 sticky z-10 select-none'>
            <tr>
              <th className='px-4 pt-4 w-12 pb-2.5'>
                <input
                  type='checkbox'
                  className='checkbox'
                  checked={areAllDisplayedSelected}
                  onChange={toggleAllRows}
                />
              </th>
              <th className='flex px-6 py-4 text-left text-sm font-semibold text-black'>
                Name
              </th>
              <th className='px-6 py-4 text-left text-sm font-semibold text-black'>
                Phone
              </th>
            </tr>
          </thead>
          <tbody>
            {loadingContacts ? (
              <tr>
                <td colSpan={3}>
                  <div className='flex items-center justify-center mt-6 text-lg space-x-2'>
                    <CircleSpinner loading={loadingContacts} />
                    <p>Loading Contacts...</p>
                  </div>
                </td>
              </tr>
            ) : contactsList.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <div className='flex flex-col items-center justify-center text-lg mt-6 text-gray-600 space-y-4'>
                    <UserRoundX className='size-8' />
                    <p>There are no contacts</p>
                  </div>
                </td>
              </tr>
            ) : (
              contactsList?.map(contact => (
                <tr key={contact?.id} className='border-b hover:bg-blue-100'>
                  <td className='px-4 pt-3 pb-2'>
                    <input
                      type='checkbox'
                      className='checkbox'
                      checked={isSelected(contact?.id)}
                      onChange={() => toggleRow(contact?.id)}
                    />
                  </td>
                  <td className='px-6 py-2'>{contact?.contact?.name}</td>
                  <td className='px-6 py-2'>{contact?.contact?.phone}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className='flex justify-between items-center px-6 py-4 bg-white'>
        <div className='text-sm text-gray-700'>
          {contacts.length > 0 &&
            `Showing ${contacts.length} of ${
              paginationMeta?.total || 0
            } results`}
        </div>
        <div className='join'>
          <button
            onClick={() =>
              fetchStageContacts(
                selectedStage.id,
                parseNextPageUrl(paginationMeta?.prevPage)
              )
            }
            disabled={!paginationMeta?.prevPage}
            className='join-item btn btn-sm'
          >
            «
          </button>
          <button className='join-item btn btn-sm'>
            Page {paginationMeta?.currentPage || 1}
          </button>
          <button
            onClick={() =>
              fetchStageContacts(
                selectedStage.id,
                parseNextPageUrl(paginationMeta?.nextPageUrl)
              )
            }
            disabled={!paginationMeta?.nextPageUrl}
            className='join-item btn btn-sm'
          >
            »
          </button>
        </div>
      </div>
    </div>
  )
}

const SasquatchStrPromotion = () => {
  const [paginationMeta, setPaginationMeta] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedPipeline, setSelectedPipeline] = useState(null)
  const [selectedStage, setSelectedStage] = useState(null)
  // Change the state name to better reflect its content
  const [selectedContacts, setSelectedContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const {
    externalConnector,
    pipelinesFromConnector,
    contactsFromStage,
    setContactsFromStage,
  } = useExternalConnectorStore()

  const parseNextPageUrl = url => {
    try {
      const urlObject = new URL(url)
      const params = new URLSearchParams(urlObject.search)

      return {
        startAfter: params.get('startAfter'),
        startAfterId: params.get('startAfterId'),
      }
    } catch (error) {
      console.error('Error parsing URL:', error)
      return null
    }
  }

  // Fetch contacts when pipeline/stage is selected
  useEffect(() => {
    if (selectedStage) {
      fetchStageContacts(selectedStage.id)
    }
  }, [selectedStage])

  const handlePipelineSelect = pipeline => {
    setSelectedPipeline(pipeline)
    setSelectedStage(null)
  }

  const handleStageSelect = stage => {
    setSelectedStage(stage)
    setSelectedContacts([])
    setPaginationMeta(null)
  }

  const handleBackToPipelines = () => {
    setSelectedPipeline(null)
    setSelectedStage(null)
    setPaginationMeta(null)
  }

  const handleBackToStages = () => {
    setSelectedStage(null)
    setPaginationMeta(null)
  }

  const fetchStageContacts = async (pipelineStageId, pageUrl) => {
    try {
      setLoadingContacts(true)
      let url = `/leads/pipeline/opportunities/${externalConnector.locationId}/${pipelineStageId}`
      if (pageUrl) {
        url += `/${pageUrl?.startAfter}/${pageUrl?.startAfterId}`
      }

      const response = await fetchWithAuth(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stage contacts')
      }

      const data = await response.json()
      setContactsFromStage(data.opportunities || [])
      setPaginationMeta(data.meta)
      return data
    } catch (error) {
      console.error('Error fetching stage contacts:', error)
      throw error
    } finally {
      setLoadingContacts(false)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
  }

  const navigationSteps = selectedStage
    ? [
        {
          name: selectedPipeline?.name || 'Pipeline',
          onClick: handleBackToPipelines,
          active: false,
        },
        {
          name: selectedStage.name,
          onClick: handleBackToStages,
          active: false,
        },
        {
          name: 'Contacts',
          active: true,
        },
      ]
    : selectedPipeline
    ? [
        {
          name: selectedPipeline?.name,
          onClick: handleBackToPipelines,
          active: false,
        },
        {
          name: 'Stage',
          active: true,
        },
      ]
    : [
        {
          name: 'Pipeline',
          active: true,
        },
      ]

  return (
    <div className='w-full'>
      <div className='flex justify-between pl-1 items-center'>
        <NavigationStep steps={navigationSteps} />
        {selectedStage && (
          <div className='flex space-x-4 mb-3'>
            <button
              className='bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium text-base transition-colors duration-200 disabled:opacity-50'
              onClick={() => setSelectedContacts([])}
              disabled={selectedContacts.length === 0}
            >
              Clear Selection ({selectedContacts.length})
            </button>
            <button
              className='bg-blue-300 hover:bg-blue-400 text-black px-4 py-2 rounded-lg flex items-center space-x-2 font-medium text-base transition-colors duration-200 disabled:text-white disabled:bg-gray-800 disabled:hover:bg-gray-900 disabled:cursor-not-allowed'
              disabled={selectedContacts.length === 0}
              onClick={() => setShowModal(true)}
            >
              <BiPhone className='size-5' />
              <span>Start Campaign</span>
            </button>
          </div>
        )}
      </div>

      {selectedStage ? (
        <ContactsTable
          contacts={contactsFromStage || []}
          onSelectionChange={setSelectedContacts}
          loadingContacts={loadingContacts}
          selectedContacts={selectedContacts}
          selectedStage={selectedStage}
          fetchStageContacts={fetchStageContacts}
          paginationMeta={paginationMeta}
          parseNextPageUrl={parseNextPageUrl}
        />
      ) : selectedPipeline ? (
        <StagesTable
          stages={selectedPipeline.stages}
          onStageSelect={handleStageSelect}
        />
      ) : (
        <PipelineTable
          pipelines={pipelinesFromConnector}
          onPipelineSelect={handlePipelineSelect}
        />
      )}

      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        icon={MdCampaign}
        title={`Start your Campaign`}
        size='medium'
      >
        <StartCampaignForm
          onSuccess={() => setShowModal(false)}
          opportunities={selectedContacts}
          pipelineId={selectedPipeline?.id}
          pipelineStageId={selectedStage?.id}
        />
      </Modal>
    </div>
  )
}

export default SasquatchStrPromotion
