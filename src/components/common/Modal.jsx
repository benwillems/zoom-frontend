import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const Modal = ({
  isOpen,
  onClose,
  icon: Icon,
  title,
  children,
  size = 'medium', // 'small', 'medium', 'large'
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
}) => {
  const modalRef = useRef(null)

  // Handle ESC key press
  useEffect(() => {
    const handleEscapeKey = event => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [isOpen, onClose])

  // Handle click outside
  const handleOverlayClick = e => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  // Prevent scroll on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Size classes mapping
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
  }

  if (!isOpen) return null

  return (
    <div
      className='fixed inset-0 z-50 overflow-y-auto'
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
    >
      {/* Overlay */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={handleOverlayClick}
      />

      {/* Modal */}
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div
          ref={modalRef}
          className={`
            relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all
            w-full ${sizeClasses[size]} ${className}
          `}
        >
          {/* Header */}
          <div className='border-b border-gray-200 px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                {Icon && <Icon className='size-6' />}
                <h3
                  className='text-lg font-medium text-gray-900'
                  id='modal-title'
                >
                  {title}
                </h3>
              </div>
              {showCloseButton && (
                <button
                  type='button'
                  className='text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  onClick={onClose}
                  aria-label='Close modal'
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className='px-6 py-5'>{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Modal
