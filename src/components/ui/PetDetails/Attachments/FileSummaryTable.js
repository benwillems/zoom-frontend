import React from 'react'

const FileSummaryTable = ({ tableData }) => {
  return (
    <>
      {tableData && (
        <div className='max-h-[410px] h-full overflow-x-auto overflow-y-auto'>
          {/* This div becomes scrollable if the table overflows */}
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                {tableData?.map((item, index) => (
                  <th
                    key={index}
                    className='min-w-[8rem] px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'
                  >
                    {item.column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className='bg-white'>
                {tableData?.map((item, index) => (
                  <td
                    key={index}
                    className='min-w-[8rem] px-5 py-2 border-b border-gray-200 text-sm'
                  >
                    {item.value}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {!tableData && (
        <div className='flex flex-col h-16 lg:h-full justify-center text-sm lg:text-lg font-bold uppercase items-center text-center'>
          <h1>No file summary was found</h1>
        </div>
      )}
    </>
  )
}

export default FileSummaryTable
