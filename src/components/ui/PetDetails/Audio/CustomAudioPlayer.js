import React, { useEffect, useRef, useState } from 'react'
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'

const CustomAudioPlayer = ({ audioUrls }) => {
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [totalDuration, setTotalDuration] = useState(0)
  const [cumulativeDurations, setCumulativeDurations] = useState([])
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleAudioEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleAudioEnded)
    }
  }, [])

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    const calculateDurations = async () => {
      let totalDuration = 0
      const durations = []

      for (let i = 0; i < audioUrls.length; i++) {
        const audio = new Audio(audioUrls[i].url)
        await new Promise(resolve => {
          const onLoadedMetadata = () => {
            let audioDuration = 0
            if (audio.duration != Infinity) {
              audioDuration = audio.duration
            }
            durations.push(audioDuration)
            totalDuration += audioDuration
            audio.removeEventListener('loadedmetadata', onLoadedMetadata)
            resolve()
          }
          audio.addEventListener('loadedmetadata', onLoadedMetadata)
        })
      }

      setTotalDuration(totalDuration)
      setCumulativeDurations(durations)
    }

    calculateDurations()
  }, [audioUrls])

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration)
  }

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime)
  }

  const handleAudioEnded = () => {
    const nextIndex = currentAudioIndex + 1
    if (nextIndex < audioUrls.length) {
      setCurrentAudioIndex(nextIndex)
      setTimeout(() => {
        setIsPlaying(true)
        audioRef.current.play()
      }, 0)
    } else {
      setIsPlaying(false)
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSeek = e => {
    const seekTime = e.target.value
    audioRef.current.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const handleVolumeChange = e => {
    const newVolume = e.target.value
    setVolume(newVolume)
  }

  const formatTime = time => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const handleAudioIndexClick = index => {
    setCurrentAudioIndex(index)
    setTimeout(() => {
      setIsPlaying(true)
      audioRef.current.play()
    }, 0)
  }

  const cumulativeTime = cumulativeDurations
    .slice(0, currentAudioIndex)
    .reduce((total, duration) => total + duration, 0)

  console.log(totalDuration)
  return (
    <div className='bg-white shadow-md border border-t drop-shadow-md rounded-lg py-2 mb-2 px-4'>
      <audio
        ref={audioRef}
        src={audioUrls[currentAudioIndex]?.url}
        onEnded={handleAudioEnded}
      />
      <div className='flex items-center justify-between mb-2'>
        <button
          onClick={handlePlayPause}
          className='bg-blue-500 text-white rounded-full p-2 focus:outline-none'
        >
          {isPlaying ? (
            <FaPause className='size-3' />
          ) : (
            <FaPlay className='size-3' />
          )}
        </button>
        <div className='flex items-center space-x-2 w-full pl-1 pr-6'>
          <div className='flex justify-center items-center w-28'>
            <span className='text-sm'>
              {formatTime(cumulativeTime + currentTime)}
            </span>
            <p className='pl-1'> / {formatTime(totalDuration)}</p>
          </div>
          <input
            type='range'
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className='w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer'
          />
        </div>
        <div className='flex items-center'>
          {volume === 0 ? (
            <FaVolumeMute className='w-4 h-4 text-gray-500' />
          ) : (
            <FaVolumeUp className='w-4 h-4 text-gray-500' />
          )}
          <input
            type='range'
            min={0}
            max={1}
            step={0.1}
            value={volume}
            onChange={handleVolumeChange}
            className='ml-2 w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer'
          />
        </div>
      </div>
      <div className='flex space-x-2'>
        {audioUrls.map((url, index) => (
          <div
            key={index}
            className={`size-4 rounded-full cursor-pointer ${
              index === currentAudioIndex ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            onClick={() => handleAudioIndexClick(index)}
          />
        ))}
      </div>
    </div>
  )
}

export default CustomAudioPlayer
