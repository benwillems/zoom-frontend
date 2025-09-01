import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useAudioStore from '@/store/useAudioStore'
import AudioControls from './AudioControls'
import Alert from '../ui/common/Alert'
import { MdWarning } from 'react-icons/md'

function AudioRecorderHP({ clientId, clientName, setSelectedClient }) {
  const router = useRouter()
  const {
    setIsPaused,
    setIsPausing,
    setIsEnding,
    setIsResuming,
    fetchAppointmentSet,
    activeAppointment,
    pauseRecording
  } = useAudioStore()

  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    if (activeAppointment && activeAppointment.status === 'PAUSED') {
      setIsPaused(true)
    } else {
      setIsPaused(false)
      setIsPausing(false)
      setIsEnding(false)
      setIsResuming(false)
    }
  }, [activeAppointment, setIsPaused])

  useEffect(() => {
    fetchAppointmentSet()
  }, [fetchAppointmentSet])

  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (
  //       document.visibilityState === 'hidden' &&
  //       mediaRecorder &&
  //       mediaRecorder.state === 'recording'
  //     ) {
  //       pauseRecording()
  //     }
  //   }

  //   const handlePageHide = () => {
  //     if (mediaRecorder && mediaRecorder.state === 'recording') {
  //       pauseRecording()
  //     }
  //   }

  //   const handleBeforeUnload = event => {
  //     if (mediaRecorder && mediaRecorder.state === 'recording') {
  //       event.preventDefault()
  //       event.returnValue =
  //         'You have an ongoing recording. Are you sure you want to leave?'
  //       pauseRecording()
  //     }
  //   }

  //   const handleRouteChangeStart = () => {
  //     if (mediaRecorder && mediaRecorder.state === 'recording') {
  //       pauseRecording()
  //     }
  //   }

  //   window.addEventListener('beforeunload', handleBeforeUnload)
  //   router.events.on('routeChangeStart', handleRouteChangeStart)

  //   return () => {
  //     window.addEventListener('pagehide', handlePageHide)
  //     document.removeEventListener('visibilitychange', handleVisibilityChange)
  //     window.removeEventListener('beforeunload', handleBeforeUnload)
  //     router.events.off('routeChangeStart', handleRouteChangeStart)
  //   }
  // }, [mediaRecorder, router.events])

  return (
    <>
      <AudioControls
        clientId={clientId}
        clientName={clientName}
        setSelectedClient={setSelectedClient}
      />
      {showAlert && (
        <Alert
          show={showAlert}
          title='Warning'
          message="You will lose your recording if you don't pause it before you navigate away."
          onCancel={() => setShowAlert(false)}
          onConfirm={() => {
            pauseRecording()
            setShowAlert(false)
          }}
          Icon={MdWarning}
          buttonActionText='Pause Recording'
        />
      )}
    </>
  )
}

export default AudioRecorderHP
