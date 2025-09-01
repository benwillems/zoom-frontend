import React, { useState } from 'react'
import Meal from './Meal'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'

const DailyMeals = ({ dayData }) => {
  const [selectedNutrient, setSelectedNutrient] = useState('calories')
  const toggleNutrient = () => {
    const nutrients = ['calories', 'fat', 'carbohydrates', 'protein']
    const currentIndex = nutrients.indexOf(selectedNutrient)
    const nextIndex = (currentIndex + 1) % nutrients.length
    setSelectedNutrient(nutrients[nextIndex])
  }

  const totalMacros = dayData?.data?.checkInSummary?.totalMacros || {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
  }

  const getNutrientDisplayName = nutrient => {
    switch (nutrient) {
      case 'carbohydrates':
        return 'Carbs'
      case 'fat':
        return 'Fat'
      case 'protein':
        return 'Protein'
      case 'calories':
        return 'Calories'
      default:
        return nutrient
    }
  }

  const sortMeals = (a, b) => {
    const order = ['breakfast', 'lunch', 'dinner']
    return order.indexOf(a[0]) - order.indexOf(b[0])
  }

  const meals = dayData?.data?.checkInSummary?.meals || {}

  return (
    <>
      <div className='flex w-full justify-between items-center p-4 bg-blue-100 rounded-t-lg h-[5.25rem]'>
        <h2 className='flex text-sm xs:text-base md:text-xl font-bold'>
          <p className='pr-1.5'>
            Total {getNutrientDisplayName(selectedNutrient)}:
          </p>
          <span className='text-blue-600'>
            {selectedNutrient === 'calories'
              ? totalMacros.calories
              : totalMacros[selectedNutrient] + ' grams'}
          </span>
        </h2>
        <div className='flex items-center space-x-2'>
          <FaAngleLeft
            className='cursor-pointer size-4 xs:size-5'
            onClick={toggleNutrient}
          />
          <FaAngleRight
            className='cursor-pointer size-4 xs:size-5'
            onClick={toggleNutrient}
          />
        </div>
      </div>
      <div className='flex-grow flex flex-col h-96 overflow-y-auto hide-scrollbar w-full p-4 select-none'>
        {Object.entries(meals)
          .sort(sortMeals)
          .map(([mealCategory, foods]) => (
            <Meal
              key={mealCategory}
              mealCategory={mealCategory}
              foods={foods || []}
              selectedNutrient={selectedNutrient}
            />
          ))}
      </div>
    </>
  )
}

export default DailyMeals
