import React from 'react'
import FoodItem from './FoodItem'

const Meal = ({ mealCategory, foods, selectedNutrient }) => {
  const calculateTotalNutrients = () => {
    return (foods || []).reduce(
      (totals, food) => {
        const {
          calories = 0,
          protein = 0,
          carbohydrates = 0,
          fat = 0,
        } = food?.calorie_breakdown || {}
        totals.calories += Number(calories) || 0
        totals.protein += Number(protein) || 0
        totals.carbohydrates += Number(carbohydrates) || 0
        totals.fat += Number(fat) || 0
        return totals
      },
      { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
    )
  }

  const totalNutrients = calculateTotalNutrients()

  return (
    <div className='p-4 bg-blue-100 rounded-md space-y-2 my-2'>
      <h1 className='flex items-center font-bold text-base text-medium'>
        <p className='uppercase pr-1'>
          {mealCategory}: {totalNutrients[selectedNutrient]}
        </p>
        {selectedNutrient === 'calories' ? '' : 'grams'}
      </h1>
      {(foods || []).map((food, index) => (
        <FoodItem
          key={`${food?.food || 'unknown'}-${index}`}
          foodName={food?.food || 'Unknown Food'}
          quantity={food?.serving_size || 'N/A'}
          nutrientValue={food?.calorie_breakdown?.[selectedNutrient] || 0}
          selectedNutrient={selectedNutrient}
        />
      ))}
    </div>
  )
}

export default Meal
