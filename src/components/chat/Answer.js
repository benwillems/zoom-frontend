import React, { useState, useEffect } from 'react'
import { GrTextAlignLeft } from 'react-icons/gr'
import CircleSpinner from '../common/CircleSpinner'
import AnswerLoading from './AnswerLoading'

const Answer = ({ answer, loading, isLastAnswer }) => {
  const [displayTypewriterText, setDisplayTypewriterText] = useState('')
  const [writeOutTextLoader, setWriteOutTextLoader] = useState(false)

  useEffect(() => {
    if (!loading && answer) {
      setWriteOutTextLoader(true)
      let words = answer.split('')
      let display = ''
      let i = 0
      const timer = setInterval(() => {
        if (i < words.length) {
          display = display + words[i]
          setDisplayTypewriterText(display)
          i++
        } else {
          clearInterval(timer)
          setWriteOutTextLoader(false)
        }
      }, 5)
      return () => {
        clearInterval(timer)
      }
    }
  }, [loading, answer])

  const headerText =
    writeOutTextLoader && isLastAnswer ? 'Summarizing' : 'Answer'
  const marginLeftClass = writeOutTextLoader && isLastAnswer ? '!ml-1' : 'ml-2'

  return (
    <div className='px-0.5 text-zinc-800 dark:text-primary-white mt-3 mb-1'>
      {loading && isLastAnswer ? (
        <AnswerLoading />
      ) : (
        <>
          <div className='flex items-center text-green-500 mb-1 mt-3'>
            {writeOutTextLoader && isLastAnswer ? (
              <CircleSpinner
                loading={writeOutTextLoader}
                height='30'
                width='30'
              />
            ) : (
              <GrTextAlignLeft className='text-xl' />
            )}
            <h1 className={`text-lg ${marginLeftClass} font-medium`}>
              {headerText}
            </h1>
          </div>
          <p className='text-base tracking-wide font-normal leading-relaxed'>
            {!loading && isLastAnswer ? displayTypewriterText : answer}
          </p>
        </>
      )}
    </div>
  )
}

export default Answer
