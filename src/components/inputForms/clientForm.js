import React, { useState } from 'react'

function AddClientForm({ onSubmit, onCancel }) {
  const [client, setClient] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const handleChange = e => {
    setClient({ ...client, [e.target.name]: e.target.value })
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit(client)
  }

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-30'>
      <div className='bg-white rounded-lg shadow-xl p-8 max-w-md w-full'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <h3 className='text-2xl font-bold text-gray-900 mb-4'>
            Add New Client
          </h3>
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700'
            >
              Name
            </label>
            <input
              type='text'
              name='name'
              id='name'
              value={client.name}
              onChange={handleChange}
              required
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300'
            />
          </div>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'
            >
              Email
            </label>
            <input
              type='email'
              name='email'
              id='email'
              value={client.email}
              onChange={handleChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300'
            />
          </div>
          <div>
            <label
              htmlFor='phone'
              className='block text-sm font-medium text-gray-700'
            >
              Phone
            </label>
            <input
              type='tel'
              name='phone'
              id='phone'
              value={client.phone}
              onChange={handleChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300'
            />
          </div>
          <div className='flex justify-end space-x-4'>
            <button
              type='button'
              onClick={onCancel}
              className='py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300'
            >
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddClientForm
