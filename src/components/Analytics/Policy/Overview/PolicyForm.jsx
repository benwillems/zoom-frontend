import ButtonWithIcon from '@/components/common/ButtonWithIcon'
import InputWithLabel from '@/components/common/InputWithLabel'
import { ShieldCheck, PenSquare } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { fetchWithAuth } from '@/utils/generalUtils'
import { FaRegCheckCircle } from 'react-icons/fa'
import useNotificationStore from '@/store/useNotificationStore'

const PolicyForm = ({ policy, onSuccess }) => {
  const addNotification = useNotificationStore(state => state.addNotification)
  const isEditMode = !!policy

  const [formData, setFormData] = useState({
    name: '',
    goal: '',
  })

  useEffect(() => {
    if (policy) {
      setFormData({
        name: policy?.name || '',
        goal: policy?.criteria?.goal || '',
      })
    }
  }, [policy])

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      const url = isEditMode ? `/api/policy/${policy.id}` : '/api/policy'

      const response = await fetchWithAuth(url, {
        method: isEditMode ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          criteria: {
            goal: formData.goal,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} policy`)
      }

      addNotification({
        iconColor: 'green',
        header: `${formData.name} policy has been created!`,
        icon: FaRegCheckCircle,
        hideProgressBar: false,
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col space-y-4'>
      <InputWithLabel
        labelText='Name'
        required
        onChange={handleChange}
        value={formData.name}
        name='name'
      />

      <h2 className='text-lg font-bold'>Policy Criteria</h2>

      <InputWithLabel
        labelText='Goal'
        required
        onChange={handleChange}
        value={formData.goal}
        name='goal'
      />

      <ButtonWithIcon
        buttonText={isEditMode ? 'Update Policy' : 'Create Policy'}
        icon={isEditMode ? PenSquare : ShieldCheck}
        size='medium'
        type='submit'
      />
    </form>
  )
}

export default PolicyForm
