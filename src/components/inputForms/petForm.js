import React, { useState } from 'react'
import DatePicker from 'react-datepicker'

function AddPetForm({ onSubmit, onCancel }) {
  const [pet, setPet] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: '',
    description: '',
  })

  const handleChange = e => {
    setPet({ ...pet, [e.target.name]: e.target.value })
  }

  const handleDateChange = date => {
    setPet({ ...pet, age: date })
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit({ ...pet, age: pet.age.toISOString().slice(0, 10) })
  }

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-30'>
      <div className='bg-white rounded-lg shadow-xl p-8 max-w-md w-full'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <h3 className='text-2xl font-bold text-gray-900 mb-4'>Add New Pet</h3>
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
              value={pet.name}
              onChange={handleChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300'
            />
          </div>
          <div>
            <label
              htmlFor='species'
              className='block text-sm font-medium text-gray-700'
            >
              Species
            </label>
            <input
              type='text'
              name='species'
              id='species'
              value={pet.species}
              onChange={handleChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300'
            />
          </div>
          <div>
            <label
              htmlFor='breed'
              className='block text-sm font-medium text-gray-700'
            >
              Breed
            </label>
            <input
              type='text'
              name='breed'
              id='breed'
              value={pet.breed}
              onChange={handleChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300'
            />
          </div>
          <div>
            <label
              htmlFor='age'
              className='block text-sm font-medium text-gray-700'
            >
              Age (DOB)
            </label>
            <DatePicker
              selected={pet.age && new Date(pet.age)}
              onChange={handleDateChange}
              dateFormat='MM/dd/yyyy'
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300 placeholder:text-sm placeholder:text-gray-600'
              placeholderText='Select date of birth'
            />
          </div>
          <div>
            <label
              htmlFor='gender'
              className='block text-sm font-medium text-gray-700'
            >
              Gender
            </label>
            <input
              type='text'
              name='gender'
              id='gender'
              value={pet.gender}
              onChange={handleChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300'
            />
          </div>
          <div>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-gray-700'
            >
              Description
            </label>
            <textarea
              name='description'
              id='description'
              value={pet.description}
              onChange={handleChange}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300'
            ></textarea>
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
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddPetForm
