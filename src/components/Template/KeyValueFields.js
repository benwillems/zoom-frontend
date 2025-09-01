import React from 'react'
import { MdDelete } from 'react-icons/md'
import ReactTextareaAutosize from 'react-textarea-autosize'
import DefaultInput from './DefaultInput'
import DisplayTooltip from '@/components/common/DisplayTooltip'
import { FaQuestion } from 'react-icons/fa'
import { nanoid } from 'nanoid'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'

const KeyValueFields = ({
  defaults,
  data,
  isEditing,
  path,
  keyName, // section from notes
  handleFieldChange,
  handleKeyChange,
  addNewKeyValuePair,
  deleteKeyValuePair,
  cleanKeyForUI,
  order,
  onMoveUp,
  onMoveDown,
  lastMovedItem,
}) => {
  if (keyName === 'notes.order') {
    return null // or any other fallback UI
  }

  const section = keyName.split('.').pop()
  const currentOrder =
    order && order.hasOwnProperty(section) ? order[section] : Object.keys(data)

  if (isEditing) {
    return (
      <div>
        {currentOrder.map((key, index) => {
          const isLastMovedItem = lastMovedItem.key === key
          const hasDefault = section === 'objective'

          let itemClasses = 'mb-6 relative '
          let messageClasses =
            'absolute bottom-0 right-0 mb-5 mr-4 px-3 py-2.5 text-xs font-bold rounded-md '

          // Different styling for last moved with item default
          if (isLastMovedItem && hasDefault) {
            itemClasses += 'bg-slate-100 p-4'
            messageClasses += 'bg-green-300'
          } else if (isLastMovedItem) {
            itemClasses += 'bg-slate-100 px-4 pt-4 pb-20'
            messageClasses += 'bg-green-300'
          }
          return (
            <div key={`${key} - ${index}`} className={itemClasses}>
              <div className='flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4'>
                <input
                  type='text'
                  defaultValue={cleanKeyForUI(key)}
                  onBlur={e =>
                    handleKeyChange(key, e.target.value, data[key], path)
                  }
                  className='font-bold rounded-md border-gray-300 p-2 resize-none outline outline-2 outline-orange-300 text-sm'
                />
                <ReactTextareaAutosize
                  value={data[key]}
                  onChange={e =>
                    handleFieldChange(`${path}.${key}`, e.target.value)
                  }
                  className='flex-1 rounded-md border-gray-300 p-2 resize-none hide-scrollbar outline outline-2 outline-blue-300 text-sm'
                />
                {order &&
                  order.hasOwnProperty(section) &&
                  order[section] &&
                  index > 0 && (
                    <button
                      onClick={e => onMoveUp(e, key, keyName)}
                      className='ml-2 hidden sm:block text-blue-500 hover:text-blue-700'
                    >
                      <FaArrowUp className='size-4' />
                    </button>
                  )}
                {order &&
                  order.hasOwnProperty(section) &&
                  order[section] &&
                  index < currentOrder.length - 1 && (
                    <button
                      onClick={e => onMoveDown(e, key, keyName)}
                      className='ml-2 hidden sm:block text-blue-500 hover:text-blue-700'
                    >
                      <FaArrowDown className='size-4' />
                    </button>
                  )}
                <button
                  onClick={() => deleteKeyValuePair(key, path)}
                  className='flex justify-center items-center md:block md:ml-0 lg:ml-2 px-3 py-1.5 text-white bg-red-500 hover:bg-red-700 rounded-md'
                >
                  <MdDelete className='flex-shrink-0 text-lg' />
                  <p className='block md:hidden'>Delete {cleanKeyForUI(key)}</p>
                </button>
              </div>
              {section === 'objective' && (
                <DefaultInput
                  defaults={defaults}
                  path='notes'
                  keyName={key}
                  handleFieldChange={handleFieldChange}
                />
              )}
              {lastMovedItem.key === key && (
                <div className={messageClasses}>
                  {cleanKeyForUI(key)} moved!
                </div>
              )}
            </div>
          )
        })}
        <div className='mt-4'>
          <button
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              addNewKeyValuePair(path)
            }}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700'
          >
            Add New Item
          </button>
        </div>
      </div>
    )
  } else {
    return (
      <div className='py-2 sm:gap-4'>
        {currentOrder.map((key, index) => (
          <div key={index} className='mb-3'>
            <div className='flex items-center'>
              <div className='font-bold text-sm text-gray-700'>
                {cleanKeyForUI(key)}
              </div>
              {keyName === 'notes.objective' &&
                defaults &&
                defaults?.objective?.hasOwnProperty(key) && (
                  <DisplayTooltip
                    id={`default-${nanoid()}`}
                    message={`Default: ${defaults?.objective[key]}`}
                    place='right'
                    effect='solid'
                    variant='dark'
                    className='ml-2'
                  >
                    <div className='flex items-center justify-center text-white bg-blue-500 rounded-full cursor-pointer'>
                      <FaQuestion className='text-sm p-0.5' />
                    </div>
                  </DisplayTooltip>
                )}
            </div>
            <div className='text-sm text-gray-600'>{data[key]}</div>
          </div>
        ))}
      </div>
    )
  }
}

export default KeyValueFields
