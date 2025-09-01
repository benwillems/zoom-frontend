import React, { useState } from 'react'
import { FaPhone, FaEnvelope } from 'react-icons/fa'
import { IoPersonSharp } from 'react-icons/io5'

export const GetStartedButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className='bg-blue-300 hover:bg-blue-400 text-black px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2'
    >
      <span>Get Started</span>
    </button>
  )
}

const GetStarted = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be in format (XXX) XXX-XXXX'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatPhoneNumber = value => {
    if (!value) return value
    const phoneNumber = value.replace(/[^\d]/g, '')
    if (phoneNumber.length < 4) return phoneNumber
    if (phoneNumber.length < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 10)}`
  }

  const handlePhoneChange = e => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value)
    setFormData(prev => ({
      ...prev,
      phoneNumber: formattedPhoneNumber,
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (validateForm()) {
      try {
        // This will be replaced with actual API call
        await onSubmit(formData)
        onClose()
      } catch (error) {
        console.error('Error submitting form:', error)
      }
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg w-full max-w-md'>
        <div className='flex justify-between items-center bg-blue-300 p-4 rounded-t-lg'>
          <h2 className='text-xl font-semibold'>Get Started</h2>
          <button
            onClick={onClose}
            className='text-gray-700 hover:text-gray-900'
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          <div className='space-y-2'>
            <label className='flex items-center space-x-2 text-sm font-medium text-gray-700'>
              <IoPersonSharp className='text-gray-400' />
              <span>Full Name</span>
            </label>
            <input
              type='text'
              value={formData.fullName}
              onChange={e =>
                setFormData(prev => ({ ...prev, fullName: e.target.value }))
              }
              className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-300 ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='John Doe'
            />
            {errors.fullName && (
              <p className='text-red-500 text-xs'>{errors.fullName}</p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='flex items-center space-x-2 text-sm font-medium text-gray-700'>
              <FaPhone className='text-gray-400' />
              <span>Phone Number</span>
            </label>
            <input
              type='text'
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              maxLength={14}
              className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-300 ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='(555) 555-5555'
            />
            {errors.phoneNumber && (
              <p className='text-red-500 text-xs'>{errors.phoneNumber}</p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='flex items-center space-x-2 text-sm font-medium text-gray-700'>
              <FaEnvelope className='text-gray-400' />
              <span>Email</span>
            </label>
            <input
              type='email'
              value={formData.email}
              onChange={e =>
                setFormData(prev => ({ ...prev, email: e.target.value }))
              }
              className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-300 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='johndoe@example.com'
            />
            {errors.email && (
              <p className='text-red-500 text-xs'>{errors.email}</p>
            )}
          </div>

          <div className='flex justify-end space-x-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-300 hover:bg-blue-400 text-black rounded-md transition-colors duration-200'
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GetStarted
