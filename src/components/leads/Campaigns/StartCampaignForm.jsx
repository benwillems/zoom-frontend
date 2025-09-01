import ButtonWithIcon from '@/components/common/ButtonWithIcon'
import InputWithLabel from '@/components/common/InputWithLabel'
import React, { useState } from 'react'
import { fetchWithAuth } from '@/utils/generalUtils'
import { FaRegCheckCircle } from 'react-icons/fa'
import useNotificationStore from '@/store/useNotificationStore'
import { MdCampaign } from 'react-icons/md'
import useExternalConnectorStore from '@/store/useExternalConnectorStore'

const StartCampaignForm = ({
  onSuccess,
  opportunities,
  pipelineId,
  pipelineStageId,
}) => {
  const addNotification = useNotificationStore(state => state.addNotification)
  const [isLoadingStartingCampaign, setIsLoadingStartingCampaign] =
    useState(false)
  const [formData, setFormData] = useState({
    nameOfCampaign: '',
    calendarId: '',
  })
  const { externalConnector } = useExternalConnectorStore()

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const startCampaign = async e => {
    e.preventDefault()
    try {
      setIsLoadingStartingCampaign(true)
      const response = await fetchWithAuth('/leads/campaign/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.nameOfCampaign,
          opportunities: opportunities,
          pipelineId: pipelineId,
          pipelineStageId: pipelineStageId,
          calendarId: formData.calendarId,
          locationId: externalConnector.locationId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to initiate call')
      }

      addNotification({
        iconColor: 'green',
        header: 'Campaign has started!',
        icon: FaRegCheckCircle,
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error initiating call:', error)
      throw error
    } finally {
      setIsLoadingStartingCampaign(false)
    }
  }

  return (
    <form onSubmit={startCampaign} className='flex flex-col'>
      <div className='flex flex-col space-y-4'>
        <InputWithLabel
          labelText='Name of Campaign'
          required
          onChange={handleChange}
          value={formData.nameOfCampaign}
          name='nameOfCampaign'
        />

        <InputWithLabel
          labelText='Calendar Id'
          required
          onChange={handleChange}
          value={formData.calendarId}
          name='calendarId'
        />
      </div>

      <ButtonWithIcon
        buttonText='Start Campaign'
        loadingText='Starting the Campaign...'
        icon={MdCampaign}
        size='medium'
        type='submit'
        className='mt-6'
        loading={isLoadingStartingCampaign}
        disabled={isLoadingStartingCampaign}
      />
    </form>
  )
}

export default StartCampaignForm
