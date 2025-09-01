import React, { useEffect, useState } from 'react'
import Switch from 'react-switch'

const DefaultInput = ({ defaults, path, keyName, handleFieldChange }) => {
  const [isDefault, setIsDefault] = useState(false)
  const [defaultText, setDefaultText] = useState('')

  useEffect(() => {
    // This useEffect sets the initial state based on the defaults provided
    if (defaults?.objective && defaults.objective.hasOwnProperty(keyName)) {
      setIsDefault(true)
      setDefaultText(defaults.objective[keyName])
    } else {
      setIsDefault(false)
      setDefaultText('')
    }
  }, [defaults, keyName])

  const handleDefaultTextChange = e => {
    const newValue = e.target.value
    setDefaultText(newValue)
    if (isDefault) {
      // Only update the value if the switch is on
      handleFieldChange(`${path}.defaults.objective.${keyName}`, newValue)
    }
  }

  const handleSwitchChange = checked => {
    setIsDefault(checked)
    if (!checked) {
      // If the switch is being turned off, clear the default text and remove the field
      setDefaultText('')
      handleFieldChange(`${path}.defaults.objective.${keyName}`, undefined)
    } else {
      // If the switch is being turned on, set the default text to the current value
      handleFieldChange(`${path}.defaults.objective.${keyName}`, defaultText)
    }
  }

  return (
    <div className='flex mt-4'>
      <div className='flex items-center w-[220px] h-10'>
        <Switch
          checked={isDefault}
          onChange={handleSwitchChange}
          onColor='#86d3ff'
          onHandleColor='#2693e6'
          handleDiameter={20}
          uncheckedIcon={false}
          checkedIcon={false}
          boxShadow='0px 1px 5px rgba(0, 0, 0, 0.6)'
          activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
          height={15}
          width={40}
          className='react-switch'
        />
        <label className='ml-2'>Default</label>
      </div>
      {isDefault && (
        <div className='w-full md:flex-1'>
          <input
            type='text'
            value={defaultText}
            onChange={handleDefaultTextChange}
            placeholder={`Enter a default for "${keyName}"`}
            className='w-full md:w-2/3 rounded-md border-gray-300 p-2 resize-none outline outline-2 outline-gray-300 text-sm placeholder:text-gray-500'
            required
          />
        </div>
      )}
    </div>
  )
}

export default DefaultInput
