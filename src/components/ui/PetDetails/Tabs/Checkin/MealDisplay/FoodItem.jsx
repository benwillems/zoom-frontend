import React from 'react'

const FoodItem = ({ foodName, quantity, nutrientValue, selectedNutrient }) => {
  return (
    <div className='flex justify-between items-center'>
      <div className='flex items-center space-x-3'>
        <div>
          <p className='text-sm font-medium'>{foodName}</p>
          <p className='text-sm'>{quantity}</p>
        </div>
      </div>
      <div className='flex items-center'>
        <p>
          {nutrientValue} {selectedNutrient === 'calories' ? '' : 'g'}
        </p>
      </div>
    </div>
  )
}

export default FoodItem
