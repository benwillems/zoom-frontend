import { useEffect, useState } from 'react'
import useAudioStore from '@/store/useAudioStore'

const formatTime = milliseconds => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const useFormattedTimer = () => {
  const { currentTimer } = useAudioStore()

  const [formattedTime, setFormattedTime] = useState('00:00:00')

  useEffect(() => {
    setFormattedTime(formatTime(currentTimer))
  }, [currentTimer])

  return formattedTime
}

export default useFormattedTimer
