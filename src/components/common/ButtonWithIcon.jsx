import { Loader2 } from 'lucide-react'
import React from 'react'

/**
 * A reusable button component with icon support, loading states, and various styling options
 *
 * @component
 * @example
 * // Basic usage
 * import { Plus } from 'lucide-react'
 *
 * function ParentComponent() {
 *   const handleClick = () => {
 *     console.log('Button clicked')
 *   }
 *
 *   return (
 *     <ButtonWithIcon
 *       icon={Plus}
 *       buttonText="Add Item"
 *       onClick={handleClick}
 *     />
 *   )
 * }
 *
 * @example
 * // With loading state
 * function LoadingExample() {
 *   const [loading, setLoading] = useState(false)
 *
 *   const handleSubmit = async () => {
 *     setLoading(true)
 *     try {
 *       await submitData()
 *     } finally {
 *       setLoading(false)
 *     }
 *   }
 *
 *   return (
 *     <ButtonWithIcon
 *       icon={Save}
 *       buttonText="Save Changes"
 *       onClick={handleSubmit}
 *       loading={loading}
 *       loadingText="Saving..."
 *       variant="primary"
 *       size="medium"
 *     />
 *   )
 * }
 *
 * @param {Object} props - Component props
 * @param {Component} props.icon - Lucide icon component
 * @param {string} props.buttonText - Text to display on the button
 * @param {Function} props.onClick - Click handler function
 * @param {'xs' | 'small' | 'medium' | 'large'} [props.size='medium'] - Button size variant
 * @param {'primary' | 'secondary' | 'outline'} [props.variant='primary'] - Button style variant
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.loading=false] - Whether to show loading state
 * @param {string} [props.loadingText] - Text to display during loading state
 *
 * @returns {React.ReactElement} Button component
 *
 * @cssClasses
 * - xs: 'px-3 py-1.5 text-xs'
 * - small: 'px-3 py-1.5 text-sm'
 * - medium: 'px-4 py-2 text-base'
 * - large: 'px-6 py-3 text-lg'
 *
 * @variants
 * - primary: Blue background with white text
 * - secondary: Gray background with white text
 * - outline: Blue border with blue text
 */

const ButtonWithIcon = ({
  icon: Icon, // Expects a Lucide icon component
  buttonText,
  onClick,
  size = 'medium', // Available sizes: 'small', 'medium', 'large'
  variant = 'primary', // Available variants: 'primary', 'secondary', 'outline'
  disabled = false,
  className = '',
  loading,
  loadingText,
}) => {
  // Size classes mapping
  const sizeClasses = {
    xs: 'px-3 py-1.5 text-xs',
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  }

  // Icon size mapping
  const iconSizes = {
    xs: 16,
    small: 20,
    medium: 24,
    large: 28,
  }

  // Variant classes mapping
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  }

  // Base classes that apply to all buttons
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className='size-6 animate-spin' />
      ) : (
        Icon && <Icon size={iconSizes[size]} />
      )}
      {loading ? loadingText : buttonText}
    </button>
  )
}

export default ButtonWithIcon
