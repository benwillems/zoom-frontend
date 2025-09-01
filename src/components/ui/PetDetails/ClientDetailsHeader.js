import useClientStore from '@/store/clientStore'
import React, { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import { FaEye, FaGear, FaPlus } from 'react-icons/fa6'
import { FaRegSave, FaRegTrashAlt } from 'react-icons/fa'
import useNotificationStore from '@/store/useNotificationStore'
import { GoPencil } from 'react-icons/go'
import { TiArrowSortedDown, TiArrowSortedUp } from 'react-icons/ti'
import { BsArrowLeft } from 'react-icons/bs'
import TextareaAutosize from 'react-textarea-autosize'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import CircleSpinner from '@/components/common/CircleSpinner'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import ClientDetailsModal from './Tabs/Overview/ClientDetailsModal'
import ObstaclesAndRecapOrHomeworkModal from './Tabs/Overview/ObstaclesAndRecapOrHomeworkModal'
import { convertToLocalTime, convertUTCToLocalTime } from '@/utils/dates'
import useAudioStore from '@/store/useAudioStore'

const ClientDetailsHeader = () => {
  const {
    clientDetails,
    setClientDetails,
    isClientLoading,
    imageUrl,
    setImageUrl,
  } = useClientStore()

  const isOngoingAppointment = useAudioStore(
    state => state.isOngoingAppointment
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [isFetchingImage, setIsFetchingImage] = useState(false)
  const [displayCalorieIntake, setDisplayCalorieIntake] = useState(false)
  const [isCalorieIntakeEditMode, setIsCalorieIntakeEditMode] = useState(false)
  const [editedCalorieGoalBreakdown, setEditedCalorieGoalBreakdown] = useState(
    clientDetails?.calorieGoalBreakdown || {
      calories: 0,
      fat: 0,
      carbohydrates: 0,
      protein: 0,
    }
  )
  const [checkInTime, setCheckInTime] = useState(null)

  const [checkInIsActive, setCheckInIsActive] = useState(false)
  const [displayGoals, setDisplayGoals] = useState(true)
  const [newGoal, setNewGoal] = useState('')
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [editedGoalIndex, setEditedGoalIndex] = useState(null)
  const [editedGoal, setEditedGoal] = useState('')
  const [editedGoals, setEditedGoals] = useState(clientDetails?.goals || [])
  const [
    isObstacleOrRecapHomeworkModalOpen,
    setIsObstaclesOrRecapHomeworkModalOpen,
  ] = useState(false)
  const addNotification = useNotificationStore(state => state.addNotification)
  const [editedClientDetails, setEditedClientDetails] = useState({
    email: clientDetails?.email || 'Add email',
    phone: clientDetails?.phone || 'Add phone number',
  })

  useEffect(() => {
    setEditedClientDetails({
      email: clientDetails?.email || 'Add email',
      phone: clientDetails?.phone || 'Add phone number',
    })

    setEditedCalorieGoalBreakdown(
      parseCalorieGoalBreakdown(clientDetails?.calorieGoalBreakdown)
    )

    setEditedGoals(clientDetails?.goals || [])
    setImageUrl('/images/user_profile.jpg')

    if (clientDetails?.checkInEnabled) {
      setCheckInIsActive(true)
      if (clientDetails?.checkInTime !== null) {
        setCheckInTime(convertUTCToLocalTime(clientDetails?.checkInTime))
      }
    } else {
      setCheckInIsActive(false)
      setCheckInTime(null)
    }
  }, [clientDetails])

  const fetchClientImageUrl = async () => {
    setIsFetchingImage(true)
    setImageUrl(null)
    try {
      const response = await fetch(`/api/client/image/${clientDetails?.id}`)
      if (response.ok) {
        const data = await response.json()
        setImageUrl(data?.url)
      } else {
        setImageUrl('/images/user_profile.jpg')
        console.error('Error fetching client image URL')
      }
    } catch (error) {
      setImageUrl('/images/user_profile.jpg')
      console.error('Error fetching client image URL', error)
    } finally {
      setIsFetchingImage(false)
    }
  }

  useEffect(() => {
    if (clientDetails?.id && clientDetails?.imageUrl !== null) {
      fetchClientImageUrl()
    }
  }, [clientDetails?.id])

  const uploadClientImage = async file => {
    const formData = new FormData()
    formData.append('file', file)

    if (clientDetails?.id) {
      formData.append('clientId', clientDetails?.id)
    } else {
      console.error('Client ID is not available')
      return
    }

    setIsImageUploading(true)

    try {
      const response = await fetch(`/api/upload/client/image`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        await fetchClientImageUrl()
        addNotification({
          iconColor: 'green',
          header: 'Client image was uploaded!',
          icon: FaRegSave,
          hideProgressBar: false,
        })
      } else {
        console.error('Error uploading client image')
      }
    } catch (error) {
      console.error('Error uploading client image', error)
    } finally {
      setIsImageUploading(false)
    }
  }

  const onImageDrop = async acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      await uploadClientImage(file)
    }
  }

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive,
  } = useDropzone({
    onDrop: onImageDrop,
    accept: { 'image/*': ['.jpeg', '.png'] },
    multiple: false,
  })

  const parseCalorieGoalBreakdown = calorieGoalBreakdown => {
    return {
      calories: parseFloat(calorieGoalBreakdown?.calories) || 0,
      fat: parseFloat(calorieGoalBreakdown?.fat) || 0,
      carbohydrates: parseFloat(calorieGoalBreakdown?.carbohydrates) || 0,
      protein: parseFloat(calorieGoalBreakdown?.protein) || 0,
    }
  }

  const saveCalorieIntake = async () => {
    const formData = new FormData()
    formData.append('clientId', clientDetails?.id)
    formData.append(
      'calories',
      `${editedCalorieGoalBreakdown?.calories} calories`
    )
    formData.append('fat', `${editedCalorieGoalBreakdown?.fat} grams`)
    formData.append(
      'carbohydrates',
      `${editedCalorieGoalBreakdown?.carbohydrates} grams`
    )
    formData.append('protein', `${editedCalorieGoalBreakdown?.protein} grams`)

    try {
      const response = await fetch(
        `/api/update/client/calorie-goal-breakdown`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (response.ok) {
        const updatedClient = await response.json()
        setClientDetails(updatedClient)
        setIsCalorieIntakeEditMode(false)
        addNotification({
          iconColor: 'green',
          header: 'Daily Calorie Intake was saved!',
          icon: FaRegSave,
          hideProgressBar: false,
        })
      } else {
        console.error('Error updating calorie intake')
      }
    } catch (error) {
      console.error('Error updating calorie intake', error)
    }
  }

  const saveCheckInTime = async isEnabled => {
    try {
      const response = await fetch(
        `/api/toggle/client/${clientDetails?.id}/checkin`,
        {
          method: 'POST',
          body: JSON.stringify({ isEnabled }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        setClientDetails({ ...clientDetails, checkInEnabled: isEnabled })
        setCheckInIsActive(isEnabled) // Update the local state
        addNotification({
          iconColor: 'green',
          header: `Check-In is now ${isEnabled ? 'active' : 'inactive'}!`,
          icon: FaRegSave,
          hideProgressBar: false,
        })
      } else {
        console.error('Error updating check-in time')
      }
    } catch (error) {
      console.error('Error updating check-in time', error)
    }
  }

  const saveGoals = async goals => {
    try {
      const response = await fetch(`/api/update/client/goals`, {
        method: 'POST',
        body: JSON.stringify({ goals, clientId: clientDetails?.id }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const { updatedClientGoals } = await response.json()
        setEditedGoals(updatedClientGoals?.goals)
        addNotification({
          iconColor: 'green',
          header: 'Goals were saved!',
          icon: FaRegSave,
          hideProgressBar: false,
        })
      } else {
        console.error('Error updating goals')
      }
    } catch (error) {
      console.error('Error updating goals', error)
    }
  }

  const addGoal = async () => {
    if (newGoal.trim() !== '') {
      const updatedGoals = [...editedGoals, newGoal.trim()]
      setEditedGoals(updatedGoals)
      setNewGoal('')
      setIsAddingGoal(false)
      await saveGoals(updatedGoals)
    }
  }

  const removeGoal = async index => {
    const updatedGoals = [...editedGoals]
    updatedGoals.splice(index, 1)
    setEditedGoals(updatedGoals)
    await saveGoals(updatedGoals)
  }

  const editGoal = (index, goal) => {
    setEditedGoalIndex(index)
    setEditedGoal(goal)
  }

  const saveEditedGoal = async () => {
    if (editedGoal.trim() !== '') {
      const updatedGoals = [...editedGoals]
      updatedGoals[editedGoalIndex] = editedGoal.trim()
      setEditedGoals(updatedGoals)
      setEditedGoalIndex(null)
      setEditedGoal('')
      await saveGoals(updatedGoals)
    }
  }

  // const splitObstaclesAndRecapOrHomework = str => {
  //   return str.split('-').filter(item => item.trim() !== '')
  // }

  const splitObstaclesAndRecapOrHomework = str => {
  // Split only on dashes that appear at the start of a line (after newline or at beginning)
  // This regex looks for: start of string OR newline, followed by optional whitespace, then dash
  return str.split(/(?:^|\n)\s*-\s*/).filter(item => item.trim() !== '')
}

  return (
    <div
      className={`lg:w-[280px] xl:w-[320px] 2xl:w-[400px] p-4 min-h-screen h-full overflow-y-auto hide-scrollbar ${
        isOngoingAppointment() ? 'pb-32' : ''
      }`}
    >
      <Link className='flex items-center mb-8 space-x-3' href='/directory'>
        <div className='flex items-center justify-center size-8 bg-blue-100 rounded-full '>
          <BsArrowLeft className='text-blue-600 text-lg' />
        </div>
        <h1 className='text-base font-semibold'>Directory</h1>
      </Link>

      <div
        {...getImageRootProps()}
        className='flex justify-center items-center w-44 h-48 bg-gray-100 rounded-md drop-shadow-sm shadow-md cursor-pointer relative group'
      >
        <input {...getImageInputProps()} />
        {isClientLoading || isFetchingImage ? (
          <Skeleton
            count={1}
            height='170px'
            width={160}
            borderRadius='6px'
            highlightColor='#d1d5db'
          />
        ) : isImageUploading ? (
          <div className='absolute inset-0 w-44 flex items-center justify-center bg-gray-800 bg-opacity-0 rounded-md transition-opacity duration-300 group-hover:bg-opacity-80'>
            <CircleSpinner loading={isImageUploading} height={60} width={60} />
          </div>
        ) : (
          <img
            src={imageUrl}
            alt='Client profile'
            className='w-40 h-44 object-cover rounded-md'
          />
        )}
        {!isClientLoading && (
          <div className='absolute inset-0 w-44 flex items-center justify-center bg-gray-800 bg-opacity-0 rounded-md transition-opacity duration-300 group-hover:bg-opacity-80'>
            <p className='text-white font-semibold uppercase text-center text-lg px-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
              {isDragActive ? 'Drop image here' : 'Click or drag to upload'}
            </p>
          </div>
        )}
      </div>

      <div className='flex items-center mt-5'>
        <h1 className='text-3xl font-bold mx-0.5'>
          {isClientLoading ? (
            <div className='mt-3'>
              <Skeleton
                count={1}
                height='33px'
                width={280}
                borderRadius='6px'
                highlightColor='#d1d5db'
              />
            </div>
          ) : (
            clientDetails?.name
          )}
        </h1>
        <FaGear
          className='size-6 ml-2 cursor-pointer text-gray-700 hover:text-blue-500'
          onClick={() => setIsModalOpen(true)}
        />
      </div>

      <ClientDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientDetails={clientDetails}
        setClientDetails={setClientDetails}
      />

      <div className='flex flex-col'>
        <div className='flex items-center space-x-3 mt-4 select-none'>
          {displayGoals ? (
            <TiArrowSortedDown
              className='text-gray-400 size-5 cursor-pointer'
              onClick={() => setDisplayGoals(false)}
            />
          ) : (
            <TiArrowSortedUp
              className='text-gray-400 size-5 cursor-pointer'
              onClick={() => setDisplayGoals(true)}
            />
          )}
          <h1 className='text-xl font-bold'>Goals & Motivations</h1>
          <FaPlus
            className='size-5 text-blue-500 cursor-pointer'
            onClick={() => setIsAddingGoal(true)}
          />
        </div>
        {isClientLoading ? (
          <div className='mt-3'>
            <Skeleton
              count={1}
              height='50px'
              borderRadius='6px'
              highlightColor='#d1d5db'
            />
          </div>
        ) : (
          displayGoals && (
            <div className='flex flex-col gap-3 w-full mt-3 max-h-80 overflow-y-auto hide-scrollbar'>
              {isAddingGoal && (
                <div className='flex items-center gap-2 border-l-4 border-blue-500 px-4 bg-blue-100 rounded-r-sm py-1.5 font-semibold'>
                  <TextareaAutosize
                    value={newGoal}
                    onChange={e => setNewGoal(e.target.value)}
                    className='w-full focus:outline-none bg-blue-100 focus:border-blue-500 placeholder:text-gray-600 resize-none'
                    placeholder='Set a new goal'
                    minRows={1}
                    maxRows={4}
                  />
                  <FaRegSave
                    className='size-5 text-green-500 cursor-pointer'
                    onClick={addGoal}
                  />
                  <FaRegTrashAlt
                    className='size-5 text-red-500 cursor-pointer'
                    onClick={() => {
                      setNewGoal('')
                      setIsAddingGoal(false)
                    }}
                  />
                </div>
              )}
              {editedGoals?.length === 0 && !isAddingGoal ? (
                <div className='text-left px-1 text-gray-700'>
                  There are currently no goals set for{' '}
                  {clientDetails?.name?.split(' ')[0]}. You can add a goal by
                  clicking the +
                </div>
              ) : (
                editedGoals?.map((goal, i) => (
                  <div
                    key={i}
                    className='flex items-center justify-between border-l-4 border-blue-500 px-4 bg-blue-100 rounded-r-sm py-1.5 font-semibold group'
                  >
                    {editedGoalIndex === i ? (
                      <div className='flex items-center gap-2 w-full'>
                        <TextareaAutosize
                          value={editedGoal}
                          onChange={e => setEditedGoal(e.target.value)}
                          className='w-full focus:outline-none bg-blue-100 focus:border-blue-500 placeholder:text-gray-600 resize-none'
                          placeholder='Edit the goal'
                          minRows={1}
                          maxRows={4}
                        />
                        <FaRegSave
                          className='size-5 text-green-500 cursor-pointer'
                          onClick={saveEditedGoal}
                        />
                        <FaRegTrashAlt
                          className='size-5 text-red-500 cursor-pointer'
                          onClick={() => {
                            setEditedGoalIndex(null)
                            setEditedGoal('')
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <span>{goal}</span>
                        <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2'>
                          <GoPencil
                            className='size-5 text-blue-500 cursor-pointer'
                            onClick={() => editGoal(i, goal)}
                          />
                          <FaRegTrashAlt
                            className='size-5 text-red-500 cursor-pointer'
                            onClick={() => removeGoal(i)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          )
        )}
      </div>

      <div className='flex flex-col mt-3'>
        <div className='flex flex-col'>
          <div className='flex items-center space-x-3 select-none'>
            <h1 className='text-xl font-bold'>Obstacles</h1>
            {clientDetails?.latestObstacles && (
              <FaEye
                className='size-5 text-blue-500 cursor-pointer'
                onClick={() => setIsObstaclesOrRecapHomeworkModalOpen(true)}
              />
            )}
          </div>
          <p className='text-gray-700 text-sm italic'>
            {clientDetails?.latestObstaclesDate &&
              convertToLocalTime(clientDetails?.latestObstaclesDate)}
          </p>
        </div>

        {isClientLoading ? (
          <div className='mt-3'>
            <Skeleton
              count={2}
              height='40px'
              borderRadius='6px'
              highlightColor='#d1d5db'
            />
          </div>
        ) : (
          <div className='flex gap-3 w-full mt-3 max-h-80 overflow-y-auto hide-scrollbar flex-wrap'>
            {clientDetails?.latestObstacles ? (
              clientDetails?.latestObstacles &&
              splitObstaclesAndRecapOrHomework(
                clientDetails?.latestObstacles
              ).map((obs, i) => {
                return (
                  <div
                    key={i}
                    className='flex items-center justify-between border-l-4 border-red-500 px-4 bg-red-100 rounded-r-sm py-1.5 font-semibold group w-fit'
                  >
                    {obs}
                  </div>
                )
              })
            ) : (
              <div className='text-left px-1 text-gray-700'>
                There are currently no obstacles for{' '}
                {clientDetails?.name?.split(' ')[0]}.
              </div>
            )}
          </div>
        )}
      </div>

      <div className='flex flex-col mt-3'>
        <div className='flex flex-col'>
          <div className='flex items-center space-x-3 select-none'>
            <h1 className='text-xl font-bold'>Recap or Homework</h1>
            {clientDetails?.latestRecapOrHomework && (
              <FaEye
                className='size-5 text-blue-500 cursor-pointer'
                onClick={() => setIsObstaclesOrRecapHomeworkModalOpen(true)}
              />
            )}
          </div>
          <p className='text-gray-700 text-sm italic'>
            {clientDetails?.latestRecapOrHomeworkDate &&
              convertToLocalTime(clientDetails?.latestRecapOrHomeworkDate)}
          </p>
        </div>

        {isClientLoading ? (
          <div className='mt-3'>
            <Skeleton
              count={2}
              height='40px'
              borderRadius='6px'
              highlightColor='#d1d5db'
            />
          </div>
        ) : (
          <div className='flex gap-3 w-full mt-3 max-h-80 overflow-y-auto hide-scrollbar flex-wrap'>
            {clientDetails?.latestRecapOrHomework ? (
              clientDetails?.latestRecapOrHomework &&
              splitObstaclesAndRecapOrHomework(
                clientDetails?.latestRecapOrHomework
              ).map((obs, i) => {
                return (
                  <div
                    key={i}
                    className='flex items-center justify-between border-l-4 border-purple-500 px-4 bg-purple-100 rounded-r-sm py-1.5 font-semibold group w-fit'
                  >
                    {obs}
                  </div>
                )
              })
            ) : (
              <div className='text-left px-1 text-gray-700'>
                There is currently no recap or homework for{' '}
                {clientDetails?.name?.split(' ')[0]}.
              </div>
            )}
          </div>
        )}
      </div>

      <ObstaclesAndRecapOrHomeworkModal
        isOpen={isObstacleOrRecapHomeworkModalOpen}
        onClose={() => setIsObstaclesOrRecapHomeworkModalOpen(false)}
      />

      {clientDetails?.checkInTime != null &&
        clientDetails?.checkInGoal != null && (
          <div className='flex flex-col'>
            <div className='flex justify-between items-center space-x-3 mt-4 select-none'>
              <h1 className='text-xl font-bold'>
                Check-In Status {checkInIsActive ? '(Active)' : '(Inactive)'}
              </h1>
              {!isClientLoading && (
                <input
                  type='checkbox'
                  className='toggle toggle-success ml-8'
                  checked={checkInIsActive}
                  onChange={e => saveCheckInTime(e.target.checked)}
                  disabled={
                    clientDetails?.checkInTime == null ||
                    clientDetails?.checkInGoal == null
                  }
                />
              )}
            </div>
            {isClientLoading ? (
              <div className='mt-1'>
                <Skeleton
                  count={1}
                  height='30px'
                  borderRadius='6px'
                  highlightColor='#d1d5db'
                />
              </div>
            ) : (
              checkInIsActive && (
                <p className='mt-2 text-gray-700 text-sm italic'>
                  Daily Check-In Time: {checkInTime}
                </p>
              )
            )}
          </div>
        )}

      <div className='flex flex-col mt-2'>
        <div className='flex items-center space-x-3 select-none'>
          {displayCalorieIntake ? (
            <TiArrowSortedDown
              className='text-gray-400 size-5 cursor-pointer'
              onClick={() => setDisplayCalorieIntake(false)}
            />
          ) : (
            <TiArrowSortedUp
              className='text-gray-400 size-5 cursor-pointer'
              onClick={() => setDisplayCalorieIntake(true)}
            />
          )}
          <h1 className='text-xl font-bold'>Daily Calorie Intake</h1>
          {isCalorieIntakeEditMode ? (
            <FaRegSave
              className='size-5 text-green-500 cursor-pointer mt-0.5'
              onClick={saveCalorieIntake}
            />
          ) : (
            <GoPencil
              className='size-5 text-blue-500 cursor-pointer'
              onClick={() => setIsCalorieIntakeEditMode(true)}
            />
          )}
        </div>
        {displayCalorieIntake && (
          <div className='flex flex-col px-1 w-full mt-3'>
            {isCalorieIntakeEditMode ? (
              <>
                <div className='flex flex-col'>
                  <label className='font-semibold '>Calories:</label>
                  <div className='flex items-center gap-2'>
                    <Slider
                      min={0}
                      max={5000}
                      value={editedCalorieGoalBreakdown?.calories}
                      onChange={value =>
                        setEditedCalorieGoalBreakdown(prev => ({
                          ...prev,
                          calories: value,
                        }))
                      }
                    />
                    <input
                      type='number'
                      value={editedCalorieGoalBreakdown?.calories}
                      onChange={e =>
                        setEditedCalorieGoalBreakdown(prev => ({
                          ...prev,
                          calories: parseFloat(e.target.value),
                        }))
                      }
                      className='w-20 px-2 py-0.5 bg-gray-200 focus:outline-none focus:border-blue-500'
                    />
                  </div>
                </div>

                <div className='flex flex-col'>
                  <label className='font-semibold '>Fat:</label>
                  <div className='flex items-center gap-2'>
                    <Slider
                      min={0}
                      max={500}
                      value={editedCalorieGoalBreakdown?.fat}
                      onChange={value =>
                        setEditedCalorieGoalBreakdown(prev => ({
                          ...prev,
                          fat: value,
                        }))
                      }
                    />
                    <input
                      type='number'
                      value={editedCalorieGoalBreakdown?.fat}
                      onChange={e =>
                        setEditedCalorieGoalBreakdown(prev => ({
                          ...prev,
                          fat: parseFloat(e.target.value),
                        }))
                      }
                      className='w-20 px-2 py-0.5 bg-gray-200 focus:outline-none focus:border-blue-500'
                    />
                  </div>
                </div>

                <div className='flex flex-col'>
                  <label className='font-semibold '>Carbohydrates:</label>
                  <div className='flex items-center gap-2'>
                    <Slider
                      min={0}
                      max={1000}
                      value={editedCalorieGoalBreakdown?.carbohydrates}
                      onChange={value =>
                        setEditedCalorieGoalBreakdown(prev => ({
                          ...prev,
                          carbohydrates: value,
                        }))
                      }
                    />
                    <input
                      type='number'
                      value={editedCalorieGoalBreakdown?.carbohydrates}
                      onChange={e =>
                        setEditedCalorieGoalBreakdown(prev => ({
                          ...prev,
                          carbohydrates: parseFloat(e.target.value),
                        }))
                      }
                      className='w-20 px-2 py-0.5 bg-gray-200 focus:outline-none focus:border-blue-500'
                    />
                  </div>
                </div>

                <div className='flex flex-col'>
                  <label className='font-semibold '>Protein:</label>
                  <div className='flex items-center gap-2'>
                    <Slider
                      min={0}
                      max={500}
                      value={editedCalorieGoalBreakdown?.protein}
                      onChange={value =>
                        setEditedCalorieGoalBreakdown(prev => ({
                          ...prev,
                          protein: value,
                        }))
                      }
                    />
                    <input
                      type='number'
                      value={editedCalorieGoalBreakdown?.protein}
                      onChange={e =>
                        setEditedCalorieGoalBreakdown(prev => ({
                          ...prev,
                          protein: parseFloat(e.target.value),
                        }))
                      }
                      className='w-20 px-2 py-0.5 bg-gray-200 focus:outline-none focus:border-blue-500'
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className='flex justify-between'>
                  <span className='font-semibold'>Calories:</span>
                  <span>
                    {clientDetails?.calorieGoalBreakdown?.calories ||
                      '0 calories'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold'>Fat:</span>
                  <span>
                    {clientDetails?.calorieGoalBreakdown?.fat || '0 grams'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold'>Carbohydrates:</span>
                  <span>
                    {clientDetails?.calorieGoalBreakdown?.carbohydrates ||
                      '0 grams'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold'>Protein:</span>
                  <span>
                    {clientDetails?.calorieGoalBreakdown?.protein || '0 grams'}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientDetailsHeader
