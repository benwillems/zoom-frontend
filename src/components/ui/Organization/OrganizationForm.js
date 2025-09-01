import { fetchWithAuth } from '@/utils/generalUtils'
import React, { useState } from 'react'

const OrganizationForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(initialData)

  const handleChange = e => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleCancelClick = () => {
    onCancel() // Call the onCancel function passed as a prop
  }

  const handleSubmit = e => {
    e.preventDefault()
    const endpoint = initialData?.id
      ? `/api/update-organization`
      : '/api/organization'
    fetchWithAuth(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then(data => {
        console.log('Success:', data)
        onSubmit()
      })
      .catch(error => {
        console.error('Error:', error)
      })
  }

  return (
    <div className='card bg-white shadow rounded-lg p-5 my-10 mx-auto max-w-4xl'>
      <div className='header mb-6'>
        <h2 className='text-2xl font-bold text-gray-900'>
          Organization Details
        </h2>
        <p className='text-base text-gray-500'>
          Fill out the form below to update your organization's details.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className='mb-6'>
          <label
            htmlFor='name'
            className='block mb-2 text-sm font-medium text-gray-900'
          >
            Organization Name
          </label>
          <input
            type='text'
            id='name'
            name='name'
            value={formData.name}
            onChange={handleChange}
            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
            required
          />
        </div>
        <div className='mb-6'>
          <label
            htmlFor='address'
            className='block mb-2 text-sm font-medium text-gray-900'
          >
            Address
          </label>
          <input
            type='text'
            id='address'
            name='address'
            value={formData.address}
            onChange={handleChange}
            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
            required
          />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          <div>
            <label
              htmlFor='email'
              className='block mb-2 text-sm font-medium text-gray-900'
            >
              Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
              required
            />
          </div>
          <div>
            <label
              htmlFor='phone'
              className='block mb-2 text-sm font-medium text-gray-900'
            >
              Phone Number
            </label>
            <input
              type='tel'
              id='phone'
              name='phone'
              value={formData.phone}
              onChange={handleChange}
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
            />
          </div>
        </div>
        <div className='flex justify-end space-x-4'>
          <button
            type='button'
            onClick={handleCancelClick}
            className='text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center'
          >
            Cancel
          </button>
          <button
            type='submit'
            className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center'
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}

export default OrganizationForm
