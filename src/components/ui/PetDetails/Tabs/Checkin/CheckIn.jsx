import React, { useEffect, useState } from 'react'
import CalendarGraph from '../../Graphs/CalendarGraph'
import useClientStore from '@/store/clientStore'
import PostCheckInSetup from './PostCheckInSetup'
import { useRouter } from 'next/router'
import SetupCheckins from './SetupCheckins'
import CircleSpinner from '@/components/common/CircleSpinner'
import { FaCalendarTimes } from 'react-icons/fa'
import { RxMixerHorizontal } from 'react-icons/rx'

const CheckIn = () => {
  const router = useRouter()
  const { clientId } = router.query
  const {
    fetchClientCheckIns,
    clientDetails,
    isLoadingCheckIns,
    clientCheckIns,
  } = useClientStore()

  const [setupCheckIns, setSetupCheckIns] = useState(false)

  useEffect(() => {
    if (clientId !== undefined && clientId != clientDetails?.id) {
      fetchClientCheckIns(clientId)
    }
  }, [clientId])

  return (
    <div className='flex flex-col flex-grow'>
      {(clientDetails?.checkInEnabled === false &&
        clientCheckIns?.length === 0) ||
      setupCheckIns === true ? (
        <div className='flex flex-col justify-center items-center px-4 pt-2 pb-6 space-x-4 relative'>
          <SetupCheckins SetSetupCheckInsFlag={setSetupCheckIns} />
        </div>
      ) : (
        <>
          <div className='flex justify-start items-center px-4 pt-2 pb-6 space-x-4'>
            <h2 className='text-xl font-bold'>Check-Ins Calendar</h2>
            <div
              className='flex justify-center items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md space-x-2 cursor-pointer'
              onClick={() => setSetupCheckIns(true)}
            >
              <RxMixerHorizontal />
              <button className=' text-sm pr-0.5'>Configure</button>
            </div>
          </div>
          {isLoadingCheckIns ? (
            <div className='flex justify-center items-center h-48'>
              <CircleSpinner
                loading={isLoadingCheckIns}
                height={48}
                width={48}
              />
            </div>
          ) : (
            <>
              {clientCheckIns?.length > 0 ? (
                <>
                  <CalendarGraph />
                  <PostCheckInSetup />
                </>
              ) : (
                <div className='flex flex-col justify-center items-center px-4 h-48 space-y-3 border mx-4 rounded-md'>
                  <FaCalendarTimes className='size-8 text-blue-600' />
                  <h1 className='text-xl font-medium uppercase'>
                    No Check-Ins have been completed
                  </h1>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default CheckIn
