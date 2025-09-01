import React, { useEffect, useState } from 'react'
import {
  FaFileMedical,
  FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaFile,
  FaMinusSquare,
} from 'react-icons/fa'
import { convertDate } from '@/utils/dates'
import DropFiles from './DropFiles'
import FileSummary from './FileSummary'
import useClientStore from '@/store/clientStore'
import { MdWarning } from 'react-icons/md'
import Alert from '../../common/Alert'
import DisplayTooltip from '@/components/common/DisplayTooltip'

const Attachments = () => {
  const [filesForAppointment, setFilesForAppointment] = useState()
  const [selectedFileToView, setSelectedFileToView] = useState()
  const [showAlert, setShowAlert] = useState(false)
  const [fileToDelete, setFileToDelete] = useState(null)

  const { appointmentNote } = useClientStore()

  const getFileIcon = fileType => {
    switch (fileType) {
      case 'pdf':
        return <FaFilePdf className='mr-2 text-red-400' />
      case 'jpg':
        return <FaFileImage className='mr-2 text-green-400' />
      case 'jpeg':
        return <FaFileImage className='mr-2 text-green-400' />
      case 'png':
        return <FaFileImage className='mr-2 text-green-400' />
      case 'txt':
        return <FaFileAlt className='mr-2 text-blue-400' />
      default:
        return <FaFileMedical className='mr-2 text-orange-400' />
    }
  }

  // Variable used to display dropzone height to full or 20
  let fileDataIsPresent = !filesForAppointment?.length > 0 ? true : false

  const fetchFiles = async () => {
    try {
      const response = await fetch(
        `/api/appointment/${appointmentNote.id}/attachments`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      setFilesForAppointment(data)
      setSelectedFileToView(data[0])
    } catch (error) {
      console.error('Error fetching files:', error)
      return [] // Return an empty array in case of error
    }
  }

  const handleFileUploadSuccess = () => {
    fetchFiles() // Re-fetch files on successful upload
  }

  useEffect(() => {
    if (appointmentNote.id) {
      fetchFiles()
    }
  }, [appointmentNote.id])

  const deleteFile = async () => {
    if (fileToDelete) {
      try {
        const response = await fetch(`/api/attachment/${fileToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        // Refetch the file list after successful deletion and close the alert
        fetchFiles()
        setShowAlert(false)
        setFileToDelete(null) // Clear the file to delete after operation
      } catch (error) {
        console.error('Error removing file:', error)
        alert('Failed to delete the file. Please try again.')
        // Optionally close the alert and reset delete file info here as well
      }
    }
  }

  // Handle Alert opening up
  const displayDeleteFileAlert = (fileId, fileName) => {
    setFileToDelete({ id: fileId, name: fileName })
    setShowAlert(true)
  }

  return (
    <div className='flex flex-col min-h-[71vh] sm:min-h-[550px] h-auto lg:flex-row p-1 sm:p-4 bg-white'>
      {/* Mobile - Drop files at the top of container */}
      <div className='lg:hidden w-full lg:flex-grow flex flex-col lg:mb-0'>
        <DropFiles
          fileDataIsPresent={fileDataIsPresent}
          selectedFileToView={selectedFileToView}
          onFileUploadSuccess={handleFileUploadSuccess}
        />

        {filesForAppointment?.length > 0 && (
          <FileSummary selectedFile={selectedFileToView} />
        )}
      </div>
      <div className='w-full flex justify-center items-center flex-grow lg:block lg:w-3/5 lg:flex-grow border space-y-2 mr-4'>
        {!filesForAppointment?.length > 0 && (
          <div className='flex flex-col h-full justify-center items-center text-center px-2 space-y-4'>
            <FaFile className='h-10 w-10 text-blue-300' />
            <p className='text-lg'>
              You will be able to explore the summary of your files after
              upload.
            </p>
          </div>
        )}
        {/* File Explorer/Selector Container */}
        {filesForAppointment?.length > 0 && (
          <div className='h-[500px] overflow-y-auto'>
            <table className='w-full text-sm text-left text-gray-500'>
              <thead className='text-xs text-gray-700 uppercase bg-blue-300'>
                <tr>
                  <th scope='col' className='py-3 px-4'>
                    Name
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    Date
                  </th>
                  <th scope='col'></th>
                </tr>
              </thead>
              <tbody>
                {filesForAppointment.map((file, i) => (
                  <tr
                    key={i}
                    className='bg-white border-b hover:bg-blue-100 cursor-pointer'
                  >
                    <td
                      className='py-2 pl-3 pr-6'
                      onClick={() => setSelectedFileToView(file)}
                    >
                      <div className='flex items-center text-base'>
                        {getFileIcon(file.type)}
                        <span className='ml-0 text-sm'>{file.name}</span>
                      </div>
                    </td>
                    <td
                      className='py-2 px-0'
                      onClick={() => setSelectedFileToView(file)}
                    >
                      {convertDate(file.createDate)}
                    </td>
                    <td
                      className='flex justify-center py-4 px-4'
                      onClick={e => {
                        e.stopPropagation() // Prevent triggering other click events
                        displayDeleteFileAlert(file.id, file.name)
                      }}
                    >
                      <div className='text-red-400 hover:text-red-500 cursor-pointer'>
                        <DisplayTooltip
                          id='deleteFileTooltip'
                          place='top'
                          effect='solid'
                          variant='error'
                          message='Delete File'
                          customStyle={{
                            padding: '3px 12px',
                          }}
                        >
                          <FaMinusSquare className='inline-block text-base' />
                        </DisplayTooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAlert && (
        <Alert
          title='Delete File'
          message={`Are you sure you want to delete the file "${fileToDelete?.name}"? This action cannot be undone.`}
          onCancel={() => setShowAlert(false)}
          onConfirm={deleteFile}
          buttonActionText='Delete'
          Icon={MdWarning}
        />
      )}

      <div className='hidden w-full lg:flex-grow lg:flex flex-col mb-4 lg:mb-0'>
        <DropFiles
          fileDataIsPresent={fileDataIsPresent}
          selectedFileToView={selectedFileToView}
          onFileUploadSuccess={handleFileUploadSuccess}
        />

        {filesForAppointment?.length > 0 && (
          <FileSummary selectedFile={selectedFileToView} />
        )}
      </div>
    </div>
  )
}

export default Attachments
