import React, { useState } from 'react'
import useNotificationStore from '@/store/useNotificationStore'
import { FaRegCheckCircle } from 'react-icons/fa'

const InviteMemberForm = ({ closeModal, roleOptions }) => {
  const addNotification = useNotificationStore(state => state.addNotification)
  const [memberDetails, setMemberDetails] = useState({
    name: '',
    email: '',
    phone: '',
    roleId: '',
  })

  const handleChange = e => {
    const { name, value } = e.target
    if (name === 'roleId') {
      setMemberDetails(prevDetails => ({
        ...prevDetails,
        [name]: parseInt(value, 10), // Converts the roleId to an integer
      }))
    } else {
      setMemberDetails(prevDetails => ({
        ...prevDetails,
        [name]: value,
      }))
    }
  }

  const inviteTeamMember = async memberToInviteDetails => {
    try {
      const response = await fetch('/api/invite/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberToInviteDetails),
      })
      if (!response.ok) throw new Error('Network response was not ok')
      addNotification({
        iconColor: 'green',
        header: `${memberDetails.name} was invited!`,
        icon: FaRegCheckCircle,
        hideProgressBar: false,
      })
    } catch (error) {
      console.error('Inviting team member failed:', error)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    await inviteTeamMember(memberDetails)
    closeModal()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-4 w-full mx-2 sm:w-[500px]'
    >
      <div className='overflow-hidden bg-white shadow sm:rounded-lg'>
        <div className='px-4 py-5 sm:p-6'>
          <h3 className='text-lg font-medium leading-6 text-gray-900'>
            Invite Team Member
          </h3>
          <div className='mt-2 max-w-xl text-sm text-gray-500'>
            <p>Fill out the details below to invite a new team member.</p>
          </div>
          <div className='mt-5'>
            {['name', 'email'].map(field => (
              <div key={field} className='mb-4'>
                <label
                  htmlFor={field}
                  className='block text-sm font-medium text-gray-700 capitalize py-2'
                >
                  {field}
                </label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  id={field}
                  value={memberDetails[field]}
                  onChange={handleChange}
                  className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline focus:outline-1 focus:outline-black block w-full p-2'
                  required
                />
              </div>
            ))}
            <div className='mb-4'>
              <label
                htmlFor='roleId'
                className='block text-sm font-medium text-gray-700'
              >
                Role
              </label>
              <select
                name='roleId'
                id='roleId'
                value={memberDetails.roleId}
                onChange={handleChange}
                className='mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-400 sm:text-sm'
                required
              >
                <option value=''>Select a role</option>{' '}
                {/* Placeholder option */}
                {roleOptions?.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className='px-4 py-3 bg-gray-50 text-right sm:px-6'>
          <button
            type='button'
            className='bg-white py-2 px-4 border border-gray-300 rounded-md uppercase shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 mr-3'
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            type='submit'
            className='inline-flex justify-center py-2 px-4 border border-transparent uppercase shadow-sm text-sm font-medium rounded-md text-black bg-blue-300 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400'
          >
            Invite Member
          </button>
        </div>
      </div>
    </form>
  )
}

export default InviteMemberForm
