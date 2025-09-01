import useOrgStore from '@/store/useOrgStore'
import React, { useState, useEffect } from 'react'
import UserProfileDetails from './UserDetails/UserProfileDetails'
import CombinedOrgAndUserProfileDetails from './CombinedOrgAndUserProfileDetails'

const OrganizationDetails = () => {
  const {
    details,
    updateOrgDetails,
    createOrgDetails,
    loading,
    error,
    isAdmin,
  } = useOrgStore()
  const [editMode, setEditMode] = useState(false)
  const [localDetails, setLocalDetails] = useState(details?.organization || {})

  useEffect(() => {
    if (details?.organization) {
      setLocalDetails(details?.organization)
    }
  }, [details])

  const handleChange = e => {
    const { name, value } = e.target
    setLocalDetails(prev => ({ ...prev, [name]: value }))
  }

  const handleEdit = () => {
    setEditMode(true)
  }

  const handleCancel = () => {
    setLocalDetails(details?.organization || {})
    setEditMode(false)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (details?.organization && details?.organization?.id) {
      await updateOrgDetails(localDetails)
    } else {
      await createOrgDetails(localDetails)
    }
    setEditMode(false)
  }

  return !details && !loading && error == 'Organization not found' ? (
    <CombinedOrgAndUserProfileDetails />
  ) : (
    <div className='card bg-gray-50 shadow-lg rounded-lg p-6'>
      <form onSubmit={handleSubmit}>
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-6'>
          <div>
            <h3 className='text-3xl font-bold text-gray-900'>
              Organization Details
            </h3>
            <p className='text-base text-gray-500'>
              {isAdmin
                ? "Manage your organization's information including name, address, and contact details."
                : 'View organization details including name, address and main point of contact.'}
            </p>
          </div>
          {!editMode &&
            isAdmin && ( // Only show the "Edit Org" button if not in edit mode and user is an admin
              <button
                onClick={handleEdit}
                className='bg-blue-300 w-full mt-3 md:mt-0 md:w-auto hover:bg-blue-400 text-black font-medium rounded-md text-sm px-4 py-1.5'
              >
                Edit Org
              </button>
            )}
          {editMode && (
            <div className='flex justify-end space-x-4'>
              <button
                type='button'
                onClick={handleCancel}
                className='text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-md text-sm px-4 py-1.5 text-center'
              >
                Cancel
              </button>
              <button
                type='submit'
                className='text-black bg-blue-300 hover:bg-blue-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm w-full sm:w-auto px-4 py-1.5 text-center'
              >
                Save Org
              </button>
            </div>
          )}
        </div>
        <div className='overflow-hidden bg-white shadow sm:rounded-lg'>
          <div className='border-t border-gray-100'>
            <dl className='divide-y divide-gray-100'>
              {['name', 'address', 'email', 'phone'].map(field => (
                <div
                  key={field}
                  className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'
                >
                  <dt className='text-sm font-medium text-gray-900'>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </dt>
                  <dd className='mt-1 text-sm leading-6 text-gray-700'>
                    {editMode ? (
                      <input
                        type={
                          field === 'email'
                            ? 'email'
                            : field === 'phone'
                            ? 'tel'
                            : 'text'
                        }
                        id={field}
                        name={field}
                        value={localDetails?.[field] || ''}
                        onChange={handleChange}
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline focus:outline-1 focus:outline-black  block w-full p-2.5'
                        required={field !== 'phone'} // Assuming 'phone' is not required; adjust as needed
                      />
                    ) : (
                      <span>{localDetails?.[field]}</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </form>
      <UserProfileDetails />
    </div>
  )
}

export default OrganizationDetails
