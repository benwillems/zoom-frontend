// const InputWithLabel = ({
//   labelText,
//   name,
//   onChange,
//   value,
//   required = false,
//   type = 'text',
//   placeholder = '',
//   error = '',
//   disabled = false,
//   className = '',
//   inputClassName = '',
//   labelClassName = '',
// }) => {
//   const inputId = labelText.toLowerCase().replace(/\s+/g, '-') // Keep this for id only

//   return (
//     <div className={`flex flex-col space-y-1 ${className}`}>
//       <label
//         htmlFor={inputId}
//         className={`block text-base font-medium text-gray-800 ${
//           required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''
//         } ${labelClassName}`}
//       >
//         {labelText}
//       </label>

//       <input
//         type={type}
//         name={name}
//         id={inputId} // Keep using inputId for the id attribute
//         value={value}
//         onChange={onChange}
//         required={required}
//         placeholder={placeholder}
//         disabled={disabled}
//         className={`
//           mt-1 block w-full px-2 py-1.5
//           border border-gray-300 rounded-md shadow-sm 
//           focus:outline-none focus:ring-blue-300 focus:border-blue-300
//           disabled:bg-gray-100 disabled:cursor-not-allowed
//           ${
//             error
//               ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
//               : ''
//           }
//           ${inputClassName}
//         `}
//       />

//       {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
//     </div>
//   )
// }

// export default InputWithLabel




import React from 'react'

const InputWithLabel = ({
  labelText,
  name,
  onChange,
  value,
  required = false,
  type = 'text',
  placeholder = '',
  error = '',
  disabled = false,
  className = '',
  inputClassName = '',
  labelClassName = '',
}) => {
  const inputId = labelText.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <label
        htmlFor={inputId}
        className={`block text-base font-medium text-gray-800 ${
          required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''
        } ${labelClassName}`}
      >
        {labelText}
      </label>

      <input
        type={type}
        name={inputId}
        id={inputId}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          mt-1 block w-full px-2 py-1.5
          border border-gray-300 rounded-md shadow-sm 
          focus:outline-none focus:ring-blue-300 focus:border-blue-300
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : ''
          }
          ${inputClassName}
        `}
      />

      {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
    </div>
  )
}

export default InputWithLabel
