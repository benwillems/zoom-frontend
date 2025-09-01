import React, { Fragment, useState, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import AddClientForm from '@/components/inputForms/clientForm'
import AddPetForm from '@/components/inputForms/petForm'
import { useRouter } from 'next/router'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Clients() {
  const router = useRouter()
  const [people, setPeople] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('') // State to store the error message
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [addingPetForClientId, setAddingPetForClientId] = useState(null)
  const [petErrorMessage, setPetErrorMessage] = useState('') // State to store the error message
  const [pets, setPets] = useState([])
  const [orgDetails, setOrgDetails] = useState(undefined)
  const [isPetModalOpen, setIsPetModalOpen] = useState(false)

  const fetchPeople = () => {
    fetch('/api/clients', { cache: 'no-store' })
      .then(response => response.json())
      .then(data => setPeople(data))
      .catch(error => console.error('Error fetching data:', error))
  }

  const fetchPetsForClient = clientId => {
    fetch(`/api/clients/${clientId}/pets`)
      .then(response => response.json())
      .then(data => setPets(data))
  }

  const fetchOrgDetails = () => {
    fetch(`/api/organization`)
      .then(response => {
        // Check if the response is not successful (not in the range of 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then(data => setOrgDetails(data))
      .catch(error => {
        console.error('Fetching organization details failed:', error)
        setOrgDetails(null)
      })
  }

  useEffect(() => {
    // Effect to fetch organization details
    if (orgDetails === undefined || orgDetails === null) {
      fetchOrgDetails()
    }
  }, []) // Empty dependency array ensures this effect runs only once on mount

  useEffect(() => {
    // Effect for redirection based on orgDetails
    if (orgDetails === null) {
      // Explicitly check for null if that's what's set on fetch failure
      router.push('/organization')
    }
  }, [orgDetails, router]) // This effect depends on orgDetails and router

  useEffect(() => {
    // Effect to fetch people and pets, only runs if orgDetails is truthy
    if (orgDetails) {
      fetchPeople()
      if (selectedClientId) {
        fetchPetsForClient(selectedClientId)
      }
    }
  }, [selectedClientId, orgDetails])

  const handleOpenPetModal = clientId => {
    setAddingPetForClientId(clientId)
    setIsPetModalOpen(true) // Open the modal
  }

  // Handler for adding a new client
  const handleFormSubmit = clientData => {
    fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then(data => {
        console.log('Success:', data)
        setIsModalOpen(false) // Close the modal on successful submission
        setErrorMessage('')
        fetchPeople()
      })
      .catch(error => {
        console.error('Error:', error)
        setErrorMessage('Failed to add client. Please try again.') // Set error message
      })
  }

  const handleAddPetSubmit = petData => {
    fetch(`/api/clients/${addingPetForClientId}/pets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(petData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then(data => {
        console.log('Success:', data)
        fetchPetsForClient(addingPetForClientId)
        setAddingPetForClientId(null) // Hide the Add Pet form after submission
        // Optionally, refresh the pets for the current client
        // If you have a method to fetch pets, you can call it here. For example:
        setPetErrorMessage('')
        setIsPetModalOpen(false)
      })
      .catch(error => {
        console.error('Error:', error)
        // Here you would set an error message state specific to pet addition if you have one
        setPetErrorMessage('Failed to add pet. Please try again.')
      })
  }

  const handleSearchChange = event => {
    setSearchTerm(event.target.value)
  }

  const filteredPeople = searchTerm
    ? people.filter(person =>
        person.name.toLowerCase().startsWith(searchTerm.toLowerCase())
      )
    : people

  if (orgDetails === undefined) {
    return <div>Loading organization details...</div>
  }

  return orgDetails ? (
    <Fragment>
      <div className='mt-14 sm:mt-0 bg-white shadow p-4 mb-5 rounded-lg'>
        <div className='flex justify-between items-center mb-4'>
          <input
            type='text'
            placeholder='Search by name'
            className='p-2 border border-gray-300 rounded w-full mr-4'
            onChange={handleSearchChange}
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className='py-2 px-4 bg-green-500 hover:bg-green-700 text-white font-bold rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          >
            Add New Client
          </button>

          {isModalOpen && (
            <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center'>
              <div className='bg-white p-6 rounded shadow-lg'>
                {errorMessage && (
                  <div className='text-red-500'>{errorMessage}</div>
                )}
                <AddClientForm
                  onSubmit={handleFormSubmit}
                  onCancel={() => {
                    setIsModalOpen(false)
                    setErrorMessage('') // Reset error message on cancel
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <ul role='list' className='divide-y divide-gray-100'>
          {filteredPeople.map(person => (
            <li key={person.email} className='bg-white shadow'>
              <div className='flex justify-between items-center p-4'>
                {/* Left side - Client details */}
                <div className='flex items-center space-x-4'>
                  <img
                    className='h-12 w-12 rounded-full bg-gray-50'
                    src='/placeholder.jpeg'
                    alt=''
                  />
                  <div>
                    <p className='text-sm font-semibold text-gray-900'>
                      {person.name}
                    </p>
                    <p className='text-xs text-gray-500'>{person.email}</p>
                  </div>
                </div>
                {/* Right side - Status and menu */}
                <div className='flex items-center space-x-4'>
                  <Menu as='div' className='relative'>
                    <Menu.Button className='text-gray-500 hover:text-gray-900'>
                      <EllipsisVerticalIcon
                        className='h-5 w-5'
                        aria-hidden='true'
                      />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter='transition ease-out duration-100'
                      enterFrom='transform opacity-0 scale-95'
                      enterTo='transform opacity-100 scale-100'
                      leave='transition ease-in duration-75'
                      leaveFrom='transform opacity-100 scale-100'
                      leaveTo='transform opacity-0 scale-95'
                    >
                      <Menu.Items className='absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-black/5 focus:outline-none'>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href='#'
                              className={classNames(
                                active ? 'bg-gray-50' : '',
                                'block px-3 py-1 text-sm leading-6 text-gray-900'
                              )}
                            >
                              View profile
                              <span className='sr-only'>, {person.name}</span>
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href='#'
                              className={classNames(
                                active ? 'bg-gray-50' : '',
                                'block px-3 py-1 text-sm leading-6 text-gray-900'
                              )}
                            >
                              Message
                              <span className='sr-only'>, {person.name}</span>
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={`${
                                active ? 'bg-gray-50' : ''
                              } block w-full text-left px-3 py-1 text-sm leading-6 text-gray-900`}
                              onClick={() =>
                                setSelectedClientId(
                                  person.id === selectedClientId
                                    ? null
                                    : person.id
                                )
                              }
                            >
                              {selectedClientId === person.id
                                ? 'Hide Pets'
                                : 'View Pets'}
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
              {selectedClientId === person.id && (
                <div className='p-4 bg-gray-100 rounded-b'>
                  <div className='flex justify-between items-center'>
                    <h3 className='text-lg leading-6 font-medium text-gray-900'>
                      Pets
                    </h3>
                    <button
                      onClick={() => handleOpenPetModal(person.id)}
                      className='py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded'
                    >
                      Add Pet
                    </button>
                  </div>
                  {isPetModalOpen && (
                    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center'>
                      <div className='bg-white p-6 rounded shadow-lg'>
                        {petErrorMessage && (
                          <div className='text-red-500'>{petErrorMessage}</div>
                        )}
                        <AddPetForm
                          onSubmit={handleAddPetSubmit}
                          onCancel={() => {
                            setIsPetModalOpen(false)
                            setAddingPetForClientId(null)
                            setPetErrorMessage('') // Reset pet error message on cancel
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div className='bg-gray-100 p-4 rounded'>
                    {pets.map(pet => (
                      <div
                        key={pet.id}
                        className='flex bg-white p-3 rounded-lg shadow mb-3 justify-between items-center'
                      >
                        <div className='flex items-center space-x-4'>
                          <img
                            src='/placeholder.jpeg'
                            alt={pet.name}
                            className='h-20 w-20 rounded-full'
                          />
                          <div>
                            <h3 className='font-bold'>{pet.name}</h3>
                            {/* More pet details */}
                          </div>
                        </div>
                        <a
                          className='py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded'
                          href={`/petDetails/${pet.id}`}
                        >
                          View Pet
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Fragment>
  ) : null
}
