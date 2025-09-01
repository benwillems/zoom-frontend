import React, { useState, useEffect } from 'react'
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import Select from 'react-select'

const Modal = ({ children, onClose }) => {
  return (
    <div className='fixed inset-0 z-50 overflow-auto bg-smoke-800'>
      <div className='flex min-h-screen items-center justify-center'>
        <div className='relative max-w-lg p-8 bg-white shadow-xl'>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function PetRecordForm({ isOpen, onClose, onUpload }) {
  const [showModal, setShowModal] = useState(false)
  const [files, setFiles] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [selectedOrganization, setSelectedOrganization] = useState(null)

  const handleFileChange = event => {
    setFiles(prevFiles => [...prevFiles, ...Array.from(event.target.files)])
  }

  const handleFileRemove = index => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    const organizationId = selectedOrganization
      ? selectedOrganization.value
      : null
    onUpload(files, organizationId)
    onClose()
  }

  useEffect(() => {
    // Fetch organizations from your API
    fetch('/fetch/organizations')
      .then(response => response.json())
      .then(data => {
        const options = data.map(org => ({ value: org.id, label: org.name }))
        setOrganizations(options)
      })
      .catch(error => console.error('Error fetching organizations:', error))
  }, [])

  //   const filteredOrganizations = searchTerm
  //     ? organizations.filter(org =>
  //         org.name.toLowerCase().includes(searchTerm.toLowerCase())
  //       )
  //     : organizations;
  if (!isOpen) return null

  return (
    <Modal onClose={() => setShowModal(false)}>
      <form className='space-y-12'>
        <div className='col-span-full'>
          <label
            htmlFor='file-upload'
            className='block text-sm font-medium text-gray-900'
          >
            File Upload
          </label>
          <div className='mt-2'>
            {/* Display selected files */}
            <ul>
              {files.map((file, index) => (
                <li
                  key={index}
                  className='flex items-center justify-between text-sm text-gray-700'
                >
                  {file.name}
                  <button
                    type='button'
                    onClick={() => handleFileRemove(index)}
                    className='ml-2 text-red-500 hover:text-red-700'
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            {/* File input */}
            <label className='mt-4 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 cursor-pointer text-sm leading-6 text-gray-600'>
              <PhotoIcon
                className='h-12 w-12 text-gray-300'
                aria-hidden='true'
              />
              <span className='pl-1'>Upload a file or drag and drop</span>
              <input
                id='file-upload'
                name='file-upload'
                type='file'
                className='sr-only'
                onChange={handleFileChange}
                multiple
              />
            </label>
          </div>
        </div>

        <div className='mt-6 flex items-center justify-end gap-x-4'>
          <button
            type='button'
            onClick={onClose}
            className='py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleUpload}
            className='py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Upload
          </button>
        </div>
      </form>
    </Modal>
  )
}
