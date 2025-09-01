import React, { useState } from 'react'
import jsPDF from 'jspdf'

export default function PetRecordsDisplay({ record, pet, fetchAppointments }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedRecord, setEditedRecord] = useState({ ...record })
  const [originalRecord, setOriginalRecord] = useState(null)
  const [copySuccess, setCopySuccess] = useState('')

  const downloadPdf = () => {
    const doc = new jsPDF()

    const recordDate = new Date(record.date)
    const formattedDate = recordDate.toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    // Initial setup
    doc.setFont('helvetica')
    doc.setFontSize(12)
    let currentY = 10 // Starting Y position for the first section

    const pageHeight = doc.internal.pageSize.height // Get the height of the page
    const lineHeight = 6.5 // Adjust based on your font size and styling

    // Function to add a new page if needed
    const addNewPageIfNeeded = contentHeight => {
      if (currentY + contentHeight >= pageHeight) {
        doc.addPage()
        currentY = 10 // Reset Y position to the top of the new page
      }
    }

    // Adjusted addSection function to include page checking
    const addSection = (title, content) => {
      doc.setFont('helvetica', 'bold')
      addNewPageIfNeeded(lineHeight) // Check if a new page is needed for the title
      doc.text(title, 10, currentY)
      currentY += 7

      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(content, 180)
      addNewPageIfNeeded(lines.length * lineHeight) // Check if a new page is needed for the content
      doc.text(lines, 10, currentY)
      currentY += lines.length * lineHeight + 5 // Adjust space after section
    }

    // Headers
    doc.setFont('helvetica', 'bold')
    addNewPageIfNeeded(lineHeight * 3) // Check space for 3 header lines
    doc.text(`Pet Name: ${pet.name}`, 10, currentY)
    currentY += lineHeight
    doc.text(`Pet Parent Name: ${pet.client.name}`, 10, currentY)
    currentY += lineHeight
    doc.text(`Date: ${formattedDate}`, 10, currentY)
    currentY += lineHeight * 2 // Extra space before starting sections

    // Add sections...
    if (record.notes.summary) addSection('Summary', record.notes.summary)
    if (record.notes.subjective)
      addSection('Subjective', record.notes.subjective)

    // Physical Exam with each key-value on a new line
    if (
      record.notes.physical_exam &&
      Object.keys(record.notes.physical_exam).length > 0
    ) {
      const physicalExamDetails = Object.entries(record.notes.physical_exam)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
      addSection('Physical Exam', physicalExamDetails)
    }

    // Repeat the process for each section...
    if (record.notes.objective) addSection('Objective', record.notes.objective)
    if (record.notes.assessment)
      addSection('Assessment', record.notes.assessment)
    if (record.notes.plan) addSection('Plan', record.notes.plan)

    // For Tests and Vaccinations, join items with a semicolon and start each on a new line
    if (record.notes.tests && record.notes.tests.length > 0) {
      const testResults = record.notes.tests
        .map(
          test =>
            `Test: ${test.name}, Purpose: ${test.purpose}, Insights: ${test.insights}`
        )
        .join('\n')
      addSection('Tests', testResults)
    }

    if (record.notes.vaccinations && record.notes.vaccinations.length > 0) {
      const vaccinations = record.notes.vaccinations
        .map(
          vaccination =>
            `Vaccination: ${vaccination.name}, Administered: ${vaccination.administeredDate}`
        )
        .join('\n')
      addSection('Vaccinations', vaccinations)
    }

    if (record.notes.client_communications) {
      addSection('Client Communications', record.notes.client_communications)
    }

    // Save the PDF with a dynamic name based on pet's name and current date
    doc.save(
      `Pet-Record-${pet.name}-${new Date(record.date).toLocaleDateString()}.pdf`
    )
  }

  const copyDetailsToClipboard = async () => {
    let details = []

    if (record.notes.summary) details.push(`Summary: ${record.notes.summary}`)

    if (record.notes.subjective) {
      details.push(`Subjective:\n${record.notes.subjective}`)
    }

    if (
      record.notes.physical_exam &&
      Object.keys(record.notes.physical_exam).length > 0
    ) {
      const physicalExamDetails = Object.entries(record.notes.physical_exam)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
      details.push(`Physical Exam:\n${physicalExamDetails}`)
    }

    if (record.notes.objective) {
      details.push(`Objective:\n${record.notes.objective}`)
    }

    if (record.notes.assessment) {
      details.push(`Assessment:\n${record.notes.assessment}`)
    }

    if (record.notes.plan) {
      details.push(`Plan:\n${record.notes.plan}`)
    }

    if (record.notes.plan && record.notes.plan.treatment)
      details.push(`Treatment Plan: ${record.notes.plan.treatment}`)
    if (record.notes.plan && record.notes.plan.medicines)
      details.push(`Medicines: ${record.notes.plan.medicines}`)

    if (record.notes.tests && record.notes.tests.length > 0) {
      const testResults = record.notes.tests
        .map(
          test =>
            `Name: ${test.name}, Purpose: ${test.purpose}, Insights: ${test.insights}`
        )
        .join('; ')
      details.push(`Test Results: ${testResults}`)
    }

    if (record.notes.vaccinations && record.notes.vaccinations.length > 0) {
      const vaccinations = record.notes.vaccinations
        .map(
          vaccination =>
            `Administered Date: ${vaccination.administeredDate}, Vaccination Name: ${vaccination.name}`
        )
        .join('; ')
      details.push(`Vaccinations: ${vaccinations}`)
    }

    if (record.notes.client_communications) {
      details.push(
        `Client Communication:\n${record.notes.client_communications}`
      )
    }

    const recordDetails = details.join('\n\n') // Use double newline for clearer separation between sections

    try {
      await navigator.clipboard.writeText(recordDetails)
      setCopySuccess('Details copied to clipboard!')
      setTimeout(() => setCopySuccess(''), 3000) // Reset the message after 3 seconds
    } catch (error) {
      console.error('Failed to copy details:', error)
      setCopySuccess('Failed to copy details. Please try again.')
      setTimeout(() => setCopySuccess(''), 3000) // Reset the message after 3 seconds
    }
  }

  const handleEditClick = e => {
    e.stopPropagation() // Prevents the click event from propagating to parent elements
    setOriginalRecord({ ...record })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setEditedRecord({ ...originalRecord }) // Revert changes
    setIsEditing(false)
  }

  const handleFieldChange = (path, value, rowIndex = null) => {
    setEditedRecord(currentRecord => {
      // Deep clone to avoid direct state mutation
      const updatedRecord = JSON.parse(JSON.stringify(currentRecord))

      // Split the path and initialize the current reference to the root of the record
      const keys = path.split('.')
      let current = updatedRecord

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const isLastKey = i === keys.length - 1

        if (rowIndex !== null && !isNaN(rowIndex) && isLastKey) {
          // If we're updating an array item, ensure the array exists
          current[key] = current[key] || []
          // Ensure the specific item in the array exists
          current[key][rowIndex] = current[key][rowIndex] || {}
          // Update the item's property with the new value
          if (
            typeof current[key][rowIndex] === 'object' &&
            current[key][rowIndex] !== null
          ) {
            // Update the item's property with the new value if it is an object
            current[key][rowIndex] = {
              ...current[key][rowIndex],
              [key]: value,
            }
          } else {
            // Set the value directly if the current item is not an object
            current[key][rowIndex] = value
          }
        } else if (isLastKey) {
          // If it's the last key, update the value directly
          current[key] = value
        } else {
          // If it's not the last key, traverse deeper, ensuring objects/arrays exist
          if (!current[key] || typeof current[key] !== 'object') {
            current[key] = isNaN(keys[i + 1]) ? {} : []
          }
          current = current[key]
        }
      }

      return updatedRecord
    })
  }

  const markAppointmentAsDeleted = async () => {
    try {
      const response = await fetch(`/api/appointment/delete`, {
        method: 'POST', // Assuming the DELETE method is used for marking an appointment as deleted
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: record.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok.')
      }

      const data = await response.json()
      console.log('Appointment marked as deleted:', data)

      // Optionally, fetch updated appointments list
      fetchAppointments(pet.id)
    } catch (error) {
      console.error('Failed to mark appointment as deleted:', error)
    }
  }

  const saveChanges = async () => {
    try {
      const payload = {
        updatedNotes: editedRecord.notes, // Assuming this is the part of the state you want to update
        appointmentId: record.id,
      }
      const response = await fetch('/api/update-appointment-notes', {
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
      fetchAppointments(pet.id)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save changes:', error)
    }
  }

  const renderField = (value, path) => {
    if (isEditing) {
      if (Array.isArray(value)) {
        // Handle array values for editing
        return (
          <ul>
            {value.map((item, index) => (
              <li key={index}>
                <textarea
                  value={item}
                  onChange={e =>
                    handleFieldChange(`${path}`, e.target.value, index)
                  }
                  className='w-full rounded-md border-gray-300 p-2'
                  rows='1'
                  style={{ resize: 'vertical' }}
                />
              </li>
            ))}
          </ul>
        )
      } else if (typeof value === 'object') {
        // Handle object values for editing
        return (
          <div>
            {Object.entries(value).map(([key, val], index) => (
              <div key={index} className='mb-2'>
                <label className='block text-sm font-medium text-gray-700 font-bold'>
                  {key}
                </label>
                <input
                  type='text'
                  value={val}
                  onChange={e =>
                    handleFieldChange(`${path}.${key}`, e.target.value)
                  }
                  className='mt-1 block w-full rounded-md border-gray-300 p-2'
                />
              </div>
            ))}
          </div>
        )
      } else {
        // Handle scalar values for editing
        return (
          <textarea
            value={value}
            onChange={e => handleFieldChange(path, e.target.value)}
            className='w-full min-h-[4rem] rounded-md border-gray-300 p-2'
            rows='3'
            style={{ resize: 'vertical' }}
          />
        )
      }
    } else {
      if (Array.isArray(value)) {
        // Display array values as bullet points when not editing
        return (
          <ul className='list-disc pl-5'>
            {value.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )
      } else if (typeof value === 'object') {
        // Display object values in a list when not editing
        return (
          <dl className='mt-1 text-sm leading-6 text-gray-700'>
            {Object.entries(value).map(([key, val], index) => (
              <div key={index} className='flex items-center justify-between'>
                <dt style={{ fontWeight: 'bold' }}>{key}:</dt>
                <dd className='ml-2'>
                  <pre className='pre-wrap'>{val}</pre>
                </dd>
              </div>
            ))}
          </dl>
        )
      } else {
        // Display scalar values directly when not editing
        return (
          <dd className='mt-1 text-sm leading-6 text-gray-700'>
            <pre className='pre-wrap'>{value}</pre>
          </dd>
        )
      }
    }
  }

  const renderEditableTable = (section, columns, data) => {
    // Initialize an empty row if data is empty
    const editableData = data.length > 0 ? data : [{}]

    const addNewRow = () => {
      // Create a new row object with the correct structure
      const newRow = columns.reduce(
        (acc, col) => ({ ...acc, [col.toLowerCase()]: '' }),
        {}
      )

      setEditedRecord(prevRecord => {
        // Deep clone to avoid direct mutation
        const updatedRecord = JSON.parse(JSON.stringify(prevRecord))

        // Split the section path and reduce to find the nested section
        const sectionPath = section.split('.')
        const lastSectionKey = sectionPath.pop()
        const nestedSection = sectionPath.reduce(
          (acc, key) => (acc[key] = acc[key] || {}),
          updatedRecord
        )

        // Check if the last section already exists and is an array, if not, initialize it
        if (!Array.isArray(nestedSection[lastSectionKey])) {
          nestedSection[lastSectionKey] = []
        }

        // Add the new row to the nested section
        nestedSection[lastSectionKey].push(newRow)

        return updatedRecord
      })
    }

    return (
      <>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col}
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {editableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map(col => (
                  <td
                    key={col}
                    className='px-6 py-4 whitespace-normal text-sm text-gray-500'
                  >
                    {isEditing ? (
                      <input
                        type='text'
                        value={row[col.toLowerCase()] || ''}
                        onChange={e =>
                          handleFieldChange(
                            `${section}.${rowIndex}.${col.toLowerCase()}`,
                            e.target.value
                          )
                        }
                        className='w-full min-h-[2rem] rounded-md border-gray-300 p-2' // Adjust the min-height as needed
                      />
                    ) : (
                      row[col.toLowerCase()] || 'N/A' // Display 'N/A' or a similar placeholder if the value is undefined
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {isEditing && (
          <button
            onClick={addNewRow}
            className='mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700'
          >
            Add New Row
          </button>
        )}
      </>
    )
  }
  return (
    <div className='overflow-hidden bg-white shadow sm:rounded-lg'>
      <div className='px-4 py-6 sm:px-6'>
        <div className='flex justify-between items-center'>
          <h3 className='text-base font-semibold leading-7 text-gray-900'>
            Visit Information
          </h3>
          <div className='flex items-center'>
            <button
              onClick={copyDetailsToClipboard}
              className='px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-700'
            >
              Copy Details
            </button>
            <button
              onClick={downloadPdf}
              className='ml-4 px-4 py-2 font-semibold text-white bg-green-500 rounded hover:bg-green-700'
            >
              Download PDF
            </button>
          </div>
        </div>
        {copySuccess && (
          <div className='text-sm text-green-600'>{copySuccess}</div>
        )}{' '}
        {/* This line displays the confirmation message */}
      </div>
      <div className='border-t border-gray-100'>
        <dl className='divide-y divide-gray-100'>
          {editedRecord.notes.subjective && (
            <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-900'>Subjective</dt>
              {renderField(editedRecord.notes.subjective, 'notes.subjective')}
            </div>
          )}

          {editedRecord.notes.physical_exam && (
            <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-900'>
                Physical Exam
              </dt>
              {renderField(
                editedRecord.notes.physical_exam,
                'notes.physical_exam'
              )}
            </div>
          )}

          {editedRecord.notes.objective && (
            <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-900'>Objective</dt>
              {renderField(editedRecord.notes.objective, 'notes.objective')}
            </div>
          )}

          {editedRecord.notes.assessment && (
            <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-900'>Assessment</dt>
              {renderField(editedRecord.notes.assessment, 'notes.assessment')}
            </div>
          )}

          {editedRecord.notes.plan && (
            <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-900'>
                Treatment Plan
              </dt>
              {renderField(editedRecord.notes.plan, 'notes.plan')}
            </div>
          )}

          {editedRecord.notes.plan && editedRecord.notes.plan.treatment && (
            <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-900'>Treatment</dt>
              {renderField(
                editedRecord.notes.plan.treatment,
                'notes.plan.treatment'
              )}
            </div>
          )}
          {editedRecord.notes.plan && editedRecord.notes.plan.medicines && (
            <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-900'>Medicines</dt>
              {renderField(
                editedRecord.notes.plan.medicines,
                'notes.plan.medicines'
              )}
            </div>
          )}

          {editedRecord.notes.tests && editedRecord.notes.tests.length > 0 && (
            <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-900'>
                Test Results
              </dt>
              <dd className='mt-1 sm:col-span-2 sm:mt-0'>
                <div className='overflow-hidden border-t border-gray-200'>
                  {renderEditableTable(
                    'notes.tests',
                    ['Name', 'Purpose', 'Insights'],
                    editedRecord.notes.tests
                  )}
                </div>
              </dd>
            </div>
          )}

          {editedRecord.notes.vaccinations &&
            editedRecord.notes.vaccinations.length > 0 && (
              <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
                <dt className='text-sm font-medium text-gray-900'>
                  Vaccinations
                </dt>
                <dd className='mt-1 sm:col-span-2 sm:mt-0'>
                  <div className='overflow-hidden border-t border-gray-200'>
                    {renderEditableTable(
                      'notes.vaccinations',
                      ['Administered Date', 'Vaccination Name', 'Due Date'],
                      editedRecord.notes.vaccinations
                    )}
                  </div>
                </dd>
              </div>
            )}
          {editedRecord.notes.client_communications && (
            <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-900'>
                Client Communication
              </dt>
              {renderField(
                editedRecord.notes.client_communications,
                'notes.client_communications'
              )}
            </div>
          )}
        </dl>
      </div>
      <div className='flex justify-end p-4'>
        {isEditing ? (
          <>
            <button
              onClick={handleCancelEdit}
              className='px-4 py-2 mx-2 font-semibold text-white bg-gray-500 rounded hover:bg-gray-700'
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              className='px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-700'
            >
              Save
            </button>
          </>
        ) : (
          <>
            <button
              onClick={markAppointmentAsDeleted}
              className='px-4 py-2 mx-2 font-semibold text-white bg-red-500 rounded hover:bg-red-700'
            >
              Delete
            </button>
            <button
              onClick={handleEditClick}
              className='px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-700'
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  )
}
