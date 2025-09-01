import Modal from '@/components/common/Modal'
import React, { useState } from 'react'
import { FaConnectdevelop } from 'react-icons/fa6'
import HighLevelForm from './ConnectorForms/HighLevelForm'

const ExternalConnectorCard = ({ connector }) => {
  const [showModal, setShowModal] = useState(false)
  const { imageLogoName, name } = connector

  const handleModalClose = () => {
    setShowModal(false)
  }

  const handleFormSuccess = () => {
    handleModalClose()
  }

  return (
    <div className='py-6 px-8 h-60 w-80 border border-gray-600 rounded-lg flex flex-col items-center justify-around'>
      {/* <img
        src={`/images/ConnectorLogos/${imageLogoName}`}
        width={220}
        height={220}
        alt={`${name} logo`}
      /> */}
      <button
        className='w-full py-2.5 px-10 text-base font-medium bg-blue-300 hover:bg-blue-400 text-black rounded-lg'
        onClick={() => setShowModal(true)}
      >
        Connect to {name}
      </button>

      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        icon={FaConnectdevelop}
        title={`Connect to ${name}`}
        size='medium'
      >
        <HighLevelForm onSuccess={handleFormSuccess} />
      </Modal>
    </div>
  )
}

export default ExternalConnectorCard
