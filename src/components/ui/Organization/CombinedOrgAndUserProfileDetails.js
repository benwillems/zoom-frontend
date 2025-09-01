import React, { useState } from 'react'
import useOrgStore from '@/store/useOrgStore'

const CombinedOrgAndUserProfileDetails = () => {
  const { fetchOrgDetails, createOrgDetails } = useOrgStore()

  // Combined state for user and organization details
  const [combinedDetails, setCombinedDetails] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    orgName: '',
    orgAddress: '',
    orgEmail: '',
    orgPhone: '',
  })

  const handleChange = e => {
    const { name, value } = e.target
    setCombinedDetails(prevDetails => ({
      ...prevDetails,
      [name]: value,
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    await createOrgDetails(combinedDetails)
    await fetchOrgDetails()
  }

  return (
    <div className='card bg-gray-50 shadow-lg rounded-lg p-6'>
      <form onSubmit={handleSubmit}>
        <div className='mb-6'>
          <h3 className='text-3xl font-bold text-gray-900'>
            Setup Your Profile & Organization
          </h3>
          <p className='text-base text-red-500 font-semibold'>
            Fill out your information and your organization's information in
            order to use Vet Assist
          </p>
        </div>
        <div className='overflow-hidden bg-white shadow sm:rounded-lg'>
          {/* User Details */}
          {['userName', 'userEmail', 'userPhone'].map(field => (
            <DetailInput
              key={field}
              label={
                field.replace('user', '').charAt(0).toUpperCase() +
                field.replace('user', '').slice(1)
              }
              name={field}
              value={combinedDetails[field]}
              onChange={handleChange}
              type={
                field.includes('Email')
                  ? 'email'
                  : field.includes('Phone')
                  ? 'tel'
                  : 'text'
              }
            />
          ))}

          {/* Organization Details */}
          {['orgName', 'orgEmail', 'orgPhone', 'orgAddress'].map(field => (
            <DetailInput
              key={field}
              label={`Organization ${
                field.replace('org', '').charAt(0).toUpperCase() +
                field.replace('org', '').slice(1)
              }`}
              name={field}
              value={combinedDetails[field]}
              onChange={handleChange}
              type={
                field.includes('Email')
                  ? 'email'
                  : field.includes('Phone')
                  ? 'tel'
                  : 'text'
              }
            />
          ))}
          <div className='flex justify-end px-4 py-6 sm:px-6'>
            <button
              type='submit'
              className='bg-blue-300 w-full mt-3 md:mt-0 md:w-auto hover:bg-blue-400 text-black font-medium rounded-md text-sm px-4 py-1.5'
            >
              Save Details
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

// Reusable component for input fields
const DetailInput = ({ label, name, value, onChange, type = 'text' }) => (
  <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
    <dt className='text-sm font-medium text-gray-900'>{label}</dt>
    <dd className='mt-1 text-sm leading-6 text-gray-700'>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline focus:outline-1 focus:outline-black block w-full p-2.5'
        required
      />
    </dd>
  </div>
)

export default CombinedOrgAndUserProfileDetails
