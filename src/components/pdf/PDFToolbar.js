import React, { useEffect, useRef, useState } from 'react'
import { useConversationContext } from '../context/ConversationProvider'
import {
  AiOutlineCloseSquare,
  AiOutlineMinus,
  AiOutlinePlus,
} from 'react-icons/ai'
import { MdRestartAlt } from 'react-icons/md'
import { BiLinkExternal } from 'react-icons/bi'

const PDFToolbarTwo = ({
  setReferenceViewer,
  pageNumber,
  setPageNumber,
  numPages,
  scale,
  setScale,
}) => {
  const { referenceChosen, setReferenceChosen } = useConversationContext()
  const [inputValue, setInputValue] = useState(pageNumber || '1') // start on page 1
  const [isTwoLines, setIsTwoLines] = useState(false)
  const textElement = useRef(null)

  useEffect(() => {
    if (textElement.current) {
      const lineHeight = parseInt(
        window.getComputedStyle(textElement.current).lineHeight
      )
      const height = textElement.current.clientHeight

      setIsTwoLines(height > lineHeight * 2)
    }
  }, [referenceChosen?.metadata.documentName])

  // update inputValue whenever pageNumber changes
  useEffect(() => {
    setInputValue(pageNumber)
  }, [pageNumber])

  const removeReference = () => {
    setReferenceChosen({})
    setReferenceViewer(false)
  }

  const handleInputChange = event => {
    setInputValue(event.target.value)
  }

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      if (pageNumber != inputValue) {
        setReferenceChosen(null)
      }
      const newPageNumber = parseInt(inputValue, 10)
      if (newPageNumber > 0 && newPageNumber <= numPages) {
        setPageNumber(newPageNumber) // <-- Update the pageNumber state
        setInputValue(newPageNumber)
      }
    }
  }

  const zoomIn = () => {
    setScale(scale + 0.05)
  }

  const zoomOut = () => {
    if (scale > 0.05) setScale(scale - 0.05)
  }

  const resetZoom = () => {
    setScale(1)
  }

  return (
    <div className='flex justify-between bg-lt-primary-off-white dark:bg-primary-dark items-center h-14 my-1 px-1 w-full'>
      <div className='flex items-center break-all'>
        <a
          className='flex items-center font-medium text-lg pr-24 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500 hover:underline'
          href={`${
            referenceChosen?.metadata?.sourcePdfUrl + `#page=${pageNumber}`
          }`}
          target='_blank'
        >
          View source PDF
          <BiLinkExternal className='ml-2' />
        </a>
      </div>

      <div className='flex items-center'>
        {/* <div className='flex items-center space-x-2'>
          <AiOutlineMinus
            className='text-xl text-primary-light hover:text-green-500 cursor-pointer'
            onClick={() => zoomOut()}
          />
          <MdRestartAlt
            className='text-xl text-primary-light hover:text-green-500 cursor-pointer'
            onClick={() => resetZoom()}
          />
          <AiOutlinePlus
            className='text-xl text-primary-light hover:text-green-500 cursor-pointer'
            onClick={() => zoomIn()}
          />
        </div> */}
        <div className='flex items-center w-auto text-sm text-zinc-600 dark:text-primary-white'>
          {/* <input
            type='number'
            min={1}
            max={numPages}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className='outline-none appearance-none py-0.25 px-0.5 bg-primary-dark-light'
            readOnly
          /> */}
          {referenceChosen?.metadata?.sourceCurrentPageNumber}
          <div className='mx-2 flex items-center space-x-1'>
            <div>/</div>
            <p>{referenceChosen?.metadata?.sourceTotalPageNumber}</p>
          </div>
        </div>
        <div
          className='flex items-center ml-1 py-1 px-2 rounded-md bg-red-400 text-primary-dark-light hover:bg-red-500 text-xs cursor-pointer'
          onClick={removeReference}
        >
          {/* <AiOutlineCloseSquare className='mr-1 text-sm' /> */}
          <p>Close</p>
        </div>
      </div>
    </div>
  )
}

export default PDFToolbarTwo
