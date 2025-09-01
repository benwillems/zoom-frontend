import React, { useEffect, useRef, useState } from 'react'
import FileSummaryTable from './FileSummaryTable'
import { AiOutlineFileSearch } from 'react-icons/ai'
import Modal from './Modal'
import { ColorRing } from 'react-loader-spinner'
import { FaMinus, FaPlus } from 'react-icons/fa'
import useClientStore from '@/store/clientStore'

const getScale = screenWidth => {
  if (screenWidth <= 480) {
    return 0.44 // Mobile devices
  } else if (screenWidth <= 1024) {
    return 0.8 // Tablets
  } else {
    return 1.3 // Desktops and larger screens
  }
}

const FileSummary = ({ selectedFile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [scale, setScale] = useState(getScale(window.innerWidth))
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pdfDocument, setPdfDocument] = useState()

  const canvasRef = useRef(null)

  const getPreSignedURL = async selectedFileId => {
    try {
      const response = await fetch(`/api/attachment/${selectedFileId}`, {
        method: 'GET',
      })

      if (!response.ok) throw new Error('Unable to get URL')

      const data = await response.json()
      return data.presignedUrl // Adjust this according to the actual response structure
    } catch (error) {
      console.error('Error getting pre-signed URL:', error)
      return null
    }
  }

  const toggleModal = async () => {
    setIsModalOpen(!isModalOpen)
    if (!isModalOpen) {
      setIsLoading(true)
      setInitialLoadComplete(false)
      const url = await getPreSignedURL(selectedFile.id)
      if (url) {
        renderAllPages(url)
        setCurrentPage(1)
      } else {
        console.error(
          'Unable to fetch pre-signed URL for file:',
          selectedFile.id
        )
      }
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setScale(getScale(window.innerWidth))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const renderPDFPages = async pdf => {
    while (canvasRef.current && canvasRef.current.firstChild) {
      canvasRef.current.removeChild(canvasRef.current.firstChild)
    }

    for (let num = 1; num <= pdf.numPages; num++) {
      const page = await pdf.getPage(num)
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.setAttribute('data-page-number', num.toString())

      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = { canvasContext: context, viewport }
      await page.render(renderContext).promise

      canvasRef.current && canvasRef.current.appendChild(canvas)
    }

    setIsLoading(false)
    setInitialLoadComplete(true)
  }

  const renderAllPages = async url => {
    setIsLoading(true)

    const pdfJS = await import('pdfjs-dist/build/pdf')
    pdfJS.GlobalWorkerOptions.workerSrc =
      window.location.origin + '/pdf.worker.min.js'
    const loadingTask = pdfJS.getDocument(url)

    try {
      const pdf = await loadingTask.promise
      setPdfDocument(pdf)
      setNumPages(pdf.numPages)

      while (canvasRef.current && canvasRef.current.firstChild) {
        canvasRef.current.removeChild(canvasRef.current.firstChild)
      }

      for (let num = 1; num <= pdf.numPages; num++) {
        const page = await pdf.getPage(num)
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.setAttribute('data-page-number', num.toString())

        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = { canvasContext: context, viewport }
        await page.render(renderContext).promise

        canvasRef.current.appendChild(canvas)
      }

      setInitialLoadComplete(true)
    } catch (error) {
      console.error('Error rendering PDF: ', error)
    } finally {
      setIsLoading(false)
    }
  }

  function scaleToPercentage(scale) {
    return `${(scale * 100).toFixed(0)}%`
  }

  const resetScale = () => {
    setScale(getScale(window.innerWidth))
  }

  // New useEffect dedicated to scale changes
  useEffect(() => {
    if (isModalOpen) {
      renderPDFPages(pdfDocument)
    }
  }, [scale])

  const updateCurrentPage = () => {
    const children = canvasRef.current?.children
    if (!children) return

    const scrollTop = canvasRef.current.scrollTop // Get the current scroll position
    let heightPassed = 0

    for (let i = 0; i < children.length; i++) {
      heightPassed += children[i].clientHeight
      if (heightPassed >= scrollTop) {
        setCurrentPage(i + 1) // Set the current page
        break // Exit the loop once the current page is found
      }
    }
  }

  useEffect(() => {
    const scrollContainer = canvasRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateCurrentPage)
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', updateCurrentPage)
      }
    }
  }, [numPages]) // Make sure to re-add the listener when the number of pages changes.

  return (
    <div className='w-full lg:flex-grow flex flex-col mb-4 lg:mb-0 border h-full border-t-0 rounded-t-lg'>
      <div className='flex justify-between items-center w-full bg-blue-300 p-2 font-semibold uppercase text-sm md:text-base'>
        <h2 className='w-full text-start'>Summary for {selectedFile?.name}</h2>
        <div
          onClick={toggleModal}
          className='flex justify-end items-center w-40 cursor-pointer text-gray-700 hover:text-gray-900 hover:underline underline-offset-4'
        >
          <AiOutlineFileSearch className='h-5 w-5' />
          <h1 className='text-sm md:text-base'>view file</h1>
        </div>
      </div>
      <FileSummaryTable tableData={selectedFile?.tableData} />
      <Modal
        isOpen={isModalOpen}
        onClose={toggleModal}
        fileName={selectedFile?.name}
      >
        <div className='flex flex-col justify-center items-center'>
          {isLoading && !initialLoadComplete ? (
            <ColorRing
              visible={true}
              height='40'
              width='40'
              ariaLabel='color-ring-loading'
              wrapperStyle={{}}
              wrapperClass='color-ring-wrapper'
              colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
            />
          ) : (
            <div className='flex justify-center items-center space-x-4 my-2 px-3 py-1 rounded-md '>
              <span>
                Page {currentPage} of {numPages}
              </span>
              <div className='h-5 w-0.5 bg-gray-500'></div>
              <div className='flex justify-center items-center space-x-3'>
                <div
                  onClick={() =>
                    setScale(prevScale => Math.max(prevScale - 0.15, 0.5))
                  }
                  className='flex justify-center items-center cursor-pointer text-black'
                >
                  <FaMinus className='h-4 w-4' />
                </div>
                <div>{scaleToPercentage(scale)}</div>
                <div
                  onClick={() =>
                    setScale(prevScale => Math.min(prevScale + 0.15, 3))
                  }
                  className='flex justify-center items-center cursor-pointer'
                >
                  <FaPlus className='h-4 w-4' />
                </div>
                <div
                  className='bg-blue-300 px-3 py-0.5 rounded-md text-sm cursor-pointer hover:bg-blue-200'
                  onClick={resetScale}
                >
                  <p>RESET</p>
                </div>
              </div>
            </div>
          )}
          <div
            ref={canvasRef}
            className='w-full max-h-[75vh] overflow-auto'
          ></div>
        </div>
      </Modal>
    </div>
  )
}

export default FileSummary
