import React, { useEffect, useState } from 'react'
import AppointmentLogMulti from './AppointmentLogMulti'
import useSearchClientsStore from '@/store/useSearchClientsStore'
import useClientStore from '@/store/clientStore'
import { fetchWithAuth } from '@/utils/generalUtils'

const AppointmentMultiModal = ({ appointments, onCancel }) => {
  const { fetchClients } = useSearchClientsStore()
  const {
    multiClientsSelected,
    setMultiClientsSelected,
    fetchAllAppointments,
  } = useClientStore()

  useEffect(() => {
    fetchClients()
  }, [])

  const isDisableButton =
    appointments.notes.length === multiClientsSelected.length &&
    multiClientsSelected.every(client => client !== null)

  console.log(isDisableButton)

  const handleAssignNotes = async () => {
    const clientIdToNotes = multiClientsSelected.reduce(
      (acc, client, index) => {
        if (client) {
          acc[client.id] = appointments.notes[index]
        }
        return acc
      },
      {}
    )

    try {
      const response = await fetchWithAuth('/api/appointment/assign-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: appointments.id,
          clientIdToNotes,
        }),
      })

      if (response.ok) {
        setMultiClientsSelected([])
        fetchAllAppointments()
        onCancel()
      } else {
        // Handle error case
        console.error('Failed to assign notes to members')
      }
    } catch (error) {
      console.error('Error assigning notes to members:', error)
    }
  }

  return (
    <div className='fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 px-2'>
      <div className='relative top-8 m-4 p-3 border max-w-6xl shadow-lg rounded-md bg-white mx-auto mt-5'>
        <div className='flex flex-col h-full w-full p-4'>
          <div className='mb-6'>
            <h1 className='text-3xl font-bold text-gray-900'>Assign Notes</h1>
            <p className='text-base text-gray-600'>
              Match the notes to the clients who participated in the call.
            </p>
          </div>
          <AppointmentLogMulti appointments={appointments} />
          <div className='flex justify-end px-5 space-x-4'>
            <button
              className='text-gray-700 bg-white border border-gray-300 hover:ring-2 focus:ring-4 focus:outline-none focus:ring-blue-300-200 rounded-md mt-6 py-2 px-6'
              onClick={onCancel}
            >
              Close
            </button>
            <button
              className='mt-6 py-2 px-6 bg-blue-600 hover:bg-blue-700 rounded-md text-white disabled:bg-gray-900 disabled:cursor-not-allowed'
              disabled={!isDisableButton}
              onClick={handleAssignNotes}
            >
              Assign Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentMultiModal
