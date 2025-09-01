import useClientStore from '@/store/clientStore'
import React from 'react'
import Modal from 'react-modal'

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
}

const SendEmailModal = ({
  isOpen,
  onClose,
  emailContent,
  onSendEmail,
  emailSubject,
  setEmailSubject,
}) => {
  const { clientDetails } = useClientStore()

  const handleSubjectChange = event => {
    setEmailSubject(event.target.value)
  }

  const handleSendClick = () => {
    onSendEmail()
    onClose()
  }

  let invalidEmail =
    clientDetails?.email === '' || clientDetails?.email === 'Add Email'

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel='Send Email Modal'
      className='fixed inset-0 z-50 flex items-center justify-center'
      overlayClassName='fixed inset-0 bg-black bg-opacity-50'
    >
      <div className='bg-white rounded-md shadow-lg w-full h-[700px] max-w-5xl mx-auto flex flex-col'>
        <div className='p-6 flex flex-col h-full'>
          <div className='flex flex-col pb-2 text-sm'>
            <p>
              To:{' '}
              {!invalidEmail ? (
                clientDetails?.email
              ) : (
                <span className='text-red-500 font-bold'>
                  There is not a valid email attached to the client. Please set
                  the clients email before sending.
                </span>
              )}
            </p>
            <p>From: chughes@sasquatchstrength.com</p>
          </div>
          <input
            type='text'
            placeholder='Subject'
            value={emailSubject}
            onChange={handleSubjectChange}
            className='w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
          />
          <div className='flex-grow border border-gray-300 rounded-md mb-4 overflow-y-auto whitespace-pre-wrap p-3'>
            {emailContent}
          </div>
          <div className='flex justify-end'>
            <button
              onClick={onClose}
              className='px-4 py-2 mr-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none'
            >
              Cancel
            </button>
            <button
              onClick={handleSendClick}
              disabled={invalidEmail}
              className='px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none disabled:bg-gray-800 disabled:hover:bg-gray-900 disabled:cursor-not-allowed'
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default SendEmailModal
