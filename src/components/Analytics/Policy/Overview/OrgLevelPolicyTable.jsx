import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  ArrowUpRight,
  CircleX,
  Pencil,
  Plus,
  ShieldEllipsis,
} from 'lucide-react'
import ButtonWithIcon from '@/components/common/ButtonWithIcon'
import Modal from '@/components/common/Modal'
import PolicyForm from './PolicyForm'
import { fetchWithAuth } from '@/utils/generalUtils'
import CircleSpinner from '@/components/common/CircleSpinner'
import Switch from 'react-switch'
import Alert from '@/components/ui/common/Alert'
import { MdWarning } from 'react-icons/md'
import useNotificationStore from '@/store/useNotificationStore'
import { FaRegCheckCircle } from 'react-icons/fa'

// Sample data structure for the Creatine policy
const creatineData = {
  id: 'creatine-001',
  policyName: 'Creatine Supplement Push',
  mentionRate: 78, // percentage
  conversionRate: 42, // percentage
  revenueGenerated: 15780, // dollars
  potentialRevenueLoss: 8420, // dollars
  details: {
    nutritionists: {
      'Corey Wilbert': {
        effectiveEntryPoints: [
          { context: 'Goal Discussion', effectiveness: 92 },
          { context: 'Supplement Review', effectiveness: 85 },
          { context: 'Diet Analysis', effectiveness: 82 },
          { context: 'Exercise Plan', effectiveness: 75 },
        ],
        clientResponses: {
          positive: [
            { phrase: 'Interest in Muscle Gain', count: 145, conversions: 89 },
            { phrase: 'Good Experience', count: 95, conversions: 72 },
            { phrase: 'Trust in Nutritionist', count: 78, conversions: 65 },
          ],
          negative: [
            { phrase: 'Cost Concerns', count: 68 },
            { phrase: 'Safety Concerns', count: 58 },
            { phrase: 'Bad Experience', count: 42 },
          ],
        },
      },
      'Alice Denise': {
        effectiveEntryPoints: [
          { context: 'Goal Discussion', effectiveness: 88 },
          { context: 'Supplement Review', effectiveness: 82 },
          { context: 'Diet Analysis', effectiveness: 79 },
          { context: 'Exercise Plan', effectiveness: 72 },
        ],
        clientResponses: {
          positive: [
            { phrase: 'Interest in Muscle Gain', count: 132, conversions: 82 },
            { phrase: 'Good Experience', count: 88, conversions: 65 },
            { phrase: 'Trust in Nutritionist', count: 72, conversions: 58 },
          ],
          negative: [
            { phrase: 'Cost Concerns', count: 72 },
            { phrase: 'Safety Concerns', count: 62 },
            { phrase: 'Bad Experience', count: 38 },
          ],
        },
      },
    },
  },
}

