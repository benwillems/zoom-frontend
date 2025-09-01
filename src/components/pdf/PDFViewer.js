import React, { useEffect, useRef, useState } from 'react'
import PDFToolbar from './PDFToolbar'
import { motion, AnimatePresence } from 'framer-motion'

export default function PDFViewer({
  referenceViewer,
  setReferenceViewer,
  url,
  start,
  end,
  pageNumber,
  setPageNumber,
}) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [numPages, setNumPages] = useState(0)

  const pageRefs = useRef([])

  useEffect(() => {
    ;(async function () {
      if (url) {
        const pdfJS = await import('pdfjs-dist/build/pdf')
        pdfJS.GlobalWorkerOptions.workerSrc =
          window.location.origin + '/pdf.worker.min.js'

        const pdf = await pdfJS.getDocument(url).promise

        // Empty the container
        await new Promise(resolve => {
          while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild)
          }
          resolve()
        })

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum)

          // Calculate the scale for this page to match the target width
          const targetWidth = 612
          const pageSpecificScale =
            targetWidth / page.getViewport({ scale: 1 }).width

          const viewport = page.getViewport({ scale: pageSpecificScale })

          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          canvas.height = viewport.height
          canvas.width = viewport.width

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          }
          await page.render(renderContext)

          const pageDiv = document.createElement('div')
          pageDiv.style.position = 'relative'
          pageDiv.style.margin = '10px 0'
          pageDiv.style.boxShadow = '0 5px 6px rgba(0, 0, 0, 0.3)'
          pageDiv.style.borderRadius = '10px'

          const textLayerDiv = document.createElement('div')
          textLayerDiv.style.position = 'absolute'
          textLayerDiv.style.left = '0'
          textLayerDiv.style.top = '0'
          textLayerDiv.style.height = `${canvas.height}px`
          textLayerDiv.style.width = `${canvas.width}px`

          pageDiv.appendChild(canvas)
          pageDiv.appendChild(textLayerDiv)

          containerRef?.current?.appendChild(pageDiv)
          pageRefs.current[pageNum - 1] = pageDiv

          if (pageNum === pageNumber) {
            const textContent = await page.getTextContent()

            let minTop = Infinity
            let maxTop = -Infinity
            let minLeft = Infinity
            let maxLeft = -Infinity
            for (let i = 0; i < textContent.items.length; i++) {
              if (i >= start && i < end) {
                let item = textContent.items[i]

                // Convert PDF y-coordinates to CSS y-coordinates
                const itemTop =
                  viewport.height - item.transform[5] - item.height

                minTop = Math.min(minTop, itemTop)
                maxTop = Math.max(maxTop, itemTop + item.height)
                minLeft = Math.min(minLeft, item.transform[4])
                maxLeft = Math.max(maxLeft, item.transform[4] + item.width)
              }
            }

            if (minTop !== Infinity && maxTop !== -Infinity) {
              const div = document.createElement('div')
              div.style.position = 'absolute'
              div.style.left = `${minLeft}px`
              div.style.top = `${minTop}px`
              div.style.height = `${maxTop - minTop}px`
              div.style.width = `${maxLeft - minLeft}px`
              div.style.opacity = '0.2'
              div.style.backgroundColor = 'green'
              // div.style.padding = '20px'
              textLayerDiv.appendChild(div)
            }
          }
        }

        setNumPages(pdf.numPages)

        // Scroll to the currentPage
        if (pageRefs.current[pageNumber - 1]) {
          pageRefs.current[pageNumber - 1].scrollIntoView({
            behavior: 'smooth',
          })
        }
      }
    })()
  }, [url, start, end, pageNumber, scale])

  return (
    <AnimatePresence>
      {referenceViewer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className='ml-auto mr-auto'
        >
          <PDFToolbar
            setReferenceViewer={setReferenceViewer}
            setScale={setScale}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            numPages={numPages}
            scale={scale}
          />
          <div ref={containerRef} className='h-[90vh] w-full overflow-auto' />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
