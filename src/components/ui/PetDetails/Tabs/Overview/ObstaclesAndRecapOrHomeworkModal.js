import useClientStore from '@/store/clientStore'
import React, { useEffect, useState } from 'react'
import { MdOutlineCancel } from 'react-icons/md'
import Modal from 'react-modal'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: '80%',
    width: '70%',
    overflowY: 'auto',
    padding: '0 2rem',
    borderRadius: '0.5rem',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
}

const ObstaclesAndRecapOrHomeworkModal = ({ isOpen, onClose }) => {
  const { filteredAppointments } = useClientStore()
  const [appointmentsWithNotesKeys, setAppointmentsWithNotesKeys] = useState([])

  const filterAppointmentsWithNotesKeys = appointments => {
    return appointments.filter(
      appointment =>
        appointment.notes &&
        (appointment.notes.obstacles || appointment.notes.recap_or_homework)
    )
  }

  useEffect(() => {
    if (isOpen && filteredAppointments.length > 0) {
      const filteredAppointmentsByNotes =
        filterAppointmentsWithNotesKeys(filteredAppointments)
      setAppointmentsWithNotesKeys(filteredAppointmentsByNotes)
    }
  }, [isOpen, filteredAppointments])

  Modal.setAppElement('#__next')

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel='Obstacles and Recap/Homework Modal'
    >
      <div className='flex items-center justify-between sticky top-0 bg-white py-4 z-10'>
        <h2 className='text-2xl font-bold'>Obstacles and Recap/Homework</h2>
        <MdOutlineCancel
          className='text-red-500 size-9 cursor-pointer'
          onClick={onClose}
        />
      </div>
      {appointmentsWithNotesKeys.map(appointment => (
        <div key={appointment.id} className='relative'>
          <h3 className='text-lg font-semibold mb-2 sticky top-14 bg-white py-3 underline underline-offset-8'>
            {appointment.formattedDate}
          </h3>
          {appointment?.notes?.obstacles && (
            <div className='flex flex-col mt-2 overflow-hidden'>
              <div
                className={`flex justify-between items-center px-2.5 py-1.5 rounded-t-lg bg-red-300 text-black`}
              >
                <p className='font-semibold text-base'>Obstacles</p>
              </div>
              <div
                className={`py-2 px-3 border-2 border-red-100 rounded-b-lg border-t-0 whitespace-pre-wrap`}
              >
                {appointment?.notes?.obstacles}
              </div>
            </div>
          )}
          {appointment?.notes?.recap_or_homework && (
            <div className='flex flex-col mt-2 overflow-hidden'>
              <div
                className={`flex justify-between items-center px-2.5 py-1.5 rounded-t-lg bg-purple-300 text-black`}
              >
                <p className='font-semibold text-base'>Recap or Homework</p>
              </div>
              <div
                className={`py-2 px-3 border-2 border-purple-100 rounded-b-lg border-t-0 whitespace-pre-wrap`}
              >
                {appointment?.notes?.recap_or_homework}
              </div>
            </div>
          )}
          <hr className='my-4' />
        </div>
      ))}
    </Modal>
  )
}

export default ObstaclesAndRecapOrHomeworkModal