const OrgLevelPolicyTable = () => {
  const addNotification = useNotificationStore(state => state.addNotification)
  const router = useRouter()
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc',
  })
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [policies, setPolicies] = useState([])
  // Add this block for testing UI with mock data
  useEffect(() => {
    setPolicies([
      {
        id: 'demo-001',
        name: 'Demo Policy',
        criteria: { goal: 'Achieve 80% client satisfaction' },
        active: true,
      },
      {
        id: 'demo-002',
        name: 'Retention Policy',
        criteria: { goal: 'Maintain 90% client retention rate' },
        active: false,
      },
    ])
    setIsLoadingPolicies(false)
  }, [])
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [modalMode, setModalMode] = useState('create')
  const [loadingPolicies, setIsLoadingPolicies] = useState(true)
  const [showDeletePolicyAlert, setShowDeletePolicyAlert] = useState(false)
  const [policyToDelete, setPolicyToDelete] = useState(null)

  const fetchPolicies = async () => {
    setIsLoadingPolicies(true)
    try {
      const response = await fetchWithAuth('/api/policies', {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch policies')
      }

      const data = await response.json()
      setPolicies(data?.policies)
    } catch (error) {
      console.error('Error fetching policies:', error)
    } finally {
      setIsLoadingPolicies(false)
    }
  }

  useEffect(() => {
    fetchPolicies()
  }, [])

  const handleSort = key => {
    let direction = 'asc'

    // When switching to a new column, reset direction
    // Unless it's the active column, which should start with desc to show active first
    if (key !== sortConfig.key) {
      direction = key === 'active' ? 'desc' : 'asc'
    } else {
      // If clicking the same column, toggle direction
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc'
    }

    setSortConfig({ key, direction })
  }

  const handleEditClick = policy => {
    setSelectedPolicy(policy)
    setModalMode('edit')
    setIsPolicyModalOpen(true)
  }

  const handleModalClose = () => {
    setIsPolicyModalOpen(false)
    setSelectedPolicy(null)
    setModalMode('create')
  }

  const handleFormSuccess = () => {
    handleModalClose()
    // Refresh the policies list
    fetchPolicies()
  }

  const sortedPolicies = useMemo(() => {
    return [...policies].sort((a, b) => {
      // When sorting by active column, respect the sort direction
      if (sortConfig.key === 'active') {
        const order = sortConfig.direction === 'asc' ? 1 : -1
        return a.active === b.active ? 0 : a.active ? -order : order
      }

      // For all other sorts, inactive policies go to the bottom
      if (a.active !== b.active) {
        return a.active ? -1 : 1
      }

      // Then apply the selected sort within each active/inactive group
      if (sortConfig.key === 'name') {
        const order = sortConfig.direction === 'asc' ? 1 : -1
        return order * a.name.localeCompare(b.name)
      }

      // Default sorting for other fields
      const order = sortConfig.direction === 'asc' ? 1 : -1
      return a[sortConfig.key] < b[sortConfig.key] ? -order : order
    })
  }, [policies, sortConfig])

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = value => {
    return `${value}%`
  }

  const handleTogglePolicy = async policyToToggle => {
    try {
      // Optimistically update the UI
      setPolicies(currentPolicies =>
        currentPolicies.map(policy =>
          policy.id === policyToToggle.id
            ? { ...policy, active: !policy.active }
            : policy
        )
      )

      // Make API call in the background
      const response = await fetchWithAuth(
        `/api/policy/${policyToToggle.id}/toggle`,
        {
          method: 'POST',
        }
      )

      if (!response.ok) {
        // If the API call fails, revert the optimistic update
        setPolicies(currentPolicies =>
          currentPolicies.map(policy =>
            policy.id === policyToToggle.id
              ? { ...policy, active: !policy.active }
              : policy
          )
        )
        throw new Error('Failed to toggle policy')
      }

      // Determine the new status based on the opposite of current status
      const isBeingEnabled = !policyToToggle.active
      const statusMessage = isBeingEnabled ? 'enabled' : 'disabled'

      addNotification({
        iconColor: isBeingEnabled ? 'green' : 'red',
        header: `${policyToToggle.name} policy has been ${statusMessage}`,
        icon: FaRegCheckCircle,
        hideProgressBar: false,
      })
    } catch (error) {
      console.error('Error toggling policy:', error)
    }
  }

  const deletePolicy = async () => {
    try {
      // Optimistically update UI
      setPolicies(currentPolicies =>
        currentPolicies.filter(policy => policy.id !== policyToDelete.id)
      )

      // Make API call in the background
      const response = await fetchWithAuth(`/api/policy/${policyToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        // If delete fails, revert the optimistic update by re-fetching
        fetchPolicies()
        throw new Error('Failed to delete policy')
      }

      addNotification({
        iconColor: 'green',
        header: `Policy has been deleted.`,
        icon: CircleX,
        hideProgressBar: false,
      })
    } catch (error) {
      console.error('Error deleting policy:', error)
    } finally {
      setShowDeletePolicyAlert(false)
      setPolicyToDelete(null)
    }
  }

  // When closing the alert without deleting, clean up the state
  const handleCancelDelete = () => {
    setShowDeletePolicyAlert(false)
    setPolicyToDelete(null)
  }

  return (
    <div className='w-full flex flex-col flex-1 h-full overflow-hidden border'>
      {/* Header */}
      <div className='flex justify-between items-center px-4 py-2 bg-white'>
        <div className='flex items-center gap-2'>
          <ShieldEllipsis className='size-6' />
          <h1 className='text-xl font-medium'>Policies</h1>
        </div>
        <ButtonWithIcon
          buttonText='Add Policy'
          icon={Plus}
          size='small'
          onClick={() => setIsPolicyModalOpen(true)}
        />
      </div>
      <div className='flex-1 overflow-y-auto bg-white'>
        <table className='w-full table-auto'>
          <thead className='bg-blue-300 h-12'>
            <tr className='text-black uppercase text-xs leading-normal select-none'>
              <th
                className='text-left font-bold uppercase px-4 py-2 cursor-pointer'
                onClick={() => handleSort('name')}
              >
                Policy Name
              </th>
              {/* <th
                className='text-left font-bold uppercase px-4 py-2 cursor-pointer'
                onClick={() => handleSort('mentionRate')}
              >
                Mention Rate
              </th>
              <th
                className='text-left font-bold uppercase px-4 py-2 cursor-pointer'
                onClick={() => handleSort('conversionRate')}
              >
                Conversion Rate
              </th> */}
              {/* <th
                className='text-left font-bold uppercase px-4 py-2 cursor-pointer'
                onClick={() => handleSort('revenueGenerated')}
              >
                Revenue Generated
              </th>
              <th
                className='text-left font-bold uppercase px-4 py-2 cursor-pointer'
                onClick={() => handleSort('potentialRevenueLoss')}
              >
                Potential Revenue Loss
              </th> */}
              <th
                className='text-left font-bold uppercase px-4 py-2 cursor-pointer'
                onClick={() => handleSort('active')}
              >
                Active
              </th>
              <th className='text-left font-bold uppercase px-4 py-2'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='relative'>
            {loadingPolicies ? (
              <tr>
                <td className='h-[268px]'>
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <CircleSpinner loading={loadingPolicies} />
                    <p className='text-lg'>Loading policies...</p>
                  </div>
                </td>
              </tr>
            ) : policies?.length === 0 ? (
              <tr>
                <td colSpan={2} className='h-[260px]'>
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='text-gray-500 flex flex-col items-center gap-2'>
                      <ShieldEllipsis className='size-8' />
                      <p>No policies have been created yet</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              sortedPolicies.map(policy => (
                <tr
                  key={policy.id}
                  className='bg-white border-b border-t first:border-t-0 hover:bg-slate-200 text-sm'
                >
                  <td className='p-2.5'>
                    <div
                      onClick={() =>
                        router.push(`/analytics/policy/${policy.id}`)
                      }
                      className='inline-flex items-center font-semibold gap-1 text-blue-600 hover:text-blue-800 cursor-pointer'
                    >
                      {policy.name}
                      <ArrowUpRight className='w-4 h-4' />
                    </div>
                  </td>
                  {/* <td className='p-2.5'>{formatPercentage(policy.mentionRate)}</td>
                <td className='p-2.5'>
                  {formatPercentage(policy.conversionRate)}
                </td> */}
                  {/* <td className='p-2.5'>
                  {formatCurrency(policy.revenueGenerated)}
                </td>
                <td className='p-2.5'>
                  {formatCurrency(policy.potentialRevenueLoss)}
                </td> */}
                  <td className='p-2.5'>
                    <Switch
                      onChange={() => handleTogglePolicy(policy)}
                      checked={policy?.active}
                      uncheckedIcon={false}
                      checkedIcon={false}
                      height={17}
                      width={42}
                    />
                  </td>
                  <td className='p-2.5'>
                    <div className='flex text-xs gap-3 items-center font-medium'>
                      <Pencil
                        className='size-5 cursor-pointer text-blue-600 hover:text-blue-800'
                        onClick={() => handleEditClick(policy)}
                      />
                      <CircleX
                        className='size-6 text-red-600 hover:text-red-800 cursor-pointer'
                        onClick={() => {
                          setPolicyToDelete(policy)
                          setShowDeletePolicyAlert(true)
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isPolicyModalOpen}
        onClose={handleModalClose}
        icon={modalMode === 'edit' ? Pencil : ShieldEllipsis}
        title={modalMode === 'edit' ? 'Edit Policy' : 'Add Policy'}
        size='medium'
      >
        <PolicyForm policy={selectedPolicy} onSuccess={handleFormSuccess} />
      </Modal>

      {showDeletePolicyAlert && (
        <Alert
          title='Delete Policy'
          message={`Are you sure you want to delete ${policyToDelete?.name}? This action cannot be undone.`}
          onCancel={handleCancelDelete}
          onConfirm={deletePolicy}
          buttonActionText={'Delete Policy'}
          Icon={MdWarning}
        />
      )}
    </div>
  )
}

export default OrgLevelPolicyTable
