import React, { useState } from 'react'
import ReactTextareaAutosize from 'react-textarea-autosize'
import Alert from '../ui/common/Alert'
import { MdWarning } from 'react-icons/md'
import KeyValueFields from './KeyValueFields' // Assuming this is the correct path
import useAudioStore from '@/store/useAudioStore'

export default function NoteTemplateDisplay({
  isEditing,
  editedRecord,
  handleFieldChange,
  setEditedRecord,
  saveChanges,
  order,
  setOrder,
  onMoveUp,
  onMoveDown,
  lastMovedItem,
}) {
  const [showAlert, setShowAlert] = useState(false)
  const [deletingKey, setDeletingKey] = useState({ key: null, path: null })
  const isOngoingAppointment = useAudioStore(
    state => state.isOngoingAppointment
  )

  function cleanKeyForUI(key) {
    // Replace any special characters with a space, trim, and capitalize first letter of each word
    return key
      .replaceAll(/[^a-zA-Z0-9 ]/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  function formatKeyForBackend(key) {
    // Convert to lowercase, replace spaces with underscores, remove invalid characters,
    // and finally remove trailing underscores if they exist.
    return key
      .toLowerCase()
      .replaceAll(/\s+/g, '_')
      .replaceAll(/[^a-z0-9_]/g, '')
      .replace(/_+$/, '') // This removes trailing underscores
  }

  // Handle changes in key names for key/value pairs
  const handleKeyChange = (oldKey, newKey, newValue, path) => {
    const formattedNewKey = formatKeyForBackend(newKey)

    if (formattedNewKey !== oldKey) {
      // First, update the data
      setEditedRecord(currentRecord => {
        let updatedRecord = JSON.parse(JSON.stringify(currentRecord))
        let nestedData = path
          .split('.')
          .reduce((acc, cur) => acc[cur], updatedRecord)

        // Replace the old key with the new key in the data
        delete nestedData[oldKey]
        nestedData[formattedNewKey] = newValue

        // If there's a default associated with the oldKey, update it too
        if (
          updatedRecord.notes.defaults &&
          updatedRecord.notes.defaults.objective &&
          updatedRecord.notes.defaults.objective.hasOwnProperty(oldKey)
        ) {
          updatedRecord.notes.defaults.objective[formattedNewKey] =
            updatedRecord.notes.defaults.objective[oldKey]
          delete updatedRecord.notes.defaults.objective[oldKey]
        }

        return updatedRecord
      })

      // Then, update the order separately to reflect this key change
      setOrder(prevOrder => {
        const updatedOrder = { ...prevOrder }
        const section = path.split('.').pop()
        if (updatedOrder[section]) {
          const index = updatedOrder[section].indexOf(oldKey)
          if (index !== -1) {
            updatedOrder[section] = [
              ...updatedOrder[section].slice(0, index),
              formattedNewKey,
              ...updatedOrder[section].slice(index + 1),
            ]
          }
        }
        return updatedOrder
      })
    } else {
      // If the key name hasn't changed, just update the value.
      setEditedRecord(currentRecord => {
        let updatedRecord = JSON.parse(JSON.stringify(currentRecord))
        let nestedData = path
          .split('.')
          .reduce((acc, cur) => acc[cur], updatedRecord)
        nestedData[oldKey] = newValue
        return updatedRecord
      })
    }
  }

  const addNewKeyValuePair = path => {
    // Determine the section first
    const section = path.split('.').pop()

    // Access the current state directly; careful, as this can be stale in async operations
    const currentNestedData = path
      .split('.')
      .reduce((acc, cur) => acc[cur], editedRecord)

    // Now generate the new key
    let newKeyBase = `Field`
    let counter = Object.keys(currentNestedData).length + 1 // Starting counter
    let newKey = `${newKeyBase} ${counter}`
    while (newKey in currentNestedData) {
      counter++
      newKey = `${newKeyBase} ${counter}` // Ensure the new key is unique
    }

    // Now that we have a consistent newKey, proceed with state updates
    setEditedRecord(currentRecord => {
      const updatedRecord = JSON.parse(JSON.stringify(currentRecord)) // Deep copy
      let nestedData = path
        .split('.')
        .reduce((acc, cur) => acc[cur], updatedRecord)
      nestedData[newKey] = '' // Initialize with an empty string
      return updatedRecord
    })

    // Update the order with the new key if the section exists
    if (order[section]) {
      setOrder(prevOrder => {
        const updatedOrder = { ...prevOrder }
        updatedOrder[section] = [...(updatedOrder[section] || []), newKey] // Append new key
        return updatedOrder
      })
    }
  }

  // Function to request deletion of a key/value pair
  const deleteKeyValuePair = (key, path) => {
    setDeletingKey({ key, path })
    setShowAlert(true)
  }

  // Now, modify your confirmation process for deletion to include saving
  const confirmDeleteKeyValuePair = async () => {
    setEditedRecord(currentRecord => {
      const updatedRecord = { ...currentRecord }
      let nestedData = deletingKey.path
        .split('.')
        .reduce((acc, cur) => acc[cur], updatedRecord)

      delete nestedData[deletingKey.key]
      return updatedRecord
    })

    setOrder(prevOrder => {
      const updatedOrder = { ...prevOrder }
      let section = deletingKey.path.split('.').pop()
      if (updatedOrder[section]) {
        updatedOrder[section] = updatedOrder[section].filter(
          key => key !== deletingKey.key
        )
      }
      return updatedOrder
    })

    setShowAlert(false)
    await saveChanges(false)
  }

  // Dynamically render fields based on their data type
  const renderField = (key, value, path, defaults) => {
    let keyName = key
    if (typeof value === 'object') {
      return (
        <KeyValueFields
          defaults={defaults}
          data={value}
          isEditing={isEditing}
          path={path}
          keyName={keyName}
          handleFieldChange={handleFieldChange}
          handleKeyChange={handleKeyChange}
          addNewKeyValuePair={addNewKeyValuePair}
          deleteKeyValuePair={deleteKeyValuePair}
          cleanKeyForUI={cleanKeyForUI}
          order={order}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          lastMovedItem={lastMovedItem}
        />
      )
    } else {
      // Render as text area if the value is a string
      return isEditing ? (
        <ReactTextareaAutosize
          value={value}
          onChange={e => handleFieldChange(path, e.target.value)}
          className='w-full rounded-md border-gray-300 p-2 resize-none hide-scrollbar outline outline-2 outline-blue-300 text-sm'
          autoComplete='off'
        />
      ) : (
        <div className='text-sm leading-6 text-gray-700'>{value}</div>
      )
    }
  }

  return (
    <div
      className={`overflow-hidden bg-white shadow sm:rounded-lg ${
        isOngoingAppointment() ? 'mb-24' : ''
      }`}
    >
      <div className='border-t border-gray-100'>
        <dl className='divide-y divide-gray-100'>
          {/* Dynamically create fields for notes */}
          {Object.entries(editedRecord?.notes || {}).map(
            ([key, value]) =>
              key != 'defaults' &&
              key !== 'order' && (
                <div key={key} className='px-4 py-6 sm:px-6 w-full lg:w-4/5'>
                  <div className='text-xl font-bold text-gray-900 mb-3 lg:mb-2'>
                    {cleanKeyForUI(key)}
                  </div>
                  <div className='mt-1 text-sm text-gray-900 sm:col-span-2'>
                    {renderField(
                      `notes.${key}`,
                      value,
                      `notes.${key}`,
                      editedRecord?.notes?.defaults
                        ? editedRecord?.notes?.defaults
                        : null
                    )}
                  </div>
                </div>
              )
          )}
        </dl>
      </div>
      {showAlert && (
        <Alert
          title={`Delete field: ${cleanKeyForUI(deletingKey.key)}?`}
          message={`Are you sure you want to delete "${cleanKeyForUI(
            deletingKey.key
          )}"? This action cannot be undone.`}
          onCancel={() => setShowAlert(false)}
          onConfirm={confirmDeleteKeyValuePair}
          buttonActionText='Delete'
          Icon={MdWarning}
        />
      )}
    </div>
  )
}
