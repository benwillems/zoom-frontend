// import { useRef, useEffect } from 'react'

// const MoreActions = ({ tableActions, width, isOpen, onOpen, onClose }) => {
//   const dropdownRef = useRef(null)

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     if (!isOpen) return

//     const handleClickOutside = event => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         onClose()
//       }
//     }

//     document.addEventListener('mousedown', handleClickOutside)
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside)
//     }
//   }, [isOpen, onClose])

//   const handleMoreActionsClick = e => {
//     e.stopPropagation()
//     if (isOpen) {
//       onClose()
//     } else {
//       onOpen()
//     }
//   }

//   const handleActionClick = (e, action) => {
//     e.stopPropagation()
//     action.onClick()
//     onClose()
//   }

//   const handleMouseLeave = () => {
//     onClose()
//   }

//   return (
//     <div className='relative inline-block' ref={dropdownRef}>
//       <button
//         className='text-gray-500 hover:text-gray-700 focus:outline-none'
//         onClick={handleMoreActionsClick}
//       >
//         <svg
//           xmlns='http://www.w3.org/2000/svg'
//           className='h-6 w-6 text-black'
//           fill='none'
//           viewBox='0 0 24 24'
//           stroke='currentColor'
//         >
//           <path
//             strokeLinecap='round'
//             strokeLinejoin='round'
//             strokeWidth={2}
//             d='M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z'
//           />
//         </svg>
//       </button>
//       <div
//         className={`absolute right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 ${
//           isOpen ? 'block' : 'hidden'
//         } ${width ? `w-${width}` : ''}`}
//         onMouseLeave={handleMouseLeave}
//       >
//         {tableActions.map((action, index) => (
//           <div
//             key={index}
//             className='flex items-center px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
//             onClick={e => handleActionClick(e, action)}
//           >
//             {action.icon && (
//               <span className='inline-block mr-2'>{action.icon}</span>
//             )}
//             {action.label}
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default MoreActions






import { useRef, useEffect } from 'react'

const MoreActions = ({ tableActions, width, isOpen, onOpen, onClose }) => {
  const dropdownRef = useRef(null)
  const menuRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Scroll dropdown into view when opened
  useEffect(() => {
    if (isOpen && menuRef.current) {
      menuRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isOpen])

  const handleMoreActionsClick = e => {
    e.stopPropagation()
    if (isOpen) {
      onClose()
    } else {
      onOpen()
    }
  }

  const handleActionClick = (e, action) => {
    e.stopPropagation()
    action.onClick()
    onClose()
  }

  const handleMouseLeave = () => {
    onClose()
  }

  return (
    <div className='relative inline-block' ref={dropdownRef}>
      <button
        className='text-gray-500 hover:text-gray-700 focus:outline-none'
        onClick={handleMoreActionsClick}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6 text-black'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z'
          />
        </svg>
      </button>
      <div
        ref={menuRef}
        className={`absolute right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 ${
          isOpen ? 'block' : 'hidden'
        } ${width ? `w-${width}` : ''}`}
        onMouseLeave={handleMouseLeave}
      >
        {tableActions.map((action, index) => (
          <div
            key={index}
            className='flex items-center px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
            onClick={e => handleActionClick(e, action)}
          >
            {action.icon && (
              <span className='inline-block mr-2'>{action.icon}</span>
            )}
            {action.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MoreActions