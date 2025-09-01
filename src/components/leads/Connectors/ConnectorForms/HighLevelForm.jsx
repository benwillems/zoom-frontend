import ButtonWithIcon from '@/components/common/ButtonWithIcon'
import InputWithLabel from '@/components/common/InputWithLabel'
import React, { useState } from 'react'
import { fetchWithAuth } from '@/utils/generalUtils'
import { FaRegCheckCircle } from 'react-icons/fa'
import useNotificationStore from '@/store/useNotificationStore'
import { FaConnectdevelop } from 'react-icons/fa6'
import useExternalConnectorStore from '@/store/useExternalConnectorStore'

const HighLevelForm = ({ onSuccess }) => {
  const addNotification = useNotificationStore(state => state.addNotification)
  const { setPipelinesFromConnector, setExternalConnector } =
    useExternalConnectorStore()
  const [loadingPipelines, setLoadingPipelines] = useState(false)

  const [formData, setFormData] = useState({
    locationId: '',
  })

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const fetchPipelines = async e => {
    e.preventDefault() // Prevent default form submission

    try {
      setLoadingPipelines(true)
      const response = await fetchWithAuth(
        `/leads/pipelines/${formData.locationId}`,
        // `https://backend-zoom-production.up.railway.app/leads/pipelines/${formData.locationId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch pipelines')
      }

      const data = await response.json()
      setPipelinesFromConnector(data.pipelines)
      setExternalConnector({
        name: 'HighLevel',
        locationId: formData.locationId,
      })
      if (data) onSuccess?.() // Call onSuccess if provided
    } catch (error) {
      console.error('Error fetching pipelines:', error)
      addNotification({
        iconColor: 'red',
        header: 'Failed to fetch pipelines',
        icon: FaRegCheckCircle,
      })
      throw error
    } finally {
      setLoadingPipelines(false)
    }
  }

  return (
    <form onSubmit={fetchPipelines} className='flex flex-col'>
      <div className='flex flex-col space-y-4'>
        <InputWithLabel
          labelText='Location Id'
          required
          onChange={handleChange}
          value={formData.locationId}
          name='locationId'
        />
      </div>

      <ButtonWithIcon
        buttonText={'Connect'}
        icon={FaConnectdevelop}
        size='medium'
        type='submit'
        className='mt-6'
        loading={loadingPipelines}
        disabled={loadingPipelines}
      />
    </form>
  )
}

export default HighLevelForm
