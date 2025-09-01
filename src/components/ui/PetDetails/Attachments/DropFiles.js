import useClientStore from '@/store/clientStore'
import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  FaFileExcel,
  FaFilePdf,
  FaFileWord,
  FaImage,
  FaTimes,
} from 'react-icons/fa'

const DropFiles = ({ fileDataIsPresent, onFileUploadSuccess }) => {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const { appointmentNote } = useClientStore()

  // Clear uploaded files automatically after 10 seconds
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      const timer = setTimeout(() => {
        setUploadedFiles([])
      }, 10000)

      return () => clearTimeout(timer) // Clear timeout if component unmounts
    }
  }, [uploadedFiles])

  // Function to remove a file from the UI manually
  const removeFile = fileToRemove => {
    setUploadedFiles(currentFiles =>
      currentFiles.filter(file => file.file !== fileToRemove)
    )
  }

  const getFileIcon = type => {
    if (type.includes('pdf'))
      return <FaFilePdf className='h-6 w-6 text-red-500' />
    if (type.includes('image')) return <FaImage className='h-6 w-6 ' />
    if (type.includes('word'))
      return <FaFileWord className='h-6 w-6 text-blue-500' />
    if (type.includes('excel'))
      return <FaFileExcel className='h-6 w-6 text-green-500' />
    return <FaFile className='h-6 w-6' /> // Default file icon
  }

  const onDrop = useCallback(acceptedFiles => {
    const filesWithProgress = acceptedFiles.map(file => ({
      file,
      progress: 0,
    }))
    setUploadedFiles(currentFiles => [...currentFiles, ...filesWithProgress])
    filesWithProgress.forEach(uploadFile)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
      'text/csv': ['.csv'],
    },
    multiple: true,
  })

  const uploadFile = async fileWithProgress => {
    const { file } = fileWithProgress

    // Create a new FormData object and append the file
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(
        `/api/appointment/${appointmentNote.id}/attachments`,
        {
          // Replace '/your-backend-upload-route' with your actual upload URL
          method: 'POST',
          body: formData,
        }
      )

      // Check if the upload was successful
      if (!response.ok) throw new Error('Upload failed')

      // Once the file is uploaded successfully, update the progress to 100%
      setUploadedFiles(currentFiles =>
        currentFiles.map(currentFile => {
          if (currentFile.file === fileWithProgress.file) {
            return { ...currentFile, progress: 100 } // Update progress to 100% on success
          }
          return currentFile
        })
      )
      onFileUploadSuccess()
    } catch (error) {
      console.error('Error uploading file:', error)
      // Handle any errors here, such as by showing an error message to the user
    }
  }

  return (
    <div
      className={`w-full lg:flex-grow flex flex-col ${
        uploadedFiles.length > 0 ? 'mb-0' : 'mb-4'
      }`}
    >
      {/* Dropzone section remains unchanged */}

      <div
        {...getRootProps({
          className: `dropzone border-dashed border-2 ${
            fileDataIsPresent ? 'h-full' : 'h-14 sm:h-20'
          } flex justify-center items-center font-semibold uppercase text-center text-xs sm:text-sm text-blue-400 border-blue-400 p-4 cursor-pointer hover:bg-blue-50`,
        })}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop files here, or click to select files</p>
        )}
      </div>
      <div className='flex flex-wrap'>
        {uploadedFiles.map((uploadedFile, index) => (
          <div
            key={index}
            className={`w-32 h-24 py-2 px-1 my-2 first:ml-0 mx-2 border rounded flex flex-col justify-between relative`}
          >
            <FaTimes
              className='absolute right-2 top-2 cursor-pointer text-red-500'
              onClick={() => removeFile(uploadedFile.file)}
            />
            <div className='flex justify-center items-center h-8'>
              {getFileIcon(uploadedFile.file.type)}
            </div>
            <div className='text-xs px-1 ellipsis w-full text-center overflow-hidden'>
              {uploadedFile.file.name}
            </div>
            <div className='w-full h-2 bg-gray-200 self-end'>
              <div
                className='bg-blue-500 h-full rounded-md'
                style={{ width: `${uploadedFile.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DropFiles
