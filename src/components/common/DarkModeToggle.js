import React, { useEffect, useState } from 'react'
import { BsFillSunFill, BsFillMoonStarsFill } from 'react-icons/bs'

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const darkModePreference =
      window.localStorage.getItem('darkMode') === 'true'
    setDarkMode(darkModePreference)
    document.documentElement.classList.toggle('dark', darkModePreference)
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark', !darkMode)
    window.localStorage.setItem('darkMode', !darkMode)
  }

  return (
    <div
      className={`flex items-center w-12 justify-center transition duration-500 ease-in-out cursor-pointer ${
        darkMode
          ? 'bg-primary-white rounded-full p-2'
          : 'bg-zinc-500 rounded-full p-2'
      }`}
      onClick={toggleDarkMode}
    >
      {darkMode ? (
        <BsFillSunFill className={`text-zinc-600 text-lg shrink-0`} />
      ) : (
        <BsFillMoonStarsFill
          className={`text-primary-white text-lg shrink-0`}
        />
      )}
    </div>
  )
}

export default DarkModeToggle
