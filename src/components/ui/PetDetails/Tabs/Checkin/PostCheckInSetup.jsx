import React, { useEffect, useRef, useState } from 'react'
import useClientStore from '@/store/clientStore'
import { formatDateToReadable } from '@/utils/dates'
import { FaRegCalendar } from 'react-icons/fa6'
import DailyMeals from './MealDisplay/DailyMeals'
import useAudioStore from '@/store/useAudioStore'
import CircleSpinner from '@/components/common/CircleSpinner'
import Charts from './Graphs/Charts'
import { GoGraph } from 'react-icons/go'

const PostCheckInSetup = () => {
  const { selectedCheckInDay, setSelectedCheckInDay, imageUrl, checkInGraphs } =
    useClientStore()
  const scrollContainerRef = useRef(null)

  const isOngoingAppointment = useAudioStore(
    state => state.isOngoingAppointment
  )

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [selectedCheckInDay])

  let cardHeightAdjustmentWhenRecordingBarIsInView = isOngoingAppointment()
    ? 'max-h-[520px]'
    : 'max-h-[600px]'

  return (
    <>
      {selectedCheckInDay && (
        <>
          <div className='flex mx-4'>
            <button
              className='flex items-center bg-blue-600 hover:bg-blue-700 space-x-2 text-sm text-white px-3 py-1 rounded-md'
              onClick={() => setSelectedCheckInDay(null)}
            >
              <GoGraph className='size-4' />
              <h1>View Graphs</h1>
            </button>
          </div>

          <div
            className={`flex-grow grid grid-cols-3 grid-rows-2 gap-4 p-4 ${
              isOngoingAppointment() ? 'mb-16' : ''
            }`}
          >
            <>
              <div
                className={`col-span-1 row-span-2 border border-gray-300 flex flex-col rounded-lg ${cardHeightAdjustmentWhenRecordingBarIsInView}`}
              >
                <div className='flex justify-center items-center p-4 bg-blue-100 rounded-t-lg text-center h-[6rem]'>
                  <h1 className='font-bold text-xl'>Other Check-In Goals</h1>
                </div>
                <div className='flex flex-col justify-around items-center py-20 h-full overflow-y-auto hide-scrollbar px-8'>
                  {selectedCheckInDay?.data?.checkInSummary?.answersTowardsOtherGoals?.map(
                    (goal, index) => (
                      <div className='flex flex-col items-center' key={index}>
                        <p className='font-semibold italic text-lg'>
                          {goal.goal}
                        </p>{' '}
                        <p className='pl-1 pt-4 text-base underline underline-offset-4'>
                          {goal.client_answer}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div
                className={`col-span-1 row-span-2 border border-gray-300 flex flex-col items-center justify-center rounded-lg ${cardHeightAdjustmentWhenRecordingBarIsInView}`}
              >
                <DailyMeals dayData={selectedCheckInDay} />
              </div>
              <div
                className={`col-span-1 row-span-2 border border-gray-300 flex flex-col rounded-lg ${cardHeightAdjustmentWhenRecordingBarIsInView}`}
              >
                <div className='flex flex-col gap-1 p-4 bg-blue-100 rounded-t-lg'>
                  <div className='flex items-center space-x-2'>
                    <FaRegCalendar className='size-5' />
                    <h1 className='font-bold text-lg'>
                      {formatDateToReadable(selectedCheckInDay?.data?.day)}
                    </h1>
                  </div>
                  <div className='flex gap-1.5 flex-wrap text-sm italic'>
                    <p>
                      <span className='font-medium'>Calories:</span>{' '}
                      {
                        selectedCheckInDay?.data?.checkInSummary?.totalMacros
                          ?.calories
                      }
                    </p>
                    <p>
                      <span className='font-medium'>Fats:</span>{' '}
                      {selectedCheckInDay?.data?.checkInSummary?.totalMacros
                        ?.fat + 'g'}
                    </p>
                    <p>
                      <span className='font-medium'>Proteins:</span>{' '}
                      {selectedCheckInDay?.data?.checkInSummary?.totalMacros
                        ?.protein + 'g'}
                    </p>
                    <p>
                      <span className='font-medium'>Carbs:</span>{' '}
                      {selectedCheckInDay?.data?.checkInSummary?.totalMacros
                        ?.carbohydrates + 'g'}
                    </p>
                  </div>
                </div>
                <div
                  className='flex-grow flex flex-col h-96 overflow-y-auto hide-scrollbar p-4'
                  ref={scrollContainerRef}
                >
                  {selectedCheckInDay?.data?.transcript?.map(
                    (message, index) => {
                      if (message.role === 'metadata_assistant') return null

                      let isAI = message.role === 'assistant'

                      return isAI ? (
                        <AIAssistantChatbubble
                          key={index}
                          content={message?.content?.content}
                        />
                      ) : (
                        <ClientChatBubble
                          key={index}
                          typeOfContent={message?.content?.type}
                          content={message?.content?.content}
                          userProfileImage={imageUrl}
                        />
                      )
                    }
                  )}
                </div>
              </div>
            </>
          </div>
        </>
      )}

      {!selectedCheckInDay && (
        <div className='flex text-center justify-center my-auto'>
          <Charts graphs={checkInGraphs} />
        </div>
      )}
    </>
  )
}

const AIAssistantChatbubble = ({ content }) => {
  return (
    <div className='chat chat-start'>
      <div className='chat-image avatar'>
        <div className='w-10 rounded-full'>
          <img alt='NutriAssistImg' src='/images/nutri_assist_profile.png' />
        </div>
      </div>
      <div className='chat-bubble'>{content}</div>
    </div>
  )
}

const ClientChatBubble = ({ typeOfContent, content, userProfileImage }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const modalId = `image-modal-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className='chat chat-end'>
      <div className='chat-image avatar'>
        <div className='w-10 rounded-full'>
          <img alt='UserProfileImg' src={userProfileImage} />
        </div>
      </div>
      <div className='flex flex-col chat-bubble bg-blue-100 text-black'>
        {typeOfContent !== 'image' && <p>{content}</p>}
        {typeOfContent === 'image' && (
          <>
            <div
              className={`relative w-40 ${!imageLoaded ? 'h-40' : 'h-auto'}`}
            >
              {!imageLoaded && (
                <div className='absolute inset-0 flex justify-center items-center'>
                  <CircleSpinner
                    loading={!imageLoaded}
                    height={50}
                    width={50}
                  />
                </div>
              )}
              <img
                src={content}
                alt={`image_of_food`}
                className={`h-auto rounded-lg py-2 px-1 max-w-40 cursor-pointer ${
                  imageLoaded ? 'visible' : 'invisible'
                }`}
                onLoad={() => setImageLoaded(true)}
                onClick={() => document.getElementById(modalId).showModal()}
              />
            </div>

            {/* Modal */}
            <dialog id={modalId} className='modal'>
              <div className='modal-box max-w-none w-auto relative'>
                <button
                  className='btn btn-sm btn-circle btn-neutral absolute right-2 top-2'
                  onClick={() => document.getElementById(modalId).close()}
                >
                  ✕
                </button>
                <div className='flex flex-col items-center py-6 px-2'>
                  <img
                    src={content}
                    alt={`image_of_food`}
                    className='max-w-[80vw] max-h-[80vh] object-contain rounded-md'
                  />
                </div>
              </div>
              <form method='dialog' className='modal-backdrop'>
                <button>close</button>
              </form>
            </dialog>
          </>
        )}
      </div>
    </div>
  )
}

export default PostCheckInSetup
