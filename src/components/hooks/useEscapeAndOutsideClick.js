// Hook to close forms or cards when user clicks off the form/card
// Create a ref inside your component, attach that ref to the container
// Then call this function with the ref and your onCancel function
import { useEffect } from 'react'

const useEscapeAndOutsideClick = (ref, onCancel, isActive = true) => {
  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    const handleClickOutside = event => {
      if (isActive && ref.current && !ref.current.contains(event.target)) {
        onCancel()
      }
    }

    // Use mousedown for detection, but don't interfere with click events
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside, { capture: true })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside, { capture: true })
    }
  }, [ref, onCancel, isActive])
}

export default useEscapeAndOutsideClick
