import React, { useEffect, useState } from 'react'
import useNotificationStore from '@/store/useNotificationStore'
import { GrPowerReset } from 'react-icons/gr'
import { FaRegCheckCircle } from 'react-icons/fa'
import { debounce } from 'lodash'
import NoteTemplateDisplay from './NoteTemplateDisplay'
import { fetchWithAuth } from '@/utils/generalUtils'

const Template = ({ template, templateId }) => {
  const addNotification = useNotificationStore(state => state.addNotification)
  const [isEditing, setIsEditing] = useState(false)
  const [editedRecord, setEditedRecord] = useState(
    template?.notesTemplate || {}
  )
  const [order, setOrder] = useState(
    template?.notesTemplate?.notes?.order || {}
  )

  useEffect(() => {
    setEditedRecord(template?.notesTemplate)
    setOrder(template?.notesTemplate?.notes?.order)
  }, [template])

  const [lastMovedItem, setLastMovedItem] = useState({
    key: null,
    section: null,
  })

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = async () => {
    setIsEditing(false)
    await fetchWithAuth(`/api/template/${templateId}`)
      .then(response => response.json())
      .then(data => {
        setEditedRecord(data?.notesTemplate)
        setOrder(data?.notesTemplate?.notes?.order)
      })
  }

  const resetToDefault = async () => {
    try {
      const response = await fetchWithAuth('/api/reset-notes-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId: templateId }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok.')
      }

      const data = await response.json()
      console.log('Reset to default successful:', data)
      setEditedRecord(data)
      setOrder(data?.notes?.order || {})

      addNotification({
        iconColor: 'gray',
        header: `Template was reset to default`,
        icon: GrPowerReset,
        hideProgressBar: false,
      })
    } catch (error) {
      console.error('Failed to reset to default:', error)
    }
  }

  const saveChanges = async closeForm => {
    try {
      const updatedNotesTemplate = JSON.parse(
        JSON.stringify(editedRecord.notes)
      )

      // Iterate over the defaults object
      if (
        updatedNotesTemplate.defaults &&
        updatedNotesTemplate.defaults.objective
      ) {
        Object.entries(updatedNotesTemplate.defaults.objective).forEach(
          ([key, value]) => {
            if (value === '' || value === undefined) {
              // If the value is an empty string or undefined, remove the key from the defaults object
              delete updatedNotesTemplate.defaults.objective[key]
            }
          }
        )
      }

      updatedNotesTemplate.order = order

      const payload = {
        updatedNotesTemplate: updatedNotesTemplate,
        templateId: templateId,
      }

      const response = await fetchWithAuth('/api/update-notes-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok.')
      }

      const data = await response.json()
      console.log('Successfully saved:', data)
      if (closeForm) {
        setIsEditing(false)
        setLastMovedItem({
          key: null,
          section: null,
        })
        addNotification({
          iconColor: 'green',
          header: 'Note template was saved!',
          description: 'New notes will use the updated template.',
          icon: FaRegCheckCircle,
          hideProgressBar: false,
        })
      }
    } catch (error) {
      console.error('Failed to save changes:', error)
    }
  }

  const handleFieldChange = (path, value, rowIndex = null) => {
    setEditedRecord(currentRecord => {
      const updatedRecord = JSON.parse(JSON.stringify(currentRecord))
      const keys = path.split('.')
      let current = updatedRecord

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const isLastKey = i === keys.length - 1

        if (rowIndex !== null && !isNaN(rowIndex) && isLastKey) {
          current[key] = current[key] || []
          current[key][rowIndex] = current[key][rowIndex] || {}
          if (
            typeof current[key][rowIndex] === 'object' &&
            current[key][rowIndex] !== null
          ) {
            if (value === undefined) {
              delete current[key][rowIndex][key] // Adjusted for nested arrays and objects
            } else {
              current[key][rowIndex] = {
                ...current[key][rowIndex],
                [key]: value,
              }
            }
          } else {
            current[key][rowIndex] = value
          }
        } else if (isLastKey) {
          if (value === undefined) {
            delete current[key] // Key is deleted if value is undefined
          } else {
            current[key] = value
          }
        } else {
          if (!current[key] || typeof current[key] !== 'object') {
            current[key] = isNaN(keys[i + 1]) ? {} : []
          }
          current = current[key]
        }
      }

      return updatedRecord
    })
  }

  const debouncedMoveUp = debounce((key, keyName) => {
    setOrder(prevOrder => {
      const updatedOrder = { ...prevOrder }
      // Extract the section name from keyName
      const section = keyName.split('.').pop()
      const sectionOrder = updatedOrder[section] || []
      const index = sectionOrder.indexOf(key)
      if (index > 0) {
        // Swap the elements
        const temp = sectionOrder[index - 1]
        sectionOrder[index - 1] = key
        sectionOrder[index] = temp
      }
      // Update the section order in the updatedOrder object
      updatedOrder[section] = sectionOrder
      return updatedOrder
    })
    setLastMovedItem({ key, section: keyName.split('.').pop() })
  }, 400)

  const onMoveUp = (e, key, keyName) => {
    e.preventDefault()
    e.stopPropagation()
    debouncedMoveUp(key, keyName)
  }

  const debouncedMoveDown = debounce((key, keyName) => {
    setOrder(prevOrder => {
      const updatedOrder = { ...prevOrder }
      // Extract the section name from keyName
      const section = keyName.split('.').pop()
      const sectionOrder = updatedOrder[section] || []
      const index = sectionOrder.indexOf(key)
      if (index < sectionOrder.length - 1) {
        // Swap the elements
        const temp = sectionOrder[index + 1]
        sectionOrder[index + 1] = key
        sectionOrder[index] = temp
      }
      // Update the section order in the updatedOrder object
      updatedOrder[section] = sectionOrder
      return updatedOrder
    })
    setLastMovedItem({ key, section: keyName.split('.').pop() })
  }, 400)

  const onMoveDown = (e, key, keyName) => {
    e.preventDefault()
    e.stopPropagation()
    debouncedMoveDown(key, keyName)
  }

  return (
    <div className='card bg-gray-50 shadow-lg rounded-lg px-2 sm:p-6'>
      <div className='flex flex-col md:flex-row mb-6 justify-start items-start md:justify-between md:items-center'>
        <div>
          <h3 className='text-3xl font-bold text-gray-900'>Notes Template</h3>
          <p className='text-base text-gray-500'>
            Customize the template used for note generation.
          </p>
        </div>
        <div className='w-full md:w-auto'>
          {isEditing ? (
            <div className='flex md:block space-x-4 mt-3'>
              <button
                onClick={handleCancelEdit}
                className='w-full md:w-auto text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 font-medium rounded-md text-sm px-4 py-1.5 text-center'
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className='w-full md:w-auto text-black bg-blue-300 hover:bg-blue-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm px-4 py-1.5 text-center'
              >
                Save
              </button>
            </div>
          ) : (
            <div className='flex md:block space-x-4 mt-3'>
              <button
                onClick={handleEditClick}
                className='bg-blue-300 w-full md:w-auto hover:bg-blue-400 text-black font-medium rounded-md text-sm px-4 py-1.5'
              >
                Edit
              </button>
              <button
                onClick={resetToDefault}
                className='bg-red-300 w-full md:w-auto hover:bg-red-400 text-black font-medium rounded-md text-sm px-4 py-1.5'
              >
                Reset to Default
              </button>
            </div>
          )}
        </div>
      </div>
      {template &&
        template?.notesTemplate &&
        Object.keys(template?.notesTemplate).length > 0 && (
          <NoteTemplateDisplay
            editedRecord={editedRecord}
            setEditedRecord={setEditedRecord}
            isEditing={isEditing}
            handleFieldChange={handleFieldChange}
            saveChanges={saveChanges}
            order={order}
            setOrder={setOrder}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            lastMovedItem={lastMovedItem}
          />
        )}
    </div>
  )
}

export default Template
