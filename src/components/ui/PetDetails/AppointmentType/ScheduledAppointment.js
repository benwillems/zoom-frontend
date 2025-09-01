// ScheduledAppointment.js
import React, { useCallback, useState } from 'react'
import { convertToLocalTime } from '@/utils/dates'
import {
  FaFileAudio,
  FaRegCalendarCheck,
  FaRegFileAudio,
} from 'react-icons/fa6'
import { useDropzone } from 'react-dropzone'
import CircleSpinner from '@/components/common/CircleSpinner'
import useAudioStore from '@/store/useAudioStore'
import TemplateSelect from '../../common/TemplateSelect'
import AICourseModal from '@/components/modals/AICourseModal'
import { HiLightBulb } from "react-icons/hi"
import { FaMedal } from "react-icons/fa"

const ScheduledAppointment = ({ appointment, isLast }) => {
  const { uploadAudioFile } = useAudioStore()

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioFile, setAudioFile] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState()
  const [fileError, setFileError] = useState('')
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false)
  const [currentAppointment, setCurrentAppointment] = useState(null)

  const openUploadModal = () => {
    setIsUploadModalOpen(true)
  }

  const closeUploadModal = () => {
    setIsUploadModalOpen(false)
    setAudioFile(null)
    setFileError(null)
  }

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length > 0) {
      setAudioFile(acceptedFiles[0])
      setFileError('')
    }
    if (rejectedFiles.length > 0) {
      setFileError(
        'Invalid file type. Please select a valid audio file (MP3, M4A).'
      )
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        'audio/mpeg': ['.mp3'],
        'audio/x-m4a': ['.m4a'],
      },
      multiple: false,
    })

  const handleUpload = async () => {
    // const notesTemplate =
    closeUploadModal()
    setIsGenerating(true)
    await uploadAudioFile(appointment?.id, audioFile, appointment?.clientId)
    setIsGenerating(false)
  }

  const openScoreModal = (e) => {
    e.stopPropagation()
    setCurrentAppointment(appointment)
    setIsScoreModalOpen(true)
  }

  return (
    <div className='flex sm:items-start px-2 sm:px-0 w-full sm:py-0 py-1.5'>
      <div className='flex relative mr-2 flex-shrink-0'>
        <div className='flex flex-col items-center mt-3'>
          <div
            className={`w-8 h-8 rounded-full flex justify-center items-center bg-blue-500 text-white`}
          >
            <FaRegCalendarCheck />
          </div>
          {!isLast && (
            <div className='hidden sm:block w-[2px] h-8 bg-gray-300 flex-grow mt-2'></div>
          )}
        </div>
      </div>
      <div className='flex-1 text-start px-0 sm:px-4 py-1.5 sm:hover:bg-gray-200 rounded-lg transition-all duration-300'>
        <div className='flex items-center sm:flex-row text-center sm:text-start sm:items-center justify-between w-full'>
        <div className='flex items-center space-x-2'>
          <div>
            <h1 className='flex font-bold text-sm sm:text-base'>
              Scheduled Appointment
            </h1>
            <h2 className='flex font-normal text-sm'>
              {convertToLocalTime(appointment?.scheduleStartAt)}
            </h2>
          </div>
          {(appointment?.status === 'SUCCEEDED' ||
            appointment?.status === 'SUCCEEDED_MULTI') && (
            <button
              onClick={openScoreModal}
              className="bg-blue-500 text-white px-2 py-1 text-xs rounded mt-1 flex items-center space-x-1"
            >
              <HiLightBulb className="text-lg" />
              <span className="hidden sm:block">
                {appointment.totalScore !== null &&
                appointment.obtainedScore !== null
                  ? `Score: ${appointment.obtainedScore}/${appointment.totalScore}`
                  : 'AI Course'}
              </span>
            </button>
           )}
  </div>
          <div
            className='flex h-10 w-auto justify-end items-center text-blue-400 gap-1 cursor-pointer '
            onClick={openUploadModal}
          >
            {isGenerating ? (
              <CircleSpinner loading={isGenerating} height={30} width={30} />
            ) : (
              <FaFileAudio className='size-6 sm:size-4' />
            )}
            <p className='hidden sm:block uppercase text-base font-semibold'>
              {isGenerating ? 'Uploading Audio' : 'Upload Audio'}
            </p>
          </div>
        </div>
      </div>

      {/* Modal for uploading an audio file */}
      {isUploadModalOpen && (
        <div className='fixed inset-0 flex items-center justify-center z-50 mx-2'>
          <div className='fixed inset-0 bg-black opacity-50'></div>
          <div className='bg-white h-96 w-full sm:w-[650px] rounded-md p-4 sm:p-6 shadow-lg z-10 flex flex-col'>
            <div className='mb-2 space-y-1'>
              <div className='flex items-center gap-1.5'>
                <FaRegFileAudio className='size-5 sm:size-6' />
                <h2 className='text-lg sm:text-xl font-semibold'>
                  Upload Audio
                </h2>
              </div>
              <p>{convertToLocalTime(appointment?.scheduleStartAt)}</p>
            </div>
            <div className='mb-4'>
              <TemplateSelect flexCol={true} />
            </div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed ${
                isDragActive ? 'border-blue-500' : 'border-gray-300'
              } p-4 rounded-md cursor-pointer flex-grow flex items-center justify-center`}
            >
              <input {...getInputProps()} />
              {fileError ? (
                <p className='text-center text-red-500'>{fileError}</p>
              ) : audioFile ? (
                <p>{audioFile.name}</p>
              ) : (
                <p className='text-center text-gray-500'>
                  Drag and drop an audio file here, or click to select a file
                </p>
              )}
            </div>
            <div className='flex justify-end items-center text-sm gap-2 pt-4 font-semibold mt-auto'>
              <button
                className='text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-md px-4 py-1.5'
                onClick={closeUploadModal}
              >
                Close
              </button>
              <button
                className='px-4 py-1.5 bg-blue-300 hover:bg-blue-400 text-black rounded-md disabled:cursor-not-allowed disabled:bg-gray-300'
                onClick={handleUpload}
                disabled={!audioFile}
              >
                Upload Audio
              </button>
            </div>
          </div>
        </div>
      )}
      {isScoreModalOpen && (
        <AICourseModal
          isOpen={isScoreModalOpen}
          onClose={() => setIsScoreModalOpen(false)}
          appointment={currentAppointment}
        />
      )}
    </div>
  )
}

export default ScheduledAppointment
