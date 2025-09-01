import React, { Fragment, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function PetsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [pets, setPets] = useState([]) // State to hold all pets
  const [filteredPets, setFilteredPets] = useState([]) // State to hold filtered pets based on search term
  const [orgDetails, setOrgDetails] = useState(undefined)
  const router = useRouter()

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

  const fetchPets = () => {
    fetch('/api/pets-with-clients')
      .then(response => response.json())
      .then(data => {
        setPets(data.records)
        setFilteredPets(data.records) // Initially, no filter is applied
      })
      .catch(error => console.error('Error fetching pets:', error))
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
    fetchPets()
  }, []) // Empty array means this runs once on component mount

  // Separate effect for filtering pets based on search term
  useEffect(() => {
    const result = pets?.filter(pet =>
      pet.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    )
    setFilteredPets(result)
  }, [searchTerm, pets])

  const handleSearchChange = event => {
    setSearchTerm(event.target.value)
  }

  if (orgDetails === undefined) {
    return <div>Loading organization details...</div>
  }

  return orgDetails ? (
    <Fragment>
      <div className='mt-14 sm:mt-0 bg-white shadow p-4 mb-5 rounded-lg'>
        <div className='flex justify-between items-center mb-4'>
          <input
            type='text'
            placeholder='Search pets by name'
            className='p-2 border border-gray-300 rounded w-full mr-4'
            onChange={handleSearchChange}
          />
        </div>

        <ul role='list' className='divide-y divide-gray-100'>
          {filteredPets.map(pet => (
            <li key={pet.id} className='bg-white shadow'>
              <div className='flex justify-between items-center p-4'>
                <div className='flex items-center space-x-4'>
                  <img
                    className='h-12 w-12 rounded-full bg-gray-50'
                    src='/placeholder.jpeg'
                    alt=''
                  />
                  <div>
                    <p className='text-sm font-semibold text-gray-900'>
                      {pet.name}
                    </p>
                    <p className='text-xs text-gray-500'>
                      Parent: {pet.client.name}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/petDetails/${pet.id}`}
                  className='py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded'
                >
                  View Details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Fragment>
  ) : null
}
