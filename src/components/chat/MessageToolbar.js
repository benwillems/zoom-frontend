import React from 'react'
import { BiEdit } from 'react-icons/bi'
import { BsFillClipboard2Fill, BsFlagFill } from 'react-icons/bs'
import { MdSaveAlt } from 'react-icons/md'
import { Tooltip } from 'react-tooltip'

const MessageToolbar = () => {
  let icons = [
    {
      icon: <BsFlagFill className='text-base' />,
      padding: 'p-1.5',
      hover: 'text-red-400',
      tooltipText: 'Not Accurate',
    },
    {
      icon: <MdSaveAlt className='text-xl' />,
      padding: 'px-1.5 py-1',
      hover: 'text-zinc-300',
      tooltipText: 'Save Answer',
    },
    {
      icon: <BiEdit className='text-lg' />,
      padding: 'p-1.5',
      hover: 'text-zinc-300',
      tooltipText: 'Edit Message',
    },
    {
      icon: <BsFillClipboard2Fill className='text-base' />,
      padding: 'p-2',
      hover: 'text-zinc-300',
      tooltipText: 'Copy to Clipboard',
    },
  ]

  return (
    <div className='flex items-center my-3 space-x-4'>
      {icons.map((icon, index) => {
        return (
          <div
            key={index}
            className={`text-sm text-zinc-400 ${icon.padding} hover:${icon.hover} hover:bg-zinc-700 duration-200 rounded-md shadow-md ease-in-out cursor-pointer`}
            data-tooltip-id={`id-${icon.tooltipText}`}
            data-tooltip-content={icon.tooltipText}
            data-tooltip-place='top'
          >
            {icon.icon}
            <Tooltip
              id={`id-${icon.tooltipText}`}
              style={{ padding: '3px 8px', color: '#D4D4D8' }}
            />
          </div>
        )
      })}
    </div>
  )
}

export default MessageToolbar
