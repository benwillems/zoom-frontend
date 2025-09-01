import React from 'react'
import { BsCardChecklist } from 'react-icons/bs'
import { useConversationContext } from '../context/ConversationProvider'

const References = ({
  references,
  loading,
  isLastAnswer,
  setReferenceViewer,
}) => {
  const { setReferenceChosen } = useConversationContext()

  const storeReference = reference => {
    setReferenceChosen(reference)
    setReferenceViewer(true)
  }

  return (
    <div className='flex flex-col justify-start'>
      <div className='flex items-center text-green-500 mb-1 mt-3'>
        <BsCardChecklist className='text-xl' />
        <h1 className='text-lg ml-2 font-medium'>References</h1>
      </div>
      <div className='flex flex-wrap'>
        {references?.map((ref, index) => {
          if (loading && isLastAnswer) {
            return (
              <div
                key={index}
                className={`flex flex-col justify-between w-44 h-14 ${
                  loading
                    ? 'bg-zinc-200 dark:bg-secondary-dark'
                    : 'dark:bg-primary-dark'
                } border bg-zinc-200 border-zinc-200 dark:border-primary-dark-light rounded-md px-1 py-1 mr-2 my-1 cursor-pointer animate-pulse`}
              ></div>
            )
          }
          return (
            <div
              key={index}
              className='flex flex-col justify-between w-44 h-auto text-zinc-600 bg-lt-primary-off-white hover:bg-white border-zinc-300 hover:border-zinc-500 dark:bg-primary-dark border dark:border-primary-dark-light rounded-md px-1 py-2 mr-2 my-1 dark:hover:bg-zinc-800 duration-200 ease-in-out cursor-pointer'
              onClick={() => storeReference(ref)}
            >
              <h1 className='text-xs font-medium dark:text-primary-white'>
                {ref?.metadata?.title ? (
                  <>
                    {ref?.metadata?.title}{' '}
                    {/* <span className='text-xs text-primary-light'>
                      - {index + 1}
                    </span> */}
                  </>
                ) : (
                  'Title N/A'
                )}
              </h1>
              <p className='text-[10px] text-zinc-500 dark:text-primary-light pt-2 break-words whitespace-normal'>
                {ref?.metadata?.documentName}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default References
