import React from 'react'

// Array of 10 different background colors
const bgColors = [
  'bg-red-400',
  'bg-blue-400',
  'bg-green-400',
  'bg-yellow-400',
  'bg-purple-400',
  'bg-pink-400',
  'bg-indigo-400',
  'bg-teal-400',
  'bg-orange-400',
  'bg-cyan-400',
]

const ProfileIcon = ({ name, size = 10 }) => {
  // Function to get a consistent color for a given name
  const getColorClass = name => {
    const index =
      name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      bgColors.length
    return bgColors[index]
  }

  return (
    <div className='flex-shrink-0'>
      <div
        className={`size-${size} rounded-full ${getColorClass(
          name
        )} flex items-center justify-center text-white font-bold`}
      >
        {name
          .split(' ')
          .map(n => n[0])
          .join('')}
      </div>
    </div>
  )
}

export default ProfileIcon
